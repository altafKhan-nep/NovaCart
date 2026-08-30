import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CategorySidebar = ({ categories, activeCategory }) => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const iconMap = {
    Home: 'home',
    Electronics: 'devices',
    Fashion: 'apparel',
    'Home Decor': 'deck',
    Toys: 'toys',
  };

  const colorMap = {
    Home: 'from-primary/10 to-primary/5 text-primary',
    Electronics: 'from-blue-500/10 to-blue-500/5 text-blue-600',
    Fashion: 'from-rose-500/10 to-rose-500/5 text-rose-600',
    'Home Decor': 'from-amber-500/10 to-amber-500/5 text-amber-600',
    Toys: 'from-violet-500/10 to-violet-500/5 text-violet-600',
  };

  const items = [
    { label: 'Home', to: '/' },
    ...categories.map((c) => ({ label: c, to: `/shop/${encodeURIComponent(c)}` })),
  ];

  return (
    <aside className="flex flex-col w-full lg:w-60 lg:h-[calc(100vh-108px)] lg:rounded-2xl lg:sticky lg:top-[108px] lg:shrink-0 overflow-hidden bg-surface-container-low border border-surface-container/80">
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-on-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              category
            </span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-on-surface leading-tight">Categories</h2>
            <p className="text-[11px] text-on-surface-variant leading-tight">Explore collections</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-surface-container to-transparent" />

      {/* Navigation */}
      <nav className="flex-1 flex flex-row lg:flex-col gap-1 p-3 overflow-x-auto lg:overflow-y-auto scrollbar-thin">
        {items.map((item) => {
          const isActive = item.label === activeCategory || (item.to === '/' && !activeCategory);
          const colors = colorMap[item.label] || 'from-gray-500/10 to-gray-500/5 text-gray-600';

          return (
            <Link
              key={item.label}
              to={item.to}
              className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap group ${
                isActive
                  ? 'bg-gradient-to-r ' + colors + ' font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              {/* Active indicator */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-primary to-primary/60" />
              )}

              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
                isActive
                  ? 'bg-white/60 shadow-sm'
                  : 'bg-surface-container/50 group-hover:bg-surface-container-high'
              }`}>
                <span
                  className="material-symbols-outlined text-[17px]"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {iconMap[item.label] || 'category'}
                </span>
              </div>

              <span className="truncate">{item.label}</span>

              {isActive && (
                <span className="ml-auto material-symbols-outlined text-[14px] opacity-60 hidden lg:block">
                  chevron_right
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Promo Card */}
      <div className="p-3 hidden lg:block">
        <div className="relative rounded-xl overflow-hidden p-4"
          style={{ background: 'linear-gradient(135deg, #a43c12 0%, #ff7f50 100%)' }}
        >
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-white text-lg">local_offer</span>
              <span className="text-white/90 text-xs font-bold uppercase tracking-wider">Special Offer</span>
            </div>
            <p className="text-white font-bold text-base mb-1">20% OFF</p>
            <p className="text-white/70 text-xs mb-3">Use code WELCOME20</p>
            <button
              onClick={() => navigate('/shop')}
              className="w-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold py-2 rounded-lg backdrop-blur-sm transition-colors"
            >
              Shop Now
            </button>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-surface-container/60 space-y-2 hidden lg:block">
        {isAdmin && (
          <button
            onClick={() => navigate('/admin')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-surface-container-high hover:bg-surface-container text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
            Admin Center
          </button>
        )}
        {!user && (
          <button
            onClick={() => navigate('/login')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-primary text-on-primary hover:bg-primary/90 hover:shadow-md transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            Sign In
          </button>
        )}
      </div>
    </aside>
  );
};

export default CategorySidebar;
