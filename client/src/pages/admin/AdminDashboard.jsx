import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { api } from '../../api';

const STATUS_COLORS = {
  Pending: { bg: 'bg-amber-100', text: 'text-amber-800', bar: 'bg-amber-400' },
  Processing: { bg: 'bg-blue-100', text: 'text-blue-800', bar: 'bg-blue-500' },
  Shipped: { bg: 'bg-teal-100', text: 'text-teal-800', bar: 'bg-turquoise-400' },
  Delivered: { bg: 'bg-emerald-100', text: 'text-emerald-800', bar: 'bg-emerald-500' },
};

const ORDER_STATUS_STYLES = {
  Pending: 'bg-amber-100 text-amber-800',
  Processing: 'bg-blue-100 text-blue-800',
  Shipped: 'bg-teal-100 text-teal-800',
  Delivered: 'bg-emerald-100 text-emerald-800',
  Cancelled: 'bg-red-100 text-red-800',
};

const SkeletonPulse = ({ className }) => (
  <div className={`animate-pulse rounded-lg bg-surface-container-high ${className}`} />
);

const StatCardSkeleton = () => (
  <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
    <div className="flex items-start justify-between">
      <div className="space-y-3 flex-1">
        <SkeletonPulse className="h-4 w-24" />
        <SkeletonPulse className="h-8 w-32" />
      </div>
      <SkeletonPulse className="h-10 w-10 rounded-full" />
    </div>
    <SkeletonPulse className="h-3 w-20 mt-4" />
  </div>
);

const TableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4">
        <SkeletonPulse className="h-4 w-20" />
        <SkeletonPulse className="h-4 w-32" />
        <SkeletonPulse className="h-4 w-16" />
        <SkeletonPulse className="h-4 w-20" />
        <SkeletonPulse className="h-6 w-20 rounded-full" />
      </div>
    ))}
  </div>
);

const StatCard = ({ label, value, icon, change, changeUp }) => (
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
    {change !== undefined && change !== null && (
      <div className="mt-3 flex items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
            changeUp
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          <span className="material-symbols-outlined text-[13px]">
            {changeUp ? 'trending_up' : 'trending_down'}
          </span>
          {Math.abs(change)}%
        </span>
        <span className="text-xs text-on-surface-variant">vs last month</span>
      </div>
    )}
  </div>
);

