#!/usr/bin/env python3
"""
CashPredix - Synthetic Data Generation Script
Week 3: Task #42 - Programmatic generation of realistic company profiles and vendor records.

This script generates synthetic, production-grade test datasets adhering strictly to the
CashPredix Supabase PostgreSQL database schema.

Schema Compatibility:
  companies (id, user_id, name, industry, created_at)
  vendors (id, company_id, name, payment_terms, created_at)

Usage:
  python3 scripts/generate_synthetic_data.py --companies 10 --vendors-per-company 100 --format both
  python3 scripts/generate_synthetic_data.py --help
"""

import os
import sys
import uuid
import json
import csv
import random
import argparse
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Seed for reproducibility if requested
DEFAULT_RANDOM_SEED = 42

# Industry taxonomy for company profiles
INDUSTRIES = [
    "Technology & SaaS",
    "Logistics & Freight",
    "Manufacturing & Industrial",
    "Healthcare & Pharmaceuticals",
    "Retail & E-Commerce",
    "Financial Services & FinTech",
    "Renewable Energy & Utilities",
    "Construction & Engineering",
    "Telecommunications",
    "Professional Services & Consulting"
]

# Company name generation vocabulary
COMPANY_PREFIXES = [
    "Apex", "Nexus", "Vertex", "Vanguard", "Horizon", "Pinnacle", "Acro", "Pulse",
    "Quantum", "Starlight", "Meridian", "Solas", "Omni", "Crestview", "Astra",
    "Strata", "Synergy", "Beacon", "Cobalt", "Ironclad", "Summit", "Velox", "Integra",
    "Hyperion", "Kore", "Atlas", "Novus", "Terra", "Zephyr", "Aegis", "Centurion"
]

COMPANY_MIDDLES = [
    "Dynamics", "Technologies", "Logistics", "Ventures", "Systems", "Solutions",
    "Industries", "Analytics", "Networks", "Capital", "Holdings", "Innovations",
    "Robotics", "Global", "Supply", "Health", "Energy", "Digital", "BioTech", "Partners"
]

COMPANY_SUFFIXES = [
    "Inc.", "Corp.", "LLC", "Group", "Enterprises", "International", "GmbH", "Limited"
]

# Vendor Categories and Names Generator
VENDOR_CATEGORIES = {
    "Cloud & Infrastructure": {
        "prefixes": ["CloudScale", "DataWeave", "ByteStream", "ServerGrid", "NetCore", "InfraVault", "LatencyLess"],
        "middles": ["Hosting", "Compute", "Cloud", "Data Systems", "DevOps", "Networks"],
        "terms_bias": ["Net 30", "Net 15", "Due on Receipt"]
    },
    "Logistics & Shipping": {
        "prefixes": ["GlobalFreight", "SwiftHaul", "NordicCargo", "SeaBridge", "InterstateExpress", "AtlasTrans", "PrimeRoute"],
        "middles": ["Logistics", "Freight", "Courier", "Carriers", "Transport", "Supply Chain"],
        "terms_bias": ["Net 30", "Net 45", "Net 60"]
    },
    "Hardware & Electronics": {
        "prefixes": ["SiliconEdge", "MicroChip", "PrecisionTech", "CircuitWorks", "OptiSensor", "NanoLogic"],
        "middles": ["Components", "Hardware", "Semiconductors", "Devices", "Electronics"],
        "terms_bias": ["Net 30", "Net 60", "2/10 Net 30"]
    },
    "Raw Materials & Manufacturing": {
        "prefixes": ["TitanAlloy", "ApexPolymer", "VulcanMetals", "CoreTimber", "PureChem", "PolyMatrix"],
        "middles": ["Materials", "Refineries", "Smelting", "Polymers", "Industries", "Foundry"],
        "terms_bias": ["Net 60", "Net 90", "Net 45"]
    },
    "Legal & Professional Services": {
        "prefixes": ["Sterling & Associates", "Vanguard Advisory", "Blackwood Legal", "Apex Compliance", "AuditCore", "Kroll"],
        "middles": ["Consulting", "Partners", "Legal Group", "Auditors", "Risk Advisors"],
        "terms_bias": ["Net 30", "Due on Receipt", "Net 15"]
    },
    "Marketing & Creative Media": {
        "prefixes": ["PixelCraft", "VividReach", "OmniMarketing", "AdVantage", "PrismMedia", "BrandVelocity"],
        "middles": ["Media", "Agency", "Interactive", "Digital Labs", "Creative"],
        "terms_bias": ["Net 30", "Net 15", "2/10 Net 30"]
    },
    "Facilities & Office Maintenance": {
        "prefixes": ["EnviroClean", "SafeGuard Security", "MetroPower", "Apex HVAC", "EcoWaste", "ProFacility"],
        "middles": ["Services", "Solutions", "Operations", "Maintenance", "Management"],
        "terms_bias": ["Net 30", "Net 15", "Net 45"]
    }
}

