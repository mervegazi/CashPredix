#!/usr/bin/env node
/**
 * CashPredix - Synthetic Data Generation Script (Node.js)
 * Week 3: Task #42 - Programmatic generation of realistic company profiles and customer/client records.
 * Models Inbound Cash Flow & Accounts Receivable (AR).
 *
 * Schema Compatibility:
 *   companies (id, user_id, name, industry, created_at)
 *   customers (id, company_id, name, payment_terms, created_at)
 *   vendors   (id, company_id, name, payment_terms, created_at) [backward-compatible alias]
 *
 * Usage:
 *   node scripts/generate_synthetic_data.js --companies 4 --customers-per-company 100 --format both
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

// Customer / Client Industry Categories (B2B Payers generating Cash Inflows)
const CUSTOMER_CATEGORIES = {
  'Enterprise Corporate': {
    prefixes: ['Global Holdings', 'Apex Capital', 'Pinnacle Enterprises', 'Summit Corporate', 'Matrix Global', 'Vanguard Trust'],
    middles: ['Enterprises', 'Holdings', 'Corporation', 'Global Group', 'Ventures'],
    terms_bias: ['Net 30', 'Net 45', 'Net 60'],
  },
  'FinTech & Banking': {
    prefixes: ['Horizon FinTech', 'JPMorgan Corporate', 'Goldman Institutional', 'Morgan Stanley Asset', 'Citigroup Treasury'],
    middles: ['Financial Services', 'Capital Markets', 'Wealth Solutions', 'Trading Group'],
    terms_bias: ['Net 15', 'Net 30', 'Due on Receipt'],
  },
  'Retail & Wholesale Chains': {
    prefixes: ['OmniMarket', 'PrimeRetail', 'Walmart eCommerce', 'Target Logistics', 'Costco Commercial', 'Shopify Plus'],
    middles: ['Wholesale', 'Commerce', 'Supply Alliance', 'Brands', 'Distributors'],
    terms_bias: ['Net 30', 'Net 60', '2/10 Net 30'],
  },
  'Healthcare & Clinical Systems': {
    prefixes: ['Mayo Clinical', 'Johns Hopkins Health', 'Cleveland Medical', 'Kaiser Alliance', 'Mount Sinai Network'],
    middles: ['Healthcare Network', 'Medical Centers', 'Hospital Systems', 'Clinical Labs'],
    terms_bias: ['Net 30', 'Net 45', 'Net 60'],
  },
  'Logistics & Transit Shippers': {
    prefixes: ['SwiftLogix', 'Nordic Freight', 'Atlas Transit', 'SeaBridge Cargo', 'Maersk Line Payer'],
    middles: ['Freight Transit', 'Supply Shippers', 'Carrier Services', 'Logistics Alliance'],
    terms_bias: ['Net 30', 'Net 45', 'Net 15'],
  },
  'SaaS & Digital Platforms': {
    prefixes: ['CloudPulse', 'ByteStream', 'DataWeave Labs', 'Stripe Billing', 'Uber Corporate', 'Airbnb Treasury'],
    middles: ['Technologies', 'Digital Platforms', 'Cloud Solutions', 'Software Labs'],
    terms_bias: ['Due on Receipt', 'Net 15', 'Net 30'],
  },
  'Public Sector & Education': {
    prefixes: ['State Endowment', 'Metro Municipal', 'Federal Research', 'University System', 'Civil Authority'],
    middles: ['Agency', 'District', 'Authority', 'Institute', 'Council'],
    terms_bias: ['Net 45', 'Net 60', 'Net 90'],
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

function generateCustomerName(category, existingNames) {
  const catData = CUSTOMER_CATEGORIES[category] || Object.values(CUSTOMER_CATEGORIES)[0];
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
    customerCount: 160,
    isFlagship: true,
    specializedPrefixes: [
      'JPMorgan Chase Treasury', 'Bank of America Enterprise', 'Goldman Sachs Asset', 'Morgan Stanley Wealth',
      'Citigroup Solutions', 'Wells Fargo Commercial', 'Barclays Banking', 'HSBC Trade',
      'BNP Paribas Institutional', 'UBS Americas', 'Deutsche Bank Transaction', 'Standard Chartered Markets',
      'Santander Commercial', 'Capital One Enterprise', 'PNC Financial Services', 'US Bancorp Banking',
      'Shopify Plus Merchant', 'Uber Technologies Treasury', 'Airbnb Global Payments', 'DoorDash Financial',
      'Snowflake Corporate Ops', 'Stripe Billing Partner', 'Block Square Network', 'Salesforce Analytics',
      'HubSpot Growth Systems', 'ServiceNow Cloud', 'Intuit Quickbooks', 'Workday Enterprise',
      'Walmart eCommerce', 'Target Logistics', 'Home Depot Merchant', 'Costco Wholesale Corp',
      'General Electric Treasury', 'Boeing Aviation Services', 'Lockheed Martin Systems', 'Siemens Industrial',
      'UnitedHealth Group', 'CVS Health Pharmacy', 'Johnson & Johnson Health', 'Pfizer BioPharma',
    ],
  },
  {
    name: 'Apex Horizon Logistics Corp.',
    industry: 'Logistics & Freight',
    customerCount: 45,
    isFlagship: false,
    specializedPrefixes: [
      'Nike Global Footwear Supply', 'Apple Worldwide Distribution', 'Samsung Electronics Americas',
      'Tesla Motors Gigafactory Parts', 'Procter & Gamble Consumer Goods', 'Unilever North America Transit',
      'Sony Corporation Electronics', 'Ford Motor Company Assembly', 'General Motors Components',
      'IKEA Supply AG Furniture', 'Adidas Sports Apparel', 'LG Electronics Transport',
    ],
  },
  {
    name: 'Vanguard Healthcare Systems Enterprises',
    industry: 'Healthcare & Pharmaceuticals',
    customerCount: 40,
    isFlagship: false,
    specializedPrefixes: [
      'Mayo Clinic Health System', 'Cleveland Clinic Foundation', 'Johns Hopkins Medicine Center',
      'Kaiser Permanente Medical', 'Mount Sinai Health System', 'Mass General Brigham Alliance',
      'Stanford Health Care', 'Cedars-Sinai Medical Center', 'Northwell Health Hospital Group',
      'UPMC Health System', 'MD Anderson Cancer Foundation', 'Geisinger Health Network',
    ],
  },
  {
    name: 'Quantum Capital & Financial Holdings',
    industry: 'Financial Services & FinTech',
    customerCount: 35,
    isFlagship: false,
    specializedPrefixes: [
      'BlackRock Global Investment', 'Vanguard Group Institutional', 'Fidelity Investments Asset',
      'Citadel Securities Liquidity', 'Bridgewater Associates Macro', 'Millennium Management Strategy',
      'Point72 Asset Management', 'Two Sigma Investments Fund', 'D.E. Shaw Computational Capital',
      'CalPERS Public Employees Fund', 'Texas Teacher Retirement System', 'AQR Capital Systematic',
    ],
  },
];

export function generateSyntheticDataset({
  numCompanies = 4,
  customersPerCompany = 100,
  userId = null,
  useCanonicalFour = true,
} = {}) {
  const baseUserId = userId || crypto.randomUUID();
  const now = new Date();

  const companies = [];
  const customers = [];
  const existingCompanyNames = new Set();
  const existingCustomerNames = new Set();
  const categoryKeys = Object.keys(CUSTOMER_CATEGORIES);

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

      for (let v = 0; v < compSpec.customerCount; v++) {
        const customerId = crypto.randomUUID();
        const category = pickRandom(categoryKeys);

        let customerName;
        if (v < prefixesPool.length) {
          const prefix = prefixesPool[v];
          customerName = `${prefix} ${pickRandom(['Corporate', 'Enterprises', 'Operations', 'Holdings', 'LLC', 'Inc.'])}`;
          existingCustomerNames.add(customerName);
        } else {
          customerName = generateCustomerName(category, existingCustomerNames);
        }

        const termsBias = CUSTOMER_CATEGORIES[category].terms_bias;
        const paymentTerm = Math.random() < 0.75 ? pickRandom(termsBias) : pickRandom(PAYMENT_TERMS_ALL);

        const offsetDays = Math.floor(Math.random() * maxOffsetDays) + 1;
        const customerCreatedAt = new Date(companyDate.getTime() + (offsetDays * 86400000 + Math.random() * 86400000)).toISOString();

        customers.push({
          id: customerId,
          company_id: companyId,
          name: customerName,
          payment_terms: paymentTerm,
          created_at: customerCreatedAt,
        });
      }
    }

    return {
      user_id: baseUserId,
      companies,
      customers,
      vendors: customers, // backward-compatible alias
      summary: {
        total_companies: companies.length,
        total_customers: customers.length,
        total_vendors: customers.length,
        flagship_customers: CANONICAL_FOUR_COMPANIES[0].customerCount,
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

    for (let v = 0; v < customersPerCompany; v++) {
      const customerId = crypto.randomUUID();
      const category = pickRandom(categoryKeys);
      const customerName = generateCustomerName(category, existingCustomerNames);

      const termsBias = CUSTOMER_CATEGORIES[category].terms_bias;
      const paymentTerm = Math.random() < 0.75 ? pickRandom(termsBias) : pickRandom(PAYMENT_TERMS_ALL);

      const offsetDays = Math.floor(Math.random() * maxOffsetDays) + 1;
      const customerCreatedAt = new Date(companyDate.getTime() + (offsetDays * 86400000 + Math.random() * 86400000)).toISOString();

      customers.push({
        id: customerId,
        company_id: companyId,
        name: customerName,
        payment_terms: paymentTerm,
        created_at: customerCreatedAt,
      });
    }
  }

  return {
    user_id: baseUserId,
    companies,
    customers,
    vendors: customers,
    summary: {
      total_companies: companies.length,
      total_customers: customers.length,
      total_vendors: customers.length,
      customers_per_company: customersPerCompany,
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
  let numCompanies = 4;
  let customersPerCompany = 100;
  let outputDir = 'data/synthetic';
  let format = 'both';
  let useCanonical = true;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--companies' && args[i + 1]) numCompanies = parseInt(args[++i], 10);
    else if ((args[i] === '--customers' || args[i] === '--customers-per-company' || args[i] === '--vendors' || args[i] === '--vendors-per-company') && args[i + 1]) {
      customersPerCompany = parseInt(args[++i], 10);
    } else if (args[i] === '--custom-companies') useCanonical = false;
    else if (args[i] === '--output-dir' && args[i + 1]) outputDir = args[++i];
    else if (args[i] === '--format' && args[i + 1]) format = args[++i];
  }

  const resolvedOutputDir = path.resolve(process.cwd(), outputDir);
  fs.mkdirSync(resolvedOutputDir, { recursive: true });

  console.log('='.repeat(60));
  console.log(' CashPredix - Accounts Receivable Synthetic Generator (Week 3)');
  console.log('='.repeat(60));
  console.log(` Mode:                     ${useCanonical ? 'Canonical 4 Preset (280 Customers, 160 for CashPredix)' : 'Custom Generation'}`);
  console.log(` Target Companies:         ${numCompanies}`);
  console.log(` Target Customers / Comp:  ${customersPerCompany}`);
  console.log(` Output Directory:         ${resolvedOutputDir}`);
  console.log('='.repeat(60));

  const dataset = generateSyntheticDataset({ numCompanies, customersPerCompany, useCanonicalFour: useCanonical });

  if (format === 'json' || format === 'both') {
    fs.writeFileSync(path.join(resolvedOutputDir, 'companies.json'), JSON.stringify(dataset.companies, null, 2));
    fs.writeFileSync(path.join(resolvedOutputDir, 'customers.json'), JSON.stringify(dataset.customers, null, 2));
    fs.writeFileSync(path.join(resolvedOutputDir, 'vendors.json'), JSON.stringify(dataset.customers, null, 2));
    fs.writeFileSync(path.join(resolvedOutputDir, 'synthetic_dataset_bundle.json'), JSON.stringify(dataset, null, 2));
    console.log('[✓] Successfully generated JSON datasets (companies.json, customers.json, vendors.json).');
  }

  if (format === 'csv' || format === 'both') {
    fs.writeFileSync(path.join(resolvedOutputDir, 'companies.csv'), toCSV(dataset.companies));
    fs.writeFileSync(path.join(resolvedOutputDir, 'customers.csv'), toCSV(dataset.customers));
    fs.writeFileSync(path.join(resolvedOutputDir, 'vendors.csv'), toCSV(dataset.customers));
    console.log('[✓] Successfully generated CSV datasets (companies.csv, customers.csv, vendors.csv).');
  }

  console.log('='.repeat(60));
  console.log(`[SUCCESS] Generated ${dataset.companies.length} companies and ${dataset.customers.length} customer records (AR inflows)!`);
  console.log('='.repeat(60));
}
