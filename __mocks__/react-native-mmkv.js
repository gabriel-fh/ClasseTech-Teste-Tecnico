// O módulo nativo não carrega no Jest. Mesma API da versão 4, em memória.
function createMMKV() {
  const store = new Map();

  return {
    set(key, value) {
      store.set(key, value);
    },
    getString(key) {
      const value = store.get(key);

      return typeof value === 'string' ? value : undefined;
    },
    getNumber(key) {
      const value = store.get(key);

      return typeof value === 'number' ? value : undefined;
    },
    getBoolean(key) {
      const value = store.get(key);

      return typeof value === 'boolean' ? value : undefined;
    },
    contains(key) {
      return store.has(key);
    },
    remove(key) {
      store.delete(key);
    },
    clearAll() {
      store.clear();
    },
    getAllKeys() {
      return [...store.keys()];
    },
  };
}

module.exports = { createMMKV };
