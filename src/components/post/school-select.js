import React, { Component, PropTypes } from 'react';

export default class SchoolSelect extends Component {
  static propTypes = {
    schools: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    }))
  };

  static defaultProps = {
    schools: []
  };

  render() {
    return (
      <select className="input" name="school" defaultValue="" {...this.props}>
        <option disabled value="">Select school...</option>
        {this._renderOptions()}
      </select>
    );
  }

  _renderOptions() {
    return this.props.schools.map((school, i) => {
      return <option value={school.name} key={i}>{school.name}</option>;
    });
  }
}