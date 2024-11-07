import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { Timestamp } from 'firebase-admin/firestore';
import fs from 'fs';

const projectId = `rules-spec-${Date.now()}`;

export const setup = async (auth, data) => {
  const testEnv = await initializeTestEnvironment({
    projectId,
    firestore: {
      rules: fs.readFileSync('database/firestore.rules', 'utf8'),
    },
    auth,
  });

  const db = testEnv.authenticatedContext(auth?.uid || null).firestore();

  if (data) {
    const adminDb = testEnv.unauthenticatedContext().firestore();
    for (const key in data) {
      const ref = adminDb.doc(key);
      await ref.set(data[key]);
    }
  }

  return db;
};

export const teardown = async (testEnv) => {
  if (testEnv) {
    await testEnv.cleanup();
  }
};

export const setupAdmin = async (testEnv, data) => {
  const adminDb = testEnv.unauthenticatedContext().firestore();

  if (data) {
    for (const key in data) {
      const ref = adminDb.doc(key);
      await ref.set(data[key]);
    }
  }

  return adminDb;
};

export const getTimeStamp = (date) => {
  return Timestamp.fromDate(date);
};

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
};

export const getValidExerciseData = () => {
  return {
    referenceNumber: '000' + getRandomInt(100, 1000),
    progress: { started: true },
    state: 'draft',
    createdBy: 'user1',
  };
};
