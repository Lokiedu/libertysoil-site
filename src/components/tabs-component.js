import React, { PropTypes, Component } from 'react';

import bem from '../utils/bemClassNames';


export default class TabsComponent extends Component {
  static displayName = 'TabsComponent';

  static propTypes = {
    tabs: PropTypes.array,
    activeIndex: PropTypes.number,
    onSelect: PropTypes.func
  };

  static defaultProps = {
    tabs: [],
    activeIndex: 0,
    onSelect: () => {}
  };

  toggleVisibility = () => {
    this.setState({isVisible: !this.state.isVisible});
  };

  render () {
    var { props, tabs, activeIndex, onSelect } = this.props;

    function tabsItem (item, i) {
      var cn = bem.makeClassName({
        block: 'tabs_component__item',
        modifiers: {
          active: i == activeIndex
        }
      });

      return <div className={cn} key={i} onClick={onSelect.bind(null, i)}>{item.title}</div>;
    }

    return (
      <div className="tabs_component" {...props}>
        <div className="tabs_component__body">
          {tabs.map(tabsItem)}
        </div>
      </div>
    );
  }
}
