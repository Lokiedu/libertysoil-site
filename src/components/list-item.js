import React from 'react';

const ListItem = ({
  icon,
  children
}) => (
  <div className="list_item">
    {icon &&
      <div className="list_item__icon">
        {icon}
      </div>
    }
    <div className="list_item__text">
      {children}
    </div>
  </div>
);

export default ListItem;
