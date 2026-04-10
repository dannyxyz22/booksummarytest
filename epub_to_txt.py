import zipfile
import re
import sys
from html.parser import HTMLParser

class MyHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text = []
        self.in_script_or_style = False

    def handle_starttag(self, tag, attrs):
        if tag in ['script', 'style']:
            self.in_script_or_style = True

    def handle_endtag(self, tag):
        if tag in ['script', 'style']:
            self.in_script_or_style = False

    def handle_data(self, data):
        if not self.in_script_or_style:
            self.text.append(data)

    def get_text(self):
        # Join data and clean up whitespace
        full_text = "".join(self.text)
        # Replace multiple spaces/newlines with single ones where appropriate
        return re.sub(r'\n\s*\n', '\n\n', full_text).strip()

def epub_to_txt(epub_path, txt_path):
    try:
        with zipfile.ZipFile(epub_path, 'r') as zip_ref:
            # Find files containing text. Usually in OEBPS or OPS
            # We want to keep the order in the manifest if possible, but sorted usually works for simple epubs
            # Better: read the content.opf to get the spine order
            
            # Find content.opf
            opf_path = None
            try:
                container = zip_ref.read('META-INF/container.xml').decode('utf-8')
                match = re.search(r'full-path="([^"]+)"', container)
                if match:
                    opf_path = match.group(1)
            except:
                pass
            
            if opf_path:
                opf_content = zip_ref.read(opf_path).decode('utf-8', errors='ignore')
                # Find the directory of the opf
                opf_dir = "/".join(opf_path.split("/")[:-1])
                if opf_dir:
                    opf_dir += "/"
                
                # Get manifest
                manifest = {}
                for match in re.finditer(r'<item\s+[^>]*>', opf_content):
                    tag = match.group(0)
                    id_match = re.search(r'id="([^"]+)"', tag)
                    href_match = re.search(r'href="([^"]+)"', tag)
                    if id_match and href_match:
                        manifest[id_match.group(1)] = href_match.group(1)
                
                # Get spine
                spine = []
                for match in re.finditer(r'<itemref\s+idref="([^"]+)"', opf_content):
                    spine.append(match.group(1))
                
                # Use / as separator and normalize paths
                files_to_read = []
                for item_id in spine:
                    if item_id in manifest:
                        href = manifest[item_id]
                        # Join opf_dir and href
                        full_path = opf_dir + href
                        files_to_read.append(full_path)
            else:
                # Fallback to sorted html files
                files_to_read = sorted([f for f in zip_ref.namelist() if f.lower().endswith(('.html', '.xhtml'))])

            with open(txt_path, 'w', encoding='utf-8') as f_out:
                for file_path in files_to_read:
                    try:
                        # Extract original filename from path (handle encoding in zip)
                        content = zip_ref.read(file_path).decode('utf-8', errors='ignore')
                        parser = MyHTMLParser()
                        parser.feed(content)
                        f_out.write(parser.get_text())
                        f_out.write("\n\n")
                    except Exception as e:
                        print(f"Error reading {file_path}: {e}")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error opening EPUB: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python epub_to_txt.py <input_epub> <output_txt>")
        sys.exit(1)
    epub_to_txt(sys.argv[1], sys.argv[2])
