'use strict';

import { app, db } from './shared/admin.js';
import { getDocuments } from '../functions/shared/helpers.js';

const main = async () => {
  const qualifyingTestId = 'HQwAPKDR4KeDKU1Fi4dO';
  const tests = await getDocuments(
    db.collection('qualifyingTestResponses')
    .where('qualifyingTest.id', '==', qualifyingTestId)
    .select('testQuestions', 'responses')
  );
  const testsWithoutQuestions = tests.filter(test => (!test.testQuestions.questions || test.testQuestions.questions.length == 0));
  const testsWithoutResponses = tests.filter(test => (!test.responses));
  return {
    totalTests: tests.length,
    testsWithoutResponses: testsWithoutResponses.length,
    testsWithoutQuestions: testsWithoutQuestions.length,
  };
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
