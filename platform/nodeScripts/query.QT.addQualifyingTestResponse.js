'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const { getDocument, applyUpdates } = require('../functions/shared/helpers');
const newQualifyingTestResponse = require('../functions/shared/factories/QualifyingTests/newQualifyingTestResponse')(config, firebase);
const newQuestionsWithoutSolutions = require('../functions/shared/factories/QualifyingTests/newQuestionsWithoutSolutions')();

const main = async () => {
  const qualifyingTestId = 't7cU9RU9FMM7rBZom3M3';
  const participant = { 
    fullName: 'Abbey Bevan (TEST)',
    email: 'abbey.bevan@test.test',
  };
  const qualifyingTest = await getDocument(db.collection('qualifyingTests').doc(qualifyingTestId));
  const questions = newQuestionsWithoutSolutions(qualifyingTest.testQuestions);
  const data = newQualifyingTestResponse(qualifyingTest, participant);
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
