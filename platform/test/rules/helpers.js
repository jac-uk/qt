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
  });
  // sorry whoever did the clever auth?.uid thing - upgrade broke it @todo fix it back to:
  //const db = testEnv.authenticatedContext(auth?.uid || null).firestore();

  let db;
  if (auth && auth.uid) {
    const options = JSON.parse(JSON.stringify(auth));
    delete options.uid;
    db = testEnv.authenticatedContext(auth.uid, options).firestore();
  } else {
    db = testEnv.unauthenticatedContext().firestore();
  }

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

export const setupAdmin = async (data) => {
  const testEnv = await initializeTestEnvironment({
    projectId,
    firestore: {
      rules: fs.readFileSync('database/firestore.rules', 'utf8'),
    },
  });

  if (data) {
    // Add data bypassing security rules
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      for (const key in data) {
        console.log(key, data[key]);
        await db.doc(key).set(data[key]);
      }
    });
  }
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
