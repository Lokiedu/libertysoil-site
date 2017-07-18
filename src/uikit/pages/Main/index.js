import React from 'react';
import PropTypes from 'prop-types';
import SideBar from '../../components/UikitSideBar';

const Main = ({ children }) => (
  <div className="uikit-main">
    <SideBar />
    <div className="uikit-app" >
      {children}
    </div>
  </div>
);

Main.fetchData = async (routerState, store, dataFetcher) => {
  await dataFetcher.provideListOfComponents();
};

Main.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Main;
