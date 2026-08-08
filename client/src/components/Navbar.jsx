import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { 
  FaShoppingCart, 
  FaSearch, 
  FaSignOutAlt,
  FaUserCog,
  FaCog,
  FaBolt,
  FaTimes
} from "react-icons/fa";
import { useCart } from "../pages/CartContext";
import "./Navbar.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const { cartCount, user } = useCart();

  // Handle window resize to detect mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth");
    window.location.reload();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Prevent scrolling when menu is open
    if (!isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = 'auto';
  };

  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      closeMenu();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isProfileOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsHidden(currentScrollY > lastScrollY && currentScrollY > 100);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <>
      <nav className={`navbar ${isHidden ? "hidden" : ""}`}>
        <div className="nav-container">
          <div className="nav-left">
            <div className="logo">
              {isMobile ? (
                <FaBolt className="logo-icon" onClick={() => navigate('/')} />
              ) : (
                "Mithun Electricals"
              )}
            </div>
            
            {/* Desktop Navigation Links */}
            {!isMobile && (
              <div className="nav-links">
                <ul>
                  {[
                    { to: "/", text: "Home" },
                    { to: "/products", text: "Products" },
                    { to: "/contact", text: "Contact Us" },
                    ...(user?.role === "admin" ? [{ to: "/admin/dashboard", text: "Admin" }] : []),
                  ].map((item, index) => (
                    <li key={index}>
                      <Link to={item.to}>
                        {item.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Desktop Search Bar */}
          {!isMobile && (
            <div className="nav-center">
              <form className="search-container" onSubmit={handleSearch} ref={searchRef}>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-btn">
                  <FaSearch />
                </button>
              </form>
            </div>
          )}

          <div className="nav-right">
            <div className="nav-icons">
              {user && (
                <>
                  <Link to="/cart" className="icon-link cart-icon">
                    <FaShoppingCart className="nav-icon" />
                    <span className="icon-text">Cart</span>
                    {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                  </Link>
                </>
              )}

              {user ? (
                <div className="profile-icon" ref={profileRef}>
                  <FaCog
                    className="profile-icon-img"
                    onClick={toggleProfile}
                  />
                  <span className="icon-text"></span>
                  {isProfileOpen && (
                    <div className="profile-dropdown">
                      <div className="profile-details">
                        <h3>Account Settings</h3>
                        <p className="user-email">{user.email}</p>
                        <div className="profile-actions">
                          <Link to="/profile" className="profile-link" onClick={() => setIsProfileOpen(false)}>
                            <FaUserCog className="profile-action-icon" />
                            <span>Profile Settings</span>
                          </Link>
                          <button className="logout-btn" onClick={handleLogout}>
                            <FaSignOutAlt className="profile-action-icon" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="auth-link login-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Hamburger Menu */}
          {isMobile && (
            <div className="hamburger" onClick={toggleMenu}>
              <div className={`bar ${isMenuOpen ? "change" : ""}`}></div>
              <div className={`bar ${isMenuOpen ? "change" : ""}`}></div>
              <div className={`bar ${isMenuOpen ? "change" : ""}`}></div>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobile && (
        <div className={`mobile-menu-overlay ${isMenuOpen ? "active" : ""}`}>
          <div className="mobile-menu-content">
            <FaTimes className="mobile-menu-close" onClick={closeMenu} />
            <ul className="mobile-menu-links">
              {[
                { to: "/", text: "Home" },
                { to: "/products", text: "Products" },
                { to: "/contact", text: "Contact Us" },
                ...(user?.role === "admin" ? [{ to: "/admin/dashboard", text: "Admin" }] : []),
              ].map((item, index) => (
                <li key={index}>
                  <Link to={item.to} onClick={closeMenu}>
                    {item.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;