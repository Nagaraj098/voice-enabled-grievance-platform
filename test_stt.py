import requests

url = "https://knives-loving-detect-border.trycloudflare.com/transcribe"

with open(r"D:\Internship\grievance project\Voice_enabled_grievance_platform\test.wav", "rb") as f:
    response = requests.post(url, files={"audio": f})

print(response.status_code)
print(response.json())