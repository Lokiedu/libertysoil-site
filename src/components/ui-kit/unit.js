import React from 'react';
import isEqual from 'lodash/isEqual';
import debounce from 'lodash/debounce';
import Markdown from 'react-markdown';

import { uiKit } from './util/ui-kit';
import { JSXEditor, LessEditor, Preview } from './playground';

export default class UnitComponent extends React.Component {
  constructor(props, ...args) {
    super(props, ...args);

    this.state = { docs: {}, jsx: '', isReady: false };
    setTimeout(this.tryApplyListeners, 300);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps !== this.props
      || !isEqual(nextState, this.state);
  }

  tryApplyListeners = () => {
    const unit = uiKit.units.get(this.props.entry.url_name);
    if (!unit) {
      setTimeout(this.tryApplyListeners, 300);
      return;
    }

    this.applyListeners(unit);
  };

  applyListeners = (unit) => {
    unit.addListener('*', this.handleChange);
  };

  handleChange = () => {
    const { __path: path } = this.props.entry;
    const mdModule = uiKit.fs.get(path);
    if (!mdModule) {
      return;
    }

    const { examples, md } = mdModule.exports;

    console.log(examples, md);

    let index = 0;
    const nextMd = md.replace(/```KIT\n/g, g => {
      return g.concat(examples[index++]);
    });

    console.log(nextMd);

    this.setState({ docs: { md: nextMd, examples }, isReady: true });
  };

  // fetchSources = async () => {
  //   const { entry } = this.props;
  //   if (entry) {
  //     const path = entry.js.url;
  //     if (!window.UIKit.fs[path]) {
  //       window.UIKit.fs[path] = {};
  //     }

  //     // TODO: create API for fetching locally during development
  //     const code = await fetch(CONFIG.js.rootpath.concat(path));
  //     this.setState({ jsx: code, isReady: true });
  //     this.handleJSXChange.flush();
  //     this.handleJSXChange(code);
  //   }
  // };

  // handleJSXChange = debounce((code) => {
  //   const path = this.props.entry.js.url;
  //   const compiled = transformJSX(code, { skipES2015Transform: false });
  //   const m = getModule(path);

  //   if (compiled.__code === m.__code) {
  //     console.log('Nothing changed!');
  //     return;
  //   }

  //   extendModule(path, compiled);
  //   try {
  //     extendModule(path, eval(compiled.code));
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }, 3000);

  // handleLessChange = () => {

  // };

  render() {
    // const req = require.context('..', true, /^\.\/(((api\/client)|(utils\/(browser|command|lang|loader|message|paragraphify|tags|urlGenerator)))|((components|actions|consts|definitions|external|less|pages|(prop-types)|selectors|triggers)\/.*)|([a-zA-Z]{1,}))\.(js|less)$/);
    // console.log(require.context('../../../node_modules', true, /^\.\/react\/index\.js$/));
    // console.log(require.resolve('react-dom'));

    let index = 0;
    return (
      <div className="layout layout-rows">
        <div className="layout__row">
          {this.state.docs.md && this.state.docs.md.map((chunk, i) => {
            if (chunk.startsWith('```KIT\n')) {
              return (
                <Preview
                  code={chunk.replace('```KIT\n', '')}
                  index={index++}
                  key={i}
                  urlName={this.props.entry.url_name}
                />
              );
            }

            return <Markdown key={i} source={chunk} />;
          })}
        </div>
        {this.state.isReady &&
          <div className="layout__row">
            <JSXEditor
              code={this.state.jsx}
              onChange={this.handleJSXChange}
            />
          </div>
        }
        <div className="layout__row">
          <LessEditor
            code={this.state.less}
            onChange={this.handleLessChange}
          />
        </div>
      </div>
    );
  }
}

// const mapStateToProps = createSelector(
//   (state, props) => state.getIn(['kit', 'fs', '']),
//   x => ({ x })
// );

// export default connect()(Unit);
