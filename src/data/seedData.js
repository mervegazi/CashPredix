/**
 * CashPredix - Enterprise Seed Dataset (Week 3)
 * Provides 4 canonical enterprise companies and 280 realistic suppliers
 * with CashPredix Technologies Inc. holding 160+ specialized vendors.
 */

export const INITIAL_SEED_COMPANIES = [
  {
    id: 'comp-cashpredix',
    name: 'CashPredix Technologies Inc.',
    industry: 'Technology & SaaS',
    created_at: new Date(Date.now() - 720 * 86400000).toISOString(),
    description: 'Flagship enterprise fintech & AI cash-flow prediction platform holding global cloud & dev vendor contracts.',
  },
  {
    id: 'comp-apex',
    name: 'Apex Horizon Logistics Corp.',
    industry: 'Logistics & Freight',
    created_at: new Date(Date.now() - 360 * 86400000).toISOString(),
    description: 'Global multimodal freight forwarding, intermodal logistics, and warehousing operator.',
  },
  {
    id: 'comp-vanguard',
    name: 'Vanguard Healthcare Systems Enterprises',
    industry: 'Healthcare & Pharmaceuticals',
    created_at: new Date(Date.now() - 280 * 86400000).toISOString(),
    description: 'Integrated healthcare provider network, medical diagnostics, and biopharmaceutical supply management.',
  },
  {
    id: 'comp-quantum',
    name: 'Quantum Capital & Financial Holdings',
    industry: 'Financial Services & FinTech',
    created_at: new Date(Date.now() - 210 * 86400000).toISOString(),
    description: 'Institutional asset management, quantitative liquidity networks, and clearing services.',
  },
];

