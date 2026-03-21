import sys
from pathlib import Path

def split_text(file_path, num_batches):
    content = Path(file_path).read_text(encoding='utf-8')
    words = content.split()
    total_words = len(words)
    batch_size = total_words // num_batches
    dest_dir = Path(file_path).parent / 'batches'
    dest_dir.mkdir(exist_ok=True)
    
    for i in range(num_batches):
        start = i * batch_size
        end = (i + 1) * batch_size if i < num_batches - 1 else total_words
        batch_words = words[start:end]
        (dest_dir / f'batch_{i+1}.txt').write_text(' '.join(batch_words), encoding='utf-8')
        print(f'Batch {i+1} saved with {len(batch_words)} words.')

if __name__ == '__main__':
    split_text(r'c:\Users\danny\code\agent-book-summarizer\books\EverlastingMan.txt', 11)
