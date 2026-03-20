from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.platypus import Paragraph


ROOT = Path(r"C:\Users\danny\code\agent-book-summarizer")
OUTPUT_DIR = ROOT / "output" / "pdf"
OUTPUT_PATH = OUTPUT_DIR / "agent-book-summarizer-app-summary.pdf"

PAGE_WIDTH, PAGE_HEIGHT = letter
MARGIN_X = 0.6 * inch
MARGIN_TOP = 0.55 * inch
MARGIN_BOTTOM = 0.45 * inch
GUTTER = 0.28 * inch
COLUMN_WIDTH = (PAGE_WIDTH - (2 * MARGIN_X) - GUTTER) / 2

PALETTE = {
    "ink": colors.HexColor("#1f1a17"),
    "muted": colors.HexColor("#5f564d"),
    "accent": colors.HexColor("#8b1d1d"),
    "gold": colors.HexColor("#b08d57"),
    "line": colors.HexColor("#d9c9ad"),
    "paper": colors.HexColor("#f7f2e8"),
}


def build_styles():
    sample = getSampleStyleSheet()
    styles = {
        "title": ParagraphStyle(
            "title",
            parent=sample["Normal"],
            fontName="Helvetica-Bold",
            fontSize=19,
            leading=22,
            textColor=PALETTE["ink"],
            spaceAfter=0,
        ),
        "subtitle": ParagraphStyle(
            "subtitle",
            parent=sample["Normal"],
            fontName="Helvetica",
            fontSize=9.2,
            leading=11.4,
            textColor=PALETTE["muted"],
            spaceAfter=0,
        ),
        "section": ParagraphStyle(
            "section",
            parent=sample["Normal"],
            fontName="Helvetica-Bold",
            fontSize=11.2,
            leading=13.2,
            textColor=PALETTE["accent"],
            spaceBefore=0,
            spaceAfter=0,
        ),
        "body": ParagraphStyle(
            "body",
            parent=sample["Normal"],
            fontName="Helvetica",
            fontSize=9.2,
            leading=12.1,
            textColor=PALETTE["ink"],
            spaceAfter=0,
        ),
        "bullet": ParagraphStyle(
            "bullet",
            parent=sample["Normal"],
            fontName="Helvetica",
            fontSize=8.9,
            leading=11.4,
            leftIndent=10,
            firstLineIndent=0,
            bulletIndent=0,
            textColor=PALETTE["ink"],
            spaceAfter=0,
        ),
        "small": ParagraphStyle(
            "small",
            parent=sample["Normal"],
            fontName="Helvetica",
            fontSize=7.4,
            leading=9.3,
            textColor=PALETTE["muted"],
            spaceAfter=0,
        ),
    }
    return styles


CONTENT = {
    "title": "agent-book-summarizer",
    "subtitle": "One-page repo summary of the current app",
    "left_sections": [
        {
            "heading": "What It Is",
            "paragraphs": [
                "A static React/Vite web app branded as <b>Summa Brevis</b> that presents curated book summaries in a library-style reading interface.",
                "The repo also includes a Node preprocessing script that converts markdown summaries into JSON, EPUB, and PDF assets consumed by the frontend.",
            ],
        },
        {
            "heading": "Who It's For",
            "paragraphs": [
                "Primary persona: Portuguese-speaking readers and students of Catholic spiritual literature; an exact persona statement is <b>Not found in repo.</b>",
            ],
        },
        {
            "heading": "What It Does",
            "bullets": [
                "Loads a catalog of processed summaries from <font face='Courier'>public/data/summaries.json</font>.",
                "Shows each book as a searchable, animated card with cover art, author, year, description, and reading-time estimate.",
                "Supports hash-based navigation for home, author filter, search results, and per-book views.",
                "Fetches full book payloads from <font face='Courier'>public/data/books/&lt;id&gt;.json</font> when a reader opens a volume.",
                "Renders markdown content in an immersive viewer with progress tracking and motivational reading labels.",
                "Offers in-view font-size controls plus downloadable PDF and EPUB links when those files exist.",
            ],
        },
    ],
    "right_sections": [
        {
            "heading": "How It Works",
            "paragraphs": [
                "<b>Source content:</b> Markdown summary files live at repo root and under <font face='Courier'>summaries/</font>.",
                "<b>Build-time processing:</b> <font face='Courier'>webapp/process_summaries.cjs</font> defines the catalog, reads markdown, estimates reading time, extracts descriptions, generates EPUB via <font face='Courier'>epub-gen</font>, generates PDF via <font face='Courier'>pdfkit</font>, and writes JSON outputs into <font face='Courier'>webapp/public/data/</font>.",
                "<b>Frontend:</b> The Vite app boots from <font face='Courier'>src/main.jsx</font>. <font face='Courier'>App.jsx</font> fetches the summaries index, handles hash routing and search/filter state, and renders <font face='Courier'>BookCard</font> tiles. <font face='Courier'>SummaryViewer.jsx</font> fetches the selected book JSON and renders markdown with <font face='Courier'>react-markdown</font> and <font face='Courier'>remark-gfm</font>.",
                "<b>Backend/services:</b> No server, database, or auth layer was found in the repo; data flow appears to be markdown -> build script -> static JSON/PDF/EPUB assets -> browser fetch/render.",
            ],
        },
        {
            "heading": "How To Run",
            "bullets": [
                "From the repo root: <font face='Courier'>cd webapp</font>",
                "Install dependencies: <font face='Courier'>npm install</font>",
                "Generate current data/assets: <font face='Courier'>node process_summaries.cjs</font>",
                "Start the dev server: <font face='Courier'>npm run dev</font>",
                "Open the local URL Vite prints in the terminal; the exact port is <b>Not found in repo.</b>",
            ],
        },
        {
            "heading": "Repo Evidence",
            "paragraphs": [
                "<font face='Courier'>README.md</font>, <font face='Courier'>webapp/package.json</font>, <font face='Courier'>webapp/process_summaries.cjs</font>, <font face='Courier'>webapp/src/App.jsx</font>, <font face='Courier'>webapp/src/components/BookCard.jsx</font>, <font face='Courier'>webapp/src/components/SummaryViewer.jsx</font>, and generated files under <font face='Courier'>webapp/public/data/</font>.",
            ],
        },
    ],
}


