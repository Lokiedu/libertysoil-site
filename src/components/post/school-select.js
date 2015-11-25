import React from 'react';

export default class SchoolSelect extends React.Component {
  static propTypes = {
    schools: React.PropTypes.array
  };

  static defaultProps = {
    schools: []
  };

  render() {
    return (
      <select name="school" className="input" defaultValue="" {...this.props}>
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