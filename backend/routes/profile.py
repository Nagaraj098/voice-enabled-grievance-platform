# backend/routes/profile.py

from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional
import json
import os
import shutil
import uuid

router = APIRouter()

PROFILE_PATH  = os.path.join(os.path.dirname(os.path.dirname(__file__)), "profile.json")
AVATAR_DIR    = os.path.join(os.path.dirname(os.path.dirname(__file__)), "avatars")
os.makedirs(AVATAR_DIR, exist_ok=True)

DEFAULT_PROFILE = {
    "name":         "My Account",
    "email":        "user@email.com",
    "phone":        "",
    "organization": "",
    "role":         "Admin",
    "timezone":     "Asia/Kolkata",
    "avatar_url":   "",
}


class ProfileUpdate(BaseModel):
    name:         Optional[str] = None
    phone:        Optional[str] = None
    organization: Optional[str] = None
    role:         Optional[str] = None
    timezone:     Optional[str] = None
    avatar_url:   Optional[str] = None


def _load_profile() -> dict:
    if not os.path.exists(PROFILE_PATH):
        return DEFAULT_PROFILE.copy()
    try:
        with open(PROFILE_PATH, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return DEFAULT_PROFILE.copy()


def _save_profile(data: dict):
    with open(PROFILE_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


# ── GET /api/user/profile ─────────────────────────────────────────────────
@router.get("/api/user/profile")
def get_profile():
    """Fetch current user profile."""
    return _load_profile()


# ── PATCH /api/user/profile ───────────────────────────────────────────────
@router.patch("/api/user/profile")
def update_profile(data: ProfileUpdate):
    """Update profile fields — only updates provided fields."""
    try:
        profile = _load_profile()
        updates = data.dict(exclude_none=True)
        profile.update(updates)
        _save_profile(profile)
        print(f"✅ Profile saved: {profile.get('name')}")
        return {
            "ok":      True,
            "message": "Profile updated successfully",
            "profile": profile,
        }
    except Exception as e:
        print(f"❌ Profile save error: {e}")
        raise HTTPException(status_code=500, detail="Failed to save profile")


# ── PUT /api/user/profile ─────────────────────────────────────────────────
@router.put("/api/user/profile")
def replace_profile(data: ProfileUpdate):
    """Full profile update — same as PATCH for now."""
    return update_profile(data)


# ── POST /api/user/avatar ─────────────────────────────────────────────────
@router.post("/api/user/avatar")
async def upload_avatar(file: UploadFile = File(...)):
    """Upload avatar image. Saves to avatars/ folder."""
    try:
        # Validate file type
        allowed = {"image/jpeg", "image/png", "image/webp", "image/gif"}
        if file.content_type not in allowed:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type: {file.content_type}. Allowed: jpg, png, webp, gif"
            )

        # Save with unique filename
        ext      = os.path.splitext(file.filename)[1] or ".jpg"
        filename = f"avatar_{uuid.uuid4().hex[:8]}{ext}"
        path     = os.path.join(AVATAR_DIR, filename)

        with open(path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        # Build URL — served as static file
        avatar_url = f"http://localhost:8000/avatars/{filename}"

        # Save to profile
        profile = _load_profile()
        profile["avatar_url"] = avatar_url
        _save_profile(profile)

        print(f"✅ Avatar uploaded: {filename}")
        return {
            "ok":        True,
            "avatar_url": avatar_url,
            "message":   "Avatar uploaded successfully",
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Avatar upload error: {e}")
        raise HTTPException(status_code=500, detail="Avatar upload failed")


# ── DELETE /api/user/account ──────────────────────────────────────────────
@router.delete("/api/user/account")
def delete_account():
    """Delete user account and profile data."""
    try:
        if os.path.exists(PROFILE_PATH):
            os.remove(PROFILE_PATH)
            print("✅ Profile deleted")

        # Also clean up avatars
        if os.path.exists(AVATAR_DIR):
            shutil.rmtree(AVATAR_DIR)
            os.makedirs(AVATAR_DIR, exist_ok=True)

        return {"ok": True, "message": "Account deleted successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))