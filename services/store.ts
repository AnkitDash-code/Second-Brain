
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { Memory } from '../types';
import { app } from './firebase';

const db = getFirestore(app);
const memoriesCollection = collection(db, 'memories');

export const addMemory = async (memory: Memory) => {
  await setDoc(doc(db, 'memories', memory.id), memory);
};

export const getAllMemories = async (): Promise<Memory[]> => {
  const q = query(memoriesCollection, orderBy('timestamp', 'desc'));
  const querySnapshot = await getDocs(q);
  const memories: Memory[] = [];
  querySnapshot.forEach((doc) => {
    memories.push(doc.data() as Memory);
  });
  return memories;
};

export const deleteMemory = async (id: string) => {
  await deleteDoc(doc(db, 'memories', id));
};

export const toggleMemoryVerification = async (id: string) => {
  const memoryDoc = doc(db, 'memories', id);
  const memorySnapshot = await getDoc(memoryDoc);
  if (memorySnapshot.exists()) {
    const currentVerifiedState = memorySnapshot.data().verified;
    await updateDoc(memoryDoc, {
      verified: !currentVerifiedState,
    });
  }
};

export const toggleActionCompletion = async (id: string) => {
  const memoryDoc = doc(db, 'memories', id);
  const memorySnapshot = await getDoc(memoryDoc);
  if (memorySnapshot.exists()) {
    const memoryData = memorySnapshot.data();
    if (memoryData.action) {
      const currentCompletedState = memoryData.action.completed;
      await updateDoc(memoryDoc, {
        'action.completed': !currentCompletedState,
      });
    }
  }
};
