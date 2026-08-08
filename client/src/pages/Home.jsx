import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { FaShoppingCart, FaTools, FaPhoneAlt, FaAward, FaUsers, FaBoxOpen, FaStore, FaCalendarCheck } from "react-icons/fa";
import "./Home.css";
import Footer from "../components/Footer";

const Home = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState({});
  const sectionsRef = useRef({});
  
  const companyStats = [
    { icon: <FaUsers />, count: "1000+", label: "Happy Customers" },
    { icon: <FaBoxOpen />, count: "5000+", label: "Products Available" },
    { icon: <FaStore />, count: "15+", label: "Years Experience" },
    { icon: <FaCalendarCheck />, count: "24/7", label: "Customer Support" }
  ];
  
  const testimonials = [
    {
      name: "Ramesh Kumar",
      role: "Residential Contractor",
      message: "Mithun Electricals has been my go-to supplier for all electrical components. Their inventory management system makes ordering a breeze."
    },
    {
      name: "Priya Singh",
      role: "Commercial Project Manager",
      message: "The quality of products and technical expertise at Mithun Electricals has helped us complete numerous high-profile projects on time."
    },
    {
      name: "Vijay Sharma",
      role: "Home Renovator",
      message: "As a DIY enthusiast, I appreciate the range of products and helpful staff at Mithun Electricals. They've guided me through several home projects."
    }
  ];
  
  const brands = [
    "Havells", "Crompton", "Philips", "Legrand", "Schneider Electric", "ABB", "Bajaj", "Anchor"
  ];
  
  const handleExploreInventory = () => {
    navigate("/products");
  };

  const handleContactUs = () => {
    navigate("/contact");
  };

  const handleLearnMore = () => {
    navigate("/about");
  };
  
  // Intersection Observer for animation
  useEffect(() => {
    const observers = {};
    const sections = document.querySelectorAll('.animate-on-scroll');
    
    sections.forEach((section, index) => {
      sectionsRef.current[index] = section;
      
      observers[index] = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(prev => ({ ...prev, [index]: true }));
        }
      }, { threshold: 0.2 });
      
      observers[index].observe(section);
    });
    
    return () => {
      Object.values(observers).forEach(observer => {
        observer.disconnect();
      });
    };
  }, []);

  return (
    <div className="home-body">
      <div className="home">
        {/* Hero Section with Video Background */}
        <section className="hero">
          <div className="video-background">
            <video autoPlay muted loop className="hero-video">
              <source src="/assets/bgvideo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="video-overlay"></div>
          </div>
          
          <div className="hero-content">
            <h1>Mithun Electricals</h1>
            <p className="hero-tagline">Powering Your Electrical Needs Since 2008</p>
            <p className="hero-description">Your trusted partner for quality electrical supplies, equipment, and solutions</p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={handleExploreInventory}>
                <FaShoppingCart /> Shop Now
              </button>
              <button className="btn-secondary" onClick={handleContactUs}>
                <FaPhoneAlt /> Contact Us
              </button>
            </div>
          </div>
          
          {/* Hero Shapes */}
          <div className="hero-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-4"></div>
            <div className="shape shape-5"></div>
          </div>
        </section>

        {/* Company Stats Section */}
        <section className="company-stats animate-on-scroll" ref={el => sectionsRef.current[0] = el}>
          <div className={`stats-container ${isVisible[0] ? 'visible' : ''}`}>
            {companyStats.map((stat, index) => (
              <div className="stat-card" key={index}>
                <div className="stat-icon">{stat.icon}</div>
                <h3 className="stat-count">{stat.count}</h3>
                <p className="stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="features animate-on-scroll" ref={el => sectionsRef.current[1] = el}>
          <h2 className={isVisible[1] ? 'visible' : ''}>Why Choose Mithun Electricals?</h2>
          <div className={`feature-cards ${isVisible[1] ? 'visible' : ''}`}>
            <div className="card">
              <span className="icon">⚡</span>
              <h3>Premium Quality Products</h3>
              <p>We offer high-quality electrical components from trusted brands, ensuring safety and reliability for all your projects.</p>
            </div>
            <div className="card">
              <span className="icon">📦</span>
              <h3>Extensive Inventory</h3>
              <p>With over 5,000 products in stock, we have everything from basic wiring supplies to specialized equipment for any project.</p>
            </div>
            <div className="card">
              <span className="icon">🛠️</span>
              <h3>Expert Technical Support</h3>
              <p>Our team of qualified electricians provides technical guidance to help you choose the right products for your needs.</p>
            </div>
          </div>
        </section>

        {/* Popular Categories */}
        <section className="categories animate-on-scroll" ref={el => sectionsRef.current[2] = el}>
          <h2 className={isVisible[2] ? 'visible' : ''}>Popular Categories</h2>
          <div className={`category-grid ${isVisible[2] ? 'visible' : ''}`}>
            <div className="category-card" onClick={() => navigate('/products?category=wiring')}>
              <div className="category-image wiring-img"></div>
              <h3>Wiring & Cables</h3>
            </div>
            <div className="category-card" onClick={() => navigate('/products?category=lighting')}>
              <div className="category-image lighting-img"></div>
              <h3>Lighting Solutions</h3>
            </div>
            <div className="category-card" onClick={() => navigate('/products?category=switches')}>
              <div className="category-image switches-img"></div>
              <h3>Switches & Sockets</h3>
            </div>
            <div className="category-card" onClick={() => navigate('/products?category=protection')}>
              <div className="category-image protection-img"></div>
              <h3>Circuit Protection</h3>
            </div>
          </div>
          <button className="view-all-btn" onClick={handleExploreInventory}>
            View All Categories <span className="arrow">→</span>
          </button>
        </section>

        {/* About Section with Mission */}
        <section className="about animate-on-scroll" ref={el => sectionsRef.current[3] = el}>
          <div className={`about-content ${isVisible[3] ? 'visible' : ''}`}>
            <h2>About Mithun Electricals</h2>
            <p className="about-intro">
              Established in 2008, Mithun Electricals has grown to become a leading provider of electrical solutions in the region, serving both residential and commercial clients with a commitment to quality and excellence.
            </p>
            
            <div className="mission-vision">
              <div className="mission-box">
                <h3><FaAward /> Our Mission</h3>
                <p>To provide high-quality electrical products and exceptional service that empower our customers to create safe, efficient, and innovative electrical systems.</p>
              </div>
              <div className="mission-box">
                <h3><FaTools /> Our Expertise</h3>
                <p>With a team of experienced professionals and partnerships with leading manufacturers, we bring technical expertise and quality assurance to every product we offer.</p>
              </div>
            </div>
            
            
          </div>
          
          {/* About Shapes */}
          <div className="about-shapes">
            <div className="shape shape-3"></div>
            <div className="shape shape-6"></div>
            <div className="shape shape-7"></div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="testimonials animate-on-scroll" ref={el => sectionsRef.current[4] = el}>
          <h2 className={isVisible[4] ? 'visible' : ''}>What Our Customers Say</h2>
          <div className={`testimonial-container ${isVisible[4] ? 'visible' : ''}`}>
            {testimonials.map((testimonial, index) => (
              <div className="testimonial-card" key={index}>
                <div className="quote-icon">"</div>
                <p className="testimonial-text">{testimonial.message}</p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="author-info">
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Brands We Carry */}
        <section className="brands animate-on-scroll" ref={el => sectionsRef.current[5] = el}>
          <h2 className={isVisible[5] ? 'visible' : ''}>Trusted Brands We Carry</h2>
          <div className={`brand-logos ${isVisible[5] ? 'visible' : ''}`}>
            {brands.map((brand, index) => (
              <div className="brand-item" key={index}>
                {brand}
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section animate-on-scroll" ref={el => sectionsRef.current[6] = el}>
          <div className={`cta-container ${isVisible[6] ? 'visible' : ''}`}>
            <h2>Ready to Start Your Electrical Project?</h2>
            <p>Browse our extensive catalog or contact our team for personalized assistance.</p>
            <div className="cta-buttons">
              <button className="btn-primary" onClick={handleExploreInventory}>
                Shop Products
              </button>
              <button className="btn-secondary" onClick={handleContactUs}>
                Request Quote
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default Home;