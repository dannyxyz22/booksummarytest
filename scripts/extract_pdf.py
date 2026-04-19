import os
import sys
from pypdf import PdfReader

def extract_text_from_pdf(pdf_path, output_path=None):
    if not os.path.exists(pdf_path):
        print(f"Error: File '{pdf_path}' not found.")
        return

    try:
        reader = PdfReader(pdf_path)
        text = ""
        
        print(f"Extracting text from {pdf_path}...")
        total_pages = len(reader.pages)
        
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
            
            # Print progress every 10 pages
            if (i + 1) % 10 == 0 or (i + 1) == total_pages:
                print(f"Page {i + 1} of {total_pages} processed.")

        if output_path is None:
            output_path = os.path.splitext(pdf_path)[0] + ".txt"

        with open(output_path, "w", encoding="utf-8") as f:
            f.write(text)
        
        print(f"Successfully extracted text to: {output_path}")
        return output_path

    except Exception as e:
        print(f"An error occurred: {e}")
        return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python extract_pdf.py <pdf_file_path> [output_txt_path]")
        sys.exit(1)
    
    pdf_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    extract_text_from_pdf(pdf_file, output_file)
