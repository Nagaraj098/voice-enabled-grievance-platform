import requests

url = "https://zen-contract-possibilities-dishes.trycloudflare.com/transcribe"

with open(r"D:\Internship\grievance project\Voice_enabled_grievance_platform\whisper_test.wav", "rb") as f:
    response = requests.post(url, files={"audio": f})

print(response.status_code)
print(response.json())

# import requests

# url = "https://seas-portable-florida-overview.trycloudflare.com/transcribe"

# with open("D:\Internship\grievance project\Voice_enabled_grievance_platform\whisper_test.wav", "rb") as f:
#     response = requests.post(url, files={"audio": f})

# print(response.status_code)
# print(response.json())