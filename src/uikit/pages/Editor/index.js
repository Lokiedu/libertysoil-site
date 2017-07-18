import React, { Component } from 'react';
import { connect } from 'react-redux';
import JavascriptEditor from '../../components/Javascript';
import LessEditor from '../../components/Less';
import { resolutions } from '../../const';

class Editor extends Component {
  static async fetchData(routerState, store, dataFetcher) {
    await dataFetcher.provideCodeOfComponent(routerState.params);
  }

  state = {
    currentResolution: 0,
    iframeSpinner: true
  };

  renderJSX(files) {
    for (const file in files) {
      return (
        <JavascriptEditor
          file={file}
          code={files[file]}
          onChange={this.handleChangeJavascript}
        />
      );
    }
    return null;
  }

  renderLESS(files) {
    for (const file in files) {
      return (
        <LessEditor
          code={files[file]}
          file={file}
          onChange={this.handleChangeLess}
        />
      );
    }
    return null;
  }

  handleChangeResolution = ({ target }) => {
    this.setState({ currentResolution: target.value }, this.setFrameHeight);
  };

  setFrameHeight = () => {
    const { frameComponent } = this;
    frameComponent.style.height = getComputedStyle(frameComponent.contentDocument.firstElementChild).height;
  };

  handleOnload = ({ target }) => {
    this.frameComponent = target;
    this.setState({ iframeSpinner: false }, this.setFrameHeight);
  };

  render() {
    const { params, component } = this.props;
    const { iframeSpinner, currentResolution } = this.state;
    const frameStyle = resolutions[currentResolution].style;

    return (
      <section>
        <div className="content">
          <div className="preview">
            <div className="title">
              <div className="resolutions_selector_wrap">
                <span className="select">
                  <select className="select" onChange={this.handleChangeResolution} value={currentResolution} >
                    {resolutions.map((el, id) => <option key={id} value={id}>{`${params.name} ${el.text}`}</option>)}
                  </select>
                </span>
              </div>
            </div>

            {iframeSpinner && <p>Loading…</p>}
            <div style={frameStyle}>
              <iframe
                src={`/uikit/component/${params.name}`}
                className="component_frame"
                onLoad={this.handleOnload}
              />
            </div>

          </div>
          <div className="editor">
            {component ? this.renderJSX(component.get('jsx')) : <p>Loading…</p>}
            {component && this.renderLESS(component.get('less'))}
          </div>
        </div>
      </section>
    );
  }
}

function select(state) {
  const component = state.getIn(['components', 'component']);
  return { component };
}

export default connect(select)(Editor);