def draw_wrapped_text(canvas, text, x, y, style, width, bullet_text=None):
    para = Paragraph(text, style, bulletText=bullet_text)
    _, height = para.wrap(width, PAGE_HEIGHT)
    para.drawOn(canvas, x, y - height)
    return y - height


def draw_rule(canvas, y):
    canvas.setStrokeColor(PALETTE["line"])
    canvas.setLineWidth(0.8)
    canvas.line(MARGIN_X, y, PAGE_WIDTH - MARGIN_X, y)


def draw_header(canvas, styles):
    top_y = PAGE_HEIGHT - MARGIN_TOP

    canvas.setFillColor(PALETTE["paper"])
    canvas.roundRect(
        MARGIN_X,
        PAGE_HEIGHT - 1.52 * inch,
        PAGE_WIDTH - (2 * MARGIN_X),
        0.84 * inch,
        12,
        fill=1,
        stroke=0,
    )

    title = CONTENT["title"]
    title_width = stringWidth(title, "Helvetica-Bold", 18)
    canvas.setFillColor(PALETTE["gold"])
    canvas.rect(MARGIN_X + 0.22 * inch, PAGE_HEIGHT - 0.98 * inch, 0.12 * inch, 0.12 * inch, fill=1, stroke=0)
    canvas.setFillColor(PALETTE["ink"])
    canvas.setFont("Helvetica-Bold", 18)
    canvas.drawString(MARGIN_X + 0.42 * inch, PAGE_HEIGHT - 0.96 * inch, title)

    canvas.setFont("Helvetica", 8.8)
    canvas.setFillColor(PALETTE["muted"])
    canvas.drawString(MARGIN_X + 0.42 * inch, PAGE_HEIGHT - 1.15 * inch, CONTENT["subtitle"])

    canvas.setStrokeColor(PALETTE["gold"])
    canvas.setLineWidth(1.1)
    canvas.line(
        PAGE_WIDTH - MARGIN_X - 1.4 * inch,
        PAGE_HEIGHT - 1.0 * inch,
        PAGE_WIDTH - MARGIN_X - 0.22 * inch,
        PAGE_HEIGHT - 1.0 * inch,
    )
    canvas.setFont("Helvetica-Bold", 8.2)
    canvas.setFillColor(PALETTE["accent"])
    canvas.drawRightString(PAGE_WIDTH - MARGIN_X - 0.22 * inch, PAGE_HEIGHT - 1.12 * inch, "App Snapshot")

    return PAGE_HEIGHT - 1.72 * inch


def draw_section(canvas, x, y, width, section, styles):
    y = draw_wrapped_text(canvas, section["heading"], x, y, styles["section"], width)
    y -= 5

    for paragraph in section.get("paragraphs", []):
        y = draw_wrapped_text(canvas, paragraph, x, y, styles["body"], width)
        y -= 4

    for bullet in section.get("bullets", []):
        y = draw_wrapped_text(canvas, bullet, x, y, styles["bullet"], width, bullet_text="-")
        y -= 3

    return y - 7


def create_pdf():
    from reportlab.pdfgen import canvas

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    styles = build_styles()
    pdf = canvas.Canvas(str(OUTPUT_PATH), pagesize=letter)
    pdf.setTitle("agent-book-summarizer app summary")
    pdf.setAuthor("Codex")
    pdf.setSubject("One-page summary based on repo evidence")

    pdf.setFillColor(colors.white)
    pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill=1, stroke=0)

    content_top = draw_header(pdf, styles)
    draw_rule(pdf, content_top + 8)

    left_x = MARGIN_X
    right_x = MARGIN_X + COLUMN_WIDTH + GUTTER
    left_y = content_top - 8
    right_y = content_top - 8

    for section in CONTENT["left_sections"]:
        left_y = draw_section(pdf, left_x, left_y, COLUMN_WIDTH, section, styles)

    for section in CONTENT["right_sections"]:
        right_y = draw_section(pdf, right_x, right_y, COLUMN_WIDTH, section, styles)

    footer_y = MARGIN_BOTTOM - 2
    draw_rule(pdf, footer_y + 10)
    footer = "Generated from local repo evidence on 2026-03-20"
    pdf.setFont("Helvetica", 7.1)
    pdf.setFillColor(PALETTE["muted"])
    pdf.drawString(MARGIN_X, footer_y, footer)

    if min(left_y, right_y) < footer_y + 8:
        raise RuntimeError("Content overflowed the one-page layout.")

    pdf.showPage()
    pdf.save()


if __name__ == "__main__":
    create_pdf()
    print(OUTPUT_PATH)
