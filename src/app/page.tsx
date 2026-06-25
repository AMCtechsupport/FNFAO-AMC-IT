
export default function Home() {
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
        <div className="w-8/9 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 mb-2 opacity-85">
          <strong className="flex justify-center">This is a beta version of the AMC-FNFAO application.</strong>
          <p className="text-center mt-1">
            Please understand that certain features may be unfinished or not work properly, and that
            certain features may be subject to change.
          </p>
        </div>

      </main>
      <footer className="bg-black text-white text-center p-4">
        <p>&copy; All rights reserved. 2026 Assembly of Manitoba Chiefs </p>
      </footer>
    </div>
  );
}
