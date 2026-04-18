import os
import re

def aggregate_diary():
    input_dir = r'c:\Users\danny\code\agent-book-summarizer\summaries\diary_st_faustina_batches'
    output_file = r'c:\Users\danny\code\agent-book-summarizer\summaries\diary_st_faustina_complete_summary.md'
    
    files = [f for f in os.listdir(input_dir) if f.startswith('batch_') and f.endswith('.md')]
    # Sort by numeric value in the filename
    files.sort(key=lambda f: int(re.search(r'\d+', f).group()))
    
    with open(output_file, 'w', encoding='utf-8') as outfile:
        outfile.write("# Diário de Santa Faustina: Resumo Completo (Expansão Editorial)\n\n")
        for i, fname in enumerate(files):
            batch_num = re.search(r'\d+', fname).group()
            with open(os.path.join(input_dir, fname), 'r', encoding='utf-8') as infile:
                outfile.write(f"## Parte {batch_num}\n\n")
                outfile.write(infile.read())
                outfile.write("\n\n---\n\n")
    
    print(f"Aggregated {len(files)} files into {output_file}")

if __name__ == "__main__":
    aggregate_diary()
