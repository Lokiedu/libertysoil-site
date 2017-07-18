import React, { Component } from 'react';
import { arrayOf, string, bool, object } from 'prop-types';
import { connect } from 'react-redux';
import cx from 'classnames';
import { Link } from 'react-router';

import { listofScreens as screenList } from '../ScreenList';
import * as listOfComponents from '../common/index';


const componentsToObj = Object.keys(listOfComponents).reduce((r, e) => ({ ...r, [e]: !0 }), {});

export const links = {
  fullPage: {
    title: 'Full Page',
    to: 'full-pages/',
  },
  component: {
    title: 'Components',
    to: 'components/',
  }
};

const ComponentListItem = ({ name, to, disabled }) => {
  const className = cx('components__link', { disabled });
  return (
    <div className="uikit-nav__item-wrap" >
      <Link to={`${to}${name}`} activeClassName="active" className={className}>
        <span>{name}</span>
      </Link>
    </div>
  );
};

ComponentListItem.propTypes = {
  disabled: bool,
  name: string,
  to: string,
};

const ComponentsNameList = ({ type, list, componentsObj }) => (
  <ul className="uikit-nav__components">
    <li>
      <h2 className="uikit-nav__features-header">
        <Link to={links[type].to} activeClassName="active" className="components__link">
          {links[type].title}
        </Link>
      </h2>
    </li>
    {[...list].map((el, i) => (
      <li key={i}>
        <ComponentListItem name={el} to={links[type].to} disabled={componentsObj && !componentsObj[el]} />
      </li>
    ))}
  </ul>
);

ComponentsNameList.propTypes = {
  componentsObj: object, // eslint-disable-line
  list: arrayOf(string),
  type: string,
};

class SideBar extends Component {
  static propTypes = {
    list: arrayOf(string),
    listofScreens: arrayOf(string),
    componentsObj: object, // eslint-disable-line
  };

  state = {};

  render() {
    const { list, listofScreens, componentsObj } = this.props;
    return (
      <div className="hp-sidebar">
        <div className="uikit-nav__container" >
          <div className="uikit-nav__panel">
            <div className="uikit-nav__title">
              logo
            </div>
            <div className="uikit-nav__contents">
              <ComponentsNameList type="fullPage" list={listofScreens} />
              <ComponentsNameList type="component" list={list} componentsObj={componentsObj} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function select(state) {
  const immutableList = state.getIn(['components', 'list']);
  const rawList = immutableList ? immutableList.toArray() : [];
  const listActive = rawList.filter((el) => componentsToObj[el]);
  const listNoActive = rawList.filter((el) => !componentsToObj[el]);
  return { list: [...listActive, ...listNoActive], listofScreens: screenList, componentsObj: componentsToObj };
}

export default connect(select)(SideBar);
