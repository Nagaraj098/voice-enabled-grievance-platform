"use client";

import { useEffect, useRef, useState } from "react";

export function useAudioLevel(active: boolean) {
  const [level, setLevel] = useState(0);

  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // 🔴 FORCE STOP FUNCTION
  const stopAll = () => {
    console.log("STOPPING MIC");

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

    analyserRef.current = null;

    setLevel(0);
  };

  useEffect(() => {
    // 🔴 ALWAYS STOP FIRST
    stopAll();

    if (!active) return;

    console.log("STARTING MIC");

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      streamRef.current = stream;

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;

      analyserRef.current = analyser;

      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const update = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);

        const avg =
          dataArray.reduce((a, b) => a + b, 0) / bufferLength;

        setLevel(avg / 255);

        animationRef.current = requestAnimationFrame(update);
      };

      update();
    });

    return () => {
      stopAll();
    };
  }, [active]);

  return level;
}