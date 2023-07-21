'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const { getDocument, applyUpdates } = require('../functions/shared/helpers');
const newQualifyingTestResponse = require('../functions/shared/factories/QualifyingTests/newQualifyingTestResponse')(config, firebase);
const newQuestionsWithoutSolutions = require('../functions/shared/factories/QualifyingTests/newQuestionsWithoutSolutions')();

const main = async () => {
  const qualifyingTestId = 'yubYbWZ5WGQoG2OhHTfT';
  const participant = { 
    adjustments: false,
    fullName: '',
    email: 'sophie.austin@judicialappointments.gov.uk',
    ref: '',
    srcId: '',
  };
  const qualifyingTest = await getDocument(db.collection('qualifyingTests').doc(qualifyingTestId));
  if (!qualifyingTest) return false;
  
  let data;
  if (qualifyingTest.mode === 'dry-run') {
    data = newQualifyingTestResponse(qualifyingTest, participant.email);
  } else {
    data = newQualifyingTestResponse(qualifyingTest, participant);
  }
  data.status = config.QUALIFYING_TEST_RESPONSES.STATUS.CREATED;
  data.statusLog.created = firebase.firestore.FieldValue.serverTimestamp();  
  data.qualifyingTest.feedbackSurvey = qualifyingTest.feedbackSurvey;
  data.lastUpdated = firebase.firestore.FieldValue.serverTimestamp();
  if (qualifyingTest.status === config.QUALIFYING_TEST.STATUS.ACTIVATED) {
    data.testQuestions = newQuestionsWithoutSolutions(qualifyingTest.testQuestions);
    data.status = config.QUALIFYING_TEST_RESPONSES.STATUS.ACTIVATED;
    data.statusLog.activated = firebase.firestore.FieldValue.serverTimestamp();  
  }

  const commands = [];
  commands.push({
    command: 'set',
    ref: db.collection('qualifyingTestResponses').doc(),
    data: data,    
  });
  const qualifyingTestData = {
    'counts.initialised': firebase.firestore.FieldValue.increment(1),
  };
  if (qualifyingTest.status === config.QUALIFYING_TEST.STATUS.ACTIVATED) {
    qualifyingTestData['counts.activated'] = firebase.firestore.FieldValue.increment(1);
  }
  commands.push({
    command: 'update',
    ref: qualifyingTest.ref,
    data: qualifyingTestData,
  });
  const result = await applyUpdates(db, commands);
  return result;
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
