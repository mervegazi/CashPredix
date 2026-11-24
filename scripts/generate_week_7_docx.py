#!/usr/bin/env python3
"""
CashPredix - Week 7 Word Document (.docx) Report Generator
Generates a formal, professionally styled academic progress report for Week 7.
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
OUTPUT_DOCX = BASE_DIR / "docs" / "Week_7_Weekly_Progress_Report_CashPredix.docx"
DESKTOP_DOCX = Path("/Users/merve/Desktop/Week_7_Weekly_Progress_Report_CashPredix.docx")


def set_cell_background(cell, fill_hex):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tc_pr.append(shd)


def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
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
    run_sub = p_sub.add_run("Week 7: Dashboard UI Layout, Customer Reliability Score Badges & Drill-Down Ledger Modals")
    run_sub.font.name = "Calibri"
    run_sub.font.size = Pt(13)
    run_sub.font.color.rgb = c_muted
    run_sub.italic = True

    # Metadata Table
    meta_table = doc.add_table(rows=5, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_data = [
        ("Project Title:", "CashPredix — Autonomous Liquidity Prediction & Accounts Receivable Management"),
        ("Sprint Period:", "Week 7 (November 9, 2026 – November 15, 2026)"),
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
        "During Week 7, the engineering focus centered on advanced frontend UI architecture, customer reliability scoring visual integration, "
        "and interactive accounts receivable (AR) drill-down modals. The core objective was connecting the Step 2 Divided-Invoice Penalty Scoring algorithm "
        "and Step 4 Dynamic Scenario Text Generator directly into customer registry interfaces. Customer reliability scores (0-100) were categorized into four "
        "rigorous tiers: Prime (>=88), Stable (72-87), Watchlist (50-71), and High Risk (<50). Interactive tooltips were developed to expose the exact "
        "penalty scoring formula, displaying the base score, historical installment split rate, and penalty deductions (-5 * split_rate). Furthermore, an expandable "
        "AR ledger modal was implemented, allowing executives to inspect past split payments vs. single transactions, filter by prediction status (On-Time, Delayed, Split, Open), "
        "and review Step 4 synthesized scenario narratives."
    )
    p_exec.paragraph_format.line_spacing = 1.15
    p_exec.paragraph_format.space_after = Pt(8)

    add_callout(
        doc,
        "All Week 7 deliverables (#27, #28, #29, #54) were successfully engineered and integrated into the React application. "
        "Customer registries now provide instant visibility into credit risk, installment friction, and predicted payment schedules, "
        "backed by responsive UI components and 100% production build stability.",
        title="WEEK 7 MILESTONE DELIVERED"
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
        ("Task #27", "Dashboard UI Layout & Customer Score Badges (Step 2)", "Integrated Customer Reliability Score (0-100) badges across customer tables and headers, color-coded into 4 tiers (Prime >=88, Stable 72-87, Watchlist 50-71, High Risk <50) with formula penalty tooltips."),
        ("Task #28", "Render Scenario Text Cards & Invoice Prediction Rows (Step 4)", "Built Dynamic Scenario Text cards synthesizing natural language predictions, divided invoice breakdown (Part 1 and Part 2 amounts/dates), and 12-class probability distribution chips."),
        ("Task #29", "Customer Drill-Down & Split Payment Ledger Modals", "Engineered CustomerLedgerModal.jsx with expandable multi-part installment ledger, On-Time vs. Delayed status filtering, post-dated check tracking, and client-side pagination."),
        ("Task #54", "Week 7 Progress Report", "Generated academic progress report in Markdown (docs/WEEK_7_PROGRESS_REPORT.md) and Microsoft Word (.docx) formats.")
    ]

    for i, (tid, obj, imp) in enumerate(tasks_data):
        row = deliv_table.rows[i + 1]
        c0, c1, c2 = row.cells[0], row.cells[1], row.cells[2]
        c0.width, c1.width, c2.width = Inches(1.1), Inches(2.4), Inches(3.0)
        bg = "FFFFFF" if i % 2 == 0 else "F8FAFC"
        set_cell_background(c0, bg)
        set_cell_background(c1, bg)
        set_cell_background(c2, bg)
        set_cell_margins(c0, top=70, bottom=70, left=100, right=100)
        set_cell_margins(c1, top=70, bottom=70, left=100, right=100)
        set_cell_margins(c2, top=70, bottom=70, left=100, right=100)

        for cell, txt, is_bold, color in [
            (c0, tid, True, c_primary),
            (c1, obj, False, c_dark),
            (c2, imp, False, c_dark)
        ]:
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.15
            r = p.add_run(txt)
            r.bold = is_bold
            r.font.name = "Calibri"
            r.font.size = Pt(9)
            r.font.color.rgb = color

    p_div2 = doc.add_paragraph()
    p_div2.paragraph_format.space_before = Pt(8)

    # 3. Technical Implementation Details
    h1_tech = doc.add_heading("3. Technical Implementation & Architecture", level=1)
    h1_tech.paragraph_format.space_before = Pt(12)
    h1_tech.paragraph_format.space_after = Pt(6)

    p_t1 = doc.add_paragraph()
    r_t1_h = p_t1.add_run("3.1 Customer Reliability Score Badges & Step 2 Penalty Integration\n")
    r_t1_h.bold = True
    r_t1_h.font.color.rgb = c_primary
    p_t1.add_run(
        "In Task #27, the Step 2 Divided-Invoice Penalty Scoring algorithm was integrated directly into customer table rows and headers. "
        "The scoring engine evaluates the historical propensity of a commercial client to divide invoices into installments, calculating: "
        "Final Score = max(0, min(100, round(Base Score - 5 * Split Rate))). Four distinct tiers provide intuitive operational risk categorization:\n"
        "• Prime Tier (Score >= 88): Benchmark clients exhibiting punctual settlement and minimal divided invoice frequency (Emerald badge).\n"
        "• Stable Tier (Score 72 - 87): Standard operational clients with commercial consistency and low installment drag (Blue badge).\n"
        "• Watchlist Tier (Score 50 - 71): Clients with elevated split frequency and minor collection friction (Amber badge).\n"
        "• High Risk Tier (Score < 50): Problematic counterparties with chronic payment delays and heavy split friction (Rose badge).\n"
        "Interactive tooltips hover over each badge to show the exact mathematical breakdown, including Base Behavioral Score, Historical Split Rate, "
        "Divided-Invoice Penalty Deduction, and targeted mitigation recommendations."
    )
    p_t1.paragraph_format.line_spacing = 1.15
    p_t1.paragraph_format.space_after = Pt(8)

    p_t2 = doc.add_paragraph()
    r_t2_h = p_t2.add_run("3.2 Step 4 Dynamic Scenario Text Synthesis & 12-Class Chips\n")
    r_t2_h.bold = True
    r_t2_h.font.color.rgb = c_primary
    p_t2.add_run(
        "In Task #28, the Dynamic Scenario Text card generated in Step 4 was connected to customer detail views and ledger simulations. "
        "The system converts complex multi-output regression vectors into clear executive narratives, specifying the exact dollar amounts and calendar "
        "dates for Part 1 and Part 2 installments. In addition, probability distribution chips visualize the underlying 12-class LightGBM predictions, "
        "allowing credit managers to examine the probability split between early, on-time, and delayed payment horizons."
    )
    p_t2.paragraph_format.line_spacing = 1.15
    p_t2.paragraph_format.space_after = Pt(8)

    p_t3 = doc.add_paragraph()
    r_t3_h = p_t3.add_run("3.3 Accounts Receivable Drill-Down & Status Filter Ledger Modal\n")
    r_t3_h.bold = True
    r_t3_h.font.color.rgb = c_primary
    p_t3.add_run(
        "In Task #29, CustomerLedgerModal.jsx was enhanced to provide an exhaustive AR ledger view. Transactions display multi-part split installments, "
        "payment method instruments (SWIFT, ACH, post-dated checks), factoring status, Days Sales Outstanding (DSO) delay, and invoice settlement status. "
        "Users can filter transactions by On-Time, Delayed, Split Payments, Post-Dated Checks, or Open Receivables, supported by client-side pagination "
        "for instant response across large enterprise datasets."
    )
    p_t3.paragraph_format.line_spacing = 1.15
    p_t3.paragraph_format.space_after = Pt(12)

    # 4. Conclusion & Next Steps
    h1_next = doc.add_heading("4. Sprint Conclusion & Transition to Week 8", level=1)
    h1_next.paragraph_format.space_before = Pt(12)
    h1_next.paragraph_format.space_after = Pt(6)

    p_next = doc.add_paragraph(
        "Week 7 completed all front-facing customer score badges, scenario narrative cards, and AR ledger drill-down modals. "
        "The system provides complete visual transparency into customer credit reliability and installment behavior. "
        "This lays the complete groundwork for Week 8 deliverables: the portfolio-wide Cash Flow Forecasting Table, weekly timeframe selectors "
        "(This Week, Next Week, In 2 Weeks, Month Total, Yearly), responsive 12-month visualization curves against operating safety buffers, "
        "and full schedule CSV exports."
    )
    p_next.paragraph_format.line_spacing = 1.15

    doc.save(str(OUTPUT_DOCX))
    try:
        shutil.copy(OUTPUT_DOCX, DESKTOP_DOCX)
    except Exception:
        pass
    print(f"Week 7 Word Document Report generated successfully at: {OUTPUT_DOCX}")


if __name__ == "__main__":
    create_report()
