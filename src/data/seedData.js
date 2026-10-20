/**
 * CashPredix - Enterprise Seed Dataset (Week 3)
 * Accounts Receivable (AR) & Customer Cash Inflow Engine
 * Provides 4 canonical enterprise companies and 280 realistic B2B corporate customers
 * with CashPredix Technologies Inc. holding 160+ specialized enterprise client accounts.
 */

export const INITIAL_SEED_COMPANIES = [
  {
    id: 'comp-cashpredix',
    name: 'CashPredix Technologies Inc.',
    industry: 'Technology & SaaS',
    created_at: new Date(Date.now() - 720 * 86400000).toISOString(),
    description: 'Flagship enterprise fintech & AI cash-flow prediction platform holding global B2B corporate SaaS client contracts.',
  },
  {
    id: 'comp-apex',
    name: 'Apex Horizon Logistics Corp.',
    industry: 'Logistics & Freight',
    created_at: new Date(Date.now() - 360 * 86400000).toISOString(),
    description: 'Global multimodal freight forwarding and supply chain operator serving multinational import/export shipping clients.',
  },
  {
    id: 'comp-vanguard',
    name: 'Vanguard Healthcare Systems Enterprises',
    industry: 'Healthcare & Pharmaceuticals',
    created_at: new Date(Date.now() - 280 * 86400000).toISOString(),
    description: 'Integrated healthcare and diagnostic networks serving hospital chains, clinical partners, and healthcare payers.',
  },
  {
    id: 'comp-quantum',
    name: 'Quantum Capital & Financial Holdings',
    industry: 'Financial Services & FinTech',
    created_at: new Date(Date.now() - 210 * 86400000).toISOString(),
    description: 'Institutional asset management and clearing network serving global hedge funds, pension funds, and asset managers.',
  },
];

