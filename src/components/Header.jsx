import React from 'react';

const Header = () => {
  return (
    <header className="app-header">
      <div className="container header-content">
        <a href="/" className="logo">
          <img 
            src="/logo.png" 
            alt="Logo" 
            style={{ height: '80px', width: 'auto' }} 
            onError={(e) => { e.target.style.display = 'none'; }} 
          />
        </a>
      </div>
    </header>
  );
};

export default Header;
