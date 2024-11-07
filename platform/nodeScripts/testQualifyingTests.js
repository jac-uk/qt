'use strict';

import config from './shared/config.js';
import { firebase, app, db } from './shared/admin.js';
import {getDocument, getDocuments, applyUpdates} from '../functions/shared/helpers.js';
import sizeof from 'firestore-size';

const main = async () => {
  const qualifyingTestId = 'oFGBwCCxsHccl9I72c2V';
  const isDeleteExisting = false;
  let commands = [];

  const qualifyingTestRef = db.collection('qualifyingTests').doc(qualifyingTestId);
  const qualifyingTest = await getDocument(qualifyingTestRef);
  const bytes = sizeof(qualifyingTest);
  console.log('qualifyingTest bytes', bytes);

  if (isDeleteExisting) {
    // delete existing responses
    console.log('attempting to delete qualifyingtestresponses for', qualifyingTestId);
    const qualifyingTestResponses = await getDocuments(db.collection('qualifyingTestResponses').where('qualifyingTest.id', '==', qualifyingTestId).select());
    console.log('qualifyingTestResponses', qualifyingTestResponses.length);
    if (qualifyingTestResponses.length) {
      commands = qualifyingTestResponses.map((doc) => {
        return { command: 'delete', ref: doc.ref };
      });
    }

    // reset QT
    commands.push({
      command: 'update',
      ref: qualifyingTestRef,
      data: {
        status: 'approved',
        counts: {}
      }
    });
  }

  if (commands.length) {
    const result = await applyUpdates(db, commands);
    console.log('result', result);
  }

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
