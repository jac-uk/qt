import { getDocuments } from '../../shared/helpers.js';

export default (db, auth) => {

  return signIn;

  /**
  * signIn
  * Sign in to QT platform
  * @param {*} `params` is an object containing
  *   `email` (required) Email of participant trying to sign in
  */
  async function signIn(params) {

    if (!params) return { success: false, message: 'No params' };
    if (!params.email) return { success: false, message: 'Required params missing' };

    // check email has at least one qualifying test
    const tests = await getDocuments(db.collection('qualifyingTestResponses').where('participant.email', '==', params.email));
    if (!tests.length) {
      return { success: false, message: 'No tests' };
    }

    // check email has access to requested test
    if (params.testId) {
      const test = tests.find(test => (test.qualifyingTest && test.qualifyingTest.id === params.testId));
      if (!test) {
        return { success: false, message: 'Not invited to test' };
      }
    }

    // get custom token
    try {
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(params.email);
      } catch (e) {
        userRecord = await auth.createUser({
          email: params.email,
          emailVerified: false,
        });
      }
      const token = await auth.createCustomToken(userRecord.uid);
      return {
        success: true,
        token: token,
      };
    } catch (e) {
      return {
        success: false,
        message: `Could not create token: ${e}`,
      };
    }
  }

};
