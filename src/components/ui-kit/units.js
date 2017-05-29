import React from 'react';
import Link from 'react-router/lib/Link';

import { UNITS } from '../../consts/ui-kit';

export default class Units extends React.Component {
  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  render() {
    return (
      <div className="layout">
        {UNITS.map(u =>
          <Link
            activeClassName=""
            className=""
            key={u.url_name}
            to={'/kit/'.concat(u.url_name)}
          >
            {u.name}
          </Link>
        )}
      </div>
    );
  }
}
