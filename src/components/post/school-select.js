import React, { Component, PropTypes } from 'react';

export default class SchoolSelect extends Component {
  static displayName = 'SchoolSelect';
  static propTypes = {
    schools: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    }))
  };

  static defaultProps = {
    schools: []
  };

  _renderOptions() {
    let schools = this.props.schools.sort((a, b) => a.name.localeCompare(b.name));

    return schools.map((school, i) => {
      return <option key={i} value={school.name}>{school.name}</option>;
    });
  }

  render() {
    return (
      <select className="input input-select input-block" defaultValue="" name="school" {...this.props}>
        <option disabled key="-1" value="">Select school...</option>
        {this._renderOptions()}
      </select>
    );
  }
}
