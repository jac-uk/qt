'use strict';

const config = require('./shared/config');
const { db, firebase } = require('./shared/admin.js');
const updateCounts = require('../functions/actions/qualifyingTests/updateCounts')(config, firebase, db);
const main = async () => {
  const qualifyingTestId = 'LkhJCypOfRgj90NT2gQs';

  return await updateCounts(qualifyingTestId);
};

main()
  .then((result) => {
    console.log(result);
    return process.exit();
  })
  .catch((error) => {
    console.log(error);
    process.exit();
  });
