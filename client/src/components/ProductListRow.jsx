import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, discountPercent } from '../utils/helpers';
import { createSparkles } from './ProductCard';

const ProductListRow = ({ product }) => {
  const { addToCart } = useCart();
  const { user, toggleWishlist } = useAuth();
  const isWishlisted = user?.wishlist?.some((item) => item._id === product._id);
  const discount = discountPercent(product.price, product.originalPrice);
  const features = product.features || [];

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    createSparkles(e.clientX, e.clientY);
    addToCart({
      product: product._id,
      name: product.name,
      image: product.images?.[0],
      price: product.price,
      qty: 1,
    });
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { window.location.href = '/login'; return; }
    await toggleWishlist(product._id);
  };

  return (
    <Link
      to={`/product/${product._id}`}
      className="flex gap-4 p-4 bg-surface-container-lowest border border-outline-variant/15 rounded-xl hover:shadow-ambient-surface hover:border-primary/15 transition-all duration-200 group"
    >
      {/* Image */}
      <div className="relative w-[140px] h-[140px] shrink-0 bg-surface-container-low rounded-lg overflow-hidden flex items-center justify-center">
        <img
          src={product.images?.[0]}
          alt={product.name}
          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {discount > 0 && (
          <span className="absolute top-1.5 left-1.5 bg-primary text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded-md">
            {discount}% off
          </span>
        )}
        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white hover:shadow transition-all"
          aria-label="Add to wishlist"
        >
          <svg className={`w-4 h-4 ${isWishlisted ? 'text-red-500' : 'text-gray-400'}`} fill={isWishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Name */}
        <h3 className="text-sm font-semibold text-on-surface line-clamp-2 leading-snug group-hover:text-primary transition-colors mb-1">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="inline-flex items-center gap-0.5 bg-green-50 text-green-700 text-[11px] font-semibold px-1.5 py-0.5 rounded">
            {product.rating?.toFixed(1) || '4.0'}
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </span>
          {product.numReviews != null && (
            <span className="text-[11px] text-on-surface-variant/50">
              {product.numReviews.toLocaleString()} Ratings &amp; Reviews
            </span>
          )}
        </div>

        {/* Features / specs */}
        {features.length > 0 && (
          <ul className="text-[11px] text-on-surface-variant/60 space-y-0.5 mb-2">
            {features.slice(0, 4).map((f, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="w-1 h-1 rounded-full bg-primary/40 mt-[5px] shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        )}

        {/* Price + offers */}
        <div className="mt-auto flex items-end gap-3 flex-wrap">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-extrabold text-on-surface">${formatPrice(product.price)}</span>
            {discount > 0 && (
              <span className="text-xs text-on-surface-variant/40 line-through">${formatPrice(product.originalPrice)}</span>
            )}
            {discount > 0 && (
              <span className="text-xs font-bold text-green-600">{discount}% off</span>
            )}
          </div>
        </div>

        {/* Offer tags */}
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          <span className="text-[10px] font-semibold text-primary bg-primary/8 px-2 py-0.5 rounded-md">
            Bank Offer
          </span>
          {discount > 20 && (
            <span className="text-[10px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-md">
              Deal of the Day
            </span>
          )}
        </div>

        {/* Free delivery */}
        <p className="text-[11px] text-on-surface-variant/40 mt-1.5 flex items-center gap-1">
          <span className="material-symbols-outlined text-[13px]">local_shipping</span>
          Free delivery
        </p>
      </div>

      {/* Add to Cart (desktop only) */}
      <div className="hidden md:flex items-center shrink-0">
        <button
          onClick={handleAdd}
          className="bg-primary/8 hover:bg-primary hover:text-on-primary text-primary text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[15px]">add_shopping_cart</span>
          Add to Cart
        </button>
      </div>
    </Link>
  );
};

export default ProductListRow;
