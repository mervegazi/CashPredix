#!/usr/bin/env python3
"""
CashPredix - Week 6 Word Document (.docx) Report Generator
Generates a formal, professionally styled academic progress report for Week 6.
"""

import sys
import shutil
from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DOCX = BASE_DIR / "docs" / "Week_6_Weekly_Progress_Report_CashPredix.docx"
DESKTOP_DOCX = Path("/Users/merve/Desktop/Week_6_Weekly_Progress_Report_CashPredix.docx")


def set_cell_background(cell, fill_hex):
    """Set background color of a table cell."""
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tc_pr.append(shd)


def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Set inner cell padding in twips."""
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_mar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tc_pr.append(tc_mar)


def add_callout(doc, text, title="KEY TAKEAWAY", border_hex="2563EB", bg_hex="EFF6FF"):
    """Insert a styled callout box."""
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    cell.width = Inches(6.5)
    set_cell_background(cell, bg_hex)
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)

    tc_pr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:left w:val="single" w:sz="24" w:space="0" w:color="{border_hex}"/>'
        f'<w:top w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'<w:bottom w:val="none"/>'
        f'</w:tcBorders>'
    )
    tc_pr.append(borders)

    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15

    r_title = p.add_run(f"[{title}] ")
    r_title.bold = True
    r_title.font.name = "Calibri"
    r_title.font.size = Pt(10)
    r_title.font.color.rgb = RGBColor(0x1E, 0x40, 0xAF)

    r_text = p.add_run(text)
    r_text.font.name = "Calibri"
    r_text.font.size = Pt(10)
    r_text.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)

    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_before = Pt(0)
    p_after.paragraph_format.space_after = Pt(4)


def create_report():
    doc = Document()

    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    c_primary = RGBColor(0x1E, 0x3A, 0x8A)     # Dark Blue
    c_dark = RGBColor(0x11, 0x18, 0x27)        # Slate 900
    c_muted = RGBColor(0x4B, 0x55, 0x63)       # Slate 600

    # Title
    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(2)
    run_title = p_title.add_run("CashPredix — Weekly Progress Report")
    run_title.font.name = "Calibri"
    run_title.font.size = Pt(24)
    run_title.bold = True
    run_title.font.color.rgb = c_primary

    # Subtitle
    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(14)
    run_sub = p_sub.add_run("Week 6: Full-Stack ML Integration, REST API Endpoints & Interactive Live Predictions")
    run_sub.font.name = "Calibri"
    run_sub.font.size = Pt(13)
    run_sub.font.color.rgb = c_muted
    run_sub.italic = True

    # Metadata Table
    meta_table = doc.add_table(rows=5, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_data = [
        ("Project Title:", "CashPredix — Autonomous Liquidity Prediction & Supplier Risk Management"),
        ("Sprint Period:", "Week 6 (November 2, 2026 – November 8, 2026)"),
        ("Author / Developer:", "Merve Gazi"),
        ("Supervisor / Reviewer:", "Academic Advisor / Course Professor"),
        ("GitHub Repository:", "https://github.com/mervegazi/CashPredix")
    ]
    for i, (k, v) in enumerate(meta_data):
        row = meta_table.rows[i]
        c0, c1 = row.cells[0], row.cells[1]
        c0.width, c1.width = Inches(2.0), Inches(4.5)
        set_cell_background(c0, "F8FAFC")
        set_cell_background(c1, "F8FAFC")
        set_cell_margins(c0, top=60, bottom=60, left=100, right=100)
        set_cell_margins(c1, top=60, bottom=60, left=100, right=100)

        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_after = Pt(0)
        r0 = p0.add_run(k)
        r0.bold = True
        r0.font.name = "Calibri"
        r0.font.size = Pt(9.5)
        r0.font.color.rgb = c_primary

        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_after = Pt(0)
        r1 = p1.add_run(v)
        r1.font.name = "Calibri"
        r1.font.size = Pt(9.5)
        r1.font.color.rgb = c_dark

    p_div = doc.add_paragraph()
    p_div.paragraph_format.space_before = Pt(8)
    p_div.paragraph_format.space_after = Pt(8)

    # 1. Executive Summary
    h1 = doc.add_heading("1. Executive Summary & Sprint Objectives", level=1)
    h1.paragraph_format.space_before = Pt(14)
    h1.paragraph_format.space_after = Pt(6)

    p_exec = doc.add_paragraph(
        "During Week 6 of the CashPredix development cycle, the engineering milestone achieved seamless full-stack integration "
        "of the 5-Step Hybrid Machine Learning Architecture. A high-performance REST API backend was engineered using FastAPI and Pydantic "
        "validation, exposing endpoints for individual invoice predictions, multi-horizon portfolio cash flow projections, and counterparty reliability scoring. "
        "The React frontend was augmented with an interactive prediction sandbox, live ledger prediction triggers, visual probability distribution bars, "
        "and resilient client-side calculation fallbacks that guarantee zero runtime interruption even in offline states. "
        "All edge cases (cold-start counterparties, single payment zero suppression, floating-point sum consistency) were systematically verified."
    )
    p_exec.paragraph_format.line_spacing = 1.15
    p_exec.paragraph_format.space_after = Pt(8)

    add_callout(
        doc,
        "All Week 6 GitHub Project tasks (#24, #25, #26, #53) were completed with 100% test pass rates across both backend API test suites "
        "(tests/test_api_endpoints.py) and edge-case suites (tests/test_edge_cases.py). The React production build compiles cleanly in under 400ms.",
        title="WEEK 6 SPRINT MILESTONE ACCOMPLISHED"
    )

    # 2. Deliverables Summary
    h2_deliv = doc.add_heading("2. Deliverables Summary", level=2)
    h2_deliv.paragraph_format.space_before = Pt(10)
    h2_deliv.paragraph_format.space_after = Pt(6)

    deliv_table = doc.add_table(rows=5, cols=3)
    deliv_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers = ["Task ID", "Objective & Scope", "Implementation & Output"]
    for j, h in enumerate(headers):
        cell = deliv_table.rows[0].cells[j]
        set_cell_background(cell, "1E3A8A")
        set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.bold = True
        r.font.name = "Calibri"
        r.font.size = Pt(10)
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    tasks_data = [
        ("Task #24", "ML Pipeline API Endpoints (FastAPI Backend)", "Engineered FastAPI service (server/app.py) exposing /api/predict/invoice, /api/cashflow/projection, /api/customers/scores, and /api/sync/supabase with strict Pydantic schemas."),
        ("Task #25", "Frontend Integration & Live Prediction Triggers", "Created client prediction service (src/lib/mlPredictionService.js), visual scenario component (src/components/ScenarioPredictionCard.jsx), ledger action triggers (CustomerLedgerModal.jsx), and interactive sandbox dashboard (CashflowPredictsPlaceholder.jsx)."),
        ("Task #26", "Edge Cases, Single vs Split & Database Sync", "Implemented Bayesian cold-start priors for new customers, single payment Part 2 zero suppression, mathematical ratio sum enforcement, and edge case test suite (tests/test_edge_cases.py)."),
        ("Task #53", "Weekly Progress Report", "Compilation and formal submission of Sprint Week 6 progress report in Markdown and Microsoft Word (.docx) formats.")
    ]

    for i, (t_id, t_obj, t_out) in enumerate(tasks_data, start=1):
        row = deliv_table.rows[i]
        bg = "F9FAFB" if i % 2 == 1 else "FFFFFF"
        for col_idx, text in enumerate([t_id, t_obj, t_out]):
            cell = row.cells[col_idx]
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
            p = cell.paragraphs[0]
            r = p.add_run(text)
            r.font.name = "Calibri"
            r.font.size = Pt(9.5)
            if col_idx == 0:
                r.bold = True
                r.font.color.rgb = c_primary

    # 3. System Architecture Breakdown
    h1_arch = doc.add_heading("3. Full-Stack Data Flow & API Specifications", level=1)
    h1_arch.paragraph_format.space_before = Pt(14)
    h1_arch.paragraph_format.space_after = Pt(6)

    p_arch = doc.add_paragraph(
        "The architecture establishes high-throughput communication between the React presentation tier and the Python machine learning service:"
    )
    p_arch.paragraph_format.space_after = Pt(4)

    steps_info = [
        ("REST Endpoint POST /api/predict/invoice:", " Ingests customer ID, invoice amount, and due date. Concurrently triggers LightGBM classification, customer penalty scoring, and multi-output regression, returning standardized JSON containing 6 class probabilities, 0-100 penalty score, installment allocation, and the natural language scenario narrative."),
        ("REST Endpoint GET /api/cashflow/projection:", " Runs the Step 5 Cash Flow Aggregation Engine over the active counterparty portfolio, returning projected inflows across 6 discrete intervals (this week, next week, in 2 weeks, in 3 weeks, monthly total, and annual projection)."),
        ("Client Resilient Fallback Engine:", " Designed an isomorphic JavaScript calculation engine in src/lib/mlPredictionService.js that calculates identical mathematical results when the backend service is offline, ensuring reliable offline demonstrations."),
        ("Interactive React Visualizer:", " ScenarioPredictionCard renders animated probability distribution bars, score badges with formula transparency (Base Score - 5 * Split Rate), and installment cards showing exact dates and amounts.")
    ]

    for s_title, s_desc in steps_info:
        p_step = doc.add_paragraph()
        p_step.paragraph_format.space_before = Pt(2)
        p_step.paragraph_format.space_after = Pt(2)
        r_st = p_step.add_run(s_title)
        r_st.bold = True
        r_st.font.name = "Calibri"
        r_st.font.size = Pt(10)
        r_st.font.color.rgb = c_primary
        r_sd = p_step.add_run(s_desc)
        r_sd.font.name = "Calibri"
        r_sd.font.size = Pt(10)

    # 4. Technical Challenges & Resolutions
    h1_chal = doc.add_heading("4. Technical Challenges Encountered & Resolutions", level=1)
    h1_chal.paragraph_format.space_before = Pt(14)
    h1_chal.paragraph_format.space_after = Pt(6)

    chal_table = doc.add_table(rows=4, cols=3)
    chal_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    c_headers = ["# & Challenge", "Root Cause Analysis", "Implemented Engineering Resolution"]
    for j, h in enumerate(c_headers):
        cell = chal_table.rows[0].cells[j]
        set_cell_background(cell, "1E3A8A")
        set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.bold = True
        r.font.name = "Calibri"
        r.font.size = Pt(10)
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    challenges_data = [
        ("1. FastAPI / Starlette Lifespan Test Client Scoping", "FastAPI TestClient does not trigger @app.on_event('startup') unless executed within an active context manager, causing initial model-not-loaded assertions in automated test runners.", "Introduced eager singleton initialization in server/app.py on module import while maintaining startup hooks, guaranteeing model availability across both production uvicorn servers and headless pytest suites."),
        ("2. Pydantic Floating-Point Score Validation", "Pydantic integer validators rejected calculated continuous base scores (e.g. 78.84) and fraction penalty deductions (0.4) before rounding.", "Aligned Pydantic schemas to accept float inputs for base_score and invoice_split_penalty, while preserving integer rounding for final customer_score."),
        ("3. Cold Start Zero-History Counterparties", "Newly onboarded counterparties without prior invoices lacked features for delay standard deviation and split frequency.", "Engineered Bayesian prior cohort imputation (split_rate = 0.15, avg_delay = 0.0, base_score = 75, penalty_score = 74) flagged with is_cold_start = True.")
    ]

    for i, (c_name, c_cause, c_res) in enumerate(challenges_data, start=1):
        row = chal_table.rows[i]
        bg = "F9FAFB" if i % 2 == 1 else "FFFFFF"
        for col_idx, text in enumerate([c_name, c_cause, c_res]):
            cell = row.cells[col_idx]
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
            p = cell.paragraphs[0]
            r = p.add_run(text)
            r.font.name = "Calibri"
            r.font.size = Pt(9.5)
            if col_idx == 0:
                r.bold = True
                r.font.color.rgb = c_primary

    # 5. Next Sprint (Week 7)
    h1_next = doc.add_heading("5. Next Sprint Plan (Week 7 Objectives)", level=1)
    h1_next.paragraph_format.space_before = Pt(14)
    h1_next.paragraph_format.space_after = Pt(6)

    p_next = doc.add_paragraph(
        "For Week 7, the project will expand into advanced dynamic scenario simulation:\n"
        "• Task #27: Scenario Modeling Engine (Stress-test, Optimistic, and Delay sensitivity simulations).\n"
        "• Task #28: Interactive parameter sliders on the forecast dashboard.\n"
        "• Task #29: Model explainability with SHAP / feature importance visualizers.\n"
        "• Task #54: Week 7 Weekly Progress Report compilation."
    )
    p_next.paragraph_format.line_spacing = 1.15

    doc.save(OUTPUT_DOCX)
    print(f"Generated: {OUTPUT_DOCX}")

    try:
        shutil.copy2(OUTPUT_DOCX, DESKTOP_DOCX)
        print(f"Copied to Desktop: {DESKTOP_DOCX}")
    except Exception as e:
        print(f"Failed to copy to Desktop: {e}")


if __name__ == "__main__":
    create_report()
