import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { api } from '../../api';

const POSITIONS = ['hero', 'promo', 'footer', 'sidebar'];

const INITIAL_FORM = {
  title: '',
  subtitle: '',
  description: '',
  image: '',
  link: '',
  ctaText: '',
  position: 'hero',
  bgColor: '',
  startDate: '',
  endDate: '',
  isActive: true,
};

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg animate-fade-up ${
        type === 'success'
          ? 'bg-emerald-600 text-white'
          : 'bg-red-600 text-white'
      }`}
    >
      <span className="material-symbols-outlined text-lg">
        {type === 'success' ? 'check_circle' : 'error'}
      </span>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">
        <span className="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
  );
};

const ConfirmDialog = ({ open, title, message, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 animate-fade-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-error-container/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-error">
              warning
            </span>
          </div>
          <h3 className="text-lg font-bold text-on-surface">{title}</h3>
        </div>
        <p className="text-sm text-on-surface-variant mb-6">{message}</p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-error text-white hover:bg-error/90 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const BannerFormModal = ({ open, banner, onSave, onClose }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (banner) {
      setForm({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        description: banner.description || '',
        image: banner.image || '',
        link: banner.link || '',
        ctaText: banner.ctaText || '',
        position: banner.position || 'hero',
        bgColor: banner.bgColor || '',
        startDate: banner.startDate
          ? new Date(banner.startDate).toISOString().slice(0, 10)
          : '',
        endDate: banner.endDate
          ? new Date(banner.endDate).toISOString().slice(0, 10)
          : '',
        isActive: banner.isActive !== false,
      });
    } else {
      setForm(INITIAL_FORM);
    }
    setErrors({});
  }, [banner, open]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.image.trim()) e.image = 'Image URL is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (field) =>
    `w-full bg-surface-container-low rounded-lg px-3 py-2.5 text-sm text-on-surface border ${
      errors[field]
        ? 'border-error focus:border-error'
        : 'border-surface-container focus:border-primary'
    } focus:ring-2 focus:ring-primary/20 outline-none transition-all`;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl bg-surface-container-lowest shadow-2xl overflow-y-auto animate-slide-in-right">
        <div className="sticky top-0 bg-surface-container-lowest border-b border-surface-container/60 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-on-surface">
            {banner ? 'Edit Banner' : 'Add Banner'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">
              Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className={inputClass('title')}
              placeholder="e.g. Summer Sale"
            />
            {errors.title && (
              <p className="text-xs text-error mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">
              Subtitle
            </label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => handleChange('subtitle', e.target.value)}
              className={inputClass('subtitle')}
              placeholder="e.g. Up to 50% off"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className={inputClass('description')}
              placeholder="Banner description..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">
              Image URL *
            </label>
            <input
              type="url"
              value={form.image}
              onChange={(e) => handleChange('image', e.target.value)}
              className={inputClass('image')}
              placeholder="https://example.com/banner.jpg"
            />
            {errors.image && (
              <p className="text-xs text-error mt-1">{errors.image}</p>
            )}
            {form.image && (
              <div className="mt-2 w-full h-32 rounded-lg bg-surface-container overflow-hidden border border-surface-container/60">
                <img
                  src={form.image}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">
                Link URL
              </label>
              <input
                type="url"
                value={form.link}
                onChange={(e) => handleChange('link', e.target.value)}
                className={inputClass('link')}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">
                CTA Text
              </label>
              <input
                type="text"
                value={form.ctaText}
                onChange={(e) => handleChange('ctaText', e.target.value)}
                className={inputClass('ctaText')}
                placeholder="Shop Now"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">
                Position
              </label>
              <select
                value={form.position}
                onChange={(e) => handleChange('position', e.target.value)}
                className={inputClass('position')}
              >
                {POSITIONS.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos.charAt(0).toUpperCase() + pos.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">
                Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.bgColor || '#ffffff'}
                  onChange={(e) => handleChange('bgColor', e.target.value)}
                  className="w-10 h-[42px] rounded-lg border border-surface-container cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={form.bgColor}
                  onChange={(e) => handleChange('bgColor', e.target.value)}
                  className={inputClass('bgColor')}
                  placeholder="#ffffff"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className={inputClass('startDate')}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">
                End Date
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                className={inputClass('endDate')}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-container-high rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
            </label>
            <span className="text-sm font-semibold text-on-surface">
              {form.isActive ? 'Visible' : 'Hidden'}
            </span>
          </div>

          <div className="border-t border-surface-container/60 pt-5 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2.5 text-sm font-semibold rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving
                ? 'Saving...'
                : banner
                ? 'Update Banner'
                : 'Create Banner'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="p-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-surface-container/60">
            <div className="aspect-video bg-surface-container-high" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-surface-container-high rounded w-3/4" />
              <div className="h-3 bg-surface-container-high rounded w-1/2" />
              <div className="flex items-center justify-between pt-3 border-t border-surface-container/60">
                <div className="h-3 bg-surface-container-high rounded w-1/3" />
                <div className="flex gap-1">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high" />
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high" />
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const EmptyState = ({ onAdd }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4">
      view_carousel
    </span>
    <p className="text-base font-semibold text-on-surface-variant">
      No banners found
    </p>
    <p className="text-sm text-on-surface-variant/70 mt-1 mb-4">
      You haven't added any banners yet. Create your first banner to showcase
      promotions.
    </p>
    <button
      onClick={onAdd}
      className="inline-flex items-center gap-1.5 btn-primary text-on-primary-container text-sm font-semibold px-4 py-2.5 rounded-lg transition-all"
    >
      <span className="material-symbols-outlined text-lg">add</span>
      Add your first banner
    </button>
  </div>
);

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [filterPosition, setFilterPosition] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getBanners();
      const data = Array.isArray(res) ? res : res.banners || res.data || [];
      setBanners(data);
    } catch (err) {
      setError(err.message || 'Failed to load banners');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const showToast = (message, type = 'success') =>
    setToast({ message, type });

  const filtered = banners.filter((b) => {
    if (search && !b.title?.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (filterPosition && b.position !== filterPosition) return false;
    return true;
  });

  const handleSave = async (payload) => {
    try {
      if (editingBanner) {
        await api.updateBanner(
          editingBanner._id || editingBanner.id,
          payload
        );
        showToast('Banner updated successfully');
      } else {
        await api.createBanner(payload);
        showToast('Banner created successfully');
      }
      setFormOpen(false);
      setEditingBanner(null);
      fetchBanners();
    } catch (err) {
      showToast(err.message || 'Failed to save banner', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteBanner(deleteTarget);
      showToast('Banner deleted');
      setDeleteTarget(null);
      fetchBanners();
    } catch {
      showToast('Failed to delete banner', 'error');
    }
  };

  const handleToggle = async (banner) => {
    try {
      await api.updateBanner(banner._id || banner.id, {
        isActive: !banner.isActive,
      });
      setBanners((prev) =>
        prev.map((b) =>
          (b._id || b.id) === (banner._id || banner.id)
            ? { ...b, isActive: !b.isActive }
            : b
        )
      );
      showToast(banner.isActive ? 'Banner disabled' : 'Banner enabled');
    } catch {
      showToast('Failed to toggle banner', 'error');
    }
  };

  const handleMove = async (bannerId, direction) => {
    const samePosition = filtered.filter(
      (b) =>
        (b.position || 'hero') ===
        (banners.find((x) => (x._id || x.id) === bannerId)?.position ||
          'hero')
    );
    const idx = samePosition.findIndex(
      (b) => (b._id || b.id) === bannerId
    );
    if (idx === -1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= samePosition.length) return;
    const items = samePosition.map((b) => ({
      id: b._id || b.id,
      order: b.order || 0,
    }));
    const temp = items[idx].order;
    items[idx].order = items[swapIdx].order;
    items[swapIdx].order = temp;
    try {
      await api.reorderBanners(items);
      fetchBanners();
    } catch {
      showToast('Failed to reorder', 'error');
    }
  };

  const getBannerStatus = (banner) => {
    if (!banner.isActive) return 'disabled';
    const now = new Date();
    if (banner.startDate && new Date(banner.startDate) > now)
      return 'scheduled';
    if (banner.endDate && new Date(banner.endDate) < now) return 'expired';
    return 'active';
  };

  const STATUS_STYLES = {
    active: 'bg-emerald-100 text-emerald-800',
    disabled: 'bg-gray-100 text-gray-700',
    scheduled: 'bg-blue-100 text-blue-800',
    expired: 'bg-amber-100 text-amber-800',
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const positionTabs = [
    { key: '', label: 'All', icon: 'view_carousel' },
    ...POSITIONS.map((pos) => ({
      key: pos,
      label: pos.charAt(0).toUpperCase() + pos.slice(1),
      icon:
        pos === 'hero'
          ? 'star'
          : pos === 'promo'
          ? 'local_offer'
          : pos === 'footer'
          ? 'web_asset'
          : 'side_panel',
    })),
  ];

  return (
    <AdminLayout>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Banner"
        message="Are you sure you want to delete this banner? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <BannerFormModal
        open={formOpen}
        banner={editingBanner}
        onSave={handleSave}
        onClose={() => {
          setFormOpen(false);
          setEditingBanner(null);
        }}
      />

      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary m-0">
              Banners
            </h1>
            <p className="text-on-surface-variant text-sm mt-1">
              Manage promotional banners and hero images.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingBanner(null);
              setFormOpen(true);
            }}
            className="inline-flex items-center gap-1.5 btn-primary text-on-primary-container text-sm font-semibold px-4 py-2.5 rounded-lg transition-all"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Add Banner
          </button>
        </div>

        {error && (
          <div className="bg-error-container/30 border border-error/30 text-on-error-container rounded-xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined">error</span>
            <span className="text-sm font-medium flex-1">{error}</span>
            <button
              onClick={fetchBanners}
              className="text-sm font-semibold hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        <div className="bg-surface-container-lowest rounded-xl shadow-sm">
          <div className="p-4 border-b border-surface-container/60">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex-1 relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none">
                  search
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search banners..."
                  className="w-full bg-surface-container-low rounded-lg py-2 pl-10 pr-4 text-sm text-on-surface border border-transparent focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          <div className="px-4 pt-3">
            <div className="flex items-center gap-1 p-1 bg-surface-container-low rounded-xl overflow-x-auto">
              {positionTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilterPosition(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                    filterPosition === tab.key
                      ? 'bg-primary-container text-on-primary-container shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-lg"
                    style={{
                      fontVariationSettings:
                        filterPosition === tab.key
                          ? "'FILL' 1"
                          : "'FILL' 0",
                    }}
                  >
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : filtered.length === 0 ? (
            <EmptyState
              onAdd={() => {
                setEditingBanner(null);
                setFormOpen(true);
              }}
            />
          ) : (
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((banner) => {
                  const id = banner._id || banner.id;
                  const status = getBannerStatus(banner);
                  return (
                    <div
                      key={id}
                      className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-surface-container/60 hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-video bg-surface-container overflow-hidden relative">
                        {banner.image ? (
                          <img
                            src={banner.image}
                            alt={banner.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-on-surface-variant/30 text-4xl">
                              image
                            </span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${STATUS_STYLES[status]}`}
                          >
                            {status}
                          </span>
                        </div>

                        <div className="absolute top-2 right-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface/80 text-on-surface capitalize backdrop-blur-sm">
                            {banner.position || 'hero'}
                          </span>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <h3 className="text-sm font-bold text-white truncate drop-shadow-md">
                            {banner.title}
                          </h3>
                          {banner.subtitle && (
                            <p className="text-xs text-white/80 truncate drop-shadow-md mt-0.5">
                              {banner.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-[11px] text-on-surface-variant space-y-0.5">
                            {banner.startDate && (
                              <p>
                                Start: {formatDate(banner.startDate)}
                              </p>
                            )}
                            {banner.endDate && (
                              <p>
                                End: {formatDate(banner.endDate)}
                              </p>
                            )}
                            {!banner.startDate && !banner.endDate && (
                              <p>No date range set</p>
                            )}
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                              type="checkbox"
                              checked={banner.isActive !== false}
                              onChange={() => handleToggle(banner)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-surface-container-high rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                          </label>
                        </div>

                        {banner.link && (
                          <p className="text-[11px] text-primary truncate">
                            {banner.link}
                          </p>
                        )}

                        <div className="flex items-center justify-end gap-1 pt-2 border-t border-surface-container/60">
                          <button
                            onClick={() => handleMove(id, 'up')}
                            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
                            title="Move up"
                          >
                            <span className="material-symbols-outlined text-lg">
                              keyboard_arrow_up
                            </span>
                          </button>
                          <button
                            onClick={() => handleMove(id, 'down')}
                            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
                            title="Move down"
                          >
                            <span className="material-symbols-outlined text-lg">
                              keyboard_arrow_down
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              setEditingBanner(banner);
                              setFormOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-primary-container/30 hover:text-primary transition-colors"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-lg">
                              edit
                            </span>
                          </button>
                          <button
                            onClick={() => setDeleteTarget(id)}
                            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container/30 hover:text-error transition-colors"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-lg">
                              delete
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBanners;
