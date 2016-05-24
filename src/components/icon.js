import React from 'react';

import favorite from 'react-icons/lib/md/favorite';
import favorite_border from 'react-icons/lib/md/favorite-border';
import _public from 'react-icons/lib/md/public';
import star from 'react-icons/lib/md/star';
import star_border from 'react-icons/lib/md/star-border';
import chat_bubble_outline from 'react-icons/lib/md/chat-bubble-outline';
import link from 'react-icons/lib/md/link';
import edit from 'react-icons/lib/md/edit';
import close from 'react-icons/lib/md/close';
import _delete from 'react-icons/lib/md/delete';

const icons = {
  favorite,
  favorite_border,
  public: _public,
  star,
  star_border,
  chat_bubble_outline,
  link,
  edit,
  close,
  delete: _delete
};

const IconComponent = ({
  color,
  outline,
  icon,
  size,
  className,
  disabled,
  onClick,
  ...props
}) => {
  const Icon = icons[icon];
  const classnameIcon = ['icon'];
  const classnameIconPic = ['micon'];
  let localOnClick = onClick;

  className && classnameIcon.push(className);
  outline && classnameIcon.push('icon-outline');

  color && classnameIconPic.push(`color-${color}`);

  if (!Icon) {
    return <div>{`Please import '${icon}' from react-icons/lib/md`}</div>;
  }

  if (size) {
    classnameIcon.push(`icon-${size}`);
    classnameIconPic.push(`micon-${size}`);
  }

  if (disabled) {
    classnameIcon.push(`icon-disabled`);
    localOnClick = null;
  }

  return (
    <div
      {...props}
      disabled={disabled}
      onClick={localOnClick}
      className={classnameIcon.join(' ')}
    >
      <Icon className={classnameIconPic.join(' ')} />
    </div>
  );
};

export default IconComponent;