PAYMENT_TERMS_ALL = [
    "Due on Receipt",
    "Net 15",
    "Net 30",
    "Net 45",
    "Net 60",
    "Net 90",
    "2/10 Net 30"
]


def generate_company_name(existing_names: set) -> str:
    """Generate a unique, realistic enterprise company name."""
    for _ in range(500):
        name = f"{random.choice(COMPANY_PREFIXES)} {random.choice(COMPANY_MIDDLES)} {random.choice(COMPANY_SUFFIXES)}"
        if name not in existing_names:
            existing_names.add(name)
            return name
    # Fallback with random suffix
    name = f"{random.choice(COMPANY_PREFIXES)} Solutions {random.randint(100, 999)} {random.choice(COMPANY_SUFFIXES)}"
    existing_names.add(name)
    return name


def generate_vendor_name(category: str, existing_names: set) -> str:
    """Generate a realistic customer / client account name within a given industry category."""
    cat_data = VENDOR_CATEGORIES.get(category, random.choice(list(VENDOR_CATEGORIES.values())))
    for _ in range(200):
        prefix = random.choice(cat_data["prefixes"])
        middle = random.choice(cat_data["middles"])
        suffix = random.choice(["Inc.", "Corp.", "LLC", "Ltd.", "GmbH", "Co."])
        name = f"{prefix} {middle} {suffix}"
        if name not in existing_names:
            existing_names.add(name)
            return name
    
    # Fallback with salt
    name = f"{random.choice(cat_data['prefixes'])} {random.choice(cat_data['middles'])} {random.randint(10, 9999)} {suffix}"
    existing_names.add(name)
    return name


