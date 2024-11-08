'use strict';

import config from './shared/config.js';
import { firebase, app, db } from './shared/admin.js';
import initSignIn from '../functions/actions/qualifyingTests/signIn.js';
const signIn = initSignIn(config, firebase, db);

const main = async () => {
  return signIn({ email: 'warren@precise-minds.co.uk' });
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
