import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Header() {
  return (
    <>
      {/* Header for unauthenticated users */}
      <SignedOut>
        <header className="bg-black text-white">
          <div className="flex justify-between p-4">
            <div className="flex-1"></div> {/* Pushes content to the right */}
            <SignInButton>Sign In</SignInButton>
          </div>
        </header>
      </SignedOut>

      {/* Header for authenticated users */}
      <SignedIn>
        <header className="bg-black text-white">
          <div className="flex justify-between items-center p-4">
            {/* Logo */}
            <Link href="/user-home">
              <img src="/logoDataHub.png" alt="logo" />
            </Link>

            {/* Navigation links and auth button */}
            <div className="flex items-center space-x-6">
              {/* <Link href="/" className="text-white hover:text-gray-300 mr-4">
                Home
              </Link>
              <Link href="/user-home" className="text-white hover:text-gray-300">
                Dashboard
              </Link> */}

              {/* Authenticated user button */}
              <UserButton />
            </div>
          </div>
        </header>
      </SignedIn>
    </>
  );
}
