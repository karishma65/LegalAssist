from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from datetime import datetime
import json
import os


# -----------------------------
# SAFE JSON LOADER
# -----------------------------
def safe_json_load(value, default):
    if not value:
        return default
    if isinstance(value, (dict, list)):
        return value
    try:
        return json.loads(value)
    except Exception:
        return default


# -----------------------------
# ROMAN NUMERAL GENERATOR
# -----------------------------
def to_roman(n):
    romans = [
        (1000, 'm'), (900, 'cm'), (500, 'd'), (400, 'cd'),
        (100, 'c'), (90, 'xc'), (50, 'l'), (40, 'xl'),
        (10, 'x'), (9, 'ix'), (5, 'v'), (4, 'iv'), (1, 'i')
    ]
    result = ''
    for value, numeral in romans:
        while n >= value:
            result += numeral
            n -= value
    return result


# -----------------------------
# PAGE DECORATION
# -----------------------------
def add_page_layout(canvas, doc):
    canvas.saveState()

    canvas.setStrokeColor(colors.grey)
    canvas.rect(20, 20, A4[0] - 40, A4[1] - 40, stroke=1, fill=0)

    canvas.setFont("Helvetica", 9)
    canvas.drawRightString(
        A4[0] - 40,
        A4[1] - 30,
        f"Generated on: {datetime.now().strftime('%d %b %Y')}"
    )

    canvas.drawCentredString(
        A4[0] / 2,
        25,
        f"Page {doc.page}"
    )

    canvas.restoreState()


# -----------------------------
# MAIN PDF GENERATOR
# -----------------------------
def generate_case_pdf(case):

    file_path = f"generated_pdfs/case_{case.case_id}.pdf"
    os.makedirs("generated_pdfs", exist_ok=True)

    doc = SimpleDocTemplate(
        file_path,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=60,
        bottomMargin=50
    )

    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        name="SectionHeader",
        fontSize=14,
        textColor=colors.darkblue,
        spaceBefore=14,
        spaceAfter=10,
        fontName="Helvetica-Bold"
    ))

    styles.add(ParagraphStyle(
        name="SubHeader",
        fontSize=11,
        textColor=colors.darkred,
        spaceBefore=8,
        spaceAfter=6,
        fontName="Helvetica-Bold"
    ))

    styles.add(ParagraphStyle(
        name="Question",
        fontSize=10,
        textColor=colors.darkgreen,
        spaceAfter=4,
        fontName="Helvetica-Bold"
    ))

    styles.add(ParagraphStyle(
        name="Answer",
        fontSize=10,
        leftIndent=18,
        spaceAfter=8
    ))

    styles.add(ParagraphStyle(
        name="NormalText",
        fontSize=10,
        spaceAfter=6
    ))

    content = []

    # ======================================================
    # TITLE
    # ======================================================
    content.append(Paragraph(
        "AI-Assisted Lawyer-Ready Case Report",
        styles["Title"]
    ))
    content.append(Spacer(1, 12))

    # ======================================================
    # 1. CASE INTAKE SUMMARY
    # ======================================================
    content.append(Paragraph("1. Case Intake Summary", styles["SectionHeader"]))

    intake = safe_json_load(case.facts, case.facts)

    if isinstance(intake, dict):
        for key, value in intake.items():
            content.append(
                Paragraph(key.replace("_", " ").title(), styles["SubHeader"])
            )
            content.append(
                Paragraph(str(value), styles["NormalText"])
            )
    else:
        content.append(
            Paragraph(str(intake), styles["NormalText"])
        )

    # ======================================================
    # 2. EXTRACTED LEGAL CLAIMS
    # ======================================================
    content.append(Paragraph("2. Extracted Legal Claims", styles["SectionHeader"]))

    claims = safe_json_load(case.claims, [])

    if not claims:
        content.append(Paragraph("No legal claims identified.", styles["NormalText"]))
    else:
        for idx, c in enumerate(claims):
            content.append(
                Paragraph(f"{chr(97 + idx)}) {c.get('claim', '')}", styles["SubHeader"])
            )

            sub = []
            for jdx, ev in enumerate(c.get("required_evidence", [])):
                sub.append(
                    ListItem(
                        Paragraph(
                            f"({to_roman(jdx + 1)}) {ev}",
                            styles["NormalText"]
                        )
                    )
                )
            content.append(ListFlowable(sub))

    # ======================================================
    # 3. EVIDENCE STATUS
    # ======================================================
    content.append(Paragraph("3. Evidence Status", styles["SectionHeader"]))

    evidence = safe_json_load(case.evidence, {})

    if not evidence:
        content.append(Paragraph("No evidence uploaded.", styles["NormalText"]))
    else:
        for idx, (claim, e) in enumerate(evidence.items()):
            content.append(
                Paragraph(f"{chr(97 + idx)}) Claim: {claim}", styles["SubHeader"])
            )
            content.append(
                Paragraph(
                    f"Status: {e.get('status', 'Unknown')}",
                    styles["NormalText"]
                )
            )

    # ======================================================
    # 4. FOLLOW-UP QUESTIONS & ANSWERS
    # ======================================================
    content.append(
        Paragraph("4. Follow-up Questions & Answers", styles["SectionHeader"])
    )

    answers = safe_json_load(case.mock_answers, [])

    if not answers:
        content.append(
            Paragraph("No follow-up responses submitted.", styles["NormalText"])
        )
    else:
        for a in answers:
            content.append(
                Paragraph(f"Q: {a.get('question','')}", styles["Question"])
            )
            content.append(
                Paragraph(f"A: {a.get('answer','')}", styles["Answer"])
            )

    # ======================================================
    # 5. RISK & LOOPHOLE ANALYSIS
    # ======================================================
    content.append(
        Paragraph("5. Risk & Loophole Analysis", styles["SectionHeader"])
    )

    risk = safe_json_load(case.risk_report, {})

    def render_risk(title, items):
        content.append(Paragraph(title, styles["SubHeader"]))
        if not items:
            content.append(
                Paragraph("No issues identified in this category.", styles["NormalText"])
            )
        else:
            bullets = []
            for idx, item in enumerate(items):
                bullets.append(
                    ListItem(
                        Paragraph(
                            f"{chr(97 + idx)}) {item}",
                            styles["NormalText"]
                        )
                    )
                )
            content.append(ListFlowable(bullets))

    render_risk("Missing Information", risk.get("missing_information", []))
    render_risk("Weak Claims", risk.get("weak_claims", []))
    render_risk("Unanswered Questions", risk.get("unanswered_questions", []))
    render_risk("Risk Flags", risk.get("risk_flags", []))

    # ======================================================
    # BUILD PDF
    # ======================================================
    doc.build(
        content,
        onFirstPage=add_page_layout,
        onLaterPages=add_page_layout
    )

    return file_path