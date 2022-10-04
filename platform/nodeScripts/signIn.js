'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const signIn = require('../functions/actions/qualifyingTests/signIn')(config, firebase, db);

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
