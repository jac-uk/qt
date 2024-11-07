'use strict';

import config from './shared/config.js';
import { firebase, app, db } from './shared/admin.js';
import { initExportQualifyingTestResponses } from '../functions/actions/qualifyingTestResponses/export.js';
const exportQualifyingTestResponses = initExportQualifyingTestResponses(config, firebase, db);

// import initQts from '../functions/shared/qts.js';
// const qts = initQts(config);

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