CANONICAL_FOUR_COMPANIES = [
    {
        "name": "CashPredix Technologies Inc.",
        "industry": "Technology & SaaS",
        "customer_count": 160,
        "is_flagship": True,
        "specialized_prefixes": [
            "JPMorgan Chase Treasury", "Bank of America Enterprise", "Goldman Sachs Asset", "Morgan Stanley Wealth",
            "Citigroup Solutions", "Wells Fargo Commercial", "Barclays Banking", "HSBC Trade",
            "BNP Paribas Institutional", "UBS Americas", "Deutsche Bank Transaction", "Standard Chartered Markets",
            "Santander Commercial", "Capital One Enterprise", "PNC Financial Services", "US Bancorp Banking",
            "Shopify Plus Merchant", "Uber Technologies Treasury", "Airbnb Global Payments", "DoorDash Financial",
            "Snowflake Corporate Ops", "Stripe Billing Partner", "Block Square Network", "Salesforce Analytics",
            "HubSpot Growth Systems", "ServiceNow Cloud", "Intuit Quickbooks", "Workday Enterprise",
            "Walmart eCommerce", "Target Logistics", "Home Depot Merchant", "Costco Wholesale Corp",
            "General Electric Treasury", "Boeing Aviation Services", "Lockheed Martin Systems", "Siemens Industrial",
            "UnitedHealth Group", "CVS Health Pharmacy", "Johnson & Johnson Health", "Pfizer BioPharma"
        ]
    },
    {
        "name": "Apex Horizon Logistics Corp.",
        "industry": "Logistics & Freight",
        "customer_count": 45,
        "is_flagship": False,
        "specialized_prefixes": [
            "Nike Global Footwear Supply", "Apple Worldwide Distribution", "Samsung Electronics Americas",
            "Tesla Motors Gigafactory Parts", "Procter & Gamble Consumer Goods", "Unilever North America Transit",
            "Sony Corporation Electronics", "Ford Motor Company Assembly", "General Motors Components",
            "IKEA Supply AG Furniture", "Adidas Sports Apparel", "LG Electronics Transport"
        ]
    },
    {
        "name": "Vanguard Healthcare Systems Enterprises",
        "industry": "Healthcare & Pharmaceuticals",
        "customer_count": 40,
        "is_flagship": False,
        "specialized_prefixes": [
            "Mayo Clinic Health System", "Cleveland Clinic Foundation", "Johns Hopkins Medicine Center",
            "Kaiser Permanente Medical", "Mount Sinai Health System", "Mass General Brigham Alliance",
            "Stanford Health Care", "Cedars-Sinai Medical Center", "Northwell Health Hospital Group",
            "UPMC Health System", "MD Anderson Cancer Foundation", "Geisinger Health Network"
        ]
    },
    {
        "name": "Quantum Capital & Financial Holdings",
        "industry": "Financial Services & FinTech",
        "customer_count": 35,
        "is_flagship": False,
        "specialized_prefixes": [
            "BlackRock Global Investment", "Vanguard Group Institutional", "Fidelity Investments Asset",
            "Citadel Securities Liquidity", "Bridgewater Associates Macro", "Millennium Management Strategy",
            "Point72 Asset Management", "Two Sigma Investments Fund", "D.E. Shaw Computational Capital",
            "CalPERS Public Employees Fund", "Texas Teacher Retirement System", "AQR Capital Systematic"
        ]
    }
]


