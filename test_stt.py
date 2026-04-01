import requests

url = "https://film-summary-ssl-faces.trycloudflare.com/transcribe"

with open(r"C:\Users\Dell\Desktop\Internship\SDLC_AI\voice-enabled-grievance-platform\whisper_test.wav", "rb") as f:
    response = requests.post(url, files={"audio": f})

print(response.status_code)
print(response.json())

# import requests

# url = "https://seas-portable-florida-overview.trycloudflare.com/transcribe"

# with open("D:\Internship\grievance project\Voice_enabled_grievance_platform\whisper_test.wav", "rb") as f:
#     response = requests.post(url, files={"audio": f})

# print(response.status_code)
# print(response.json())