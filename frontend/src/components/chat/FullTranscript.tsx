// "use client";

// import { useTranscript } from "@/hooks/useTranscript";

// export default function FullTranscript() {
//   const { messages } = useTranscript();

//   return (
//     <div className="w-full max-w-xl h-96 border p-4 overflow-y-auto">
//       {messages.map((msg) => (
//         <div key={msg.id} className="mb-2">
//           <span className="font-semibold">
//             {msg.role === "user" ? "User: " : "Agent: "}
//           </span>
//           <span>{msg.text}</span>
//         </div>
//       ))}
//     </div>
//   );
// }

"use client";

import { Message } from "@/types/chat";

export default function FullTranscript({
  messages,
}: {
  messages: Message[];
}) {
  return (
    <div className="p-4 space-y-2 text-sm text-white">
      {messages.map((m) => (
        <p key={m.id}>
          <span className="font-semibold">{m.role}:</span> {m.text}
        </p>
      ))}
    </div>
  );
}