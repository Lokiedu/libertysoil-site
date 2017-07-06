export function getRouteName(route) {
  const component = route.component;

  if (component.displayName.startsWith('Connect')) {
    const wrapped = component.WrappedComponent;
    return wrapped.displayName || wrapped.name;
  }

  return component.displayName || component.name;
}

export function getRoutesNames(routes = []) {
  return routes.reduce(
    (acc, route) => (route.component && acc.push(getRouteName(route)), acc),
    []
  );
}
