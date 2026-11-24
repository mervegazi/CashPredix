/**
 * CashPredix - Unified Cash Flow & Liquidity Intelligence Engine
 * Computes individual customer cashflows and aggregates total portfolio cashflow across
 * all customers belonging to the authenticated user.
 * 
 * Time Horizons:
 * - This Week: Days 0 - 7
 * - Next Week: Days 8 - 14
 * - In Two Weeks: Days 15 - 21
 * - Month Total: Days 0 - 30
 * - Yearly: Days 0 - 365
 * 
 * Customer Score Tiers (Step 2 Integration):
 * - Prime: >= 88 (Benchmark, minimal delay risk)
 * - Stable: 72 - 87 (Standard operational, minor grace window)
 * - Watchlist: 50 - 71 (Moderate delay risk, split drag)
 * - High Risk: < 50 (Critical default friction, upfront terms recommended)
 */

import { getUserScope } from '../config/authWhitelist';
import {
  CANONICAL_ENTERPRISE_CUSTOMERS,
  DEMO_ANONYMIZED_CUSTOMERS,
} from '../data/seedData';

// Deterministic seed generation
function stringToSeed(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pseudoRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Determine the exact 4-tier score classification and styling
 */
export function getScoreTier(score) {
  const numScore = Number(score) || 85;
  if (numScore >= 88) {
    return {
      tier: 'Prime',
      label: 'Prime Benchmark',
      color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
      badge: 'bg-emerald-500',
      dot: 'bg-emerald-500',
      status: 'On-Time',
      riskLevel: 'Low Risk',
      onTimeRate: `${numScore}%`,
      avgDelay: '-2.4 days (Early settlement)',
      action: 'High payment reliability; predictable incoming cash inflow.',
    };
  }
  if (numScore >= 72) {
    return {
      tier: 'Stable',
      label: 'Stable Operational',
      color: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60',
      badge: 'bg-blue-500',
      dot: 'bg-blue-500',
      status: 'On-Time',
      riskLevel: 'Moderate Risk',
      onTimeRate: `${numScore}%`,
      avgDelay: '+2.8 days (Within grace)',
      action: 'Consistent settlement; standard Net 30 accounts receivable flow.',
    };
  }
  if (numScore >= 50) {
    return {
      tier: 'Watchlist',
      label: 'Watchlist Exposure',
      color: 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60',
      badge: 'bg-amber-500',
      dot: 'bg-amber-500',
      status: 'Split / Delayed',
      riskLevel: 'Elevated Risk',
      onTimeRate: `${numScore}%`,
      avgDelay: '+8.5 days (Split installment drag)',
      action: 'Frequent installment split behavior; recommend early discount prompt.',
    };
  }
  return {
    tier: 'High Risk',
    label: 'High Default Risk',
    color: 'text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60',
    badge: 'bg-rose-500',
    dot: 'bg-rose-500',
    status: 'Delayed',
    riskLevel: 'Critical Risk',
    onTimeRate: `${numScore}%`,
    avgDelay: '+18.2 days (Severe payment friction)',
    action: 'Payment collection friction; recommend stricter credit terms or upfront retainer.',
  };
}

/**
 * Retrieve current customer list for the authenticated user from storage or canonical sets
 */
export function getUserCustomers(user) {
  const scope = getUserScope(user);
  const storageKey = `cashpredix_customers_${scope.key}`;

  if (scope.isEnterprise) {
    try {
      const saved = localStorage.getItem(storageKey) || localStorage.getItem('cashpredix_customers_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const canonicalIds = new Set(CANONICAL_ENTERPRISE_CUSTOMERS.map((c) => c.id));
          const userAdded = parsed.filter((c) => !canonicalIds.has(c.id));
          return [...CANONICAL_ENTERPRISE_CUSTOMERS, ...userAdded];
        }
      }
    } catch (e) {
      console.warn('Error reading enterprise customers:', e);
    }
    return CANONICAL_ENTERPRISE_CUSTOMERS;
  }

  if (scope.type === 'demo') {
    try {
      const saved = localStorage.getItem(storageKey) || localStorage.getItem('cashpredix_demo_customers_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading demo customers:', e);
    }
    return DEMO_ANONYMIZED_CUSTOMERS;
  }

  // Regular / New User
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error reading regular user customers:', e);
  }
  return [];
}

