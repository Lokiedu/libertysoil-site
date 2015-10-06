/*
 This file is a part of libertysoil.org website
 Copyright (C) 2015  Loki Education (Social Enterprise)

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
import React from 'react';

import bem from '../../utils/bemClassNames';
import Comments from './comments';
import PostFooter from './footer';

let PostWrapper = (props) => {
  let cardClassName = bem.makeClassName({
    block: 'card',
    modifiers: {
      full: props.showComments
    }
  });

  return (
    <section className={cardClassName}>
      <div className="card__content">
        {props.children}
      </div>

      <PostFooter author={props.author} current_user={props.current_user} post={props.post}/>

      {props.showComments && <Comments post={props.post}/>}
    </section>
  );
};

export default PostWrapper;
