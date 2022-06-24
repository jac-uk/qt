'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const addParticipants = require('../functions/actions/qualifyingTests/updateQualifyingTestParticipants')(config, firebase, db);
// const qts = require('../functions/shared/qts')(config);

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
