import { Room } from "livekit-client";

export async function connectToLiveKit(token: string) {
  const room = new Room();

  console.log("Connecting to LiveKit...");

  await room.connect("ws://127.0.0.1:7880", token);

  console.log("Connected to LiveKit");

  await room.localParticipant.setMicrophoneEnabled(true);

  return room;
}

