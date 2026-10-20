#!/usr/bin/env node
/**
 * CashPredix - Payment Anomalies & Statistical Distributions Simulation Script (Node.js)
 * Week 3: Task #43 - Generate synthetic payment history timelines for vendors with
 * Pareto amount distributions, Gaussian payment timing, and realistic anomalies.
 *
 * Schema Compatibility:
 *   payment_history (id, vendor_id, amount, due_date, payment_date, status)
 *
 * Usage:
 *   node scripts/simulate_payment_history.js --vendors-file data/synthetic/vendors.json --output-dir data/synthetic --format both
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

const VENDOR_PROFILES = {
  PRIME: {
    weight: 0.60,
    meanDelay: -2.0,
    stdDelay: 2.5,
    missedProb: 0.01,
    partialProb: 0.02,
  },
  STANDARD: {
    weight: 0.25,
    meanDelay: 3.0,
    stdDelay: 5.0,
    missedProb: 0.04,
    partialProb: 0.08,
  },
  VOLATILE: {
    weight: 0.15,
    meanDelay: 18.0,
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

// Pareto distribution (Inverse transform sampling)
function samplePareto(baseAmount = 350.0, alpha = 1.55, maxAmount = 250000.0) {
  const u = Math.max(1e-9, 1.0 - Math.random());
  const val = baseAmount / Math.pow(u, 1.0 / alpha);
  return Math.round(Math.min(val, maxAmount) * 100) / 100;
}

function assignProfile() {
  const r = Math.random();
  let cumulative = 0;
  for (const conf of Object.values(VENDOR_PROFILES)) {
    cumulative += conf.weight;
    if (r <= cumulative) return conf;
  }
  return VENDOR_PROFILES.STANDARD;
}

function formatDate(dt) {
  return dt.toISOString().split('T')[0];
}

export function simulatePaymentHistories(vendors, { now = new Date() } = {}) {
  const payments = [];
  const statusCounts = { PAID: 0, LATE: 0, PARTIAL: 0, MISSED: 0, PENDING: 0 };
  const amounts = [];

  for (const vendor of vendors) {
    const termDays = TERMS_MAP[vendor.payment_terms] ?? 30;
    const profile = assignProfile();
    const createdDt = vendor.created_at ? new Date(vendor.created_at) : new Date(now.getTime() - 365 * 86400000);

    let currentInvoiceDt = new Date(createdDt.getTime() + (Math.random() * 20 + 5) * 86400000);
    const intervalDays = 30;

    while (currentInvoiceDt < now) {
      const invoiceId = crypto.randomUUID();
      const baseScale = [250, 500, 850, 1200, 2500][Math.floor(Math.random() * 5)];
      const amount = samplePareto(baseScale, 1.55);

      const dueDt = new Date(currentInvoiceDt.getTime() + termDays * 86400000);
      const dueDateStr = formatDate(dueDt);

      if (dueDt > now) {
        payments.push({
          id: invoiceId,
          vendor_id: vendor.id,
          amount,
          due_date: dueDateStr,
          payment_date: null,
          status: 'PENDING',
        });
        statusCounts.PENDING++;
      } else {
        const r = Math.random();
        if (r < profile.missedProb && (now - dueDt) > 45 * 86400000) {
          payments.push({
            id: invoiceId,
            vendor_id: vendor.id,
            amount,
            due_date: dueDateStr,
            payment_date: null,
            status: 'MISSED',
          });
          statusCounts.MISSED++;
        } else if (r < profile.missedProb + profile.partialProb) {
          const delayDays = Math.round(sampleGaussian(profile.meanDelay + 5, profile.stdDelay));
          let payDt = new Date(dueDt.getTime() + delayDays * 86400000);
          if (payDt <= currentInvoiceDt) payDt = new Date(currentInvoiceDt.getTime() + 86400000);
          if (payDt > now) payDt = now;

          payments.push({
            id: invoiceId,
            vendor_id: vendor.id,
            amount,
            due_date: dueDateStr,
            payment_date: formatDate(payDt),
            status: 'PARTIAL',
          });
          statusCounts.PARTIAL++;
        } else {
          const delayDays = Math.round(sampleGaussian(profile.meanDelay, profile.stdDelay));
          let payDt = new Date(dueDt.getTime() + delayDays * 86400000);
          if (payDt <= currentInvoiceDt) payDt = new Date(currentInvoiceDt.getTime() + 86400000);
          if (payDt > now) payDt = now;

          const isLate = payDt.getTime() > dueDt.getTime() + 3 * 86400000;
          const status = isLate ? 'LATE' : 'PAID';

          payments.push({
            id: invoiceId,
            vendor_id: vendor.id,
            amount,
            due_date: dueDateStr,
            payment_date: formatDate(payDt),
            status,
          });
          statusCounts[status]++;
        }
      }

      amounts.push(amount);
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
  const headers = ['id', 'vendor_id', 'amount', 'due_date', 'payment_date', 'status'];
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
  let vendorsFile = 'data/synthetic/vendors.json';
  let outputDir = 'data/synthetic';
  let format = 'both';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--vendors-file' && args[i + 1]) vendorsFile = args[++i];
    else if (args[i] === '--output-dir' && args[i + 1]) outputDir = args[++i];
    else if (args[i] === '--format' && args[i + 1]) format = args[++i];
  }

  const resolvedVendorsFile = path.resolve(process.cwd(), vendorsFile);
  if (!fs.existsSync(resolvedVendorsFile)) {
    console.error(`[ERROR] Vendors input file not found at: ${resolvedVendorsFile}`);
    process.exit(1);
  }

  const vendors = JSON.parse(fs.readFileSync(resolvedVendorsFile, 'utf8'));
  const resolvedOutputDir = path.resolve(process.cwd(), outputDir);
  fs.mkdirSync(resolvedOutputDir, { recursive: true });

  console.log('='.repeat(65));
  console.log(' CashPredix - Node.js Payment History & Anomaly Simulation (#43)');
  console.log('='.repeat(65));
  console.log(` Loaded Vendors: ${vendors.length}`);
  console.log(` Output Directory: ${resolvedOutputDir}`);
  console.log('='.repeat(65));

  const result = simulatePaymentHistories(vendors);

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
