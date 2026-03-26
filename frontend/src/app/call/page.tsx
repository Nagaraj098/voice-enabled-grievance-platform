// import VoiceLayout from "@/components/voice/VoiceLayout";
// import { auth } from "@clerk/nextjs/server";
// import { redirect } from "next/navigation";

// export default function CallPage() {
//   const authData = auth() as any;   // ✅ FIX typing issue
//   const userId = authData.userId;   // ✅ now no red underline

//   if (!userId) {
//     redirect("/");
//   }

//   return <VoiceLayout />;
// }


// export default function CallPage() {
//   return (
//     <div style={{ color: "white", background: "black", height: "100vh" }}>
//       CALL PAGE WORKING ✅
//     </div>
//   );
// }

import VoiceLayout from "@/components/voice/VoiceLayout";

export default function CallPage() {
  return <VoiceLayout />;
}