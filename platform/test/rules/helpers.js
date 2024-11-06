import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { Timestamp } from 'firebase/firestore';
import fs from 'fs';

const projectId = `rules-spec-${Date.now()}`;

export const setup = async (auth, data) => {

  const rules = fs.readFileSync('database/firestore.rules', 'utf8');

  const app = await initializeTestEnvironment({
    projectId,
    auth,
  });

  const db = app.firestore();

  if (data) {
    const adminApp = await initializeTestEnvironment({
      projectId: projectId,
    });
    const adminDb = adminApp.firestore();
    for (const key in data) {
      const ref = adminDb.doc(key);
      await ref.set(data[key]);
    }
  }

  await firebase.loadFirestoreRules({
    projectId,
    rules: rules,
  });

  return db;
};

export const teardown = async () => {
  await Promise.all(firebase.apps().map(app => app.delete()));
};

export const setupAdmin = async (db, data) => {
  const app = await firebase.initializeAdminApp({
    projectId: db.app.options.projectId,
  });
  const adminDb = app.firestore();
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
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
};

export const getValidExerciseData = () => {
  return {
    referenceNumber: '000' + getRandomInt(100, 1000),
    progress: {started: true},
    state: 'draft',
    createdBy: 'user1',
  };
};
