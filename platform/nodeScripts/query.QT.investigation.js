'use strict';

// import config from './shared/config.js';
import { app, db } from './shared/admin.js';
import { getDocuments } from '../functions/shared/helpers.js';

const main = async () => {
  // const qualifyingTestId = 'yubYbWZ5WGQoG2OhHTfT'; // CAT
  const qualifyingTestId = 'aoUAW3MsvTkwwG80AA4I'; // SJT

  const qualifyingTestResponses = await getDocuments(
    db.collection('qualifyingTestResponses')
    .where('qualifyingTest.id', '==', qualifyingTestId)
    .where('status', '==', 'created')
    .select('status', 'isOutOfTime', 'participant')
  );

  qualifyingTestResponses.forEach(qtr => {
    console.log(qtr.participant.fullName, qtr.participant.email, `https://qt-admin.judicialappointments.digital/folder/zGKsFAuRWHm3a7gWVC0A/qualifying-tests/aoUAW3MsvTkwwG80AA4I/response/${qtr.id}/`);
  });

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
