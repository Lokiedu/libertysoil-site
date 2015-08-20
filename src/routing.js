import {Router, Route} from 'react-router';
import {history} from 'react-router/lib/BrowserHistory';

import App from '../components/app'
import Index from '../components/index'

let routes = (
  <Router history={history}>
    <Route component={App}>
      <Route component={Index} name="index" path="/" />
    </Route>
  </Router>
);

export default routes;
