'use strict';

import config from './shared/config.js';
import initSlack from '../functions/shared/slack.js';
const slack = initSlack(config);

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
