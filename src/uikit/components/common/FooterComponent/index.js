import React from 'react';

import Footer from '../../../../components/footer';

export const propsList = {};

const style = {
  display: 'table',
  marginBottom: '50px',
  width: '100%'
};

const FooterComponent = () => (
  <div style={style} className="component_holder clearfix">
    <Footer />
  </div>
);

export default FooterComponent;
