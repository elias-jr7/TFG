from firecrawl import FirecrawlApp 
from pydantic import BaseModel
from typing import List
import os
import re
from dotenv import load_dotenv
from pathlib import Path
env_path = Path(__file__).resolve().parent / '.env'
load_dotenv(dotenv_path=env_path)


app = FirecrawlApp(api_key=os.getenv('FIRECRAWL_API_TOKEN'))


class NestedModel1(BaseModel):
    topic: str
    url: str
    description: str
    malware_codes: List[str]  

class ExtractSchema(BaseModel):
    cybersecurity_info: List[NestedModel1]


data = app.extract([
    "https://github.com",
    "https://owasp.org/search/?searchString=malware",
    "https://www.incibe.es/"
], {
    'prompt': 'Extract detailed cybersecurity information, including specific malware-related techniques, identifiers (e.g. MITRE ATT&CK IDs like T1486, T1059), or small code snippets (e.g. C++/shell). Each item must include: a topic, a 250+ character description, and malware_codes as a list of relevant techniques or code examples. Do not include single letters or nonsense.',
    'schema': ExtractSchema.model_json_schema(),
    'enable_web_search': True
})


output_dir = "cybersecurity_info"
os.makedirs(output_dir, exist_ok=True)


import random


random_items = random.sample(data['data']['cybersecurity_info'], k=5)

for item in random_items:
    filename = re.sub(r'[\\/*?:"<>|]', "_", item['topic'])
    file_path = os.path.join(output_dir, f"{filename}.txt")

    
    codes = item.get('malware_codes', [])
    if isinstance(codes, str):
        codes = [codes]

    codes = [code for code in codes if len(code.strip()) > 5]

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(f"Topic: {item['topic']}\n")
        f.write(f"URL: {item['url']}\n")
        f.write(f"Description: {item['description']}\n")
        if codes:
            f.write("Malware Codes:\n")
            for code in codes:
                f.write(f"- {code}\n")

