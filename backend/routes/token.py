from fastapi import APIRouter, HTTPException
from livekit.api import AccessToken, VideoGrants
import time

router = APIRouter()

API_KEY = "devkey"
API_SECRET = "supersecretkeysupersecretkey1234567890abcd"

ROOM_NAME = "voice-room"   # ✅ fixed room — change if needed


@router.get("/token")
def generate_token(
    participant_name: str = "user",   # ✅ default so frontend can call with no params
    room_name: str = ROOM_NAME
):
    if not participant_name.strip():
        raise HTTPException(status_code=400, detail="participant_name cannot be empty")

    try:
        token = (
            AccessToken(API_KEY, API_SECRET)
            .with_identity(participant_name)
            .with_name(participant_name)
            .with_grants(VideoGrants(
                room_join=True,
                room=room_name,
                can_publish=True,
                can_subscribe=True,
            ))
        )

        jwt = token.to_jwt()

        print(f"🔐 Token generated for '{participant_name}' in room '{room_name}'")

        return {
            "token": jwt,
            "room": room_name,
            "participant": participant_name
        }

    except Exception as e:
        print(f"❌ Token generation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate token")