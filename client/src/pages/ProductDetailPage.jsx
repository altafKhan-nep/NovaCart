import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { useCart } from '../context/CartContext';
import { createSparkles } from '../components/ProductCard';
import { formatPrice, discountPercent } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import ProductCard from '../components/ProductCard';

const featureIcons = ['verified', 'local_shipping', 'support_agent', 'eco', 'security', 'inventory_2'];
const featureColors = [
  'bg-secondary-container/20 text-secondary',
  'bg-primary-container/20 text-primary',
  'bg-tertiary-fixed/30 text-tertiary',
  'bg-secondary-container/20 text-secondary',
  'bg-primary-container/20 text-primary',
  'bg-tertiary-fixed/30 text-tertiary',
];

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    setLoading(true);
    setQty(1);
    setSelectedImage(0);
    api.getProduct(id).then((data) => {
      setProduct(data);
      setLoading(false);
      if (data?.category) {
        api.getProducts({ category: data.category, limit: 4 }).then((res) => {
          const items = Array.isArray(res) ? res : res.products || [];
          setRelatedProducts(items.filter((p) => p._id !== id).slice(0, 4));
        }).catch(() => {});
      }
    }).catch(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [id]);

  const handleAdd = (e) => {
    createSparkles(e.clientX, e.clientY);
    addToCart({ product: product._id, name: product.name, image: product.images?.[0], price: product.price, qty });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-32">
        <LoadingSpinner size="lg" message="Loading product..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex-1 text-center py-32">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">error</span>
        <h1 className="text-lg font-bold text-on-surface mt-4">Product not found</h1>
        <Link to="/shop" className="btn-primary inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-lg text-sm font-semibold">
          <span className="material-symbols-outlined text-lg">storefront</span>
          Back to Shop
        </Link>
      </div>
    );
  }

  const stock = product.stock ?? 10;
  const stockStatus = stock === 0
    ? { label: 'Out of Stock', color: 'text-error', bg: 'bg-error-container/30', icon: 'block' }
    : stock <= 5
      ? { label: `Low Stock — ${stock} left`, color: 'text-amber-600', bg: 'bg-amber-100', icon: 'warning' }
      : { label: 'In Stock', color: 'text-secondary', bg: 'bg-secondary-container/30', icon: 'check_circle' };

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  const deliveryEstimate = `Estimated delivery: ${deliveryDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`;

  const features = product.features || ['Premium Quality', 'Fast Shipping', 'Joyful Design'];
  const discount = discountPercent(product.price, product.originalPrice);

  return (
    <main className="flex-1 w-full px-3 md:px-6 lg:px-8 pr-4 md:pr-margin-desktop py-8 relative">
      {/* Breadcrumb */}
      <nav className="flex text-sm text-on-surface-variant mb-6 items-center gap-1.5 flex-wrap relative z-10">
        <Link to="/" className="hover:text-primary cursor-pointer transition-colors">Home</Link>
        <span className="material-symbols-outlined text-sm text-on-surface-variant/50">chevron_right</span>
        <Link to="/shop" className="hover:text-primary cursor-pointer transition-colors">Shop</Link>
        <span className="material-symbols-outlined text-sm text-on-surface-variant/50">chevron_right</span>
        <Link to={`/shop/${encodeURIComponent(product.category)}`} className="hover:text-primary cursor-pointer transition-colors">
          {product.category}
        </Link>
        <span className="material-symbols-outlined text-sm text-on-surface-variant/50">chevron_right</span>
        <span className="text-primary font-semibold truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 relative z-10">
        {/* Gallery */}
        <div className="relative rounded-xl overflow-hidden bg-surface-container-lowest border border-surface-container/60">
          <div className="aspect-square">
            <img src={product.images?.[selectedImage] || product.images?.[0]} alt={product.name} className="object-cover w-full h-full" />
          </div>
          {discount && (
            <span className="absolute top-4 left-4 bg-primary text-on-primary text-xs font-bold px-3 py-1.5 rounded-lg">
              -{discount}% OFF
            </span>
          )}
          <div className="flex p-3 gap-2 bg-surface-container-low justify-center border-t border-surface-container/60 flex-wrap">
            {(product.images?.length ? product.images : [product.images?.[0]]).map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`${product.name} ${i + 1}`}
                onClick={() => setSelectedImage(i)}
                className={`w-16 h-16 object-cover rounded-lg border-2 cursor-pointer transition-all ${
                  i === selectedImage ? 'border-primary shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
                loading="lazy"
              />
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          <div className="mb-4">
            {product.badge && (
              <span className="bg-secondary-container/20 text-secondary text-xs font-semibold px-2.5 py-1 rounded-md inline-block mb-2">
                {product.badge}
              </span>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-on-surface mb-2 leading-tight">{product.name}</h1>
            <div className="flex items-baseline gap-3">
              <p className="text-xl font-bold text-primary">${formatPrice(product.price)}</p>
              {product.originalPrice > product.price && (
                <p className="text-sm text-on-surface-variant line-through">${formatPrice(product.originalPrice)}</p>
              )}
            </div>
          </div>

          <p className="text-sm text-on-surface-variant mb-5 leading-relaxed">{product.description}</p>

          {/* Stock Status */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${stockStatus.bg} ${stockStatus.color} mb-4 w-fit`}>
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{stockStatus.icon}</span>
            {stockStatus.label}
          </div>

          {/* Delivery Estimate */}
          <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-5">
            <span className="material-symbols-outlined text-base text-primary">local_shipping</span>
            {deliveryEstimate}
          </div>

          {/* Size Guide */}
          <button className="text-xs font-semibold text-primary hover:underline mb-5 flex items-center gap-1 w-fit">
            <span className="material-symbols-outlined text-sm">straighten</span>
            Size Guide
          </button>

          {product.colors?.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-semibold text-on-surface mb-2">Color</p>
              <div className="flex gap-2">
                {product.colors.map((color, i) => (
                  <button
                    key={i}
                    className="w-9 h-9 rounded-lg transition-all duration-200"
                    style={{
                      backgroundColor: color,
                      border: '2px solid #fff',
                      boxShadow: `0 0 0 2px ${color === '#ffffff' ? '#dec0b6' : '#a43c12'}`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-3 flex-wrap mb-6">
            <div className="flex items-center border border-surface-container rounded-xl bg-surface-container-low h-12">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                disabled={qty <= 1}
                className="px-3.5 py-2 text-on-surface-variant hover:text-primary transition-colors disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-lg">remove</span>
              </button>
              <span className="w-10 text-center text-sm font-bold">{qty}</span>
              <button
                onClick={() => setQty(Math.min(stock, qty + 1))}
                disabled={qty >= stock}
                className="px-3.5 py-2 text-on-surface-variant hover:text-primary transition-colors disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-lg">add</span>
              </button>
            </div>
            <button
              onClick={(e) => handleAdd(e)}
              disabled={stock === 0}
              className="btn-primary text-on-primary-container rounded-xl px-6 py-3 flex-grow text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
              {stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mb-16 relative z-10">
        <h2 className="text-lg font-bold text-on-surface text-center mb-6">Designed for Joy</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <div key={i} className="bg-surface-container-low rounded-xl p-6 border border-surface-container/60 text-center hover:shadow-md transition-shadow duration-300">
              <div className={`w-12 h-12 rounded-lg ${featureColors[i % featureColors.length]} flex items-center justify-center mx-auto mb-3`}>
                <span className="material-symbols-outlined text-xl">{featureIcons[i % featureIcons.length]}</span>
              </div>
              <h3 className="text-sm font-bold text-on-surface mb-1">{feature}</h3>
              <p className="text-xs text-on-surface-variant">{feature} delivered with NovaCart's signature joy.</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="relative z-10 mb-8">
          <h2 className="text-lg font-bold text-on-surface mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
};

export default ProductDetailPage;
