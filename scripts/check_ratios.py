import os
import re

def count_words(filepath):
    if not os.path.exists(filepath):
        return 0
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()
        return len([w for w in re.split(r'\s+', text.strip()) if w])

def check_all_ratios():
    original_dir = r'c:\Users\danny\code\agent-book-summarizer\books\diary_st_faustina_batches'
    summary_dir = r'c:\Users\danny\code\agent-book-summarizer\summaries\diary_st_faustina_batches'
    
    print(f"{'Batch':<10} | {'Original':<10} | {'Summary':<10} | {'Ratio':<10}")
    print("-" * 50)
    
    for i in range(1, 26):
        orig_file = os.path.join(original_dir, f'batch_{i}.txt')
        sum_file = os.path.join(summary_dir, f'batch_{i}.md')
        
        orig_count = count_words(orig_file)
        sum_count = count_words(sum_file)
        
        ratio = (sum_count / orig_count * 100) if orig_count > 0 else 0
        print(f"{i:<10} | {orig_count:<10} | {sum_count:<10} | {ratio:>8.2f}%")

if __name__ == "__main__":
    check_all_ratios()