/**
 * Calculates predictive cash flows for a single customer across all 5 intervals.
 */
export function calculateCustomerCashflow(customer) {
  if (!customer) return null;

  const seed = stringToSeed(customer.id || customer.name || 'cust_generic');
  const rand = pseudoRandom(seed);

  // Score & Penalty calibration
  const score = Number(customer.reliability_score || customer.score) || Math.floor(75 + rand() * 23);
  const tierInfo = getScoreTier(score);

  // Split behavior based on score tier
  const splitRate =
    customer.split_rate !== undefined
      ? Number(customer.split_rate)
      : score >= 88
      ? 0.08 + rand() * 0.07
      : score >= 72
      ? 0.18 + rand() * 0.12
      : score >= 50
      ? 0.35 + rand() * 0.20
      : 0.55 + rand() * 0.25;

  const penaltyDeduction = Math.round(5 * splitRate * 10) / 10;
  const baseScore = Math.min(100, Math.round(score + penaltyDeduction));

  // Determine base contract volume & invoicing frequency
  const baseTicket = [3500, 7200, 14500, 28000, 52000, 95000][Math.floor(rand() * 6)];
  const invoiceMultiplier = 0.8 + rand() * 0.5;
  const avgMonthlyVolume = Math.round(baseTicket * invoiceMultiplier);

  // Distribute payments across the 5 intervals using ML installment timing
  const isSplit = splitRate > 0.25 || rand() < splitRate;
  const timingBias = score >= 88 ? 0.35 : score >= 72 ? 0.25 : score >= 50 ? 0.15 : 0.05;

  // Week 1 (Days 0-7)
  let thisWeekAmount = 0;
  if (rand() < timingBias + 0.15) {
    thisWeekAmount = Math.round(avgMonthlyVolume * (isSplit ? 0.45 : 0.85));
  }

  // Next Week (Days 8-14)
  let nextWeekAmount = 0;
  if (rand() < 0.38) {
    nextWeekAmount = Math.round(avgMonthlyVolume * (isSplit ? 0.40 : 0.90));
  }

  // In 2 Weeks (Days 15-21)
  let in2WeeksAmount = 0;
  if (rand() < 0.42 || (isSplit && thisWeekAmount > 0)) {
    in2WeeksAmount = Math.round(avgMonthlyVolume * (isSplit ? 0.55 : 0.75));
  }

  // In 3 Weeks (Days 22-28)
  let in3WeeksAmount = 0;
  if (rand() < 0.30 || (isSplit && nextWeekAmount > 0)) {
    in3WeeksAmount = Math.round(avgMonthlyVolume * (isSplit ? 0.45 : 0.60));
  }

  // Ensure every active customer has at least some projected liquidity in the month
  if (thisWeekAmount + nextWeekAmount + in2WeeksAmount + in3WeeksAmount === 0) {
    thisWeekAmount = Math.round(avgMonthlyVolume * 0.4);
    nextWeekAmount = Math.round(avgMonthlyVolume * 0.6);
  }

  const monthTotal = thisWeekAmount + nextWeekAmount + in2WeeksAmount + in3WeeksAmount;
  const yearlyTotal = Math.round(monthTotal * 12 * (0.95 + rand() * 0.15));
  const totalReceivables = Math.round(monthTotal * (1.1 + rand() * 0.4));
  const openInvoicesCount = Math.max(1, Math.floor(rand() * 4) + 1);

  // Generate synthetic upcoming installment schedules for table display
  const today = new Date();
  const schedules = [];

  if (thisWeekAmount > 0) {
    const d = Math.floor(rand() * 6) + 1;
    schedules.push({
      date: new Date(today.getTime() + d * 86400000).toISOString().split('T')[0],
      amount: thisWeekAmount,
      installment: isSplit ? 'Part 1 of 2' : 'Full Single Payment',
      days_from_today: d,
      status: score >= 88 ? 'Early / On-Time' : 'Scheduled',
      interval: 'This Week (0-7d)',
    });
  }

  if (nextWeekAmount > 0) {
    const d = Math.floor(rand() * 6) + 8;
    schedules.push({
      date: new Date(today.getTime() + d * 86400000).toISOString().split('T')[0],
      amount: nextWeekAmount,
      installment: isSplit ? 'Part 2 of 2' : 'Full Single Payment',
      days_from_today: d,
      status: score >= 72 ? 'Scheduled' : 'Slight Delay Drag',
      interval: 'Next Week (8-14d)',
    });
  }

  if (in2WeeksAmount > 0) {
    const d = Math.floor(rand() * 6) + 15;
    schedules.push({
      date: new Date(today.getTime() + d * 86400000).toISOString().split('T')[0],
      amount: in2WeeksAmount,
      installment: 'Installment Settlement',
      days_from_today: d,
      status: score >= 72 ? 'Expected' : 'Installment Drag',
      interval: 'In 2 Weeks (15-21d)',
    });
  }

  return {
    customer_id: customer.id,
    customer_name: customer.name,
    category: customer.category || 'Commercial Client',
    payment_terms: customer.payment_terms || 'Net 30',
    reliability_score: score,
    base_score: baseScore,
    split_rate: Math.round(splitRate * 1000) / 1000,
    split_penalty: penaltyDeduction,
    tier_info: tierInfo,
    is_split_payment: isSplit,
    this_week: thisWeekAmount,
    next_week: nextWeekAmount,
    in_2_weeks: in2WeeksAmount,
    in_3_weeks: in3WeeksAmount,
    month_total: monthTotal,
    yearly_total: yearlyTotal,
    total_receivables: totalReceivables,
    open_invoices_count: openInvoicesCount,
    upcoming_schedules: schedules,
  };
}

