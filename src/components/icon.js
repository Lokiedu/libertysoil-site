import React from 'react';

import * as MdIconPack from 'react-icons/lib/md';

function findIcon(iconName) {
  const camelized = iconName.replace(/(?:^|[-_])(\w)/g, (match, c) =>
    c ? c.toUpperCase() : ''
  );

  const query = `Md${camelized.charAt(0).toUpperCase() + camelized.slice(1)}`;
  return MdIconPack[query];
}

const IconComponent = ({
  className,
  color,
  disabled,
  icon,
  onClick,
  outline,
  spin,
  size,
  ...props
}) => {
  const Icon = findIcon(icon);
  if (!Icon) {
    return <div>{`Please import '${icon}' from react-icons/lib/md`}</div>;
  }

  const classnameIcon = ['icon'];
  const classnameIconPic = ['micon'];
  let localOnClick = onClick;

  className && classnameIcon.push(className);
  outline && classnameIcon.push('icon-outline');

  color && classnameIconPic.push(`color-${color}`);

  if (size) {
    classnameIcon.push(`icon-${size}`);
    classnameIconPic.push(`micon-${size}`);
  }

  if (disabled) {
    classnameIcon.push(`icon-disabled`);
    localOnClick = null;
  }

  if (spin) {
    classnameIcon.push(`micon-rotate`);
  }

  return (
    <div
      {...props}
      className={classnameIcon.join(' ')}
      disabled={disabled}
      onClick={localOnClick}
    >
      <Icon className={classnameIconPic.join(' ')} />
    </div>
  );
};

export default IconComponent;
