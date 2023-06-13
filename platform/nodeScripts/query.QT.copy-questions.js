'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const { getDocument, applyUpdates } = require('../functions/shared/helpers');

const main = async () => {
  const srcId = 'jLChoRTqoUh4Mhs75qYt';
  const destId = 'hl15x4QzCgH0UY7nnkZv';
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
