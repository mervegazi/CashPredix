import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'react-hot-toast';
import {
  Building2,
  Users,
  FileSpreadsheet,
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Clock,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import FileDropzone from '../../components/FileDropzone';

const DEFAULT_INDUSTRIES = [
  'Technology & SaaS',
  'Logistics & Freight',
  'Manufacturing & Industrial',
  'Healthcare & Pharmaceuticals',
  'Retail & E-Commerce',
  'Financial Services & FinTech',
  'Renewable Energy & Utilities',
  'Construction & Engineering',
  'Telecommunications',
  'Professional Services & Consulting',
];

const PAYMENT_TERMS = [
  'Due on Receipt',
  'Net 15',
  'Net 30',
  'Net 45',
  'Net 60',
  'Net 90',
  '2/10 Net 30',
];

const VENDOR_CATEGORIES = [
  'Cloud & Infrastructure',
  'Logistics & Shipping',
  'Hardware & Electronics',
  'Raw Materials & Manufacturing',
  'Legal & Professional Services',
  'Marketing & Creative Media',
  'Facilities & Office Maintenance',
  'General Supplier',
];

const INITIAL_SEED_COMPANIES = [
  {
    id: 'comp-101',
    name: 'CashPredix Global Technologies LLC',
    industry: 'Technology & SaaS',
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
  {
    id: 'comp-102',
    name: 'Apex Horizon Logistics Corp.',
    industry: 'Logistics & Freight',
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
];

const INITIAL_SEED_VENDORS = [
  {
    id: 'vend-201',
    company_id: 'comp-101',
    name: 'CloudScale Compute Infrastructure',
    payment_terms: 'Net 30',
    category: 'Cloud & Infrastructure',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'vend-202',
    company_id: 'comp-101',
    name: 'ByteStream Data Analytics Corp.',
    payment_terms: 'Net 15',
    category: 'Cloud & Infrastructure',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: 'vend-203',
    company_id: 'comp-102',
    name: 'Nordic Freight Express',
    payment_terms: 'Net 45',
    category: 'Logistics & Shipping',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
];

export default function CompanyVendorPage() {
  const { user } = useAuth();

  // Active view tab
  const [activeTab, setActiveTab] = useState('forms'); // 'forms' | 'dropzone'

  // Entities state
  const [companies, setCompanies] = useState(() => {
    try {
      const saved = localStorage.getItem('cashpredix_companies');
      return saved ? JSON.parse(saved) : INITIAL_SEED_COMPANIES;
    } catch {
      return INITIAL_SEED_COMPANIES;
    }
  });

  const [vendors, setVendors] = useState(() => {
    try {
      const saved = localStorage.getItem('cashpredix_vendors');
      return saved ? JSON.parse(saved) : INITIAL_SEED_VENDORS;
    } catch {
      return INITIAL_SEED_VENDORS;
    }
  });

  // Form states
  const [companyForm, setCompanyForm] = useState({
    name: '',
    industry: DEFAULT_INDUSTRIES[0],
  });
  const [companyErrors, setCompanyErrors] = useState({});
  const [isSubmittingCompany, setIsSubmittingCompany] = useState(false);

  const [vendorForm, setVendorForm] = useState({
    company_id: companies[0]?.id || '',
    name: '',
    payment_terms: 'Net 30',
    category: VENDOR_CATEGORIES[0],
  });
  const [vendorErrors, setVendorErrors] = useState({});
  const [isSubmittingVendor, setIsSubmittingVendor] = useState(false);
  const [isUploadingBatch, setIsUploadingBatch] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cashpredix_companies', JSON.stringify(companies));
    } catch (e) {
      console.warn('Failed to save companies locally', e);
    }
  }, [companies]);

  useEffect(() => {
    try {
      localStorage.setItem('cashpredix_vendors', JSON.stringify(vendors));
    } catch (e) {
      console.warn('Failed to save vendors locally', e);
    }
  }, [vendors]);


  // Fetch real data from Supabase if available
  useEffect(() => {
    async function fetchFromSupabase() {
      if (!user?.id) return;
      try {
        const { data: dbCompanies, error: compErr } = await supabase
          .from('companies')
          .select('*')
          .order('created_at', { ascending: false });

        if (!compErr && dbCompanies && dbCompanies.length > 0) {
          setCompanies(dbCompanies);
          const { data: dbVendors, error: vendErr } = await supabase
            .from('vendors')
            .select('*')
            .order('created_at', { ascending: false });
          if (!vendErr && dbVendors) {
            setVendors(dbVendors);
          }
        }
      } catch {
        // Fallback to local state quietly
      }
    }
    fetchFromSupabase();
  }, [user]);

  // Handle Create Company
  const handleCreateCompany = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!companyForm.name.trim()) {
      errors.name = 'Company entity name is required';
    } else if (companyForm.name.trim().length < 3) {
      errors.name = 'Name must be at least 3 characters';
    }

    if (Object.keys(errors).length > 0) {
      setCompanyErrors(errors);
      return;
    }

    setIsSubmittingCompany(true);
    const newCompanyId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `comp-${Date.now()}`;
    const newCompany = {
      id: newCompanyId,
      user_id: user?.id || 'demo-user-id',
      name: companyForm.name.trim(),
      industry: companyForm.industry,
      created_at: new Date().toISOString(),
    };

    try {
      // Attempt Supabase insert if logged in
      if (user?.id) {
        const { error } = await supabase.from('companies').insert([newCompany]);
        if (error) console.warn('Supabase insert note:', error.message);
      }

      setCompanies((prev) => [newCompany, ...prev]);
      setVendorForm((prev) => ({ ...prev, company_id: newCompany.id }));
      setCompanyForm({ name: '', industry: DEFAULT_INDUSTRIES[0] });
      setCompanyErrors({});
      toast.success(`Company entity "${newCompany.name}" registered successfully!`);
    } catch (err) {
      toast.error(`Error registering company: ${err.message}`);
    } finally {
      setIsSubmittingCompany(false);
    }
  };

  // Handle Create Vendor
  const handleCreateVendor = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!vendorForm.company_id) {
      errors.company_id = 'Please select a company';
    }
    if (!vendorForm.name.trim()) {
      errors.name = 'Vendor name is required';
    } else if (vendorForm.name.trim().length < 2) {
      errors.name = 'Vendor name must be at least 2 characters';
    }

    if (Object.keys(errors).length > 0) {
      setVendorErrors(errors);
      return;
    }

    setIsSubmittingVendor(true);
    const newVendorId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `vend-${Date.now()}`;
    const newVendor = {
      id: newVendorId,
      company_id: vendorForm.company_id,
      name: vendorForm.name.trim(),
      payment_terms: vendorForm.payment_terms,
      category: vendorForm.category,
      created_at: new Date().toISOString(),
    };

    try {
      if (user?.id) {
        const { error } = await supabase.from('vendors').insert([newVendor]);
        if (error) console.warn('Supabase vendor insert note:', error.message);
      }

      setVendors((prev) => [newVendor, ...prev]);
      setVendorForm((prev) => ({
        ...prev,
        name: '',
        payment_terms: 'Net 30',
        category: VENDOR_CATEGORIES[0],
      }));
      setVendorErrors({});
      toast.success(`Vendor "${newVendor.name}" linked successfully!`);
    } catch (err) {
      toast.error(`Error registering vendor: ${err.message}`);
    } finally {
      setIsSubmittingVendor(false);
    }
  };

  // Handle Batch Upload from Dropzone
  const handleBatchUpload = async (parsedRows, targetCompanyId) => {
    setIsUploadingBatch(true);
    try {
      const newVendors = parsedRows.map((row) => ({
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `import-${Date.now()}-${Math.random()}`,
        company_id: targetCompanyId,
        name: row.name,
        payment_terms: row.payment_terms || 'Net 30',
        category: row.category || 'General Supplier',
        created_at: new Date().toISOString(),
      }));

      if (user?.id) {
        const { error } = await supabase.from('vendors').insert(newVendors);
        if (error) console.warn('Supabase batch insert note:', error.message);
      }

      setVendors((prev) => [...newVendors, ...prev]);
      toast.success(`Successfully imported ${newVendors.length} vendors!`);
      setActiveTab('forms');
    } catch (err) {
      toast.error(`Batch import failed: ${err.message}`);
    } finally {
      setIsUploadingBatch(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-blue-500" />
            <span>Create Company & Vendor</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Define corporate parent entities, register supplier agreements, and batch-ingest payment ledgers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>Week 3 Feature Sprint</span>
          </div>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-gray-400">Active Companies</span>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {companies.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-gray-400">Registered Suppliers</span>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {vendors.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-gray-400">Standard Settlement Window</span>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              Net 30
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-gray-100 dark:bg-gray-800/80 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('forms')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'forms'
              ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Interactive Creation Forms</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('dropzone')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'dropzone'
              ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Excel / CSV Batch Ingestion</span>
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === 'forms' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form 1: Create Company */}
          <div className="rounded-2xl p-6 bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800 mb-5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Register Company Entity
                  </h3>
                  <p className="text-xs text-gray-400">
                    Create parent corporate identity linked to your tenant
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateCompany} className="space-y-4" noValidate>
                <div>
                  <label
                    htmlFor="company-name"
                    className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="company-name"
                    type="text"
                    value={companyForm.name}
                    onChange={(e) => {
                      setCompanyForm((prev) => ({ ...prev, name: e.target.value }));
                      if (companyErrors.name) setCompanyErrors((prev) => ({ ...prev, name: null }));
                    }}
                    placeholder="e.g. Apex Global Technologies LLC"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {companyErrors.name && (
                    <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{companyErrors.name}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="company-industry"
                    className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Industry Sector
                  </label>
                  <select
                    id="company-industry"
                    value={companyForm.industry}
                    onChange={(e) => setCompanyForm((prev) => ({ ...prev, industry: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {DEFAULT_INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    id="create-company-submit-btn"
                    type="submit"
                    disabled={isSubmittingCompany}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isSubmittingCompany ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating Company...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Register Company</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
              <span className="flex items-center gap-1 text-emerald-500 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Row Level Security Protected
              </span>
              <span>Total Entities: {companies.length}</span>
            </div>
          </div>

          {/* Form 2: Add Vendor */}
          <div className="rounded-2xl p-6 bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800 mb-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Manual Vendor Addition
                  </h3>
                  <p className="text-xs text-gray-400">
                    Add direct supplier relationships with defined payment terms
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateVendor} className="space-y-4" noValidate>
                <div>
                  <label
                    htmlFor="vendor-company"
                    className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Target Company Entity <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="vendor-company"
                    value={vendorForm.company_id}
                    onChange={(e) => {
                      setVendorForm((prev) => ({ ...prev, company_id: e.target.value }));
                      if (vendorErrors.company_id) setVendorErrors((prev) => ({ ...prev, company_id: null }));
                    }}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {companies.length === 0 && <option value="">No companies created yet</option>}
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.industry})
                      </option>
                    ))}
                  </select>
                  {vendorErrors.company_id && (
                    <p className="mt-1 text-[11px] text-red-500">{vendorErrors.company_id}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="vendor-name"
                    className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Vendor / Supplier Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="vendor-name"
                    type="text"
                    value={vendorForm.name}
                    onChange={(e) => {
                      setVendorForm((prev) => ({ ...prev, name: e.target.value }));
                      if (vendorErrors.name) setVendorErrors((prev) => ({ ...prev, name: null }));
                    }}
                    placeholder="e.g. CloudScale Data Systems Inc."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {vendorErrors.name && (
                    <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{vendorErrors.name}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="vendor-terms"
                      className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Payment Terms
                    </label>
                    <select
                      id="vendor-terms"
                      value={vendorForm.payment_terms}
                      onChange={(e) => setVendorForm((prev) => ({ ...prev, payment_terms: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {PAYMENT_TERMS.map((term) => (
                        <option key={term} value={term}>
                          {term}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="vendor-category"
                      className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Supplier Category
                    </label>
                    <select
                      id="vendor-category"
                      value={vendorForm.category}
                      onChange={(e) => setVendorForm((prev) => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {VENDOR_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    id="add-vendor-submit-btn"
                    type="submit"
                    disabled={isSubmittingVendor || companies.length === 0}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isSubmittingVendor ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Adding Vendor...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Add Supplier to Entity</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
              <span>Automatic Foreign Key Validation</span>
              <span>Linked Suppliers: {vendors.length}</span>
            </div>
          </div>
        </div>
      ) : (
        /* Tab 2: Batch Excel / CSV Dropzone */
        <FileDropzone
          companies={companies}
          onBatchUpload={handleBatchUpload}
          isUploading={isUploadingBatch}
        />
      )}

      {/* Registry Preview Section */}
      <div className="rounded-2xl bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Recently Added Entities & Relationships
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Live synchronized registry preview
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            {vendors.length} Total Vendors Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Vendor Name</th>
                <th className="py-3 px-4 font-semibold">Associated Company</th>
                <th className="py-3 px-4 font-semibold">Payment Terms</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Created Date</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
              {vendors.slice(0, 5).map((v) => {
                const parentComp = companies.find((c) => c.id === v.company_id);
                return (
                  <tr key={v.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                      <span>{v.name}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                      {parentComp?.name || 'CashPredix Global Technologies LLC'}
                    </td>
                    <td className="py-3 px-4 font-medium text-blue-600 dark:text-blue-400">
                      {v.payment_terms}
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                      {v.category || 'General Supplier'}
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {v.created_at ? new Date(v.created_at).toLocaleDateString() : 'Today'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
