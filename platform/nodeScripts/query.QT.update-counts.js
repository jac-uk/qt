'use strict';

import config from './shared/config.js';
import { db, firebase } from './shared/admin.js';

import initUpdateCounts from '../functions/actions/qualifyingTests/updateCounts.js';
const updateCounts = initUpdateCounts(config, firebase, db);

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