def generate_synthetic_dataset(
    num_companies: int = 4,
    customers_per_company: int = 100,
    user_id: str = None,
    seed: int = None,
    use_canonical_four: bool = True
):
    """
    Programmatically synthesize relational datasets matching the Supabase schema:
      - companies: id, user_id, name, industry, created_at
      - customers: id, company_id, name, payment_terms, created_at (Accounts Receivable / Inbound Cash Flow)
    """
    if seed is not None:
        random.seed(seed)

    base_user_id = user_id if user_id else str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    companies = []
    customers = []
    
    existing_company_names = set()
    existing_customer_names = set()

    if use_canonical_four:
        for comp_spec in CANONICAL_FOUR_COMPANIES:
            company_id = str(uuid.uuid4())
            company_name = comp_spec["name"]
            industry = comp_spec["industry"]
            existing_company_names.add(company_name)

            days_ago = random.randint(180, 500) if not comp_spec.get("is_flagship") else 720
            company_created_at = (now - timedelta(days=days_ago, seconds=random.randint(0, 86400))).isoformat()

            companies.append({
                "id": company_id,
                "user_id": base_user_id,
                "name": company_name,
                "industry": industry,
                "created_at": company_created_at
            })

            target_count = comp_spec["customer_count"]
            categories = list(VENDOR_CATEGORIES.keys())
            prefixes_pool = list(comp_spec.get("specialized_prefixes", []))

            for v_idx in range(target_count):
                customer_id = str(uuid.uuid4())
                category = random.choice(categories)

                # Prioritize realistic specialized names first, then generative fallback
                if v_idx < len(prefixes_pool):
                    prefix = prefixes_pool[v_idx]
                    customer_name = f"{prefix} {random.choice(['Corporate', 'Enterprises', 'Operations', 'Holdings', 'LLC', 'Inc.'])}"
                    existing_customer_names.add(customer_name)
                else:
                    customer_name = generate_vendor_name(category, existing_customer_names)

                cat_bias = VENDOR_CATEGORIES[category]["terms_bias"]
                if random.random() < 0.75:
                    payment_term = random.choice(cat_bias)
                else:
                    payment_term = random.choice(PAYMENT_TERMS_ALL)

                company_dt = datetime.fromisoformat(company_created_at)
                max_customer_offset = max(1, (now - company_dt).days - 10)
                customer_offset = random.randint(1, max_customer_offset)
                customer_created_at = (company_dt + timedelta(days=customer_offset, seconds=random.randint(0, 86400))).isoformat()

                customers.append({
                    "id": customer_id,
                    "company_id": company_id,
                    "name": customer_name,
                    "payment_terms": payment_term,
                    "created_at": customer_created_at
                })

        return {
            "user_id": base_user_id,
            "companies": companies,
            "customers": customers,
            "vendors": customers,  # legacy backward-compatible alias
            "summary": {
                "total_companies": len(companies),
                "total_customers": len(customers),
                "flagship_customers": CANONICAL_FOUR_COMPANIES[0]["customer_count"],
                "generated_at": now.isoformat()
            }
        }

    # Custom number of companies fallback
    for c_idx in range(num_companies):
        company_id = str(uuid.uuid4())
        company_name = generate_company_name(existing_company_names)
        industry = random.choice(INDUSTRIES)
        
        days_ago = random.randint(180, 730)
        company_created_at = (now - timedelta(days=days_ago, seconds=random.randint(0, 86400))).isoformat()

        company_record = {
            "id": company_id,
            "user_id": base_user_id,
            "name": company_name,
            "industry": industry,
            "created_at": company_created_at
        }
        companies.append(company_record)

        categories = list(VENDOR_CATEGORIES.keys())
        for v_idx in range(customers_per_company):
            customer_id = str(uuid.uuid4())
            category = random.choice(categories)
            customer_name = generate_vendor_name(category, existing_customer_names)

            cat_bias = VENDOR_CATEGORIES[category]["terms_bias"]
            if random.random() < 0.75:
                payment_term = random.choice(cat_bias)
            else:
                payment_term = random.choice(PAYMENT_TERMS_ALL)

            company_dt = datetime.fromisoformat(company_created_at)
            max_customer_offset = max(1, (now - company_dt).days - 10)
            customer_offset = random.randint(1, max_customer_offset)
            customer_created_at = (company_dt + timedelta(days=customer_offset, seconds=random.randint(0, 86400))).isoformat()

            customer_record = {
                "id": customer_id,
                "company_id": company_id,
                "name": customer_name,
                "payment_terms": payment_term,
                "created_at": customer_created_at
            }
            customers.append(customer_record)

    return {
        "user_id": base_user_id,
        "companies": companies,
        "customers": customers,
        "vendors": customers,
        "summary": {
            "total_companies": len(companies),
            "total_customers": len(customers),
            "customers_per_company": customers_per_company,
            "generated_at": now.isoformat()
        }
    }


