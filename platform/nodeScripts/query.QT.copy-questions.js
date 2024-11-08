'use strict';

import { app, db } from './shared/admin.js';
import { getDocument, applyUpdates } from '../functions/shared/helpers.js';

const main = async () => {
  const srcId = 'YBdY7Gz7UVJ3pRwo9S70';
  const destId = 'ClCqYI2zm4DX277ZXtuT';
  const srcDoc = await getDocument(db.collection('qualifyingTestResponses').doc(srcId));
  const destDoc = await getDocument(db.collection('qualifyingTestResponses').doc(destId));
  const commands = [];
  commands.push({
    command: 'update',
    ref: destDoc.ref,
    data: {
      testQuestions: srcDoc.testQuestions,
    },
  });
  console.log('commands', commands);
  await applyUpdates(db, commands);
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
