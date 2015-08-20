import React from 'react';
import ReactDOM from 'react-dom'
import {Router, Route, Link} from 'react-router';
import {history} from 'react-router/lib/BrowserHistory';

class App extends React.Component {
  render() {
    return (
      <div>
        <p>Hello, world!</p>
        {this.props.children}
      </div>
    )
  }
}

class Index extends React.Component {
  render() {
    return (
      <div>
        <p>This is an index</p>
      </div>
    )
  }
}

ReactDOM.render(
  <Router history={history}>
    <Route component={App}>
      <Route component={Index} name="index" path="/" />
    </Route>
  </Router>,
  document.getElementById('content')
);
