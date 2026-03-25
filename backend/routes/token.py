from fastapi import APIRouter
from livekit.api import AccessToken, VideoGrants

router = APIRouter()

API_KEY = "devkey"
API_SECRET = "supersecretkeysupersecretkey1234567890abcd"

@router.post("/token")
def generate_token(room_name: str, participant_name: str):

    token = AccessToken(API_KEY, API_SECRET)

    token = token.with_identity(participant_name)

    token = token.with_grants(
        VideoGrants(
            room_join=True,
            room=room_name,
            can_publish=True,
            can_subscribe=True
        )
    )

    jwt = token.to_jwt()

    return {"token": jwt}