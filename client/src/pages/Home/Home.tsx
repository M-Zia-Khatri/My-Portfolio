const sectionClassName =
  "scroll-mt-24 snap-start border-t py-20 min-h-[calc(100vh-5rem)] flex flex-col justify-center";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl snap-y snap-mandatory px-4">
      <section id="home" className="snap-start py-20 min-h-[calc(100vh-5rem)] flex flex-col justify-center">
        <h1 className="text-4xl font-bold">Home</h1>
        <p className="mt-4 text-muted-foreground">Welcome to my portfolio.</p>
      </section>

      <section id="skills" className={sectionClassName}>
        <h2 className="text-3xl font-bold">Skills</h2>
        <p className="mt-4 text-muted-foreground">
          React, TypeScript, Tailwind CSS, Node.js, and modern front-end architecture.
        </p>
      </section>

      <section id="about" className={sectionClassName}>
        <h2 className="text-3xl font-bold">About</h2>
        <p className="mt-4 text-muted-foreground">
          I design and build thoughtful web experiences focused on usability and performance.
        </p>
      </section>

      <section id="portfolio" className={sectionClassName}>
        <h2 className="text-3xl font-bold">Portfolio</h2>
        <p className="mt-4 text-muted-foreground">
          A collection of selected builds spanning product websites, dashboards, and landing pages.
        </p>
      </section>

      <section id="experience" className={sectionClassName}>
        <h2 className="text-3xl font-bold">Experience</h2>
        <p className="mt-4 text-muted-foreground">
          5+ years delivering full-stack web projects, from initial concepts to production launches.
        </p>
      </section>

      <section id="testimonials" className={sectionClassName}>
        <h2 className="text-3xl font-bold">Testimonials</h2>
        <p className="mt-4 text-muted-foreground">
          “Reliable, detail-oriented, and fast. A strong partner from planning through delivery.”
        </p>
      </section>

      <section id="contact" className={sectionClassName}>
        <h2 className="text-3xl font-bold">Contact</h2>
        <p className="mt-4 text-muted-foreground">
          Let’s work together — reach out any time at hello@example.com.
        </p>
      </section>
    </div>
  );
}
