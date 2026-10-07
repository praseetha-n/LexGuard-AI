"""
analyzer.py - Query Intelligence NLP Engine for LexGuard AI.

This module provides rule-based NLP preprocessing, text normalization,
deterministic legal area classification, and structured keyword extraction
specifically designed for Sri Lankan employment law queries.
"""

import re
from typing import Dict, List, Optional, Set, Tuple

from shared.schemas.query_output import QueryOutput


# Sri Lankan Employment Law Recognized Primary Legal Areas
LEGAL_AREAS: List[str] = [
    "termination",
    "leave",
    "wages",
    "working_hours",
    "gratuity"
]

UNKNOWN_AREA: str = "unknown"

# Common stopwords to exclude from search keywords.
# Excludes conversational pronouns, auxiliary verbs, prepositions, and fillers.
STOPWORDS: Set[str] = {
    # Articles & demonstratives
    "a", "an", "the", "this", "that", "these", "those",
    # Pronouns
    "i", "me", "my", "myself", "we", "us", "our", "ours", "ourselves",
    "you", "your", "yours", "yourself", "yourselves",
    "he", "him", "his", "himself", "she", "her", "hers", "herself",
    "it", "its", "itself", "they", "them", "their", "theirs", "themselves",
    "what", "which", "who", "whom", "whose", "where", "when", "why", "how",
    # Auxiliaries & common verbs
    "am", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "having", "do", "does", "did", "doing",
    "can", "could", "shall", "should", "will", "would", "may", "might", "must",
    "get", "gets", "got", "getting", "take", "takes", "took", "taking",
    "make", "makes", "made", "making", "give", "gives", "gave", "giving",
    "tell", "tells", "told", "telling", "say", "says", "said", "saying",
    "know", "knows", "knew", "want", "wants", "wanted",
    # Prepositions & conjunctions
    "about", "above", "across", "after", "against", "along", "among", "around",
    "at", "before", "behind", "below", "beneath", "beside", "between", "beyond",
    "by", "down", "during", "except", "for", "from", "in", "inside", "into",
    "near", "of", "off", "on", "onto", "out", "outside", "over", "past",
    "through", "throughout", "to", "toward", "towards", "under", "underneath",
    "until", "up", "upon", "with", "within", "without",
    "and", "but", "or", "nor", "so", "yet", "although", "because", "since",
    "unless", "while", "if", "then", "also", "just", "very", "too", "really",
    "quite", "already", "still", "again", "there", "here",
    # Quantifiers & fillers
    "all", "any", "both", "each", "every", "few", "more", "most", "much",
    "other", "some", "such", "no", "not", "only", "same", "than", "now",
    "please", "something", "anything", "nothing", "someone", "anyone", "everyone",
    "unrelated", "law", "legal", "employment"
}

# Multi-word phrase normalizations (matched longest first)
PHRASE_NORMALIZATIONS: List[Tuple[str, str]] = [
    # Termination phrases
    ("wrongful termination", "termination"),
    ("unfair dismissal", "termination"),
    ("constructive dismissal", "termination"),
    ("without warning", "without notice"),
    ("no warning", "without notice"),
    ("without any warning", "without notice"),
    ("without any notice", "without notice"),
    ("no notice", "without notice"),
    ("notice period", "notice"),
    ("laid off", "termination"),
    ("lay off", "termination"),
    ("let go", "termination"),
    # Leave phrases
    ("annual holiday", "annual leave"),
    ("annual holidays", "annual leave"),
    ("annual leaves", "annual leave"),
    ("sick leaves", "sick leave"),
    ("medical leaves", "medical leave"),
    ("casual leaves", "casual leave"),
    ("maternity leaves", "maternity leave"),
    ("public holiday", "holiday"),
    ("public holidays", "holiday"),
    ("mercantile holiday", "holiday"),
    ("mercantile holidays", "holiday"),
    ("statutory holiday", "holiday"),
    ("statutory holidays", "holiday"),
    # Wages phrases
    ("minimum wage", "minimum wage"),
    ("national minimum wage", "minimum wage"),
    ("basic salary", "salary"),
    ("unpaid salary", "unpaid wages"),
    ("unpaid salaries", "unpaid wages"),
    ("unpaid wage", "unpaid wages"),
    ("unpaid wages", "unpaid wages"),
    ("not paid", "wages"),
    ("has not paid", "wages"),
    ("have not paid", "wages"),
    ("haven't paid", "wages"),
    ("hasn't paid", "wages"),
    ("salary deduction", "deduction"),
    ("pay cut", "deduction"),
    ("pay slip", "payslip"),
    # Working hours phrases
    ("working hours", "working hours"),
    ("work hours", "working hours"),
    ("working hour", "working hours"),
    ("work hour", "working hours"),
    ("extra hours", "overtime"),
    ("night shift", "shift"),
    ("rest interval", "rest interval"),
    ("rest intervals", "rest interval"),
    ("rest day", "rest day"),
    ("meal break", "meal break"),
    ("lunch break", "meal break"),
    # Gratuity phrases
    ("service benefit", "gratuity"),
    ("service benefits", "gratuity"),
    ("retirement benefit", "gratuity"),
    ("retirement benefits", "gratuity"),
    ("terminal benefit", "gratuity"),
    ("terminal benefits", "gratuity"),
    ("end of service benefit", "gratuity"),
    ("payment of gratuity", "gratuity"),
]

