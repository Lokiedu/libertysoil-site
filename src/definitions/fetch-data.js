type nodeCallback = (e?: Error) => void;
type replaceCallback = (url: string) => void;

export type handler = (nextState: Object, replace?: replaceCallback, callback?: nodeCallback) => void|boolean;
