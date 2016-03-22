import React from 'react';

const Navigation = ({ children, className = '', ...props }) => (
  <div className={`navigation ${className}`} {...props}>
    {children}
  </div>
);

export default Navigation;
