'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const { getDocuments } = require('../functions/shared/helpers');

const main = async () => {
  const qualifyingTestId = 't7cU9RU9FMM7rBZom3M3';
  const tests = await getDocuments(
    db.collection('qualifyingTestResponses')
    .where('qualifyingTest.id', '==', qualifyingTestId)
    .select('testQuestions')
  );
  const testsWithoutQuestions = tests.filter(test => (!test.testQuestions.questions || test.testQuestions.questions.length == 0));
  return testsWithoutQuestions;
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
