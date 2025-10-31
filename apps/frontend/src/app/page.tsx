export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-4">
          LYROX OS
        </h1>
        <p className="text-xl text-center text-muted-foreground mb-8">
          Autonomous Business Operating System
        </p>
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-lg mb-4">
            Transform any business into a self-operating AI-powered company
          </p>
          <div className="flex gap-4 justify-center mt-6">
            <a
              href="/login"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition"
            >
              Login
            </a>
            <a
              href="/signup"
              className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:opacity-90 transition"
            >
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
