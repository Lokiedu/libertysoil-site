import React from 'react';
import PropTypes from 'prop-types';

const App = ({ children }) => (
  <div className="uikit-wrap">
    {children}
  </div>
);

App.propTypes = {
  children: PropTypes.node.isRequired,
};

export default App;
