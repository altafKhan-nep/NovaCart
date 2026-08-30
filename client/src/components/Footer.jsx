import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-surface-container-highest border-t border-surface-container mt-12">
      <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary-container text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                  local_mall
                </span>
              </span>
              <span className="font-headline-md text-headline-md font-bold text-primary">NovaCart</span>
            </Link>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Designed for Joy. Curated products that bring delight to your everyday life.
            </p>
            <div className="flex items-center gap-2 mt-4">
              {['Instagram', 'Twitter', 'Facebook'].map((social) => (
                <span
                  key={social}
                  className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-primary-container hover:text-on-primary-container transition-colors cursor-pointer"
                  aria-label={social}
                >
                  <span className="material-symbols-outlined text-lg">
                    {social === 'Instagram' ? 'photo_camera' : social === 'Twitter' ? 'chat' : 'group'}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-on-surface mb-3 uppercase tracking-wider">Shop</h3>
            <ul className="space-y-2">
              {[
                { label: 'All Products', to: '/shop' },
                { label: 'Electronics', to: '/shop/Electronics' },
                { label: 'Fashion', to: '/shop/Fashion' },
                { label: 'Home Decor', to: '/shop/Home%20Decor' },
                { label: 'Toys', to: '/shop/Toys' },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-on-surface-variant hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-sm font-bold text-on-surface mb-3 uppercase tracking-wider">Help</h3>
            <ul className="space-y-2">
              {['Customer Service', 'Shipping & Returns', 'FAQ', 'Size Guide'].map((item) => (
                <li key={item}>
                  <span className="text-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-bold text-on-surface mb-3 uppercase tracking-wider">Stay Updated</h3>
            <p className="text-sm text-on-surface-variant mb-3">Get the latest deals and new arrivals.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-surface-container-low text-sm rounded-lg px-3 py-2 border border-surface-container outline-none focus:border-primary-container transition-colors"
              />
              <button className="bg-primary text-on-primary text-sm font-semibold px-3 py-2 rounded-lg hover:bg-primary-container transition-colors">
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-surface-container mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-on-surface-variant">
            &copy; {new Date().getFullYear()} NovaCart. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-on-surface-variant">
            <span className="hover:text-primary cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Sustainability</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