// Curated specialized vendor pools
const CASHPREDIX_CORE_VENDORS = [
  // Cloud & Infrastructure (18)
  { name: 'Amazon Web Services (AWS)', category: 'Cloud & Infrastructure', terms: 'Net 30', score: 98 },
  { name: 'Microsoft Azure Cloud Solutions', category: 'Cloud & Infrastructure', terms: 'Net 30', score: 97 },
  { name: 'Google Cloud Platform (GCP)', category: 'Cloud & Infrastructure', terms: 'Net 30', score: 96 },
  { name: 'Cloudflare Edge Security & CDN', category: 'Cloud & Infrastructure', terms: 'Net 15', score: 99 },
  { name: 'Snowflake Enterprise Data Warehouse', category: 'Cloud & Infrastructure', terms: 'Net 30', score: 94 },
  { name: 'Datadog Observability & APM', category: 'Cloud & Infrastructure', terms: 'Net 15', score: 95 },
  { name: 'MongoDB Atlas Distributed Database', category: 'Cloud & Infrastructure', terms: 'Net 30', score: 92 },
  { name: 'Redis Enterprise In-Memory Cache', category: 'Cloud & Infrastructure', terms: 'Net 15', score: 93 },
  { name: 'Vercel Serverless Edge Platform', category: 'Cloud & Infrastructure', terms: 'Due on Receipt', score: 97 },
  { name: 'Supabase Cloud PostgreSQL Engine', category: 'Cloud & Infrastructure', terms: 'Net 15', score: 99 },
  { name: 'Confluent Apache Kafka Cloud', category: 'Cloud & Infrastructure', terms: 'Net 30', score: 91 },
  { name: 'Elastic Cloud Enterprise Search', category: 'Cloud & Infrastructure', terms: 'Net 30', score: 89 },
  { name: 'Fastly Real-Time CDN Network', category: 'Cloud & Infrastructure', terms: 'Net 30', score: 88 },
  { name: 'DigitalOcean Enterprise Droplets', category: 'Cloud & Infrastructure', terms: 'Net 15', score: 92 },
  { name: 'HashiCorp Terraform Cloud', category: 'Cloud & Infrastructure', terms: 'Net 30', score: 94 },
  { name: 'Grafana Labs Enterprise Telemetry', category: 'Cloud & Infrastructure', terms: 'Net 30', score: 90 },
  { name: 'Akamai Global Security Services', category: 'Cloud & Infrastructure', terms: 'Net 45', score: 87 },
  { name: 'Equinix Metal Data Centers', category: 'Cloud & Infrastructure', terms: 'Net 60', score: 85 },

  // AI & Developer Platforms (16)
  { name: 'OpenAI API Commercial Services', category: 'Cloud & Infrastructure', terms: 'Net 15', score: 98 },
  { name: 'Anthropic Claude AI Platform', category: 'Cloud & Infrastructure', terms: 'Net 15', score: 96 },
  { name: 'GitHub Enterprise Suite', category: 'Cloud & Infrastructure', terms: 'Net 30', score: 99 },
  { name: 'Atlassian Jira & Confluence Cloud', category: 'Cloud & Infrastructure', terms: 'Net 30', score: 94 },
  { name: 'Slack Enterprise Grid Technologies', category: 'Cloud & Infrastructure', terms: 'Net 30', score: 95 },
  { name: 'Figma Enterprise Design Systems', category: 'Marketing & Creative Media', terms: 'Net 30', score: 93 },
  { name: 'Docker Hub Container Registries', category: 'Cloud & Infrastructure', terms: 'Net 15', score: 91 },
  { name: 'Databricks Lakehouse Analytics', category: 'Cloud & Infrastructure', terms: 'Net 30', score: 93 },
  { name: 'Postman Enterprise API Tooling', category: 'Cloud & Infrastructure', terms: 'Net 15', score: 92 },
  { name: 'PagerDuty Incident Command', category: 'Cloud & Infrastructure', terms: 'Net 15', score: 96 },
  { name: 'Linear Systems Agile Tracker', category: 'Cloud & Infrastructure', terms: 'Due on Receipt', score: 95 },
  { name: 'Notion Labs Enterprise Workspace', category: 'Facilities & Office Maintenance', terms: 'Net 15', score: 94 },
  { name: 'Weights & Biases ML Experimentation', category: 'Cloud & Infrastructure', terms: 'Net 30', score: 90 },
  { name: 'Pinecone Vector Database Enterprise', category: 'Cloud & Infrastructure', terms: 'Net 15', score: 93 },
  { name: 'Sentry Error Monitoring Platform', category: 'Cloud & Infrastructure', terms: 'Net 15', score: 96 },
  { name: 'LaunchDarkly Feature Flag Management', category: 'Cloud & Infrastructure', terms: 'Net 30', score: 91 },

  // Payments & Financial Infrastructure (12)
  { name: 'Stripe Payments & Billing API', category: 'Legal & Professional Services', terms: 'Due on Receipt', score: 99 },
  { name: 'Twilio Global Telecom & SMS', category: 'Cloud & Infrastructure', terms: 'Net 30', score: 93 },
  { name: 'Plaid Financial Account Verification', category: 'Legal & Professional Services', terms: 'Net 30', score: 91 },
  { name: 'Adyen Global Merchant Services', category: 'Legal & Professional Services', terms: 'Net 15', score: 94 },
  { name: 'Brex Corporate Expense Management', category: 'Legal & Professional Services', terms: 'Due on Receipt', score: 95 },
  { name: 'Ramp Card Operations & Treasury', category: 'Legal & Professional Services', terms: 'Due on Receipt', score: 96 },
  { name: 'Deel International Payroll Engine', category: 'Legal & Professional Services', terms: 'Net 15', score: 92 },
  { name: 'Remote.com Global Contractor Network', category: 'Legal & Professional Services', terms: 'Net 30', score: 89 },
  { name: 'Carta Equity Management Solutions', category: 'Legal & Professional Services', terms: 'Net 30', score: 94 },
  { name: 'Modern Treasury Automated ACH', category: 'Legal & Professional Services', terms: 'Net 15', score: 92 },
  { name: 'Marqeta Card Issuing Platform', category: 'Legal & Professional Services', terms: 'Net 30', score: 87 },
  { name: 'Checkr Enterprise Background Verification', category: 'Legal & Professional Services', terms: 'Net 30', score: 90 },

  // Cybersecurity & Hardware (14)
  { name: 'CrowdStrike Falcon Endpoint Security', category: 'Cloud & Infrastructure', terms: 'Net 30', score: 97 },
  { name: 'SentinelOne Autonomous AI Defense', category: 'Cloud & Infrastructure', terms: 'Net 30', score: 95 },
  { name: 'Palo Alto Networks Next-Gen Firewall', category: 'Cloud & Infrastructure', terms: 'Net 45', score: 91 },
  { name: 'Okta Identity & SSO Cloud', category: 'Cloud & Infrastructure', terms: 'Net 30', score: 96 },
  { name: 'Apple Enterprise Device Fleet', category: 'Hardware & Electronics', terms: 'Net 30', score: 98 },
  { name: 'Dell Technologies High-Compute Servers', category: 'Hardware & Electronics', terms: 'Net 45', score: 90 },
  { name: 'Cisco Systems Networking Hardware', category: 'Hardware & Electronics', terms: 'Net 60', score: 88 },
  { name: 'Yubico Hardware Security Keys', category: 'Hardware & Electronics', terms: 'Net 30', score: 95 },
  { name: '1Password Enterprise Secret Vault', category: 'Cloud & Infrastructure', terms: 'Net 15', score: 97 },
  { name: 'Qualys Cloud Vulnerability Scanner', category: 'Cloud & Infrastructure', terms: 'Net 30', score: 89 },
  { name: 'Vanta Automated SOC2 Compliance', category: 'Legal & Professional Services', terms: 'Net 30', score: 94 },
  { name: 'Drata Continuous Compliance Engine', category: 'Legal & Professional Services', terms: 'Net 30', score: 93 },
  { name: 'NVIDIA AI Accelerated Compute Enterprise', category: 'Hardware & Electronics', terms: 'Net 60', score: 91 },
  { name: 'Supermicro Server Rack Systems', category: 'Hardware & Electronics', terms: 'Net 45', score: 84 },

  // Professional Services & Legal (10)
  { name: 'Latham & Watkins Global Legal Counsel', category: 'Legal & Professional Services', terms: 'Net 30', score: 94 },
  { name: 'Ernst & Young (EY) Audit & Advisory', category: 'Legal & Professional Services', terms: 'Net 45', score: 92 },
  { name: 'Deloitte Risk & Tax Strategies', category: 'Legal & Professional Services', terms: 'Net 45', score: 90 },
  { name: 'PricewaterhouseCoopers (PwC) Assurance', category: 'Legal & Professional Services', terms: 'Net 45', score: 89 },
  { name: 'McKinsey & Company Strategy Partners', category: 'Legal & Professional Services', terms: 'Net 60', score: 88 },
  { name: 'Wilson Sonsini Goodrich Corporate Counsel', category: 'Legal & Professional Services', terms: 'Net 30', score: 93 },
  { name: 'Kroll Cyber Risk & Forensics', category: 'Legal & Professional Services', terms: 'Net 30', score: 86 },
  { name: 'Aon Commercial Risk Solutions', category: 'Legal & Professional Services', terms: 'Net 30', score: 91 },
  { name: 'Marsh McLennan Enterprise Insurance', category: 'Legal & Professional Services', terms: 'Net 45', score: 90 },
  { name: 'BDO USA Advisory & Consulting LLP', category: 'Legal & Professional Services', terms: 'Net 30', score: 87 },
];

