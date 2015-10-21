import User from './user';
import FollowButton from './follow-button';

const UsersGrid = ({users, current_user, i_am_following, triggers, empty_msg}) => {
  if (users.length === 0) {
    return <div>{empty_msg}</div>;
  }

  return (
    <div className="layout__grids layout__grids-space layout__grid-responsive">
      {users.map((user) => (
        <div className="layout__grids_item layout__grids_item-space layout__grid_item-50" key={`user-${user.id}`}>
          <div className="layout__row layout__row-small">
            <User
              user={user}
              avatarSize="32"
            />
          </div>

          <div className="layout__row layout__row-small">
            <FollowButton
              active_user={current_user}
              following={i_am_following}
              triggers={triggers}
              user={user}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default UsersGrid;
