'use strict';

import config from './shared/config.js';
import { firebase, app, db } from './shared/admin.js';
import initScoreQualifyingTest from '../functions/actions/qualifyingTests/scoreQualifyingTest.js';
const scoreQualifyingTest = initScoreQualifyingTest(config, firebase, db);

const main = async () => {
  return scoreQualifyingTest({ qualifyingTestId: 'LkhJCypOfRgj90NT2gQs' });
};

main()
  .then((result) => {
    console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
