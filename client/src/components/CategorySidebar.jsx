import { useEffect, useState } from 'react';
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

  const items = [
    { label: 'Home', to: '/' },
    ...categories.map((c) => ({ label: c, to: `/shop/${encodeURIComponent(c)}` })),
  ];

  return (
    <aside className="flex flex-col bg-surface-container-low w-full lg:w-56 lg:h-[calc(100vh-80px)] lg:rounded-xl lg:shadow-sm lg:sticky lg:top-[80px] lg:shrink-0 overflow-hidden">
      <div className="p-5 pb-4 border-b border-surface-container/60">
        <h2 className="text-sm font-bold text-on-surface mb-0.5">Categories</h2>
        <p className="text-xs text-on-surface-variant">Explore collections</p>
      </div>
      <nav className="flex-1 flex flex-row lg:flex-col gap-0.5 p-2 overflow-x-auto lg:overflow-y-auto">
        {items.map((item) => {
          const isActive = item.label === activeCategory || (item.to === '/' && !activeCategory);
          return (
            <Link
              key={item.label}
              to={item.to}
              className={
                isActive
                  ? 'bg-primary-container text-on-primary-container rounded-lg px-3 py-2.5 flex items-center gap-2.5 text-sm font-semibold shadow-sm whitespace-nowrap'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary rounded-lg px-3 py-2.5 flex items-center gap-2.5 text-sm font-medium transition-colors whitespace-nowrap'
              }
            >
              <span className="material-symbols-outlined text-lg">{iconMap[item.label] || 'category'}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-surface-container/60 space-y-1.5 hidden lg:block">
        {isAdmin && (
          <button
            onClick={() => navigate('/admin')}
            className="w-full btn-secondary rounded-lg py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
            Admin Center
          </button>
        )}
        {!user && (
          <button
            onClick={() => navigate('/login')}
            className="w-full btn-primary rounded-lg py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">person_add</span>
            Sign In
          </button>
        )}
      </div>
    </aside>
  );
};

export default CategorySidebar;
