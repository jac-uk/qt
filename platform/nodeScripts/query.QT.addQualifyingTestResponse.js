'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const { getDocument, applyUpdates } = require('../functions/shared/helpers');
const newQualifyingTestResponse = require('../functions/shared/factories/QualifyingTests/newQualifyingTestResponse')(config, firebase);
const newQuestionsWithoutSolutions = require('../functions/shared/factories/QualifyingTests/newQuestionsWithoutSolutions')();

const main = async () => {
  const qualifyingTestId = '7MVD83Kvx8gjeiS3RUih';
  const participant = { 
    fullName: null,
    email: 'andrew.davidson@citadelchambers.com',
  };
  const qualifyingTest = await getDocument(db.collection('qualifyingTests').doc(qualifyingTestId));
  if (!qualifyingTest) return false;

  const questions = newQuestionsWithoutSolutions(qualifyingTest.testQuestions);
  let data;
  if (qualifyingTest.mode === 'dry-run') {
    data = newQualifyingTestResponse(qualifyingTest, participant.email);
  } else {
    data = newQualifyingTestResponse(qualifyingTest, participant);
  }
  data.testQuestions = questions;
  data.qualifyingTest.feedbackSurvey = qualifyingTest.feedbackSurvey;
  data.status = config.QUALIFYING_TEST_RESPONSES.STATUS.ACTIVATED;
  data.statusLog.activated = firebase.firestore.FieldValue.serverTimestamp();
  data.lastUpdated = firebase.firestore.FieldValue.serverTimestamp();

  const commands = [];
  commands.push({
    command: 'set',
    ref: db.collection('qualifyingTestResponses').doc(),
    data: data,    
  });
  commands.push({
    command: 'update',
    ref: qualifyingTest.ref,
    data: {
      'counts.initialised': firebase.firestore.FieldValue.increment(1),
      'counts.activated': firebase.firestore.FieldValue.increment(1),
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
