import sys
import os
import re

def count_words(text):
    return len([w for w in re.split(r'\s+', text.strip()) if w])

def calculate_target_words(filepath, ratio=0.20):
    total_words = get_file_word_count(filepath)
    return round(total_words * ratio)

def get_file_word_count(filepath):
    if not os.path.exists(filepath):
        return 0
    with open(filepath, 'r', encoding='utf-8') as f:
        return count_words(f.read())

def estimate_batches(total_words, words_per_batch=20000):
    num_batches = (total_words + words_per_batch - 1) // words_per_batch
    return num_batches, words_per_batch

def aggregate_files(input_files, output_file, header=None):
    with open(output_file, 'w', encoding='utf-8') as outfile:
        if header:
            outfile.write(header + "\n\n")
        first_written = header is not None
        for fname in input_files:
            if os.path.exists(fname):
                with open(fname, 'r', encoding='utf-8') as infile:
                    content = infile.read().strip()
                    if not content:
                        continue
                    if first_written:
                        outfile.write("\n\n")
                    outfile.write(content)
                    first_written = True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python book_tools.py <command> [args]")
        print("Commands: count <file>, target <file> [--ratio <ratio>], estimate <words> [batch_size], aggregate <out> <files...>")
        sys.exit(1)
    
    cmd = sys.argv[1]
    if cmd == "count":
        print(get_file_word_count(sys.argv[2]))
    elif cmd == "target":
        filepath = sys.argv[2]
        ratio = 0.20
        if len(sys.argv) >= 5 and sys.argv[3] == "--ratio":
            ratio = float(sys.argv[4])
        elif len(sys.argv) > 3:
            print("Usage: python book_tools.py target <file> [--ratio <ratio>]")
            sys.exit(1)
        print(calculate_target_words(filepath, ratio))
    elif cmd == "estimate":
        total = int(sys.argv[2])
        size = int(sys.argv[3]) if len(sys.argv) > 3 else 20000
        batches, actual_size = estimate_batches(total, size)
        print(f"Batches: {batches}, Words per batch: {actual_size}")
    elif cmd == "aggregate":
        output = sys.argv[2]
        files = sys.argv[3:]
        aggregate_files(files, output)
        print(f"Aggregated into {output}")
