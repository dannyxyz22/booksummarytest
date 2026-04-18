import os
import re

def count_words(filepath):
    if not os.path.exists(filepath):
        return 0
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()
        return len([w for w in re.split(r'\s+', text.strip()) if w])

def verify_total_ratio():
    original_dir = r'c:\Users\danny\code\agent-book-summarizer\books\diary_st_faustina_batches'
    summary_file = r'c:\Users\danny\code\agent-book-summarizer\summaries\diary_st_faustina_complete_summary.md'
    
    total_original_words = 0
    for i in range(1, 26):
        fname = f'batch_{i}.txt'
        total_original_words += count_words(os.path.join(original_dir, fname))
    
    total_summary_words = count_words(summary_file)
    
    if total_original_words == 0:
        print("Original words count is 0.")
        return

    ratio = total_summary_words / total_original_words
    
    print(f"Total Original Words: {total_original_words}")
    print(f"Total Summary Words:  {total_summary_words}")
    print(f"Total Compression:    {ratio * 100:.2f}%")
    
    if 0.18 <= ratio <= 0.22:
        print("SUCCESS: Summary is within the 18-22% target range.")
    elif ratio < 0.18:
        print("WARNING: Summary is too condensed (under 18%).")
    else:
        print("WARNING: Summary is too long (over 22%).")

if __name__ == "__main__":
    verify_total_ratio()
