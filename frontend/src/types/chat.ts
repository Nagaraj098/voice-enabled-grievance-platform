export type Message = {
  id: string;
  role: "user" | "agent";
  text: string;
  timestamp: number;
  /** True while agent reply is still streaming (UI updates in parallel with TTS) */
  streaming?: boolean;
};