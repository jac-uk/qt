'use strict';

import config from './shared/config.js';
import { firebase, app, db } from './shared/admin.js';

import initInitialiseQualifyingTest from '../actions/qualifyingTests/initialiseQualifyingTest'
const initialiseQualifyingTest = initInitialiseQualifyingTest(config, firebase, db);

const main = async () => {
  return initialiseQualifyingTest({
    qualifyingTestId: 'fFyEfMigQDAcXPwri0Iz',
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
