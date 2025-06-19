import supabase from "./lib/supabase";

export default function Home() {
  // console.log(supabase);
  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 96px)" }}>
      <main
        className="flex-grow flex items-center justify-center"
        style={{
          backgroundImage: "url('/g52.webp')",
          backgroundSize: "contai",
          backgroundPosition: "center", // Center the image
          backgroundRepeat: "no-repeat", // Avoid image repetition
          backgroundColor: "#212121",
        }}
      >
      </main>

      <footer className="bg-black text-white text-center p-4">
        <p>&copy; All rights reserved. 2025 Assembly of Manitoba Chiefs </p>
      </footer>
    </div>
  );
}
