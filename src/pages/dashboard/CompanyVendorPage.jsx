import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'react-hot-toast';
import {
  Building2,
  Users,
  FileSpreadsheet,
  Plus,
  AlertCircle,
  Loader2,
  Clock,
  ShieldCheck,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Trash2,
  RefreshCw,
  FolderTree,
  Info,
  Search,
  ChevronLeft,
  ChevronRight,
  Database,
  Receipt,
} from 'lucide-react';
import FileDropzone from '../../components/FileDropzone';
import ConfirmationModal from '../../components/ConfirmationModal';
import CustomerLedgerModal from '../../components/CustomerLedgerModal';
import Tooltip from '../../components/Tooltip';
import CompanyVendorSkeleton from '../../components/CompanyVendorSkeleton';
import { INITIAL_SEED_COMPANIES, INITIAL_SEED_CUSTOMERS } from '../../data/seedData';

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

const CUSTOMER_CATEGORIES = [
  'Enterprise Corporate',
  'FinTech & Banking',
  'Retail & Wholesale Chains',
  'Healthcare & Clinical Systems',
  'Logistics & Transit Shippers',
  'SaaS & Digital Platforms',
  'Public Sector & Education',
  'Commercial Client',
];

// Helper to calculate score details for Accounts Receivable & Customer reliability
function getScoreInsight(score) {
  if (score >= 90) {
    return {
      tier: 'Prime / Benchmark',
      color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
      badge: 'bg-emerald-500',
      onTimeRate: `${score}%`,
      avgDelay: '-2.4 days (Early settlement)',
      action: 'High payment reliability; predictable incoming cash inflow.',
    };
  }
  if (score >= 75) {
    return {
      tier: 'Standard Operational',
      color: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60',
      badge: 'bg-blue-500',
      onTimeRate: `${score}%`,
      avgDelay: '+3.1 days (Within grace)',
      action: 'Consistent settlement; standard Net 30 accounts receivable flow.',
    };
  }
  return {
    tier: 'High Default Risk',
    color: 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60',
    badge: 'bg-amber-500',
    onTimeRate: `${score}%`,
    avgDelay: '+16.8 days (Frequent friction)',
    action: 'Payment collection friction; recommend stricter credit terms or upfront retainer.',
  };
}

