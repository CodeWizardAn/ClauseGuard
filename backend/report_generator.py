import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from database import get_contract, get_clauses

SEVERITY_COLORS = {
    "Critical": colors.HexColor("#E24B4A"),
    "High":     colors.HexColor("#EF9F27"),
    "Medium":   colors.HexColor("#378ADD"),
    "Low":      colors.HexColor("#639922"),
    "Clean":    colors.HexColor("#1D9E75")
}

SEVERITY_BG = {
    "Critical": colors.HexColor("#FCEBEB"),
    "High":     colors.HexColor("#FAEEDA"),
    "Medium":   colors.HexColor("#E6F1FB"),
    "Low":      colors.HexColor("#EAF3DE"),
    "Clean":    colors.HexColor("#E1F5EE")
}

def generate_report(contract_id: str, output_path: str) -> str:
    contract = get_contract(contract_id)
    clauses = get_clauses(contract_id)

    if not contract or not clauses:
        raise ValueError("Contract or clauses not found")

    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch
    )

    styles = getSampleStyleSheet()
    elements = []

    title_style = ParagraphStyle(
        "Title",
        fontSize=28,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#000000"),
        alignment=TA_CENTER,
        spaceAfter=6
    )
    subtitle_style = ParagraphStyle(
        "Subtitle",
        fontSize=13,
        fontName="Helvetica",
        textColor=colors.HexColor("#444444"),
        alignment=TA_CENTER,
        spaceAfter=4
    )
    section_style = ParagraphStyle(
        "Section",
        fontSize=14,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#000000"),
        spaceBefore=16,
        spaceAfter=8
    )
    body_style = ParagraphStyle(
        "Body",
        fontSize=10,
        fontName="Helvetica",
        textColor=colors.HexColor("#333333"),
        spaceAfter=6,
        leading=15
    )
    clause_style = ParagraphStyle(
        "Clause",
        fontSize=9,
        fontName="Helvetica",
        textColor=colors.HexColor("#555555"),
        spaceAfter=4,
        leading=13
    )
    rewrite_style = ParagraphStyle(
        "Rewrite",
        fontSize=9,
        fontName="Helvetica-Oblique",
        textColor=colors.HexColor("#085041"),
        spaceAfter=4,
        leading=13
    )

    elements.append(Spacer(1, 0.4 * inch))
    elements.append(Paragraph("ClauseGuard", title_style))
    elements.append(Spacer(1, 0.15 * inch))
    elements.append(Paragraph("AI Contract Risk Intelligence Report", subtitle_style))
    elements.append(Spacer(1, 0.08 * inch))
    elements.append(Paragraph("Powered by Indian Contract Law RAG System", subtitle_style))
    elements.append(Spacer(1, 0.25 * inch))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CCCCCC")))
    elements.append(Spacer(1, 0.2 * inch))

    overall = contract.get("overall_score", 0)
    if overall >= 75:
        score_color = colors.HexColor("#E24B4A")
        risk_label = "High Risk"
    elif overall >= 50:
        score_color = colors.HexColor("#EF9F27")
        risk_label = "Medium Risk"
    else:
        score_color = colors.HexColor("#639922")
        risk_label = "Low Risk"

    summary_data = [
        ["Contract", contract.get("original_filename", "Unknown")],
        ["Type", contract.get("contract_type", "Unknown")],
        ["Total Clauses", str(contract.get("total_clauses", 0))],
        ["Overall Risk Score", f"{overall}/100 — {risk_label}"],
        ["Status", contract.get("status", "").upper()],
    ]

    summary_table = Table(summary_data, colWidths=[2 * inch, 4.5 * inch])
    summary_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#333333")),
        ("TEXTCOLOR", (1, 0), (1, -1), colors.HexColor("#555555")),
        ("TEXTCOLOR", (1, 3), (1, 3), score_color),
        ("FONTNAME", (1, 3), (1, 3), "Helvetica-Bold"),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.HexColor("#F8F8F8"), colors.white]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#DDDDDD")),
        ("PADDING", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 0.2 * inch))

    critical = [c for c in clauses if c.get("severity") == "Critical"]
    high = [c for c in clauses if c.get("severity") == "High"]
    medium = [c for c in clauses if c.get("severity") == "Medium"]
    low = [c for c in clauses if c.get("severity") in ("Low", "Clean")]

    breakdown_data = [
        ["Severity", "Count", "Clauses"],
        ["Critical", str(len(critical)), ", ".join([f"#{c['clause_number']}" for c in critical]) or "None"],
        ["High", str(len(high)), ", ".join([f"#{c['clause_number']}" for c in high]) or "None"],
        ["Medium", str(len(medium)), ", ".join([f"#{c['clause_number']}" for c in medium]) or "None"],
        ["Low / Clean", str(len(low)), ", ".join([f"#{c['clause_number']}" for c in low]) or "None"],
    ]

    breakdown_table = Table(breakdown_data, colWidths=[1.5 * inch, 1 * inch, 4 * inch])
    breakdown_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F0F0F0")),
        ("TEXTCOLOR", (0, 1), (0, 1), colors.HexColor("#E24B4A")),
        ("TEXTCOLOR", (0, 2), (0, 2), colors.HexColor("#EF9F27")),
        ("TEXTCOLOR", (0, 3), (0, 3), colors.HexColor("#378ADD")),
        ("TEXTCOLOR", (0, 4), (0, 4), colors.HexColor("#639922")),
        ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#DDDDDD")),
        ("PADDING", (0, 0), (-1, -1), 8),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#FAFAFA")]),
    ]))

    elements.append(Paragraph("Risk Breakdown", section_style))
    elements.append(breakdown_table)
    elements.append(Spacer(1, 0.2 * inch))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CCCCCC")))

    elements.append(Paragraph("Clause Analysis", section_style))

    for clause in clauses:
        severity = clause.get("severity", "Medium")
        score = clause.get("risk_score", 0)
        sev_color = SEVERITY_COLORS.get(severity, colors.gray)
        sev_bg = SEVERITY_BG.get(severity, colors.white)

        header_data = [[
            f"Clause {clause['clause_number']}",
            f"{severity}  |  Score: {score}/100",
            clause.get("category", "General")
        ]]

        header_table = Table(header_data, colWidths=[1.5 * inch, 2.5 * inch, 2.5 * inch])
        header_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), sev_bg),
            ("TEXTCOLOR", (0, 0), (0, 0), colors.HexColor("#333333")),
            ("TEXTCOLOR", (1, 0), (1, 0), sev_color),
            ("TEXTCOLOR", (2, 0), (2, 0), colors.HexColor("#555555")),
            ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("PADDING", (0, 0), (-1, -1), 8),
            ("GRID", (0, 0), (-1, -1), 0.5, sev_color),
        ]))
        elements.append(header_table)

        clause_text = clause.get("clause_text", "")[:400]
        elements.append(Paragraph(f"<b>Original:</b> {clause_text}...", clause_style))

        explanation = clause.get("explanation", "")
        elements.append(Paragraph(f"<b>Risk:</b> {explanation}", body_style))

        rewrite = clause.get("rewrite")
        if rewrite:
            elements.append(Paragraph(f"<b>Suggested Rewrite:</b> {rewrite[:400]}", rewrite_style))

        elements.append(Spacer(1, 0.15 * inch))

    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CCCCCC")))
    elements.append(Spacer(1, 0.1 * inch))
    elements.append(Paragraph(
        "Generated by ClauseGuard — AI Contract Risk Intelligence for Indian SMBs. "
        "This report is for informational purposes only and does not constitute legal advice. "
        "Consult a qualified lawyer for legal decisions.",
        ParagraphStyle("Footer", fontSize=8, textColor=colors.HexColor("#999999"), alignment=TA_CENTER)
    ))

    doc.build(elements)
    return output_path


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        contract_id = sys.argv[1]
    else:
        from database import get_all_contracts
        contracts = get_all_contracts()
        if not contracts:
            print("No contracts found")
            sys.exit(1)
        contract = next((c for c in contracts if c["status"] == "complete"), None)
        if not contract:
            print("No complete contracts found")
            sys.exit(1)
        contract_id = contract["id"]

    print(f"Generating report for contract: {contract_id}")
    path = generate_report(contract_id, f"report_{contract_id[:8]}.pdf")
    print(f"Report saved to: {path}")