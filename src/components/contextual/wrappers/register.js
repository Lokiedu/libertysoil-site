/*
 This file is a part of libertysoil.org website
 Copyright (C) 2017  Loki Education (Social Enterprise)

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

import createSelector from '../../../selectors/createSelector';
import wrapWithTransition from '../../../utils/transition';
import { v2 as Register } from '../../register';

const mapStateToProps = createSelector(
  state => state.getIn(['current_user', 'id']),
  is_logged_in => ({ is_logged_in })
);

export default wrapWithTransition(
  connect(mapStateToProps, null, null, { withRef: true })(Register)
);
