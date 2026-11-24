import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  Calendar, 
  Sparkles, 
  Building2, 
  Clock, 
  ChevronRight,
  Users,
  Receipt,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { 
  calculatePortfolioCashflow, 
  subscribeToCashflowUpdates 
} from '../../lib/cashflowService';

export default function WelcomeDashboard() {
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Executive User';

  // Formatted current date
  const currentDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  // Real-time calculated portfolio cash flow aggregating all customers belonging to user
  const [portfolio, setPortfolio] = useState(() => calculatePortfolioCashflow(user));

  useEffect(() => {
    // Initial calculation
    setPortfolio(calculatePortfolioCashflow(user));

    // Listen for customer creations, updates, or deletes
    const unsubscribe = subscribeToCashflowUpdates(() => {
      setPortfolio(calculatePortfolioCashflow(user));
    });

    return unsubscribe;
  }, [user]);

  // Core 5 Cash Flow Horizon Metrics requested by user
  const CASHFLOW_CARDS = [
    {
      title: 'This Week',
      subtitle: 'Days 0 - 7',
      amount: portfolio.this_week_cashflow,
      color: 'emerald',
      badge: 'High Certainty',
      icon: DollarSign,
      description: 'Expected immediate collections',
    },
    {
      title: 'Next Week',
      subtitle: 'Days 8 - 14',
      amount: portfolio.next_week_cashflow,
      color: 'blue',
      badge: 'Scheduled',
      icon: TrendingUp,
      description: 'Incoming mature receivables',
    },
    {
      title: 'In Two Weeks',
      subtitle: 'Days 15 - 21',
      amount: portfolio.in_2_weeks_cashflow,
      color: 'purple',
      badge: 'Part 2 Splits',
      icon: Layers,
      description: 'Divided & deferred installments',
    },
    {
      title: 'Month Total',
      subtitle: 'Days 0 - 30 Total',
      amount: portfolio.monthly_cashflow,
      color: 'indigo',
      badge: '30-Day Ceiling',
      icon: Receipt,
      description: 'Full monthly operating liquidity',
      highlight: true,
    },
    {
      title: 'Yearly Total',
      subtitle: '365-Day Projected',
      amount: portfolio.yearly_cashflow,
      color: 'amber',
      badge: 'Fiscal Run-rate',
      icon: ShieldCheck,
      description: 'Annual projected enterprise inflow',
    },
  ];

  // Top customer alerts / highlights from user's active customers
  const topCustomerInflows = useMemo(() => {
    if (!portfolio.customer_summaries || portfolio.customer_summaries.length === 0) return [];
    return portfolio.customer_summaries.slice(0, 4);
  }, [portfolio]);

  // Scaled SVG Path calculation for the 30-Day Trajectory
  const trajectoryPoints = useMemo(() => {
    const maxVal = Math.max(1, portfolio.monthly_cashflow);
    const day0 = 170;
    const day7 = Math.max(30, 170 - (portfolio.this_week_cashflow / maxVal) * 120);
    const day14 = Math.max(30, day7 - (portfolio.next_week_cashflow / maxVal) * 90);
    const day21 = Math.max(25, day14 - (portfolio.in_2_weeks_cashflow / maxVal) * 60);
    const day30 = Math.max(20, 170 - 140); // Target peak

    return {
      d: `M 0 170 C 80 ${day7}, 160 ${day7}, 240 ${day14} C 320 ${day14}, 400 ${day21}, 480 ${day21} C 540 ${day21}, 580 ${day30}, 600 ${day30}`,
      fill: `M 0 170 C 80 ${day7}, 160 ${day7}, 240 ${day14} C 320 ${day14}, 400 ${day21}, 480 ${day21} C 540 ${day21}, 580 ${day30}, 600 ${day30} L 600 200 L 0 200 Z`,
      y7: Math.round(day7),
      y14: Math.round(day14),
      y21: Math.round(day21),
      y30: Math.round(day30),
    };
  }, [portfolio]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white dark:bg-gradient-to-br dark:from-blue-950/60 dark:via-indigo-950/40 dark:to-gray-900 border border-blue-200/80 dark:border-blue-500/30 p-6 sm:p-8 backdrop-blur-xl shadow-sm dark:shadow-xl transition-colors">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 transition-colors">
                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                Live Predictive Liquidity
              </span>
              <span className="text-xs text-slate-500 dark:text-gray-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-gray-400" />
                {currentDate}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                {portfolio.total_customers} Total Customers
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 dark:from-blue-400 dark:via-indigo-300 dark:to-emerald-400">{userName}</span>!
            </h1>
            <p className="mt-1.5 text-sm sm:text-base text-slate-600 dark:text-gray-300 max-w-2xl leading-relaxed">
              Your comprehensive cash flow forecast aggregates across <strong className="text-gray-900 dark:text-white font-semibold">all {portfolio.total_customers} active customers</strong> in your portfolio. Current liquidity projections are healthy with <strong className="text-emerald-600 dark:text-emerald-400">${portfolio.monthly_cashflow.toLocaleString()}</strong> expected in the next 30 days.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/dashboard/company-customer"
              id="hero-add-vendor-button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Building2 className="w-4 h-4" />
              <span>Companies & Customers</span>
            </Link>
            <Link
              to="/dashboard/cashflow-predicts"
              id="hero-view-forecast-button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm dark:bg-gray-800/80 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-700 transition-all"
            >
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Cashflow Predicts</span>
            </Link>
          </div>
        </div>

        {/* Decorative graphic background pattern */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-gradient-to-tr from-blue-500/10 to-emerald-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Portfolio Cash Flow Horizons KPI Strip (This Week, Next Week, In 2 Weeks, Month Total, Yearly) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <span>User Portfolio Cash Flow Aggregation (All {portfolio.total_customers} Customers)</span>
            </h2>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {portfolio.active_invoices} scheduled payment receipts
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {CASHFLOW_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className={`rounded-2xl p-4 transition-all duration-200 border ${
                  card.highlight
                    ? 'bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-gray-900 border-blue-300/80 dark:border-blue-700/60 shadow-md ring-1 ring-blue-500/20'
                    : 'bg-white dark:bg-gray-900/90 border-gray-200 dark:border-gray-800/80 shadow-xs hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {card.title}
                  </span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                    {card.subtitle}
                  </span>
                </div>

                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white font-mono tracking-tight">
                    ${card.amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] pt-2 border-t border-gray-100 dark:border-gray-800">
                  <span className={`font-semibold text-${card.color}-600 dark:text-${card.color}-400 flex items-center gap-1`}>
                    <CheckCircle2 className="w-3 h-3" />
                    {card.badge}
                  </span>
                  <span className="text-gray-400 text-[10px] truncate max-w-[100px]">
                    {card.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: 30-Day Cash Flow Trajectory Chart & Customer Inflow Monitors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Cashflow Chart Preview (2 Columns) */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800/80 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-100 dark:border-gray-800 gap-2">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span>30-Day Cumulative Inflow Trajectory</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Sum of predicted incoming cash across all {portfolio.total_customers} counterparties
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                Total Month: ${portfolio.monthly_cashflow.toLocaleString()}
              </span>
            </div>
          </div>

          {/* SVG Visual Chart */}
          <div className="mt-6 relative h-56 w-full flex flex-col justify-end">
            <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              <line x1="0" y1="40" x2="600" y2="40" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="4 4" />
              <line x1="0" y1="90" x2="600" y2="90" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="4 4" />
              <line x1="0" y1="140" x2="600" y2="140" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="4 4" />

              {/* Gradient Area Fill */}
              <path
                d={trajectoryPoints.fill}
                fill="url(#chartGradient)"
              />

              {/* Forecast Line */}
              <path
                d={trajectoryPoints.d}
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Milestone Dots */}
              <circle cx="160" cy={trajectoryPoints.y7} r="5" fill="#3b82f6" />
              <circle cx="320" cy={trajectoryPoints.y14} r="5" fill="#6366f1" />
              <circle cx="480" cy={trajectoryPoints.y21} r="5" fill="#8b5cf6" />
              <circle cx="600" cy={trajectoryPoints.y30} r="6" fill="#10b981" />
            </svg>

            {/* X-Axis labels */}
            <div className="flex justify-between text-[11px] font-medium text-gray-400 mt-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              <span>Today ($0)</span>
              <span>This Week (${portfolio.this_week_cashflow.toLocaleString()})</span>
              <span>Next Week (+${portfolio.next_week_cashflow.toLocaleString()})</span>
              <span>In 2 Wks (+${portfolio.in_2_weeks_cashflow.toLocaleString()})</span>
              <span>Month Peak (${portfolio.monthly_cashflow.toLocaleString()})</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Customer Reliability Avg: <strong className="text-gray-800 dark:text-gray-200">{portfolio.average_customer_score} / 100</strong>
            </span>
            <Link
              to="/dashboard/cashflow-predicts"
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
            >
              Open Interactive Forecast Model <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Customer Inflow & Risk Monitor (1 Column) */}
        <div className="rounded-2xl bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-500" />
                <span>Top Customer Inflows</span>
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {portfolio.customer_summaries.length} Active
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {topCustomerInflows.map((cust) => (
                <div
                  key={cust.customer_id}
                  className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-800 text-xs hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between font-semibold text-gray-900 dark:text-white">
                    <span className="truncate pr-2">{cust.customer_name}</span>
                    <span className="shrink-0 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      ${cust.month_total.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px]">
                    <span className="text-gray-500 dark:text-gray-400">
                      {cust.payment_terms} • {cust.tier_info.tier}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cust.tier_info.badge} text-white`}>
                      {cust.reliability_score}%
                    </span>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
                    <span>This Wk: ${cust.this_week.toLocaleString()}</span>
                    <span>Next Wk: ${cust.next_week.toLocaleString()}</span>
                    <span>In 2 Wks: ${cust.in_2_weeks.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/dashboard/company-customer"
            className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-center text-blue-600 dark:text-blue-400 font-semibold hover:underline block"
          >
            View All {portfolio.total_customers} Customers in Registry →
          </Link>
        </div>
      </div>

      {/* System Status Banner */}
      <div className="rounded-2xl p-5 bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-emerald-50/60 border border-blue-200/80 text-slate-900 shadow-sm dark:bg-gradient-to-r dark:from-gray-900 dark:to-gray-800 dark:border-gray-800 dark:text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-300 text-blue-700 dark:bg-blue-600/30 dark:border-blue-500/40 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Predictive Accounts Receivable & Inflow Architecture Active</h3>
            <p className="text-xs text-slate-600 dark:text-gray-400">
              Multi-tenant customer portfolios, automated behavioral penalty deductions, and real-time cash flow aggregation online.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-gray-400">Status:</span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Operational & Synchronized
          </span>
        </div>
      </div>
    </div>
  );
}
