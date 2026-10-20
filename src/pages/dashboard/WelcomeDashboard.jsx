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
  ChevronRight
} from 'lucide-react';

export default function WelcomeDashboard() {
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Executive User';

  // Format today's date
  const currentDate = "Tuesday, Oct 13, 2026";

  const METRICS = [
    {
      title: 'Forecasted Cash Balance',
      value: '$142,850.00',
      change: '+8.4% vs last cycle',
      isPositive: true,
      icon: DollarSign,
      color: 'blue',
      description: 'Projected 30-day liquidity ceiling',
    },
    {
      title: 'Expected Receivables',
      value: '$86,400.00',
      change: '8 invoices pending',
      isPositive: true,
      icon: TrendingUp,
      color: 'emerald',
      description: 'Expected customer inflow by Nov 1',
    },
    {
      title: 'Operating Payables',
      value: '$42,120.00',
      change: '14 disbursements scheduled',
      isPositive: false,
      icon: ArrowDownRight,
      color: 'amber',
      description: 'Scheduled disbursements within 15 days',
    },
    {
      title: 'Customer Reliability Score',
      value: '94.2 / 100',
      change: 'Low Portfolio Credit Risk',
      isPositive: true,
      icon: ShieldCheck,
      color: 'indigo',
      description: 'ML model confidence: 98.7%',
    },
  ];

  const UPCOMING_ALERTS = [
    {
      customer: 'JPMorgan Chase Treasury',
      amount: '$14,200.00',
      dueDate: 'Oct 19, 2026',
      risk: 'High Delay Risk (44%)',
      riskColor: 'red',
      recommendation: 'Recommend prompt follow-up or early payment incentive.',
    },
    {
      customer: 'Shopify Plus Merchant Corp',
      amount: '$8,450.00',
      dueDate: 'Oct 23, 2026',
      risk: 'Moderate Risk (12%)',
      riskColor: 'amber',
      recommendation: 'Historical invoice settlement is steady.',
    },
    {
      customer: 'Walmart eCommerce Partners',
      amount: '$19,470.00',
      dueDate: 'Oct 28, 2026',
      risk: 'Optimal Low Risk (3%)',
      riskColor: 'emerald',
      recommendation: 'Reliable tier-1 client, zero settlement delay predicted.',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white dark:bg-gradient-to-br dark:from-blue-950/60 dark:via-indigo-950/40 dark:to-gray-900 border border-blue-200/80 dark:border-blue-500/30 p-6 sm:p-8 backdrop-blur-xl shadow-sm dark:shadow-xl transition-colors">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 transition-colors">
                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                Live Predictive Environment
              </span>
              <span className="text-xs text-slate-500 dark:text-gray-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-gray-400" />
                {currentDate}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 dark:from-blue-400 dark:via-indigo-300 dark:to-emerald-400">{userName}</span>!
            </h1>
            <p className="mt-1.5 text-sm sm:text-base text-slate-600 dark:text-gray-300 max-w-2xl leading-relaxed">
              CashPredix AI has analyzed your customer payment behavior metrics. Your incoming cash flow is optimal, with no liquidity shortfalls projected for the next 30 days.
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
              <span>Add Company & Customer</span>
            </Link>
            <Link
              to="/dashboard/cashflow-predicts"
              id="hero-view-forecast-button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm dark:bg-gray-800/80 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-700 transition-all"
            >
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Cashflow Predicts</span>
            </Link>
          </div>
        </div>

        {/* Decorative graphic background pattern */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-gradient-to-tr from-blue-500/10 to-emerald-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* 4 Core Financial KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {METRICS.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.title}
              className="rounded-2xl p-5 bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800/80 shadow-sm hover:shadow-md transition-all hover:border-blue-500/40 group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {metric.title}
                </span>
                <div className={`p-2 rounded-xl bg-${metric.color}-500/10 text-${metric.color}-600 dark:text-${metric.color}-400 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                {metric.value}
              </div>

              <div className="mt-2 flex items-center justify-between text-xs">
                <span className={`font-semibold flex items-center gap-1 ${
                  metric.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                }`}>
                  {metric.isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {metric.change}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400 truncate">
                {metric.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Forecast Chart & Upcoming Customer Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Static Cashflow Chart Preview (2 Columns) */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800/80 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-100 dark:border-gray-800 gap-2">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span>30-Day Cash Flow Trajectory</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Machine learning forecast integrating payment histories & customer payment risk
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40 self-start sm:self-auto">
              Monte Carlo Model v1
            </span>
          </div>

          {/* SVG Visual Chart */}
          <div className="mt-6 relative h-56 w-full flex flex-col justify-end">
            <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              <line x1="0" y1="40" x2="600" y2="40" stroke="currentColor" strokeOpacity="0.1" strokeDasharray="4 4" />
              <line x1="0" y1="90" x2="600" y2="90" stroke="currentColor" strokeOpacity="0.1" strokeDasharray="4 4" />
              <line x1="0" y1="140" x2="600" y2="140" stroke="currentColor" strokeOpacity="0.1" strokeDasharray="4 4" />

              {/* Gradient Area Fill */}
              <path
                d="M 0 160 Q 100 130 200 145 T 400 90 T 600 50 L 600 200 L 0 200 Z"
                fill="url(#chartGradient)"
              />

              {/* Forecast Line */}
              <path
                d="M 0 160 Q 100 130 200 145 T 400 90 T 600 50"
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Milestone Dots */}
              <circle cx="200" cy="145" r="5" fill="#3b82f6" />
              <circle cx="400" cy="90" r="5" fill="#6366f1" />
              <circle cx="600" cy="50" r="6" fill="#10b981" />
            </svg>

            {/* X-Axis labels */}
            <div className="flex justify-between text-[11px] font-medium text-gray-400 mt-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              <span>Oct 13 (Today)</span>
              <span>Oct 20 (+7d)</span>
              <span>Oct 27 (+14d)</span>
              <span>Nov 03 (+21d)</span>
              <span>Nov 12 (+30d Target)</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Target surplus: <strong className="text-gray-800 dark:text-gray-200">+$24,300.00</strong>
            </span>
            <Link
              to="/dashboard/cashflow-predicts"
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
            >
              Open detailed model <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Customer Behavioral Alerts (1 Column) */}
        <div className="rounded-2xl bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Customer Credit Risk Monitor</span>
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                3 Monitored
              </span>
            </div>

            <div className="mt-4 space-y-3.5">
              {UPCOMING_ALERTS.map((alert) => (
                <div
                  key={alert.customer}
                  className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 text-xs hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between font-semibold text-gray-900 dark:text-white">
                    <span className="truncate pr-2">{alert.customer}</span>
                    <span className="shrink-0">{alert.amount}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px]">
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Due {alert.dueDate}
                    </span>
                    <span className={`font-semibold ${
                      alert.riskColor === 'red' ? 'text-red-500' : alert.riskColor === 'amber' ? 'text-amber-500' : 'text-emerald-500'
                    }`}>
                      {alert.risk}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-gray-500 dark:text-gray-400 italic">
                    {alert.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/dashboard/company-customer"
            className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-center text-blue-600 dark:text-blue-400 font-semibold hover:underline block"
          >
            Manage Customers & Payment Terms →
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
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Enterprise Liquidity & Receivables Engine Active</h3>
            <p className="text-xs text-slate-600 dark:text-gray-400">
              Supabase Row-Level Security, multi-tenant company hierarchies, and predictive risk scoring initialized.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-gray-400">System Status:</span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Operational & RLS Secured
          </span>
        </div>
      </div>
    </div>
  );
}
