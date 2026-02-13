export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <section id="home" className="py-20">
        <h1 className="text-4xl font-bold">Home</h1>
        <p className="mt-4 text-muted-foreground">Welcome to my portfolio.</p>
      </section>

      <section id="work" className="scroll-mt-24 border-t py-20">
        <h2 className="text-3xl font-bold">Work</h2>
        <p className="mt-4 text-muted-foreground">
          Here are selected projects and case studies from my recent work.
        </p>
      </section>

      <section id="about" className="scroll-mt-24 border-t py-20">
        <h2 className="text-3xl font-bold">About</h2>
        <p className="mt-4 text-muted-foreground">
          I design and build thoughtful web experiences focused on usability and performance.
        </p>
      </section>
    </div>
  );
}
