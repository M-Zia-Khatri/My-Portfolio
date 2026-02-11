import { NavLink } from "react-router";
import { AppNavigation } from "@/constants/navigation.constants";

const navItems = [
  { label: "Home", to: AppNavigation.HOME },
  { label: "Work", to: AppNavigation.WORK },
  { label: "About", to: AppNavigation.ABOUT },
] as const;

export default function TopBar() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-4">
        <NavLink to={AppNavigation.HOME} className="flex items-center gap-2">
          <img src="/vite.svg" alt="Brand logo" className="h-8 w-8" />
          <span className="text-lg font-semibold">My Portfolio</span>
        </NavLink>

        <nav aria-label="Main navigation">
          <ul className="flex items-center gap-8 text-sm font-medium">
            {navItems.map((item) => (
              <li key={item.label}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground transition-colors hover:text-foreground"
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <a
          href="mailto:hello@example.com"
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Let's Talk
        </a>
      </div>
    </header>
  );
}
