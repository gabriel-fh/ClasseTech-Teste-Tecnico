/**
 * O react-native-mmkv é nativo e não carrega no Jest: o módulo Nitro não existe fora do app.
 * Este mock guarda tudo em memória, com a mesma API da versão 4 (`createMMKV`, `remove`).
 */
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
