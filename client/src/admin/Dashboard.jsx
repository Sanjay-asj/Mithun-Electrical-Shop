import { useEffect, useState } from "react";
import { 
  Package, 
  AlertCircle, 
  Activity, 
  X,
  DollarSign,
  Users,
  ShoppingBag,
  Clock
} from "lucide-react";
import Navbara from "./Navbara";
import "./Dashboard.css";

const Dashboard = () => {
  const [metrics] = useState({
    totalProducts: 30,
    lowStockProducts: 12,
    totalOrders: 7,
    activeUsers: 27,
    totalRevenue: 6500
  });

  const [recentActivities] = useState([
    {
      _id: "ORD123456",
      totalAmount: 2500,
      createdAt: "2024-05-20T10:30:00"
    },
    {
      _id: "ORD123457",
      totalAmount: 3600,
      createdAt: "2024-05-19T15:45:00"
    },
    {
      _id: "ORD123458",
      totalAmount: 1800,
      createdAt: "2024-05-19T09:20:00"
    },
    {
      _id: "ORD123459",
      totalAmount: 4200,
      createdAt: "2024-05-18T14:15:00"
    },
    {
      _id: "ORD123460",
      totalAmount: 3100,
      createdAt: "2024-05-18T11:30:00"
    }
  ]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-body">
      <Navbara />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>
            <Activity className="inline-icon" size={28} />
            Admin Dashboard
          </h2>
          <div className="date-time">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>
              <X size={16} />
            </button>
          </div>
        )}

        <div className="dashboard-metrics">
          <div className="metric-card">
            <div className="metric-icon products">
              <Package size={20} />
            </div>
            <div className="metric-content">
              <h3>Total Products</h3>
              <p>{metrics.totalProducts}</p>
              <span className="metric-label">In Stock</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon alerts">
              <AlertCircle size={20} />
            </div>
            <div className="metric-content">
              <h3>Low Stock</h3>
              <p>{metrics.lowStockProducts}</p>
              <span className="metric-label">Items</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon orders">
              <ShoppingBag size={20} />
            </div>
            <div className="metric-content">
              <h3>Total Orders</h3>
              <p>{metrics.totalOrders}</p>
              <span className="metric-label">Orders Placed</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon revenue">
              <DollarSign size={20} />
            </div>
            <div className="metric-content">
              <h3>Total Revenue</h3>
              <p>{formatCurrency(metrics.totalRevenue)}</p>
              <span className="metric-label">All Time</span>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Recent Orders</h3>
              <Clock size={18} />
            </div>
            <div className="activities-list">
              {recentActivities.map((activity) => (
                <div key={activity._id} className="activity-item">
                  <div className="activity-content">
                    <p className="activity-title">
                      Order #{activity._id.slice(-6)}
                    </p>
                    <p className="activity-details">
                      Amount: {formatCurrency(activity.totalAmount)}
                    </p>
                  </div>
                  <span className="activity-date">
                    {formatDate(activity.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h3>Active Users</h3>
              <Users size={18} />
            </div>
            <div className="user-stats">
              <div className="stat-value">{metrics.activeUsers}</div>
              <p className="stat-label">Registered Users</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;