const APEX_CORE_VENDORS = [
  { name: 'Maersk Line Maritime Shipping Corp.', category: 'Logistics & Shipping', terms: 'Net 45', score: 92 },
  { name: 'Mediterranean Shipping Company (MSC)', category: 'Logistics & Shipping', terms: 'Net 45', score: 89 },
  { name: 'DHL Global Forwarding Express', category: 'Logistics & Shipping', terms: 'Net 30', score: 94 },
  { name: 'FedEx Corporate Freight Solutions', category: 'Logistics & Shipping', terms: 'Net 30', score: 91 },
  { name: 'Kuehne + Nagel Logistics Transit', category: 'Logistics & Shipping', terms: 'Net 45', score: 90 },
  { name: 'C.H. Robinson Worldwide Freight Brokerage', category: 'Logistics & Shipping', terms: 'Net 30', score: 86 },
  { name: 'Shell Commercial Marine & Fleet Fuel', category: 'Raw Materials & Manufacturing', terms: 'Net 15', score: 95 },
  { name: 'ExxonMobil Aviation & Heavy Transport', category: 'Raw Materials & Manufacturing', terms: 'Net 30', score: 93 },
  { name: 'Volvo Trucks Fleet Service & Leasing', category: 'Hardware & Electronics', terms: 'Net 60', score: 88 },
  { name: 'Scania Heavy Transport Systems', category: 'Hardware & Electronics', terms: 'Net 60', score: 87 },
  { name: 'Caterpillar Material Handling Systems', category: 'Hardware & Electronics', terms: 'Net 45', score: 90 },
  { name: 'ProLogis Industrial Warehousing Parks', category: 'Facilities & Office Maintenance', terms: 'Net 30', score: 96 },
  { name: 'Thermo King Refrigerated Trailer Units', category: 'Hardware & Electronics', terms: 'Net 45', score: 85 },
  { name: 'BNSF Railway Intermodal Rail Lines', category: 'Logistics & Shipping', terms: 'Net 30', score: 89 },
  { name: 'Union Pacific Intermodal Freight', category: 'Logistics & Shipping', terms: 'Net 30', score: 88 },
];

