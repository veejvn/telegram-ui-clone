import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <p className="text-sm">Home</p>
        <div className="absolute bottom-4 right-4">
          <ModeToggle />
        </div>
      </main>
    </div>
  );
}
