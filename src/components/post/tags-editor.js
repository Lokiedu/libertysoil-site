import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import SchoolSelect from './school-select';

export default class TagsEditor extends Component {
  static displayName = 'TagsEditor';

  static propTypes = {
    autocompleteSchools: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    })),
    autocompleteTags: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    })),
    school: PropTypes.string,
    schools: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    })),
    tag: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    }))
  };

  static defaultProps = {
    tag: '',
    school: '',
    tagMinSize: 3,
    tagMaxSize: 128,
    tagsMaxCount: 42,
    tags: [],
    schools: [],
    autocompleteTags: [],
    autocompleteSchools: []
  };

  constructor (props) {
    super(props);

    this.state = {
      tags: props.tags,
      schools: props.schools,
      tag: props.tag,
      school: props.school
    };
  }

  componentWillReceiveProps (props) {
    this.state = {
      tags: props.tags,
      schools: props.schools,
      tag: props.tag,
      school: props.school
    };
  }

  updateTag = () => {
    var tag = this.refs.newTag.value || '';

    this.setState({
      tag
    });
  };

  updateSchool = (e) => {
    let school = e.target.value || '';

    this.setState({
      school
    });
  };

  handleKeyPress = (e) => {
    if (e.keyCode == 13) { // Enter
      e && e.preventDefault();
      this.addTag();
    }
  };

  addTag = (e) => {
    var name = this.state.tag || '';

    e && e.preventDefault();

    if (
      this.state.tags.length >= this.props.tagsMaxCount
      || name.length < this.props.tagMinSize
      || _.find(this.state.tags, { name })
    ) {
      return;
    }

    this.state.tags.unshift({
      name
      //type: this.refs.type.value
    });
    this.onTagsUpdate(this.state.tags);

    this.setState({
      tags: this.state.tags,
      tag: ''
    });
  };

  addSchool = () => {
    let name = this.state.school || '';
    let schools = this.state.schools;

    if (
      schools.length >= this.props.tagsMaxCount
      || name.length === 0
      || _.find(schools, { name })
    ) {
      return;
    }

    schools.unshift({
      name
    });

    this.setState({
      schools: schools,
      school: ''
    });
  };

  onTagsUpdate (tags) {
    this.props.onUpdate && this.props.onUpdate(tags);
  }

  removeTag = (tag) => {
    var tags = this.state.tags;

    tags.splice(tags.indexOf(tag), 1);

    this.setState({
      tags: tags
    });
  };

  removeSchool = (school) => {
    var schools = this.state.schools;

    schools.splice(schools.indexOf(school), 1);

    this.onTagsUpdate(schools);
    this.setState({
      schools: schools
    });
  };

  getTags() {
    return this.state.tags.map(tag => tag.name.trim());
  }

  getSchools() {
    return this.state.schools.map(school => school.name.trim());
  }

  render () {
    var props = this.props;
    var state = this.state;

    var newTagCreationIsDisabled = (state.tags.length >= props.tagsMaxCount);

    return (
      <div>
        <div className="layout__row">
          <div className="layout layout-vertical layout__row layout__row-micro_spacing">
            <input
              id="newTag"
              ref="newTag"
              placeholder="New tag"
              disabled={newTagCreationIsDisabled}
              value={state.tag}
              onChange={this.updateTag}
              onKeyDown={this.handleKeyPress}
              className="input"
              list="autocompleteTags" />
            <button
              disabled={newTagCreationIsDisabled}
              onClick={this.addTag}
              className="button button-form layout__space_left">Add</button>
            <datalist id="autocompleteTags">
              {props.autocompleteTags.map((tag, i) =>
                <option value={tag} key={i} />
              )}
            </datalist>
          </div>
          <div className="layout layout-vertical layout__row layout__row-micro_spacing">
            <div className="layout__grid_item layout__grid_item-wide">
              <SchoolSelect
                  schools={this.props.autocompleteSchools}
                  onChange={this.updateSchool}
                  value={this.state.school} />
            </div>
            <button
              type="button"
              disabled={newTagCreationIsDisabled}
              onClick={this.addSchool}
              className="button layout__grid_item button-form">Add</button>
          </div>
        </div>
        <div className="layout__row">
          <div className="layout layout__grid layout__grid-small">
            {state.schools.map((school, i) =>
              <span
                className="tag action school"
                title="Remove tag"
                onClick={this.removeSchool.bind(null, school)}
                key={i}>
                {school.name}
                <i className="micon micon-micro micon-left_space">close</i>
              </span>
            )}

            {state.tags.map((tag, i) =>
              <span
                className="tag action"
                title="Remove tag"
                onClick={this.removeTag.bind(null, tag)}
                key={i}>
                {tag.name}
                <i className="micon micon-micro micon-left_space">close</i>
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
}
