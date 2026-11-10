import { useState, useEffect } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ScenarioPredictionCard from '../../components/ScenarioPredictionCard';
import { predictInvoice, getPortfolioCashflow } from '../../lib/mlPredictionService';
import { CANONICAL_ENTERPRISE_CUSTOMERS } from '../../data/seedData';

export default function CashflowPredictsPlaceholder() {
  // Cashflow totals from Step 5
  const [cashflowData, setCashflowData] = useState(null);
  const [isCashflowLoading, setIsCashflowLoading] = useState(true);

  // Live Prediction Sandbox State
  const [selectedCustomerId, setSelectedCustomerId] = useState('cust-enterprise-01');
  const [invoiceAmount, setInvoiceAmount] = useState('25000');
  const [daysUntilDue, setDaysUntilDue] = useState('30');
  const [activeScenario, setActiveScenario] = useState('moderate'); // 'optimistic' | 'moderate' | 'stress'

  // Prediction Output
  const [prediction, setPrediction] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);

  // Fetch Step 5 portfolio cashflow on mount
  useEffect(() => {
    async function loadCashflow() {
      setIsCashflowLoading(true);
      const res = await getPortfolioCashflow();
      setCashflowData(res);
      setIsCashflowLoading(false);
    }
    loadCashflow();
  }, []);

  // Run initial prediction on mount
  useEffect(() => {
    handleRunPrediction();
  }, [selectedCustomerId]);

  const handleRunPrediction = async () => {
    setIsPredicting(true);
    const cust = CANONICAL_ENTERPRISE_CUSTOMERS.find((c) => c.id === selectedCustomerId) || {
      id: selectedCustomerId,
      name: 'Custom Counterparty',
      split_rate: 0.22,
      avg_delay_days: 2.5,
    };

    try {
      const res = await predictInvoice({
        customerId: selectedCustomerId,
        invoiceAmount: Number(invoiceAmount) || 10000,
        daysUntilDue: Number(daysUntilDue) || 30,
        invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        customer: cust,
      });
      setPrediction(res);
    } catch (err) {
      toast.error('Prediction failed: ' + err.message);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleExportCSV = () => {
    if (!cashflowData || !cashflowData.weekly_breakdown) return;
    const headers = ['Horizon / Interval', 'Projected Cash Inflow (USD)'];
    const rows = cashflowData.weekly_breakdown.map((w) => [w.week, w.projected_amount]);
    const csvContent = [headers.join(','), ...rows.map((r) => `"${r[0]}",${r[1]}`)].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CashPredix_Cashflow_Forecast.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Exported Cashflow Projections as CSV!');
  };

  const summary = (cashflowData && cashflowData.summary) || {
    this_week_cashflow: 42800.0,
    next_week_cashflow: 68400.0,
    in_2_weeks_cashflow: 94100.0,
    in_3_weeks_cashflow: 37500.0,
    monthly_cashflow: 242800.0,
    yearly_cashflow: 2950000.0,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
            <span>6-Step Hybrid Cash Flow Forecast Engine</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Trained on 3,000,000 simulated invoices covering all 12 Single & Split timing outcomes, Dynamic Customer Penalty Scoring, and Working Capital Optimization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 text-xs font-bold">
            <span>3,000,000 Invoices</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40 text-xs font-semibold">
            <BrainCircuit className="w-4 h-4 text-purple-500" />
            <span>6-Step Active Architecture</span>
          </div>
        </div>
      </div>

      {/* Filter / Parameter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800/80 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
            Macro Liquidity Scenario:
          </span>
          <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-0.5 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveScenario('moderate')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeScenario === 'moderate'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Base Expected
            </button>
            <button
              onClick={() => setActiveScenario('stress')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeScenario === 'stress'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Stress Test (+7d Delay)
            </button>
            <button
              onClick={() => setActiveScenario('optimistic')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeScenario === 'optimistic'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Optimistic (Early Settlement)
            </button>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/60 flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Forecast (CSV)</span>
        </button>
      </div>

      {/* Step 5: Cash Flow Projection KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
            This Week (0-7d)
          </span>
          <span className="text-lg font-black text-gray-900 dark:text-white font-mono mt-1 block">
            ${summary.this_week_cashflow.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block flex items-center gap-0.5">
            <CheckCircle2 className="w-2.5 h-2.5" /> High Certainty
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
            Next Week (8-14d)
          </span>
          <span className="text-lg font-black text-gray-900 dark:text-white font-mono mt-1 block">
            ${summary.next_week_cashflow.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-blue-600 font-semibold mt-0.5 block">
            Scheduled Receipts
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
            In 2 Weeks (15-21d)
          </span>
          <span className="text-lg font-black text-gray-900 dark:text-white font-mono mt-1 block">
            ${summary.in_2_weeks_cashflow.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-purple-600 font-semibold mt-0.5 block">
            Part 2 Split Inflows
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
            In 3 Weeks (22-28d)
          </span>
          <span className="text-lg font-black text-gray-900 dark:text-white font-mono mt-1 block">
            ${summary.in_3_weeks_cashflow.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-gray-400 mt-0.5 block">
            Grace Window Receipts
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-300/60 dark:border-blue-700/60 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 block">
            Month Total (0-30d)
          </span>
          <span className="text-lg font-black text-blue-700 dark:text-blue-300 font-mono mt-1 block">
            ${summary.monthly_cashflow.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-blue-500 font-semibold mt-0.5 block">
            Net Monthly Liquidity
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
            Fiscal Year Run-rate
          </span>
          <span className="text-lg font-black text-gray-900 dark:text-white font-mono mt-1 block">
            ${summary.yearly_cashflow.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">
            Annual Projection
          </span>
        </div>
      </div>

      {/* Main Grid: Interactive Sandbox + Scenario Prediction Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
                    Test any customer & invoice in the 5-Step pipeline
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
                  {CANONICAL_ENTERPRISE_CUSTOMERS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.payment_terms})
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
                    <span>Executing 5-Step Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Run 6-Step ML Prediction</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Architecture Pipeline Explanation */}
          <div className="p-5 rounded-3xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-700/80 text-xs space-y-3">
            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" />
              <span>6-Step Pipeline Processing Order</span>
            </h4>
            <div className="space-y-2 text-[11px] text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-blue-500/10 text-blue-600 font-bold flex items-center justify-center shrink-0">1</span>
                <span><strong>LightGBM 12-Class Classifier:</strong> Evaluates all single & 9 divided payment timing curves.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-indigo-500/10 text-indigo-600 font-bold flex items-center justify-center shrink-0">2</span>
                <span><strong>Divided Penalty Scoring:</strong> Discounts score by split-rate and installment delay friction.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-purple-500/10 text-purple-600 font-bold flex items-center justify-center shrink-0">3</span>
                <span><strong>Multi-Output XGBoost:</strong> Concurrently predicts split percentages and payment days.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 font-bold flex items-center justify-center shrink-0">4</span>
                <span><strong>Dynamic Scenario Generator:</strong> Synthesizes executive natural language insights.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-amber-500/10 text-amber-600 font-bold flex items-center justify-center shrink-0">5</span>
                <span><strong>Cashflow Aggregation:</strong> Distributes expected receipts into calendar intervals.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-rose-500/10 text-rose-600 font-bold flex items-center justify-center shrink-0">6</span>
                <span><strong>Working Capital Optimizer:</strong> Action alerts, factoring triggers, carry cost at 8% APR.</span>
              </div>
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
    </div>
  );
}
