import { useState, useMemo, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  Download,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Deterministic pseudorandom number generator for consistent ledger simulation per customer
function pseudoRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function stringToSeed(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Generate realistic enterprise AR ledger transactions for a specific customer
function generateCustomerLedger(customer) {
  if (!customer) return [];

  const seed = stringToSeed(customer.id || customer.name);
  const rand = pseudoRandom(seed);

  const termDays =
    customer.payment_terms === 'Due on Receipt'
      ? 0
      : customer.payment_terms === 'Net 15'
      ? 15
      : customer.payment_terms === 'Net 45'
      ? 45
      : customer.payment_terms === 'Net 60'
      ? 60
      : customer.payment_terms === 'Net 90'
      ? 90
      : 30;

  const records = [];
  const now = new Date('2026-10-20T00:00:00Z');
  let currentDt = new Date(now.getTime() - 270 * 86400000); // 9 months back

  const invoiceCount = 7 + Math.floor(rand() * 5); // 7 to 11 invoices

  for (let i = 0; i < invoiceCount; i++) {
    const invSeq = 10000 + Math.floor(rand() * 90000);
    const invoiceNumber = `INV-${currentDt.getFullYear()}-${invSeq}`;
    const invoiceDateStr = currentDt.toISOString().split('T')[0];

    const baseAmount = [1200, 2400, 4800, 9500, 16000, 34000][Math.floor(rand() * 6)];
    const invoiceAmount = Math.round((baseAmount + rand() * baseAmount * 0.5) * 100) / 100;

    const dueDt = new Date(currentDt.getTime() + termDays * 86400000);
    const dueDateStr = dueDt.toISOString().split('T')[0];

    const isFuture = dueDt > now;

    if (isFuture) {
      records.push({
        id: `inv-${seed}-${i}-0`,
        invoice_number: invoiceNumber,
        invoice_date: invoiceDateStr,
        due_date: dueDateStr,
        invoice_amount: invoiceAmount,
        amount_paid: 0.0,
        remaining_balance: invoiceAmount,
        payment_date: null,
        payment_method: null,
        installment_number: 1,
        total_installments: 1,
        is_split_payment: false,
        check_number: null,
        check_maturity_date: null,
        check_status: null,
        is_factored: false,
        factoring_date: null,
        factoring_fee: 0.0,
        net_cash_received: 0.0,
        days_past_due: 0,
        status: 'PENDING',
      });
    } else {
      const roll = rand();

      // Case A: Split Payment (2 installments, ~25% probability)
      if (roll < 0.25) {
        const splitRatio = 0.5;
        const part1 = Math.round(invoiceAmount * splitRatio * 100) / 100;
        const part2 = Math.round((invoiceAmount - part1) * 100) / 100;

        const payDt1 = new Date(dueDt.getTime() + (Math.floor(rand() * 6) - 2) * 86400000);
        const payDt2 = new Date(payDt1.getTime() + (Math.floor(rand() * 15) + 15) * 86400000);

        // Part 1 row
        records.push({
          id: `inv-${seed}-${i}-part1`,
          invoice_number: invoiceNumber,
          invoice_date: invoiceDateStr,
          due_date: dueDateStr,
          invoice_amount: invoiceAmount,
          amount_paid: part1,
          remaining_balance: part2,
          payment_date: payDt1.toISOString().split('T')[0],
          payment_method: 'wire_transfer',
          installment_number: 1,
          total_installments: 2,
          is_split_payment: true,
          check_number: null,
          check_maturity_date: null,
          check_status: null,
          is_factored: false,
          factoring_date: null,
          factoring_fee: 0.0,
          net_cash_received: part1,
          days_past_due: Math.round((payDt1.getTime() - dueDt.getTime()) / 86400000),
          status: 'PARTIAL',
        });

        // Part 2 row
        if (payDt2 <= now) {
          const chkNum = `CHK-${Math.floor(100000 + rand() * 900000)}`;
          const chkMat = new Date(payDt2.getTime() + 5 * 86400000);
          records.push({
            id: `inv-${seed}-${i}-part2`,
            invoice_number: invoiceNumber,
            invoice_date: invoiceDateStr,
            due_date: dueDateStr,
            invoice_amount: invoiceAmount,
            amount_paid: part2,
            remaining_balance: 0.0,
            payment_date: payDt2.toISOString().split('T')[0],
            payment_method: 'check',
            installment_number: 2,
            total_installments: 2,
            is_split_payment: true,
            check_number: chkNum,
            check_maturity_date: chkMat.toISOString().split('T')[0],
            check_status: 'cleared',
            is_factored: false,
            factoring_date: null,
            factoring_fee: 0.0,
            net_cash_received: part2,
            days_past_due: Math.round((payDt2.getTime() - dueDt.getTime()) / 86400000),
            status: 'PAID',
          });
        } else {
          records.push({
            id: `inv-${seed}-${i}-part2`,
            invoice_number: invoiceNumber,
            invoice_date: invoiceDateStr,
            due_date: dueDateStr,
            invoice_amount: invoiceAmount,
            amount_paid: 0.0,
            remaining_balance: part2,
            payment_date: null,
            payment_method: 'wire_transfer',
            installment_number: 2,
            total_installments: 2,
            is_split_payment: true,
            check_number: null,
            check_maturity_date: null,
            check_status: null,
            is_factored: false,
            factoring_date: null,
            factoring_fee: 0.0,
            net_cash_received: 0.0,
            days_past_due: 0,
            status: 'PENDING',
          });
        }
      }
      // Case B: Post-Dated Check with Early Factoring / Discounting (~15%)
      else if (roll < 0.40) {
        const chkNum = `CHK-${Math.floor(100000 + rand() * 900000)}`;
        const checkMaturityDt = new Date(dueDt.getTime() + 20 * 86400000);
        const factoringDt = new Date(currentDt.getTime() + 10 * 86400000);
        const feeRate = 0.03; // 3% factoring fee
        const fee = Math.round(invoiceAmount * feeRate * 100) / 100;
        const netCash = Math.round((invoiceAmount - fee) * 100) / 100;

        records.push({
          id: `inv-${seed}-${i}-chk-factored`,
          invoice_number: invoiceNumber,
          invoice_date: invoiceDateStr,
          due_date: dueDateStr,
          invoice_amount: invoiceAmount,
          amount_paid: invoiceAmount,
          remaining_balance: 0.0,
          payment_date: factoringDt.toISOString().split('T')[0],
          payment_method: 'check',
          installment_number: 1,
          total_installments: 1,
          is_split_payment: false,
          check_number: chkNum,
          check_maturity_date: checkMaturityDt.toISOString().split('T')[0],
          check_status: 'discounted_factored',
          is_factored: true,
          factoring_date: factoringDt.toISOString().split('T')[0],
          factoring_fee: fee,
          net_cash_received: netCash,
          days_past_due: Math.round((factoringDt.getTime() - dueDt.getTime()) / 86400000),
          status: 'PAID',
        });
      }
      // Case C: Standard Settled (Wire or ACH, ~50%)
      else if (roll < 0.90) {
        const delayDays = Math.floor(rand() * 10) - 3; // -3 to +7 days
        const payDt = new Date(dueDt.getTime() + delayDays * 86400000);
        const method = rand() > 0.5 ? 'wire_transfer' : 'ach';
        const dpd = Math.round((payDt.getTime() - dueDt.getTime()) / 86400000);

        records.push({
          id: `inv-${seed}-${i}-std`,
          invoice_number: invoiceNumber,
          invoice_date: invoiceDateStr,
          due_date: dueDateStr,
          invoice_amount: invoiceAmount,
          amount_paid: invoiceAmount,
          remaining_balance: 0.0,
          payment_date: payDt.toISOString().split('T')[0],
          payment_method: method,
          installment_number: 1,
          total_installments: 1,
          is_split_payment: false,
          check_number: null,
          check_maturity_date: null,
          check_status: null,
          is_factored: false,
          factoring_date: null,
          factoring_fee: 0.0,
          net_cash_received: invoiceAmount,
          days_past_due: dpd,
          status: dpd <= 3 ? 'PAID' : 'LATE',
        });
      }
      // Case D: Cash / Overdue / Friction (~10%)
      else {
        const delayDays = 15 + Math.floor(rand() * 20);
        const payDt = new Date(dueDt.getTime() + delayDays * 86400000);

        records.push({
          id: `inv-${seed}-${i}-late`,
          invoice_number: invoiceNumber,
          invoice_date: invoiceDateStr,
          due_date: dueDateStr,
          invoice_amount: invoiceAmount,
          amount_paid: invoiceAmount,
          remaining_balance: 0.0,
          payment_date: payDt <= now ? payDt.toISOString().split('T')[0] : null,
          payment_method: 'cash',
          installment_number: 1,
          total_installments: 1,
          is_split_payment: false,
          check_number: null,
          check_maturity_date: null,
          check_status: null,
          is_factored: false,
          factoring_date: null,
          factoring_fee: 0.0,
          net_cash_received: invoiceAmount,
          days_past_due: delayDays,
          status: payDt <= now ? 'LATE' : 'OVERDUE',
        });
      }
    }

    currentDt = new Date(currentDt.getTime() + (22 + Math.floor(rand() * 8)) * 86400000);
  }

  // Sort descending by invoice date
  return records.sort((a, b) => new Date(b.invoice_date) - new Date(a.invoice_date));
}

export default function CustomerLedgerModal({ isOpen, customer, company, onClose }) {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'split' | 'checks' | 'open'

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const transactions = useMemo(() => {
    return generateCustomerLedger(customer);
  }, [customer]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return { totalInvoiced: 0, totalPaid: 0, totalBalance: 0, splitCount: 0, checkCount: 0 };
    }
    const totalInvoiced = transactions
      .filter((t) => t.installment_number === 1)
      .reduce((sum, t) => sum + (t.invoice_amount || 0), 0);
    const totalPaid = transactions.reduce((sum, t) => sum + (t.amount_paid || 0), 0);
    const totalBalance = transactions.reduce((sum, t) => sum + (t.remaining_balance || 0), 0);
    const splitCount = transactions.filter((t) => t.is_split_payment).length;
    const checkCount = transactions.filter((t) => t.payment_method === 'check').length;

    return {
      totalInvoiced,
      totalPaid,
      totalBalance,
      splitCount,
      checkCount,
    };
  }, [transactions]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    if (activeFilter === 'split') return transactions.filter((t) => t.is_split_payment);
    if (activeFilter === 'checks') return transactions.filter((t) => t.payment_method === 'check');
    if (activeFilter === 'open') return transactions.filter((t) => t.remaining_balance > 0 || t.status === 'PENDING' || t.status === 'PARTIAL');
    return transactions;
  }, [transactions, activeFilter]);

  const handleExportCSV = () => {
    if (!transactions.length) return;
    const headers = [
      'Invoice Number',
      'Invoice Date',
      'Due Date',
      'Invoice Amount',
      'Amount Paid',
      'Remaining Balance',
      'Payment Date',
      'Payment Method',
      'Installment',
      'Check Number',
      'Check Maturity Date',
      'Is Factored',
      'Factoring Fee',
      'Net Cash Received',
      'Days Past Due',
      'Status',
    ];

    const rows = transactions.map((t) => [
      t.invoice_number,
      t.invoice_date,
      t.due_date,
      t.invoice_amount,
      t.amount_paid,
      t.remaining_balance,
      t.payment_date || '',
      t.payment_method || '',
      `${t.installment_number}/${t.total_installments}`,
      t.check_number || '',
      t.check_maturity_date || '',
      t.is_factored ? 'YES' : 'NO',
      t.factoring_fee || 0,
      t.net_cash_received || 0,
      t.days_past_due || 0,
      t.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${customer.name.replace(/\s+/g, '_')}_AR_Ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${transactions.length} financial transactions!`);
  };

  if (!isOpen || !customer) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden transition-all scale-100 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between gap-4 bg-gradient-to-r from-blue-50/50 via-white to-white dark:from-blue-950/20 dark:via-gray-900 dark:to-gray-900">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Accounts Receivable Ledger
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Entity: {company?.name || 'CashPredix Portfolio'}
              </span>
            </div>
            <h2 className="mt-1.5 text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-500" />
              <span>{customer.name}</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Contract Terms: <span className="font-semibold text-gray-700 dark:text-gray-200">{customer.payment_terms}</span> • Category: <span className="font-semibold text-gray-700 dark:text-gray-200">{customer.category || 'Commercial Client'}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Export as CSV"
            >
              <Download className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Financial KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-6 bg-gray-50/70 dark:bg-gray-900/60 border-b border-gray-100 dark:border-gray-800 text-xs">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 shadow-sm">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Total Invoiced
            </span>
            <span className="text-base font-bold text-gray-900 dark:text-white font-mono mt-1 block">
              ${metrics.totalInvoiced.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-gray-400 mt-0.5 block">Historical gross billings</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 shadow-sm">
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              Cash Collected
            </span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
              ${metrics.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-gray-400 mt-0.5 block">Settled bank inflows</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 shadow-sm">
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
              Open Receivables
            </span>
            <span className="text-base font-bold text-amber-600 dark:text-amber-400 font-mono mt-1 block">
              ${metrics.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-gray-400 mt-0.5 block">Outstanding customer balance</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 shadow-sm">
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
              Instrument Mix
            </span>
            <div className="flex items-center gap-2 mt-1 text-xs font-semibold text-gray-900 dark:text-white">
              <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-600 text-[10px]">
                {metrics.splitCount} Splits
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-600 text-[10px]">
                {metrics.checkCount} Checks
              </span>
            </div>
            <span className="text-[10px] text-gray-400 mt-0.5 block">Multi-part & post-dated terms</span>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="px-6 pt-3 pb-2 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeFilter === 'all'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              All Records ({transactions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('split')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeFilter === 'split'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Split Payments ({transactions.filter((t) => t.is_split_payment).length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('checks')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeFilter === 'checks'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Post-Dated Checks ({transactions.filter((t) => t.payment_method === 'check').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('open')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeFilter === 'open'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Open Receivables ({transactions.filter((t) => t.remaining_balance > 0).length})
            </button>
          </div>

          <div className="text-[11px] text-gray-400">
            Showing {filteredRows.length} financial transactions
          </div>
        </div>

        {/* Financial Transactions Table */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 sticky top-0">
                <tr>
                  <th className="py-3 px-3.5 font-semibold">Invoice # & Date</th>
                  <th className="py-3 px-3.5 font-semibold">Due Date</th>
                  <th className="py-3 px-3.5 font-semibold">Invoice Amount</th>
                  <th className="py-3 px-3.5 font-semibold">Amount Paid</th>
                  <th className="py-3 px-3.5 font-semibold">Remaining Balance</th>
                  <th className="py-3 px-3.5 font-semibold">Installment</th>
                  <th className="py-3 px-3.5 font-semibold">Method & Instrument Details</th>
                  <th className="py-3 px-3.5 font-semibold">Settlement & Delay (DSO)</th>
                  <th className="py-3 px-3.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                {filteredRows.map((t) => {
                  const isFactored = t.is_factored;

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      {/* Invoice # & Date */}
                      <td className="py-3 px-3.5">
                        <span className="font-mono font-bold text-gray-900 dark:text-white block">
                          {t.invoice_number}
                        </span>
                        <span className="text-[11px] text-gray-400 block mt-0.5">
                          Issued: {t.invoice_date}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="py-3 px-3.5 font-mono font-medium text-gray-800 dark:text-gray-200">
                        {t.due_date}
                      </td>

                      {/* Invoice Total */}
                      <td className="py-3 px-3.5 font-mono font-semibold text-gray-900 dark:text-white">
                        ${t.invoice_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      {/* Amount Paid */}
                      <td className="py-3 px-3.5 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        {t.amount_paid > 0 ? (
                          `$${t.amount_paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                        ) : (
                          <span className="text-gray-400 font-normal">—</span>
                        )}
                      </td>

                      {/* Remaining Balance */}
                      <td className="py-3 px-3.5 font-mono">
                        {t.remaining_balance > 0 ? (
                          <span className="font-bold text-amber-600 dark:text-amber-400">
                            ${t.remaining_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[11px]">Settled ($0.00)</span>
                        )}
                      </td>

                      {/* Installment / Split */}
                      <td className="py-3 px-3.5">
                        {t.is_split_payment ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50">
                            Part {t.installment_number}/{t.total_installments}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[11px]">1/1 Single</span>
                        )}
                      </td>

                      {/* Payment Method & Instrument Details */}
                      <td className="py-3 px-3.5">
                        {t.payment_method === 'check' ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                              Post-Dated Check: {t.check_number}
                            </span>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-mono">
                              Check Maturity: {t.check_maturity_date}
                            </span>
                            {isFactored && (
                              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold block bg-purple-50 dark:bg-purple-950/30 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800/40">
                                ⚡ Factored (Early Settlement): Fee ${t.factoring_fee} | Net Received ${t.net_cash_received.toLocaleString()}
                              </span>
                            )}
                          </div>
                        ) : t.payment_method === 'wire_transfer' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
                            Wire Transfer (EFT/SWIFT)
                          </span>
                        ) : t.payment_method === 'ach' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
                            ACH Direct Debit
                          </span>
                        ) : t.payment_method === 'cash' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                            Cash Settlement
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[11px]">Pending Instrument</span>
                        )}
                      </td>

                      {/* Settlement Date & Delay */}
                      <td className="py-3 px-3.5">
                        {t.payment_date ? (
                          <div>
                            <span className="font-mono text-gray-800 dark:text-gray-200 block">
                              {t.payment_date}
                            </span>
                            {t.days_past_due <= 0 ? (
                              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                {Math.abs(t.days_past_due)} days early (On-Time)
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                                +{t.days_past_due} days delay
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-[11px] font-mono">Unsettled</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-3.5">
                        {t.status === 'PAID' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            PAID
                          </span>
                        ) : t.status === 'PARTIAL' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Clock className="w-3 h-3" />
                            PARTIAL
                          </span>
                        ) : t.status === 'PENDING' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            PENDING
                          </span>
                        ) : t.status === 'LATE' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                            <AlertTriangle className="w-3 h-3" />
                            LATE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                            <AlertTriangle className="w-3 h-3" />
                            MISSED
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/80 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Real-time B2B AR Ledger Integration Active</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            Close Ledger View
          </button>
        </div>
      </div>
    </div>
  );
}
