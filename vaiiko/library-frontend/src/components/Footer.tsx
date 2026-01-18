import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <p>&copy; 2026 LMS – SYSTÉM NA SPRÁVU ONLINE KNIŽNICE</p>
        </div>
        <div className="footer-right">
          <p>Online knižnica pre čítanie</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;