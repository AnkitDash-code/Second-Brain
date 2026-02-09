import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Memory, MemoryType } from '../types';

interface SecondBrainDB extends DBSchema {
  memories: {
    key: string;
    value: Memory;
    indexes: { 'by-date': number; 'by-type': MemoryType };
  };
}

const DB_NAME = 'second-brain-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<SecondBrainDB>> | null = null;

export const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<SecondBrainDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore('memories', { keyPath: 'id' });
        store.createIndex('by-date', 'timestamp');
        store.createIndex('by-type', 'type');
      },
    });
  }
  return dbPromise;
};

export const addMemory = async (memory: Memory) => {
  const db = await getDB();
  await db.put('memories', memory);
};

export const getAllMemories = async (): Promise<Memory[]> => {
  const db = await getDB();
  return db.getAllFromIndex('memories', 'by-date');
};

export const deleteMemory = async (id: string) => {
  const db = await getDB();
  await db.delete('memories', id);
};

export const clearAllMemories = async () => {
  const db = await getDB();
  await db.clear('memories');
};

export const toggleMemoryVerification = async (id: string) => {
  const db = await getDB();
  const memory = await db.get('memories', id);
  if (memory) {
    memory.verified = !memory.verified;
    await db.put('memories', memory);
  }
};

export const toggleActionCompletion = async (id: string) => {
  const db = await getDB();
  const memory = await db.get('memories', id);
  if (memory && memory.action) {
    memory.action.completed = !memory.action.completed;
    await db.put('memories', memory);
  }
};