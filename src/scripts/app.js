import React from 'react'
import ReactDOM from 'react-dom'
import {createHistory} from 'history'
import {Router} from 'react-router';

import routing from '../routing'
import { initState } from '../store'

initState(window.state);

let history = createHistory();

ReactDOM.render(
  <Router history={history}>
    {routing}
  </Router>,
  document.getElementById('content')
);
