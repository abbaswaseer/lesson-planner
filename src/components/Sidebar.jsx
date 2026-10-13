import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useActiveProfile } from '../db/activeProfile.js';

// Menu order. Paths must match the routes in App.jsx.
export const NAV_LINKS = [
  { to: '/setup', label: 'Setup' },
  { to: '/sources', label: 'Sources' },
  { to: '/generate', label: 'Generate' },
  { to: '/history', label: 'History' },
  { to: '/help', label: 'Help' },
];

const LINK_BASE = 'block rounded-md px-3 py-2 text-sm font-medium';
const LINK_ACTIVE = 'bg-blue-100 text-blue-700';
const LINK_IDLE = 'text-gray-700 hover:bg-blue-50 hover:text-blue-700';

/**
 * App navigation. A fixed left sidebar on laptops; on phones it becomes a
 * top bar with a Menu button that opens the links underneath.
 */
export default function Sidebar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const profile = useActiveProfile();

  return (
    <aside className="border-b border-gray-200 bg-gray-50 md:sticky md:top-0 md:h-screen md:w-56 md:shrink-0 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between px-4 py-4 md:block md:px-5 md:py-6">
        <div className="min-w-0">
          <span className="text-lg font-bold text-blue-600">Lesson Planner</span>
          {/* Placeholder until the profile switcher arrives in T-12. */}
          <p className="mt-1 truncate text-xs text-gray-500">
            {profile === undefined ? 'Loading…' : profile ? `Profile: ${profile.name}` : 'No profile yet'}
          </p>
        </div>
        <button
          type="button"
          className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 md:hidden"
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      <nav
        id="main-nav"
        className={`${menuOpen ? 'block' : 'hidden'} px-2 pb-3 md:block md:px-3 md:pb-0`}
      >
        <ul className="space-y-1">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                // On phones the open menu would cover the page, so close it after a tap.
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => `${LINK_BASE} ${isActive ? LINK_ACTIVE : LINK_IDLE}`}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
