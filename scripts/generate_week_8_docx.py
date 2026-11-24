#!/usr/bin/env python3
"""
CashPredix - Week 8 Word Document (.docx) Report Generator
Generates a formal, professionally styled academic progress report for Week 8.
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
OUTPUT_DOCX = BASE_DIR / "docs" / "Week_8_Weekly_Progress_Report_CashPredix.docx"
DESKTOP_DOCX = Path("/Users/merve/Desktop/Week_8_Weekly_Progress_Report_CashPredix.docx")


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
    run_sub = p_sub.add_run("Week 8: Cashflow Prediction UI, Multi-Horizon Timeframe Selectors, Responsive Visualizations & Forecasting Schedule")
    run_sub.font.name = "Calibri"
    run_sub.font.size = Pt(13)
    run_sub.font.color.rgb = c_muted
    run_sub.italic = True

    # Metadata Table
    meta_table = doc.add_table(rows=5, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_data = [
        ("Project Title:", "CashPredix — Autonomous Liquidity Prediction & Accounts Receivable Management"),
        ("Sprint Period:", "Week 8 (November 16, 2026 – November 22, 2026)"),
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
        "During Week 8, the project achieved the complete realization of the Cash Flow Forecasting Engine (Step 5 Integration), "
        "providing real-time liquidity aggregation across all customers belonging to the authenticated user. "
        "The core objective was delivering complete visibility across five crucial time horizons: This Week (0-7 days), Next Week (8-14 days), "
        "In Two Weeks (15-21 days), Month Total (0-30 days), and Fiscal Year Total (365 days). "
        "Interactive timeframe selector filters were implemented allowing users to isolate individual collection windows or inspect the full portfolio. "
        "Responsive financial charts were built to visualize weekly cash distributions alongside a 12-month annual projection curve evaluated against "
        "a $50,000 minimum operating cash safety buffer. Finally, an enterprise-grade Cash Flow Forecasting Table was delivered, featuring live counterparty "
        "breakdowns, search, tier filters, pagination, and one-click CSV export."
    )
    p_exec.paragraph_format.line_spacing = 1.15
    p_exec.paragraph_format.space_after = Pt(8)

    add_callout(
        doc,
        "All Week 8 deliverables (#30, #31, #32, #55) were completed with 100% test pass rates and successful production builds. "
        "Both the homepage dashboard and the Cashflow Predicts interface now aggregate all customer accounts in real-time, "
        "concluding the primary functional milestones of the CashPredix platform.",
        title="WEEK 8 MILESTONE DELIVERED"
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
        ("Task #30", "Cashflow Prediction UI & Weekly Timeframe Selectors (Step 5)", "Built Cashflow Predicts view integrating Step 5 aggregation. Implemented interactive timeframe selector tabs (This Week, Next Week, In 2 Weeks, Month Total, Yearly) and 5 primary liquidity KPI cards."),
        ("Task #31", "Cash Flow Visualizations (Weekly, Monthly, Yearly Charts)", "Engineered responsive weekly cash flow bar charts and a 12-month yearly forecast projection curve benchmarking projected monthly liquidity against a $50,000 minimum operating buffer."),
        ("Task #32", "Cash Flow Forecasting Table & Real-Time Aggregation State", "Delivered detailed customer cash flow schedule table listing all user-owned counterparties with horizon breakdown, search, pagination, real-time recalculation event listeners, and 12-month CSV forecast export."),
        ("Task #55", "Week 8 Progress Report", "Generated academic progress report in Markdown (docs/WEEK_8_PROGRESS_REPORT.md) and Microsoft Word (.docx) formats.")
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
    r_t1_h = p_t1.add_run("3.1 Portfolio Cash Flow Aggregation Across All User Counterparties (Step 5)\n")
    r_t1_h.bold = True
    r_t1_h.font.color.rgb = c_primary
    p_t1.add_run(
        "In Task #30, the centralized cash flow engine (src/lib/cashflowService.js) was architected to evaluate each customer owned by "
        "the logged-in tenant. For each customer, the model projects payment maturity based on payment terms, reliability score, and installment split rate, "
        "distributing cash inflows into calendar intervals: This Week (0-7d), Next Week (8-14d), In Two Weeks (15-21d), Month Total (0-30d), and Fiscal Year Run-rate. "
        "The portfolio aggregation functions compute the exact sum across all customer records, delivering consistent, real-time liquidity numbers on both "
        "the Welcome Dashboard and the Cashflow Predicts interface."
    )
    p_t1.paragraph_format.line_spacing = 1.15
    p_t1.paragraph_format.space_after = Pt(8)

    p_t2 = doc.add_paragraph()
    r_t2_h = p_t2.add_run("3.2 Responsive Cash Flow Visualizations & Minimum Operating Safety Buffer\n")
    r_t2_h.bold = True
    r_t2_h.font.color.rgb = c_primary
    p_t2.add_run(
        "In Task #31, responsive SVG and Tailwind visual components were implemented. A weekly liquidity distribution chart provides comparative analysis "
        "of inflow velocity across the four weekly collection gates. In parallel, a 12-month annual projection curve plots monthly forecasted receipts "
        "against an explicit $50,000 minimum operating cash buffer threshold. This enables executive users to immediately detect liquidity shortfalls, "
        "capital surpluses, or seasonality dips."
    )
    p_t2.paragraph_format.line_spacing = 1.15
    p_t2.paragraph_format.space_after = Pt(8)

    p_t3 = doc.add_paragraph()
    r_t3_h = p_t3.add_run("3.3 Customer Cash Flow Forecasting Schedule Table & Export Engine\n")
    r_t3_h.bold = True
    r_t3_h.font.color.rgb = c_primary
    p_t3.add_run(
        "In Task #32, an enterprise-grade forecasting table was implemented. Each row displays counterparty identity, payment terms, reliability index, "
        "and specific dollar amounts scheduled for This Week, Next Week, In 2 Weeks, Month Total, and Yearly run-rate. "
        "The interface includes search, tier filtering, pagination, and real-time state synchronization via custom window event subscribers. "
        "Users can export the full 12-month cash flow schedule directly to CSV for external corporate reporting."
    )
    p_t3.paragraph_format.line_spacing = 1.15
    p_t3.paragraph_format.space_after = Pt(12)

    # 4. Conclusion
    h1_next = doc.add_heading("4. Sprint Conclusion & Project Milestone Complete", level=1)
    h1_next.paragraph_format.space_before = Pt(12)
    h1_next.paragraph_format.space_after = Pt(6)

    p_next = doc.add_paragraph(
        "Week 8 successfully delivered all planned features for Step 5 cash flow aggregation, timeframe selectors, responsive visualization curves, "
        "and forecasting schedule tables. The CashPredix platform now provides an end-to-end, production-ready solution for B2B accounts receivable "
        "liquidity forecasting and credit risk scoring."
    )
    p_next.paragraph_format.line_spacing = 1.15

    doc.save(str(OUTPUT_DOCX))
    try:
        shutil.copy(OUTPUT_DOCX, DESKTOP_DOCX)
    except Exception:
        pass
    print(f"Week 8 Word Document Report generated successfully at: {OUTPUT_DOCX}")


if __name__ == "__main__":
    create_report()
