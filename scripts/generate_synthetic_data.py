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
    """Generate a realistic vendor / supplier name within a given industry category."""
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


def generate_synthetic_dataset(
    num_companies: int = 10,
    vendors_per_company: int = 100,
    user_id: str = None,
    seed: int = None
):
    """
    Programmatically synthesize relational datasets matching the Supabase schema:
      - companies: id, user_id, name, industry, created_at
      - vendors: id, company_id, name, payment_terms, created_at
    """
    if seed is not None:
        random.seed(seed)

    # Use specified user_id or a deterministic / random UUID
    base_user_id = user_id if user_id else str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    companies = []
    vendors = []
    
    existing_company_names = set()
    existing_vendor_names = set()

    for c_idx in range(num_companies):
        company_id = str(uuid.uuid4())
        company_name = generate_company_name(existing_company_names)
        industry = random.choice(INDUSTRIES)
        
        # Stagger company creation over past 180 to 730 days
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

        # Generate synthetic vendors for this company
        categories = list(VENDOR_CATEGORIES.keys())
        for v_idx in range(vendors_per_company):
            vendor_id = str(uuid.uuid4())
            category = random.choice(categories)
            vendor_name = generate_vendor_name(category, existing_vendor_names)

            # Choose payment term biased by category
            cat_bias = VENDOR_CATEGORIES[category]["terms_bias"]
            if random.random() < 0.75:
                payment_term = random.choice(cat_bias)
            else:
                payment_term = random.choice(PAYMENT_TERMS_ALL)

            # Vendor created shortly after company
            company_dt = datetime.fromisoformat(company_created_at)
            max_vendor_offset = max(1, (now - company_dt).days - 10)
            vendor_offset = random.randint(1, max_vendor_offset)
            vendor_created_at = (company_dt + timedelta(days=vendor_offset, seconds=random.randint(0, 86400))).isoformat()

            vendor_record = {
                "id": vendor_id,
                "company_id": company_id,
                "name": vendor_name,
                "payment_terms": payment_term,
                "created_at": vendor_created_at
            }
            vendors.append(vendor_record)

    return {
        "user_id": base_user_id,
        "companies": companies,
        "vendors": vendors,
        "summary": {
            "total_companies": len(companies),
            "total_vendors": len(vendors),
            "vendors_per_company": vendors_per_company,
            "generated_at": now.isoformat()
        }
    }


def save_to_json(data: dict, output_dir: Path):
    """Save datasets in JSON format."""
    output_dir.mkdir(parents=True, exist_ok=True)
    
    companies_file = output_dir / "companies.json"
    vendors_file = output_dir / "vendors.json"
    bundle_file = output_dir / "synthetic_dataset_bundle.json"

    with open(companies_file, "w", encoding="utf-8") as f:
        json.dump(data["companies"], f, indent=2)

    with open(vendors_file, "w", encoding="utf-8") as f:
        json.dump(data["vendors"], f, indent=2)

    with open(bundle_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    print(f"[✓] Saved JSON files to {output_dir}:")
    print(f"    - {companies_file} ({len(data['companies'])} companies)")
    print(f"    - {vendors_file} ({len(data['vendors'])} vendors)")
    print(f"    - {bundle_file} (Full bundle with metadata)")


def save_to_csv(data: dict, output_dir: Path):
    """Save datasets in CSV format for direct PostgreSQL / Supabase import."""
    output_dir.mkdir(parents=True, exist_ok=True)

    companies_csv = output_dir / "companies.csv"
    vendors_csv = output_dir / "vendors.csv"

    # Write companies.csv
    if data["companies"]:
        keys = list(data["companies"][0].keys())
        with open(companies_csv, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=keys)
            writer.writeheader()
            writer.writerows(data["companies"])

    # Write vendors.csv
    if data["vendors"]:
        keys = list(data["vendors"][0].keys())
        with open(vendors_csv, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=keys)
            writer.writeheader()
            writer.writerows(data["vendors"])

    print(f"[✓] Saved CSV files to {output_dir}:")
    print(f"    - {companies_csv} ({len(data['companies'])} rows)")
    print(f"    - {vendors_csv} ({len(data['vendors'])} rows)")


def main():
    parser = argparse.ArgumentParser(
        description="CashPredix Week 3 Task #42: Generate synthetic company and vendor records."
    )
    parser.add_argument(
        "--companies",
        type=int,
        default=10,
        help="Number of company profiles to generate (default: 10)"
    )
    parser.add_argument(
        "--vendors-per-company",
        type=int,
        default=100,
        help="Number of vendor records per company (default: 100 -> 10 x 100 = 1,000 vendors)"
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

    total_expected_vendors = args.companies * args.vendors_per_company
    print("=" * 60)
    print(" CashPredix - Synthetic Data Generation Tool (Week 3 / #42)")
    print("=" * 60)
    print(f" Target Companies:           {args.companies}")
    print(f" Target Vendors / Company:   {args.vendors_per_company}")
    print(f" Total Synthetic Vendors:    {total_expected_vendors}")
    print(f" Format:                     {args.format.upper()}")
    print(f" Output Directory:           {args.output_dir}")
    print(f" Random Seed:                {args.seed}")
    print("=" * 60)

    dataset = generate_synthetic_dataset(
        num_companies=args.companies,
        vendors_per_company=args.vendors_per_company,
        user_id=args.user_id,
        seed=args.seed
    )

    out_path = Path(args.output_dir)
    if args.format in ("json", "both"):
        save_to_json(dataset, out_path)
    if args.format in ("csv", "both"):
        save_to_csv(dataset, out_path)

    print("=" * 60)
    print(f"[SUCCESS] Synthesized {len(dataset['companies'])} companies and {len(dataset['vendors'])} vendor records successfully!")
    print("=" * 60)


if __name__ == "__main__":
    main()
