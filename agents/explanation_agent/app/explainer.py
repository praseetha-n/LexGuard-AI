import re
from ollama import chat

from shared.schemas.retrieval_output import RetrievalOutput
from shared.schemas.explanation_output import (
    ExplanationOutput,
    Citation
)


MODEL_NAME = "llama3.2:3b"


SYSTEM_PROMPT = """
You are the Explanation Agent for LexGuard AI.

LexGuard AI provides legal information about Sri Lankan
employment law.

Your job is to explain the user's question using ONLY
the retrieved legal evidence supplied to you.

Rules:

1. Use only the retrieved evidence.
2. Do not invent laws, legal sections, cases, dates, or facts.
3. Do not use outside legal knowledge.
4. Explain the answer in simple and clear language.
5. If the evidence is insufficient, clearly say so.
6. Do not pretend to know information that is not supported.
7. Always state that the response is legal information,
   not professional legal advice.
   8. Never interpret page numbers, headers, or standalone numbers
   as section numbers unless the evidence explicitly identifies
   them as a section.

9. When referring to a legal provision, use only the section,
   subsection, act name, or number exactly as it appears in
   the retrieved evidence.
   10. Answer the exact question only when the retrieved evidence
    directly supports the answer.

11. Do not treat a related legal requirement as an answer to a
    different legal issue.

12. If the user's question mentions a concept such as notice,
    compensation, dismissal, resignation, or a time period, and
    that concept is not explicitly addressed by the retrieved
    evidence, clearly state that the evidence does not answer
    that specific part of the question.

13. Then explain only what the retrieved evidence actually states.
"""

def clean_passage_for_llm(passage: str) -> str:
    """
    Remove a standalone page number at the beginning of a
    retrieved passage so the LLM does not mistake it for
    a legal section number.

    The original passage is still kept unchanged for citations.
    """

    lines = passage.splitlines()

    if lines and re.fullmatch(r"\s*\d+\s*", lines[0]):
        lines = lines[1:]

    return "\n".join(lines).strip()

def build_context(retrieval: RetrievalOutput) -> str:

    context_parts = []

    for index, document in enumerate(
        retrieval.documents,
        start=1
    ):
        context_parts.append(
            f"""
SOURCE {index}

Document ID:
{document.document_id}

Title:
{document.title}

Legal passage:
{clean_passage_for_llm(document.passage)}
""".strip()
        )

    return "\n\n".join(context_parts)


def generate_explanation(
    retrieval: RetrievalOutput
) -> ExplanationOutput:

    if not retrieval.documents:
        return ExplanationOutput(
            query=retrieval.query,
            answer=(
                "The available legal sources do not provide "
                "enough evidence to answer this question reliably. "
                "This response provides general legal information "
                "and is not a substitute for professional legal advice."
            ),
            citations=[]
        )

    context = build_context(retrieval)

    user_prompt = f"""
USER QUESTION:

{retrieval.query}


RETRIEVED LEGAL EVIDENCE:

{context}


Answer the user's question using ONLY the evidence above.

Requirements:

- Use simple language.
- Do not invent legal information.
- Do not use outside legal knowledge.
- If the evidence is incomplete, clearly say so.
- Base every legal statement on the supplied evidence.
- Do not guess section numbers from page numbers or headings.
- First check whether the retrieved evidence directly answers
  the exact question.
- If it does not, explicitly say which part is not covered.
- Do not infer "notice" from requirements about consent or approval.

End with this sentence:

This response provides general legal information and is not
a substitute for professional legal advice.
"""

    response = chat(
        model=MODEL_NAME,
        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": user_prompt
            }
        ],
        options={
            "temperature": 0.2
        }
    )

    answer = response.message.content

    

    citations = [
        Citation(
            document_id=document.document_id,
            passage=document.passage
        )
        for document in retrieval.documents
    ]

    return ExplanationOutput(
        query=retrieval.query,
        answer=answer,
        citations=citations
    )