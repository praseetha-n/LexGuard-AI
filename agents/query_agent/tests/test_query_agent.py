"""
test_query_agent.py - Comprehensive Unit & Integration Tests for Query Intelligence Agent.
"""

import asyncio
import json
import unittest
from typing import Any, Dict, Optional, Tuple

from pydantic import ValidationError

from agents.query_agent.app.analyzer import (
    classify_legal_area,
    extract_keywords,
    normalize_text,
    process_query,
)
from agents.query_agent.app.main import app
from agents.query_agent.app.routes import QueryRequest, analyze_query


def run_asgi_request(
    method: str,
    path: str,
    body: Optional[Dict[str, Any]] = None
) -> Tuple[int, Any]:
    """
    Synchronous helper to run an ASGI request against the FastAPI app
    without requiring third-party HTTP test dependencies.
    """
    async def _dispatch():
        scope = {
            "type": "http",
            "asgi": {"version": "3.0"},
            "http_version": "1.1",
            "method": method,
            "path": path,
            "raw_path": path.encode(),
            "query_string": b"",
            "headers": [
                (b"content-type", b"application/json"),
                (b"host", b"testserver")
            ],
            "server": ("127.0.0.1", 8001),
            "client": ("127.0.0.1", 12345),
        }
        sent_events = []
        body_bytes = json.dumps(body).encode() if body is not None else b""

        async def receive():
            return {"type": "http.request", "body": body_bytes, "more_body": False}

        async def send(event):
            sent_events.append(event)

        await app(scope, receive, send)

        status_code = next(e["status"] for e in sent_events if e["type"] == "http.response.start")
        resp_body = b"".join(e.get("body", b"") for e in sent_events if e["type"] == "http.response.body")
        data = json.loads(resp_body) if resp_body else None
        return status_code, data

    return asyncio.run(_dispatch())


class TestRequiredCases(unittest.TestCase):
    """
    Tests for primary required test cases specified in the project specification.
    """

    def test_case_a_termination(self):
        # Case A: "Can my employer fire me without notice?"
        # Expected: legal_area = termination, keywords include termination/employer/notice
        result = process_query("Can my employer fire me without notice?")
        self.assertEqual(result.legal_area, "termination")
        self.assertIn("termination", result.keywords)
        self.assertIn("employer", result.keywords)
        self.assertIn("notice", result.keywords)
        self.assertEqual(result.query, "Can my employer fire me without notice?")

    def test_case_b_leave(self):
        # Case B: "How many annual leave days am I entitled to?"
        # Expected: legal_area = leave
        result = process_query("How many annual leave days am I entitled to?")
        self.assertEqual(result.legal_area, "leave")
        self.assertIn("annual leave", result.keywords)

    def test_case_c_wages(self):
        # Case C: "My company has not paid my salary"
        # Expected: legal_area = wages
        result = process_query("My company has not paid my salary")
        self.assertEqual(result.legal_area, "wages")
        self.assertIn("employer", result.keywords)
        self.assertIn("salary", result.keywords)
        self.assertIn("wages", result.keywords)

    def test_case_d_working_hours(self):
        # Case D: "Can they make me work overtime every day?"
        # Expected: legal_area = working_hours
        result = process_query("Can they make me work overtime every day?")
        self.assertEqual(result.legal_area, "working_hours")
        self.assertIn("overtime", result.keywords)
        self.assertIn("working hours", result.keywords)

    def test_case_e_gratuity(self):
        # Case E: "Will I receive gratuity after leaving the company?"
        # Expected: legal_area = gratuity
        result = process_query("Will I receive gratuity after leaving the company?")
        self.assertEqual(result.legal_area, "gratuity")
        self.assertIn("gratuity", result.keywords)
        self.assertIn("employer", result.keywords)

    def test_case_f_unknown(self):
        # Case F: "Tell me about something unrelated to employment law"
        # Expected: legal_area = unknown
        result = process_query("Tell me about something unrelated to employment law")
        self.assertEqual(result.legal_area, "unknown")
        self.assertEqual(result.keywords, [])

    def test_case_g_empty_and_whitespace_validation(self):
        # Case G: Empty/whitespace query -> validation error
        with self.assertRaises(ValidationError):
            QueryRequest(query="")

        with self.assertRaises(ValidationError):
            QueryRequest(query="   ")

        with self.assertRaises(ValidationError):
            QueryRequest(query="\t\n  ")

        with self.assertRaises(ValueError):
            process_query("")

        with self.assertRaises(ValueError):
            process_query("   ")


