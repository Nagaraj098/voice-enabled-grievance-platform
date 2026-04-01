import requests

url = "https://cottage-dont-citation-corpus.trycloudflare.com/transcribe"

with open(r"D:\Internship\grievance project\Voice_enabled_grievance_platform\whisper_test.wav", "rb") as f:
    response = requests.post(url, files={"audio": f})

print(response.status_code)
print(response.json())
