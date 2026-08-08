import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './OrderSuccess.css';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Get the order ID from location state or retrieve the latest order
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/auth');
          return;
        }

        let id;
        // Use order ID from location state if available
        if (location.state?.orderId) {
          id = location.state.orderId;
          setOrderId(id);
        } else {
          // Otherwise fetch the latest order
          const response = await axios.get(
            'https://mithun-electricals.onrender.com/api/orders/history',
            { headers: { 'x-access-token': token } }
          );
          
          if (response.data && response.data.length > 0) {
            id = response.data[0]._id;
            setOrderId(id);
          } else {
            // No orders found
            navigate('/products');
            return;
          }
        }

        // You can fetch order details here if needed
        // const detailsResponse = await axios.get(
        //   `https://mithun-electricals.onrender.com/api/orders/${id}`,
        //   { headers: { 'x-access-token': token } }
        // );
        // setOrderDetails(detailsResponse.data);
        
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Could not load order details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [location.state, navigate]);

  if (loading) {
    return <div className="loading-container">Loading order details...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="order-success-container">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1>Order Placed Successfully!</h1>
        
        <div className="order-details">
          <p>Thank you for your purchase.</p>
          {orderId && <p>Order ID: <span className="order-id">{orderId}</span></p>}
          <p>We'll send you a confirmation email with your order details.</p>
        </div>
        
        <div className="next-steps">
          <h3>What's Next?</h3>
          <p>Your order has been confirmed.</p>
          <p>Our team will process your order and you'll receive updates.</p>
        </div>
        
        <div className="action-buttons">
          <button 
            className="view-products-btn" 
            onClick={() => navigate('/products')}
          >
            Browse More Products
          </button>
          <button 
            className="track-order-btn" 
            onClick={() => navigate('/profile')}
          >
            View Order History
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;