// Curated specialized enterprise customer accounts
const CASHPREDIX_CORE_CUSTOMERS = [
  // Tier 1 Banking & Global Financial Institutions (18)
  { name: 'JPMorgan Chase Treasury Services', category: 'Financial & Banking', terms: 'Net 30', score: 99 },
  { name: 'Bank of America Global Commercial Banking', category: 'Financial & Banking', terms: 'Net 30', score: 98 },
  { name: 'Goldman Sachs Asset Management LP', category: 'Financial & Banking', terms: 'Net 15', score: 99 },
  { name: 'Morgan Stanley Wealth Management', category: 'Financial & Banking', terms: 'Net 30', score: 97 },
  { name: 'Citigroup Corporate Treasury Solutions', category: 'Financial & Banking', terms: 'Net 30', score: 96 },
  { name: 'Wells Fargo Commercial Capital Corp.', category: 'Financial & Banking', terms: 'Net 45', score: 93 },
  { name: 'Barclays Global Corporate Banking', category: 'Financial & Banking', terms: 'Net 30', score: 95 },
  { name: 'HSBC International Trade Finance', category: 'Financial & Banking', terms: 'Net 45', score: 94 },
  { name: 'BNP Paribas Institutional Solutions', category: 'Financial & Banking', terms: 'Net 30', score: 92 },
  { name: 'UBS Investment Bank Americas', category: 'Financial & Banking', terms: 'Net 15', score: 98 },
  { name: 'Deutsche Bank Global Transaction Banking', category: 'Financial & Banking', terms: 'Net 45', score: 89 },
  { name: 'Standard Chartered Emerging Markets', category: 'Financial & Banking', terms: 'Net 60', score: 85 },
  { name: 'Santander Commercial Bank USA', category: 'Financial & Banking', terms: 'Net 30', score: 91 },
  { name: 'Capital One Enterprise Treasury', category: 'Financial & Banking', terms: 'Net 15', score: 96 },
  { name: 'PNC Financial Services Group', category: 'Financial & Banking', terms: 'Net 30', score: 94 },
  { name: 'US Bancorp Enterprise Banking', category: 'Financial & Banking', terms: 'Net 30', score: 95 },
  { name: 'Truist Corporate & Investment Banking', category: 'Financial & Banking', terms: 'Net 45', score: 88 },
  { name: 'Silicon Valley Commercial FinTech Clients', category: 'Financial & Banking', terms: 'Net 15', score: 90 },

  // Enterprise Tech Unicorns & SaaS Platforms (16)
  { name: 'Shopify Plus Merchant Platform Corp.', category: 'Tech & SaaS Enterprise', terms: 'Due on Receipt', score: 99 },
  { name: 'Uber Technologies Global Treasury', category: 'Tech & SaaS Enterprise', terms: 'Net 15', score: 97 },
  { name: 'Airbnb Worldwide Payments Division', category: 'Tech & SaaS Enterprise', terms: 'Net 15', score: 96 },
  { name: 'DoorDash Merchant Financial Services', category: 'Tech & SaaS Enterprise', terms: 'Net 30', score: 92 },
  { name: 'Snowflake Corporate Data Ops', category: 'Tech & SaaS Enterprise', terms: 'Net 30', score: 98 },
  { name: 'Stripe Corporate Billing Partner', category: 'Tech & SaaS Enterprise', terms: 'Due on Receipt', score: 99 },
  { name: 'Block / Square Merchant Network', category: 'Tech & SaaS Enterprise', terms: 'Net 15', score: 95 },
  { name: 'Salesforce Enterprise Analytics Hub', category: 'Tech & SaaS Enterprise', terms: 'Net 30', score: 97 },
  { name: 'HubSpot Global Growth Systems', category: 'Tech & SaaS Enterprise', terms: 'Net 30', score: 94 },
  { name: 'ServiceNow Cloud Enterprise Operations', category: 'Tech & SaaS Enterprise', terms: 'Net 30', score: 96 },
  { name: 'Intuit Quickbooks Enterprise Alliance', category: 'Tech & SaaS Enterprise', terms: 'Net 15', score: 98 },
  { name: 'Workday Human Capital Systems Corp.', category: 'Tech & SaaS Enterprise', terms: 'Net 30', score: 95 },
  { name: 'Atlassian Enterprise Agile Accounts', category: 'Tech & SaaS Enterprise', terms: 'Net 30', score: 93 },
  { name: 'Zoom Communications Enterprise Video', category: 'Tech & SaaS Enterprise', terms: 'Net 15', score: 94 },
  { name: 'DocuSign Digital Agreement Cloud', category: 'Tech & SaaS Enterprise', terms: 'Net 30', score: 91 },
  { name: 'Twilio Customer Communications Group', category: 'Tech & SaaS Enterprise', terms: 'Net 30', score: 90 },

  // Global Retail & E-Commerce Conglomerates (14)
  { name: 'Walmart Global eCommerce Division', category: 'Retail & Commerce', terms: 'Net 30', score: 98 },
  { name: 'Target Corporation Retail Logistics', category: 'Retail & Commerce', terms: 'Net 30', score: 95 },
  { name: 'The Home Depot Pro Merchant Services', category: 'Retail & Commerce', terms: 'Net 45', score: 93 },
  { name: 'Costco Wholesale Corporate Membership', category: 'Retail & Commerce', terms: 'Net 15', score: 99 },
  { name: 'Best Buy Commercial Electronics Group', category: 'Retail & Commerce', terms: 'Net 30', score: 91 },
  { name: 'Lowe\'s Commercial Business Services', category: 'Retail & Commerce', terms: 'Net 45', score: 90 },
  { name: 'Wayfair B2B Commercial Interiors', category: 'Retail & Commerce', terms: 'Net 30', score: 86 },
  { name: 'eBay Enterprise Merchant Alliance', category: 'Retail & Commerce', terms: 'Net 15', score: 94 },
  { name: 'Alibaba Americas B2B Marketplace', category: 'Retail & Commerce', terms: 'Net 60', score: 84 },
  { name: 'Rakuten International Retail Network', category: 'Retail & Commerce', terms: 'Net 30', score: 89 },
  { name: 'Kroger Supermarkets Digital Treasury', category: 'Retail & Commerce', terms: 'Net 30', score: 94 },
  { name: 'Nike Direct-to-Consumer Digital Ops', category: 'Retail & Commerce', terms: 'Net 30', score: 97 },
  { name: 'LVMH Moët Hennessy Luxury Americas', category: 'Retail & Commerce', terms: 'Net 30', score: 96 },
  { name: 'Inditex / Zara Global Supply Group', category: 'Retail & Commerce', terms: 'Net 45', score: 92 },

  // Manufacturing, Industrial & Energy (12)
  { name: 'General Electric Treasury Operations', category: 'Industrial & Manufacturing', terms: 'Net 45', score: 93 },
  { name: 'Boeing Commercial Aviation Services', category: 'Industrial & Manufacturing', terms: 'Net 60', score: 88 },
  { name: 'Lockheed Martin Aeronautics Div.', category: 'Industrial & Manufacturing', terms: 'Net 30', score: 97 },
  { name: 'Caterpillar Global Equipment FinCorp', category: 'Industrial & Manufacturing', terms: 'Net 45', score: 91 },
  { name: 'Siemens Industrial Automation LLC', category: 'Industrial & Manufacturing', terms: 'Net 45', score: 94 },
  { name: '3M Global Innovation & Supply Chain', category: 'Industrial & Manufacturing', terms: 'Net 30', score: 95 },
  { name: 'Honeywell Aerospace Technologies', category: 'Industrial & Manufacturing', terms: 'Net 30', score: 92 },
  { name: 'Deere & Company Agricultural Systems', category: 'Industrial & Manufacturing', terms: 'Net 45', score: 90 },
  { name: 'Raytheon Technologies Defense Systems', category: 'Industrial & Manufacturing', terms: 'Net 30', score: 96 },
  { name: 'Chevron Corporate Liquidity Management', category: 'Industrial & Manufacturing', terms: 'Net 15', score: 98 },
  { name: 'ExxonMobil Global Upstream Accounts', category: 'Industrial & Manufacturing', terms: 'Net 30', score: 95 },
  { name: 'Dow Chemical Global Distribution Co.', category: 'Industrial & Manufacturing', terms: 'Net 60', score: 86 },

  // Healthcare, Pharma & Biotech Networks (10)
  { name: 'UnitedHealth Group Corporate Treasury', category: 'Healthcare & Pharma', terms: 'Net 30', score: 98 },
  { name: 'CVS Health Pharmacy Benefit Services', category: 'Healthcare & Pharma', terms: 'Net 30', score: 95 },
  { name: 'Johnson & Johnson Global Health Systems', category: 'Healthcare & Pharma', terms: 'Net 30', score: 97 },
  { name: 'Pfizer BioPharmaceutical Commercial Group', category: 'Healthcare & Pharma', terms: 'Net 45', score: 93 },
  { name: 'McKesson Pharmaceutical Solutions', category: 'Healthcare & Pharma', terms: 'Net 30', score: 96 },
  { name: 'Abbott Laboratories Diagnostics Network', category: 'Healthcare & Pharma', terms: 'Net 30', score: 94 },
  { name: 'Eli Lilly and Company Commercial Accounts', category: 'Healthcare & Pharma', terms: 'Net 45', score: 91 },
  { name: 'Merck & Co. Global Human Health', category: 'Healthcare & Pharma', terms: 'Net 30', score: 95 },
  { name: 'Thermo Fisher Scientific Research Hub', category: 'Healthcare & Pharma', terms: 'Net 30', score: 94 },
  { name: 'Bristol Myers Squibb Enterprise Ops', category: 'Healthcare & Pharma', terms: 'Net 45', score: 89 },
];

