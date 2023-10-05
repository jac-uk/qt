'use strict';

const config = require('./shared/config');
const { app, db } = require('./shared/admin.js');
const { getDocument, getDocuments } = require('../functions/shared/helpers');
const slack = require('../functions/shared/slack')(config);

const main = async () => {

  const REFRESH_COUNTS = false;
  //const qualifyingTestId = 'aoUAW3MsvTkwwG80AA4I';  // SJT
  const qualifyingTestId = 'yubYbWZ5WGQoG2OhHTfT';  // CAT

  const qualifyingTest = await getDocument(db.collection('qualifyingTests').doc(qualifyingTestId));
  if (!qualifyingTest) return false;

  let initialised = 0;
  let activated = 0;
  let started = 0;
  let inProgress = 0;
  let completed = 0;
  let cancelled = 0;
  let outOfTime = 0;
  let other = 0;

  if (REFRESH_COUNTS) {
    const qualifyingTestResponses = await getDocuments(db.collection('qualifyingTestResponses').where('qualifyingTest.id', '==', qualifyingTestId).select('status', 'isOutOfTime'));
    qualifyingTestResponses.forEach(qtr => {
      initialised += 1;
      switch (qtr.status) {
      case config.QUALIFYING_TEST_RESPONSES.STATUS.ACTIVATED:
        activated += 1;
        break;
      case config.QUALIFYING_TEST_RESPONSES.STATUS.STARTED:
        activated += 1;
        started += 1;
        inProgress += 1;
        break;
      case config.QUALIFYING_TEST_RESPONSES.STATUS.COMPLETED:
        activated += 1;
        started += 1;
        completed += 1;
        if (qtr.isOutOfTime) {
          outOfTime += 1;
        }
        break;
      case config.QUALIFYING_TEST_RESPONSES.STATUS.CANCELLED: 
        cancelled += 1;
        break;
      default:
        console.log('other status', qtr.status);
        other += 1;
      }
    });
  } else {
    initialised = qualifyingTest.counts.initialised;
    activated = qualifyingTest.counts.activated;
    started = qualifyingTest.counts.started;
    inProgress = qualifyingTest.counts.inProgress;
    completed = qualifyingTest.counts.completed;
    cancelled = qualifyingTest.counts.cancelled;
    outOfTime = qualifyingTest.counts.outOfTime;
  }

  await slack.post(`*Summary Stats: ${qualifyingTest.title}*\n\n - ${activated} participants\n - ${started} started\n - ${inProgress} in progress\n - ${completed} completed\n - ${outOfTime} auto-submitted`);

  return true;
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
