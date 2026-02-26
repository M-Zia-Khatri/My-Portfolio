import { NavLink } from "react-router";
import { AppNavigation } from "@/constants/navigation.constants";

const navItems = [
  { label: "Home", href: AppNavigation.HOME },
  // { label: "Skills", href: AppNavigation.SKILLS },
  { label: "About", href: AppNavigation.ABOUT },
  { label: "Portfolio", href: AppNavigation.PORTFOLIO },
  { label: "Experience", href: AppNavigation.EXPERIENCE },
  // { label: "Testimonials", href: AppNavigation.TESTIMONIALS },
  { label: "Contact", href: AppNavigation.CONTACT },
] as const;

export default function TopBar() {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between gap-6 px-4">
        <NavLink to={AppNavigation.HOME} className="flex shrink-0 items-center gap-2">
          <img src="/vite.svg" alt="Brand logo" className="h-8 w-8" />
          <span className="text-lg font-semibold">My Portfolio</span>
        </NavLink>

        <nav aria-label="Main navigation" className="flex-1 overflow-x-auto">
          <ul className="flex min-w-max items-center justify-center gap-5 text-sm font-medium">
            {navItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <a
          href="mailto:hello@example.com"
          className="shrink-0 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Let's Talk
        </a>
      </div>
    </header>
  );
}
