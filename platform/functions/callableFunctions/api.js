import express from 'express';
import cors from 'cors';

import functions from 'firebase-functions';
import config from '../shared/config.js';
import { firebase, db } from '../shared/admin.js';
import { checkArguments } from '../shared/helpers.js';

import initServiceSettings from '../shared/serviceSettings.js';
const { isFunctionEnabled } = initServiceSettings(db);

import initListQualifyingTests from '../actions/qualifyingTests/listQualifyingTests.js';
import initCreateQualifyingTest from '../actions/qualifyingTests/createQualifyingTest.js';
import initUpdateQualifyingTestParticipants from '../actions/qualifyingTests/updateQualifyingTestParticipants.js';
import initGetQualifyingTestScores from '../actions/qualifyingTests/getQualifyingTestScores.js';

const api = express();

api.use(cors({ origin: true }));

// api home page
api.get(['/v1', '/v1/'], async (req, res) => {
  res
    .status(200)
    .send('API: Online tests');
});

// list qualifying tests
api.get(['/v1/qualifying-tests', '/v1/qualifying-tests/'], async (req, res) => {
  checkAccess(req, res);
  if (!checkArguments({
    key: { required: true },
    folder: { required: true },
  }, req.query)) {
    return res.status(400).send('Please provide valid arguments');
  }
  if (!isFunctionEnabled('listQualifyingTests')) return res.status(400).send('Service offline');
  try {
    const listQualifyingTests = initListQualifyingTests(config, firebase, db);
    const result = await listQualifyingTests({ folder: req.query.folder });
    return res
      .status(200)
      .send(result);
  } catch (error) {
    return res
      .status(500)
      .send(error);
  }
});

// create qualifying test
api.post(['/v1/qualifying-test', '/v1/qualifying-test/'], async (req, res) => {
  checkAccess(req, res);
  if (!checkArguments({
    key: { required: true },
    folder: { required: true },
    test: { required: true },
  }, { ...req.query, ...req.body })) {
    return res.status(400).send('Please provide valid arguments');
  }
  if (!isFunctionEnabled('createQualifyingTest')) return res.status(400).send('Service offline');
  try {
    const createQualifyingTest = initCreateQualifyingTest(config, firebase, db);
    const result = await createQualifyingTest(req.body);
    return res
      .status(200)
      .send(result);
  } catch (error) {
    return res
      .status(500)
      .send(error);
  }
});

// update qualifying participants
api.post(['/v1/participants', '/v1/participants/'], async (req, res) => {
  checkAccess(req, res);
  if (!checkArguments({
    key: { required: true },
    testId: { required: true },
    participants: { required: true },
  }, { ...req.query, ...req.body })) {
    return res.status(400).send('Please provide valid arguments');
  }
  if (!isFunctionEnabled('updateQualifyingTestParticipants')) return res.status(400).send('Service offline');
  try {
    const updateQualifyingTestParticipants = initUpdateQualifyingTestParticipants(config, firebase, db);
    const result = await updateQualifyingTestParticipants(req.body);
    return res
      .status(200)
      .send(result);
  } catch (error) {
    return res
      .status(500)
      .send(error);
  }
});

// get scores
api.get(['/v1/scores', '/v1/scores/'], async (req, res) => {
  checkAccess(req, res);
  if (!checkArguments({
    key: { required: true },
    testId: { required: true },
  }, req.query)) {
    return res.status(400).send('Please provide valid arguments');
  }
  if (!isFunctionEnabled('getQualifyingTestScores')) return res.status(400).send('Service offline');
  try {
    const getQualifyingTestScores = initGetQualifyingTestScores(config, firebase, db);
    const result = await getQualifyingTestScores({ testId: req.query.testId });
    return res
      .status(200)
      .send(result);
  } catch (error) {
    return res
      .status(500)
      .send(error);
  }
});

function checkAccess(req, res) {
  if (!req.query.key) { res.status(400).send('Missing key'); }
  if (req.query.key !== config.QT_KEY) { res.status(400).send('Incorrect key'); }
}

export default functions.region('europe-west2').https.onRequest(api);
