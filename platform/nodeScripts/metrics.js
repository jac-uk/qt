'use strict';

import { app, db } from './shared/admin.js';
// import { applyUpdates } from '../functions/shared/helpers.js';

const main = async () => {
  const stats = {};
  const oneMonthAgo = new Date(new Date().setMonth(new Date().getMonth() - 1));
  const startDate = oneMonthAgo;
  const qualifyingTests = await db.collection('qualifyingTests').where('startDate', '>=', startDate).where('status', '==', 'completed').select().get();
  stats.qualifyingTests = qualifyingTests.docs.length;
  const qualifyingTestResponses = await db.collection('qualifyingTestResponses').where('qualifyingTest.startDate', '>=', startDate).where('status', '==', 'completed').select().get();
  stats.qualifyingTestResponses = qualifyingTestResponses.docs.length;
  return stats;
};

main()
  .then((result) => {
    console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
