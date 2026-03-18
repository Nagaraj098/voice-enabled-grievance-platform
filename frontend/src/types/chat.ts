export type Message = {
  id: string;
  role: "user" | "agent";
  text: string;
  timestamp: number;
};