import sys
import os
import re

def split_into_batches(filepath, words_per_batch=3000):
    if not os.path.exists(filepath):
        print(f"File {filepath} not found.")
        return
    
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()
    
    words = re.split(r'(\s+)', text)
    
    batches = []
    current_batch = []
    current_word_count = 0
    
    for part in words:
        current_batch.append(part)
        if not part.isspace():
            current_word_count += 1
        
        if current_word_count >= words_per_batch:
            batches.append("".join(current_batch))
            current_batch = []
            current_word_count = 0
    
    if current_batch:
        batches.append("".join(current_batch))
    
    os.makedirs("batches", exist_ok=True)
    for i, batch in enumerate(batches):
        batch_path = f"batches/batch_{i+1}.txt"
        with open(batch_path, 'w', encoding='utf-8') as f:
            f.write(batch)
        print(f"Created {batch_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python split_book.py <file> [words_per_batch]")
        sys.exit(1)
    
    filepath = sys.argv[1]
    words_per_batch = int(sys.argv[2]) if len(sys.argv) > 2 else 3000
    split_into_batches(filepath, words_per_batch)
