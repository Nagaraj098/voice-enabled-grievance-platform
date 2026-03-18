"use client";
import { useRef } from "react";
import { Room } from "livekit-client";

export function useRoom() {
  const roomRef = useRef<Room | null>(null);

  const connectRoom = async () => {
    try {
      const res = await fetch("http://localhost:8000/token", {
        method: "POST",
      });

      const data = await res.json();
      const token = data.token;

      const room = new Room();
      roomRef.current = room;

      await room.connect("ws://localhost:7880", token);

      await room.localParticipant.setMicrophoneEnabled(true);

      console.log("Connected");
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const disconnectRoom = async () => {
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
      console.log("Disconnected");
    }
  };

  return { connectRoom, disconnectRoom };
}



