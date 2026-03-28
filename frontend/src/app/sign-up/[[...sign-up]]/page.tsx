import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen bg-[#000000] items-center justify-center">
      <SignUp forceRedirectUrl="/home" />
    </div>
  );
}
