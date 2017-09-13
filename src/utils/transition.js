const findNearestAncestorSatifying = (doneCondition, needNext, getNext) => {
  return function iterate(ancestor) {
    if (!ancestor) {
      return undefined;
    }
    if (doneCondition(ancestor)) {
      return ancestor;
    }
    if (!needNext(ancestor)) {
      return undefined;
    }

    return iterate(getNext(ancestor));
  };
};

const TRANSITION_LIFECYCLE_HOOKS = [
  'componentWillAppear', 'componentDidAppear',
  'componentWillEnter', 'componentDidEnter',
  'componentWillLeave', 'componentDidLeave'
];

const getAncestorTransitionLifecycleHooks = (object) => {
  const component = findNearestAncestorSatifying(
    ancestor => TRANSITION_LIFECYCLE_HOOKS.some(hookName => hookName in ancestor),
    ancestor => 'getWrappedInstance' in ancestor,
    ancestor => ancestor.getWrappedInstance()
  )(object);

  if (!component) {
    return undefined;
  }

  return TRANSITION_LIFECYCLE_HOOKS.reduce(
    (acc, hookName) => (acc[hookName] = component[hookName], acc), {}
  );
};

export function appear(timeout, callback) {
  this.setState(
    state => ({ ...state, isVisible: true }),
    () => setTimeout(() => callback(), timeout)
  );
}

export function disappear(timeout, callback) {
  this.setState(
    state => ({ ...state, isVisible: false }),
    () => setTimeout(() => callback(), timeout)
  );
}

/**
 * Keep in mind the possibility of methods' `this` bind to change.
 * Define them as arrow functions, like `componentWillEnter = (callback) => ...`
 */
export default function wrapWithTransition(WrappedComponent) {
  const componentName = WrappedComponent.displayName
    || WrappedComponent.name
    || 'Component';

  return class Transition extends WrappedComponent {
    static displayName = `Transition(${componentName})`;

    // Refs are first available now
    componentDidMount() {
      const ancestorTransitionHooks = getAncestorTransitionLifecycleHooks(this);
      if (ancestorTransitionHooks) {
        Object.assign(this, ancestorTransitionHooks);
      }
    }
  };
}
