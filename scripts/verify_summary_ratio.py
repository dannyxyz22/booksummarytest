import sys
import argparse
import re

def count_words(filepath):
    """Counts the number of words in a file, handling basic whitespace separation."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            text = f.read()
            # Split by whitespace and filter out empty strings
            words = [w for w in re.split(r'\s+', text.strip()) if w]
            return len(words)
    except FileNotFoundError:
        print(f"Error: File not found - {filepath}")
        return -1
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return -1

def main():
    parser = argparse.ArgumentParser(description="Verify if a summary meets the 20% compression ratio (+- 2%).")
    parser.add_argument("original_file", help="Path to the original text file segment")
    parser.add_argument("summary_file", help="Path to the generated summary markdown file")
    
    args = parser.parse_args()
    
    original_words = count_words(args.original_file)
    if original_words == -1:
        sys.exit(1)
        
    summary_words = count_words(args.summary_file)
    if summary_words == -1:
        sys.exit(1)
        
    if original_words == 0:
        print("Error: Original file is empty.")
        sys.exit(1)

    ratio = summary_words / original_words
    target_ratio = 0.20
    tolerance = 0.02
    
    lower_bound = target_ratio - tolerance
    upper_bound = target_ratio + tolerance
    
    print(f"Original word count: {original_words}")
    print(f"Summary word count:  {summary_words}")
    print(f"Actual Ratio:        {ratio:.4f} ({ratio * 100:.2f}%)")
    print(f"Target Ratio:        {target_ratio:.2f} +- {tolerance:.2f} ({lower_bound*100:.0f}% to {upper_bound*100:.0f}%)")
    
    if lower_bound <= ratio <= upper_bound:
        print("\nSUCCESS: Summary ratio is within the acceptable range.")
        sys.exit(0)
    else:
        print("\nFAILURE: Summary ratio is outside the acceptable range.")
        sys.exit(1)

if __name__ == "__main__":
    main()
