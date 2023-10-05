'use strict';

const config = require('./shared/config');
const { app, db } = require('./shared/admin.js');
const { getDocument, getDocuments } = require('../functions/shared/helpers');

const main = async () => {
  const qualifyingTestId = 'aWl97MFdBFgD3YLUUOhk';

  const qualifyingTest = await getDocument(db.collection('qualifyingTests').doc(qualifyingTestId));
  if (!qualifyingTest) return false;

  const qualifyingTestResponses = await getDocuments(db.collection('qualifyingTestResponses').where('qualifyingTest.id', '==', qualifyingTestId).select('status', 'isOutOfTime'));

  let initialised = 0;
  let activated = 0;
  let started = 0;
  let inProgress = 0;
  let completed = 0;
  let cancelled = 0;
  let outOfTime = 0;
  let other = 0;

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

  console.log('initialised', initialised);
  console.log('activated', activated);
  console.log('started', started);
  console.log('inProgress', inProgress);
  console.log('completed', completed);
  console.log('cancelled', cancelled);
  console.log('outOfTime', outOfTime);
  console.log('other', other);

  const saveData = {};
  saveData['counts.initialised'] = initialised;
  saveData['counts.activated'] = activated;
  saveData['counts.started'] = started;
  saveData['counts.inProgress'] = inProgress;
  saveData['counts.completed'] = completed;
  saveData['counts.cancelled'] = cancelled;
  saveData['counts.outOfTime'] = outOfTime;

  console.log('saveData', saveData);
  await qualifyingTest.ref.update(saveData);

  return qualifyingTestResponses.length;
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
