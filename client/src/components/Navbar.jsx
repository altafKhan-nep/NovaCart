import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const TopBar = () => {
  const [visible, setVisible] = useState(() => !localStorage.getItem('novacart_topbar_dismissed'));

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem('novacart_topbar_dismissed', '1');
  };

  if (!visible) return null;

  return (
    <div className="bg-primary text-on-primary text-xs hidden md:block">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex items-center justify-between h-8">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Free shipping on orders over $50
          </span>
          <span className="w-px h-3 bg-white/30" />
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            24/7 Support
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/account" className="hover:text-white/80 transition-colors flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Track Order
          </Link>
          <Link to="/account" className="hover:text-white/80 transition-colors flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Help
          </Link>
          <button
            onClick={dismiss}
            className="ml-1 p-0.5 rounded hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const Navbar = () => {
  const { itemsCount } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?keyword=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setMobileOpen(false);
    }
  };

  const links = [
    { to: '/', label: 'Home', icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { to: '/shop', label: 'Shop', icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    )},
    { to: '/shop?flash=true', label: 'Deals', icon: (
      <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    )},
    { to: '/shop/Electronics', label: 'New Arrivals', icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    )},
  ];

  return (
    <>
      <TopBar />

      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-surface/98 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
            : 'bg-surface/95 backdrop-blur-md'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-10">
          <div className="flex items-center justify-between h-16 lg:h-[72px] gap-4 lg:gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <svg className="w-5 h-5 text-on-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.36 9l.6 3H5.04l.6-3h12.72M20 4H4v2h16V4zm0 3H4l-1 5v2h1v6h10v-6h4v6h2v-6h1v-2l-1-5zM6 18v-4h6v4H6z"/>
                </svg>
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-bold text-on-surface tracking-tight block leading-tight">
                  NovaCart
                </span>
                <span className="text-[10px] text-on-surface-variant font-medium tracking-widest uppercase leading-none">
                  Curated for you
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {links.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.to}
                  className={({ isActive }) =>
                    `relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      isActive && (link.to === '/' || link.to === '/shop')
                        ? 'bg-primary/8 text-primary'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={isActive && (link.to === '/' || link.to === '/shop') ? 'text-primary' : ''}>
                        {link.icon}
                      </span>
                      {link.label}
                      {isActive && (link.to === '/' || link.to === '/shop') && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-primary rounded-full" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-1.5 md:gap-2">
              {/* Search */}
              <form onSubmit={handleSearch} className="hidden md:flex items-center relative">
                <div className="flex items-center bg-surface-container-low rounded-full border border-transparent focus-within:border-primary/30 focus-within:bg-surface transition-all duration-300">
                  <svg className="w-4 h-4 absolute left-3.5 text-on-surface-variant pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    className="bg-transparent py-2 pl-10 pr-4 text-sm text-on-surface w-44 focus:w-60 transition-all duration-300 outline-none placeholder:text-on-surface-variant/60"
                    placeholder="Search products..."
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </form>

              {/* Wishlist */}
              <Link
                to="/account"
                className="hidden md:flex p-2.5 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
                aria-label="Wishlist"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                aria-label="Shopping Cart"
                className="relative p-2.5 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                {itemsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary text-on-primary text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-surface leading-none animate-fade-up">
                    {itemsCount}
                  </span>
                )}
              </Link>

              {/* Divider */}
              <div className="hidden md:block w-px h-7 bg-outline-variant/40 mx-1" />

              {/* Auth */}
              {user ? (
                <div className="hidden md:flex items-center gap-1">
                  <Link
                    to={isAdmin ? '/admin' : '/account'}
                    className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full hover:bg-surface-container-low transition-colors group"
                  >
                    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 text-on-primary flex items-center justify-center text-xs font-bold shadow-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors max-w-[100px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                  </Link>
                  <button
                    onClick={logout}
                    className="p-2 rounded-full text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-colors"
                    aria-label="Logout"
                  >
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:inline-flex items-center gap-1.5 bg-primary text-on-primary text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-primary/90 hover:shadow-md transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Sign In
                </Link>
              )}

              {/* Mobile toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2.5 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors"
                aria-label="Menu"
              >
                <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="lg:hidden bg-surface border-t border-surface-container animate-fade-up">
            <div className="px-4 py-4 space-y-3 max-h-[80vh] overflow-y-auto">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex items-center relative">
                <svg className="w-4 h-4 absolute left-3.5 text-on-surface-variant pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  className="w-full bg-surface-container-low rounded-full py-2.5 pl-10 pr-4 text-sm text-on-surface outline-none border border-transparent focus:border-primary/30 transition-colors"
                  placeholder="Search products..."
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </form>

              {/* Nav Links */}
              <nav className="flex flex-col gap-0.5">
                {links.map((link) => (
                  <NavLink
                    key={link.label}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive ? 'bg-primary/8 text-primary' : 'text-on-surface-variant hover:bg-surface-container-low'
                      }`
                    }
                  >
                    <span className={``}>{link.icon}</span>
                    {link.label}
                  </NavLink>
                ))}
              </nav>

              {/* Divider */}
              <div className="h-px bg-surface-container" />

              {/* Auth */}
              {user ? (
                <div className="flex items-center justify-between px-2">
                  <Link
                    to={isAdmin ? '/admin' : '/account'}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3"
                  >
                    <span className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 text-on-primary flex items-center justify-center text-sm font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{user.name}</p>
                      <p className="text-xs text-on-surface-variant">{isAdmin ? 'Admin Dashboard' : 'My Account'}</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="p-2.5 rounded-full text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 bg-primary text-on-primary font-semibold py-3 rounded-full w-full text-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;
