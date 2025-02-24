import supabase from "../lib/supabase";
import PreIntake from "./pre-intake/page";

export default function Home() {
  console.log(supabase);
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
      <main className="flex-grow flex items-center justify-center text-center p-8">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to the AMC Database!
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            This is a basic home page for the AMC Database.
          </p>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              We are the best!
            </h2>
            <ul className="list-disc list-inside text-left text-gray-700">
              <li>This is a sentence</li>
              <li>Fast-Loading!</li>
              <li>Should be public!</li>
              <li>
                Server-Side Rendering (SSR) and Static Site Generation (SSG)
              </li>
            </ul>
          </div>
        </div>

      </main>

      <footer className="bg-gray-800 text-white text-center p-4">
        <p>&copy; 2025 My Next.js App</p>
      </footer>
    </div>
  );
}
