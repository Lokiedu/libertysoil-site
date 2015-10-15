import React, { Component } from 'react';
import ReactDOM from 'react-dom';

/**
* Decorator
* Call React component "onClickOutside" method on click outside DOM element event
* @param ComposedComponent
* @returns {*}
*/
export default (ComposedComponent) => {
  return class ClickOutsideComponentDecorator extends Component {
    static displayName = 'ProfileHeader'

    handleClickOutside = (e) => {
      var component = this.refs.root;
      var el = ReactDOM.findDOMNode(component);

      if (!el.contains(e.target)) {
        component.onClickOutside && component.onClickOutside(e);
      }
    }

    componentDidMount = () => {
      document.addEventListener('click', this.handleClickOutside);
    }

    componentWillUnmount = () => {
      document.removeEventListener('click', this.handleClickOutside);
    }

    render () {
      return <ComposedComponent ref="root" {...this.props} />;
    }
  }
}
