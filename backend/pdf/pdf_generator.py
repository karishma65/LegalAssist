from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    ListFlowable,
    ListItem
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.pagesizes import A4
from urllib.parse import quote
from datetime import datetime
import json
import os
import re


# ======================================================
# SAFE JSON LOADER
# ======================================================
def safe_json_load(value, default):
    if not value:
        return default
    if isinstance(value, (dict, list)):
        return value
    try:
        return json.loads(value)
    except Exception:
        return default


# ======================================================
# CLEAN TEXT FORMATTING
# FIX: Remove ₹ symbol issue
# ======================================================
def clean_text(text):
    if not text:
        return ""

    text = str(text)

    # FIX FOR ₹ SYMBOL (prevents ■ squares)
    text = text.replace("₹", "Rs. ")

    text = re.sub(r'\.([A-Z])', r'. \1', text)
    text = re.sub(r'\?([A-Z])', r'? \1', text)
    text = re.sub(r'\!([A-Z])', r'! \1', text)

    return text


# ======================================================
# ROMAN NUMERAL GENERATOR
# ======================================================
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


# ======================================================
# PAGE LAYOUT
# ======================================================
def add_page_layout(canvas, doc):
    canvas.saveState()

    canvas.setStrokeColor(colors.black)
    canvas.setLineWidth(1)

    canvas.rect(30, 30, A4[0] - 60, A4[1] - 60)

    canvas.setFont("Helvetica", 9)

    canvas.drawRightString(
        A4[0] - 40,
        A4[1] - 40,
        f"Generated on: {datetime.now().strftime('%d %B %Y')}"
    )

    canvas.drawCentredString(
        A4[0] / 2,
        35,
        f"Page {doc.page}"
    )

    canvas.restoreState()


