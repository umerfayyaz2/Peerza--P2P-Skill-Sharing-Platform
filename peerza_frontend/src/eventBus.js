// Simple event bus for cross-component updates
const eventBus = new EventTarget();

export const emit = (event, detail) => {
  eventBus.dispatchEvent(new CustomEvent(event, { detail }));
};

export const on = (event, callback) => {
  eventBus.addEventListener(event, callback);
  return () => eventBus.removeEventListener(event, callback);
};

export default eventBus;
