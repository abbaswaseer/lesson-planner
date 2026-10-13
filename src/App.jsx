import Sidebar from './components/Sidebar.jsx';

/**
 * Root layout: navigation on the left (top on phones), page content on the right.
 * Routes are added in T-06.
 */
export default function App() {
  return (
    <div className="min-h-screen md:flex">
      <Sidebar />
      <main className="flex-1 px-4 py-6 md:px-10 md:py-10">
        <p className="text-gray-500">Choose a page from the menu.</p>
      </main>
    </div>
  );
}
