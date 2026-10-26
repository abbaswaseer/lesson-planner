import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useActiveProfile } from '../db/activeProfile.js';
import ProfileSwitcher from './ProfileSwitcher.jsx';

// Menu order. Paths must match the routes in App.jsx.
export const NAV_LINKS = [
  { to: '/setup', label: 'Setup' },
  { to: '/sources', label: 'Sources' },
  { to: '/generate', label: 'Generate' },
  { to: '/history', label: 'History' },
  { to: '/help', label: 'Help' },
  { to: '/beams', label: 'BEAMS guide' },
];

const LINK_BASE = 'block rounded-md px-3 py-2 text-sm font-medium';
const LINK_ACTIVE = 'bg-blue-100 text-blue-700';
const LINK_IDLE = 'text-gray-700 hover:bg-blue-50 hover:text-blue-700';

/**
 * App navigation. A fixed left sidebar on laptops; on phones it becomes a
 * top bar with a Menu button that opens the profile switcher and links underneath.
 */
export default function Sidebar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const profile = useActiveProfile();

  return (
    <aside className="border-b border-gray-200 bg-gray-50 md:sticky md:top-0 md:h-screen md:w-56 md:shrink-0 md:overflow-y-auto md:border-b-0 md:border-r">
      <div className="flex items-center justify-between px-4 py-4 md:block md:px-5 md:pb-4 md:pt-6">
        <div className="min-w-0">
          <span className="text-lg font-bold text-blue-600">Lesson Planner</span>
          {/* On phones the switcher is inside the closed menu, so show the name here. */}
          {profile && <p className="mt-1 truncate text-xs text-gray-500 md:hidden">{profile.name}</p>}
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

      <div id="main-nav" className={`${menuOpen ? 'block' : 'hidden'} md:block`}>
        <div className="border-b border-gray-200 px-4 pb-4 md:px-5">
          <ProfileSwitcher />
        </div>

        <nav className="px-2 py-3 md:px-3">
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
      </div>
    </aside>
  );
}