# Single-word colloquial synonyms to canonical forms
WORD_NORMALIZATIONS: Dict[str, str] = {
    # Employer synonyms
    "boss": "employer",
    "supervisor": "employer",
    "manager": "employer",
    "management": "employer",
    # Termination synonyms
    "fired": "termination",
    "fire": "termination",
    "firing": "termination",
    "dismissed": "termination",
    "dismissal": "termination",
    "dismiss": "termination",
    "sack": "termination",
    "sacked": "termination",
    "sacking": "termination",
    "terminate": "termination",
    "terminated": "termination",
    "terminating": "termination",
    "retrenched": "termination",
    "retrenchment": "termination",
    "retrench": "termination",
    "resigned": "resignation",
    "resignation": "resignation",
    "resign": "resignation",
    # Wages synonyms
    "salary": "wages",
    "salaries": "wages",
    "wage": "wages",
    "wages": "wages",
    "pay": "wages",
    "paid": "wages",
    "payment": "wages",
    "remuneration": "wages",
    "earnings": "wages",
    # Working hours synonyms
    "overtime": "overtime",
    "ot": "overtime",
    # Leave synonyms
    "holiday": "leave",
    "holidays": "leave",
    "vacation": "leave",
    # Gratuity synonyms
    "gratuity": "gratuity",
}

# Legal Area Classification Rules with weighted heuristics
LEGAL_AREA_RULES: Dict[str, Dict[str, List[str]]] = {
    "termination": {
        "phrases": [
            "wrongful termination", "unfair dismissal", "constructive dismissal",
            "without notice", "without warning", "no notice", "notice period",
            "laid off", "lay off", "let go", "end my contract", "ended my contract",
            "lose my job", "lost my job"
        ],
        "strong_terms": [
            "fire", "fired", "firing", "dismiss", "dismissed", "dismissal",
            "sack", "sacked", "sacking", "terminate", "terminated", "terminating",
            "termination", "retrench", "retrenched", "retrenchment", "severance",
            "resignation", "resign", "resigned"
        ],
        "context_terms": [
            "notice", "probation"
        ]
    },
    "leave": {
        "phrases": [
            "annual leave", "sick leave", "maternity leave", "paternity leave",
            "casual leave", "medical leave", "privilege leave", "unpaid leave",
            "annual holiday", "annual holidays", "public holiday", "public holidays",
            "mercantile holiday", "mercantile holidays", "statutory holiday",
            "statutory holidays", "leave days", "day off", "days off", "time off",
            "leave entitlement"
        ],
        "strong_terms": [
            "leave", "leaves", "holiday", "holidays", "vacation"
        ],
        "context_terms": [
            "entitlement", "entitled", "confinement"
        ]
    },
    "wages": {
        "phrases": [
            "minimum wage", "national minimum wage", "basic salary", "unpaid salary",
            "not paid", "has not paid", "have not paid", "haven't paid", "hasn't paid",
            "pay cut", "salary deduction", "pay slip", "payslip",
            "cost of living allowance"
        ],
        "strong_terms": [
            "salary", "salaries", "wage", "wages", "remuneration", "earnings"
        ],
        "context_terms": [
            "pay", "paid", "payment", "deduction", "deductions", "allowance", "bonus", "unpaid"
        ]
    },
    "working_hours": {
        "phrases": [
            "working hours", "work hours", "working hour", "work hour", "extra hours",
            "night shift", "rest interval", "rest intervals", "rest day", "meal break",
            "lunch break", "hours a day", "hours per day", "hours a week",
            "hours per week", "maximum hours"
        ],
        "strong_terms": [
            "overtime", "ot"
        ],
        "context_terms": [
            "shift", "shifts", "hours"
        ]
    },
    "gratuity": {
        "phrases": [
            "service benefit", "service benefits", "retirement benefit",
            "retirement benefits", "terminal benefit", "terminal benefits",
            "end of service", "payment of gratuity", "gratuity act"
        ],
        "strong_terms": [
            "gratuity"
        ],
        "context_terms": [
            "retirement", "retire"
        ]
    }
}


