import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, discountPercent } from '../utils/helpers';

const Stars = ({ rating, reviews }) => {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-1">
      <span className="inline-flex items-center gap-0.5 bg-green-50 text-green-700 text-[11px] font-semibold px-1.5 py-0.5 rounded">
        {rating?.toFixed(1) || '4.0'}
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </span>
      {reviews != null && (
        <span className="text-[11px] text-gray-400">({reviews})</span>
      )}
    </div>
  );
};

export const createSparkles = (x, y) => {
  const colors = ['#f59e0b', '#ef4444', '#3b82f6'];
  for (let i = 0; i < 5; i++) {
    const sparkle = document.createElement('div');
    sparkle.style.cssText = `
      position: fixed; left: ${x}px; top: ${y}px; width: 6px; height: 6px;
      background: ${colors[i % colors.length]}; border-radius: 50%;
      pointer-events: none; z-index: 9999;
      animation: sparkle-fly 0.5s ease-out forwards;
      transform: translate(${(Math.random() - 0.5) * 60}px, ${(Math.random() - 0.5) * 60}px);
    `;
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 500);
  }
};

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user, toggleWishlist } = useAuth();
  const isWishlisted = user?.wishlist?.some((item) => item._id === product._id);

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

  const discount = discountPercent(product.price, product.originalPrice);

  return (
    <Link to={`/product/${product._id}`} className="block group">
      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md flex flex-col h-full">

        {/* Image area */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <img
            src={product.images?.[0]}
            alt={product.name}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Discount badge — top left, single badge */}
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-[#a43c12] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
              {discount}% off
            </span>
          )}

          {/* Wishlist — top right */}
          <button
            onClick={handleWishlist}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white hover:shadow transition-all"
            aria-label="Add to wishlist"
          >
            <svg className={`w-4 h-4 ${isWishlisted ? 'text-red-500' : 'text-gray-400'}`} fill={isWishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col flex-1">
          {/* Title */}
          <h3 className="text-[13px] text-gray-700 mb-1 line-clamp-2 leading-snug min-h-[34px] group-hover:text-[#a43c12] transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <Stars rating={product.rating} reviews={product.numReviews} />

          {/* Price — Flipkart style: discount % next to price */}
          <div className="mt-auto pt-2 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-lg font-bold text-gray-900">${formatPrice(product.price)}</span>
            {discount > 0 && (
              <>
                <span className="text-xs text-gray-400 line-through">${formatPrice(product.originalPrice)}</span>
                <span className="text-xs font-semibold text-green-600">{discount}% off</span>
              </>
            )}
          </div>

          {/* Delivery info */}
          <p className="text-[11px] text-gray-400 mt-1">Free delivery</p>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