# ======================================================
# MAIN PDF GENERATOR
# ======================================================
def generate_case_pdf(case):

    os.makedirs("generated_pdfs", exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_path = f"generated_pdfs/case_{case.case_id}_{timestamp}.pdf"

    doc = SimpleDocTemplate(
        file_path,
        pagesize=A4,
        rightMargin=50,
        leftMargin=50,
        topMargin=70,
        bottomMargin=60
    )

    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        name="OfficialTitle",
        fontSize=18,
        alignment=1,
        spaceAfter=18,
        fontName="Helvetica-Bold"
    ))

    styles.add(ParagraphStyle(
        name="SectionHeader",
        fontSize=14,
        spaceBefore=18,
        spaceAfter=12,
        fontName="Helvetica-Bold"
    ))

    styles.add(ParagraphStyle(
        name="SubHeader",
        fontSize=12,
        spaceBefore=12,
        spaceAfter=8,
        fontName="Helvetica-Bold"
    ))

    styles.add(ParagraphStyle(
        name="NormalText",
        fontSize=11,
        leading=16,
        spaceAfter=8,
        alignment=4
    ))

    styles.add(ParagraphStyle(
        name="Question",
        fontSize=11,
        fontName="Helvetica-Bold",
        spaceBefore=6,
        spaceAfter=3
    ))

    styles.add(ParagraphStyle(
        name="Answer",
        fontSize=11,
        leftIndent=20,
        spaceAfter=10,
        leading=15,
        alignment=4
    ))

    content = []

    content.append(Paragraph(
        "OFFICIAL LEGAL CASE ANALYSIS REPORT",
        styles["OfficialTitle"]
    ))

    content.append(Spacer(1, 0.25 * inch))

    # ======================================================
    # CASE INTAKE SUMMARY
    # ======================================================
    content.append(Paragraph(
        "1. CASE INTAKE SUMMARY",
        styles["SectionHeader"]
    ))

    intake = safe_json_load(case.facts, case.facts)

    if isinstance(intake, dict):

        for key, value in intake.items():

            content.append(Paragraph(
                clean_text(key.replace("_", " ").title()),
                styles["SubHeader"]
            ))

            content.append(Paragraph(
                clean_text(value),
                styles["NormalText"]
            ))

    else:

        content.append(Paragraph(
            clean_text(intake),
            styles["NormalText"]
        ))

    # ======================================================
    # EXTRACTED CLAIMS
    # ======================================================
    content.append(Paragraph(
        "2. EXTRACTED LEGAL CLAIMS",
        styles["SectionHeader"]
    ))

    claims = safe_json_load(case.claims, [])

    if not claims:
        content.append(Paragraph(
            "No legal claims identified.",
            styles["NormalText"]
        ))

    else:

        for idx, c in enumerate(claims):

            content.append(Paragraph(
                f"{chr(97 + idx)}) {clean_text(c.get('claim', ''))}",
                styles["SubHeader"]
            ))

            bullets = []

            for jdx, ev in enumerate(c.get("required_evidence", [])):

                bullets.append(ListItem(
                    Paragraph(
                        f"({to_roman(jdx+1)}) {clean_text(ev)}",
                        styles["NormalText"]
                    )
                ))

            # FIX: Remove automatic numbering
            content.append(ListFlowable(
                bullets,
                leftIndent=20,
                bulletType="bullet",
                bulletText=""
            ))

    # ======================================================
    # EVIDENCE STATUS
    # ======================================================
    content.append(Paragraph(
        "3. EVIDENCE STATUS",
        styles["SectionHeader"]
    ))

    evidence = safe_json_load(case.evidence, {})

    if not evidence:

        content.append(Paragraph(
            "No evidence uploaded.",
            styles["NormalText"]
        ))

    else:

        for idx, (claim, evidence_list) in enumerate(evidence.items()):

            content.append(Paragraph(
                f"{chr(97 + idx)}) Claim: {clean_text(claim)}",
                styles["SubHeader"]
            ))

            if isinstance(evidence_list, list) and evidence_list:

                for file_idx, file_obj in enumerate(evidence_list):

                    if isinstance(file_obj, dict):
                        filename = file_obj.get("filename")
                        status = file_obj.get("status", "Unknown")
                    else:
                        filename = file_obj
                        status = "Unknown"

                    if not filename:
                        continue

                    safe_claim = claim.replace(" ", "_")

                    case_id_encoded = quote(str(case.case_id))
                    claim_encoded = quote(str(safe_claim))
                    filename_encoded = quote(str(filename))

                    file_url = (
                        f"http://127.0.0.1:8000/uploads/"
                        f"{case_id_encoded}/"
                        f"{claim_encoded}/"
                        f"{filename_encoded}"
                    )

                    content.append(Paragraph(
                        f"({to_roman(file_idx+1)}) {filename} — Status: {status}",
                        styles["NormalText"]
                    ))

                    content.append(Paragraph(
                        f'<font color="blue"><u>'
                        f'<a href="{file_url}">Download Evidence</a>'
                        f'</u></font>',
                        styles["NormalText"]
                    ))

                    content.append(Spacer(1, 8))

            else:

                content.append(Paragraph(
                    "No files uploaded for this claim.",
                    styles["NormalText"]
                ))

    # ======================================================
    # FOLLOW-UP QUESTIONS
    # ======================================================
    content.append(Paragraph(
        "4. FOLLOW-UP QUESTIONS & RESPONSES",
        styles["SectionHeader"]
    ))

    answers = safe_json_load(case.mock_answers, [])

    if not answers:

        content.append(Paragraph(
            "No follow-up responses submitted.",
            styles["NormalText"]
        ))

    else:

        for a in answers:

            question = clean_text(a.get('question', ''))
            answer = clean_text(a.get('answer', ''))

            if not answer:
                answer = "Not provided."

            content.append(Paragraph(
                f"Q: {question}",
                styles["Question"]
            ))

            content.append(Paragraph(
                f"A: {answer}",
                styles["Answer"]
            ))

    # ======================================================
    # BUILD PDF
    # ======================================================
    doc.build(
        content,
        onFirstPage=add_page_layout,
        onLaterPages=add_page_layout
    )

    return file_path