const VANGUARD_CORE_VENDORS = [
  { name: 'Pfizer BioPharmaceuticals Manufacturing', category: 'Raw Materials & Manufacturing', terms: 'Net 45', score: 95 },
  { name: 'Siemens Healthineers Diagnostic Imaging', category: 'Hardware & Electronics', terms: 'Net 60', score: 93 },
  { name: 'Medtronic Surgical Devices & Implants', category: 'Hardware & Electronics', terms: 'Net 45', score: 91 },
  { name: 'Quest Diagnostics Clinical Testing Labs', category: 'Legal & Professional Services', terms: 'Net 30', score: 94 },
  { name: 'Abbott Laboratories Diagnostics Division', category: 'Raw Materials & Manufacturing', terms: 'Net 30', score: 92 },
  { name: 'McKesson Pharmaceutical Distribution', category: 'Logistics & Shipping', terms: 'Net 30', score: 96 },
  { name: 'Roche Diagnostics Global Reagents', category: 'Raw Materials & Manufacturing', terms: 'Net 45', score: 90 },
  { name: 'Thermo Fisher Scientific Laboratory Equipment', category: 'Hardware & Electronics', terms: 'Net 30', score: 94 },
  { name: 'GE HealthCare Precision Care Systems', category: 'Hardware & Electronics', terms: 'Net 60', score: 88 },
  { name: 'Cardinal Health Hospital Supply Network', category: 'Logistics & Shipping', terms: 'Net 30', score: 92 },
  { name: 'Baxter International Renal & Infusion Systems', category: 'Raw Materials & Manufacturing', terms: 'Net 45', score: 87 },
  { name: 'Stryker Orthopedic & Surgical Tech', category: 'Hardware & Electronics', terms: 'Net 60', score: 89 },
];

