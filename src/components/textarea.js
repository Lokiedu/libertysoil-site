import React, {
  Component
} from 'react';

export default class Textarea extends Component {
  onKeyDown = (e) => {
    const ENTER = 13;

    if ((e.ctrlKey || e.metaKey) && e.keyCode == ENTER) {
      this.submit.click();
    }
  };

  render() {
    return (
      <div>
        <textarea
          onKeyDown={this.onKeyDown}
          {...this.props}
        ></textarea>
        <input
          type="submit"
          ref={c => this.submit = c}
          style={{ display: 'none' }}
        />
      </div>
    );
  }
}
