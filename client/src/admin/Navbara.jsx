import { Link } from "react-router-dom";
import { Package, Activity, Settings, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import "./Navbara.css";

const Navbara = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbara" aria-label="Main navigation">
      <div className="navbara-header">
        <div className="navbara-brand">
          <Package size={24} aria-hidden="true" />
          <span>Admin Panel</span>
        </div>
        <button
          className="navbara-toggle"
          onClick={toggleMenu}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </div>

      <div className={`navbara-menu ${isOpen ? "open" : ""}`}>
        <div className="navbara-links">
          <Link
            to="/admin/dashboard"
            className="navbara-link"
            onClick={toggleMenu}
            aria-current={window.location.pathname === "/admin/dashboard" ? "page" : undefined}
          >
            <Activity size={18} aria-hidden="true" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/admin/inventory"
            className="navbara-link"
            onClick={toggleMenu}
            aria-current={window.location.pathname === "/admin/inventory" ? "page" : undefined}
          >
            <Package size={18} aria-hidden="true" />
            <span>Inventory</span>
          </Link>
        </div>

        <div className="navbara-footer">
          <Link
            to="/admin/settings"
            className="navbara-link"
            onClick={toggleMenu}
            aria-current={window.location.pathname === "/admin/settings" ? "page" : undefined}
          >
            <Settings size={18} aria-hidden="true" />
            <span>Settings</span>
          </Link>
          <Link
            to="/"
            className="navbara-link"
            onClick={toggleMenu}
            aria-current={window.location.pathname === "/" ? "page" : undefined}
          >
            <LogOut size={18} aria-hidden="true" />
            <span>Logout</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbara;