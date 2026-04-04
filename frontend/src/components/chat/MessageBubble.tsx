"use client";

import { Message } from "@/types/chat";

export default function MessageBubble({
  message,
  isSpeaking,
}: {
  message: Message;
  isSpeaking?: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex w-full ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`px-4 py-2 rounded-xl max-w-xs relative ${
          isUser
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-black"
        }`}
      >
        {/* 🔥 Label */}
        {!isUser && (
          <div className="text-xs text-gray-500 mb-1">AI</div>
        )}

        <p>{message.text}</p>

        {/* 🔊 Speaking animation */}
        {!isUser && isSpeaking && (
          <div className="flex gap-1 mt-2">
            <span className="w-1 h-3 bg-blue-500 animate-bounce"></span>
            <span className="w-1 h-4 bg-blue-500 animate-bounce delay-75"></span>
            <span className="w-1 h-2 bg-blue-500 animate-bounce delay-150"></span>
          </div>
        )}
      </div>
    </div>
  );
}

// "use client";

// import { Message } from "@/types/chat";

// export default function MessageBubble({
//   message,
//   isSpeaking,
// }: {
//   message: Message;
//   isSpeaking?: boolean;
// }) {
//   const isUser = message.role === "user";

//   return (
//     <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
//       <div
//         className={`
//           px-4 py-2 rounded-xl max-w-xs relative transition-all duration-300
//           ${isUser
//             ? "bg-blue-500 text-white"
//             : isSpeaking
//               ? "bg-zinc-700 text-white ring-2 ring-blue-400 shadow-[0_0_16px_2px_rgba(96,165,250,0.5)]"
//               : "bg-gray-200 text-black"
//           }
//         `}
//       >
//         {/* Label */}
//         {!isUser && (
//           <div className={`text-xs mb-1 ${isSpeaking ? "text-blue-300" : "text-gray-500"}`}>
//             {isSpeaking ? "🔊 Speaking..." : "AI"}
//           </div>
//         )}

//         <p>{message.text}</p>

//         {/* ✅ Google Meet style — animated sound bars when speaking */}
//         {!isUser && isSpeaking && (
//           <div className="flex items-end gap-0.5 mt-2 h-4">
//             <span className="w-1 bg-blue-400 rounded-full animate-[bounce_0.6s_ease-in-out_infinite]"        style={{ height: "40%" }} />
//             <span className="w-1 bg-blue-400 rounded-full animate-[bounce_0.6s_ease-in-out_0.1s_infinite]"  style={{ height: "100%" }} />
//             <span className="w-1 bg-blue-400 rounded-full animate-[bounce_0.6s_ease-in-out_0.2s_infinite]"  style={{ height: "60%" }} />
//             <span className="w-1 bg-blue-400 rounded-full animate-[bounce_0.6s_ease-in-out_0.3s_infinite]"  style={{ height: "80%" }} />
//             <span className="w-1 bg-blue-400 rounded-full animate-[bounce_0.6s_ease-in-out_0.15s_infinite]" style={{ height: "50%" }} />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }