import { useState, useEffect } from "react";
import axios from "axios";
import "./Contact.css";
import Footer from "../components/Footer";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "", phone: "" });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    if (!formData.message.trim()) errors.message = "Message is required";
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = "Please enter a valid 10-digit phone number";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors({...formErrors, [name]: null});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await axios.post("https://mithun-electricals.onrender.com/api/contact", formData);
      setSuccess("Thank you! Your message has been sent successfully.");
      setFormData({ name: "", email: "", message: "", phone: "" });
      setError(null);
      setFormErrors({});
      
      // Scroll to success message
      const formElement = document.querySelector('.contact-form');
      if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
      
      // Clear success message after 5s
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send message. Please try again.");
      setSuccess(null);
      
      // Clear error message after 5s
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-body">
      <div className="contact">
        {/* Hero Section */}
        <section className="contact-hero">
          <div className="contact-hero-content">
            <h1>Get In Touch</h1>
            <p>We'd love to hear from you. Drop us a message and we'll respond as soon as possible.</p>
          </div>
        </section>

        {/* Contact Content */}
        <section className="contact-content">
          {/* Contact Form */}
          <div className="contact-form">
            <h2>Send Us a Message</h2>
            {error && <div className="form-error"><span className="error-icon">❌</span>{error}</div>}
            {success && <div className="form-success"><span className="success-icon">✅</span>{success}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  className={formErrors.name ? "input-error" : ""}
                />
                {formErrors.name && <span className="error-message">{formErrors.name}</span>}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Your email address"
                    value={formData.email}
                    onChange={handleChange}
                    className={formErrors.email ? "input-error" : ""}
                  />
                  {formErrors.email && <span className="error-message">{formErrors.email}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Phone (Optional)</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="Your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    className={formErrors.phone ? "input-error" : ""}
                  />
                  {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  placeholder="How can we help you?"
                  value={formData.message}
                  onChange={handleChange}
                  className={formErrors.message ? "input-error" : ""}
                ></textarea>
                {formErrors.message && <span className="error-message">{formErrors.message}</span>}
              </div>
              
              <button 
                type="submit" 
                className={`btn-primary ${loading ? 'btn-loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Company Details */}
          <div className="company-details">
            <h2>Mithun Electricals</h2>
            <p className="company-tagline">Quality Electrical Products & Services since 2010</p>
            
            <div className="details">
              <div className="detail-item">
                <span className="icon">👤</span>
                <div>
                  <h3>Owner</h3>
                  <p>Prabakaran</p>
                </div>
              </div>
              
              <div className="detail-item">
                <span className="icon">📍</span>
                <div>
                  <h3>Location</h3>
                  <p>150 Sathy Road, Kavindapadi, Erode</p>
                  <p className="detail-subtitle">Tamil Nadu, India - 638455</p>
                </div>
              </div>
              
              <div className="detail-item">
                <span className="icon">📞</span>
                <div>
                  <h3>Phone</h3>
                  <p><a href="tel:+919942314140">+91 9942314140</a></p>
                </div>
              </div>
              
              <div className="detail-item">
                <span className="icon">✉️</span>
                <div>
                  <h3>Email</h3>
                  <p><a href="mailto:mithunelectricals@gmail.com">mithunelectricals@gmail.com</a></p>
                </div>
              </div>
              
              <div className="detail-item">
                <span className="icon">🕒</span>
                <div>
                  <h3>Business Hours</h3>
                  <p>Monday - Saturday: 9:00 AM - 7:00 PM</p>
                  <p className="detail-subtitle">Sunday: Closed</p>
                </div>
              </div>
            </div>
            
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Facebook">
                <span className="social-icon">📱</span>
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <span className="social-icon">📷</span>
              </a>
              <a href="#" className="social-link" aria-label="WhatsApp">
                <span className="social-icon">💬</span>
              </a>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="map-section">
          <div className="map-content">
            <h2>Visit Our Store</h2>
            <p>Come and explore our extensive range of quality electrical products</p>
          </div>
          
          <div className="map">
            <iframe
              title="Mithun Electricals Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3910.6997799760125!2d77.5379543!3d11.429322899999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba9152998f1c8c3%3A0xa496e13d1d721c54!2sMithun%20Electricals!5e0!3m2!1sen!2sin!4v1739590636244!5m2!1sen!2sin"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default Contact;