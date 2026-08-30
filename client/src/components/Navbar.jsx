import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { itemsCount } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?keyword=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  const links = [
    { to: '/', label: 'Home', icon: 'home' },
    { to: '/shop', label: 'Shop', icon: 'storefront' },
    { to: '/shop?flash=true', label: 'Deals', icon: 'bolt' },
    { to: '/shop/Electronics', label: 'New Arrivals', icon: 'new_releases' },
  ];

  return (
    <header className="bg-surface/95 backdrop-blur-md sticky top-0 z-50 w-full border-b border-surface-container/60">
      <div className="flex items-center justify-between w-full max-w-container-max mx-auto h-16 px-4 md:px-margin-desktop gap-4">
        {/* Left: Logo + Nav Links */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2 group mr-4"
          >
            <span
              className="w-9 h-9 rounded-xl bg-primary-container flex items-center justify-center group-hover:animate-wiggle transition-transform"
            >
              <span className="material-symbols-outlined text-on-primary-container text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_mall
              </span>
            </span>
            <span className="font-headline-md text-headline-md font-bold text-primary hidden sm:inline">
              NovaCart
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive && link.to === '/shop'
                      ? 'bg-primary-container/15 text-primary'
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                  }`
                }
              >
                <span className="material-symbols-outlined text-lg">{link.icon}</span>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right: Search + Cart + Auth */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center relative">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-lg pointer-events-none">
              search
            </span>
            <input
              className="bg-surface-container-low rounded-lg py-2 pl-9 pr-4 text-sm text-on-surface w-52 focus:w-64 border border-transparent focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all duration-300 outline-none"
              placeholder="Search products..."
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>

          {/* Cart */}
          <Link
            to="/cart"
            aria-label="Shopping Cart"
            className="relative p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 0" }}>
              shopping_cart
            </span>
            {itemsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-on-primary text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-surface leading-none">
                {itemsCount}
              </span>
            )}
          </Link>

          {/* Divider */}
          <div className="hidden md:block w-px h-6 bg-outline-variant/50"></div>

          {/* Auth */}
          {user ? (
            <div className="hidden md:flex items-center gap-1">
              <Link
                to={isAdmin ? '/admin' : '/account'}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-container-low transition-colors group"
              >
                <span className="w-8 h-8 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center text-sm font-bold group-hover:bg-primary-container/30 transition-colors">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors hidden lg:inline">
                  {user.name.split(' ')[0]}
                </span>
              </Link>
              <button
                onClick={logout}
                className="p-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-colors"
                aria-label="Logout"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden md:inline-flex items-center gap-1.5 btn-primary text-on-primary-container text-sm font-semibold px-4 py-2 rounded-lg"
            >
              <span className="material-symbols-outlined text-lg">person</span>
              Sign In
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
            aria-label="Menu"
          >
            <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="lg:hidden bg-surface border-t border-surface-container px-4 py-4 animate-fade-up">
          <nav className="flex flex-col gap-1 mb-4">
            {links.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary-container/15 text-primary' : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`
                }
              >
                <span className="material-symbols-outlined text-lg">{link.icon}</span>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <form onSubmit={(e) => { handleSearch(e); setMobileOpen(false); }} className="flex items-center gap-2 mb-4">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none">
                search
              </span>
              <input
                className="w-full bg-surface-container-low rounded-lg py-2.5 pl-9 pr-4 text-sm text-on-surface outline-none"
                placeholder="Search products..."
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </form>

          <div className="border-t border-surface-container pt-4">
            {user ? (
              <div className="flex items-center justify-between">
                <Link
                  to={isAdmin ? '/admin' : '/account'}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3"
                >
                  <span className="w-9 h-9 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center text-sm font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-on-surface">{user.name}</p>
                    <p className="text-xs text-on-surface-variant">{isAdmin ? 'Admin Dashboard' : 'My Account'}</p>
                  </div>
                </Link>
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="p-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 btn-primary text-on-primary-container font-semibold py-3 rounded-lg w-full"
              >
                <span className="material-symbols-outlined text-lg">person</span>
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