const QUANTUM_CORE_VENDORS = [
  { name: 'Bloomberg Financial Terminals & Enterprise Data', category: 'Cloud & Infrastructure', terms: 'Net 30', score: 98 },
  { name: 'Moody\'s Analytics Credit & Risk Models', category: 'Legal & Professional Services', terms: 'Net 30', score: 96 },
  { name: 'S&P Global Market Intelligence Feeds', category: 'Legal & Professional Services', terms: 'Net 30', score: 95 },
  { name: 'Refinitiv LSEG Real-Time Feeds', category: 'Cloud & Infrastructure', terms: 'Net 30', score: 93 },
  { name: 'SWIFT Interbank Secure Messaging Network', category: 'Cloud & Infrastructure', terms: 'Net 15', score: 99 },
  { name: 'State Street Global Custody Services', category: 'Legal & Professional Services', terms: 'Net 45', score: 94 },
  { name: 'FactSet Financial Research Systems', category: 'Cloud & Infrastructure', terms: 'Net 30', score: 92 },
  { name: 'Fitch Ratings Sovereign & Credit Analytics', category: 'Legal & Professional Services', terms: 'Net 30', score: 91 },
  { name: 'Broadridge Financial Transaction Processing', category: 'Cloud & Infrastructure', terms: 'Net 30', score: 90 },
  { name: 'Depository Trust & Clearing Corp (DTCC)', category: 'Legal & Professional Services', terms: 'Due on Receipt', score: 97 },
  { name: 'Interactive Brokers Institutional Clearing', category: 'Legal & Professional Services', terms: 'Net 15', score: 94 },
  { name: 'Morningstar Enterprise Fund Research', category: 'Legal & Professional Services', terms: 'Net 30', score: 89 },
];

// Helper to expand vendor pool programmatically up to required count
function expandVendors(baseList, targetCount, companyId, prefixPrefix) {
  const result = [];
  const termsList = ['Due on Receipt', 'Net 15', 'Net 30', 'Net 45', 'Net 60', '2/10 Net 30'];
  const categoriesList = [
    'Cloud & Infrastructure', 'Logistics & Shipping', 'Hardware & Electronics',
    'Raw Materials & Manufacturing', 'Legal & Professional Services',
    'Marketing & Creative Media', 'Facilities & Office Maintenance',
  ];

  // 1. Add base curated items first
  for (let i = 0; i < baseList.length && result.length < targetCount; i++) {
    const item = baseList[i];
    result.push({
      id: `vend-${companyId.replace('comp-', '')}-${i + 1}`,
      company_id: companyId,
      name: item.name,
      category: item.category,
      payment_terms: item.terms,
      reliability_score: item.score,
      created_at: new Date(Date.now() - (600 - i * 3) * 86400000).toISOString(),
    });
  }

  // 2. Synthesize additional unique vendors up to target count
  const genericPrefixes = [
    'Nexus', 'Vertex', 'Horizon', 'Pinnacle', 'Pulse', 'Meridian', 'Solas',
    'Omni', 'Crestview', 'Astra', 'Strata', 'Synergy', 'Beacon', 'Cobalt',
    'Ironclad', 'Summit', 'Velox', 'Integra', 'Hyperion', 'Kore', 'Atlas',
    'Novus', 'Terra', 'Zephyr', 'Aegis', 'Centurion', 'Optima', 'Vanguard',
  ];
  const genericMiddles = [
    'Dynamics', 'Systems', 'Solutions', 'Technologies', 'Networks', 'Analytics',
    'Capital', 'Services', 'Partners', 'Logistics', 'Robotics', 'Digital',
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
      id: `vend-${companyId.replace('comp-', '')}-${counter}`,
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

export function generateInitialSeedVendors() {
  const vendors = [
    // CashPredix: 160 vendors (hundreds of specialized suppliers!)
    ...expandVendors(CASHPREDIX_CORE_VENDORS, 160, 'comp-cashpredix', 'Cloud', [75, 99]),
    // Apex Horizon Logistics: 45 vendors
    ...expandVendors(APEX_CORE_VENDORS, 45, 'comp-apex', 'Logistics', [70, 96]),
    // Vanguard Healthcare Systems: 40 vendors
    ...expandVendors(VANGUARD_CORE_VENDORS, 40, 'comp-vanguard', 'Health', [68, 97]),
    // Quantum Capital: 35 vendors
    ...expandVendors(QUANTUM_CORE_VENDORS, 35, 'comp-quantum', 'Capital', [72, 98]),
  ];

  return vendors;
}

export const INITIAL_SEED_VENDORS = generateInitialSeedVendors();
