import assert from 'assert';
import { firebaseFunctionsTest, generateMockContext } from './helpers.js';
// import { PERMISSIONS } from '../functions/shared/permissions.js';
import initialiseQualifyingTest from '../../functions/callableFunctions/initialiseQualifyingTest.js';

const { wrap } = firebaseFunctionsTest;

xdescribe('initialiseQualifyingTest', () => {
  context('Permission', () => {
    it ('has no permission', async () => {
      const wrapped = wrap(initialiseQualifyingTest);
      try {
        await wrapped({}, generateMockContext());
      } catch (e) {
        assert.equal(e.code, 'permission-denied');
      }
    });
  });
});