def normalize_text(text: str) -> str:
    """
    Normalizes raw user text by:
    1. Lowercasing.
    2. Stripping punctuation while preserving alphanumeric characters and spacing.
    3. Normalizing common multi-word employment phrases.
    4. Mapping colloquial synonyms (e.g., 'boss' -> 'employer', 'fired' -> 'termination')
       to canonical employment-law terminology.
    """
    if not text or not isinstance(text, str):
        return ""

    lowered = text.lower()
    cleaned = re.sub(r"[^a-z0-9\s_-]", " ", lowered)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()

    # Apply phrase normalizations first
    for phrase, replacement in PHRASE_NORMALIZATIONS:
        pattern = r"\b" + re.escape(phrase) + r"\b"
        cleaned = re.sub(pattern, replacement, cleaned)

    tokens = cleaned.split()
    normalized_tokens: List[str] = []

    # Check whether the context is employment-related to map 'company' -> 'employer'
    has_employment_context = any(
        tok in WORD_NORMALIZATIONS or tok in {
            "employer", "employee", "work", "job", "contract", "staff", "worker", "employment"
        }
        for tok in tokens
    )

    for tok in tokens:
        if tok == "company" and has_employment_context:
            normalized_tokens.append("employer")
        elif tok in WORD_NORMALIZATIONS:
            normalized_tokens.append(WORD_NORMALIZATIONS[tok])
        else:
            normalized_tokens.append(tok)

    return " ".join(normalized_tokens)


def classify_legal_area(query: str, normalized_text: Optional[str] = None) -> str:
    """
    Deterministically classifies a user's employment query into one of:
    - 'termination'
    - 'leave'
    - 'wages'
    - 'working_hours'
    - 'gratuity'
    - 'unknown'

    Scoring model:
    - Multi-word phrase matches: 3.0 points
    - Strong domain terms: 2.0 points
    - Contextual terms: 1.0 point
    """
    if not query or not query.strip():
        return UNKNOWN_AREA

    raw_lower = query.lower()
    cleaned_raw = re.sub(r"[^a-z0-9\s_-]", " ", raw_lower)
    raw_tokens = set(cleaned_raw.split())

    norm_text = normalized_text if normalized_text is not None else normalize_text(query)
    norm_tokens = set(norm_text.split())

    # Disambiguation: Gratuity queries often mention leaving the company,
    # but the primary legal subject is strictly gratuity under Sri Lankan law.
    if "gratuity" in raw_tokens:
        return "gratuity"

    scores: Dict[str, float] = {area: 0.0 for area in LEGAL_AREAS}

    for area, rules in LEGAL_AREA_RULES.items():
        # Phrase scoring
        for phrase in rules["phrases"]:
            if phrase in raw_lower or phrase in norm_text:
                scores[area] += 3.0

        # Strong domain term scoring
        for term in rules["strong_terms"]:
            if term in raw_tokens or term in norm_tokens:
                scores[area] += 2.0

        # Contextual term scoring
        for term in rules["context_terms"]:
            if term in raw_tokens or term in norm_tokens:
                scores[area] += 1.0

    max_score = max(scores.values())
    if max_score <= 0.0:
        return UNKNOWN_AREA

    # Deterministic winner selection (priority order in case of strict ties)
    best_area = UNKNOWN_AREA
    for area in LEGAL_AREAS:
        if scores[area] == max_score:
            best_area = area
            break

    return best_area


