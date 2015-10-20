import React, { Component } from 'react';
import _ from 'lodash';

export default class TagsEditor extends Component {
    static defaultProps = {
        tag: '',
        tagMinSize: 3,
        tagMaxSize: 128,
        tagsMaxCount: 42,
        tags: [],
        autocompleteTags: []
    };

    constructor (props) {
        super(props);

        this.state = {
            tags: props.tags,
            autocompleteTags: props.autocompleteTags,
            tag: props.tag
        };
    }

    componentWillReceiveProps (props) {
        this.state = {
            tags: props.tags,
            autocompleteTags: props.autocompleteTags,
            tag: props.tag
        };
    }

    updateTag = () => {
        var tag = (this.refs.newTag.value || '').trim();

        this.setState({
            tag
        });
    };

    handleKeyPress = (e) => {
        if (e.keyCode == 13) { // Enter
            e && e.preventDefault();
            this.addTag();
        }
    };

    addTag = (e) => {
        var title = this.state.tag || '';

        e && e.preventDefault();

        if (this.state.tags.length >= this.props.tagsMaxCount || _.find(this.state.tags, { title })) {
            return;
        }

        this.state.tags.unshift({
          title
          //type: this.refs.type.value
        });
        this.onTagsUpdate(this.state.tags);

        this.setState({
            tags: this.state.tags,
            type: 'school',
            tag: ''
        });
    };

    onTagsUpdate (tags) {
        this.props.onUpdate && this.props.onUpdate(tags);
    }

    removeTag = (tag) => {
        var tags = this.state.tags;

        tags.splice(tags.indexOf(tag), 1);

        this.onTagsUpdate(tags);
        this.setState({
            tags: tags
        });
    };

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
                {false && <select
                  ref="type"
                  className="input layout__space_left"
                  name="type">
                  <option value="school">School</option>
                  <option value="location">Location</option>
                </select>}
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
            </div>
            <div className="layout__row">
              <div className="layout layout__grid layout__grid-small">
                {state.tags.map((tag, i) =>
                  <span
                    className="tag action"
                    title="Remove tag"
                    onClick={this.removeTag.bind(null, tag)}
                    key={i}>
                    {tag.title}
                    <i className="micon micon-micro micon-left_space">close</i>
                  </span>
                )}
              </div>
            </div>
          </div>
          );
    }
};
