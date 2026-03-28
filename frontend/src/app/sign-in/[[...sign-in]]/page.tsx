import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen bg-[#000000] items-center justify-center">
      <SignIn forceRedirectUrl="/home" />
    </div>
  );
}
