'use strict';

import { auth, app, db } from './shared/admin.js';
import initSignIn from '../functions/actions/qualifyingTests/signIn.js';
const signIn = initSignIn(db, auth);

const main = async () => {
  return signIn({ email: 'test1@jac.test' });
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
