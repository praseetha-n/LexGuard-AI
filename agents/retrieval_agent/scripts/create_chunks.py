from pathlib import Path
import json
import re


PROJECT_ROOT = Path(__file__).resolve().parents[3]

PROCESSED_FOLDER = PROJECT_ROOT / "data" / "processed"
CHUNKS_FOLDER = PROCESSED_FOLDER / "chunks"

CHUNKS_FOLDER.mkdir(parents=True, exist_ok=True)


def clean_text(text: str) -> str:
    """Clean extracted PDF text."""

    # Replace multiple spaces with one space
    text = re.sub(r"[ \t]+", " ", text)

    # Reduce excessive blank lines
    text = re.sub(r"\n\s*\n+", "\n\n", text)

    return text.strip()


def create_chunks(text: str, chunk_size: int = 1500, overlap: int = 200):
    """
    Split legal text into overlapping chunks.

    chunk_size = approximate maximum characters per chunk
    overlap = characters repeated between neighbouring chunks
    """

    chunks = []

    start = 0
    text_length = len(text)

    while start < text_length:

        end = min(start + chunk_size, text_length)

        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        if end >= text_length:
            break

        start = end - overlap

    return chunks


def main():

    text_files = [
        file
        for file in PROCESSED_FOLDER.glob("*.txt")
        if file.is_file()
    ]

    print(f"Found {len(text_files)} text files.")

    all_chunks = []

    for file_path in text_files:

        print(f"\nProcessing: {file_path.name}")

        text = file_path.read_text(
            encoding="utf-8"
        )

        text = clean_text(text)

        chunks = create_chunks(text)

        print(f"Created {len(chunks)} chunks.")

        for index, chunk in enumerate(chunks):

            chunk_record = {
                "document_id": file_path.stem,
                "chunk_id": f"{file_path.stem}_{index + 1}",
                "title": file_path.stem,
                "passage": chunk,
            }

            all_chunks.append(chunk_record)

    output_file = CHUNKS_FOLDER / "legal_chunks.json"

    with open(
        output_file,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            all_chunks,
            f,
            ensure_ascii=False,
            indent=2
        )

    print("\n--------------------------------")
    print("Chunking completed.")
    print(f"Total chunks: {len(all_chunks)}")
    print(f"Saved to: {output_file}")
    print("--------------------------------")


if __name__ == "__main__":
    main()