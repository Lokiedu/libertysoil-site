import React, { PropTypes, Component } from 'react';

import ModalComponent from '../components/modal-component';
import TabsComponent from '../components/tabs-component';
import TagCloud from '../components/tag-cloud';

export default class AddTagModal extends Component {
  static displayName = 'AddTagModal';

  state = {
    activeTabIndex: 0
  };

  static defaultProps = {
    tabs: [
      {
        title: 'Enter manually',
        id: 'manual'
      },
      {
        title: 'Used recently',
        id: 'recently'
      },
      {
        title: 'Popular',
        id: 'popular'
      }
    ],
    onClose: () => {},
    onSave: () => {}
  };

  selectTab = (index) => {
    this.setState({ activeTabIndex: index });
  };

  render () {
    const {
      tabs,
      onClose,
      onSave
    } = this.props;
    const {
      activeTabIndex
    } = this.state;

    return (
      <ModalComponent
        title="Add hashtags to your post"
        size="normal"
        onHide={onClose}
      >
        <ModalComponent.body>
          <TabsComponent activeIndex={activeTabIndex} tabs={tabs} onSelect={this.selectTab} />
          <div>
            <div className="layout__row tabs_component__content tabs_component__content-highlight tabs_component__content-expanded">
              <div className="layout">
                <div className="layout__grid_item layout__grid_item-wide">
                  <input type="text" placeholder="Start typing..." className="input input-block input-transparent input-button_height" />
                </div>
                <div className="layout__grid_item">
                  <span className="button button-wide button-ligth_blue action">Add</span>
                </div>
              </div>
            </div>
            <div className="layout__row">
              Added:
            </div>
            <div className="layout__row">
              <TagCloud
                tags={[
                  {
                    name: 'test tag'
                  }
                ]}
              />
            </div>
          </div>
        </ModalComponent.body>
        <ModalComponent.actions>
          <div className="button button-wide button-red action" onClick={onSave}>Save</div>
        </ModalComponent.actions>
      </ModalComponent>
    );
  }
}
