#!/usr/bin/env node
/**
 * CashPredix - Payment Anomalies & Statistical Distributions Simulation Script (Node.js)
 * Week 3: Task #43 - Generate synthetic customer payment history timelines for accounts receivable (AR)
 * with Pareto amount distributions, Gaussian payment timing, and realistic anomalies (delays, defaults).
 *
 * Schema Compatibility:
 *   payment_history (id, customer_id, vendor_id, amount, due_date, payment_date, status)
 *
 * Usage:
 *   node scripts/simulate_payment_history.js --customers-file data/synthetic/customers.json --output-dir data/synthetic --format both
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TERMS_MAP = {
  'Due on Receipt': 0,
  'Net 15': 15,
  'Net 30': 30,
  'Net 45': 45,
  'Net 60': 60,
  'Net 90': 90,
  '2/10 Net 30': 30,
};

// Customer / Payer behavioral risk profiles (Predicting Cash Inflows)
const CUSTOMER_PROFILES = {
  PRIME: {
    weight: 0.60,
    meanDelay: -2.0, // Settles 2 days early on average (e.g. captures 2% prompt discount)
    stdDelay: 2.5,
    missedProb: 0.01,
    partialProb: 0.02,
  },
  STANDARD: {
    weight: 0.25,
    meanDelay: 3.0, // Settles 3 days past due date within standard grace period
    stdDelay: 5.0,
    missedProb: 0.04,
    partialProb: 0.08,
  },
  VOLATILE: {
    weight: 0.15,
    meanDelay: 18.0, // Chronic delinquent payer, ~18 days late
    stdDelay: 12.0,
    missedProb: 0.12,
    partialProb: 0.22,
  },
};

// Box-Muller transform for Gaussian / Normal distribution sampling
function sampleGaussian(mean, stdDev) {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + z0 * stdDev;
}

// Pareto distribution (Inverse transform sampling) for B2B invoice amounts
function samplePareto(baseAmount = 350.0, alpha = 1.55, maxAmount = 250000.0) {
  const u = Math.max(1e-9, 1.0 - Math.random());
  const val = baseAmount / Math.pow(u, 1.0 / alpha);
  return Math.round(Math.min(val, maxAmount) * 100) / 100;
}

function assignProfile() {
  const r = Math.random();
  let cumulative = 0;
  for (const conf of Object.values(CUSTOMER_PROFILES)) {
    cumulative += conf.weight;
    if (r <= cumulative) return conf;
  }
  return CUSTOMER_PROFILES.STANDARD;
}

function formatDate(dt) {
  return dt.toISOString().split('T')[0];
}

function samplePaymentMethod() {
  const r = Math.random();
  if (r < 0.45) return 'wire_transfer';
  if (r < 0.75) return 'ach';
  if (r < 0.90) return 'check';
  if (r < 0.95) return 'credit_card';
  return 'cash';
}

function resolvePaymentInstrument(method, amountPaid, invoiceDt, dueDt, payDt, now) {
  if (method === 'check') {
    const chkNo = `CHK-${Math.floor(100000 + Math.random() * 900000)}`;
    const issueDt = new Date(invoiceDt.getTime() + (Math.floor(Math.random() * 8) + 2) * 86400000);
    const maturityDt = new Date(dueDt.getTime() + (Math.floor(Math.random() * 25) - 3) * 86400000);

    // Check factoring / discounting (~20% of checks factored early for liquidity)
    if (Math.random() < 0.20 && maturityDt > new Date(invoiceDt.getTime() + 15 * 86400000)) {
      const factoringDt = new Date(Math.min(now.getTime(), issueDt.getTime() + (Math.floor(Math.random() * 5) + 2) * 86400000));
      const feeRate = Math.round((0.025 + Math.random() * 0.02) * 10000) / 10000;
      const fee = Math.round(amountPaid * feeRate * 100) / 100;
      const netCash = Math.round((amountPaid - fee) * 100) / 100;
      return {
        check_number: chkNo,
        check_issue_date: formatDate(issueDt),
        check_maturity_date: formatDate(maturityDt),
        check_clearing_date: formatDate(factoringDt),
        check_status: 'discounted_factored',
        is_factored: true,
        factoring_date: formatDate(factoringDt),
        factoring_fee: fee,
        net_cash_received: netCash,
        effective_pay_dt: factoringDt,
      };
    }

    return {
      check_number: chkNo,
      check_issue_date: formatDate(issueDt),
      check_maturity_date: formatDate(maturityDt),
      check_clearing_date: formatDate(maturityDt),
      check_status: 'cleared',
      is_factored: false,
      factoring_date: null,
      factoring_fee: 0.0,
      net_cash_received: amountPaid,
      effective_pay_dt: maturityDt,
    };
  }

  return {
    check_number: null,
    check_issue_date: null,
    check_maturity_date: null,
    check_clearing_date: null,
    check_status: null,
    is_factored: false,
    factoring_date: null,
    factoring_fee: 0.0,
    net_cash_received: amountPaid,
    effective_pay_dt: payDt,
  };
}

export function simulatePaymentHistories(customers, { now = new Date() } = {}) {
  const payments = [];
  const statusCounts = { PAID: 0, LATE: 0, PARTIAL: 0, MISSED: 0, PENDING: 0 };
  const amounts = [];

  for (const customer of customers) {
    const custId = customer.id;
    const termDays = TERMS_MAP[customer.payment_terms] ?? 30;
    const paymentTermsStr = customer.payment_terms || 'Net 30';
    const profile = assignProfile();
    const createdDt = customer.created_at ? new Date(customer.created_at) : new Date(now.getTime() - 365 * 86400000);

    let currentInvoiceDt = new Date(createdDt.getTime() + (Math.random() * 20 + 5) * 86400000);
    const intervalDays = 30;

    while (currentInvoiceDt < now) {
      const invSeq = Math.floor(10000 + Math.random() * 90000);
      const invoiceNumber = `INV-${currentInvoiceDt.getFullYear()}-${invSeq}`;
      const invoiceDateStr = formatDate(currentInvoiceDt);

      const baseScale = [350, 750, 1500, 3200, 8500, 24000][Math.floor(Math.random() * 6)];
      const invoiceAmount = samplePareto(baseScale, 1.55);

      const dueDt = new Date(currentInvoiceDt.getTime() + termDays * 86400000);
      const dueDateStr = formatDate(dueDt);

      if (dueDt > now) {
        payments.push({
          id: crypto.randomUUID(),
          customer_id: custId,
          vendor_id: custId,
          invoice_number: invoiceNumber,
          invoice_date: invoiceDateStr,
          due_date: dueDateStr,
          invoice_amount: invoiceAmount,
          amount: invoiceAmount,
          amount_paid: 0.0,
          remaining_balance: invoiceAmount,
          payment_date: null,
          payment_method: null,
          installment_number: 1,
          total_installments: 1,
          is_split_payment: false,
          check_number: null,
          check_issue_date: null,
          check_maturity_date: null,
          check_clearing_date: null,
          check_status: null,
          is_factored: false,
          factoring_date: null,
          factoring_fee: 0.0,
          net_cash_received: 0.0,
          early_discount_applied: false,
          discount_amount: 0.0,
          days_past_due: 0,
          status: 'PENDING',
        });
        statusCounts.PENDING++;
        amounts.push(invoiceAmount);
      } else {
        const r = Math.random();

        // Defaulted / Missed
        if (r < profile.missedProb && (now - dueDt) > 45 * 86400000) {
          const dpd = Math.round((now.getTime() - dueDt.getTime()) / 86400000);
          payments.push({
            id: crypto.randomUUID(),
            customer_id: custId,
            vendor_id: custId,
            invoice_number: invoiceNumber,
            invoice_date: invoiceDateStr,
            due_date: dueDateStr,
            invoice_amount: invoiceAmount,
            amount: invoiceAmount,
            amount_paid: 0.0,
            remaining_balance: invoiceAmount,
            payment_date: null,
            payment_method: null,
            installment_number: 1,
            total_installments: 1,
            is_split_payment: false,
            check_number: null,
            check_issue_date: null,
            check_maturity_date: null,
            check_clearing_date: null,
            check_status: null,
            is_factored: false,
            factoring_date: null,
            factoring_fee: 0.0,
            net_cash_received: 0.0,
            early_discount_applied: false,
            discount_amount: 0.0,
            days_past_due: dpd,
            status: 'MISSED',
          });
          statusCounts.MISSED++;
          amounts.push(invoiceAmount);
        } else if (r < profile.missedProb + profile.partialProb || Math.random() < 0.18) {
          // Split Payment (2-part installment)
          const splitRatio = [0.4, 0.5, 0.6][Math.floor(Math.random() * 3)];
          const amountPart1 = Math.round(invoiceAmount * splitRatio * 100) / 100;
          const amountPart2 = Math.round((invoiceAmount - amountPart1) * 100) / 100;

          const delay1 = Math.round(sampleGaussian(profile.meanDelay, profile.stdDelay));
          let payDt1 = new Date(dueDt.getTime() + delay1 * 86400000);
          if (payDt1 <= currentInvoiceDt) payDt1 = new Date(currentInvoiceDt.getTime() + 86400000 * 2);
          if (payDt1 > now) payDt1 = now;

          const payDt2 = new Date(payDt1.getTime() + (Math.floor(Math.random() * 20) + 14) * 86400000);

          const method1 = samplePaymentMethod();
          const method2 = samplePaymentMethod();

          const inst1 = resolvePaymentInstrument(method1, amountPart1, currentInvoiceDt, dueDt, payDt1, now);

          // Part 1
          payments.push({
            id: crypto.randomUUID(),
            customer_id: custId,
            vendor_id: custId,
            invoice_number: invoiceNumber,
            invoice_date: invoiceDateStr,
            due_date: dueDateStr,
            invoice_amount: invoiceAmount,
            amount: amountPart1,
            amount_paid: amountPart1,
            remaining_balance: amountPart2,
            payment_date: formatDate(inst1.effective_pay_dt || payDt1),
            payment_method: method1,
            installment_number: 1,
            total_installments: 2,
            is_split_payment: true,
            check_number: inst1.check_number,
            check_issue_date: inst1.check_issue_date,
            check_maturity_date: inst1.check_maturity_date,
            check_clearing_date: inst1.check_clearing_date,
            check_status: inst1.check_status,
            is_factored: inst1.is_factored,
            factoring_date: inst1.factoring_date,
            factoring_fee: inst1.factoring_fee,
            net_cash_received: inst1.net_cash_received,
            early_discount_applied: false,
            discount_amount: 0.0,
            days_past_due: Math.round(((inst1.effective_pay_dt || payDt1).getTime() - dueDt.getTime()) / 86400000),
            status: 'PARTIAL',
          });
          statusCounts.PARTIAL++;
          amounts.push(amountPart1);

          // Part 2
          if (payDt2 <= now) {
            const inst2 = resolvePaymentInstrument(method2, amountPart2, currentInvoiceDt, dueDt, payDt2, now);
            const dpd2 = Math.round(((inst2.effective_pay_dt || payDt2).getTime() - dueDt.getTime()) / 86400000);
            const status2 = dpd2 <= 3 ? 'PAID' : 'LATE';

            payments.push({
              id: crypto.randomUUID(),
              customer_id: custId,
              vendor_id: custId,
              invoice_number: invoiceNumber,
              invoice_date: invoiceDateStr,
              due_date: dueDateStr,
              invoice_amount: invoiceAmount,
              amount: amountPart2,
              amount_paid: amountPart2,
              remaining_balance: 0.0,
              payment_date: formatDate(inst2.effective_pay_dt || payDt2),
              payment_method: method2,
              installment_number: 2,
              total_installments: 2,
              is_split_payment: true,
              check_number: inst2.check_number,
              check_issue_date: inst2.check_issue_date,
              check_maturity_date: inst2.check_maturity_date,
              check_clearing_date: inst2.check_clearing_date,
              check_status: inst2.check_status,
              is_factored: inst2.is_factored,
              factoring_date: inst2.factoring_date,
              factoring_fee: inst2.factoring_fee,
              net_cash_received: inst2.net_cash_received,
              early_discount_applied: false,
              discount_amount: 0.0,
              days_past_due: dpd2,
              status: status2,
            });
            statusCounts[status2]++;
            amounts.push(amountPart2);
          } else {
            payments.push({
              id: crypto.randomUUID(),
              customer_id: custId,
              vendor_id: custId,
              invoice_number: invoiceNumber,
              invoice_date: invoiceDateStr,
              due_date: dueDateStr,
              invoice_amount: invoiceAmount,
              amount: amountPart2,
              amount_paid: 0.0,
              remaining_balance: amountPart2,
              payment_date: null,
              payment_method: method2,
              installment_number: 2,
              total_installments: 2,
              is_split_payment: true,
              check_number: null,
              check_issue_date: null,
              check_maturity_date: null,
              check_clearing_date: null,
              check_status: null,
              is_factored: false,
              factoring_date: null,
              factoring_fee: 0.0,
              net_cash_received: 0.0,
              early_discount_applied: false,
              discount_amount: 0.0,
              days_past_due: 0,
              status: 'PENDING',
            });
            statusCounts.PENDING++;
            amounts.push(amountPart2);
          }
        } else {
          // Full settlement
          const delayDays = Math.round(sampleGaussian(profile.meanDelay, profile.stdDelay));
          let payDt = new Date(dueDt.getTime() + delayDays * 86400000);
          if (payDt <= currentInvoiceDt) payDt = new Date(currentInvoiceDt.getTime() + 86400000);
          if (payDt > now) payDt = now;

          const method = samplePaymentMethod();
          const inst = resolvePaymentInstrument(method, invoiceAmount, currentInvoiceDt, dueDt, payDt, now);

          let earlyDiscountApplied = false;
          let discountAmount = 0.0;
          let amountPaid = invoiceAmount;
          let netCash = inst.net_cash_received;

          if (paymentTermsStr === '2/10 Net 30' && (payDt.getTime() - currentInvoiceDt.getTime()) <= 10 * 86400000) {
            earlyDiscountApplied = true;
            discountAmount = Math.round(invoiceAmount * 0.02 * 100) / 100;
            amountPaid = Math.round((invoiceAmount - discountAmount) * 100) / 100;
            netCash = amountPaid;
          }

          const actualPayDt = inst.effective_pay_dt || payDt;
          const dpd = Math.round((actualPayDt.getTime() - dueDt.getTime()) / 86400000);
          const status = dpd <= 3 ? 'PAID' : 'LATE';

          payments.push({
            id: crypto.randomUUID(),
            customer_id: custId,
            vendor_id: custId,
            invoice_number: invoiceNumber,
            invoice_date: invoiceDateStr,
            due_date: dueDateStr,
            invoice_amount: invoiceAmount,
            amount: amountPaid,
            amount_paid: amountPaid,
            remaining_balance: 0.0,
            payment_date: formatDate(actualPayDt),
            payment_method: method,
            installment_number: 1,
            total_installments: 1,
            is_split_payment: false,
            check_number: inst.check_number,
            check_issue_date: inst.check_issue_date,
            check_maturity_date: inst.check_maturity_date,
            check_clearing_date: inst.check_clearing_date,
            check_status: inst.check_status,
            is_factored: inst.is_factored,
            factoring_date: inst.factoring_date,
            factoring_fee: inst.factoring_fee,
            net_cash_received: netCash,
            early_discount_applied: earlyDiscountApplied,
            discount_amount: discountAmount,
            days_past_due: dpd,
            status,
          });
          statusCounts[status]++;
          amounts.push(amountPaid);
        }
      }

      const jitter = Math.floor(Math.random() * 10) - 4;
      currentInvoiceDt = new Date(currentInvoiceDt.getTime() + (intervalDays + jitter) * 86400000);
    }
  }

  const total = payments.length;
  const totalVolume = amounts.reduce((acc, v) => acc + v, 0);
  const avgAmount = total > 0 ? Math.round((totalVolume / total) * 100) / 100 : 0;
  const maxAmount = amounts.length > 0 ? Math.max(...amounts) : 0;
  const minAmount = amounts.length > 0 ? Math.min(...amounts) : 0;

  return {
    payments,
    metrics: {
      total_payments: total,
      status_breakdown: statusCounts,
      anomaly_rate_percent: Math.round(((statusCounts.LATE + statusCounts.PARTIAL + statusCounts.MISSED) / Math.max(1, total)) * 10000) / 100,
      amount_stats: {
        min: minAmount,
        average: avgAmount,
        max: maxAmount,
        total_volume: Math.round(totalVolume * 100) / 100,
      },
      generated_at: now.toISOString(),
    },
  };
}

function toCSV(records) {
  if (!records || records.length === 0) return '';
  const headers = [
    'id',
    'customer_id',
    'vendor_id',
    'invoice_number',
    'invoice_date',
    'due_date',
    'invoice_amount',
    'amount',
    'amount_paid',
    'remaining_balance',
    'payment_date',
    'payment_method',
    'installment_number',
    'total_installments',
    'is_split_payment',
    'check_number',
    'check_issue_date',
    'check_maturity_date',
    'check_clearing_date',
    'check_status',
    'is_factored',
    'factoring_date',
    'factoring_fee',
    'net_cash_received',
    'early_discount_applied',
    'discount_amount',
    'days_past_due',
    'status',
  ];
  const rows = records.map((row) =>
    headers
      .map((header) => {
        const val = row[header] ?? '';
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

// CLI Execution
if (process.argv[1] && process.argv[1].endsWith('simulate_payment_history.js')) {
  const args = process.argv.slice(2);
  let customersFile = null;
  let outputDir = 'data/synthetic';
  let format = 'both';

  for (let i = 0; i < args.length; i++) {
    if ((args[i] === '--customers-file' || args[i] === '--vendors-file') && args[i + 1]) {
      customersFile = args[++i];
    } else if (args[i] === '--output-dir' && args[i + 1]) outputDir = args[++i];
    else if (args[i] === '--format' && args[i + 1]) format = args[++i];
  }

  if (!customersFile) {
    const custCandidate = path.resolve(process.cwd(), outputDir, 'customers.json');
    const vendCandidate = path.resolve(process.cwd(), outputDir, 'vendors.json');
    customersFile = fs.existsSync(custCandidate) ? custCandidate : vendCandidate;
  }

  const resolvedCustomersFile = path.resolve(process.cwd(), customersFile);
  if (!fs.existsSync(resolvedCustomersFile)) {
    console.error(`[ERROR] Customers input file not found at: ${resolvedCustomersFile}`);
    process.exit(1);
  }

  const customers = JSON.parse(fs.readFileSync(resolvedCustomersFile, 'utf8'));
  const resolvedOutputDir = path.resolve(process.cwd(), outputDir);
  fs.mkdirSync(resolvedOutputDir, { recursive: true });

  console.log('='.repeat(65));
  console.log(' CashPredix - Accounts Receivable Payment Timeline Simulator (#43)');
  console.log('='.repeat(65));
  console.log(` Loaded Customers / Payers: ${customers.length}`);
  console.log(` Input File:                ${resolvedCustomersFile}`);
  console.log(` Output Directory:          ${resolvedOutputDir}`);
  console.log('='.repeat(65));

  const result = simulatePaymentHistories(customers);

  if (format === 'json' || format === 'both') {
    fs.writeFileSync(path.join(resolvedOutputDir, 'payment_history.json'), JSON.stringify(result.payments, null, 2));
    fs.writeFileSync(path.join(resolvedOutputDir, 'payment_simulation_metrics.json'), JSON.stringify(result.metrics, null, 2));
    console.log('[✓] Successfully written JSON payment history & metrics.');
  }

  if (format === 'csv' || format === 'both') {
    fs.writeFileSync(path.join(resolvedOutputDir, 'payment_history.csv'), toCSV(result.payments));
    console.log('[✓] Successfully written CSV payment history.');
  }

  console.log('='.repeat(65));
  console.log(`[SUCCESS] Simulated ${result.metrics.total_payments} invoices! Anomaly rate: ${result.metrics.anomaly_rate_percent}%`);
  console.log('='.repeat(65));
}
