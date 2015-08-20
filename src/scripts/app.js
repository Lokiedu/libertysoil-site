import ReactDOM from 'react-dom'
import {history} from 'react-router/lib/BrowserHistory';
import {Router} from 'react-router';

import routing from '../routing'

ReactDOM.render(
  <Router history={history}>
    {routing()}
  </Router>,
  document.getElementById('content')
);
