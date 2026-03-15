"use client";

import React, { useState, useRef } from "react";

export default function MicRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [backendResponse, setBackendResponse] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        sendAudioToBackend(audioBlob);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setAudioUrl(null);
      setBackendResponse(null);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access the microphone. Please grant permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioToBackend = async (blob: Blob) => {
    const formData = new FormData();
    formData.append("file", blob, "audio.webm");

    try {
      // STEP 1 → Speech to Text
      const sttResponse = await fetch("http://127.0.0.1:8000/stt", {
        method: "POST",
        body: formData,
      });

      const sttData = await sttResponse.json();
      console.log("STT result:", sttData);

      const text = sttData.text;

      // STEP 2 → Send text to LLM
      const chatResponse = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text }),
      });

      const chatData = await chatResponse.json();
      console.log("AI response:", chatData);

      setBackendResponse(chatData.ai_response);

      // STEP 3 → Convert AI response to speech
      const ttsResponse = await fetch("http://127.0.0.1:8000/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: chatData.ai_response,
        }),
      });

      const audioBlob = await ttsResponse.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // 🔊 Auto play AI voice
      const audio = new Audio(audioUrl);
      audio.play();

    } catch (error) {
      console.error("Error sending audio:", error);
      setBackendResponse("Error contacting backend");
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 w-full max-w-md">

      {!isRecording ? (
        <button
          onClick={startRecording}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          🎤 Start Recording
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 animate-pulse"
        >
          ⏹ Stop Recording
        </button>
      )}

      {audioUrl && (
        <div className="flex flex-col items-center gap-3 w-full mt-4">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Recording saved successfully
          </p>

          <audio controls src={audioUrl} className="w-full rounded-lg" />
        </div>
      )}

      {backendResponse && (
        <div className="mt-4 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-full text-center">
          <p className="text-sm font-semibold">Backend Response</p>

          <p className="text-sm text-zinc-600 dark:text-zinc-300 break-words">
            {backendResponse}
          </p>
        </div>
      )}

    </div>
  );
}