import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { formatPrice } from '../utils/helpers';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, itemsPrice, shippingPrice, taxPrice, totalPrice, clearCart } = useCart();
  const { user, refreshProfile } = useAuth();

  const [address, setAddress] = useState({
    fullName: user?.address?.fullName || user?.name || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    zip: user?.address?.zip || '',
  });
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!address.fullName || !address.street || !address.city || !address.zip) {
      setError('Please fill in all shipping fields');
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }

    const orderItems = cartItems.map((item) => ({
      name: item.name,
      qty: item.qty,
      image: item.image,
      price: item.price,
      product: item.product,
    }));

    setPlacing(true);
    try {
      const order = await api.createOrder({
        orderItems,
        shippingAddress: address,
        paymentMethod: 'Card',
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      });
      clearCart();
      const points = Math.floor(totalPrice);
      await api.getProfile();
      if (user) await refreshProfile();
      navigate(`/order-success/${order._id}`);
    } catch (err) {
      setError(err.message);
      setPlacing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="flex-grow w-full px-3 md:px-6 lg:px-8 pr-4 md:pr-margin-desktop py-gutter text-center">
        <span className="material-symbols-outlined text-6xl text-outline">shopping_cart</span>
        <h1 className="font-headline-md text-headline-md text-primary mt-4">Your cart is empty</h1>
        <button onClick={() => navigate('/shop')} className="btn-primary mt-6 px-8 py-3 rounded-full font-label-bold">
          Go Shopping
        </button>
      </main>
    );
  }

  return (
    <main className="flex-grow w-full px-3 md:px-6 lg:px-8 pr-4 md:pr-margin-desktop py-gutter flex flex-col gap-gutter">
      <div className="flex items-center justify-center gap-6 mb-8">
        {[
          { label: 'Cart', num: '1', done: true },
          { label: 'Address', num: '2', active: true },
          { label: 'Payment', num: '3', active: false },
        ].map((step) => (
          <div className="flex flex-col items-center gap-2" key={step.label}>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-label-bold ${
                step.active
                  ? 'bg-primary-container text-on-primary-container shadow-md ring-4 ring-primary-container/30'
                  : step.done
                  ? 'bg-primary-container text-on-primary-container shadow-md'
                  : 'bg-surface-container-highest text-on-surface-variant'
              }`}
            >
              {step.done ? (
                <span className="material-symbols-outlined">check</span>
              ) : (
                <span className="font-label-bold text-label-bold">{step.num}</span>
              )}
            </div>
            <span className={`font-label-bold text-label-bold ${step.active ? 'text-primary' : 'text-on-surface-variant'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-gutter relative">
        <div className="flex-grow flex flex-col gap-gutter w-full">
          <form
            onSubmit={handleSubmit}
            className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-gutter shadow-ambient-surface"
          >
            <h2 className="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">local_shipping</span>
              Shipping Address
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block font-label-bold text-label-bold text-on-surface-variant mb-1">Full Name</label>
                <input
                  name="fullName"
                  value={address.fullName}
                  onChange={handleChange}
                  className="w-full pl-4 pr-4 py-3 bg-surface-container-low border border-transparent rounded-full text-on-surface transition-all focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary-container/20 focus:bg-white"
                  placeholder="Jane Doe"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block font-label-bold text-label-bold text-on-surface-variant mb-1">Street Address</label>
                <input
                  name="street"
                  value={address.street}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-surface-container-low border border-transparent rounded-full text-on-surface transition-all focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary-container/20 focus:bg-white"
                  placeholder="123 Joyful Lane"
                />
              </div>
              <div>
                <label className="block font-label-bold text-label-bold text-on-surface-variant mb-1">City</label>
                <input
                  name="city"
                  value={address.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-surface-container-low border border-transparent rounded-full text-on-surface transition-all focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary-container/20 focus:bg-white"
                  placeholder="Sunnyville"
                />
              </div>
              <div>
                <label className="block font-label-bold text-label-bold text-on-surface-variant mb-1">ZIP / Postal Code</label>
                <input
                  name="zip"
                  value={address.zip}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-surface-container-low border border-transparent rounded-full text-on-surface transition-all focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary-container/20 focus:bg-white"
                  placeholder="90210"
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 bg-error-container text-on-error-container rounded-full px-4 py-3 font-label-bold text-label-bold text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={placing}
              className="w-full mt-6 btn-primary text-on-primary-container font-label-bold text-label-bold py-4 rounded-full flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {placing ? (
                'Placing Order...'
              ) : (
                <>
                  Continue to Payment
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="w-full lg:w-1/3">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-gutter shadow-ambient-surface sticky top-[100px]">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div className="flex gap-4" key={item.product}>
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-container-low shrink-0">
                    <img className="w-full h-full object-cover" src={item.image} alt={item.name} />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-label-bold text-label-bold text-on-surface">{item.name}</h3>
                    <p className="text-on-surface-variant text-sm">Qty: {item.qty}</p>
                  </div>
                  <span className="font-label-bold text-label-bold text-on-surface">
                    ${formatPrice(item.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-surface-container-high pt-4 space-y-2 mb-6 text-body-md font-body-md">
              <div className="flex justify-between text-on-surface-variant">
                <span>Subtotal</span>
                <span>${formatPrice(itemsPrice)}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Shipping</span>
                <span>{shippingPrice === 0 ? 'Free' : `$${formatPrice(shippingPrice)}`}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Tax</span>
                <span>${formatPrice(taxPrice)}</span>
              </div>
              <div className="flex justify-between font-label-bold text-label-bold text-on-surface pt-2 text-lg">
                <span>Total</span>
                <span>${formatPrice(totalPrice)}</span>
              </div>
            </div>
            <p className="text-center text-xs text-on-surface-variant mt-4 flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              256-bit secure encryption
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CheckoutPage;
