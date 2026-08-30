import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const KpiCard = ({ label, value, icon, iconBg, trend, trendUp, chartType }) => (
  <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient-surface border border-surface-variant relative overflow-hidden card-lift">
    <div className="container-max">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="font-body-md text-body-md text-on-surface-variant">{label}</p>
          <h3 className="font-headline-md text-headline-md text-on-surface mt-1">{value}</h3>
        </div>
        <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>

      {trend && (
        <div className="flex items-center gap-2 mb-4">
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
            trendUp ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'
          }`}>
            <span className="material-symbols-outlined text-[14px]">{trendUp ? 'trending_up' : 'trending_down'}</span>
            {trend}
          </span>
          <span className="text-xs text-on-surface-variant">vs last week</span>
        </div>
      )}

      {chartType === 'line' && (
        <svg className="w-full h-16 mt-auto" viewBox="0 0 100 30" preserveAspectRatio="none">
          <path
            className="animated-chart-line"
            d="M0,25 C10,20 20,28 30,15 C40,2 50,20 60,10 C70,0 80,18 90,5 L100,10"
            fill="none"
            stroke="#a43c12"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </svg>
      )}
      {chartType === 'bars' && (
        <div className="h-16 w-full flex items-end justify-between gap-1">
          {[40, 60, 30, 70, 50, 20].map((h, i) => (
            <div key={i} className="w-full bg-surface-container rounded-t-sm" style={{ height: `${h}%` }}></div>
          ))}
        </div>
      )}
    </div>
  </div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    api
      .getAdminStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-32">
        <div className="w-20 h-20 rounded-full bg-secondary-container animate-pulse"></div>
      </div>
    );
  }

  const statusMap = stats?.statusCounts || {};

  const pipeline = [
    { label: 'Pending', icon: 'inventory_2', count: statusMap.Pending || 0, active: false },
    { label: 'Processing', icon: 'autorenew', count: statusMap.Processing || 0, active: true },
    { label: 'Shipped', icon: 'local_shipping', count: statusMap.Shipped || 0, active: false },
    { label: 'Delivered', icon: 'check_circle', count: statusMap.Delivered || 0, active: false },
  ];

  return (
    <div className="flex flex-1 w-full">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col py-base bg-surface-container-low w-64 rounded-r-xl shadow-md sticky top-20 h-[calc(100vh-80px)] flex-shrink-0">
        <div className="px-margin-desktop py-gutter mb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-lg">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-headline-md text-headline-md text-primary m-0 leading-tight">NovaCart</h2>
            <p className="text-xs text-on-surface-variant m-0">Admin Center</p>
          </div>
        </div>
        <nav className="flex-1 flex flex-col gap-2 px-2">
          <a className="bg-primary-container text-on-primary-container rounded-full mx-2 px-4 py-3 flex items-center gap-3 cursor-pointer">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            <span className="font-label-bold text-label-bold">Dashboard</span>
          </a>
          <a className="text-on-surface-variant hover:bg-surface-container-high rounded-full mx-2 px-4 py-3 flex items-center gap-3 transition-colors cursor-pointer">
            <span className="material-symbols-outlined">monitoring</span>
            <span className="font-label-bold text-label-bold">Sales</span>
          </a>
          <a className="text-on-surface-variant hover:bg-surface-container-high rounded-full mx-2 px-4 py-3 flex items-center gap-3 transition-colors cursor-pointer">
            <span className="material-symbols-outlined">group</span>
            <span className="font-label-bold text-label-bold">Customers</span>
          </a>
          <Link to="/shop" className="text-on-surface-variant hover:bg-surface-container-high rounded-full mx-2 px-4 py-3 flex items-center gap-3 transition-colors cursor-pointer">
            <span className="material-symbols-outlined">storefront</span>
            <span className="font-label-bold text-label-bold">Products</span>
          </Link>
        </nav>
        <div className="p-4 mt-auto">
          <Link to="/" className="w-full bg-primary-container text-on-primary-container hover:scale-105 transition-transform duration-200 rounded-full py-3 font-label-bold text-label-bold flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">storefront</span>
            View Store
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-4 md:p-margin-desktop overflow-y-auto space-y-gutter min-w-0">
        <div className="flex justify-between items-end mb-6 flex-wrap gap-4">
          <div>
            <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary m-0">Overview</h1>
            <p className="text-on-surface-variant font-body-md text-body-md mt-1">
              Welcome back, let's see how NovaCart is doing today.
            </p>
          </div>
          <div className="bg-surface-container-low rounded-full p-1 flex">
            {['Today', 'Week', 'Month'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t.toLowerCase())}
                className={`px-4 py-1.5 rounded-full font-label-bold text-label-bold transition-colors ${
                  tab === t.toLowerCase() ? 'bg-surface shadow-sm text-primary' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <KpiCard
            label="Total Sales"
            value={`$${stats?.totalSales?.toFixed(2) || '0.00'}`}
            icon="payments"
            iconBg="bg-primary-container/20 text-primary"
            trend="12.5%"
            trendUp
            chartType="line"
          />
          <KpiCard
            label="Total Orders"
            value={stats?.totalOrders || 0}
            icon="shopping_bag"
            iconBg="bg-secondary-container/30 text-secondary"
            trend="8.3%"
            trendUp
            chartType="line"
          />
          <KpiCard
            label="Total Customers"
            value={stats?.totalUsers || 0}
            icon="group"
            iconBg="bg-secondary-container/30 text-secondary"
            trend="4.2%"
            trendUp
            chartType="line"
          />
        </section>

        {/* Order Pipeline */}
        <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient-surface border border-surface-variant">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline-md text-headline-md text-on-surface">Order Pipeline</h2>
            <span className="text-primary font-label-bold text-label-bold hover:underline flex items-center gap-1 cursor-pointer">
              View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </span>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative">
            <div className="hidden md:block absolute top-1/2 left-10 right-10 h-1 bg-surface-container-high -z-10 -translate-y-1/2"></div>
            {pipeline.map((stage) => (
              <div className="flex flex-col items-center gap-2 bg-surface-container-lowest p-2" key={stage.label}>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center z-10 border-4 border-surface-container-lowest ${
                    stage.active
                      ? 'bg-primary-container text-on-primary-container pulse-tag'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined">{stage.icon}</span>
                </div>
                <p className={`font-label-bold text-label-bold ${stage.active ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {stage.label}
                </p>
                <span className={`text-sm rounded-full px-2 ${stage.active ? 'text-primary bg-primary-container/20 font-bold' : 'text-on-surface-variant bg-surface-container'}`}>
                  {stage.count}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Orders */}
        <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient-surface border border-surface-variant">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-6">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="text-left font-label-bold text-label-bold text-on-surface-variant border-b border-surface-container">
                  <th className="pb-3 pr-4">Order</th>
                  <th className="pb-3 pr-4">Customer</th>
                  <th className="pb-3 pr-4">Total</th>
                  <th className="pb-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.orders?.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-6 text-on-surface-variant text-center">No orders yet</td>
                  </tr>
                )}
                {stats?.orders?.map((order) => (
                  <tr key={order._id} className="border-b border-surface-container hover:bg-surface-container-low transition-colors">
                    <td className="py-3 pr-4 font-label-bold text-label-bold text-on-surface">
                      #{order._id.toString().slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3 pr-4 text-on-surface">{order.user?.name || 'N/A'}</td>
                    <td className="py-3 pr-4 text-on-surface">${order.totalPrice?.toFixed(2)}</td>
                    <td className="py-3 pr-4">
                      <span className={`font-label-bold text-label-bold px-3 py-1 rounded-full text-sm ${
                        order.status === 'Delivered'
                          ? 'bg-secondary-container text-on-secondary-container'
                          : order.status === 'Shipped'
                          ? 'bg-secondary-fixed text-on-secondary-fixed'
                          : 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
