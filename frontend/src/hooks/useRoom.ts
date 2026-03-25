"use client";

import { useRef } from "react";
import { Room } from "livekit-client";

export function useRoom() {
  const roomRef = useRef<Room | null>(null);

  const connectRoom = async () => {
    try {
      // prevent reconnect if already connected
      if (roomRef.current) {
        console.log("Already connected to room");
        return;
      }

      console.log("Requesting token...");

      const res = await fetch(
        "http://localhost:8000/token?room_name=testroom&participant_name=user1",
        {
          method: "POST",
        }
      );

      const { token } = await res.json();

      console.log("Token received");

      const room = new Room();

      // store reference
      roomRef.current = room;

      // event listeners (important for debugging)
      room.on("disconnected", () => {
        console.log("Room disconnected");
        roomRef.current = null;
      });

      room.on("participantConnected", (participant) => {
        console.log("Participant joined:", participant.identity);
      });

      room.on("participantDisconnected", (participant) => {
        console.log("Participant left:", participant.identity);
      });

      // connect to LiveKit
      await room.connect("ws://127.0.0.1:7880", token);

      console.log("Room connected");

      // enable microphone after connection
      await room.localParticipant.setMicrophoneEnabled(true);

      console.log("Microphone enabled");

    } catch (err) {
      console.error("Connection failed:", err);
    }
  };

  const disconnectRoom = async () => {
    if (!roomRef.current) {
      console.log("No active room to disconnect");
      return;
    }

    console.log("Disconnect requested");

    roomRef.current.disconnect();
    roomRef.current = null;

    console.log("Disconnected from room");
  };

  return {
    connectRoom,
    disconnectRoom,
  };
}