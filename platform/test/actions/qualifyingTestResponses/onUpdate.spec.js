
import config from '../../../functions/shared/config';
import { firebase } from 'firebase-admin';
// @TODO use firebase testing tools (and emulator)
const mockDb = jest.fn();

import initOnQualifyingTestResponsesUpdate from '../../../functions/actions/qualifyingTestResponses/onUpdate';
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
