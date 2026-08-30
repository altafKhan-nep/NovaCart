import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, discountPercent } from '../utils/helpers';

const Stars = ({ rating, reviews }) => {
  const rounded = Math.round(rating);
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span
        key={i}
        className="material-symbols-outlined text-[14px]"
        style={{ fontVariationSettings: i <= rounded ? "'FILL' 1" : "'FILL' 0", color: i <= rounded ? '#e9c400' : '#dec0b6' }}
      >
        {i <= rounded ? 'star' : 'star_border'}
      </span>
    );
  }
  return (
    <div className="flex items-center gap-0.5 text-sm">
      {stars}
      {reviews !== undefined && (
        <span className="text-xs text-on-surface-variant ml-1">({reviews})</span>
      )}
    </div>
  );
};

export const createSparkles = (x, y) => {
  const colors = ['#e9c400', '#ff7f50', '#61f9e9'];
  for (let i = 0; i < 6; i++) {
    const sparkle = document.createElement('span');
    sparkle.classList.add('material-symbols-outlined', 'sparkle-effect');
    sparkle.textContent = 'auto_awesome';
    sparkle.style.color = colors[i % colors.length];
    const offsetX = (Math.random() - 0.5) * 70;
    const offsetY = (Math.random() - 0.5) * 70;
    sparkle.style.left = x + offsetX + 'px';
    sparkle.style.top = y + offsetY + 'px';
    sparkle.style.fontSize = '20px';
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 600);
  }
};

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user, toggleWishlist } = useAuth();
  const isWishlisted = user?.wishlist?.some((item) => item._id === product._id);

  const handleAdd = (e) => {
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
      <div className="product-card bg-surface-container-lowest rounded-2xl border border-surface-container/80 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(164,60,18,0.1)] flex flex-col h-full">
        {/* Image */}
        <div className="relative aspect-square bg-surface-container-low overflow-hidden flex items-center justify-center p-6">
          <img
            src={product.images?.[0]}
            alt={product.name}
            className="h-full w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.badge && (
              <span className="bg-error text-on-error text-[11px] font-bold px-2.5 py-1 rounded-md tracking-wide uppercase">
                {product.badge}
              </span>
            )}
            {product.isNewArrival && (
              <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant text-[11px] font-bold px-2.5 py-1 rounded-md tracking-wide uppercase">
                New
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 p-2 bg-surface-container-lowest/80 backdrop-blur-sm rounded-lg text-on-surface-variant hover:text-primary transition-all duration-200 hover:scale-110 shadow-sm"
            aria-label="Add to wishlist"
          >
            <span
              className="material-symbols-outlined text-[18px]"
              style={{ fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0", color: isWishlisted ? '#a43c12' : 'inherit' }}
            >
              favorite
            </span>
          </button>

          {/* Discount */}
          {discount && (
            <span className="absolute bottom-3 left-3 bg-primary text-on-primary text-[11px] font-bold px-2.5 py-1 rounded-md tracking-wide">
              -{discount}%
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-sm font-semibold text-on-surface mb-1.5 truncate leading-snug">
            {product.name}
          </h3>
          <Stars rating={product.rating} reviews={product.numReviews} />

          <div className="mt-auto pt-3 flex items-end justify-between gap-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-primary leading-none">
                ${formatPrice(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xs text-on-surface-variant line-through leading-none">
                  ${formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <button
              onClick={(e) => { e.preventDefault(); handleAdd(e); }}
              className="shrink-0 w-9 h-9 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center transition-all duration-200 hover:bg-secondary hover:scale-105 shadow-sm"
              aria-label="Add to cart"
            >
              <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
