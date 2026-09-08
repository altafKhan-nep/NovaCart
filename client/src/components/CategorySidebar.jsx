import { useState, useEffect, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

const CategoryIcons = {
  'All': ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  'Electronics': ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="13" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <circle cx="12" cy="10.5" r="2.5" />
    </svg>
  ),
  'Fashion': ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2l-4 5h5l-1 5 7 7 7-7-1-5h5l-4-5h-4l-1 2-1-2H6z" />
    </svg>
  ),
  'Home Decor': ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12l9-8 9 8" />
      <path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
      <path d="M10 21v-5h4v5" />
    </svg>
  ),
  'Toys': ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="5" />
      <path d="M7 13l-2 8h14l-2-8" />
      <circle cx="10" cy="7" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="14" cy="7" r="0.8" fill="currentColor" stroke="none" />
      <path d="M10.5 9.5c.5.5 1.2.8 1.5.8s1-.3 1.5-.8" />
    </svg>
  ),
  'Sports': ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3c-2 4-2 8 0 9s2 5 0 9" />
      <path d="M3 12h18" />
      <path d="M4.5 7h15" />
      <path d="M4.5 17h15" />
    </svg>
  ),
  'Books': ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19V5a2 2 0 012-2h8a2 2 0 012 2v14" />
      <path d="M16 17l4-3V5a2 2 0 00-2-2" />
      <path d="M4 19a2 2 0 002 2h8a2 2 0 002-2" />
      <path d="M16 17v4l4-3v-4" />
    </svg>
  ),
  'Beauty': ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8 2 4 6 4 10c0 6 8 12 8 12s8-6 8-12c0-4-4-8-8-8z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  'Pet Supplies': ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="7" r="2.5" />
      <circle cx="16" cy="7" r="2.5" />
      <circle cx="5" cy="13" r="2" />
      <circle cx="19" cy="13" r="2" />
      <path d="M12 17c-2 0-4 2-4 4h8c0-2-2-4-4-4z" />
    </svg>
  ),
  'Grocery': ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  ),
  'Automotive': ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 16H9m10 0h3v-3.15a1 1 0 00-.84-.99L16 11l-2.7-5.4a1 1 0 00-.9-.6H5.24a2 2 0 00-1.8 1.1l-.8 1.63A6 6 0 002 12.42V16h2" />
      <circle cx="6.5" cy="16.5" r="2.5" />
      <circle cx="16.5" cy="16.5" r="2.5" />
    </svg>
  ),
};

const FALLBACK_ICON = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12h.01M12 12h.01M16 12h.01" />
  </svg>
);

const getIcon = (name) => CategoryIcons[name] || FALLBACK_ICON;

const CategorySidebar = ({ activeCategory }) => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [dbCategories, setDbCategories] = useState([]);
  const [sidebarPromo, setSidebarPromo] = useState(null);

  useEffect(() => {
    api.getPublicCategories().then(setDbCategories).catch(() => {});
    api.getSidebarPromo().then(setSidebarPromo).catch(() => {});
  }, []);

  const items = [
    { label: 'All Products', name: '', slug: '' },
    ...dbCategories.map((c) => ({
      label: c.name,
      name: c.name,
      slug: c.slug,
      productCount: c.productCount,
    })),
  ];

  return (
    <aside className="flex flex-col w-full lg:w-[232px] lg:h-[calc(100vh-108px)] lg:rounded-2xl lg:sticky lg:top-[108px] lg:shrink-0 overflow-hidden bg-surface-container-lowest border border-outline-variant/10 shadow-sm">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-outline-variant/8">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[15px] text-primary">category</span>
          </div>
          <h2 className="text-[12px] font-bold text-on-surface tracking-wide uppercase">Categories</h2>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-row lg:flex-col overflow-x-auto lg:overflow-y-auto overscroll-contain">
        {items.map((item) => {
          const isActive = item.name ? item.name === activeCategory : !activeCategory;
          const IconComponent = getIcon(item.name);

          return (
            <Link
              key={item.label}
              to={item.slug ? `/shop/${encodeURIComponent(item.slug)}` : '/shop'}
              className={`relative flex items-center gap-3 px-4 py-3 text-[13px] transition-all duration-150 whitespace-nowrap group ${
                isActive
                  ? 'bg-primary/[0.06] text-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-primary/[0.03] hover:text-on-surface'
              }`}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
              )}

              <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                isActive
                  ? 'bg-primary/10'
                  : 'bg-surface-container-high/60 group-hover:bg-primary/[0.06]'
              }`}>
                <IconComponent className={`w-[16px] h-[16px] transition-colors duration-200 ${
                  isActive ? 'text-primary' : 'text-on-surface-variant/35 group-hover:text-primary/60'
                }`} />
              </span>

              <span className="flex-1 truncate">{item.label}</span>

              {item.productCount != null && item.productCount > 0 && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md tabular-nums transition-colors duration-200 ${
                  isActive ? 'bg-primary/12 text-primary' : 'bg-surface-container-high/60 text-on-surface-variant/35'
                }`}>
                  {item.productCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Promo */}
      {sidebarPromo && (
        <div className="p-3 border-t border-outline-variant/8 hidden lg:block">
          <div
            className="relative rounded-2xl p-4 text-center overflow-hidden"
            style={{ backgroundColor: sidebarPromo.sidebarBgColor || '#a43c12' }}
          >
            {/* Decorative circles */}
            <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-white/[0.08] pointer-events-none" />
            <div className="absolute -bottom-6 -left-3 w-10 h-10 rounded-full bg-white/[0.05] pointer-events-none" />

            <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.15em] mb-1 relative">
              {sidebarPromo.sidebarTitle || 'Special Offer'}
            </p>
            <p className="text-white text-xl font-extrabold leading-tight relative">
              {sidebarPromo.type === 'percentage'
                ? `${sidebarPromo.value}% OFF`
                : sidebarPromo.type === 'fixed'
                  ? `$${sidebarPromo.value} OFF`
                  : sidebarPromo.sidebarSubtitle || `${sidebarPromo.value}% OFF`}
            </p>
            <p className="text-white/50 text-[10px] font-medium mt-1 relative">
              Code: <span className="font-bold text-white/70">{sidebarPromo.code}</span>
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="mt-3 w-full bg-white/[0.92] text-[12px] font-bold py-2 rounded-xl hover:bg-white active:bg-white/90 transition-all duration-200 shadow-sm relative"
              style={{ color: sidebarPromo.sidebarBgColor || '#a43c12' }}
            >
              {sidebarPromo.sidebarButtonText || 'Shop Now'}
            </button>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="p-3 border-t border-outline-variant/8 space-y-2 hidden lg:block">
        {isAdmin && (
          <button
            onClick={() => navigate('/admin')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-semibold text-on-surface-variant bg-surface-container-high/60 hover:bg-surface-container-high active:bg-surface-container-highest transition-all duration-150"
          >
            <span className="material-symbols-outlined text-[15px]">admin_panel_settings</span>
            Admin Panel
          </button>
        )}
        {!user && (
          <button
            onClick={() => navigate('/login')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-bold bg-primary text-on-primary hover:bg-primary/90 active:bg-primary/80 shadow-md shadow-primary/15 hover:shadow-lg hover:shadow-primary/20 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[15px]">login</span>
            Sign In
          </button>
        )}
      </div>
    </aside>
  );
};

export default memo(CategorySidebar);
