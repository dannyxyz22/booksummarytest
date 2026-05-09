import argparse
import re
from pathlib import Path


BATCH_RE = re.compile(r"^batch_(\d+)_resumo\.md$")
FIRST_HEADING_RE = re.compile(r"\A\s*#{1,6}\s+.+?(?:\r?\n){2,}", re.DOTALL)
EXCESS_BLANKS_RE = re.compile(r"\n{3,}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Concatena batch_*_resumo.md em um resumo final corrido, preservando títulos por padrão."
    )
    parser.add_argument(
        "input_dir",
        help="Diretório que contém os arquivos batch_<num>_resumo.md.",
    )
    parser.add_argument(
        "-o",
        "--output",
        help="Arquivo de saída. Se omitido, o nome é inferido a partir do diretório.",
    )
    parser.add_argument(
        "--title",
        help="Título opcional H1 para o arquivo final.",
    )
    parser.add_argument(
        "--strip-headings",
        action="store_true",
        help="Remove o primeiro cabeçalho de cada batch ao gerar o texto final.",
    )
    return parser.parse_args()


def infer_output_path(input_dir: Path) -> Path:
    if input_dir.name == "summaries" and input_dir.parent.name:
        return input_dir / f"{input_dir.parent.name}_resumo_final_corrido.md"
    return input_dir / "resumo_final_corrido.md"


def load_batch_files(input_dir: Path) -> list[Path]:
    batch_files = []
    for path in input_dir.iterdir():
        match = BATCH_RE.match(path.name)
        if match and path.is_file():
            batch_files.append((int(match.group(1)), path))
    batch_files.sort(key=lambda item: item[0])
    return [path for _, path in batch_files]


def clean_content(content: str, keep_headings: bool) -> str:
    text = content.strip()
    if not text:
        return ""
    if not keep_headings:
        text = FIRST_HEADING_RE.sub("", text, count=1).strip()
    return EXCESS_BLANKS_RE.sub("\n\n", text)


def build_output(batch_files: list[Path], title: str | None, keep_headings: bool) -> str:
    parts: list[str] = []
    if title:
        parts.append(f"# {title}".strip())

    for batch_file in batch_files:
        content = batch_file.read_text(encoding="utf-8")
        cleaned = clean_content(content, keep_headings)
        if cleaned:
            parts.append(cleaned)

    return "\n\n".join(parts).strip() + "\n"


def main() -> int:
    args = parse_args()
    input_dir = Path(args.input_dir)

    if not input_dir.exists() or not input_dir.is_dir():
        print(f"Diretório inválido: {input_dir}")
        return 1

    batch_files = load_batch_files(input_dir)
    if not batch_files:
        print(f"Nenhum arquivo batch_*_resumo.md encontrado em: {input_dir}")
        return 1

    output_path = Path(args.output) if args.output else infer_output_path(input_dir)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    final_text = build_output(batch_files, args.title, not args.strip_headings)
    output_path.write_text(final_text, encoding="utf-8")

    print(f"Arquivo final: {output_path}")
    print(f"Batches concatenados: {len(batch_files)}")
    print(f"Caracteres: {len(final_text)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())