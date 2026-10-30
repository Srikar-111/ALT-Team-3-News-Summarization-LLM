import urllib.request, urllib.error, json, os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GROQ_API_KEY", "")

req = urllib.request.Request(
    'https://api.groq.com/openai/v1/models',
    headers={
        'Authorization': f'Bearer {api_key}',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
)
try:
    res = urllib.request.urlopen(req)
    data = json.loads(res.read().decode())
    for m in data['data']:
        print(m['id'])
except urllib.error.HTTPError as e:
    print(e.read().decode())
