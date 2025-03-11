'use strict';

import config from './shared/config.js';
import { firebase, app, db } from './shared/admin.js';
import initUpdateCounts from '../functions/actions/qualifyingTests/updateCounts.js';
const updateCounts = initUpdateCounts(config, firebase, db);

const main = async () => {
  const tests = {};

  tests.CAT_main = await updateCounts('kSYkoLXSXv9Z0He6bANK');
  tests.CAT_12th = await updateCounts('ZYoLN3CXSc1nBlhIYxy1');
  tests.CAT_13th = await updateCounts('WfED1D80PCIFRMGJBDWP');
  tests.CAT_19th = await updateCounts('mKkK65o8eGHpvNS4vYjS');
  tests.CAT_31st = await updateCounts('YRPHBQ2QWtNBWsM866Pn');

  tests.SJT_main = await updateCounts('HQwAPKDR4KeDKU1Fi4dO');
  tests.SJT_12th = await updateCounts('xAmVm71DNB1CidzTTUGf');
  tests.SJT_13th = await updateCounts('qt9ct3ebKPlSOppOoune');
  tests.SJT_19th = await updateCounts('xYLt9QYhg2dypLtJsUtG');
  tests.SJT_31st = await updateCounts('IbuggoIxV5SL4ioVRd8m');

  return tests;
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
