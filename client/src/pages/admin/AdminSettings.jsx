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

const SettingsSkeleton = () => (
  <div className="space-y-4">
    <SkeletonPulse className="h-12 w-full rounded-xl" />
    <div className="space-y-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonPulse className="h-4 w-32" />
          <SkeletonPulse className="h-10 w-full rounded-lg" />
        </div>
      ))}
    </div>
    <SkeletonPulse className="h-10 w-32 rounded-lg" />
  </div>
);

const Toggle = ({ label, checked, onChange, description }) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex-1 mr-4">
      <p className="text-sm font-semibold text-on-surface">{label}</p>
      {description && <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-surface ${
        checked ? 'bg-primary' : 'bg-surface-container-high'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  </div>
);

const Tabs = [
  { id: 'store', label: 'Store', icon: 'store' },
  { id: 'payment', label: 'Payment', icon: 'credit_card' },
  { id: 'shipping', label: 'Shipping', icon: 'local_shipping' },
  { id: 'tax', label: 'Tax', icon: 'receipt' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications' },
  { id: 'security', label: 'Security', icon: 'shield' },
  { id: 'seo', label: 'SEO', icon: 'search' },
];

const AdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('store');

  const [storeName, setStoreName] = useState('');
  const [storeTagline, setStoreTagline] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');

  const [currency, setCurrency] = useState('USD');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [acceptCreditCards, setAcceptCreditCards] = useState(true);
  const [acceptPaypal, setAcceptPaypal] = useState(false);
  const [stripePublicKey, setStripePublicKey] = useState('');

  const [freeShippingThreshold, setFreeShippingThreshold] = useState('');
  const [standardRate, setStandardRate] = useState('');
  const [expressRate, setExpressRate] = useState('');
  const [localDelivery, setLocalDelivery] = useState(false);

  const [enableTax, setEnableTax] = useState(false);
  const [taxRate, setTaxRate] = useState('');
  const [includeInPrice, setIncludeInPrice] = useState(false);

  const [orderConfirmation, setOrderConfirmation] = useState(true);
  const [shippingUpdates, setShippingUpdates] = useState(true);
  const [lowStockAlert, setLowStockAlert] = useState(true);
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [newOrderAlert, setNewOrderAlert] = useState(true);

  const [requireEmailVerification, setRequireEmailVerification] = useState(false);
  const [enable2FA, setEnable2FA] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [maxLoginAttempts, setMaxLoginAttempts] = useState('5');

  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [ogImageUrl, setOgImageUrl] = useState('');

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getSettings();
      const data = res?.settings || res || {};
      setSettings(data);

      setStoreName(data.storeName || data.store_name || '');
      setStoreTagline(data.storeTagline || data.tagline || '');
      setLogoUrl(data.logoUrl || data.logo || '');
      setFaviconUrl(data.faviconUrl || data.favicon || '');
      setContactEmail(data.contactEmail || data.email || '');
      setContactPhone(data.contactPhone || data.phone || '');
      setAddress(data.address || '');

      setCurrency(data.currency || 'USD');
      setCurrencySymbol(data.currencySymbol || data.currency_symbol || '$');
      setAcceptCreditCards(data.acceptCreditCards ?? true);
      setAcceptPaypal(data.acceptPaypal ?? false);
      setStripePublicKey(data.stripePublicKey || data.stripe_public_key || '');

      setFreeShippingThreshold(data.freeShippingThreshold || data.free_shipping_threshold || '');
      setStandardRate(data.standardRate || data.standard_rate || '');
      setExpressRate(data.expressRate || data.express_rate || '');
      setLocalDelivery(data.localDelivery ?? false);

      setEnableTax(data.enableTax ?? false);
      setTaxRate(data.taxRate || data.tax_rate || '');
      setIncludeInPrice(data.includeInPrice ?? false);

      setOrderConfirmation(data.orderConfirmation ?? true);
      setShippingUpdates(data.shippingUpdates ?? true);
      setLowStockAlert(data.lowStockAlert ?? true);
      setLowStockThreshold(data.lowStockThreshold || '10');
      setNewOrderAlert(data.newOrderAlert ?? true);

      setRequireEmailVerification(data.requireEmailVerification ?? false);
      setEnable2FA(data.enable2FA ?? false);
      setSessionTimeout(data.sessionTimeout || '30');
      setMaxLoginAttempts(data.maxLoginAttempts || '5');

      setMetaTitle(data.metaTitle || data.seoTitle || '');
      setMetaDescription(data.metaDescription || data.seoDescription || '');
      setOgImageUrl(data.ogImageUrl || data.og_image || '');
    } catch {
      setToast({ message: 'Failed to load settings', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async (section) => {
    setSaving(true);
    try {
      let payload = {};
      if (section === 'store') {
        payload = { storeName, storeTagline, logoUrl, faviconUrl, contactEmail, contactPhone, address };
      } else if (section === 'payment') {
        payload = { currency, currencySymbol, acceptCreditCards, acceptPaypal, stripePublicKey };
      } else if (section === 'shipping') {
        payload = { freeShippingThreshold, standardRate, expressRate, localDelivery };
      } else if (section === 'tax') {
        payload = { enableTax, taxRate, includeInPrice };
      } else if (section === 'notifications') {
        payload = { orderConfirmation, shippingUpdates, lowStockAlert, lowStockThreshold, newOrderAlert };
      } else if (section === 'security') {
        payload = { requireEmailVerification, enable2FA, sessionTimeout, maxLoginAttempts };
      } else if (section === 'seo') {
        payload = { metaTitle, metaDescription, ogImageUrl };
      }
      await api.updateSettings(section, payload);
      setToast({ message: `${section.charAt(0).toUpperCase() + section.slice(1)} settings saved`, type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Failed to save settings', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full bg-surface-container-low rounded-lg px-3 py-2.5 text-sm text-on-surface border border-surface-container focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all';
  const selectClass = 'w-full bg-surface-container-low rounded-lg px-3 py-2.5 text-sm text-on-surface border border-surface-container focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer';

  const renderStoreTab = () => (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-1.5">Store Name</label>
        <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} className={inputClass} placeholder="NovaCart" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-1.5">Tagline</label>
        <input type="text" value={storeTagline} onChange={(e) => setStoreTagline(e.target.value)} className={inputClass} placeholder="Your one-stop shop" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-1.5">Logo URL</label>
        <input type="url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className={inputClass} placeholder="https://example.com/logo.png" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-1.5">Favicon URL</label>
        <input type="url" value={faviconUrl} onChange={(e) => setFaviconUrl(e.target.value)} className={inputClass} placeholder="https://example.com/favicon.ico" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-1.5">Contact Email</label>
        <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={inputClass} placeholder="support@novacart.com" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-1.5">Phone</label>
        <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className={inputClass} placeholder="+1 (555) 123-4567" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-1.5">Address</label>
        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} placeholder="123 Store St, City, State" />
      </div>
    </div>
  );

  const renderPaymentTab = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1.5">Currency</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={selectClass}>
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="CAD">CAD - Canadian Dollar</option>
            <option value="AUD">AUD - Australian Dollar</option>
            <option value="INR">INR - Indian Rupee</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1.5">Currency Symbol</label>
          <input type="text" value={currencySymbol} onChange={(e) => setCurrencySymbol(e.target.value)} className={inputClass} placeholder="$" />
        </div>
      </div>
      <div className="border-t border-surface-container pt-4">
        <Toggle label="Accept Credit Cards" checked={acceptCreditCards} onChange={setAcceptCreditCards} description="Allow customers to pay with Visa, Mastercard, etc." />
        <Toggle label="Accept PayPal" checked={acceptPaypal} onChange={setAcceptPaypal} description="Allow customers to checkout with PayPal." />
      </div>
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-1.5">Stripe Public Key</label>
        <input type="text" value={stripePublicKey} onChange={(e) => setStripePublicKey(e.target.value)} className={inputClass} placeholder="pk_live_..." />
      </div>
    </div>
  );

  const renderShippingTab = () => (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-1.5">Free Shipping Threshold ($)</label>
        <input type="number" min="0" step="0.01" value={freeShippingThreshold} onChange={(e) => setFreeShippingThreshold(e.target.value)} className={inputClass} placeholder="50.00" />
        <p className="text-xs text-on-surface-variant mt-1">Orders above this amount get free standard shipping.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1.5">Standard Rate ($)</label>
          <input type="number" min="0" step="0.01" value={standardRate} onChange={(e) => setStandardRate(e.target.value)} className={inputClass} placeholder="5.99" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1.5">Express Rate ($)</label>
          <input type="number" min="0" step="0.01" value={expressRate} onChange={(e) => setExpressRate(e.target.value)} className={inputClass} placeholder="12.99" />
        </div>
      </div>
      <div className="border-t border-surface-container pt-4">
        <Toggle label="Enable Local Delivery" checked={localDelivery} onChange={setLocalDelivery} description="Allow local delivery option for nearby addresses." />
      </div>
    </div>
  );

  const renderTaxTab = () => (
    <div className="space-y-5">
      <Toggle label="Enable Tax" checked={enableTax} onChange={setEnableTax} description="Automatically calculate tax on orders." />
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-1.5">Tax Rate (%)</label>
        <input type="number" min="0" step="0.01" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className={inputClass} placeholder="8.25" disabled={!enableTax} />
        <p className="text-xs text-on-surface-variant mt-1">Applied as a percentage to each order.</p>
      </div>
      <div className="border-t border-surface-container pt-4">
        <Toggle label="Include Tax in Price" checked={includeInPrice} onChange={setIncludeInPrice} description="Display product prices with tax included." />
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-5">
      <Toggle label="Order Confirmation" checked={orderConfirmation} onChange={setOrderConfirmation} description="Send email when an order is placed." />
      <Toggle label="Shipping Updates" checked={shippingUpdates} onChange={setShippingUpdates} description="Notify customers about shipping status changes." />
      <Toggle label="Low Stock Alert" checked={lowStockAlert} onChange={setLowStockAlert} description="Get notified when products are low in stock." />
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-1.5">Low Stock Threshold</label>
        <input type="number" min="1" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} className={inputClass} placeholder="10" disabled={!lowStockAlert} />
        <p className="text-xs text-on-surface-variant mt-1">Alert when stock drops below this number.</p>
      </div>
      <Toggle label="New Order Alert" checked={newOrderAlert} onChange={setNewOrderAlert} description="Get notified immediately when a new order arrives." />
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-5">
      <Toggle label="Require Email Verification" checked={requireEmailVerification} onChange={setRequireEmailVerification} description="Users must verify their email before accessing the store." />
      <Toggle label="Enable Two-Factor Authentication" checked={enable2FA} onChange={setEnable2FA} description="Add an extra layer of security to user accounts." />
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-1.5">Session Timeout (minutes)</label>
        <input type="number" min="5" value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)} className={inputClass} placeholder="30" />
        <p className="text-xs text-on-surface-variant mt-1">Users are logged out after this period of inactivity.</p>
      </div>
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-1.5">Max Login Attempts</label>
        <input type="number" min="1" value={maxLoginAttempts} onChange={(e) => setMaxLoginAttempts(e.target.value)} className={inputClass} placeholder="5" />
        <p className="text-xs text-on-surface-variant mt-1">Account locks after this many failed attempts.</p>
      </div>
    </div>
  );

  const renderSeoTab = () => (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-1.5">Meta Title</label>
        <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className={inputClass} placeholder="NovaCart - Your One-Stop Shop" />
        <p className="text-xs text-on-surface-variant mt-1">Recommended: 50-60 characters.</p>
      </div>
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-1.5">Meta Description</label>
        <textarea
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          rows={3}
          className={inputClass}
          placeholder="Shop the best products at NovaCart..."
        />
        <p className="text-xs text-on-surface-variant mt-1">Recommended: 150-160 characters.</p>
      </div>
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-1.5">OG Image URL</label>
        <input type="url" value={ogImageUrl} onChange={(e) => setOgImageUrl(e.target.value)} className={inputClass} placeholder="https://example.com/og-image.png" />
        <p className="text-xs text-on-surface-variant mt-1">Image shown when your site is shared on social media.</p>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'store': return renderStoreTab();
      case 'payment': return renderPaymentTab();
      case 'shipping': return renderShippingTab();
      case 'tax': return renderTaxTab();
      case 'notifications': return renderNotificationsTab();
      case 'security': return renderSecurityTab();
      case 'seo': return renderSeoTab();
      default: return null;
    }
  };

  return (
    <AdminLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary m-0">
              Settings
            </h1>
            <p className="text-on-surface-variant text-sm mt-1">
              Configure your store preferences and integrations.
            </p>
          </div>
          <button
            onClick={fetchSettings}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-on-surface px-3 py-2 rounded-lg hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-lg">refresh</span>
            Reset
          </button>
        </div>

        {loading ? (
          <SettingsSkeleton />
        ) : (
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
            {/* Tab Bar */}
            <div className="border-b border-surface-container overflow-x-auto">
              <div className="flex gap-0 min-w-max">
                {Tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6 max-w-2xl">
              {renderTabContent()}

              {/* Save Button */}
              <div className="border-t border-surface-container mt-6 pt-5">
                <button
                  onClick={() => handleSave(activeTab)}
                  disabled={saving}
                  className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">save</span>
                      Save {Tabs.find((t) => t.id === activeTab)?.label || ''} Settings
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
