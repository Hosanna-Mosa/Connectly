import React from "react";
import { useState } from "react";
import "../utils/LandingPage.css";
import { Link } from "react-router-dom";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
export const LandingPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="landingContainer">
      <nav className="navbar">
        <div className="navHeader">Connectly</div>
        <div className="menu-toggle" onClick={toggleMenu}>
         {menuOpen?<CloseIcon/>:<MenuIcon></MenuIcon>} 
        </div>
        <div className={`navList ${menuOpen ? "active" : ""}`}>
          <Link to="/home" className="link-btn">
            <p>Join as Guest</p>
          </Link>
          <Link to="/auth" className="link-btn">
            <p>Register</p>
          </Link>
          <div role="button">
            <Link to="/auth" className="link-btn">
              <p>Login</p>
            </Link>
          </div>
        </div>
      </nav>

      <div className="landingMainContainer">
        <div>
          <h1>
            <span style={{ color: "#ff9839" }}>Connect</span> with your loved
            ones
          </h1>

          <p>
            Cover a distance by{" "}
            <span style={{ fontWeight: "bold" }}>Connectly</span>
          </p>
          <div role="button" className="startBtn">
            <Link to="/auth" className="link-btn">
              Get Started
            </Link>
          </div>
        </div>
        <div className="landingImage" >
          <img className="mobile-png" src="/public/mobile.png" alt="" />
        </div>
      </div>
    </div>
  );
};