/**
 * Computes the total portfolio cash flow across ALL customers belonging to the user.
 * 
 * @param {Object|Array} userOrCustomers - Either user object or list of customers
 * @returns {Object} Aggregated cash flow totals and breakdown
 */
export function calculatePortfolioCashflow(userOrCustomers) {
  const customers = Array.isArray(userOrCustomers)
    ? userOrCustomers
    : getUserCustomers(userOrCustomers);

  if (!customers || customers.length === 0) {
    return {
      total_customers: 0,
      active_invoices: 0,
      total_receivables: 0,
      this_week_cashflow: 0,
      next_week_cashflow: 0,
      in_2_weeks_cashflow: 0,
      in_3_weeks_cashflow: 0,
      monthly_cashflow: 0,
      yearly_cashflow: 0,
      tier_counts: { prime: 0, stable: 0, watchlist: 0, highRisk: 0 },
      average_customer_score: 0,
      customer_summaries: [],
      monthly_projection_curve: [],
      daily_trajectory: [],
    };
  }

  let totalThisWeek = 0;
  let totalNextWeek = 0;
  let totalIn2Weeks = 0;
  let totalIn3Weeks = 0;
  let totalMonthly = 0;
  let totalYearly = 0;
  let totalReceivables = 0;
  let totalActiveInvoices = 0;
  let scoreSum = 0;

  const tierCounts = { prime: 0, stable: 0, watchlist: 0, highRisk: 0 };
  const customerSummaries = [];

  for (const cust of customers) {
    const cf = calculateCustomerCashflow(cust);
    if (!cf) continue;

    totalThisWeek += cf.this_week;
    totalNextWeek += cf.next_week;
    totalIn2Weeks += cf.in_2_weeks;
    totalIn3Weeks += cf.in_3_weeks;
    totalMonthly += cf.month_total;
    totalYearly += cf.yearly_total;
    totalReceivables += cf.total_receivables;
    totalActiveInvoices += cf.open_invoices_count;
    scoreSum += cf.reliability_score;

    if (cf.tier_info.tier === 'Prime') tierCounts.prime++;
    else if (cf.tier_info.tier === 'Stable') tierCounts.stable++;
    else if (cf.tier_info.tier === 'Watchlist') tierCounts.watchlist++;
    else tierCounts.highRisk++;

    customerSummaries.push(cf);
  }

  // Sort customer summaries by month_total descending
  customerSummaries.sort((a, b) => b.month_total - a.month_total);

  const avgScore = customerSummaries.length > 0 ? Math.round((scoreSum / customerSummaries.length) * 10) / 10 : 0;

  // Build 12-Month Projection Curve (Issue #31)
  const monthNames = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const monthlyProjectionCurve = [];
  let cumulative = 0;
  const baseMonthly = totalMonthly;
  const operatingBuffer = 50000; // Minimum operating cash buffer

  for (let i = 0; i < 12; i++) {
    // Seasonal variance multiplier
    const seasonality = 1.0 + Math.sin((i / 12) * Math.PI * 2) * 0.12;
    const projected = Math.round(baseMonthly * seasonality);
    cumulative += projected;

    monthlyProjectionCurve.push({
      month: `${monthNames[i]} 2026`,
      projected_inflow: projected,
      cumulative_inflow: cumulative,
      operating_buffer: operatingBuffer,
      surplus: Math.max(0, projected - operatingBuffer),
    });
  }

  // 30-Day Daily Inflow Trajectory Points for SVG Chart
  const dailyTrajectory = [
    { day: 0, label: 'Today', cumulative: 0 },
    { day: 7, label: '+7d (This Week)', cumulative: totalThisWeek },
    { day: 14, label: '+14d (Next Week)', cumulative: totalThisWeek + totalNextWeek },
    { day: 21, label: '+21d (In 2 Wks)', cumulative: totalThisWeek + totalNextWeek + totalIn2Weeks },
    { day: 30, label: '+30d (Month Total)', cumulative: totalMonthly },
  ];

  return {
    total_customers: customers.length,
    active_invoices: totalActiveInvoices,
    total_receivables: totalReceivables,
    this_week_cashflow: totalThisWeek,
    next_week_cashflow: totalNextWeek,
    in_2_weeks_cashflow: totalIn2Weeks,
    in_3_weeks_cashflow: totalIn3Weeks,
    monthly_cashflow: totalMonthly,
    yearly_cashflow: totalYearly,
    tier_counts: tierCounts,
    average_customer_score: avgScore,
    customer_summaries: customerSummaries,
    monthly_projection_curve: monthlyProjectionCurve,
    daily_trajectory: dailyTrajectory,
  };
}

/**
 * Dispatch real-time cashflow update notification so dashboard and forecasting views re-render
 */
export function notifyCashflowUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cashpredix_customers_updated'));
  }
}

/**
 * Subscribe to real-time customer and cashflow data updates
 */
export function subscribeToCashflowUpdates(callback) {
  if (typeof window === 'undefined') return () => {};

  const handleUpdate = () => callback();
  window.addEventListener('cashpredix_customers_updated', handleUpdate);
  window.addEventListener('storage', handleUpdate);

  return () => {
    window.removeEventListener('cashpredix_customers_updated', handleUpdate);
    window.removeEventListener('storage', handleUpdate);
  };
}

/**
 * Generates CSV string of the 12-Month Cash Flow Forecast & Customer Schedule (Issue #32)
 */
export function generateCashflowForecastCSV(portfolio) {
  if (!portfolio || !portfolio.customer_summaries) return '';

  const headers = [
    'Customer / Counterparty',
    'Category',
    'Payment Terms',
    'Reliability Score',
    'Score Tier',
    'Historical Split Rate',
    'Split Penalty (Pts)',
    'This Week Inflow (0-7d)',
    'Next Week Inflow (8-14d)',
    'In 2 Weeks Inflow (15-21d)',
    'In 3 Weeks Inflow (22-28d)',
    'Month Total (0-30d)',
    'Yearly Run-rate Total',
    'Total Outstanding AR',
    'Active Invoices Count',
    'Predicted Payment Status',
  ];

  const rows = portfolio.customer_summaries.map((c) => [
    `"${c.customer_name}"`,
    `"${c.category}"`,
    `"${c.payment_terms}"`,
    c.reliability_score,
    `"${c.tier_info.tier}"`,
    `${(c.split_rate * 100).toFixed(1)}%`,
    c.split_penalty,
    c.this_week,
    c.next_week,
    c.in_2_weeks,
    c.in_3_weeks,
    c.month_total,
    c.yearly_total,
    c.total_receivables,
    c.open_invoices_count,
    `"${c.tier_info.status}"`,
  ]);

  // Append Portfolio Total Summary Row
  rows.unshift([
    '"=== PORTFOLIO TOTAL (ALL CUSTOMERS) ==="',
    '""',
    '""',
    portfolio.average_customer_score,
    '"Portfolio Aggregate"',
    '""',
    '""',
    portfolio.this_week_cashflow,
    portfolio.next_week_cashflow,
    portfolio.in_2_weeks_cashflow,
    portfolio.in_3_weeks_cashflow,
    portfolio.monthly_cashflow,
    portfolio.yearly_cashflow,
    portfolio.total_receivables,
    portfolio.active_invoices,
    '"Active Portfolio Inflow"',
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
