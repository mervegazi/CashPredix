import { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  BrainCircuit, 
  SlidersHorizontal, 
  Calendar, 
  Download, 
  Zap, 
  BarChart3, 
  LineChart, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  DollarSign, 
  ArrowRight, 
  RefreshCw, 
  Clock, 
  CheckCircle2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Receipt,
  FileSpreadsheet,
  AlertTriangle,
  Briefcase
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import ScenarioPredictionCard from '../../components/ScenarioPredictionCard';
import CustomerLedgerModal from '../../components/CustomerLedgerModal';
import { predictInvoice } from '../../lib/mlPredictionService';
import { 
  calculatePortfolioCashflow, 
  subscribeToCashflowUpdates,
  generateCashflowForecastCSV,
  getUserCustomers
} from '../../lib/cashflowService';

export default function CashflowPredictsPlaceholder() {
  const { user } = useAuth();

  // Portfolio cashflow state aggregated across all customers of the user
  const [portfolio, setPortfolio] = useState(() => calculatePortfolioCashflow(user));

  // Timeframe selector (Issue #30)
  // 'all' | 'this_week' | 'next_week' | 'in_2_weeks' | 'month_total' | 'yearly'
  const [activeTimeframe, setActiveTimeframe] = useState('all');

  // Customer table search & pagination (Issue #32)
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all'); // 'all' | 'Prime' | 'Stable' | 'Watchlist' | 'High Risk'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected customer for AR Ledger Modal
  const [ledgerCustomer, setLedgerCustomer] = useState(null);

  // Live Prediction Sandbox State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('25000');
  const [daysUntilDue, setDaysUntilDue] = useState('30');
  const [prediction, setPrediction] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);

  // Real-time recalculation subscription (Issue #32)
  useEffect(() => {
    const update = () => {
      const p = calculatePortfolioCashflow(user);
      setPortfolio(p);
      if (p.customer_summaries.length > 0 && !selectedCustomerId) {
        setSelectedCustomerId(p.customer_summaries[0].customer_id);
      }
    };
    update();

    const unsubscribe = subscribeToCashflowUpdates(update);
    return unsubscribe;
  }, [user]);

  // Set default selected customer for sandbox once customers load
  useEffect(() => {
    if (portfolio.customer_summaries.length > 0 && !selectedCustomerId) {
      setSelectedCustomerId(portfolio.customer_summaries[0].customer_id);
    }
  }, [portfolio.customer_summaries]);

  const handleRunPrediction = async () => {
    setIsPredicting(true);
    const custSummary = portfolio.customer_summaries.find((c) => c.customer_id === selectedCustomerId);
    const cust = custSummary
      ? {
          id: custSummary.customer_id,
          name: custSummary.customer_name,
          payment_terms: custSummary.payment_terms,
          category: custSummary.category,
          reliability_score: custSummary.reliability_score,
          split_rate: custSummary.split_rate,
        }
      : {
          id: selectedCustomerId || 'cust_generic',
          name: 'Custom Counterparty',
          split_rate: 0.22,
          avg_delay_days: 2.5,
        };

    try {
      const res = await predictInvoice({
        customerId: selectedCustomerId || 'cust_generic',
        invoiceAmount: Number(invoiceAmount) || 25000,
        daysUntilDue: Number(daysUntilDue) || 30,
        invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        customer: cust,
      });
      setPrediction(res);
    } catch (err) {
      toast.error('Prediction failed: ' + err.message);
    } finally {
      setIsPredicting(false);
    }
  };

  // Run initial prediction when selected customer changes
  useEffect(() => {
    if (selectedCustomerId) {
      handleRunPrediction();
    }
  }, [selectedCustomerId]);

  // Export CSV handler (Issue #32)
  const handleExportCSV = () => {
    try {
      const csvContent = generateCashflowForecastCSV(portfolio);
      if (!csvContent) {
        toast.error('No cash flow forecast data available to export.');
        return;
      }
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CashPredix_12_Month_CashFlow_Forecast.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Exported 12-Month Cash Flow Forecast Schedule (CSV)!');
    } catch (e) {
      toast.error('Export failed: ' + e.message);
    }
  };

  // Filtered customer list for table
  const filteredCustomers = useMemo(() => {
    return portfolio.customer_summaries.filter((c) => {
      const matchesSearch =
        c.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.payment_terms.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTier =
        tierFilter === 'all' || c.tier_info.tier.toLowerCase() === tierFilter.toLowerCase();

      let matchesTimeframe = true;
      if (activeTimeframe === 'this_week') matchesTimeframe = c.this_week > 0;
      else if (activeTimeframe === 'next_week') matchesTimeframe = c.next_week > 0;
      else if (activeTimeframe === 'in_2_weeks') matchesTimeframe = c.in_2_weeks > 0;
      else if (activeTimeframe === 'month_total') matchesTimeframe = c.month_total > 0;

      return matchesSearch && matchesTier && matchesTimeframe;
    });
  }, [portfolio.customer_summaries, searchQuery, tierFilter, activeTimeframe]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / itemsPerPage));
  const pagedCustomers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(start, start + itemsPerPage);
  }, [filteredCustomers, currentPage]);

  // Chart bar max calculations (Issue #31)
  const maxWeeklyAmount = Math.max(
    1,
    portfolio.this_week_cashflow,
    portfolio.next_week_cashflow,
    portfolio.in_2_weeks_cashflow,
    portfolio.in_3_weeks_cashflow
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
            <span>Predictive Cash Flow & Liquidity Intelligence Engine</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Real-time accounts receivable projections aggregating all <strong className="text-gray-900 dark:text-white">{portfolio.total_customers} customers</strong> belonging to your account.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>Export Forecast (CSV)</span>
          </button>
        </div>
      </div>

      {/* Timeframe Selector Strip (Issue #30) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mr-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
            Active Horizon:
          </span>
          {[
            { id: 'all', label: 'All Horizons' },
            { id: 'this_week', label: 'This Week (0-7d)' },
            { id: 'next_week', label: 'Next Week (8-14d)' },
            { id: 'in_2_weeks', label: 'In Two Weeks (15-21d)' },
            { id: 'month_total', label: 'Month Total (0-30d)' },
            { id: 'yearly', label: 'Fiscal Year Total' },
          ].map((tf) => (
            <button
              key={tf.id}
              onClick={() => {
                setActiveTimeframe(tf.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                activeTimeframe === tf.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
          Portfolio Total: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">${portfolio.monthly_cashflow.toLocaleString()}</strong>
        </div>
      </div>

      {/* 5 Core Liquidity Summary Cards (Issue #30) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: This Week */}
        <div className={`p-4 rounded-2xl border transition-all ${
          activeTimeframe === 'this_week' || activeTimeframe === 'all'
            ? 'bg-white dark:bg-gray-900 border-emerald-500/50 shadow-sm ring-1 ring-emerald-500/20'
            : 'bg-white/60 dark:bg-gray-900/60 border-gray-200 dark:border-gray-800 opacity-80'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              This Week (0-7d)
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white font-mono block">
            ${portfolio.this_week_cashflow.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            High Certainty Inflows
          </span>
        </div>

        {/* Card 2: Next Week */}
        <div className={`p-4 rounded-2xl border transition-all ${
          activeTimeframe === 'next_week' || activeTimeframe === 'all'
            ? 'bg-white dark:bg-gray-900 border-blue-500/50 shadow-sm ring-1 ring-blue-500/20'
            : 'bg-white/60 dark:bg-gray-900/60 border-gray-200 dark:border-gray-800 opacity-80'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Next Week (8-14d)
            </span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white font-mono block">
            ${portfolio.next_week_cashflow.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Scheduled AR Collections
          </span>
        </div>

        {/* Card 3: In Two Weeks */}
        <div className={`p-4 rounded-2xl border transition-all ${
          activeTimeframe === 'in_2_weeks' || activeTimeframe === 'all'
            ? 'bg-white dark:bg-gray-900 border-purple-500/50 shadow-sm ring-1 ring-purple-500/20'
            : 'bg-white/60 dark:bg-gray-900/60 border-gray-200 dark:border-gray-800 opacity-80'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              In Two Weeks (15-21d)
            </span>
            <span className="w-2 h-2 rounded-full bg-purple-500" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white font-mono block">
            ${portfolio.in_2_weeks_cashflow.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold mt-1 flex items-center gap-1">
            <Layers className="w-3 h-3" />
            Part 2 Split Settlements
          </span>
        </div>

        {/* Card 4: Month Total */}
        <div className={`p-4 rounded-2xl border transition-all bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-gray-900 ${
          activeTimeframe === 'month_total' || activeTimeframe === 'all'
            ? 'border-blue-400 dark:border-blue-600 shadow-sm ring-1 ring-blue-500/30'
            : 'border-gray-200 dark:border-gray-800'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 block">
              Month Total (0-30d)
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white">
              Primary
            </span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-blue-700 dark:text-blue-300 font-mono block">
            ${portfolio.monthly_cashflow.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-1 flex items-center gap-1">
            <Receipt className="w-3 h-3" />
            Net 30 Operating Inflow
          </span>
        </div>

        {/* Card 5: Yearly Total */}
        <div className={`p-4 rounded-2xl border transition-all ${
          activeTimeframe === 'yearly' || activeTimeframe === 'all'
            ? 'bg-white dark:bg-gray-900 border-amber-500/50 shadow-sm ring-1 ring-amber-500/20'
            : 'bg-white/60 dark:bg-gray-900/60 border-gray-200 dark:border-gray-800 opacity-80'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Yearly Run-rate
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white font-mono block">
            ${portfolio.yearly_cashflow.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            Annual Forecast Curve
          </span>
        </div>
      </div>

      {/* Issue #31: Responsive Cash Flow Visualizations (Weekly Inflow Bars & 12-Month Projection Curve) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Inflow Horizon Comparison Bar Chart (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Weekly Liquidity Distribution
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-gray-400">
                Next 30 Days
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {[
                { label: 'This Week (0-7d)', amount: portfolio.this_week_cashflow, color: 'bg-emerald-500' },
                { label: 'Next Week (8-14d)', amount: portfolio.next_week_cashflow, color: 'bg-blue-500' },
                { label: 'In Two Weeks (15-21d)', amount: portfolio.in_2_weeks_cashflow, color: 'bg-purple-500' },
                { label: 'In Three Weeks (22-28d)', amount: portfolio.in_3_weeks_cashflow, color: 'bg-indigo-500' },
              ].map((bar) => {
                const pct = Math.round((bar.amount / maxWeeklyAmount) * 100);
                return (
                  <div key={bar.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-gray-700 dark:text-gray-300">{bar.label}</span>
                      <span className="font-mono text-gray-900 dark:text-white font-bold">
                        ${bar.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${bar.color} transition-all duration-500`}
                        style={{ width: `${Math.max(6, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Operating Inflows: 4 Scheduled Windows</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              Avg Inflow: ${Math.round(portfolio.monthly_cashflow / 4).toLocaleString()} / wk
            </span>
          </div>
        </div>

        {/* 12-Month Yearly Cash Flow Forecast Projection Curve vs Operating Buffer (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-gray-100 dark:border-gray-800 gap-2">
              <div className="flex items-center gap-2">
                <LineChart className="w-4 h-4 text-emerald-500" />
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    12-Month Cash Flow Forecast Curve vs Buffer
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Monthly projected inflow vs. $50,000 baseline operating safety buffer
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                  Monthly Forecast
                </span>
                <span className="flex items-center gap-1.5 text-rose-500 font-semibold">
                  <span className="w-2.5 h-1 bg-rose-500 inline-block" />
                  $50k Buffer
                </span>
              </div>
            </div>

            {/* SVG Visual 12-Month Curve */}
            <div className="mt-6 relative h-48 w-full flex flex-col justify-end">
              <svg viewBox="0 0 600 160" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Operating Buffer Reference Line ($50k) */}
                <line x1="0" y1="110" x2="600" y2="110" stroke="#f43f5e" strokeWidth="2" strokeDasharray="6 4" opacity="0.85" />
                <text x="10" y="104" fill="#f43f5e" fontSize="10" fontWeight="bold">Min Buffer: $50,000</text>

                {/* 12-Month Area and Line */}
                <path
                  d="M 0 65 Q 50 50 100 60 T 200 45 T 300 35 T 400 50 T 500 30 T 600 40 L 600 160 L 0 160 Z"
                  fill="url(#curveGrad)"
                />
                <path
                  d="M 0 65 Q 50 50 100 60 T 200 45 T 300 35 T 400 50 T 500 30 T 600 40"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Dots along month markers */}
                {[0, 100, 200, 300, 400, 500, 600].map((x, i) => (
                  <circle key={i} cx={x} cy={i % 2 === 0 ? 55 : 40} r="4.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
                ))}
              </svg>

              <div className="flex justify-between text-[10px] font-medium text-gray-400 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                {portfolio.monthly_projection_curve.slice(0, 6).map((m) => (
                  <span key={m.month}>{m.month.split(' ')[0]}</span>
                ))}
                {portfolio.monthly_projection_curve.slice(6, 12).filter((_, i) => i % 2 === 1).map((m) => (
                  <span key={m.month}>{m.month.split(' ')[0]}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Operating Liquidity Coverage: <strong className="text-emerald-600 dark:text-emerald-400">100% Above Minimum Buffer</strong></span>
            <span className="font-mono text-gray-700 dark:text-gray-300 font-semibold">
              Yearly Run-rate: ${portfolio.yearly_cashflow.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Issue #32: Detailed Cash Flow Forecasting Table & Real-Time Aggregation */}
      <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {/* Table Header & Controls */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-500" />
              <span>Customer Cash Flow Forecasting Schedule</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Showing predicted cash inflows broken down across all {portfolio.total_customers} counterparties
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search counterparty or category..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 w-48 sm:w-60"
              />
            </div>

            {/* Risk Tier Filter */}
            <select
              value={tierFilter}
              onChange={(e) => {
                setTierFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white"
            >
              <option value="all">All Tiers ({portfolio.total_customers})</option>
              <option value="Prime">Prime Tier ({portfolio.tier_counts.prime})</option>
              <option value="Stable">Stable Tier ({portfolio.tier_counts.stable})</option>
              <option value="Watchlist">Watchlist ({portfolio.tier_counts.watchlist})</option>
              <option value="High Risk">High Risk ({portfolio.tier_counts.highRisk})</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Customer / Counterparty</th>
                <th className="py-3 px-3 font-semibold">Reliability Index</th>
                <th className="py-3 px-3 font-semibold text-right">This Week (0-7d)</th>
                <th className="py-3 px-3 font-semibold text-right">Next Week (8-14d)</th>
                <th className="py-3 px-3 font-semibold text-right">In 2 Wks (15-21d)</th>
                <th className="py-3 px-3 font-semibold text-right">Month Total</th>
                <th className="py-3 px-3 font-semibold text-right">Yearly Run-rate</th>
                <th className="py-3 px-3 font-semibold">Prediction Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
              {pagedCustomers.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-gray-400">
                    No customers match the active search or timeframe filter.
                  </td>
                </tr>
              ) : (
                pagedCustomers.map((cust) => (
                  <tr
                    key={cust.customer_id}
                    className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <div>
                          <span className="font-semibold text-gray-900 dark:text-white block">
                            {cust.customer_name}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {cust.category} • {cust.payment_terms}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cust.tier_info.color}">
                        <span className={`w-1.5 h-1.5 rounded-full ${cust.tier_info.badge}`} />
                        <span>{cust.reliability_score}%</span>
                        <span className="text-[10px] opacity-75">({cust.tier_info.tier})</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-medium">
                      {cust.this_week > 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          ${cust.this_week.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-medium">
                      {cust.next_week > 0 ? (
                        <span className="text-blue-600 dark:text-blue-400 font-bold">
                          ${cust.next_week.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-medium">
                      {cust.in_2_weeks > 0 ? (
                        <span className="text-purple-600 dark:text-purple-400 font-bold">
                          ${cust.in_2_weeks.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-gray-900 dark:text-white">
                      ${cust.month_total.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-gray-500 dark:text-gray-400">
                      ${cust.yearly_total.toLocaleString()}
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        cust.tier_info.tier === 'Prime'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : cust.tier_info.tier === 'Stable'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                          : cust.tier_info.tier === 'Watchlist'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                      }`}>
                        {cust.tier_info.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedCustomerId(cust.customer_id);
                            window.scrollTo({ top: 1200, behavior: 'smooth' });
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                        >
                          Simulate
                        </button>
                        <button
                          onClick={() => {
                            setLedgerCustomer({
                              id: cust.customer_id,
                              name: cust.customer_name,
                              category: cust.category,
                              payment_terms: cust.payment_terms,
                              reliability_score: cust.reliability_score,
                              split_rate: cust.split_rate,
                            });
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 transition-colors"
                        >
                          Ledger
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Counter */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of{' '}
            {filteredCustomers.length} counterparties
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Sandbox + Scenario Prediction Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
        {/* Left Column: Interactive Simulation Sandbox */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    Live Prediction Sandbox
                  </h2>
                  <p className="text-xs text-gray-400">
                    Test customer payment behavior in the 6-Step pipeline
                  </p>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                Interactive
              </span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Select Customer */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  Target Customer / Counterparty:
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500"
                >
                  {portfolio.customer_summaries.map((c) => (
                    <option key={c.customer_id} value={c.customer_id}>
                      {c.customer_name} ({c.payment_terms} • {c.reliability_score}%)
                    </option>
                  ))}
                  <option value="new_cold_start_client">
                    + New Cold Start Customer (Zero History Prior)
                  </option>
                </select>
              </div>

              {/* Invoice Amount */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                  <span>Gross Invoice Amount (USD):</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                    ${Number(invoiceAmount || 0).toLocaleString()}
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    value={invoiceAmount}
                    onChange={(e) => setInvoiceAmount(e.target.value)}
                    placeholder="25000"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-mono font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Days Until Due */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                  <span>Payment Maturity Term:</span>
                  <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
                    {daysUntilDue} Days
                  </span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="90"
                  step="5"
                  value={daysUntilDue}
                  onChange={(e) => setDaysUntilDue(e.target.value)}
                  className="w-full accent-purple-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                  <span>Net 5</span>
                  <span>Net 30</span>
                  <span>Net 60</span>
                  <span>Net 90</span>
                </div>
              </div>

              {/* Trigger Button */}
              <button
                type="button"
                onClick={handleRunPrediction}
                disabled={isPredicting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isPredicting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Run ML Prediction & Scenario Synthesis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Scenario Prediction Card */}
        <div className="lg:col-span-7 space-y-4">
          <ScenarioPredictionCard
            prediction={prediction}
            isLoading={isPredicting}
            onRefresh={handleRunPrediction}
          />
        </div>
      </div>

      {/* Customer AR Ledger Modal */}
      {ledgerCustomer && (
        <CustomerLedgerModal
          isOpen={!!ledgerCustomer}
          customer={ledgerCustomer}
          onClose={() => setLedgerCustomer(null)}
        />
      )}
    </div>
  );
}
