
import config from '../../../functions/shared/config.js';
import firebase from 'firebase-admin';
import { jest } from '@jest/globals';

// @TODO use firebase testing tools (and emulator)
const mockDb = jest.fn();

import initOnQualifyingTestResponsesUpdate from '../../../functions/actions/qualifyingTestResponses/onUpdate.js';
const onQualifyingTestResponsesUpdate = initOnQualifyingTestResponsesUpdate(config, firebase, mockDb);

describe('onQualifyingTestResponsesUpdate()', () => {

  xit('increments qualifyingTest started count when test is started', async () => {
    const dataBefore = {
      status: 'activated',
    };
    const dataAfter = {
      status: 'started',
    };
    onQualifyingTestResponsesUpdate(dataBefore, dataAfter);
    expect(mockDb).toBe();
  });

});
