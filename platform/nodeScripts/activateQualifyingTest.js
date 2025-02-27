'use strict';

import config from './shared/config.js';
import { firebase, app, db } from './shared/admin.js';

import initActivateQualifyingTest from '../functions/actions/qualifyingTests/activateQualifyingTest.js';
const activateQualifyingTest = initActivateQualifyingTest(config, firebase, db);

const main = async () => {
  return activateQualifyingTest({
    qualifyingTestId: 'A7TesElY4aI3392MfBKo',
  });
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
