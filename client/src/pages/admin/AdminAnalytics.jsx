import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { api } from '../../api';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg animate-fade-up ${
        type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
      }`}
    >
      <span className="material-symbols-outlined text-lg">
        {type === 'success' ? 'check_circle' : 'error'}
      </span>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-1 hover:opacity-70 transition-opacity">
        <span className="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
  );
};

const SkeletonPulse = ({ className }) => (
  <div className={`animate-pulse rounded-lg bg-surface-container-high ${className}`} />
);

const CARD_SKELETON = () => (
  <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
    <SkeletonPulse className="h-4 w-28 mb-3" />
    <SkeletonPulse className="h-8 w-20" />
    <SkeletonPulse className="h-3 w-24 mt-2" />
  </div>
);

const ChartSkeleton = ({ height = 'h-48' }) => (
  <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
    <SkeletonPulse className="h-6 w-40 mb-4" />
    <SkeletonPulse className={`${height} w-full`} />
  </div>
);

const STATUS_COLORS = {
  Pending: 'bg-amber-400',
  Processing: 'bg-blue-500',
  Shipped: 'bg-teal-400',
  Delivered: 'bg-emerald-500',
  Cancelled: 'bg-red-400',
};

const ORDER_STATUS_STYLES = {
  Pending: 'bg-amber-100 text-amber-800',
  Processing: 'bg-blue-100 text-blue-800',
  Shipped: 'bg-teal-100 text-teal-800',
  Delivered: 'bg-emerald-100 text-emerald-800',
  Cancelled: 'bg-red-100 text-red-800',
};

const CATEGORY_BAR_COLORS = [
  'bg-primary',
  'bg-secondary',
  'bg-tertiary',
  'bg-amber-500',
  'bg-emerald-500',
];

const DATE_RANGES = [
  { label: 'This Month', value: 'this-month' },
  { label: 'Last 3 Months', value: 'last-3-months' },
  { label: 'Last 6 Months', value: 'last-6-months' },
  { label: 'This Year', value: 'this-year' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatCurrency = (val) => {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
  return `$${val.toFixed(2)}`;
};

const BarChart = ({ data, label, valueKey, labelKey, colorClass = 'bg-primary', height = 200 }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider mb-4">{label}</h3>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-3">bar_chart</span>
          <p className="text-sm font-semibold text-on-surface-variant">No data available</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d[valueKey] || 0), 1);

  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider mb-4">{label}</h3>
      <div className="flex items-end justify-between gap-1.5" style={{ height }}>
        {data.map((item, i) => {
          const value = item[valueKey] || 0;
          const barHeight = Math.max((value / maxValue) * 100, 3);
          const lbl = item[labelKey] || `M${i + 1}`;
          return (
            <div
              key={i}
              className="flex flex-col items-center gap-1.5 flex-1 min-w-0 group relative"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip */}
              {hoveredIdx === i && (
                <div className="absolute -top-10 z-10 bg-on-surface text-surface text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-md whitespace-nowrap pointer-events-none animate-fade-up">
                  <span>{lbl}: {typeof value === 'number' && value > 999 ? formatCurrency(value) : value}</span>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-on-surface rotate-45 -mt-1" />
                </div>
              )}
              <div
                className={`w-full rounded-t-md transition-all duration-300 ${colorClass} ${
                  hoveredIdx === i ? 'opacity-100' : 'opacity-80'
                }`}
                style={{ height: `${barHeight}%` }}
              />
              <span className="text-[10px] text-on-surface-variant font-medium truncate w-full text-center">
                {lbl}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DonutChart = ({ statusCounts }) => {
  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  if (total === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider mb-4">Orders by Status</h3>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-3">donut_large</span>
          <p className="text-sm font-semibold text-on-surface-variant">No orders yet</p>
        </div>
      </div>
    );
  }

  const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  let cumulativePercent = 0;
  const segments = statuses.map((status) => {
    const count = statusCounts[status] || 0;
    const percent = total > 0 ? (count / total) * 100 : 0;
    const start = cumulativePercent;
    cumulativePercent += percent;
    return { status, count, percent, start, color: STATUS_COLORS[status] || 'bg-gray-400' };
  });

  const gradientParts = [];
  let offset = 0;
  segments.forEach((seg) => {
    if (seg.percent > 0) {
      gradientParts.push(`${seg.color.replace('bg-', '').replace('500', '500').replace('400', '400')} ${offset}% ${offset + seg.percent}%`);
      offset += seg.percent;
    }
  });

  const conicGradient = `conic-gradient(${gradientParts.join(', ') || 'transparent'})`;

  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider mb-4">Orders by Status</h3>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative shrink-0">
          <div
            className="w-36 h-36 rounded-full"
            style={{ background: conicGradient }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-surface-container-lowest flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-on-surface">{total}</span>
              <span className="text-[9px] text-on-surface-variant font-semibold uppercase">Orders</span>
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-2.5 w-full">
          {statuses.map((status) => {
            const count = statusCounts[status] || 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={status} className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full shrink-0 ${STATUS_COLORS[status]}`} />
                <span className="text-sm text-on-surface flex-1">{status}</span>
                <span className="text-sm font-bold text-on-surface-variant">{count}</span>
                <span className="text-xs text-on-surface-variant w-10 text-right">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, icon, subtext }) => (
  <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm card-lift">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-on-surface-variant font-medium">{label}</p>
        <p className="text-2xl font-bold text-primary mt-1">{value}</p>
      </div>
      <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-on-primary-container">{icon}</span>
      </div>
    </div>
    {subtext && (
      <p className="text-xs text-on-surface-variant mt-3">{subtext}</p>
    )}
  </div>
);

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [dateRange, setDateRange] = useState('last-6-months');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [analyticsRes, statsRes] = await Promise.allSettled([
        api.getAnalytics(),
        api.getAdminStats(),
      ]);
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
    } catch {
      setToast({ message: 'Failed to load analytics data', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const monthlyRevenue = analytics?.revenueByMonth || stats?.monthlySales || [];
  const orderStatusRaw = analytics?.ordersByStatus || stats?.statusCounts || {};
  const orderStatusCounts = Array.isArray(orderStatusRaw)
    ? orderStatusRaw.reduce((acc, item) => { acc[item._id || item.status] = item.count; return acc; }, {})
    : orderStatusRaw;
  const topCategories = analytics?.topCategories || [];
  const topProducts = analytics?.topProducts || [];
  const monthlyUsers = analytics?.customerGrowth || [];

  const filteredRevenue = monthlyRevenue.filter((m) => {
    const date = m.date || m.month;
    if (!date || dateRange === 'this-year') return true;
    const d = new Date(date);
    const now = new Date();
    if (dateRange === 'this-month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (dateRange === 'last-3-months') {
      const threeMonthsAgo = new Date(now);
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return d >= threeMonthsAgo;
    }
    if (dateRange === 'last-6-months') {
      const sixMonthsAgo = new Date(now);
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return d >= sixMonthsAgo;
    }
    return true;
  });

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const chartRevenueData = filteredRevenue.map(m => ({
    ...m,
    total: m.revenue || m.total || m.sales || 0,
    month: m._id?.month ? monthNames[m._id.month - 1] : m.month || m.label || m.name,
  }));

  const chartCustomerData = monthlyUsers.map(u => ({
    ...u,
    count: u.count || 0,
    month: u._id?.month ? monthNames[u._id.month - 1] : u.month || u.label || u.name,
  }));

  const totalRevenue = filteredRevenue.reduce((sum, m) => sum + (m.revenue || m.total || m.sales || 0), 0);
  const avgOrderValue = stats?.totalOrders > 0 ? totalRevenue / stats.totalOrders : 0;
  const conversionRate = stats?.conversionRate || 0;
  const repeatRate = stats?.repeatCustomerRate || 0;

  const topCategoriesMaxRevenue = topCategories.length > 0
    ? Math.max(...topCategories.map((c) => c.revenue || c.totalSales || 0), 1)
    : 1;

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="space-y-2">
            <SkeletonPulse className="h-8 w-48" />
            <SkeletonPulse className="h-4 w-72" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <CARD_SKELETON key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartSkeleton height="h-52" />
            <ChartSkeleton height="h-52" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartSkeleton height="h-40" />
            <ChartSkeleton height="h-40" />
          </div>
          <ChartSkeleton height="h-48" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary m-0">
              Analytics
            </h1>
            <p className="text-on-surface-variant text-sm mt-1">
              Track your store performance and growth metrics.
            </p>
          </div>
          <div className="flex gap-1 bg-surface-container-low rounded-lg p-1">
            {DATE_RANGES.map((range) => (
              <button
                key={range.value}
                onClick={() => setDateRange(range.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  dateRange === range.value
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            label="Total Revenue"
            value={formatCurrency(totalRevenue)}
            icon="payments"
            subtext="Filtered period"
          />
          <MetricCard
            label="Total Orders"
            value={(stats?.totalOrders || 0).toLocaleString()}
            icon="shopping_cart"
            subtext="All time"
          />
          <MetricCard
            label="Avg. Order Value"
            value={formatCurrency(avgOrderValue)}
            icon="receipt_long"
            subtext="Revenue / orders"
          />
          <MetricCard
            label="Conversion Rate"
            value={`${(conversionRate || 0).toFixed(1)}%`}
            icon="trending_up"
            subtext={`${(repeatRate || 0).toFixed(1)}% repeat rate`}
          />
        </div>

        {/* Charts Row 1: Revenue + Orders by Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BarChart
            data={chartRevenueData}
            label="Monthly Revenue"
            valueKey="total"
            labelKey="month"
            colorClass="bg-primary"
            height={220}
          />
          <DonutChart statusCounts={orderStatusCounts} />
        </div>

        {/* Charts Row 2: Top Categories + Customer Growth */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Categories Horizontal Bar */}
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider mb-4">Top Categories by Revenue</h3>
            {topCategories.length > 0 ? (
              <div className="space-y-3">
                {topCategories.slice(0, 5).map((cat, i) => {
                  const revenue = cat.revenue || cat.totalSales || 0;
                  const width = Math.max((revenue / topCategoriesMaxRevenue) * 100, 5);
                  return (
                    <div key={cat._id || cat.id || i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-on-surface truncate max-w-[180px]">
                          {cat.name || cat.category || `Category ${i + 1}`}
                        </span>
                        <span className="text-xs font-bold text-on-surface-variant ml-2">
                          {formatCurrency(revenue)}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${CATEGORY_BAR_COLORS[i % CATEGORY_BAR_COLORS.length]}`}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-3">category</span>
                <p className="text-sm font-semibold text-on-surface-variant">No category data</p>
              </div>
            )}
          </div>

          {/* Customer Growth */}
          <BarChart
            data={chartCustomerData}
            label="New Customers"
            valueKey="count"
            labelKey="month"
            colorClass="bg-secondary"
            height={220}
          />
        </div>

        {/* Top Products Table */}
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider mb-4">Top Products</h3>
          {topProducts.length > 0 ? (
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider border-b border-surface-container">
                    <th className="pb-3 pr-3 w-10">#</th>
                    <th className="pb-3 pr-3 w-12">Image</th>
                    <th className="pb-3 pr-3">Product</th>
                    <th className="pb-3 pr-3 text-right">Units Sold</th>
                    <th className="pb-3 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.slice(0, 10).map((product, i) => (
                    <tr
                      key={product._id || product.id || i}
                      className="border-b border-surface-container last:border-0 hover:bg-surface-container-low/50 transition-colors"
                    >
                      <td className="py-3 pr-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          i < 3 ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container text-on-surface-variant'
                        }`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-container overflow-hidden">
                          {product.images?.[0] || product.image ? (
                            <img src={product.images?.[0] || product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-on-surface-variant/40 text-lg">image</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 pr-3">
                        <p className="text-sm font-semibold text-on-surface truncate max-w-[250px]">{product.name}</p>
                      </td>
                      <td className="py-3 pr-3 text-sm font-medium text-on-surface-variant text-right">
                        {(product.sold || product.unitsSold || 0).toLocaleString()}
                      </td>
                      <td className="py-3 text-sm font-bold text-primary text-right">
                        {formatCurrency(product.revenue || product.totalSales || (product.price || 0) * (product.sold || product.unitsSold || 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-3">trending_up</span>
              <p className="text-sm font-semibold text-on-surface-variant">No product data yet</p>
              <p className="text-xs text-on-surface-variant/70 mt-1">Top products will appear as orders come in.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