const EmptyState = ({ icon, title, description }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-3">{icon}</span>
    <p className="text-sm font-semibold text-on-surface-variant">{title}</p>
    {description && <p className="text-xs text-on-surface-variant/70 mt-1">{description}</p>}
  </div>
);

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsRes, ordersRes, usersRes, productsRes] = await Promise.allSettled([
          api.getAdminStats(),
          api.getAllOrders({ limit: 10, sort: '-createdAt' }),
          api.getAllUsers(),
          api.getProducts({ limit: 5, sort: '-sold' }),
        ]);

        if (statsRes.status === 'fulfilled') setStats(statsRes.value);
        if (ordersRes.status === 'fulfilled') {
          const orderData = ordersRes.value;
          setOrders(Array.isArray(orderData) ? orderData : orderData.orders || orderData.data || []);
        }
        if (usersRes.status === 'fulfilled') {
          const userData = usersRes.value;
          setCustomers(Array.isArray(userData) ? userData : userData.users || userData.data || []);
        }
        if (productsRes.status === 'fulfilled') {
          const productData = productsRes.value;
          setProducts(Array.isArray(productData) ? productData : productData.products || productData.data || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const monthlySales = stats?.monthlySales || [];
  const statusCounts = stats?.statusCounts || {};
  const totalStatusOrders =
    (statusCounts.Pending || 0) +
    (statusCounts.Processing || 0) +
    (statusCounts.Shipped || 0) +
    (statusCounts.Delivered || 0);

  const recentOrders = orders.slice(0, 10);
  const recentCustomers = customers
    .filter((u) => u.role !== 'admin')
    .slice(0, 5);

  const lowStockProducts = products
    .filter((p) => p.countInStock <= 5 && p.countInStock >= 0)
    .slice(0, 5);

  const bestSellers = products.slice(0, 5);

  const maxSales = monthlySales.length > 0
    ? Math.max(...monthlySales.map((m) => m.total || m.sales || 0), 1)
    : 1;

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="space-y-2">
            <SkeletonPulse className="h-8 w-48" />
            <SkeletonPulse className="h-4 w-72" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-5 shadow-sm">
              <SkeletonPulse className="h-6 w-40 mb-4" />
              <SkeletonPulse className="h-48 w-full" />
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
              <SkeletonPulse className="h-6 w-40 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonPulse key={i} className="h-4 w-full" />
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-5 shadow-sm">
              <SkeletonPulse className="h-6 w-40 mb-4" />
              <TableSkeleton rows={5} />
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
              <SkeletonPulse className="h-6 w-40 mb-4" />
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <SkeletonPulse className="h-9 w-9 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <SkeletonPulse className="h-3 w-28" />
                      <SkeletonPulse className="h-3 w-36" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {error && (
          <div className="bg-error-container/30 border border-error/30 text-on-error-container rounded-xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined">error</span>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Header */}
        <div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary m-0">
            Dashboard
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Welcome back — here's what's happening with your store today.
          </p>
        </div>

        {/* Stat Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Sales"
            value={`$${(stats?.totalSales || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon="payments"
            change={stats?.revenue?.percentageChange}
            changeUp={(stats?.revenue?.percentageChange || 0) >= 0}
          />
          <StatCard
            label="Total Orders"
            value={(stats?.totalOrders || 0).toLocaleString()}
            icon="shopping_cart"
            change={stats?.orders?.percentageChange}
            changeUp={(stats?.orders?.percentageChange || 0) >= 0}
          />
          <StatCard
            label="Total Customers"
            value={(stats?.totalCustomers || 0).toLocaleString()}
            icon="people"
          />
          <StatCard
            label="Total Products"
            value={(stats?.totalProducts || products.length || 0).toLocaleString()}
            icon="inventory_2"
          />
        </section>

        {/* Charts Row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue Bar Chart */}
          <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-headline-md text-headline-md text-on-surface">Revenue Overview</h2>
              <span className="text-xs text-on-surface-variant font-medium">Last 6 months</span>
            </div>
            {monthlySales.length > 0 ? (
              <div className="flex items-end justify-between gap-2 h-48 px-2">
                {monthlySales.slice(-6).map((month, i) => {
                  const value = month.total || month.sales || 0;
                  const height = Math.max((value / maxSales) * 100, 4);
                  const monthNum = month._id?.month || month.month;
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  const label = monthNum ? monthNames[monthNum - 1] : month.label || month.name || `M${i + 1}`;
                  return (
                    <div key={i} className="flex flex-col items-center gap-2 flex-1 min-w-0 group">
                      <span className="text-[10px] font-bold text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                        ${value.toLocaleString()}
                      </span>
                      <div className="w-full relative rounded-t-md overflow-hidden" style={{ height: `${height}%` }}>
                        <div className="absolute inset-0 bg-primary/80 rounded-t-md transition-all duration-500 group-hover:bg-primary" />
                      </div>
                      <span className="text-[11px] text-on-surface-variant font-medium truncate w-full text-center">
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState icon="bar_chart" title="No sales data yet" description="Revenue data will appear here once orders come in." />
            )}
          </div>

          {/* Orders by Status */}
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-5">Orders by Status</h2>
            {totalStatusOrders > 0 ? (
              <div className="space-y-4">
                {['Pending', 'Processing', 'Shipped', 'Delivered'].map((status) => {
                  const count = statusCounts[status] || 0;
                  const pct = totalStatusOrders > 0 ? Math.round((count / totalStatusOrders) * 100) : 0;
                  const colors = STATUS_COLORS[status];
                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-on-surface">{status}</span>
                        <span className="text-sm font-bold text-on-surface-variant">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState icon="donut_large" title="No orders yet" description="Order status breakdown will appear here." />
            )}
          </div>
        </section>

        {/* Recent Orders + Recent Customers */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Orders Table */}
          <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline-md text-headline-md text-on-surface">Recent Orders</h2>
              <Link
                to="/admin/orders"
                className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
              >
                View All
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
            {recentOrders.length > 0 ? (
              <div className="overflow-x-auto -mx-5 px-5">
                <table className="w-full min-w-[560px]">
                  <thead>
                    <tr className="text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider border-b border-surface-container">
                      <th className="pb-3 pr-4">Order ID</th>
                      <th className="pb-3 pr-4">Customer</th>
                      <th className="pb-3 pr-4">Date</th>
                      <th className="pb-3 pr-4">Total</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => {
                      const orderId = order._id || order.id || '';
                      const shortId = orderId.toString().slice(-6).toUpperCase();
                      const status = order.status || 'Pending';
                      return (
                        <tr
                          key={orderId}
                          className="border-b border-surface-container last:border-0 hover:bg-surface-container-low/50 transition-colors"
                        >
                          <td className="py-3 pr-4 text-sm font-bold text-primary">#{shortId}</td>
                          <td className="py-3 pr-4 text-sm text-on-surface">
                            {order.user?.name || order.customerName || 'N/A'}
                          </td>
                          <td className="py-3 pr-4 text-sm text-on-surface-variant">{formatDate(order.createdAt)}</td>
                          <td className="py-3 pr-4 text-sm font-semibold text-on-surface">
                            ${(order.totalPrice || order.total || 0).toFixed(2)}
                          </td>
                          <td className="py-3">
                            <span
                              className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${
                                ORDER_STATUS_STYLES[status] || 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState icon="receipt_long" title="No orders yet" description="Orders will appear here as customers start purchasing." />
            )}
          </div>

          {/* Recent Customers */}
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline-md text-headline-md text-on-surface">Recent Customers</h2>
              <Link
                to="/admin/customers"
                className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
              >
                View All
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
            {recentCustomers.length > 0 ? (
              <div className="space-y-1">
                {recentCustomers.map((customer) => (
                  <div
                    key={customer._id || customer.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container-low transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-sm font-bold shrink-0">
                      {getInitials(customer.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-on-surface truncate">{customer.name}</p>
                      <p className="text-xs text-on-surface-variant truncate">{customer.email}</p>
                    </div>
                    <span className="text-[11px] text-on-surface-variant shrink-0">
                      {formatDate(customer.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon="group" title="No customers yet" description="Customer list will populate as users register." />
            )}
          </div>
        </section>

        {/* Low Stock + Best Sellers */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Low Stock Alerts */}
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  warning
                </span>
                Low Stock Alerts
              </h2>
              <Link
                to="/admin/inventory"
                className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
              >
                View All
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
            {lowStockProducts.length > 0 ? (
              <div className="space-y-2">
                {lowStockProducts.map((product) => {
                  const stock = product.countInStock ?? 0;
                  const isUrgent = stock === 0;
                  return (
                    <div
                      key={product._id || product.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        isUrgent
                          ? 'bg-red-50 border-red-200'
                          : 'bg-amber-50 border-amber-200'
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[20px] shrink-0 ${
                          isUrgent ? 'text-red-500' : 'text-amber-500'
                        }`}
                      >
                        {isUrgent ? 'error' : 'warning'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-on-surface truncate">{product.name}</p>
                        <p className={`text-xs font-bold ${isUrgent ? 'text-red-600' : 'text-amber-600'}`}>
                          {stock === 0 ? 'Out of stock' : `${stock} left in stock`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState icon="check_circle" title="All stocked up" description="No products are running low on inventory." />
            )}
          </div>

          {/* Best Sellers */}
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline-md text-headline-md text-on-surface">Best Sellers</h2>
              <Link
                to="/admin/items"
                className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
              >
                View All
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
            {bestSellers.length > 0 ? (
              <div className="space-y-3">
                {bestSellers.map((product, idx) => (
                  <div
                    key={product._id || product.id}
                    className="flex items-center gap-3"
                  >
                    <span className="text-xs font-bold text-on-surface-variant w-5 text-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="w-10 h-10 rounded-lg bg-surface-container overflow-hidden shrink-0">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-on-surface-variant/40 text-lg">
                            image
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-on-surface truncate">{product.name}</p>
                      <p className="text-xs text-on-surface-variant">
                        {(product.sold || 0).toLocaleString()} units sold
                      </p>
                    </div>
                    <span className="text-sm font-bold text-on-surface shrink-0">
                      ${(product.price || 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon="trending_up" title="No sales data" description="Best-selling products will appear here." />
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
