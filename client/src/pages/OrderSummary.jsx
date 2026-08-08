import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Add this import
import { useCheckout } from './CheckoutContext';
import { useCart } from './CartContext';

// eslint-disable-next-line react/prop-types
const OrderSummary = ({ onBack }) => {
  const { checkoutData } = useCheckout();
  const { updateCartCount } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => 
      total + item.productId.price * item.quantity, 0
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        return resolve(true);
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    if (checkoutData.paymentMethod === 'cod') {
      // Handle COD order
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/auth");
          return;
        }

        // Prepare order items
        const orderItems = cartItems.map(item => ({
          productId: item.productId._id,
          name: item.productId.name,
          price: item.productId.price,
          quantity: item.quantity
        }));

        // Create order data
        const orderData = {
          items: orderItems,
          shippingAddress: checkoutData.shippingAddress,
          paymentMethod: checkoutData.paymentMethod,
          totalAmount: calculateTotal()
        };

        console.log("Sending order data:", orderData);

        // Create order in database
        const response = await axios.post(
          'https://mithun-electricals.onrender.com/api/orders', 
          orderData, 
          { headers: { "x-access-token": token } }
        );

        console.log("Order created:", response.data);

        // Clear cart and redirect to success page
        localStorage.removeItem('cartItems');
        updateCartCount(0);
        navigate('/order-success', { state: { orderId: response.data.orderId } });
      } catch (error) {
        console.error('Order creation failed:', error);
        setError(error.response?.data?.error || 'Failed to create order. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      // Handle Razorpay payment
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/auth");
          return;
        }

        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
        }

        // Prepare order data
        const orderItems = cartItems.map(item => ({
          productId: item.productId._id,
          name: item.productId.name,
          price: item.productId.price,
          quantity: item.quantity
        }));

        const orderData = {
          items: orderItems,
          shippingAddress: checkoutData.shippingAddress,
          paymentMethod: "online",
          totalAmount: calculateTotal()
        };

        const options = {
          key: "rzp_test_qrB3kyGhLYMsvr",
          amount: Math.round(calculateTotal() * 100),
          currency: "INR",
          name: "Mithun Electricals",
          description: "Order Payment",
          handler: async function (response) {
            // On successful payment, save order
            try {
              const orderResponse = await axios.post(
                'https://mithun-electricals.onrender.com/api/orders', 
                orderData, 
                { headers: { "x-access-token": token } }
              );
              
              // Clear cart and redirect to success page with order ID
              localStorage.removeItem('cartItems');
              updateCartCount(0);
              navigate('/order-success', { state: { orderId: orderResponse.data.orderId } });
            } catch (err) {
              setError('Payment successful but order creation failed. Please contact support.');
            }
          },
          prefill: {
            name: checkoutData.shippingAddress.fullName,
            contact: checkoutData.shippingAddress.phone,
          },
          theme: {
            color: "#3399cc",
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.on("payment.failed", function (response) {
          setError(`Payment failed: ${response.error.description}`);
        });
        razorpay.open();
      } catch (error) {
        setError(error.message || "Failed to initiate payment. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Rest of your component remains the same
  return (
    <div className="order-summary">
      <h2>Order Summary</h2>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <div className="summary-section">
        <h3>Shipping Address</h3>
        <div className="address-details">
          <p>{checkoutData.shippingAddress.fullName}</p>
          <p>{checkoutData.shippingAddress.address}</p>
          <p>{checkoutData.shippingAddress.city}, {checkoutData.shippingAddress.state}</p>
          <p>PIN: {checkoutData.shippingAddress.pincode}</p>
          <p>Phone: {checkoutData.shippingAddress.phone}</p>
        </div>
      </div>

      <div className="summary-section">
        <h3>Payment Method</h3>
        <p>{checkoutData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
      </div>

      <div className="summary-section">
        <h3>Order Items</h3>
        <div className="order-items">
          {cartItems.map(item => (
            <div key={item.productId._id} className="order-item">
              <div className="item-details">
                <h4>{item.productId.name}</h4>
                <p>Quantity: {item.quantity}</p>
              </div>
              <div className="item-price">
                {formatPrice(item.productId.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="price-summary">
        <div className="price-row">
          <span>Subtotal</span>
          <span>{formatPrice(calculateTotal())}</span>
        </div>
        <div className="price-row">
          <span>Shipping</span>
          <span>Free</span>
        </div>
        <div className="price-row total">
          <span>Total</span>
          <span>{formatPrice(calculateTotal())}</span>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-back" onClick={onBack}>
          Back to Payment
        </button>
        <button 
          type="button" 
          className="btn-place-order"
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;