class TestNLPFeatures(unittest.TestCase):
    """
    Tests for NLP normalization, synonym variants, punctuation,
    capitalization, repeated words, and duplicate keyword removal.
    """

    def test_capitalization_handling(self):
        # UPPERCASE query
        result = process_query("CAN MY EMPLOYER FIRE ME WITHOUT NOTICE?")
        self.assertEqual(result.legal_area, "termination")
        self.assertIn("termination", result.keywords)
        self.assertIn("employer", result.keywords)
        self.assertIn("notice", result.keywords)
        # Preserves original casing in query field
        self.assertEqual(result.query, "CAN MY EMPLOYER FIRE ME WITHOUT NOTICE?")

    def test_repeated_words(self):
        # Query with repeated words should not produce duplicate keywords
        result = process_query("My boss boss fired fired me without notice notice")
        self.assertEqual(result.legal_area, "termination")
        self.assertEqual(result.keywords.count("employer"), 1)
        self.assertEqual(result.keywords.count("termination"), 1)
        self.assertEqual(result.keywords.count("notice"), 1)

    def test_punctuation_handling(self):
        # Query loaded with varied punctuation
        result = process_query("Can my employer fire me, without notice?!?")
        self.assertEqual(result.legal_area, "termination")
        self.assertEqual(result.keywords, ["employer", "termination", "notice"])

    def test_duplicate_keyword_removal(self):
        # Query with multiple occurrences of terms relating to salary and wages
        result = process_query("My salary salary salary was not paid paid")
        self.assertEqual(result.legal_area, "wages")
        self.assertEqual(len(result.keywords), len(set(result.keywords)))

    def test_common_synonyms_termination(self):
        # "sacked" synonym
        res1 = process_query("My boss sacked me")
        self.assertEqual(res1.legal_area, "termination")
        self.assertIn("termination", res1.keywords)
        self.assertIn("employer", res1.keywords)

        # "dismissed" synonym
        res2 = process_query("I was dismissed without notice")
        self.assertEqual(res2.legal_area, "termination")
        self.assertIn("termination", res2.keywords)
        self.assertIn("notice", res2.keywords)

        # "without warning" -> notice
        res3 = process_query("My boss fired me without warning")
        self.assertEqual(res3.legal_area, "termination")
        self.assertIn("notice", res3.keywords)

    def test_common_synonyms_leave(self):
        # "annual holiday" -> leave
        res1 = process_query("How many annual holidays do I get?")
        self.assertEqual(res1.legal_area, "leave")
        self.assertIn("annual leave", res1.keywords)

        # "sick leave"
        res2 = process_query("How much sick leave can I take?")
        self.assertEqual(res2.legal_area, "leave")
        self.assertIn("sick leave", res2.keywords)

        # "maternity leave"
        res3 = process_query("Am I entitled to maternity leave?")
        self.assertEqual(res3.legal_area, "leave")
        self.assertIn("maternity leave", res3.keywords)

    def test_common_synonyms_wages(self):
        # "minimum wage"
        res1 = process_query("What is the minimum wage for workers?")
        self.assertEqual(res1.legal_area, "wages")
        self.assertIn("minimum wage", res1.keywords)

        # "pay"
        res2 = process_query("My employer reduced my pay")
        self.assertEqual(res2.legal_area, "wages")
        self.assertIn("wages", res2.keywords)

    def test_common_synonyms_working_hours(self):
        # "shift"
        res1 = process_query("Can my employer make me work night shift?")
        self.assertEqual(res1.legal_area, "working_hours")
        self.assertIn("shift", res1.keywords)

        # "work hours"
        res2 = process_query("What are the legal work hours per day?")
        self.assertEqual(res2.legal_area, "working_hours")
        self.assertIn("working hours", res2.keywords)

    def test_common_synonyms_gratuity(self):
        # "service benefit"
        res1 = process_query("Am I entitled to service benefit after retirement?")
        self.assertEqual(res1.legal_area, "gratuity")
        self.assertIn("gratuity", res1.keywords)
        self.assertIn("service benefit", res1.keywords)


class TestHelperFunctions(unittest.TestCase):
    """
    Direct tests for helper functions:
    normalize_text(), classify_legal_area(), extract_keywords().
    """

    def test_normalize_text(self):
        norm = normalize_text("My boss fired me without warning")
        self.assertIn("employer", norm)
        self.assertIn("termination", norm)
        self.assertIn("without notice", norm)

    def test_classify_legal_area(self):
        self.assertEqual(classify_legal_area("fired without notice"), "termination")
        self.assertEqual(classify_legal_area("annual leave entitlement"), "leave")
        self.assertEqual(classify_legal_area("salary deduction by company"), "wages")
        self.assertEqual(classify_legal_area("overtime hours"), "working_hours")
        self.assertEqual(classify_legal_area("gratuity payment after retirement"), "gratuity")
        self.assertEqual(classify_legal_area("what is the weather today"), "unknown")

    def test_extract_keywords(self):
        keywords = extract_keywords(
            query="My boss fired me without giving notice",
            normalized_text="my employer termination me without notice",
            legal_area="termination"
        )
        self.assertEqual(keywords, ["employer", "termination", "notice"])


class TestEndpointsHTTP(unittest.TestCase):
    """
    Integration tests verifying HTTP endpoints /health and /analyze
    conforming to the shared schema and API contracts.
    """

    def test_health_endpoint(self):
        status_code, data = run_asgi_request("GET", "/health")
        self.assertEqual(status_code, 200)
        self.assertEqual(data, {
            "agent": "query_agent",
            "status": "healthy"
        })

    def test_analyze_endpoint_valid_request(self):
        payload = {"query": "Can my employer fire me without notice?"}
        status_code, data = run_asgi_request("POST", "/analyze", payload)
        self.assertEqual(status_code, 200)
        self.assertEqual(data["query"], "Can my employer fire me without notice?")
        self.assertEqual(data["legal_area"], "termination")
        self.assertIn("employer", data["keywords"])
        self.assertIn("termination", data["keywords"])
        self.assertIn("notice", data["keywords"])

    def test_analyze_endpoint_empty_query_422(self):
        payload = {"query": "   "}
        status_code, data = run_asgi_request("POST", "/analyze", payload)
        self.assertEqual(status_code, 422)
        self.assertIn("detail", data)

    def test_analyze_endpoint_missing_body_422(self):
        payload = {}
        status_code, data = run_asgi_request("POST", "/analyze", payload)
        self.assertEqual(status_code, 422)


if __name__ == "__main__":
    unittest.main()
