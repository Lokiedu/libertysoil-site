/*
 This file is a part of libertysoil.org website
 Copyright (C) 2016  Loki Education (Social Enterprise)

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
import { connect } from 'react-redux';

import createSelector from '../../selectors/createSelector';
import Intercom from './unwrapped';

const inputSelector = createSelector(
  state => state.getIn(['current_user', 'id']),
  state => state.get('users'),
  (currentUserId, users) => {
    const props = { last_request_at: true, new_session: true };

    if (currentUserId) {
      const user = users.get(currentUserId);
      props.signed_up_at = parseInt(new Date(user.get('created_at')).getTime() / 1000);
      props.updated_at = parseInt(new Date(user.get('updated_at')).getTime() / 1000);
      props.user_id = user.get('id');
      props.preudonym = user.get('username');
      props.name = user.get('fullName');
      if (props.name === ' ') {
        props.name = props.preudonym;
      }

      const avatar = user.getIn(['more', 'avatar']);
      if (avatar && avatar.get('url')) {
        props.avatar = { type: 'avatar', image_url: avatar.get('url') };
      }
    }

    return props;
  }
);

const outputSelector = () => ({});

export default connect(inputSelector, outputSelector)(Intercom);
