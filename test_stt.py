import requests

<<<<<<< HEAD
url = "https://cottage-dont-citation-corpus.trycloudflare.com/transcribe"
=======
url = "https://film-summary-ssl-faces.trycloudflare.com/transcribe"
>>>>>>> acc15cf9f43c07225830c61f62d33d9fd7a681a0

with open(r"C:\Users\Dell\Desktop\Internship\SDLC_AI\voice-enabled-grievance-platform\whisper_test.wav", "rb") as f:
    response = requests.post(url, files={"audio": f})

print(response.status_code)
print(response.json())
