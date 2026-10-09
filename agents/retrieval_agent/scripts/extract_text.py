from pathlib import Path
from pypdf import PdfReader


PROJECT_ROOT = Path(__file__).resolve().parents[3]

RAW_FOLDER = PROJECT_ROOT / "data" / "raw"
OUTPUT_FOLDER = PROJECT_ROOT / "data" / "processed"

OUTPUT_FOLDER.mkdir(parents=True, exist_ok=True)


def extract_pdf(pdf_path: Path) -> str:
    reader = PdfReader(str(pdf_path))

    pages = []

    for page in reader.pages:
        text = page.extract_text()

        if text:
            pages.append(text)

    return "\n".join(pages)


def main():
    pdf_files = list(RAW_FOLDER.rglob("*.pdf"))

    print(f"Found {len(pdf_files)} PDF files.")

    for pdf_path in pdf_files:

        print(f"\nProcessing: {pdf_path.name}")

        try:
            text = extract_pdf(pdf_path)

            output_file = OUTPUT_FOLDER / f"{pdf_path.stem}.txt"

            output_file.write_text(
                text,
                encoding="utf-8"
            )

            print(f"Saved: {output_file}")
            print(f"Characters extracted: {len(text)}")

        except Exception as e:
            print(f"ERROR: {e}")


if __name__ == "__main__":
    main()