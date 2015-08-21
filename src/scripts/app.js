import React from 'react'
import ReactDOM from 'react-dom'
import {history} from 'react-router/lib/BrowserHistory';
import {Router} from 'react-router';

import routing from '../routing'
import { initState } from '../store'

initState(window.state);

ReactDOM.render(
  <Router history={history}>
    {routing}
  </Router>,
  document.getElementById('content')
);
