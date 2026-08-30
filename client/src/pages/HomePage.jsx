import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import CategorySidebar from '../components/CategorySidebar';
import ProductCard from '../components/ProductCard';

const heroSlides = [
  {
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700',
    tag: 'Summer Sale — Up to 50% Off',
    title: 'Discover Joy',
    highlight: 'in Every Box.',
    desc: 'Vibrant fashion, quirky electronics, and delightful home finds — curated to brighten your day.',
  },
  {
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700',
    tag: 'New Arrivals',
    title: 'Style Meets',
    highlight: 'Function.',
    desc: 'Premium watches, sleek gadgets, and modern accessories for the contemporary lifestyle.',
  },
  {
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=700',
    tag: 'Limited Edition',
    title: 'Capture Every',
    highlight: 'Moment.',
    desc: 'Instant cameras, vintage lenses, and photography gear to freeze time beautifully.',
  },
];

const TrustBadge = ({ icon, title, desc }) => (
  <div className="flex items-center gap-3 group cursor-default">
    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/8 to-primary/4 flex items-center justify-center shrink-0 group-hover:from-primary/15 group-hover:to-primary/8 transition-all duration-300 shadow-sm">
      <span className="material-symbols-outlined text-primary text-xl">{icon}</span>
    </div>
    <div>
      <p className="text-sm font-semibold text-on-surface leading-tight">{title}</p>
      <p className="text-xs text-on-surface-variant leading-tight">{desc}</p>
    </div>
  </div>
);

const CategoryTile = ({ name, icon, bgClass, count, idx, onClick }) => (
  <div
    onClick={onClick}
    className="bg-surface-container-low rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer group hover:bg-surface hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 animate-fade-up border border-surface-container/40 hover:border-primary/20"
    style={{ animationDelay: `${0.1 + idx * 0.05}s` }}
  >
    <div className={`w-14 h-14 rounded-2xl ${bgClass} flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm`}>
      <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
        {icon}
      </span>
    </div>
    <span className="text-sm font-semibold text-on-surface mb-0.5">{name}</span>
    <span className="text-xs text-on-surface-variant">{count} items</span>
  </div>
);

const FlashDealCard = ({ product }) => {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link to={`/product/${product._id}`} className="block group">
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1.5 flex flex-col h-full">
        <div className="relative aspect-[4/3] bg-gradient-to-br from-surface-container-low to-surface-container overflow-hidden flex items-center justify-center p-6">
          <img
            src={product.images?.[0]}
            alt={product.name}
            className="h-full w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-gradient-to-r from-error to-error/90 text-on-error text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
              -{discount}% OFF
            </span>
          )}
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-primary text-lg">favorite_border</span>
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
          <button className="w-full bg-gradient-to-r from-primary to-primary/90 text-on-primary font-semibold py-3 rounded-xl text-sm hover:from-primary/90 hover:to-primary hover:shadow-md transition-all mt-auto">
            Add to Cart
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
          <span className="bg-white/20 backdrop-blur-sm text-white font-mono font-bold text-sm px-2.5 py-1.5 rounded-lg min-w-[38px] text-center shadow-sm">
            {pad(item.val)}
          </span>
          {i < 2 && <span className="text-white/60 font-bold text-xs">:</span>}
        </div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   HERO SECTION — Amazon/Flipkart style big carousel
   ═══════════════════════════════════════════════════════════════ */
