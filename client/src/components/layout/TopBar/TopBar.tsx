import { NavLink } from 'react-router';
import { useEffect } from 'react';
import { themeChange } from 'theme-change';
import { AppNavigation } from '@/constants/navigation.constants';

const navItems = [
  { label: 'Home', href: AppNavigation.HOME },
  // { label: "Skills", href: AppNavigation.SKILLS },
  { label: 'About', href: AppNavigation.ABOUT },
  { label: 'Portfolio', href: AppNavigation.PORTFOLIO },
  { label: 'Experience', href: AppNavigation.EXPERIENCE },
  // { label: "Testimonials", href: AppNavigation.TESTIMONIALS },
  { label: 'Contact', href: AppNavigation.CONTACT },
] as const;

export default function TopBar() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
      document.documentElement.setAttribute('data-theme', 'portfolio-dark');
    }
    themeChange(false);
  }, []);

  return (
    <header className=''>
      <div
        className={
          'bg-base-200 mx-auto mt-2 flex h-20 w-full max-w-6xl items-center justify-between gap-4 rounded-full px-16'
        }
      >
        <NavLink
          to={AppNavigation.HOME}
          className='flex shrink-0 items-center gap-2'
        >
          <img src='/vite.svg' alt='Brand logo' className='h-8 w-8' />
          <span className='text-lg font-semibold'>My Portfolio</span>
        </NavLink>

        <nav aria-label='Main navigation' className='flex-1 overflow-x-auto'>
          <ul className='flex min-w-max items-center justify-center gap-1 text-sm font-medium'>
            {navItems.map((item) => (
              <li key={item.label}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `group relative block px-4 py-3 font-semibold transition-transform duration-300 ease-out hover:-translate-y-0.5 ${
                      isActive ? 'text-primary' : 'text-base-content'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className='relative block h-6 overflow-hidden leading-6'>
                        <span
                          className={`block transform transition-transform duration-300 ease-out group-hover:-translate-y-6 ${
                            isActive ? '-translate-y-6' : 'translate-y-0'
                          }`}
                        >
                          <span className='block h-6'>{item.label}</span>
                          <span className='text-primary block h-6'>
                            {item.label}
                          </span>
                        </span>
                      </span>
                      <span
                        className={`bg-primary absolute bottom-1 left-4 h-px origin-left transition-transform duration-300 ease-out ${
                          isActive
                            ? 'right-4 scale-x-100'
                            : 'right-4 scale-x-0 group-hover:scale-x-100'
                        }`}
                      />
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className='flex shrink-0 items-center gap-2'>
          <a
            href='mailto:hello@example.com'
            className='d-btn d-btn-sm d-btn-primary hidden sm:inline-flex'
          >
            Let&apos;s Talk
          </a>
        </div>
      </div>
    </header>
  );
}
