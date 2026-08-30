import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import { formatPrice } from '../utils/helpers';

const OrderSuccessPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (id) api.getOrderById(id).then(setOrder).catch(() => {});
  }, [id]);

  const orderNumber = order ? `#NC-${order._id.toString().slice(-5).toUpperCase()}` : '#NC-84920';

  return (
    <main className="flex-1 flex flex-col items-center justify-center min-h-[70vh] w-full px-3 md:px-6 lg:px-8 pr-4 md:pr-margin-desktop py-16">
      {/* Success Icon */}
      <div className="bounce-in bg-secondary-container text-on-secondary-container rounded-xl w-20 h-20 flex items-center justify-center mb-6 shadow-[0_8px_30px_rgba(94,246,230,0.4)]">
        <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          check_circle
        </span>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-on-surface text-center mb-2">Thank You!</h1>
      <p className="text-sm text-on-surface-variant text-center mb-8 max-w-md leading-relaxed">
        Your order has been placed successfully. Get ready for some joy to arrive at your door.
      </p>

      {order && (
        <div className="bg-surface-container-lowest rounded-xl p-6 w-full max-w-lg border border-surface-container/60 mb-8">
          <div className="flex justify-between items-center mb-5 pb-4 border-b border-surface-container">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Order Number</span>
            <span className="text-sm font-bold text-primary">{orderNumber}</span>
          </div>

          <div className="space-y-3 mb-5">
            {order.orderItems.map((item) => (
              <div className="flex items-center gap-3" key={item._id}>
                <div className="w-14 h-14 rounded-lg bg-surface-container-low overflow-hidden shrink-0">
                  <img className="w-full h-full object-cover" src={item.image} alt={item.name} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-on-surface truncate">{item.name}</h3>
                  <p className="text-xs text-on-surface-variant">Qty: {item.qty}</p>
                </div>
                <div className="text-sm font-semibold text-on-surface">${formatPrice(item.price)}</div>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-4 border-t border-surface-container">
            <div className="flex justify-between text-sm text-on-surface-variant">
              <span>Subtotal</span>
              <span>${formatPrice(order.itemsPrice)}</span>
            </div>
            <div className="flex justify-between text-sm text-on-surface-variant">
              <span>Shipping</span>
              <span>{order.shippingPrice === 0 ? 'Free' : `$${formatPrice(order.shippingPrice)}`}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-surface-container">
              <span className="text-base font-bold text-on-surface">Total</span>
              <span className="text-base font-bold text-primary">${formatPrice(order.totalPrice)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <Link
          to="/shop"
          className="flex-1 btn-primary text-on-primary-container rounded-lg py-3 px-5 text-sm font-semibold flex items-center justify-center gap-2"
        >
          Continue Shopping
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </Link>
        <Link
          to="/account"
          className="flex-1 bg-transparent border border-surface-container text-on-surface-variant rounded-lg py-3 px-5 text-sm font-semibold hover:bg-surface-container-low transition-colors text-center"
        >
          View My Orders
        </Link>
      </div>
    </main>
  );
};

export default OrderSuccessPage;
