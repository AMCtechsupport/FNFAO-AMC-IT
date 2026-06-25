
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
      </main>
      <footer className="bg-black text-white text-center p-4">
        <p>&copy; All rights reserved. 2026 Assembly of Manitoba Chiefs </p>
      </footer>
    </div>
  );
}
