'use strict';

const config = require('./shared/config');
const slack = require('../functions/shared/slack')(config);

const main = async () => {
  await slack.post('Test :)');
  return;
};

main()
.then((result) => {
  console.log('Result', result);
  return process.exit();
})
.catch((error) => {
  console.error(error);
  process.exit();
});
