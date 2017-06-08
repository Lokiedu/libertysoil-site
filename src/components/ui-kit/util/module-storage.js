export default function ModuleStorage() {
  const storage = {};
  const listeners = [];

  this.getAll = () => ({
    ...storage
  });

  this.getModule = (filepath) => {
    return storage[filepath];
  };

  this.setModule = (filepath, contents) => {
    storage[filepath] = contents;

    this.broadcast(filepath);
    return contents;
  };

  this.extendModule = (filepath, ...extensions) => {
    storage[filepath] = Object.assign(
      this.getModule(filepath) || {},
      ...extensions
    );

    this.broadcast(filepath);
  };

  this.isModuleDefined = (filepath) => {
    return storage[filepath] !== undefined;
  };

  this.addListener = (f) => {
    listeners.push(f);
  };

  this.removeListener = (f) => {
    const index = listeners.findIndex(l => l === f);
    if (index >= 0) {
      listeners.splice(index, 1);
      return true;
    }

    return false;
  };

  this.broadcast = (msg) => {
    for (const listener of listeners) {
      listener(msg);
    }
  };

  this.get = this.getModule;
  this.set = this.setModule;
  this.isDefined = this.isModuleDefined;
}
