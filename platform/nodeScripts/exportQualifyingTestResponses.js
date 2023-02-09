'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const { exportQualifyingTestResponses } = require('../functions/actions/qualifyingTestResponses/export')(config, firebase, db);
// const qts = require('../functions/shared/qts')(config);

const main = async () => {

  const result = await exportQualifyingTestResponses('YnAOS3FmLDE2dPBg4Jw4');

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
