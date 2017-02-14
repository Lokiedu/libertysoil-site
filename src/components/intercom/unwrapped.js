import { Component, PropTypes } from 'react';

const canUseDOM = !!(
  (typeof window !== 'undefined' &&
  window.document && window.document.createElement)
);

export const IntercomAPI = (...args) => {
  if (canUseDOM && window.Intercom) {
    window.Intercom.apply(null, args);
  } else {
    console.warn('Intercom not initialized yet'); // eslint-disable-line no-console
  }
};

export default class Intercom extends Component {
  static displayName = 'Intercom';

  static propTypes = {
    app_id: PropTypes.string,
    created_at: PropTypes.number,
    name: PropTypes.string,
    username: PropTypes.string
  };

  componentDidMount() {
    const { app_id, ...otherProps } = this.props;
    if (!app_id || !canUseDOM) {
      return;
    }

    if (!window.Intercom) {
      (function (w, d, id, s, x) {
        function i() {
          i.c(arguments);
        }
        i.q = [];
        i.c = function (args) {
          i.q.push(args);
        };
        w.Intercom = i;
        s = d.createElement('script');
        s.async = 1;
        s.src = 'https://widget.intercom.io/widget/'.concat(id);
        x = d.getElementsByTagName('script')[0];
        x.parentNode.insertBefore(s, x);
      })(window, document, app_id);
    }

    window.intercomSettings = { ...otherProps, app_id };

    if (window.Intercom) {
      window.Intercom('boot', this.props);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!canUseDOM || !window.Intercom) {
      return;
    }

    window.intercomSettings = nextProps;
    window.Intercom('update', nextProps);
  }

  shouldComponentUpdate() {
    return false;
  }

  componentWillUnmount() {
    if (!canUseDOM || !window.Intercom) {
      return;
    }

    window.Intercom('shutdown');
    delete window.Intercom;
  }

  render() {
    return false;
  }
}