const APEX_CORE_CUSTOMERS = [
  { name: 'Nike Global Footwear Supply Logistics', category: 'Retail & Commerce', terms: 'Net 30', score: 97 },
  { name: 'Apple Inc. Worldwide Distribution Hub', category: 'Tech & SaaS Enterprise', terms: 'Net 15', score: 99 },
  { name: 'Samsung Electronics Americas Freight', category: 'Tech & SaaS Enterprise', terms: 'Net 30', score: 95 },
  { name: 'Tesla Motors Gigafactory Parts Transit', category: 'Industrial & Manufacturing', terms: 'Net 30', score: 93 },
  { name: 'Procter & Gamble Consumer Goods Supply', category: 'Retail & Commerce', terms: 'Net 45', score: 94 },
  { name: 'Unilever North America Transit Group', category: 'Retail & Commerce', terms: 'Net 45', score: 91 },
  { name: 'Sony Corporation Audio/Visual Freight', category: 'Tech & SaaS Enterprise', terms: 'Net 30', score: 92 },
  { name: 'Ford Motor Company Automotive Assembly', category: 'Industrial & Manufacturing', terms: 'Net 60', score: 87 },
  { name: 'General Motors Component Inbound Freight', category: 'Industrial & Manufacturing', terms: 'Net 60', score: 86 },
  { name: 'IKEA Supply AG Furniture Logistics', category: 'Retail & Commerce', terms: 'Net 45', score: 90 },
  { name: 'Adidas AG Sports Apparel Distribution', category: 'Retail & Commerce', terms: 'Net 30', score: 94 },
  { name: 'LG Electronics North America Transport', category: 'Tech & SaaS Enterprise', terms: 'Net 30', score: 89 },
  { name: 'Nestlé USA Packaged Food Transportation', category: 'Retail & Commerce', terms: 'Net 30', score: 95 },
  { name: 'PepsiCo Beverages Fleet Delivery Hub', category: 'Retail & Commerce', terms: 'Net 15', score: 96 },
  { name: 'Dell Technologies Global Hardware Freight', category: 'Tech & SaaS Enterprise', terms: 'Net 45', score: 88 },
];