def save_to_json(data: dict, output_dir: Path):
    """Save datasets in JSON format for customers and companies."""
    output_dir.mkdir(parents=True, exist_ok=True)
    
    companies_file = output_dir / "companies.json"
    customers_file = output_dir / "customers.json"
    vendors_file = output_dir / "vendors.json"  # compatibility alias
    bundle_file = output_dir / "synthetic_dataset_bundle.json"

    with open(companies_file, "w", encoding="utf-8") as f:
        json.dump(data["companies"], f, indent=2)

    with open(customers_file, "w", encoding="utf-8") as f:
        json.dump(data["customers"], f, indent=2)

    with open(vendors_file, "w", encoding="utf-8") as f:
        json.dump(data["customers"], f, indent=2)

    with open(bundle_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    print(f"[✓] Saved JSON files to {output_dir}:")
    print(f"    - {companies_file} ({len(data['companies'])} companies)")
    print(f"    - {customers_file} ({len(data['customers'])} customers / accounts receivable)")
    print(f"    - {vendors_file} ({len(data['customers'])} legacy alias records)")
    print(f"    - {bundle_file} (Full bundle with metadata)")


def save_to_csv(data: dict, output_dir: Path):
    """Save datasets in CSV format for direct PostgreSQL / Supabase import."""
    output_dir.mkdir(parents=True, exist_ok=True)

    companies_csv = output_dir / "companies.csv"
    customers_csv = output_dir / "customers.csv"
    vendors_csv = output_dir / "vendors.csv"

    # Write companies.csv
    if data["companies"]:
        keys = list(data["companies"][0].keys())
        with open(companies_csv, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=keys)
            writer.writeheader()
            writer.writerows(data["companies"])

    # Write customers.csv
    if data["customers"]:
        keys = list(data["customers"][0].keys())
        with open(customers_csv, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=keys)
            writer.writeheader()
            writer.writerows(data["customers"])

        # Also write vendors.csv for legacy compatibility
        with open(vendors_csv, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=keys)
            writer.writeheader()
            writer.writerows(data["customers"])

    print(f"[✓] Saved CSV files to {output_dir}:")
    print(f"    - {companies_csv} ({len(data['companies'])} rows)")
    print(f"    - {customers_csv} ({len(data['customers'])} rows)")
    print(f"    - {vendors_csv} ({len(data['customers'])} legacy alias rows)")


def main():
    parser = argparse.ArgumentParser(
        description="CashPredix Week 3 Task #42: Generate synthetic company and customer records (Accounts Receivable)."
    )
    parser.add_argument(
        "--canonical-four",
        action="store_true",
        default=True,
        help="Generate the canonical 4 companies preset with CashPredix holding 160 customers (default: True)"
    )
    parser.add_argument(
        "--custom-companies",
        action="store_true",
        default=False,
        help="Use generic randomly generated companies instead of the canonical 4 preset"
    )
    parser.add_argument(
        "--companies",
        type=int,
        default=4,
        help="Number of company profiles to generate when --custom-companies is set (default: 4)"
    )
    parser.add_argument(
        "--customers-per-company",
        "--vendors-per-company",
        type=int,
        default=100,
        dest="customers_per_company",
        help="Number of customer records per company when --custom-companies is set (default: 100)"
    )
    parser.add_argument(
        "--user-id",
        type=str,
        default=None,
        help="Target user_id UUID from Supabase auth.users (optional)"
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default="data/synthetic",
        help="Output directory path (default: data/synthetic)"
    )
    parser.add_argument(
        "--format",
        type=str,
        choices=["json", "csv", "both"],
        default="both",
        help="Output file format (json, csv, or both; default: both)"
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=DEFAULT_RANDOM_SEED,
        help="Random seed for reproducible outputs (default: 42)"
    )

    args = parser.parse_args()

    use_canonical = not args.custom_companies
    print("=" * 60)
    print(" CashPredix - Accounts Receivable Synthetic Generator (Week 3)")
    print("=" * 60)
    if use_canonical:
        print(" Mode:                       Canonical 4 Companies Preset")
        print(" Companies:                  4 (CashPredix, Apex, Vanguard, Quantum)")
        print(" CashPredix Customers:       160 (B2B Enterprise Corporate Clients)")
        print(" Total Ecosystem Customers:  280")
    else:
        total_expected_cust = args.companies * args.customers_per_company
        print(" Mode:                       Custom Generic Generation")
        print(f" Target Companies:           {args.companies}")
        print(f" Target Customers / Company: {args.customers_per_company}")
        print(f" Total Synthetic Customers:  {total_expected_cust}")
    print(f" Format:                     {args.format.upper()}")
    print(f" Output Directory:           {args.output_dir}")
    print(f" Random Seed:                {args.seed}")
    print("=" * 60)

    dataset = generate_synthetic_dataset(
        num_companies=args.companies,
        customers_per_company=args.customers_per_company,
        user_id=args.user_id,
        seed=args.seed,
        use_canonical_four=use_canonical
    )

    out_path = Path(args.output_dir)
    if args.format in ("json", "both"):
        save_to_json(dataset, out_path)
    if args.format in ("csv", "both"):
        save_to_csv(dataset, out_path)

    print("=" * 60)
    print(f"[SUCCESS] Synthesized {len(dataset['companies'])} companies and {len(dataset['customers'])} customer records successfully!")
    print("=" * 60)


if __name__ == "__main__":
    main()
