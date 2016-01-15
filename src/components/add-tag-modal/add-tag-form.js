import React, { PropTypes, Component } from 'react';

import AddGeotagForm from './add-geotag-form';
import AddHashtagForm from './add-hashtag-form';
import AddSchoolForm from './add-school-form';
import { TAG_HASHTAG, TAG_LOCATION, TAG_SCHOOL, IMPLEMENTED_TAGS } from '../../consts/tags';


export default class AddTagForm extends Component {
  static displayName = 'AddTagForm';

  static propTypes = {
    addedTags: PropTypes.shape({
      geotags: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string
      })),
      schools: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string
      })),
      tags: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string
      }))
    }),
    allSchools: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    })),
    onAddGeotag: PropTypes.func.isRequired,
    onAddHashtag: PropTypes.func.isRequired,
    onAddSchool: PropTypes.func.isRequired,
    type: PropTypes.oneOf(IMPLEMENTED_TAGS).isRequired
  };

  render() {
    let {
      addedTags: { geotags, schools, tags },
      allSchools,
      onAddGeotag,
      onAddHashtag,
      onAddSchool,
      type
    } = this.props;

    switch (type) {
      case TAG_LOCATION:
        return <AddGeotagForm addedGeotags={geotags} onAddGeotag={onAddGeotag} />;
      case TAG_HASHTAG:
        return <AddHashtagForm addedHashtags={tags} onAddHashtag={onAddHashtag} />;
      case TAG_SCHOOL:
        return <AddSchoolForm addedSchools={schools} allSchools={allSchools} onAddSchool={onAddSchool} />;
    }
  }
}
