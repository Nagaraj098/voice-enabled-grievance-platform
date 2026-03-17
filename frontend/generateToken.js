import { AccessToken } from "livekit-server-sdk";

const apiKey = "devkey";
const apiSecret = "this_is_a_very_secure_secret_key_123456";

// ✅ identity MUST be passed like this
const at = new AccessToken(apiKey, apiSecret);

// ✅ set identity explicitly
at.identity = "user1";

// ✅ permissions
at.addGrant({
  roomJoin: true,
  room: "voice-room",
});

const token = await at.toJwt();

console.log(token);