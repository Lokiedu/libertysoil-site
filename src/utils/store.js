const CURRENT_USER_SET_PROPERTIES = [
  'geotags', 'hashtags', 'schools',
  'followed_geotags', 'followed_hashtags', 'followed_schools',
  'liked_geotags', 'liked_hashtags', 'liked_schools'
];

export function convert(state) {
  state.update('current_user', _ => _.withMutations(cu => {
    for (const key of CURRENT_USER_SET_PROPERTIES) {
      cu.update(key, xs => xs.toSet());
    }
  }));
}
