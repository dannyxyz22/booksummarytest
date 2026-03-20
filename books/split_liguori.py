import os

source_path = r'c:\Users\danny\code\agent-book-summarizer\books\GreatMeansLiguori.txt'
output_dir = r'c:\Users\danny\code\agent-book-summarizer\books\GreatMeansSplits'

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

with open(source_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Define split points (inclusive start, exclusive end)
# Note: lines list is 0-indexed, so line 1 is index 0.
splits = [
    ("00_Intro.txt", 0, 68),
    ("01_CapoI_SecI.txt", 68, 100),
    ("01_CapoI_SecII.txt", 100, 124),
    ("01_CapoI_SecIII.txt", 124, 208),
    ("02_CapoII_SecI.txt", 208, 228),
    ("02_CapoII_SecII.txt", 228, 244),
    ("02_CapoII_SecIII.txt", 244, 254),
    ("02_CapoII_SecIV.txt", 254, 282),
    ("03_CapoIII_SecI.txt", 282, 318),
    ("03_CapoIII_SecII.txt", 318, 330),
    ("03_CapoIII_SecIII.txt", 330, 378),
    ("03_CapoIII_SecIV.txt", 378, 438),
    ("03_CapoIII_SecV.txt", 438, 494),
    ("04_Esercizi.txt", 494, len(lines))
]

for filename, start, end in splits:
    chunk = lines[start:end]
    with open(os.path.join(output_dir, filename), 'w', encoding='utf-8') as out:
        out.writelines(chunk)
    print(f"Created {filename}")