const HeroSection = () => {
  const [heroIdx, setHeroIdx] = useState(0);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('novacart_banner_dismissed') === '1');
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  const next = useCallback(() => {
    setHeroIdx((p) => (p + 1) % heroSlides.length);
  }, []);

  const prev = useCallback(() => {
    setHeroIdx((p) => (p - 1 + heroSlides.length) % heroSlides.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, isPaused]);

  const slide = heroSlides[heroIdx];

  return (
    <section
      className="relative rounded-2xl overflow-hidden animate-fade-up"
      style={{ background: 'linear-gradient(135deg, #fbf9f5 0%, #fff5f0 40%, #f0fffe 100%)' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative z-10 flex flex-col md:flex-row items-center min-h-[340px] lg:min-h-[400px]">
        {/* Text Content — reduced left padding */}
        <div className="flex-1 px-6 md:px-8 lg:px-12 py-8 md:py-0 max-w-lg">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-tertiary-fixed to-tertiary-fixed/80 rounded-full mb-4 shadow-sm">
            <svg className="w-3.5 h-3.5 text-on-tertiary-fixed-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span className="text-on-tertiary-fixed-variant text-xs font-bold uppercase tracking-wider">
              {slide.tag}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-on-surface mb-4 leading-[1.1] tracking-tight">
            {slide.title}<br />
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {slide.highlight}
            </span>
          </h1>

          <p className="text-on-surface-variant mb-6 leading-relaxed text-sm md:text-base max-w-md">
            {slide.desc}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/shop"
              className="bg-primary text-on-primary font-semibold px-7 py-3 rounded-full inline-flex items-center gap-2 group text-sm hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
            >
              Shop Now
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link
              to="/shop?flash=true"
              className="bg-surface-container-lowest border border-surface-container text-on-surface font-semibold px-5 py-3 rounded-full inline-flex items-center gap-2 text-sm hover:bg-surface-container-low hover:border-primary/30 hover:shadow-md transition-all duration-300"
            >
              <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              Flash Deals
            </Link>
          </div>
        </div>

        {/* Hero Image — Amazon/Flipkart style BIG carousel */}
        <div
          className="hidden md:flex flex-1 h-[340px] lg:h-[400px] relative items-center justify-center overflow-hidden"
        >
          {/* Previous Arrow */}
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/10 backdrop-blur-sm flex items-center justify-center text-on-surface-variant hover:bg-black/20 hover:shadow-lg transition-all duration-200"
            aria-label="Previous"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Images */}
          {heroSlides.map((s, i) => (
            <img
              key={i}
              src={s.image}
              alt={s.tag}
              className={`absolute w-[75%] h-[75%] object-contain drop-shadow-2xl transition-all duration-600 ease-out ${
                i === heroIdx
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-95'
              }`}
            />
          ))}

          {/* Next Arrow */}
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/10 backdrop-blur-sm flex items-center justify-center text-on-surface-variant hover:bg-black/20 hover:shadow-lg transition-all duration-200"
            aria-label="Next"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIdx(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === heroIdx
                    ? 'w-6 h-2 bg-primary'
                    : 'w-2 h-2 bg-on-surface/20 hover:bg-on-surface/40'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [flashDeals, setFlashDeals] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
    api.getProducts({ pageSize: 9 }).then((data) => setProducts(data.products)).catch(() => {});
    api.getFlashDeals().then(setFlashDeals).catch(() => {});
  }, []);

  const categoryTiles = [
    { name: 'Electronics', icon: 'devices', bg: 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600', count: 6 },
    { name: 'Fashion', icon: 'apparel', bg: 'bg-gradient-to-br from-rose-50 to-rose-100 text-rose-600', count: 2 },
    { name: 'Home Decor', icon: 'deck', bg: 'bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600', count: 4 },
    { name: 'Toys', icon: 'toys', bg: 'bg-gradient-to-br from-violet-50 to-violet-100 text-violet-600', count: 2 },
  ];

  const goCategory = (name) => navigate(`/shop/${encodeURIComponent(name)}`);

  return (
    <main className="flex-grow flex flex-col lg:flex-row w-full max-w-[1400px] mx-auto pl-1 pr-4 md:pl-3 md:pr-6 lg:pl-4 lg:pr-8 py-4 gap-5 lg:gap-6">
      <CategorySidebar categories={categories} activeCategory="" />

      <div className="flex-1 w-full min-w-0 space-y-8">
        {/* Hero */}
        <HeroSection />

        {/* Trust Badges */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: 'local_shipping', title: 'Free Shipping', desc: 'On orders over $50' },
            { icon: 'lock', title: 'Secure Payment', desc: '100% protected' },
            { icon: 'replay', title: 'Easy Returns', desc: '30-day policy' },
            { icon: 'headset_mic', title: '24/7 Support', desc: 'Always here to help' },
          ].map((badge) => (
            <TrustBadge key={badge.title} {...badge} />
          ))}
        </section>

        {/* Categories */}
        <section>
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-on-surface mb-0.5">Browse Categories</h2>
              <p className="text-sm text-on-surface-variant">Explore our curated collections</p>
            </div>
            <Link to="/shop" className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors group">
              View All
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categoryTiles.map((tile, idx) => (
              <CategoryTile key={tile.name} {...tile} idx={idx} onClick={() => goCategory(tile.name)} />
            ))}
          </div>
        </section>

        {/* Flash Deals */}
        {flashDeals.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5 rounded-2xl px-6 py-4"
              style={{ background: 'linear-gradient(135deg, #a43c12 0%, #ff7f50 100%)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white m-0">Flash Deals</h2>
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

        {/* Featured Products */}
        <section>
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-on-surface mb-0.5">Featured Products</h2>
              <p className="text-sm text-on-surface-variant">Hand-picked for you</p>
            </div>
            <Link to="/shop" className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors group">
              View All
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.slice(0, 9).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="relative rounded-2xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #006a62 0%, #5ef6e6 100%)' }}
        >
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-lg">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Join the NovaCart Community</h2>
              <p className="text-white/80 leading-relaxed text-sm">
                Get exclusive deals, early access to new arrivals, and 10% off your first order when you sign up.
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-60 bg-white/20 backdrop-blur-sm text-white placeholder-white/60 rounded-full px-5 py-3 text-sm border border-white/30 outline-none focus:border-white transition-colors"
              />
              <button className="bg-white text-on-secondary-container font-semibold px-6 py-3 rounded-full text-sm hover:bg-white/90 hover:shadow-lg transition-all shrink-0">
                Subscribe
              </button>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section>
          <h2 className="text-xl font-bold text-on-surface mb-5 text-center">Why Choose NovaCart?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: 'inventory_2', title: 'Curated Selection', desc: 'Every product is hand-selected for quality, design, and joy factor.' },
              { icon: 'local_shipping', title: 'Fast & Free Shipping', desc: 'Free shipping on orders over $50. Express options available.' },
              { icon: 'handshake', title: 'Trusted by Thousands', desc: 'Over 10,000 happy customers and counting. 5-star rated service.' },
            ].map((item) => (
              <div key={item.title} className="bg-surface-container-low rounded-2xl p-5 text-center hover:bg-surface hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 border border-surface-container/40 hover:border-primary/15 group cursor-default">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <span className="material-symbols-outlined text-primary text-xl">{item.icon}</span>
                </div>
                <h3 className="text-sm font-bold text-on-surface mb-1">{item.title}</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default HomePage;
