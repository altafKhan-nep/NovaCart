import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import ProductCard from '../components/ProductCard';

const TrustBadge = ({ icon, title, desc }) => (
  <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3 group hover:shadow-sm transition-all duration-200">
    <span className="material-symbols-outlined text-[#a43c12] text-xl">{icon}</span>
    <div>
      <p className="text-[13px] font-semibold text-gray-800 leading-tight">{title}</p>
      <p className="text-[11px] text-gray-400 leading-tight">{desc}</p>
    </div>
  </div>
);

/* ─── Hero Section — Clean Amazon/Flipkart style ─── */
const HeroSlide = ({ slide, isActive }) => (
  <div className={`absolute inset-0 transition-all duration-700 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
    <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
    <div className="absolute inset-0 flex items-center">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 w-full">
        <div className="max-w-lg">
          {slide.ctaText && (
            <span className="inline-block bg-[#a43c12] text-white text-[11px] font-bold px-3 py-1 rounded mb-3 uppercase tracking-wider">
              {slide.ctaText}
            </span>
          )}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p className="text-white/80 text-sm md:text-base mb-5 max-w-md leading-relaxed">
              {slide.subtitle}
            </p>
          )}
          <Link
            to={slide.link || '/shop'}
            className="inline-flex items-center gap-2 bg-[#a43c12] text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-[#8a3210] transition-all duration-200 group"
          >
            Shop Now
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  </div>
);

const HeroSection = () => {
  const [slides, setSlides] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    api.getActiveBanners('hero').then((data) => {
      if (Array.isArray(data) && data.length > 0) setSlides(data);
    }).catch(() => {});
  }, []);

  const next = useCallback(() => {
    setActiveIdx((p) => (p + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setActiveIdx((p) => (p - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, isPaused, slides.length]);

  // Fallback when no slides
  if (slides.length === 0) {
    return (
      <section className="relative rounded-xl overflow-hidden bg-gray-900 min-h-[300px] md:min-h-[380px]">
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 w-full">
            <div className="max-w-lg">
              <span className="inline-block bg-[#a43c12] text-white text-[11px] font-bold px-3 py-1 rounded mb-3 uppercase tracking-wider">
                Summer Sale
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                Discover Joy<br />in Every Box.
              </h1>
              <p className="text-white/70 text-sm md:text-base mb-5 max-w-md leading-relaxed">
                Vibrant fashion, quirky electronics, and delightful home finds.
              </p>
              <div className="flex items-center gap-3">
                <Link to="/shop" className="inline-flex items-center gap-2 bg-[#a43c12] text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-[#8a3210] transition-all duration-200 group">
                  Shop Now
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
                <Link to="/shop?flash=true" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-sm font-semibold px-5 py-3 rounded-lg hover:bg-white/20 transition-all duration-200">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Flash Deals
                </Link>
              </div>
            </div>
          </div>
        </div>
        <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800" alt="" className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-30" />
      </section>
    );
  }

  return (
    <section
      className="relative rounded-xl overflow-hidden bg-gray-900 min-h-[300px] md:min-h-[380px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {slides.map((slide, i) => (
        <HeroSlide key={slide._id || i} slide={slide} isActive={i === activeIdx} />
      ))}

      {/* Nav arrows */}
      {slides.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === activeIdx ? 'w-6 h-2 bg-[#a43c12]' : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

/* ─── Category Tile — Clean Amazon/Flipkart style ─── */
const CategoryTile = ({ name, icon, image, count, idx, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer group hover:shadow-md hover:border-orange-200 transition-all duration-200"
  >
    <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden flex items-center justify-center">
      {image ? (
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center">
          <span className="material-symbols-outlined text-2xl text-orange-400">{icon}</span>
        </div>
      )}
      {count > 0 && (
        <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-[10px] font-medium text-gray-500 px-1.5 py-0.5 rounded">
          {count} items
        </span>
      )}
    </div>
    <div className="px-3 py-2.5 text-center">
      <p className="text-[13px] font-medium text-gray-700 group-hover:text-orange-600 transition-colors">{name}</p>
    </div>
  </div>
);

/* ─── Flash Deal Card — uses same ProductCard for consistency ─── */

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
const HomePage = () => {
  const [dbCategories, setDbCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [flashDeals, setFlashDeals] = useState([]);
  const [promoBanners, setPromoBanners] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.getPublicCategories().then(setDbCategories).catch(() => {});
    api.getProducts({ pageSize: 9 }).then((data) => setProducts(data.products)).catch(() => {});
    api.getFlashDeals().then(setFlashDeals).catch(() => {});
    api.getActiveBanners('promo').then(setPromoBanners).catch(() => {});
  }, []);

  const goCategory = (name) => navigate(`/shop/${encodeURIComponent(name)}`);

  return (
    <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-4 space-y-8">
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
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Shop by Category</h2>
            <Link to="/shop" className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {dbCategories.map((cat, idx) => (
              <CategoryTile
                key={cat._id}
                name={cat.name}
                icon={cat.icon || 'category'}
                image={cat.image}
                count={cat.productCount}
                idx={idx}
                onClick={() => goCategory(cat.slug || cat.name)}
              />
            ))}
          </div>
        </section>

        {/* Flash Deals */}
        {flashDeals.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-red-500 text-xl">flash_on</span>
                <h2 className="text-lg font-bold text-gray-900">Flash Deals</h2>
              </div>
              <Link to="/shop?flash=true" className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {flashDeals.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Featured Products */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Featured Products</h2>
            <Link to="/shop" className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="bg-gray-900 rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Join the NovaCart Community</h2>
            <p className="text-gray-400 text-sm">Get exclusive deals, early access to new arrivals, and 10% off your first order.</p>
          </div>
          <div className="flex w-full md:w-auto gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 md:w-56 bg-white/10 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm border border-white/10 outline-none focus:border-orange-500 transition-colors"
            />
            <button className="bg-[#a43c12] text-white font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-[#8a3210] transition-colors shrink-0">
              Subscribe
            </button>
          </div>
        </section>

        {/* Promo Banners */}
        {promoBanners.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-5">Special Offers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {promoBanners.slice(0, 3).map((banner) => (
                <a
                  key={banner._id}
                  href={banner.link || '/shop'}
                  className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-orange-200 transition-all duration-200"
                >
                  {banner.image && (
                    <div className="aspect-[16/7] overflow-hidden bg-gray-50">
                      <img src={banner.image} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}
                  <div className="p-3.5">
                    <h3 className="text-[13px] font-semibold text-gray-800 mb-0.5">{banner.title}</h3>
                    {banner.subtitle && <p className="text-[11px] text-gray-400 mb-1.5">{banner.subtitle}</p>}
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#a43c12]">
                      {banner.ctaText || 'Shop Now'}
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Why Choose Us */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { icon: 'inventory_2', title: 'Curated Selection', desc: 'Hand-selected products for quality and design.' },
            { icon: 'local_shipping', title: 'Fast & Free Shipping', desc: 'Free shipping on orders over $50.' },
            { icon: 'handshake', title: 'Trusted by Thousands', desc: '10,000+ happy customers and counting.' },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3 group hover:shadow-sm transition-all duration-200">
              <span className="material-symbols-outlined text-[#a43c12] text-xl">{item.icon}</span>
              <div>
                <p className="text-[13px] font-semibold text-gray-800">{item.title}</p>
                <p className="text-[11px] text-gray-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </section>
    </main>
  );
};

export default HomePage;
