import React from 'react';

const PanelToolbarArea = (position, items) => {
  if (items && items.length) {
    return (
      <div className={`panel__toolbar_${position}`}>
        {items.map((item, i) => <div key={i} className="panel__toolbar_item">{item}</div>)}
      </div>
    );
  }

  return false;
}

const PanelToolbar = ({ toolbarPrimary, toolbarSecondary }) => {
  const primaryToolbar = PanelToolbarArea('right', toolbarPrimary);
  const secondaryToolbar = PanelToolbarArea('left', toolbarSecondary);

  if (!primaryToolbar && !secondaryToolbar) {
    return false;
  }

  return (
    <div className="panel__toolbar">
      {secondaryToolbar}
      {primaryToolbar}
    </div>
  );
}

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
    <PanelToolbar toolbarPrimary={toolbarPrimary} toolbarSecondary={toolbarSecondary} />
  </div>
)
