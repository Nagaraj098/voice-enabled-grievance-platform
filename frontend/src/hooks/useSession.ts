import { useState, useEffect } from "react";

export function useSession() {
  const [sessionId, setSessionId] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) return;

    const id = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(id);
  }, [active]);

  const startSession = () => {
    setSessionId(Date.now().toString());
    setSeconds(0);
    setActive(true);
  };

  const endSession = () => {
    setActive(false);
  };

  return { sessionId, seconds, active, startSession, endSession };
}