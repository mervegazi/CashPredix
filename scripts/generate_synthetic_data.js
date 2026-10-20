#!/usr/bin/env node
/**
 * CashPredix - Synthetic Data Generation Script (Node.js)
 * Week 3: Task #42 - Programmatic generation of realistic company profiles and vendor records.
 *
 * Schema Compatibility:
 *   companies (id, user_id, name, industry, created_at)
 *   vendors (id, company_id, name, payment_terms, created_at)
 *
 * Usage:
 *   node scripts/generate_synthetic_data.js --companies 10 --vendors 100 --format both
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INDUSTRIES = [
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

const COMPANY_PREFIXES = [
  'Apex', 'Nexus', 'Vertex', 'Vanguard', 'Horizon', 'Pinnacle', 'Acro', 'Pulse',
  'Quantum', 'Starlight', 'Meridian', 'Solas', 'Omni', 'Crestview', 'Astra',
  'Strata', 'Synergy', 'Beacon', 'Cobalt', 'Ironclad', 'Summit', 'Velox', 'Integra',
  'Hyperion', 'Kore', 'Atlas', 'Novus', 'Terra', 'Zephyr', 'Aegis', 'Centurion',
];

const COMPANY_MIDDLES = [
  'Dynamics', 'Technologies', 'Logistics', 'Ventures', 'Systems', 'Solutions',
  'Industries', 'Analytics', 'Networks', 'Capital', 'Holdings', 'Innovations',
  'Robotics', 'Global', 'Supply', 'Health', 'Energy', 'Digital', 'BioTech', 'Partners',
];

const COMPANY_SUFFIXES = [
  'Inc.', 'Corp.', 'LLC', 'Group', 'Enterprises', 'International', 'GmbH', 'Limited',
];

const VENDOR_CATEGORIES = {
  'Cloud & Infrastructure': {
    prefixes: ['CloudScale', 'DataWeave', 'ByteStream', 'ServerGrid', 'NetCore', 'InfraVault', 'LatencyLess'],
    middles: ['Hosting', 'Compute', 'Cloud', 'Data Systems', 'DevOps', 'Networks'],
    terms_bias: ['Net 30', 'Net 15', 'Due on Receipt'],
  },
  'Logistics & Shipping': {
    prefixes: ['GlobalFreight', 'SwiftHaul', 'NordicCargo', 'SeaBridge', 'InterstateExpress', 'AtlasTrans', 'PrimeRoute'],
    middles: ['Logistics', 'Freight', 'Courier', 'Carriers', 'Transport', 'Supply Chain'],
    terms_bias: ['Net 30', 'Net 45', 'Net 60'],
  },
  'Hardware & Electronics': {
    prefixes: ['SiliconEdge', 'MicroChip', 'PrecisionTech', 'CircuitWorks', 'OptiSensor', 'NanoLogic'],
    middles: ['Components', 'Hardware', 'Semiconductors', 'Devices', 'Electronics'],
    terms_bias: ['Net 30', 'Net 60', '2/10 Net 30'],
  },
  'Raw Materials & Manufacturing': {
    prefixes: ['TitanAlloy', 'ApexPolymer', 'VulcanMetals', 'CoreTimber', 'PureChem', 'PolyMatrix'],
    middles: ['Materials', 'Refineries', 'Smelting', 'Polymers', 'Industries', 'Foundry'],
    terms_bias: ['Net 60', 'Net 90', 'Net 45'],
  },
  'Legal & Professional Services': {
    prefixes: ['Sterling & Associates', 'Vanguard Advisory', 'Blackwood Legal', 'Apex Compliance', 'AuditCore', 'Kroll'],
    middles: ['Consulting', 'Partners', 'Legal Group', 'Auditors', 'Risk Advisors'],
    terms_bias: ['Net 30', 'Due on Receipt', 'Net 15'],
  },
  'Marketing & Creative Media': {
    prefixes: ['PixelCraft', 'VividReach', 'OmniMarketing', 'AdVantage', 'PrismMedia', 'BrandVelocity'],
    middles: ['Media', 'Agency', 'Interactive', 'Digital Labs', 'Creative'],
    terms_bias: ['Net 30', 'Net 15', '2/10 Net 30'],
  },
  'Facilities & Office Maintenance': {
    prefixes: ['EnviroClean', 'SafeGuard Security', 'MetroPower', 'Apex HVAC', 'EcoWaste', 'ProFacility'],
    middles: ['Services', 'Solutions', 'Operations', 'Maintenance', 'Management'],
    terms_bias: ['Net 30', 'Net 15', 'Net 45'],
  },
};

const PAYMENT_TERMS_ALL = [
  'Due on Receipt',
  'Net 15',
  'Net 30',
  'Net 45',
  'Net 60',
  'Net 90',
  '2/10 Net 30',
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateCompanyName(existingNames) {
  for (let i = 0; i < 500; i++) {
    const name = `${pickRandom(COMPANY_PREFIXES)} ${pickRandom(COMPANY_MIDDLES)} ${pickRandom(COMPANY_SUFFIXES)}`;
    if (!existingNames.has(name)) {
      existingNames.add(name);
      return name;
    }
  }
  const fallback = `${pickRandom(COMPANY_PREFIXES)} Solutions ${Math.floor(Math.random() * 900 + 100)} ${pickRandom(COMPANY_SUFFIXES)}`;
  existingNames.add(fallback);
  return fallback;
}

function generateVendorName(category, existingNames) {
  const catData = VENDOR_CATEGORIES[category] || Object.values(VENDOR_CATEGORIES)[0];
  const suffixes = ['Inc.', 'Corp.', 'LLC', 'Ltd.', 'GmbH', 'Co.'];
  for (let i = 0; i < 200; i++) {
    const name = `${pickRandom(catData.prefixes)} ${pickRandom(catData.middles)} ${pickRandom(suffixes)}`;
    if (!existingNames.has(name)) {
      existingNames.add(name);
      return name;
    }
  }
  const fallback = `${pickRandom(catData.prefixes)} ${pickRandom(catData.middles)} ${Math.floor(Math.random() * 9000 + 1000)} ${pickRandom(suffixes)}`;
  existingNames.add(fallback);
  return fallback;
}

export const CANONICAL_FOUR_COMPANIES = [
  {
    name: 'CashPredix Technologies Inc.',
    industry: 'Technology & SaaS',
    vendorCount: 160,
    isFlagship: true,
    specializedPrefixes: [
      'AWS Cloud', 'Azure Infra', 'Google Cloud', 'Snowflake Data', 'Datadog Observability',
      'OpenAI API', 'Anthropic AI', 'GitHub Enterprise', 'Stripe Global', 'Twilio Messaging',
      'Supabase DB', 'Vercel Edge', 'Cloudflare Security', 'MongoDB Atlas', 'Redis Enterprise',
      'SentinelOne', 'CrowdStrike', 'Elasticsearch', 'Atlassian', 'Figma Design', 'Slack Enterprise',
      'Zoom Communications', 'Confluent Kafka', 'Docker Hub', 'HashiCorp', 'Databricks Analytics',
      'PagerDuty', 'Postman Enterprise', 'Linear Systems', 'Notion Labs',
    ],
  },
  {
    name: 'Apex Horizon Logistics Corp.',
    industry: 'Logistics & Freight',
    vendorCount: 45,
    isFlagship: false,
    specializedPrefixes: [
      'Maersk Maritime', 'Swift Haulage', 'Nordic Freight', 'DHL Supply', 'FedEx Corporate',
      'Shell Commercial Fuel', 'Volvo Fleet Maintenance', 'Caterpillar Equipment', 'Kuehne+Nagel Transit',
    ],
  },
  {
    name: 'Vanguard Healthcare Systems Enterprises',
    industry: 'Healthcare & Pharmaceuticals',
    vendorCount: 40,
    isFlagship: false,
    specializedPrefixes: [
      'Pfizer BioPharmaceuticals', 'Siemens Healthineers', 'Medtronic Devices', 'Quest Diagnostics',
      'Abbott Laboratories', 'McKesson Medical Supply', 'Roche Diagnostics', 'Thermo Fisher Scientific',
    ],
  },
  {
    name: 'Quantum Capital & Financial Holdings',
    industry: 'Financial Services & FinTech',
    vendorCount: 35,
    isFlagship: false,
    specializedPrefixes: [
      'Bloomberg Financial', 'Moody\'s Risk Analytics', 'S&P Global Market', 'Refinitiv Data',
      'SWIFT Interbank', 'State Street Custody', 'FactSet Research', 'Fitch Ratings Global',
    ],
  },
];

export function generateSyntheticDataset({
  numCompanies = 4,
  vendorsPerCompany = 100,
  userId = null,
  useCanonicalFour = true,
} = {}) {
  const baseUserId = userId || crypto.randomUUID();
  const now = new Date();

  const companies = [];
  const vendors = [];
  const existingCompanyNames = new Set();
  const existingVendorNames = new Set();
  const categoryKeys = Object.keys(VENDOR_CATEGORIES);

  if (useCanonicalFour) {
    for (const compSpec of CANONICAL_FOUR_COMPANIES) {
      const companyId = crypto.randomUUID();
      const companyName = compSpec.name;
      existingCompanyNames.add(companyName);

      const daysAgo = compSpec.isFlagship ? 720 : Math.floor(Math.random() * (500 - 180)) + 180;
      const companyCreatedAt = new Date(now.getTime() - (daysAgo * 86400000 + Math.random() * 86400000)).toISOString();

      companies.push({
        id: companyId,
        user_id: baseUserId,
        name: companyName,
        industry: compSpec.industry,
        created_at: companyCreatedAt,
      });

      const companyDate = new Date(companyCreatedAt);
      const maxOffsetDays = Math.max(1, Math.floor((now.getTime() - companyDate.getTime()) / 86400000) - 10);
      const prefixesPool = compSpec.specializedPrefixes || [];

      for (let v = 0; v < compSpec.vendorCount; v++) {
        const vendorId = crypto.randomUUID();
        const category = pickRandom(categoryKeys);

        let vendorName;
        if (v < prefixesPool.length) {
          const prefix = prefixesPool[v];
          vendorName = `${prefix} ${pickRandom(['Systems', 'Technologies', 'Services', 'Corp.', 'LLC'])}`;
          existingVendorNames.add(vendorName);
        } else {
          vendorName = generateVendorName(category, existingVendorNames);
        }

        const termsBias = VENDOR_CATEGORIES[category].terms_bias;
        const paymentTerm = Math.random() < 0.75 ? pickRandom(termsBias) : pickRandom(PAYMENT_TERMS_ALL);

        const offsetDays = Math.floor(Math.random() * maxOffsetDays) + 1;
        const vendorCreatedAt = new Date(companyDate.getTime() + (offsetDays * 86400000 + Math.random() * 86400000)).toISOString();

        vendors.push({
          id: vendorId,
          company_id: companyId,
          name: vendorName,
          payment_terms: paymentTerm,
          created_at: vendorCreatedAt,
        });
      }
    }

    return {
      user_id: baseUserId,
      companies,
      vendors,
      summary: {
        total_companies: companies.length,
        total_vendors: vendors.length,
        flagship_vendors: CANONICAL_FOUR_COMPANIES[0].vendorCount,
        generated_at: now.toISOString(),
      },
    };
  }

  for (let c = 0; c < numCompanies; c++) {
    const companyId = crypto.randomUUID();
    const companyName = generateCompanyName(existingCompanyNames);
    const industry = pickRandom(INDUSTRIES);

    const daysAgo = Math.floor(Math.random() * (730 - 180)) + 180;
    const companyCreatedAt = new Date(now.getTime() - (daysAgo * 86400000 + Math.random() * 86400000)).toISOString();

    companies.push({
      id: companyId,
      user_id: baseUserId,
      name: companyName,
      industry,
      created_at: companyCreatedAt,
    });

    const companyDate = new Date(companyCreatedAt);
    const maxOffsetDays = Math.max(1, Math.floor((now.getTime() - companyDate.getTime()) / 86400000) - 10);

    for (let v = 0; v < vendorsPerCompany; v++) {
      const vendorId = crypto.randomUUID();
      const category = pickRandom(categoryKeys);
      const vendorName = generateVendorName(category, existingVendorNames);

      const termsBias = VENDOR_CATEGORIES[category].terms_bias;
      const paymentTerm = Math.random() < 0.75 ? pickRandom(termsBias) : pickRandom(PAYMENT_TERMS_ALL);

      const offsetDays = Math.floor(Math.random() * maxOffsetDays) + 1;
      const vendorCreatedAt = new Date(companyDate.getTime() + (offsetDays * 86400000 + Math.random() * 86400000)).toISOString();

      vendors.push({
        id: vendorId,
        company_id: companyId,
        name: vendorName,
        payment_terms: paymentTerm,
        created_at: vendorCreatedAt,
      });
    }
  }

  return {
    user_id: baseUserId,
    companies,
    vendors,
    summary: {
      total_companies: companies.length,
      total_vendors: vendors.length,
      vendors_per_company: vendorsPerCompany,
      generated_at: now.toISOString(),
    },
  };
}

function toCSV(records) {
  if (!records || records.length === 0) return '';
  const headers = Object.keys(records[0]);
  const rows = records.map((row) =>
    headers
      .map((header) => {
        const val = row[header] ?? '';
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      })
      .join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

// CLI Execution
if (process.argv[1] && process.argv[1].endsWith('generate_synthetic_data.js')) {
  const args = process.argv.slice(2);
  let numCompanies = 10;
  let vendorsPerCompany = 100;
  let outputDir = 'data/synthetic';
  let format = 'both';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--companies' && args[i + 1]) numCompanies = parseInt(args[++i], 10);
    else if ((args[i] === '--vendors' || args[i] === '--vendors-per-company') && args[i + 1]) {
      vendorsPerCompany = parseInt(args[++i], 10);
    } else if (args[i] === '--output-dir' && args[i + 1]) outputDir = args[++i];
    else if (args[i] === '--format' && args[i + 1]) format = args[++i];
  }

  const resolvedOutputDir = path.resolve(process.cwd(), outputDir);
  fs.mkdirSync(resolvedOutputDir, { recursive: true });

  console.log('='.repeat(60));
  console.log(' CashPredix - Node.js Synthetic Data Generator (Week 3 / #42)');
  console.log('='.repeat(60));
  console.log(` Target Companies:         ${numCompanies}`);
  console.log(` Target Vendors / Company: ${vendorsPerCompany}`);
  console.log(` Total Vendors to Create:  ${numCompanies * vendorsPerCompany}`);
  console.log(` Output Directory:         ${resolvedOutputDir}`);
  console.log('='.repeat(60));

  const dataset = generateSyntheticDataset({ numCompanies, vendorsPerCompany });

  if (format === 'json' || format === 'both') {
    fs.writeFileSync(path.join(resolvedOutputDir, 'companies.json'), JSON.stringify(dataset.companies, null, 2));
    fs.writeFileSync(path.join(resolvedOutputDir, 'vendors.json'), JSON.stringify(dataset.vendors, null, 2));
    fs.writeFileSync(path.join(resolvedOutputDir, 'synthetic_dataset_bundle.json'), JSON.stringify(dataset, null, 2));
    console.log('[✓] Successfully generated JSON datasets.');
  }

  if (format === 'csv' || format === 'both') {
    fs.writeFileSync(path.join(resolvedOutputDir, 'companies.csv'), toCSV(dataset.companies));
    fs.writeFileSync(path.join(resolvedOutputDir, 'vendors.csv'), toCSV(dataset.vendors));
    console.log('[✓] Successfully generated CSV datasets.');
  }

  console.log('='.repeat(60));
  console.log(`[SUCCESS] Generated ${dataset.companies.length} companies and ${dataset.vendors.length} vendors!`);
  console.log('='.repeat(60));
}
