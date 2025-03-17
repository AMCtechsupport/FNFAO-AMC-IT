import supabase from "./lib/supabase";
import PreIntake from "./pre-intake/page";

export default function Home() {
  console.log(supabase);
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <main
        className="flex-grow flex items-center justify-center"
        style={{
          backgroundImage: "url('/g52.webp')",
          backgroundSize: "contain",
          backgroundPosition: "center", // Center the image
          backgroundRepeat: "no-repeat", // Avoid image repetition
          height: "100vh",
        }}
      >
      </main>

      <footer className="bg-black text-white text-center p-4">
        <p>&copy; 2025 FNFAO App</p>
      </footer>
    </div>
  );
}
