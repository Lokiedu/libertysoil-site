import React, { Component } from 'react';
import { shape, string } from 'prop-types';
import { resolutions } from '../../const';
import * as componentList from '../../components/common';

class Viewer extends Component {
  static propTypes = {
    params: shape({
      name: string
    }),
  };

  state = {};

  handleOnload = ({ target }) => {
    target.style.height = getComputedStyle(target.contentDocument.firstElementChild).height;
  };

  render() {
    const { params: { name } } = this.props;
    const Component = componentList[name]; // eslint-disable-line import/namespace
    return (
      <section>
        <div className="content">
          <div className="preview">

            <div className="title">
              <h3 className="component-title-h3">{name}</h3>
            </div>

            <div>
              {Component ?
                resolutions.map(({ style, text }, i) => (
                  <div key={i} className="" style={style}>
                    <div className="component-title">
                      <h3 className="component-title-h3">Component in </h3>
                      <span className="component-title-text">{text}</span>
                    </div>
                    <iframe
                      src={`/uikit/component/${name}`}
                      className="component_frame"
                      onLoad={this.handleOnload}
                    />
                  </div>
                ))
                : `Component "${name}" not found!`
              }
            </div>

          </div>
        </div>
      </section>
    );
  }
}

export default Viewer;
