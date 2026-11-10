import { useState } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  Layers,
  AlertTriangle,
  Zap,
  TrendingDown,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';

const CLASS_LABELS_12 = {
  P_single_early: { label: 'Single (Early Payment)', group: 'single', color: 'bg-sky-500', text: 'text-sky-600 dark:text-sky-400' },
  P_single_ontime: { label: 'Single (On-Time Payment)', group: 'single', color: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
  P_single_late: { label: 'Single (Delayed Payment)', group: 'single', color: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400' },

  P_split_both_early: { label: 'Split (Both Early)', group: 'split', color: 'bg-teal-500', text: 'text-teal-600 dark:text-teal-400' },
  P_split_part1_early_part2_ontime: { label: 'Split (P1 Early, P2 On-Time)', group: 'split', color: 'bg-cyan-500', text: 'text-cyan-600 dark:text-cyan-400' },
  P_split_part1_early_part2_late: { label: 'Split (P1 Early, P2 Late Drag)', group: 'split', color: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },

  P_split_part1_ontime_part2_early: { label: 'Split (P1 On-Time, P2 Early)', group: 'split', color: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' },
  P_split_both_ontime: { label: 'Split (Both On-Time)', group: 'split', color: 'bg-indigo-500', text: 'text-indigo-600 dark:text-indigo-400' },
  P_split_part1_ontime_part2_late: { label: 'Split (P1 On-Time, P2 Late Drag)', group: 'split', color: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400' },

  P_split_part1_late_part2_early: { label: 'Split (P1 Late, P2 Early Catchup)', group: 'split', color: 'bg-purple-500', text: 'text-purple-600 dark:text-purple-400' },
  P_split_part1_late_part2_ontime: { label: 'Split (P1 Late, P2 On-Time)', group: 'split', color: 'bg-fuchsia-500', text: 'text-fuchsia-600 dark:text-fuchsia-400' },
  P_split_both_late: { label: 'Split (Both Late Default Risk)', group: 'split', color: 'bg-red-600', text: 'text-red-600 dark:text-red-400' },
};

export default function ScenarioPredictionCard({ prediction, isLoading = false }) {
  const [activeProbFilter, setActiveProbFilter] = useState('all'); // 'all' | 'single' | 'split'

  if (isLoading) {
    return (
      <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-blue-200/80 dark:border-blue-900/40 shadow-xl space-y-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20" />
            <div className="h-5 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          </div>
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full" />
        </div>
        <div className="h-20 bg-gray-100 dark:bg-gray-800/60 rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-24 bg-gray-100 dark:bg-gray-800/40 rounded-2xl" />
          <div className="h-24 bg-gray-100 dark:bg-gray-800/40 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="p-6 rounded-3xl bg-gray-50 dark:bg-gray-900/60 border border-dashed border-gray-200 dark:border-gray-800 text-center">
        <BrainCircuit className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          No Invoice Selected for Prediction
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Select an invoice from the ledger or run a live forecast to execute the 6-Step Hybrid ML engine.
        </p>
      </div>
    );
  }

  const {
    step1_probabilities: probs = {},
    predicted_class,
    is_divided_invoice,
    step2_customer_score,
    step2_score_details: scoreDetails = {},
    step4_scenario_text,
    step6_risk_action: riskAction = null,
    predicted_installments: installments = [],
  } = prediction;

  const scoreTierColor =
    step2_customer_score >= 85
      ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
      : step2_customer_score >= 65
      ? 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60'
      : 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60';

  const displayedProbs = Object.entries(CLASS_LABELS_12).filter(([key, config]) => {
    if (activeProbFilter === 'single') return config.group === 'single';
    if (activeProbFilter === 'split') return config.group === 'split';
    return true;
  });

  return (
    <div className="rounded-3xl bg-white dark:bg-gray-900 border border-blue-200/80 dark:border-blue-900/40 shadow-xl overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-white/20 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-200" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wide">
              6-Step Hybrid ML & Cash Flow Architecture
            </h3>
            <span className="text-[11px] text-blue-100/90 font-medium">
              12 Timing Classes • Divided Penalty • Multi-Output XGBoost • Working Capital Optimizer
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {prediction.is_cold_start && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-400/20 text-amber-100 border border-amber-300/40">
              Cold Start Prior
            </span>
          )}
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-white/20 backdrop-blur-md border border-white/20">
            {is_divided_invoice ? 'Divided Invoice' : 'Single Payment'}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Step 4: Scenario Text Highlight Card */}
        <div className="relative p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-purple-50/30 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-purple-950/10 border border-blue-200/60 dark:border-blue-800/40">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white shadow-xs">
              Step 4: Scenario Narrative
            </span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              Natural Language Synthesis
            </span>
          </div>
          <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 leading-relaxed italic">
            "{step4_scenario_text}"
          </p>
        </div>

        {/* Step 6: Counterparty Risk Alert & Working Capital Optimizer Banner */}
        {riskAction && (
          <div className={`p-4 rounded-2xl border ${
            riskAction.color_code === 'rose'
              ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50 text-rose-900 dark:text-rose-100'
              : riskAction.color_code === 'amber'
              ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-100'
              : 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-100'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Step 6: Credit Action & Working Capital Optimizer
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/70 dark:bg-black/30 border border-current">
                {riskAction.step6_risk_level}
              </span>
            </div>
            <p className="text-xs font-semibold leading-relaxed">
              {riskAction.recommendation}
            </p>
            {riskAction.estimated_working_capital_carry_cost > 0 && (
              <div className="mt-2 text-[11px] font-mono opacity-90 flex items-center gap-2">
                <span>Estimated Working Capital Carry Cost (8% APR):</span>
                <span className="font-bold">${riskAction.estimated_working_capital_carry_cost.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {/* Step 2 & Step 3 Split Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Step 2: Divided-Invoice Penalty Scoring Card */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                Step 2: Reliability Score
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${scoreTierColor}`}>
                {scoreDetails.tier || 'Standard'}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white font-mono">
                {step2_customer_score}
              </span>
              <span className="text-sm font-semibold text-gray-400">/ 100</span>
            </div>

            {/* Penalty Formula Breakdown */}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700/60 text-[11px] space-y-1 text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <span>Base Reliability Score:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 font-mono">{scoreDetails.base_score}</span>
              </div>
              <div className="flex justify-between text-rose-600 dark:text-rose-400">
                <span>Divided Penalty (-5 × {scoreDetails.historical_split_rate}):</span>
                <span className="font-semibold font-mono">-{scoreDetails.invoice_split_penalty}</span>
              </div>
              <div className="text-[10px] text-gray-400 italic pt-0.5">
                Formula: Base_Score (12 Classes) - 5 * Split_Rate
              </div>
            </div>
          </div>

          {/* Step 3: Cash Allocation & Installments */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/80">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              Step 3: Multi-Output Forecast
            </span>

            <div className="space-y-2.5">
              {installments.map((inst, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-white dark:bg-gray-900/90 border border-gray-200/60 dark:border-gray-700/60 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-[10px]">
                      P{inst.installment_number}
                    </span>
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white">
                        ${Number(inst.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-gray-400 block">
                        ({Math.round(inst.ratio * 100)}% allocation)
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-semibold text-gray-700 dark:text-gray-300 font-mono block">
                      in {inst.days_from_today} days
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {inst.estimated_payment_date}
                    </span>
                  </div>
                </div>
              ))}

              {!is_divided_invoice && (
                <div className="text-[10px] text-gray-400 italic text-center py-1">
                  Single payment verified: Part 2 suppressed ($0.00 / Day 0)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 1: 12-Class Probability Distribution Bars */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-500" />
              Step 1: LightGBM 12-Class Probability Distribution
            </span>

            {/* Filter Pills */}
            <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-0.5 text-[10px]">
              <button
                type="button"
                onClick={() => setActiveProbFilter('all')}
                className={`px-2 py-0.5 rounded-md font-semibold ${
                  activeProbFilter === 'all'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                All 12
              </button>
              <button
                type="button"
                onClick={() => setActiveProbFilter('single')}
                className={`px-2 py-0.5 rounded-md font-semibold ${
                  activeProbFilter === 'single'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Single (3)
              </button>
              <button
                type="button"
                onClick={() => setActiveProbFilter('split')}
                className={`px-2 py-0.5 rounded-md font-semibold ${
                  activeProbFilter === 'split'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Split (9)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5 pt-1">
            {displayedProbs.map(([key, config]) => {
              const probability = probs[key] || 0.0;
              const pct = Math.round(probability * 100);
              const isSelected = key === predicted_class;

              return (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className={`font-medium ${isSelected ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                      {config.label}
                      {isSelected && (
                        <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400">
                          Selected
                        </span>
                      )}
                    </span>
                    <span className="font-mono font-semibold text-gray-700 dark:text-gray-300">
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${config.color} ${isSelected ? 'opacity-100' : 'opacity-60'}`}
                      style={{ width: `${Math.max(2, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
