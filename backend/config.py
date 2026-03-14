from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("OPENROUTER_API_KEY")
base_url = os.getenv("OPENROUTER_BASE_URL")
model = os.getenv("MODEL_NAME")

print("API Key:", api_key)
print("Base URL:", base_url)
print("Model:", model)