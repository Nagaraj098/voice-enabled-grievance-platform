type Message = {
  role: string;
  text: string;
  timestamp?: string;
};

type SummaryData = {
  issue_category: string;
  severity: string;
  description: string;
  resolution_status: string;
  messages: Message[];
  duration?: string;
} | null;

export function exportTranscript(data: SummaryData, sessionId: string): string {
  if (!data) return "No data available";

  const date = new Date().toLocaleString();

  const header = `
VOICE AI GRIEVANCE PLATFORM
============================
Session ID  : ${sessionId}
Date        : ${date}
Duration    : ${data.duration || "N/A"}

ISSUE DETAILS
============================
Category    : ${data.issue_category || "N/A"}
Severity    : ${data.severity || "N/A"}
Description : ${data.description || "N/A"}
Resolution  : ${data.resolution_status || "N/A"}

CONVERSATION TRANSCRIPT
============================
`.trim();

  const transcript = (data.messages || [])
    .map(msg => {
      const role = msg.role === "user" ? "User" : "AI  ";
      const time = msg.timestamp ? ` [${msg.timestamp}]` : "";
      return `${role}${time}: ${msg.text}`;
    })
    .join("\n\n");

  return `${header}\n\n${transcript}\n\n--- End of Transcript ---`;
}