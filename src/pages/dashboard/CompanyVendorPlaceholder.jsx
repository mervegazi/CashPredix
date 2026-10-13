import { 
  Building2, 
  Users, 
  FileSpreadsheet, 
  CheckCircle2, 
  Sparkles
} from 'lucide-react';

export default function CompanyVendorPlaceholder() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Roadmap Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-blue-500" />
            <span>Create Company & Vendor</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your corporate entities, vendor relationships, and historical payment term agreements.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 text-xs font-semibold self-start sm:self-auto">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span>Week 3 Feature Sprint</span>
        </div>
      </div>

      {/* Feature Sneak Peek Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="rounded-2xl p-6 bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Company Hierarchy
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Register corporate entities with industry codes, bank limits, and currency specifications linked to your Supabase tenant.
            </p>
            <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Multi-entity tenant separation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Configurable fiscal periods</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs font-semibold text-blue-600 dark:text-blue-400">
            Ready for Week 3 CRUD Integration →
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-2xl p-6 bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Manual Vendor Entry
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Quickly register new suppliers with tailored payment terms (Net 30, Net 60, COD) and contact channels.
            </p>
            <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Payment term validation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Vendor default risk tagger</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Interactive Forms in Progress →
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-2xl p-6 bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Excel / CSV Batch Ingestion
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Upload thousands of historical payment ledger rows at once with client-side parsing and column auto-mapping.
            </p>
            <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Synthetic dataset generation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Bulk row-level security validation</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            Data Pipelines Queued →
          </div>
        </div>
      </div>

      {/* Simulated Vendor Table Placeholder */}
      <div className="rounded-2xl bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800/80 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="font-bold text-gray-900 dark:text-white text-sm">
            Current Vendor Registry (Preview)
          </div>
          <span className="text-xs text-gray-400">3 sample vendors staged</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Vendor Name</th>
                <th className="py-3 px-4 font-semibold">Company Entity</th>
                <th className="py-3 px-4 font-semibold">Payment Terms</th>
                <th className="py-3 px-4 font-semibold">Reliability Index</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
              <tr>
                <td className="py-3.5 px-4 font-medium text-gray-900 dark:text-white">Nordic Freight Corp.</td>
                <td className="py-3.5 px-4">CashPredix Global LLC</td>
                <td className="py-3.5 px-4">Net 30</td>
                <td className="py-3.5 px-4 text-amber-500 font-semibold">56.0% (Delays Frequent)</td>
                <td className="py-3.5 px-4"><span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Active</span></td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium text-gray-900 dark:text-white">Acme Cloud Logistics</td>
                <td className="py-3.5 px-4">CashPredix Global LLC</td>
                <td className="py-3.5 px-4">Net 15</td>
                <td className="py-3.5 px-4 text-emerald-500 font-semibold">88.5% (Consistent)</td>
                <td className="py-3.5 px-4"><span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Active</span></td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium text-gray-900 dark:text-white">Global Semiconductor Ltd.</td>
                <td className="py-3.5 px-4">CashPredix Global LLC</td>
                <td className="py-3.5 px-4">Net 45</td>
                <td className="py-3.5 px-4 text-emerald-500 font-semibold">97.0% (Benchmark)</td>
                <td className="py-3.5 px-4"><span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Active</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
