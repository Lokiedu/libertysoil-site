import React from 'react';
import Helmet from 'react-helmet';
import Link from 'react-router/lib/Link';
import { connect } from 'react-redux';

import createSelector from '../selectors/createSelector';
import currentUserSelector from '../selectors/currentUser';

import { CONFIG, UNITS } from '../consts/ui-kit';
import { initUIKit, uiKit } from '../components/ui-kit/util/ui-kit';
import Unit from '../components/ui-kit/util/unit';

import { Page, PageMain, PageBody, PageContent } from '../components/page';
import Header from '../components/header';
import Sidebar from '../components/sidebar';
import SidebarAlt from '../components/sidebarAlt';
import UnitComponent from '../components/ui-kit/unit';

const findCommonStyleSheet = (() => {
  if (process.env.NODE_ENV === 'production') {
    return () => {
      var s;
      for (var i = 0, ss = document.styleSheets, l = ss.length; i < l; ++i) {
        s = ss[i];
        if (s.title === 'ls-styles') {
          return s;
        }
      }
      return undefined;
    };
  }

  return () => {
    var s;
    for (var ss = document.styleSheets, i = ss.length - 1; i >= 0; --i) {
      s = ss[i];
      if (s.cssRules && s.cssRules.length > 500 && s.href) {
        return s;
      }
    }
    return undefined;
  };
})();

export function findUIKitStyleSheet() {
  var s;
  for (var ss = document.styleSheets, i = ss.length - 1; i >= 0; --i) {
    s = ss[i];
    if (!s.href) {
      const id = s.ownerNode.attributes.id;
      if (id && id.value === 'ui-kit') {
        return s;
      }
    }
  }

  return undefined;
}

class UiKitPage extends React.Component {
  // fetch: create empty objects for non-existent units
  static async fetchData(router) {
    if (typeof window === 'undefined') {
      return 200;
    }

    if (!('UIKit' in window)) {
      initUIKit();
    }

    if (!router.params.url_name) {
      return 200;
    }

    const { url_name } = router.params;

    // requested module is already registered
    // it may be either user defined or default
    if (uiKit.units.isDefined(url_name)) {
      return 200;
    }

    const options = UNITS.find(u => u.url_name === url_name);

    // requested module isn't present in the list of units to display
    if (!options) {
      return 404;
    }

    try {
      const unit = await Unit.from({ ...options, __fs: uiKit.fs });
      console.log(unit);
      uiKit.units.set(options.url_name, unit);
    } catch (e) {
      console.log(e);
      return 404;
    }

    return 200;
  }

  constructor(...args) {
    super(...args);
    this.state = {
      style: null
    };
  }

  componentWillMount() {
  }

  componentDidMount() {
    if (process.env.NODE_ENV !== 'production') {
      setTimeout(() => this.toggleCommonStyleSheet(), 500);
    } else {
      this.toggleCommonStyleSheet();
    }

    this.UIKitStyleSheet = findUIKitStyleSheet();
    if (this.UIKitStyleSheet) {
      this.UIKitStyleSheet.disabled = false;
    }
  }

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  componentWillUnmount() {
    this.toggleCommonStyleSheet();

    if (this.UIKitStyleSheet) {
      this.UIKitStyleSheet.disabled = true;
    }
  }

  commonStyleSheet = undefined;
  UIKitStyleSheet = undefined;

  toggleCommonStyleSheet = () => {
    if (!this.commonStyleSheet) {
      this.commonStyleSheet = findCommonStyleSheet();
    }
    if (this.commonStyleSheet) {
      this.commonStyleSheet.disabled = !this.commonStyleSheet.disabled;
    }
  };

  render() {
    const { url_name } = this.props.params;

    // TODO: support user-defined units
    let activeUnit, title = 'UI Kit of ';
    if (url_name) {
      activeUnit = UNITS.find(u => u.url_name === url_name);

      if (!activeUnit) {
        title = 'Untitled - '.concat(title);
      } else {
        title = activeUnit.name.concat(' - ').concat(title);
      }
    }

    return (
      <div>
        <Helmet title={title} />
        <Header
          current_user={this.props.current_user}
          is_logged_in={this.props.is_logged_in}
        /> {/* Breadcrumbs with unit titles? (and sections) */}
        <Page>
          <PageMain>
            <PageBody>
              <Sidebar />
              <PageContent>
                {url_name && <UnitComponent entry={activeUnit} />}
              </PageContent>
              <SidebarAlt>
                {UNITS.map(u =>
                  <div className="aux-nav__item" key={u.url_name}>
                    <Link
                      activeClassName="aux-nav__link--active"
                      className="aux-nav__link"
                      to={'/kit/'.concat(u.url_name)}
                    >
                      {u.name}
                    </Link>
                  </div>
                )}
              </SidebarAlt>
            </PageBody>
          </PageMain>
        </Page>
      </div>
    );
  }
}

const mapStateToProps = createSelector(
  currentUserSelector,
  currentUser => ({ ...currentUser })
);

export default connect(mapStateToProps)(UiKitPage);
