
import supabase from "./lib/supabase";

export default function Home() {
  // console.log(supabase);
  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 96px)" }}>
      <main
        className="flex-grow flex flex-col items-center justify-end"
        style={{
          backgroundImage: "url('/g52.webp')",
          backgroundSize: "contai",
          backgroundPosition: "center", // Center the image
          backgroundRepeat: "no-repeat", // Avoid image repetition
          backgroundColor: "#212121",
        }}
      >
        {/*Below is the beta message, remove when "beta" is done.*/}
        <div className="w-8/9 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 mb-2">
          <strong className="flex justify-center">This is a beta version of the AMC-FNFAO application.</strong>
          <p>Please understand that certain features may be unfinished or not work properly, and that certain features may be subject to change. If you have encountered a bug, please record so using the forms in the links below:</p>
          <a href="https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=RZv6hqN6cECKVO3O9Da9RFwANWQspcdLreW8ou2khQZUNk9DS1RUUVZFMzg0UUxaQ0lYSjRONzFOSi4u" 
          className="flex justify-center text-lg font-bold underline" target="_blank" rel="noopener noreferrer"> 
                Bug Report Form 
          </a>
        </div>

      </main>
      <footer className="bg-black text-white text-center p-4">
        <p>&copy; All rights reserved. 2026 Assembly of Manitoba Chiefs </p>
      </footer>
    </div>
  );
}
