import { createMMKV, type MMKV } from 'react-native-mmkv';

export const StorageKey = {
  personDraft: 'person-draft',
  lastUnlockAt: 'last-unlock-at',
} as const;

let instance: MMKV | null = null;

function storage(): MMKV {
  instance ??= createMMKV({ id: 'classetech' });

  return instance;
}

export function readJson<T>(key: string): T | null {
  const raw = storage().getString(key);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    storage().remove(key);

    return null;
  }
}

export function writeJson(key: string, value: unknown): void {
  storage().set(key, JSON.stringify(value));
}

export function readNumber(key: string): number | null {
  return storage().getNumber(key) ?? null;
}

export function writeNumber(key: string, value: number): void {
  storage().set(key, value);
}

export function removeKey(key: string): void {
  storage().remove(key);
}
