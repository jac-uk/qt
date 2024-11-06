import functions from 'firebase-functions';
import config from '../shared/config.js';

import { db } from '../shared/admin.js';

import { checkArguments } from '../shared/helpers.js';

import initQts from '../shared/qts';
const qts = initQts(config);

import initServiceSettings from '../shared/serviceSettings.js';
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  if (!checkArguments({
    folder: { required: true },
    test: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  await checkFunctionEnabled();

  // create QT
  const response = await qts.post('qualifying-test', {
    folder: data.folder,
    test: data.test,
  });

  // list QTs in folder
  // const response = await qts.get('qualifying-tests', {
  //   folder: data.folder,
  // });

  return response;
});
