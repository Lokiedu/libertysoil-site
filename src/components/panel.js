import React, {
  Component
} from 'react';

export default ({
  children,
  title,
  icon,
  toolbarPrimary,
  toolbarSecondary
}) => (
  <div className="panel">
    <div className="panel__body">
      {icon &&
        <div className="panel__icon">
          {icon}
        </div>
      }
      <div className="panel__content">
        {title &&
          <div className="panel__title">
            {title}
          </div>
        }
        {children &&
          <div className="panel__text">
            {children}
          </div>
        }
      </div>
    </div>
    {!!((toolbarPrimary && toolbarPrimary.length) || (toolbarSecondary && toolbarSecondary.length)) &&
      <div className="panel__toolbar">
        {!!(toolbarSecondary && toolbarSecondary.length) &&
          <div className="panel__toolbar_left">
            {toolbarSecondary.map((item, i) => <div key={i} className="panel__toolbar_item">{item}</div>)}
          </div>
        }
        {!!(toolbarPrimary && toolbarPrimary.length) &&
          <div className="panel__toolbar_left">
            {toolbarPrimary.map((item, i) => <div key={i} className="panel__toolbar_item">{item}</div>)}
          </div>
        }
      </div>
    }
  </div>
)
