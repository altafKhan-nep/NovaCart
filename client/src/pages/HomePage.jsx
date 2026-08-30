import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import CategorySidebar from '../components/CategorySidebar';
import ProductCard from '../components/ProductCard';

const heroImages = [
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600',
];

const TrustBadge = ({ icon, title, desc }) => (
  <div className="flex items-center gap-3 group">
    <div className="w-10 h-10 rounded-xl bg-primary-container/30 flex items-center justify-center shrink-0 group-hover:bg-primary-container/50 transition-colors">
      <span className="material-symbols-outlined text-primary text-xl">{icon}</span>
    </div>
    <div>
      <p className="text-sm font-semibold text-on-surface">{title}</p>
      <p className="text-xs text-on-surface-variant">{desc}</p>
    </div>
  </div>
);

const CategoryTile = ({ name, icon, bgClass, count, idx, onClick }) => (
  <div
    onClick={onClick}
    className="bg-surface-container-low rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer group hover:bg-surface-container-high hover:shadow-md transition-all duration-300 animate-fade-up border border-transparent hover:border-surface-container"
    style={{ animationDelay: `${0.1 + idx * 0.05}s` }}
  >
    <div className={`w-16 h-16 rounded-2xl ${bgClass} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
      <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
        {icon}
      </span>
    </div>
    <span className="text-sm font-semibold text-on-surface mb-1">{name}</span>
    <span className="text-xs text-on-surface-variant">{count} items</span>
  </div>
);

const FlashDealCard = ({ product }) => {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link to={`/product/${product._id}`} className="block group">
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container/60 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 flex flex-col h-full">
        <div className="relative aspect-[4/3] bg-gradient-to-br from-surface-container-low to-surface-container overflow-hidden flex items-center justify-center p-5">
          <img
            src={product.images?.[0]}
            alt={product.name}
            className="h-full w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-error text-on-error text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
              -{discount}% OFF
            </span>
          )}
          <div className="absolute top-3 right-3">
            <span className="material-symbols-outlined text-error text-xl animate-pulse">bolt</span>
          </div>
        </div>
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-sm font-semibold text-on-surface mb-2 truncate">{product.name}</h3>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-xl font-bold text-primary">${product.price.toFixed(2)}</span>
            {product.originalPrice > product.price && (
              <span className="text-sm text-on-surface-variant line-through">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>
          <button className="w-full bg-gradient-to-r from-secondary-container to-secondary-container/80 text-on-secondary-container font-semibold py-3 rounded-xl text-sm hover:from-secondary hover:to-secondary transition-all mt-auto shadow-sm hover:shadow-md">
            Grab Deal
          </button>
        </div>
      </div>
    </Link>
  );
};

const CountdownTimer = () => {
  const [time, setTime] = useState({ h: 2, m: 14, s: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-1.5">
      {[
        { val: time.h, label: 'H' },
        { val: time.m, label: 'M' },
        { val: time.s, label: 'S' },
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="bg-white/25 backdrop-blur-sm text-white font-mono font-bold text-sm px-2 py-1 rounded-md min-w-[36px] text-center">
            {pad(item.val)}
          </span>
          {i < 2 && <span className="text-white/70 font-bold text-xs">:</span>}
        </div>
      ))}
    </div>
  );
};

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [flashDeals, setFlashDeals] = useState([]);
  const [heroIdx, setHeroIdx] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
    api.getProducts({ pageSize: 9 }).then((data) => setProducts(data.products)).catch(() => {});
    api.getFlashDeals().then(setFlashDeals).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIdx((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const categoryTiles = [
    { name: 'Electronics', icon: 'devices', bg: 'bg-secondary-fixed', count: 6 },
    { name: 'Fashion', icon: 'apparel', bg: 'bg-primary-fixed', count: 2 },
    { name: 'Home Decor', icon: 'deck', bg: 'bg-tertiary-fixed', count: 4 },
    { name: 'Toys', icon: 'toys', bg: 'bg-error-container', count: 2 },
  ];

  const goCategory = (name) => navigate(`/shop/${encodeURIComponent(name)}`);

  return (
    <main className="flex-grow flex flex-col lg:flex-row w-full px-3 md:px-6 lg:px-8 pr-4 md:pr-margin-desktop py-6 gap-4 lg:gap-6">
      <CategorySidebar categories={categories} activeCategory="" />

      <div className="flex-1 w-full min-w-0 space-y-12">
        {/* ═══════════════ HERO ═══════════════ */}
        <section
          className="relative rounded-3xl overflow-hidden animate-fade-up"
          style={{ background: 'linear-gradient(135deg, #fbf9f5 0%, #fff5f0 50%, #f0fffe 100%)' }}
        >
          {/* Decorative blobs */}
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />

          <div className="relative z-10 p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center gap-8 min-h-[380px] lg:min-h-[420px]">
            {/* Text */}
            <div className="flex-1 max-w-lg">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-tertiary-fixed text-on-tertiary-fixed-variant text-xs font-bold rounded-full mb-5">
                <span className="material-symbols-outlined text-sm">local_offer</span>
                Summer Sale — Up to 50% Off
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-on-surface mb-4 leading-[1.1] tracking-tight">
                Discover Joy<br />in Every Box.
              </h1>
              <p className="text-on-surface-variant mb-8 leading-relaxed text-base md:text-lg max-w-md">
                Vibrant fashion, quirky electronics, and delightful home finds — curated to brighten your day.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/shop"
                  className="bg-primary text-on-primary font-semibold px-8 py-3.5 rounded-full inline-flex items-center gap-2 group text-sm hover:bg-primary/90 hover:shadow-lg transition-all duration-300"
                >
                  Shop Now
                  <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </Link>
                <Link
                  to="/shop?flash=true"
                  className="bg-surface-container-lowest border border-surface-container text-on-surface font-semibold px-6 py-3.5 rounded-full inline-flex items-center gap-2 text-sm hover:bg-surface-container-low hover:border-primary/30 transition-all duration-300"
                >
                  <span className="material-symbols-outlined text-lg text-primary">bolt</span>
                  Flash Deals
                </Link>
              </div>
            </div>

            {/* Hero image carousel */}
            <div className="hidden md:flex w-1/2 h-[300px] lg:h-[340px] relative items-center justify-center">
              {heroImages.map((img, i) => (
                <img
                  key={img}
                  src={img}
                  alt="Featured product"
                  className={`absolute w-full h-full object-contain drop-shadow-2xl transition-all duration-700 ${
                    i === heroIdx ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ TRUST BADGES ═══════════════ */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: 'local_shipping', title: 'Free Shipping', desc: 'On orders over $50' },
            { icon: 'shield', title: 'Secure Payment', desc: '100% protected' },
            { icon: 'autorenew', title: 'Easy Returns', desc: '30-day policy' },
            { icon: 'support_agent', title: '24/7 Support', desc: 'Always here to help' },
          ].map((badge) => (
            <TrustBadge key={badge.title} {...badge} />
          ))}
        </section>

        {/* ═══════════════ CATEGORIES ═══════════════ */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-on-surface mb-1">Browse Categories</h2>
              <p className="text-sm text-on-surface-variant">Explore our curated collections</p>
            </div>
            <Link to="/shop" className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
              View All
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categoryTiles.map((tile, idx) => (
              <CategoryTile key={tile.name} {...tile} idx={idx} onClick={() => goCategory(tile.name)} />
            ))}
          </div>
        </section>

        {/* ═══════════════ FLASH DEALS ═══════════════ */}
        {flashDeals.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6 rounded-2xl px-6 py-5"
              style={{ background: 'linear-gradient(135deg, #a43c12 0%, #ff7f50 100%)' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-xl">bolt</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white m-0">Flash Deals</h2>
                  <p className="text-white/80 text-xs m-0">Hurry up! Limited time offers</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-3">
                <span className="text-white/80 text-sm font-medium">Ends in:</span>
                <CountdownTimer />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {flashDeals.slice(0, 3).map((product) => (
                <FlashDealCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════ FEATURED PRODUCTS ═══════════════ */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-on-surface mb-1">Featured Products</h2>
              <p className="text-sm text-on-surface-variant">Hand-picked for you</p>
            </div>
            <Link to="/shop" className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
              View All
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.slice(0, 9).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>

        {/* ═══════════════ CTA BANNER ═══════════════ */}
        <section className="relative rounded-3xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #006a62 0%, #5ef6e6 100%)' }}
        >
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-lg">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Join the NovaCart Community</h2>
              <p className="text-white/80 leading-relaxed">
                Get exclusive deals, early access to new arrivals, and 10% off your first order when you sign up.
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 bg-white/20 backdrop-blur-sm text-white placeholder-white/60 rounded-xl px-5 py-3.5 text-sm border border-white/30 outline-none focus:border-white transition-colors"
              />
              <button className="bg-white text-on-secondary-container font-semibold px-6 py-3.5 rounded-xl text-sm hover:bg-white/90 hover:shadow-lg transition-all shrink-0">
                Subscribe
              </button>
            </div>
          </div>
        </section>

        {/* ═══════════════ WHY CHOOSE US ═══════════════ */}
        <section>
          <h2 className="text-2xl font-bold text-on-surface mb-6 text-center">Why Choose NovaCart?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: 'inventory_2', title: 'Curated Selection', desc: 'Every product is hand-selected for quality, design, and joy factor.' },
              { icon: 'local_shipping', title: 'Fast & Free Shipping', desc: 'Free shipping on orders over $50. Express options available.' },
              { icon: 'handshake', title: 'Trusted by Thousands', desc: 'Over 10,000 happy customers and counting. 5-star rated service.' },
            ].map((item) => (
              <div key={item.title} className="bg-surface-container-low rounded-2xl p-6 text-center hover:bg-surface-container-high transition-colors border border-transparent hover:border-surface-container">
                <div className="w-14 h-14 rounded-2xl bg-primary-container/30 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-primary text-2xl">{item.icon}</span>
                </div>
                <h3 className="text-base font-bold text-on-surface mb-2">{item.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default HomePage;
