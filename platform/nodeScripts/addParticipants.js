'use strict';

import config from './shared/config.js';
import { firebase, app, db } from './shared/admin.js';

import initAddParticipants from '../functions/actions/qualifyingTests/updateQualifyingTestParticipants';
const addParticipants = initAddParticipants(config, firebase, db);
// import initQts from '../functions/shared/qts';
// const qts = initQts(config);

const main = async () => {

  const result = await addParticipants({
    testId: 'yOoxvzGEx2FSRko04zop',
    participants: [
      {
        ref: 'ref123',
        email: 'warren@precise-minds.co.uk',
        fullName: 'Warren Searle',
        adjustments: false,
      }
    ],
  });

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
