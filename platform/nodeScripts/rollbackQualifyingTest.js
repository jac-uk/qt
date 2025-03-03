'use strict';

import config from './shared/config.js';
import { firebase, app, db } from './shared/admin.js';
import { getDocument, getDocuments, applyUpdates } from '../functions/shared/helpers.js';

const main = async () => {
  const qualifyingTestId = '062pKOisqldPaq5HuZGN';
  const applyChanges = false;  // whether or not to actually make changes to data

  // get qualifyingTest
  const qualifyingTest = await getDocument(db.collection('qualifyingTests').doc(qualifyingTestId));
  if (!qualifyingTest) return console.error('QT not found');
  if (
    [
      config.QUALIFYING_TEST.STATUS.ACTIVATED,
      config.QUALIFYING_TEST.STATUS.STARTED,
      config.QUALIFYING_TEST.STATUS.PAUSED,
      config.QUALIFYING_TEST.STATUS.PROGRESS,
      config.QUALIFYING_TEST.STATUS.COMPLETED,
    ].indexOf(qualifyingTest.status) < 0
  ) return console.error('QT cannot be rolled back. Wrong status');

  // get qualifyingTestResponses
  const qualifyingTestResponses = await getDocuments(db.collection('qualifyingTestResponses').where('qualifyingTest.id', '==', qualifyingTestId));
  if (!qualifyingTestResponses || qualifyingTestResponses.length === 0) return console.error('QT responses not found');

  const commands = [];

  // update qualifyingTestResponses
  qualifyingTestResponses.forEach(qualifyingTestResponse => {
    commands.push({
      command: 'replace',
      ref: db.collection('qualifyingTestResponses').doc(`${qualifyingTestResponse.id}`),
      data: {
        qualifyingTest: qualifyingTestResponse.qualifyingTest,
        duration: qualifyingTestResponse.duration,
        participant: qualifyingTestResponse.participant,
        _search: qualifyingTestResponse._search,
        testQuestions: [],
        responses: [],
        status: config.QUALIFYING_TEST_RESPONSES.STATUS.CREATED,
        statusLog: {
          created: firebase.firestore.FieldValue.serverTimestamp(),
          activated: null,
          started: null,
          completed: null,
        },
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
      },
    });
  });

  // update qualifyingTest
  commands.push({
    command: 'update',
    ref: qualifyingTest.ref,
    data: {
      status: config.QUALIFYING_TEST.STATUS.INITIALISED,
      counts: {
        initialised: qualifyingTest.counts.initialised,
        activated: 0,
        started: 0,
        inProgress: 0,
        outOfTime: 0,
        completed: 0,
      },
    },
  });

  if (applyChanges) {
    await applyUpdates(db, commands);
    return `${commands.length} records updated`;
  }
  return 'No changes made';
};

main()
  .then((result) => {
    console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.log(error);
    process.exit();
  });
