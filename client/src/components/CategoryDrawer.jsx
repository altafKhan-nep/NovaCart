import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

/* ─── Flipkart-style SVG icons — monochrome ─── */
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
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12h.01M12 12h.01M16 12h.01" />
  </svg>
);

const getIcon = (name) => CategoryIcons[name] || FALLBACK_ICON;

const quickLinks = [
  { label: 'Today\'s Deals', icon: 'local_offer', path: '/shop?flash=true' },
  { label: 'New Arrivals', icon: 'new_releases', path: '/shop?sort=newest' },
  { label: 'Best Sellers', icon: 'trending_up', path: '/shop?sort=popular' },
];

const CategoryDrawer = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [categories, setCategories] = useState([]);
  const panelRef = useRef(null);

  useEffect(() => {
    if (open) {
      api.getPublicCategories().then(setCategories).catch(() => {});
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const handleCategoryClick = (slug, name) => {
    onClose();
    navigate(slug ? `/shop/${encodeURIComponent(slug)}` : '/shop');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 left-0 z-[70] h-full w-[300px] max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#a43c12] flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.36 9l.6 3H5.04l.6-3h12.72M20 4H4v2h16V4zm0 3H4l-1 5v2h1v6h10v-6h4v6h2v-6h1v-2l-1-5zM6 18v-4h6v4H6z"/>
                </svg>
              </div>
              <div>
                <span className="text-sm font-bold text-gray-900 block leading-tight">NovaCart</span>
                <span className="text-[10px] text-gray-400 font-medium">Browse Categories</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Categories list */}
          <nav className="flex-1 overflow-y-auto py-2">
            {/* All Products */}
            <button
              onClick={() => handleCategoryClick('', 'All')}
              className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-orange-50 transition-colors group"
            >
              <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                <CategoryIcons.All className="w-4 h-4 text-gray-500 group-hover:text-orange-500" />
              </span>
              <span className="text-[13px] font-medium text-gray-700 group-hover:text-orange-600">All Products</span>
            </button>

            <div className="mx-5 my-1 h-px bg-gray-100" />

            {/* Category items */}
            {categories.map((cat) => {
              const IconComp = getIcon(cat.name);
              return (
                <button
                  key={cat._id}
                  onClick={() => handleCategoryClick(cat.slug, cat.name)}
                  className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-orange-50 transition-colors group"
                >
                  <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-orange-100 transition-colors shrink-0">
                    <IconComp className="w-4 h-4 text-gray-500 group-hover:text-orange-500" />
                  </span>
                  <span className="text-[13px] font-medium text-gray-700 group-hover:text-orange-600 flex-1 truncate">{cat.name}</span>
                  {cat.productCount > 0 && (
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded group-hover:bg-orange-100 group-hover:text-orange-500">
                      {cat.productCount}
                    </span>
                  )}
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              );
            })}

            <div className="mx-5 my-1 h-px bg-gray-100" />

            {/* Quick links */}
            <p className="px-5 pt-3 pb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quick Links</p>
            {quickLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => { onClose(); navigate(link.path); }}
                className="w-full flex items-center gap-3 px-5 py-2.5 text-left hover:bg-gray-50 transition-colors group"
              >
                <span className="material-symbols-outlined text-[18px] text-gray-400 group-hover:text-orange-500">{link.icon}</span>
                <span className="text-[13px] text-gray-600 group-hover:text-gray-900">{link.label}</span>
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-100 p-4 space-y-2">
            {isAdmin && (
              <button
                onClick={() => { onClose(); navigate('/admin'); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[12px] font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                Admin Panel
              </button>
            )}
            {!user && (
              <button
                onClick={() => { onClose(); navigate('/login'); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[12px] font-semibold bg-[#a43c12] text-white hover:bg-[#8a3210] transition-colors"
              >
                <span className="material-symbols-outlined text-base">login</span>
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryDrawer;
