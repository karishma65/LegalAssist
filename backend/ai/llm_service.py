import os
import json
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY not found in environment variables")

# Configure Gemini
genai.configure(api_key=API_KEY)

MODEL_NAME = "models/gemini-2.5-flash"


def _get_text(response) -> str:
    """
    Safely extract text from Gemini API response
    """
    try:
        return response.text
    except Exception as e:
        print("Error extracting text:", e)
        return ""


# =========================
# STEP 1 — AI CASE INTAKE (REFINED)
# =========================
def ai_case_intake(description: str) -> dict:
    """
    Converts unstructured client narration into a
    structured, junior-lawyer-style legal intake report.
    """

    prompt = f"""
You are assisting in legal case intake.
Your role is to prepare a clean, professional intake note
similar to what a junior lawyer would prepare after
listening to a client.

Analyze the client description and extract factual,
neutral, and legally relevant information.

TASKS:
1. Prepare a clear case summary written in neutral legal language
2. Identify parties involved and clearly separate them
3. Construct a chronological timeline of events using explicit dates or periods
4. Automatically classify the case type (employment, civil, criminal, family, consumer, etc.)
5. Indicate prima facie case clarity (Yes / Unclear / No) based only on facts
6. List missing or unclear information that may require clarification

IMPORTANT INSTRUCTIONS:
- Do NOT give legal advice
- Do NOT predict outcomes
- Do NOT add new facts
- Do NOT use emotional or subjective language
- Rewrite facts clearly and professionally
- If dates are unclear, explicitly state that

RETURN ONLY VALID JSON.

OUTPUT FORMAT:
{{
  "case_summary": "Concise factual summary written in legal style",
  "parties": {{
    "complainant": "Client / role if known",
    "opposing_party": "Opposing party / role if known"
  }},
  "timeline": [
    "Event 1 with date or period",
    "Event 2 with date or period",
    "Event 3 with date or period"
  ],
  "case_type": "Employment / Civil / Criminal / Family / Consumer / Other",
  "prima_facie_status": "Yes / Unclear / No",
  "missing_information": [
    "Specific missing fact 1",
    "Specific missing fact 2"
  ]
}}

CLIENT DESCRIPTION:
{description}
"""

    try:
        model = genai.GenerativeModel(
            MODEL_NAME,
            generation_config={"response_mime_type": "application/json"}
        )
        response = model.generate_content(prompt)
        result = _get_text(response)

        if not result:
            return {}

        return json.loads(result)

    except Exception as e:
        print("Error in ai_case_intake:", e)
        return {}


# =========================
# STEP 2 — CLAIM EXTRACTION
# =========================
def extract_claims_with_evidence(intake_report: dict) -> list:
    """
    Extract possible legal claims and required evidence
    from structured intake report.
    """

    prompt = f"""
You are assisting in legal pre-analysis.

Based on the case intake report below,
identify all possible legal claims.

For EACH claim, list the expected supporting evidence.

Rules:
- NO legal advice
- NO assumptions beyond given facts
- Return ONLY valid JSON

Output format:
[
  {{
    "claim": "Claim name",
    "required_evidence": ["Evidence 1", "Evidence 2"]
  }}
]

Case Intake Report:
{json.dumps(intake_report, indent=2)}
"""

    try:
        model = genai.GenerativeModel(
            MODEL_NAME,
            generation_config={"response_mime_type": "application/json"}
        )
        response = model.generate_content(prompt)
        result = _get_text(response)

        if not result:
            return []

        data = json.loads(result)
        return data if isinstance(data, list) else []

    except Exception as e:
        print("Error in extract_claims_with_evidence:", e)
        return []


# =========================
# STEP 3 — EVIDENCE CHECK
# =========================
def check_evidence_consistency(*, claim: str, required_evidence: list, uploaded_evidence: list) -> dict:
    """
    Check whether uploaded evidence sufficiently supports a claim.
    """

    prompt = f"""
You are assisting in legal pre-analysis.

Claim:
{claim}

Expected supporting evidence:
{required_evidence}

Uploaded evidence:
{uploaded_evidence}

Classify the claim status.

Rules:
- Status must be one of: Supported, Weak, Missing
- NO legal advice
- Return ONLY JSON

Output format:
{{
  "status": "Supported / Weak / Missing",
  "notes": "Short factual reason"
}}
"""

    try:
        model = genai.GenerativeModel(
            MODEL_NAME,
            generation_config={"response_mime_type": "application/json"}
        )
        response = model.generate_content(prompt)
        result = _get_text(response)

        if not result:
            return {"status": "Missing", "notes": "No evidence provided"}

        return json.loads(result)

    except Exception as e:
        print("Error in check_evidence_consistency:", e)
        return {"status": "Weak", "notes": "Error during analysis"}


# =========================
# STEP 4 — FOLLOW-UP QUESTIONS
# =========================
def generate_mock_questions(*, claim: str, missing_evidence: list) -> list:
    """
    Generate lawyer-style follow-up questions.
    """

    prompt = f"""
You are assisting a lawyer during case preparation.

Claim:
{claim}

Missing or weak evidence:
{missing_evidence}

Generate factual follow-up questions
similar to those a lawyer may ask a client.

Rules:
- NO advice
- NO judgement
- Return ONLY a JSON list of questions
"""

    try:
        model = genai.GenerativeModel(
            MODEL_NAME,
            generation_config={"response_mime_type": "application/json"}
        )
        response = model.generate_content(prompt)
        result = _get_text(response)

        if not result:
            return []

        questions = json.loads(result)
        return questions if isinstance(questions, list) else []

    except Exception as e:
        print("Error in generate_mock_questions:", e)
        return []


# =========================
# STEP 5 — AI LOOPHOLE & RISK ANALYSIS
# =========================
def analyze_risks(*, facts: str, claims: list, evidence: dict, answers: list) -> dict:
    """
    Junior-lawyer level case risk and gap analysis.
    NO legal advice. NO predictions.
    """

    prompt = f"""
You are assisting a lawyer by preparing an internal
case pre-analysis report, similar to the work done by a junior lawyer.

Analyze the information below and identify factual gaps,
inconsistencies, and risk indicators ONLY.

CASE INTAKE FACTS:
{facts}

EXTRACTED CLAIMS:
{claims}

UPLOADED EVIDENCE:
{evidence}

CLIENT FOLLOW-UP ANSWERS:
{answers}

TASKS:
1. Identify legal loopholes caused by missing facts or weak links
2. Identify contradictions or inconsistencies in statements or evidence
3. Identify claims that appear weak or insufficiently supported
4. Identify possible challenges or objections the opposing party may raise
   (based only on missing or unclear information)
5. Identify jurisdiction or limitation risks IF timelines or locations are unclear

RULES:
- DO NOT give legal advice
- DO NOT suggest legal strategy
- DO NOT predict case outcomes
- DO NOT mention legal sections or laws
- Be neutral and factual
- Return ONLY structured JSON

OUTPUT FORMAT:
{{
  "loopholes": [],
  "contradictions": [],
  "weak_claims": [],
  "possible_opponent_challenges": [],
  "jurisdiction_or_limitation_risks": []
}}
"""

    try:
        model = genai.GenerativeModel(
            MODEL_NAME,
            generation_config={"response_mime_type": "application/json"}
        )
        response = model.generate_content(prompt)
        result = _get_text(response)

        if not result:
            return {}

        data = json.loads(result)
        return data if isinstance(data, dict) else {}

    except Exception as e:
        print("Error in analyze_risks:", e)
        return {}
