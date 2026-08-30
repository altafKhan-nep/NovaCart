import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const TopBar = () => (
  <div className="bg-primary text-on-primary text-xs hidden md:block">
    <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex items-center justify-between h-8">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">local_shipping</span>
          Free shipping on orders over $50
        </span>
        <span className="w-px h-3 bg-white/30" />
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">support_agent</span>
          24/7 Support
        </span>
      </div>
      <div className="flex items-center gap-4">
        <Link to="/account" className="hover:text-white/80 transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">location_on</span>
          Track Order
        </Link>
        <Link to="/account" className="hover:text-white/80 transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">help</span>
          Help
        </Link>
      </div>
    </div>
  </div>
);

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
    { to: '/', label: 'Home', icon: 'home' },
    { to: '/shop', label: 'Shop', icon: 'storefront' },
    { to: '/shop?flash=true', label: 'Deals', icon: 'bolt' },
    { to: '/shop/Electronics', label: 'New Arrivals', icon: 'new_releases' },
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
            {/* ── Logo ── */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <span
                  className="text-on-primary text-xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  local_mall
                </span>
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

            {/* ── Desktop Nav ── */}
            <nav className="hidden lg:flex items-center gap-1">
              {links.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.to}
                  className={({ isActive }) =>
                    `relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      isActive && link.to === '/shop'
                        ? 'bg-primary/8 text-primary'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="material-symbols-outlined text-[18px]" style={isActive && link.to === '/shop' ? { fontVariationSettings: "'FILL' 1" } : {}}>
                        {link.icon}
                      </span>
                      {link.label}
                      {isActive && link.to === '/shop' && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-primary rounded-full" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* ── Right Section ── */}
            <div className="flex items-center gap-1.5 md:gap-2">
              {/* Search */}
              <form onSubmit={handleSearch} className="hidden md:flex items-center relative">
                <div className="flex items-center bg-surface-container-low rounded-full border border-transparent focus-within:border-primary/30 focus-within:bg-surface transition-all duration-300">
                  <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[18px] pointer-events-none">
                    search
                  </span>
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
                <span className="material-symbols-outlined text-[20px]">favorite</span>
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                aria-label="Shopping Cart"
                className="relative p-2.5 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>
                  shopping_cart
                </span>
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
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:inline-flex items-center gap-1.5 bg-primary text-on-primary text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-primary/90 hover:shadow-md transition-all duration-200"
                >
                  <span className="material-symbols-outlined text-[18px]">person</span>
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

        {/* ── Mobile Drawer ── */}
        {mobileOpen && (
          <div className="lg:hidden bg-surface border-t border-surface-container animate-fade-up">
            <div className="px-4 py-4 space-y-3 max-h-[80vh] overflow-y-auto">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex items-center relative">
                <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[18px] pointer-events-none">
                  search
                </span>
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
                    <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
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
                    <span className="material-symbols-outlined text-xl">logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 bg-primary text-on-primary font-semibold py-3 rounded-full w-full text-sm"
                >
                  <span className="material-symbols-outlined text-lg">person</span>
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