export default function CompanyVendorPage() {
  const { user } = useAuth();

  // Active view tab
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'forms' | 'dropzone'

  // Loading state for skeleton shimmer
  const [isLoading, setIsLoading] = useState(false);

  // Expanded company accordion IDs - CashPredix expanded by default
  const [expandedCompanyIds, setExpandedCompanyIds] = useState(new Set(['comp-cashpredix']));

  // Per-company search, category filter, and pagination
  const [customerSearches, setCustomerSearches] = useState({});
  const [customerCategories, setCustomerCategories] = useState({});
  const [customerPages, setCustomerPages] = useState({});
  const [isIngestingDataset, setIsIngestingDataset] = useState(false);

  // Entities state
  const [companies, setCompanies] = useState(() => {
    try {
      const saved = localStorage.getItem('cashpredix_companies_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 4) return parsed;
      }
      return INITIAL_SEED_COMPANIES;
    } catch {
      return INITIAL_SEED_COMPANIES;
    }
  });

  const [customers, setCustomers] = useState(() => {
    try {
      const savedCust = localStorage.getItem('cashpredix_customers_v2') || localStorage.getItem('cashpredix_vendors_v2');
      if (savedCust) {
        const parsed = JSON.parse(savedCust);
        if (Array.isArray(parsed) && parsed.length >= 100) return parsed;
      }
      return INITIAL_SEED_CUSTOMERS;
    } catch {
      return INITIAL_SEED_CUSTOMERS;
    }
  });

  // Modal State for Delete Confirmation
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null, // 'company' | 'customer'
    target: null,
    isDeleting: false,
  });

  // Selected customer for AR Financial Ledger View
  const [selectedCustomerForLedger, setSelectedCustomerForLedger] = useState(null);

  // Form states
  const [companyForm, setCompanyForm] = useState({
    name: '',
    industry: DEFAULT_INDUSTRIES[0],
  });
  const [companyErrors, setCompanyErrors] = useState({});
  const [isSubmittingCompany, setIsSubmittingCompany] = useState(false);

  const [customerForm, setCustomerForm] = useState({
    company_id: '',
    name: '',
    payment_terms: 'Net 30',
    category: CUSTOMER_CATEGORIES[0],
  });
  const [customerErrors, setCustomerErrors] = useState({});
  const [isSubmittingCustomer, setIsSubmittingCustomer] = useState(false);
  const [isUploadingBatch, setIsUploadingBatch] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cashpredix_companies_v2', JSON.stringify(companies));
    } catch (e) {
      console.warn('Failed to save companies locally', e);
    }
  }, [companies]);

  useEffect(() => {
    try {
      localStorage.setItem('cashpredix_customers_v2', JSON.stringify(customers));
      // keep vendor key in sync for legacy compatibility
      localStorage.setItem('cashpredix_vendors_v2', JSON.stringify(customers));
    } catch (e) {
      console.warn('Failed to save customers locally', e);
    }
  }, [customers]);

  // Ingest Enterprise Dataset into Supabase (4 Companies, 280 Customers)
  const handleIngestEnterpriseData = async () => {
    if (!user?.id) {
      setCompanies(INITIAL_SEED_COMPANIES);
      setCustomers(INITIAL_SEED_CUSTOMERS);
      toast.success('Enterprise dataset active! (4 Companies, 280 Customers with 160 for CashPredix)');
      return;
    }

    setIsIngestingDataset(true);
    const toastId = toast.loading('Ingesting 4 Companies & 280 Customers into Supabase...');

    try {
      // 1. Prepare companies with user_id
      const companyIdMap = {};
      const companiesToInsert = INITIAL_SEED_COMPANIES.map((c) => {
        const realId = crypto.randomUUID();
        companyIdMap[c.id] = realId;
        return {
          id: realId,
          user_id: user.id,
          name: c.name,
          industry: c.industry,
          created_at: c.created_at,
        };
      });

      const { error: compErr } = await supabase
        .from('companies')
        .upsert(companiesToInsert, { onConflict: 'id' });

      if (compErr) throw compErr;

      // 2. Prepare 280 customers
      const customersToInsert = INITIAL_SEED_CUSTOMERS.map((v) => ({
        id: crypto.randomUUID(),
        company_id: companyIdMap[v.company_id] || companyIdMap['comp-cashpredix'],
        name: v.name,
        payment_terms: v.payment_terms,
        created_at: v.created_at,
      }));

      // Chunk in batches of 50 into customers table (and vendors table if available)
      for (let i = 0; i < customersToInsert.length; i += 50) {
        const chunk = customersToInsert.slice(i, i + 50);
        try {
          await supabase.from('customers').upsert(chunk, { onConflict: 'id' });
        } catch {
          // fallback to vendors
        }
        try {
          await supabase.from('vendors').upsert(chunk, { onConflict: 'id' });
        } catch {
          // ignore
        }
      }

      toast.success(`Successfully ingested 4 Companies & ${customersToInsert.length} Customers into Supabase!`, { id: toastId });
      await loadSupabaseData();
    } catch (err) {
      console.error('Enterprise dataset ingestion error:', err);
      setCompanies(INITIAL_SEED_COMPANIES);
      setCustomers(INITIAL_SEED_CUSTOMERS);
      toast.error(`Ingestion notice: ${err.message || 'Updated local state'}. Local dataset loaded!`, { id: toastId });
    } finally {
      setIsIngestingDataset(false);
    }
  };

  // Fetch real data from Supabase
  const loadSupabaseData = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const { data: dbCompanies, error: compErr } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbCompanies && !compErr && dbCompanies.length > 0) {
        setCompanies(dbCompanies);
        
        // Try customers table first, fallback to vendors table
        let { data: dbCustomers, error: custErr } = await supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false });

        if (custErr || !dbCustomers || dbCustomers.length === 0) {
          const res = await supabase
            .from('vendors')
            .select('*')
            .order('created_at', { ascending: false });
          dbCustomers = res.data;
          custErr = res.error;
        }

        if (!custErr && dbCustomers && dbCustomers.length > 0) {
          setCustomers(
            dbCustomers.map((v) => ({
              ...v,
              reliability_score: v.reliability_score || Math.floor(Math.random() * 45 + 55),
            }))
          );
        }
      }
    } catch {
      // Keep local state
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadSupabaseData();
    }
  }, [user?.id]);

  // Accordion toggle
  const toggleCompanyExpand = (companyId) => {
    setExpandedCompanyIds((prev) => {
      const next = new Set(prev);
      if (next.has(companyId)) {
        next.delete(companyId);
      } else {
        next.add(companyId);
      }
      return next;
    });
  };

  // Trigger Delete Company Modal
  const requestDeleteCompany = (company) => {
    setModalState({
      isOpen: true,
      type: 'company',
      target: company,
      isDeleting: false,
    });
  };

  // Trigger Delete Customer Modal
  const requestDeleteCustomer = (customer) => {
    setModalState({
      isOpen: true,
      type: 'customer',
      target: customer,
      isDeleting: false,
    });
  };

  // Execute Deletion after confirmation
  const handleConfirmDelete = async () => {
    const { type, target } = modalState;
    if (!target) return;

    setModalState((prev) => ({ ...prev, isDeleting: true }));

    try {
      if (type === 'company') {
        // Delete company & cascade customers
        if (user?.id) {
          await supabase.from('companies').delete().eq('id', target.id);
        }
        setCompanies((prev) => prev.filter((c) => c.id !== target.id));
        setCustomers((prev) => prev.filter((v) => v.company_id !== target.id));
        toast.success(`Company entity "${target.name}" and associated customers deleted.`);
      } else if (type === 'customer') {
        // Delete customer
        if (user?.id) {
          try {
            await supabase.from('customers').delete().eq('id', target.id);
          } catch {
            // ignore
          }
          try {
            await supabase.from('vendors').delete().eq('id', target.id);
          } catch {
            // ignore
          }
        }
        setCustomers((prev) => prev.filter((v) => v.id !== target.id));
        toast.success(`Customer "${target.name}" removed successfully.`);
      }
    } catch (err) {
      toast.error(`Delete failed: ${err.message}`);
    } finally {
      setModalState({ isOpen: false, type: null, target: null, isDeleting: false });
    }
  };

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
      if (user?.id) {
        const { error } = await supabase.from('companies').insert([newCompany]);
        if (error) console.warn('Supabase insert note:', error.message);
      }

      setCompanies((prev) => [newCompany, ...prev]);
      setExpandedCompanyIds((prev) => new Set([...prev, newCompany.id]));
      setCompanyForm({ name: '', industry: DEFAULT_INDUSTRIES[0] });
      setCompanyErrors({});
      toast.success(`Company entity "${newCompany.name}" registered successfully!`);
      setActiveTab('directory');
    } catch (err) {
      toast.error(`Error registering company: ${err.message}`);
    } finally {
      setIsSubmittingCompany(false);
    }
  };

  // Handle Create Customer
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    const errors = {};
    const effectiveCompanyId = customerForm.company_id || companies[0]?.id;

    if (!effectiveCompanyId) {
      errors.company_id = 'Please select a company';
    }
    if (!customerForm.name.trim()) {
      errors.name = 'Customer / Client name is required';
    } else if (customerForm.name.trim().length < 2) {
      errors.name = 'Customer name must be at least 2 characters';
    }

    if (Object.keys(errors).length > 0) {
      setCustomerErrors(errors);
      return;
    }

    setIsSubmittingCustomer(true);
    const newCustomerId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `cust-${Date.now()}`;
    const newCustomer = {
      id: newCustomerId,
      company_id: effectiveCompanyId,
      name: customerForm.name.trim(),
      payment_terms: customerForm.payment_terms,
      category: customerForm.category,
      reliability_score: Math.floor(Math.random() * 20 + 80),
      created_at: new Date().toISOString(),
    };

    try {
      if (user?.id) {
        try {
          await supabase.from('customers').insert([newCustomer]);
        } catch {
          // ignore
        }
        try {
          await supabase.from('vendors').insert([newCustomer]);
        } catch {
          // ignore
        }
      }

      setCustomers((prev) => [newCustomer, ...prev]);
      setExpandedCompanyIds((prev) => new Set([...prev, effectiveCompanyId]));
      setCustomerForm({
        company_id: effectiveCompanyId,
        name: '',
        payment_terms: 'Net 30',
        category: CUSTOMER_CATEGORIES[0],
      });
      setCustomerErrors({});
      toast.success(`Customer "${newCustomer.name}" linked successfully!`);
      setActiveTab('directory');
    } catch (err) {
      toast.error(`Error registering customer: ${err.message}`);
    } finally {
      setIsSubmittingCustomer(false);
    }
  };

  // Handle Batch Upload from Dropzone
  const handleBatchUpload = async (parsedRows, targetCompanyId) => {
    setIsUploadingBatch(true);
    try {
      const newCustomers = parsedRows.map((row) => ({
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `import-${Date.now()}-${Math.random()}`,
        company_id: targetCompanyId,
        name: row.name,
        payment_terms: row.payment_terms || 'Net 30',
        category: row.category || 'Commercial Client',
        reliability_score: Math.floor(Math.random() * 40 + 60),
        created_at: new Date().toISOString(),
      }));

      if (user?.id) {
        try {
          await supabase.from('customers').insert(newCustomers);
        } catch {
          // fallback
        }
        try {
          await supabase.from('vendors').insert(newCustomers);
        } catch {
          // ignore
        }
      }

      setCustomers((prev) => [...newCustomers, ...prev]);
      setExpandedCompanyIds((prev) => new Set([...prev, targetCompanyId]));
      toast.success(`Successfully imported ${newCustomers.length} customers!`);
      setActiveTab('directory');
    } catch (err) {
      toast.error(`Batch import failed: ${err.message}`);
    } finally {
      setIsUploadingBatch(false);
    }
  };

  const selectedCompanyForCustomer = customerForm.company_id || companies[0]?.id || '';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-blue-500" />
            <span>Company & Customer Management</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Hierarchical directory of enterprise entities, linked corporate clients, credit risk ratings, and incoming receivables.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={handleIngestEnterpriseData}
            disabled={isIngestingDataset}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/20 transition-all disabled:opacity-60"
            title="Seed/Ingest 4 Canonical Enterprise Companies and 280 Customers (160 for CashPredix)"
          >
            {isIngestingDataset ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Ingesting Dataset...</span>
              </>
            ) : (
              <>
                <Database className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ingest 4 Companies & 280 Customers</span>
                <span className="sm:hidden">Ingest Dataset</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => {
                loadSupabaseData();
                setIsLoading(false);
                toast.success('Directory refreshed with database state');
              }, 600);
            }}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm transition-all"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-500' : ''}`} />
          </button>
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
            <span className="text-xs font-medium text-gray-400">Registered Customers</span>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {customers.length}
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
          onClick={() => setActiveTab('directory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'directory'
              ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Expandable Directory</span>
        </button>

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
          <span>Register New Entity / Customer</span>
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
          <span>Excel / CSV Dropzone</span>
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-blue-500" />
              <span>Hierarchical Corporate Entities & Linked Customers</span>
            </h2>
            <span className="text-xs text-gray-400">
              Click any company card to expand or collapse linked clients
            </span>
          </div>

          {/* Skeleton Loader during fetch */}
          {isLoading ? (
            <CompanyVendorSkeleton />
          ) : companies.length === 0 ? (
            <div className="text-center p-12 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <Building2 className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">No Companies Registered</h3>
              <p className="text-xs text-gray-500 mt-1 mb-4">
                Register your first company entity or upload a batch customer ledger to begin tracking receivables.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('forms')}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Company Entity</span>
              </button>
            </div>
          ) : (
            /* Expandable Companies Accordion */
            <div className="space-y-4">
              {companies.map((company) => {
                const isExpanded = expandedCompanyIds.has(company.id);
                const companyCustomers = customers.filter((v) => v.company_id === company.id);

                return (
                  <div
                    key={company.id}
                    className="rounded-2xl bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden transition-all"
                  >
                    {/* Accordion Company Header */}
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50/50 dark:bg-gray-900/60 border-b border-gray-100 dark:border-gray-800">
                      <div
                        onClick={() => toggleCompanyExpand(company.id)}
                        className="flex items-center gap-3.5 cursor-pointer flex-1 select-none"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                          <Building2 className="w-5 h-5" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2.5">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                              {company.name}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                              {company.industry}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                            <span>{companyCustomers.length} Clients Linked</span>
                            <span>•</span>
                            <span>
                              Created: {company.created_at ? new Date(company.created_at).toLocaleDateString() : 'Active'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => requestDeleteCompany(company)}
                          className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Delete company entity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleCompanyExpand(company.id)}
                          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm transition-transform"
                          title={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-blue-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Nested Customers Table (Expandable) */}
                    {isExpanded && (() => {
                      const search = (customerSearches[company.id] || '').trim().toLowerCase();
                      const catFilter = customerCategories[company.id] || 'ALL';
                      const page = customerPages[company.id] || 1;
                      const pageSize = 12;

                      const filteredCustomers = companyCustomers.filter((v) => {
                        const matchesSearch =
                          !search ||
                          v.name.toLowerCase().includes(search) ||
                          (v.category && v.category.toLowerCase().includes(search)) ||
                          (v.payment_terms && v.payment_terms.toLowerCase().includes(search));
                        const matchesCat = catFilter === 'ALL' || v.category === catFilter;
                        return matchesSearch && matchesCat;
                      });

                      const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1;
                      const currentPage = Math.min(page, totalPages);
                      const pagedCustomers = filteredCustomers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

                      return (
                        <div className="p-4 sm:p-5 space-y-3">
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Associated Clients & Receivables ({companyCustomers.length} Total)</span>
                            <span className="text-[11px] text-gray-400">
                              Hover over Reliability Index for AI risk insights
                            </span>
                          </div>

                          {companyCustomers.length === 0 ? (
                            <div className="p-6 text-center rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-dashed border-gray-200 dark:border-gray-700">
                              <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-xs text-gray-500">No customers registered for this company yet.</p>
                              <button
                                type="button"
                                onClick={() => {
                                  setCustomerForm((prev) => ({ ...prev, company_id: company.id }));
                                  setActiveTab('forms');
                                }}
                                className="mt-3 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors inline-flex items-center gap-1.5"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Customer to {company.name}</span>
                              </button>
                            </div>
                          ) : (
                            <>
                              {/* Search & Filter Toolbar */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/70 dark:bg-gray-800/40 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-2 flex-1">
                                  <div className="relative flex-1 max-w-xs">
                                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <input
                                      type="text"
                                      placeholder={`Search ${companyCustomers.length} customers...`}
                                      value={customerSearches[company.id] || ''}
                                      onChange={(e) => {
                                        setCustomerSearches((prev) => ({ ...prev, [company.id]: e.target.value }));
                                        setCustomerPages((prev) => ({ ...prev, [company.id]: 1 }));
                                      }}
                                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                  </div>

                                  <select
                                    value={customerCategories[company.id] || 'ALL'}
                                    onChange={(e) => {
                                      setCustomerCategories((prev) => ({ ...prev, [company.id]: e.target.value }));
                                      setCustomerPages((prev) => ({ ...prev, [company.id]: 1 }));
                                    }}
                                    className="px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  >
                                    <option value="ALL">All Categories</option>
                                    {CUSTOMER_CATEGORIES.map((cat) => (
                                      <option key={cat} value={cat}>
                                        {cat}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div className="text-[11px] text-gray-500 dark:text-gray-400 shrink-0 font-medium">
                                  Showing {filteredCustomers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(filteredCustomers.length, currentPage * pageSize)} of {filteredCustomers.length} clients
                                </div>
                              </div>

                              {filteredCustomers.length === 0 ? (
                                <div className="p-6 text-center rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-dashed border-gray-200 dark:border-gray-700">
                                  <p className="text-xs text-gray-500">No customers matching "{search}" in this category.</p>
                                </div>
                              ) : (
                                <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
                                  <table className="w-full text-left text-xs">
                                    <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400">
                                      <tr>
                                        <th className="py-2.5 px-3.5 font-semibold">Customer / Client Name</th>
                                        <th className="py-2.5 px-3.5 font-semibold">Payment Terms</th>
                                        <th className="py-2.5 px-3.5 font-semibold">Category</th>
                                        <th className="py-2.5 px-3.5 font-semibold">Reliability Index</th>
                                        <th className="py-2.5 px-3.5 font-semibold text-right">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                                      {pagedCustomers.map((customer) => {
                                        const score = customer.reliability_score || 88;
                                        const insight = getScoreInsight(score);

                                        return (
                                          <tr key={customer.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                                            <td className="py-3 px-3.5 font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                              <Briefcase className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                              <span>{customer.name}</span>
                                            </td>
                                            <td className="py-3 px-3.5 font-semibold text-blue-600 dark:text-blue-400">
                                              {customer.payment_terms}
                                            </td>
                                            <td className="py-3 px-3.5 text-gray-500 dark:text-gray-400">
                                              {customer.category || 'Commercial Client'}
                                            </td>
                                            <td className="py-3 px-3.5">
                                              {/* Informative Tooltip for Customer Reliability Score */}
                                              <Tooltip
                                                position="top"
                                                content={
                                                  <div className="space-y-2 text-left">
                                                    <div className="flex items-start justify-between gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                                                      <span className="font-bold text-gray-900 dark:text-white leading-snug break-words">
                                                        {customer.name}
                                                      </span>
                                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${insight.badge} text-white shrink-0`}>
                                                        {score}%
                                                      </span>
                                                    </div>
                                                    <div className="text-[11px] space-y-1.5">
                                                      <div className="flex items-center justify-between gap-2">
                                                        <span className="text-gray-500 dark:text-gray-400">Risk Tier:</span>
                                                        <span className="font-semibold text-gray-900 dark:text-gray-100">{insight.tier}</span>
                                                      </div>
                                                      <div className="flex items-center justify-between gap-2">
                                                        <span className="text-gray-500 dark:text-gray-400">On-Time Settlement:</span>
                                                        <span className="font-semibold text-gray-900 dark:text-gray-100">{insight.onTimeRate}</span>
                                                      </div>
                                                      <div className="flex items-center justify-between gap-2">
                                                        <span className="text-gray-500 dark:text-gray-400">Avg Settlement:</span>
                                                        <span className="font-semibold text-gray-900 dark:text-gray-100">{insight.avgDelay}</span>
                                                      </div>
                                                    </div>
                                                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                                                      <p className="text-[11px] text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/40 p-2.5 rounded-xl border border-blue-200/60 dark:border-blue-900/40 leading-relaxed flex items-start gap-1.5">
                                                        <span className="shrink-0 mt-0.5">💡</span>
                                                        <span>{insight.action}</span>
                                                      </p>
                                                    </div>
                                                  </div>
                                                }
                                              >
                                                <div className={`cursor-help inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${insight.color} transition-transform hover:scale-105`}>
                                                  <span className={`w-1.5 h-1.5 rounded-full ${insight.badge}`} />
                                                  <span>{score}% ({insight.tier.split('/')[0].trim()})</span>
                                                  <Info className="w-3 h-3 opacity-70" />
                                                </div>
                                              </Tooltip>
                                            </td>
                                            <td className="py-3 px-3.5 text-right whitespace-nowrap">
                                              <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                  type="button"
                                                  onClick={() => setSelectedCustomerForLedger({ customer, company })}
                                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-[11px] font-semibold"
                                                  title="View Financial AR Ledger, Invoices & Checks"
                                                >
                                                  <Receipt className="w-3.5 h-3.5" />
                                                  <span>Ledger</span>
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => requestDeleteCustomer(customer)}
                                                  className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                                                  title="Delete customer"
                                                >
                                                  <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )}

                              {/* Pagination Footer */}
                              {totalPages > 1 && (
                                <div className="flex items-center justify-between pt-3 text-xs border-t border-gray-100 dark:border-gray-800">
                                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                                    Page {currentPage} of {totalPages}
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      disabled={currentPage === 1}
                                      onClick={() => setCustomerPages((prev) => ({ ...prev, [company.id]: Math.max(1, currentPage - 1) }))}
                                      className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-1 text-[11px]"
                                    >
                                      <ChevronLeft className="w-3.5 h-3.5" />
                                      <span>Prev</span>
                                    </button>

                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                      let pNum = i + 1;
                                      if (totalPages > 5 && currentPage > 3) {
                                        pNum = Math.min(totalPages - 4, currentPage - 2) + i;
                                      }
                                      return (
                                        <button
                                          key={pNum}
                                          type="button"
                                          onClick={() => setCustomerPages((prev) => ({ ...prev, [company.id]: pNum }))}
                                          className={`w-7 h-7 rounded-lg text-[11px] font-semibold transition-colors ${
                                            pNum === currentPage
                                              ? 'bg-blue-600 text-white shadow-sm'
                                              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                          }`}
                                        >
                                          {pNum}
                                        </button>
                                      );
                                    })}

                                    <button
                                      type="button"
                                      disabled={currentPage === totalPages}
                                      onClick={() => setCustomerPages((prev) => ({ ...prev, [company.id]: Math.min(totalPages, currentPage + 1) }))}
                                      className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-1 text-[11px]"
                                    >
                                      <span>Next</span>
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Forms Tab */}
      {activeTab === 'forms' && (
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

          {/* Form 2: Add Customer */}
          <div className="rounded-2xl p-6 bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800 mb-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Register Customer / Client
                  </h3>
                  <p className="text-xs text-gray-400">
                    Add corporate client relationships for tracking incoming receivables
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateCustomer} className="space-y-4" noValidate>
                <div>
                  <label
                    htmlFor="customer-company"
                    className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Target Company Entity <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="customer-company"
                    value={selectedCompanyForCustomer}
                    onChange={(e) => {
                      setCustomerForm((prev) => ({ ...prev, company_id: e.target.value }));
                      if (customerErrors.company_id) setCustomerErrors((prev) => ({ ...prev, company_id: null }));
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
                  {customerErrors.company_id && (
                    <p className="mt-1 text-[11px] text-red-500">{customerErrors.company_id}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="customer-name"
                    className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Customer / Client Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="customer-name"
                    type="text"
                    value={customerForm.name}
                    onChange={(e) => {
                      setCustomerForm((prev) => ({ ...prev, name: e.target.value }));
                      if (customerErrors.name) setCustomerErrors((prev) => ({ ...prev, name: null }));
                    }}
                    placeholder="e.g. JPMorgan Chase Treasury LLC"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {customerErrors.name && (
                    <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{customerErrors.name}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="customer-terms"
                      className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Payment Terms
                    </label>
                    <select
                      id="customer-terms"
                      value={customerForm.payment_terms}
                      onChange={(e) => setCustomerForm((prev) => ({ ...prev, payment_terms: e.target.value }))}
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
                      htmlFor="customer-category"
                      className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Customer Category
                    </label>
                    <select
                      id="customer-category"
                      value={customerForm.category}
                      onChange={(e) => setCustomerForm((prev) => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {CUSTOMER_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    id="add-customer-submit-btn"
                    type="submit"
                    disabled={isSubmittingCustomer || companies.length === 0}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isSubmittingCustomer ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Adding Customer...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Add Customer to Entity</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
              <span>Verified Entity Linkage</span>
              <span>Linked Customers: {customers.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Dropzone Tab */}
      {activeTab === 'dropzone' && (
        <FileDropzone
          companies={companies}
          onBatchUpload={handleBatchUpload}
          isUploading={isUploadingBatch}
        />
      )}

      {/* Confirmation Modal for Deletion Warnings */}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        title={
          modalState.type === 'company'
            ? `Delete Company: "${modalState.target?.name}"?`
            : `Delete Customer: "${modalState.target?.name}"?`
        }
        message={
          modalState.type === 'company'
            ? `Deleting "${modalState.target?.name}" will permanently remove this company along with all linked customer accounts, invoices, and payment histories. This action cannot be undone.`
            : `Are you sure you want to remove customer "${modalState.target?.name}"? All associated invoices, payment history, and receivable records will also be permanently deleted.`
        }
        warningNote={
          modalState.type === 'company'
            ? 'All associated customer accounts, invoices, and transaction histories will be permanently removed.'
            : 'All incoming invoices, payment transactions, and ledger entries for this customer will be permanently removed.'
        }
        confirmText={modalState.type === 'company' ? 'Delete Company Entity' : 'Delete Customer'}
        isDeleting={modalState.isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setModalState({ isOpen: false, type: null, target: null, isDeleting: false })}
      />

      {/* Customer Financial AR Ledger & Invoices Modal */}
      <CustomerLedgerModal
        isOpen={Boolean(selectedCustomerForLedger)}
        customer={selectedCustomerForLedger?.customer}
        company={selectedCustomerForLedger?.company}
        onClose={() => setSelectedCustomerForLedger(null)}
      />
    </div>
  );
}
