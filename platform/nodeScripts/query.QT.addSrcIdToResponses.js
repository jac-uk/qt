'use strict';

import { app, db } from './shared/admin.js';
import { getDocument, getDocuments, applyUpdates } from '../functions/shared/helpers';

const main = async () => {
  /**
   * Here we are adding participant.srcId to all qualifying test responses in a test. This enables the scores for those tests to be transfered back to the digital platform
   * `sourceQualifyingTestId` a qualifyingTest document containing the `participants` with their srcIds
   * `destinationQualifyingTestId` the qualifying test for which we would like to include srcIds (for the QTRs in the QT)
   */

  const sourceQualifyingTestId = 'T1BIb2J6uUCzfKpzbx7n';
  const destinationQualifyingTestId = 'qETBFq0LDOYisd8QJ29u';

  const sourceQualifyingTest = await getDocument(db.collection('qualifyingTests').doc(sourceQualifyingTestId));
  if (!sourceQualifyingTest) return false;

  const destinationQualifyingTest = await getDocument(db.collection('qualifyingTests').doc(destinationQualifyingTestId));
  if (!destinationQualifyingTest) return false;

  // get map of email to srcId
  const email2SrcId = {};
  sourceQualifyingTest.participants.forEach(participant => {
    email2SrcId[participant.email] = participant.srcId;
  });
  console.log('email2SrcId', email2SrcId);

  // get all tests (inc mopups)
  const testIds = [];
  testIds.push(destinationQualifyingTest.id);
  const allMopupTests = await getDocuments(
    db.collection('qualifyingTests')
    .where('mode', '==', 'mop-up')
    .where('relationship.copiedFrom', '==', destinationQualifyingTest.id)
  );
  if (allMopupTests) {
    allMopupTests.forEach(test => testIds.push(test.id));
  }

  // get QTRs
  let qualifyingTestResponsesRef = db.collection('qualifyingTestResponses')
  .where('qualifyingTest.id', 'in', testIds)
  .select('score', 'status', 'participant');
  const qualifyingTestResponses = await getDocuments(qualifyingTestResponsesRef);

  // update QTRs where we have a srcId
  const commands = [];
  qualifyingTestResponses.forEach(item => {
    if (item.participant && item.participant.email && !item.participant.srcId) {
      if (email2SrcId[item.participant.email]) {
        const data = {};
        data['participant.srcId'] = email2SrcId[item.participant.email];
        commands.push({
          command: 'update',
          ref: item.ref,
          data: data,
        });
      }
    }
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