const VANGUARD_CORE_CUSTOMERS = [
  { name: 'Mayo Clinic Health System Operations', category: 'Healthcare & Pharma', terms: 'Net 30', score: 99 },
  { name: 'Cleveland Clinic Foundation Network', category: 'Healthcare & Pharma', terms: 'Net 30', score: 98 },
  { name: 'Johns Hopkins Medicine Clinical Center', category: 'Healthcare & Pharma', terms: 'Net 30', score: 97 },
  { name: 'Kaiser Permanente Medical Group', category: 'Healthcare & Pharma', terms: 'Net 15', score: 99 },
  { name: 'Mount Sinai Health System New York', category: 'Healthcare & Pharma', terms: 'Net 30', score: 94 },
  { name: 'Mass General Brigham Health Alliance', category: 'Healthcare & Pharma', terms: 'Net 30', score: 95 },
  { name: 'Stanford Health Care Clinical Services', category: 'Healthcare & Pharma', terms: 'Net 15', score: 98 },
  { name: 'Cedars-Sinai Medical Center Los Angeles', category: 'Healthcare & Pharma', terms: 'Net 30', score: 96 },
  { name: 'Northwell Health Regional Hospital Group', category: 'Healthcare & Pharma', terms: 'Net 45', score: 91 },
  { name: 'UPMC Health System Western Pennsylvania', category: 'Healthcare & Pharma', terms: 'Net 45', score: 89 },
  { name: 'Geisinger Health Rural Care Network', category: 'Healthcare & Pharma', terms: 'Net 45', score: 88 },
  { name: 'MD Anderson Cancer Center Foundation', category: 'Healthcare & Pharma', terms: 'Net 30', score: 97 },
];

const QUANTUM_CORE_CUSTOMERS = [
  { name: 'BlackRock Global Investment Management', category: 'Financial & Banking', terms: 'Net 15', score: 99 },
  { name: 'Vanguard Group Institutional Equity', category: 'Financial & Banking', terms: 'Net 15', score: 99 },
  { name: 'Fidelity Investments Asset Management', category: 'Financial & Banking', terms: 'Net 15', score: 98 },
  { name: 'Citadel Securities Quantitative Liquidity', category: 'Financial & Banking', terms: 'Due on Receipt', score: 99 },
  { name: 'Bridgewater Associates Macro Trading', category: 'Financial & Banking', terms: 'Net 30', score: 96 },
  { name: 'Millennium Management Multi-Strategy', category: 'Financial & Banking', terms: 'Net 30', score: 95 },
  { name: 'Point72 Asset Management Group', category: 'Financial & Banking', terms: 'Net 30', score: 94 },
  { name: 'Two Sigma Investments Algorithmic Fund', category: 'Financial & Banking', terms: 'Net 15', score: 97 },
  { name: 'D.E. Shaw & Co. Computational Capital', category: 'Financial & Banking', terms: 'Net 15', score: 98 },
  { name: 'AQR Capital Management Systematic Fund', category: 'Financial & Banking', terms: 'Net 30', score: 91 },
  { name: 'State of California Public Employees (CalPERS)', category: 'Financial & Banking', terms: 'Net 45', score: 95 },
  { name: 'Teacher Retirement System of Texas Fund', category: 'Financial & Banking', terms: 'Net 45', score: 93 },
];

