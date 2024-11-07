'use strict';

import config from './shared/config.js';
import { firebase, app, db } from './shared/admin.js';
import initGetQualifyingTestScores from '../functions/actions/qualifyingTests/getQualifyingTestScores.js';
const getQualifyingTestScores = initGetQualifyingTestScores(config, firebase, db);
// import initQts from '../functions/shared/qts.js';
// const qts = initQts(config);

const main = async () => {

  const result = await getQualifyingTestScores({
    testId: 'uDU98kUdVyDoqVesSHfM',
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
