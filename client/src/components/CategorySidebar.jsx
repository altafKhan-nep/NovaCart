import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

/* ─── Flipkart-style custom SVG icons — monochrome ─── */
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
};

const FALLBACK_ICON = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const getIcon = (name) => CategoryIcons[name] || FALLBACK_ICON;

/* ─── Sidebar — Amazon/Flipkart/Daraz clean style ─── */
const CategorySidebar = ({ activeCategory }) => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [dbCategories, setDbCategories] = useState([]);

  useEffect(() => {
    api.getPublicCategories().then(setDbCategories).catch(() => {});
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
    <aside className="flex flex-col w-full lg:w-[220px] lg:h-[calc(100vh-108px)] lg:rounded-xl lg:sticky lg:top-[108px] lg:shrink-0 overflow-hidden bg-white border border-gray-200/80">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-[13px] font-bold text-gray-900 tracking-tight">Categories</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-row lg:flex-col overflow-x-auto lg:overflow-y-auto">
        {items.map((item) => {
          const isActive = item.name ? item.name === activeCategory : !activeCategory;
          const IconComponent = getIcon(item.name);

          return (
            <Link
              key={item.label}
              to={item.slug ? `/shop/${encodeURIComponent(item.slug)}` : '/shop'}
              className={`relative flex items-center gap-2.5 px-4 py-2.5 text-[13px] transition-all duration-150 whitespace-nowrap group ${
                isActive
                  ? 'bg-orange-50 text-orange-600 font-semibold border-r-[3px] border-orange-500 lg:border-r-[3px] lg:border-r-orange-500'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-r-[3px] border-transparent'
              }`}
            >
              <IconComponent className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                isActive ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-600'
              }`} />

              <span className="flex-1 truncate">{item.label}</span>

              {item.productCount != null && item.productCount > 0 && (
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {item.productCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Promo */}
      <div className="p-3 border-t border-gray-100 hidden lg:block">
        <div className="bg-orange-500 rounded-lg p-3 text-center">
          <p className="text-white text-[11px] font-bold uppercase tracking-wide mb-0.5">Special Offer</p>
          <p className="text-white/90 text-lg font-bold">20% OFF</p>
          <p className="text-white/70 text-[11px] mb-2">Code: WELCOME20</p>
          <button
            onClick={() => navigate('/shop')}
            className="w-full bg-white text-orange-600 text-[12px] font-bold py-1.5 rounded hover:bg-orange-50 transition-colors"
          >
            Shop Now
          </button>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-gray-100 space-y-1.5 hidden lg:block">
        {isAdmin && (
          <button
            onClick={() => navigate('/admin')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span className="material-symbols-outlined text-base">admin_panel_settings</span>
            Admin Panel
          </button>
        )}
        {!user && (
          <button
            onClick={() => navigate('/login')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors"
          >
            <span className="material-symbols-outlined text-base">login</span>
            Sign In
          </button>
        )}
      </div>
    </aside>
  );
};

export default CategorySidebar;