// Helper to expand customer pool programmatically up to required count
function expandCustomers(baseList, targetCount, companyId, prefixPrefix) {
  const result = [];
  const termsList = ['Due on Receipt', 'Net 15', 'Net 30', 'Net 45', 'Net 60', '2/10 Net 30'];
  const categoriesList = [
    'Financial & Banking', 'Tech & SaaS Enterprise', 'Retail & Commerce',
    'Industrial & Manufacturing', 'Healthcare & Pharma', 'Government & Education',
  ];

  // 1. Add base curated items first
  for (let i = 0; i < baseList.length && result.length < targetCount; i++) {
    const item = baseList[i];
    result.push({
      id: `cust-${companyId.replace('comp-', '')}-${i + 1}`,
      company_id: companyId,
      name: item.name,
      category: item.category,
      payment_terms: item.terms,
      reliability_score: item.score,
      created_at: new Date(Date.now() - (600 - i * 3) * 86400000).toISOString(),
    });
  }

  // 2. Synthesize additional unique customers up to target count
  const genericPrefixes = [
    'Beacon', 'Cobalt', 'Summit', 'Velox', 'Hyperion', 'Kore', 'Atlas',
    'Novus', 'Terra', 'Zephyr', 'Aegis', 'Centurion', 'Optima', 'Vanguard',
    'Apex', 'Nexus', 'Vertex', 'Horizon', 'Pinnacle', 'Pulse', 'Meridian',
    'Solas', 'Omni', 'Crestview', 'Astra', 'Strata', 'Synergy',
  ];
  const genericMiddles = [
    'Capital', 'Holdings', 'Commercial', 'Enterprises', 'Global', 'Solutions',
    'Technologies', 'Trading', 'Industries', 'Systems', 'Networks', 'Partners',
  ];
  const genericSuffixes = ['Inc.', 'Corp.', 'LLC', 'Ltd.', 'Group', 'Enterprises'];

  let counter = result.length + 1;
  while (result.length < targetCount) {
    const p = genericPrefixes[(counter * 7) % genericPrefixes.length];
    const m = genericMiddles[(counter * 11) % genericMiddles.length];
    const s = genericSuffixes[(counter * 3) % genericSuffixes.length];
    const cat = categoriesList[counter % categoriesList.length];
    const term = termsList[(counter * 5) % termsList.length];

    // Distribute score: 60% high (85-99), 25% medium (72-84), 15% volatile (52-71)
    let score;
    const mod = counter % 100;
    if (mod < 60) {
      score = 85 + (counter % 15);
    } else if (mod < 85) {
      score = 72 + (counter % 13);
    } else {
      score = 52 + (counter % 20);
    }

    result.push({
      id: `cust-${companyId.replace('comp-', '')}-${counter}`,
      company_id: companyId,
      name: `${p} ${m} ${prefixPrefix ? `${prefixPrefix} ` : ''}${s}`,
      category: cat,
      payment_terms: term,
      reliability_score: score,
      created_at: new Date(Date.now() - (450 - (counter % 350)) * 86400000).toISOString(),
    });
    counter++;
  }

  return result;
}

export function generateInitialSeedCustomers() {
  const customers = [
    // CashPredix: 160 enterprise corporate SaaS clients
    ...expandCustomers(CASHPREDIX_CORE_CUSTOMERS, 160, 'comp-cashpredix', 'Account'),
    // Apex Horizon Logistics: 45 cargo clients
    ...expandCustomers(APEX_CORE_CUSTOMERS, 45, 'comp-apex', 'Shipper'),
    // Vanguard Healthcare Systems: 40 clinical clients
    ...expandCustomers(VANGUARD_CORE_CUSTOMERS, 40, 'comp-vanguard', 'Health'),
    // Quantum Capital: 35 institutional investor clients
    ...expandCustomers(QUANTUM_CORE_CUSTOMERS, 35, 'comp-quantum', 'Fund'),
  ];

  return customers;
}

export function generateAnonymizedSeedCustomers() {
  const emptyBase = [];
  return [
    ...expandCustomers(emptyBase, 160, 'comp-cashpredix', 'Account'),
    ...expandCustomers(emptyBase, 45, 'comp-apex', 'Shipper'),
    ...expandCustomers(emptyBase, 40, 'comp-vanguard', 'Health'),
    ...expandCustomers(emptyBase, 35, 'comp-quantum', 'Fund'),
  ];
}

// 1. Authorized Enterprise Dataset (Real Bank & Corporate Counterparties)
export const CANONICAL_ENTERPRISE_COMPANIES = INITIAL_SEED_COMPANIES;
export const CANONICAL_ENTERPRISE_CUSTOMERS = generateInitialSeedCustomers();

// 2. Demo Anonymized Dataset (100% Synthetic Privacy-Preserving Counterparties)
export const DEMO_ANONYMIZED_COMPANIES = INITIAL_SEED_COMPANIES;
export const DEMO_ANONYMIZED_CUSTOMERS = generateAnonymizedSeedCustomers();

// Backward-compatible exports
export const INITIAL_SEED_CUSTOMERS = CANONICAL_ENTERPRISE_CUSTOMERS;
export const INITIAL_SEED_VENDORS = INITIAL_SEED_CUSTOMERS;