def extract_keywords(
    query: str,
    normalized_text: Optional[str] = None,
    legal_area: Optional[str] = None
) -> List[str]:
    """
    Extracts structured, search-friendly keywords for the Legal Retrieval Agent.

    Guarantees:
    - Excludes non-informative stopwords ('can', 'my', 'me', 'is', 'without', etc.)
    - Bridges colloquial phrasing to formal employment-law terms
    - Removes duplicates while preserving sensible search ordering
    - Returns clean lowercase strings
    """
    if not query or not query.strip():
        return []

    norm_text = normalized_text if normalized_text is not None else normalize_text(query)
    area = legal_area if legal_area is not None else classify_legal_area(query, norm_text)

    # Queries outside Sri Lankan employment law have no legal retrieval terms
    if area == UNKNOWN_AREA:
        return []

    raw_lower = query.lower()
    cleaned_raw = re.sub(r"[^a-z0-9\s_-]", " ", raw_lower)
    raw_tokens = set(cleaned_raw.split())

    keywords: List[str] = []

    # 1. Actors (Employer / Employee)
    if any(k in raw_tokens for k in ["boss", "employer", "supervisor", "manager"]):
        keywords.append("employer")
    elif "company" in raw_tokens:
        keywords.append("employer")

    if any(k in raw_tokens for k in ["employee", "worker", "workman", "staff"]):
        keywords.append("employee")

    # 2. Area-specific domain concepts
    if area == "termination":
        # Action indicator
        if any(w in raw_tokens for w in [
            "fire", "fired", "firing", "dismiss", "dismissed", "dismissal",
            "sack", "sacked", "sacking", "terminate", "terminated", "terminating",
            "termination", "laid off", "lay off", "retrench", "retrenched"
        ]) or "termination" in norm_text:
            keywords.append("termination")

        # Condition / notice indicator
        if (
            "notice" in raw_tokens
            or "warning" in raw_tokens
            or "without notice" in raw_lower
            or "without warning" in raw_lower
            or "notice period" in raw_lower
        ):
            keywords.append("notice")

        if "resignation" in raw_tokens or "resign" in raw_tokens or "resigned" in raw_tokens:
            keywords.append("resignation")
        if "severance" in raw_tokens:
            keywords.append("severance")
        if "probation" in raw_tokens:
            keywords.append("probation")
        if "contract" in raw_tokens:
            keywords.append("contract")

    elif area == "leave":
        # Specific leave categories
        if "annual leave" in raw_lower or "annual holiday" in raw_lower or "annual holidays" in raw_lower:
            keywords.append("annual leave")
        elif "sick leave" in raw_lower or "medical leave" in raw_lower:
            keywords.append("sick leave")
        elif "maternity leave" in raw_lower:
            keywords.append("maternity leave")
        elif "casual leave" in raw_lower:
            keywords.append("casual leave")
        elif "paternity leave" in raw_lower:
            keywords.append("paternity leave")
        elif "holiday" in raw_tokens or "holidays" in raw_tokens:
            keywords.append("holiday")
        elif "leave" in raw_tokens or "leaves" in raw_tokens:
            keywords.append("leave")

    elif area == "wages":
        keywords.append("wages")
        if "salary" in raw_tokens or "salaries" in raw_tokens:
            keywords.append("salary")
        if "minimum wage" in raw_lower:
            keywords.append("minimum wage")
        if "deduction" in raw_tokens or "deductions" in raw_tokens or "pay cut" in raw_lower:
            keywords.append("deduction")
        if "allowance" in raw_tokens:
            keywords.append("allowance")
        if "bonus" in raw_tokens:
            keywords.append("bonus")
        if "payslip" in raw_tokens or "pay slip" in raw_lower:
            keywords.append("payslip")

    elif area == "working_hours":
        keywords.append("working hours")
        if "overtime" in raw_tokens or "ot" in raw_tokens or "extra hours" in raw_lower:
            keywords.append("overtime")
        if "shift" in raw_tokens or "shifts" in raw_tokens:
            keywords.append("shift")
        if "rest interval" in raw_lower or "rest day" in raw_lower or "break" in raw_tokens:
            keywords.append("rest interval")

    elif area == "gratuity":
        keywords.append("gratuity")
        if "service benefit" in raw_lower or "service benefits" in raw_lower:
            keywords.append("service benefit")
        if "retirement" in raw_tokens or "retirement benefit" in raw_lower:
            keywords.append("retirement benefit")
        if "terminal benefit" in raw_lower:
            keywords.append("terminal benefit")

    # Deduplicate while preserving order and filtering stopwords
    seen: Set[str] = set()
    deduped_keywords: List[str] = []
    for kw in keywords:
        cleaned_kw = kw.strip().lower()
        if cleaned_kw and cleaned_kw not in STOPWORDS and cleaned_kw not in seen:
            seen.add(cleaned_kw)
            deduped_keywords.append(cleaned_kw)

    return deduped_keywords


def process_query(query: str) -> QueryOutput:
    """
    Executes the complete Query Intelligence Agent pipeline:
    1. Validates and trims the raw query.
    2. Performs text normalization.
    3. Classifies the primary legal area.
    4. Extracts canonical search keywords.
    5. Formats the result as a QueryOutput object.
    """
    if not query or not isinstance(query, str) or not query.strip():
        raise ValueError("Query must not be empty or contain only whitespace.")

    cleaned_query = query.strip()
    norm_text = normalize_text(cleaned_query)
    legal_area = classify_legal_area(cleaned_query, norm_text)
    keywords = extract_keywords(cleaned_query, norm_text, legal_area)

    return QueryOutput(
        query=cleaned_query,
        legal_area=legal_area,
        keywords=keywords
    )
