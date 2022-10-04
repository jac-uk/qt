'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const getQualifyingTestScores = require('../functions/actions/qualifyingTests/getQualifyingTestScores')(config, firebase, db);
// const qts = require('../functions/shared/qts')(config);

const main = async () => {

  const result = await getQualifyingTestScores({
    testId: 'yOoxvzGEx2FSRko04zop',
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
