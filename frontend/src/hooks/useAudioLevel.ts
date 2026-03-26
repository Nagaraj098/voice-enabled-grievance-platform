"use client";

import { useEffect, useRef, useState } from "react";

export function useAudioLevel(active: boolean) {
  const [level, setLevel] = useState(0);
  const [hasMic, setHasMic] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // 🔴 FORCE STOP FUNCTION
  const stopAll = () => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(console.error);
    }
    audioContextRef.current = null;
    analyserRef.current = null;
    setLevel(0);
  };

  useEffect(() => {
    // 🔴 ALWAYS STOP FIRST
    stopAll();

    if (!active) return;
    if (typeof window === "undefined") return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasMic(false);
      setError("Microphone API not supported by this browser.");
      return;
    }

    let isMounted = true;
    setError(null);

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      if (!isMounted) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      setHasMic(true);
      streamRef.current = stream;

      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) {
          throw new Error("AudioContext is not supported in this browser.");
        }
        
        const audioContext = new AudioContextClass();
        audioContextRef.current = audioContext;
        const source = audioContext.createMediaStreamSource(stream);

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;

        analyserRef.current = analyser;

        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const update = () => {
          if (!analyserRef.current || !isMounted) return;

          analyserRef.current.getByteFrequencyData(dataArray);

          const avg =
            dataArray.reduce((a, b) => a + b, 0) / bufferLength;

          setLevel(avg / 255);

          animationRef.current = requestAnimationFrame(update);
        };

        update();
      } catch (err: any) {
        console.error("Audio Context Init error:", err);
        setError("Failed to initialize audio analyzer: " + (err.message || "Unknown error"));
        setHasMic(false);
      }
    }).catch((err) => {
      console.error("Microphone Access Error:", err);
      if (!isMounted) return;
      setHasMic(false);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Microphone access denied. Please allow microphone permissions.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setError("No microphone found. Please connect a microphone.");
      } else {
        setError("Failed to access microphone. An unknown error occurred.");
      }
    });

    return () => {
      isMounted = false;
      stopAll();
    };
  }, [active]);

  return { level, hasMic, error };
}