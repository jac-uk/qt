import { getDocument, applyUpdates } from '../../shared/helpers.js';
import initNewQualifyingTestResponse from '../../shared/factories/QualifyingTests/newQualifyingTestResponse.js';

export default (config, firebase, db) => {
  const newQualifyingTestResponse = initNewQualifyingTestResponse(config, firebase);

  return initialiseQualifyingTest;

  /**
  * initialiseQualifyingTest
  * Creates qualifyingTestResponse document for each candidate invited to the qualifying test
  * @param {*} `params` is an object containing
  *   `qualifyingTestId` (required) ID of qualifying test
  *   `stage` (optional) exercise stage
  *   `status` (optional) candidate status
  */
  async function initialiseQualifyingTest(params) {

    // get qualifying test
    const qualifyingTest = await getDocument(db.doc(`qualifyingTests/${params.qualifyingTestId}`));

    if (qualifyingTest.status !== 'approved') { return false; }

    // get participants
    let participants = [];
    if (qualifyingTest.mode === 'mop-up') {
      // do nothing as there are no participants
    } else if (qualifyingTest.mode === 'dry-run') {
      participants = qualifyingTest.invitedEmails;
    } else {
      participants = qualifyingTest.participants;
    }

    // construct db commands
    const commands = [];
    for (let i = 0, len = participants.length; i < len; ++i) {
      const participant = participants[i];
      commands.push({
        command: 'set',
        ref: db.collection('qualifyingTestResponses').doc(),
        data: newQualifyingTestResponse(qualifyingTest, participant),
      });
    }

    // update qualifying test status and counts
    commands.push({
      command: 'update',
      ref: qualifyingTest.ref,
      data: {
        status: 'initialised',
        counts: {
          initialised: participants.length,
          activated: 0,
          started: 0,
          inProgress: 0,
          outOfTime: 0,
          completed: 0,
        },
      },
    });

    // write to db
    const result = await applyUpdates(db, commands);
    return result ? participants.length : false;

  }

};
