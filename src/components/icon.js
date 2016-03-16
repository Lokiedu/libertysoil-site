import React from 'react';

export default ({
  color,
  outline,
  icon,
  size,
  className,
  ...props
}) => {
  let classnameIcon = ['icon'];
  let classnameIconPic = ['micon'];

  className && classnameIcon.push(className);
  outline && classnameIcon.push('icon-outline');

  color && classnameIconPic.push(`color-${color}`);
  size && classnameIconPic.push(`micon-${size}`);

  return (
    <div {...props} className={classnameIcon.join(' ')}>
      <div className={classnameIconPic.join(' ')}>{icon}</div>
    </div>
  );
}
