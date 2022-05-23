'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const listQualifyingTests = require('../functions/actions/qualifyingTests/listQualifyingTests')(config, firebase, db);
// const qts = require('../functions/shared/qts')(config);

const main = async () => {

  const result = await listQualifyingTests({
    key: 'secret',
    folder: 'JAC0006',
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
