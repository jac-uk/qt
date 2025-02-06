import { getDocument, getDocuments, applyUpdates } from '../../shared/helpers.js';

export default (config, firebase, db) => {

  return updateQualifyingTestParticipants;

  /**
  * updateQualifyingTestParticipants
  * Add participants to a qualifying test
  * @param {*} `params` is an object containing
  *   `testId` (required) Id of test
  *   `participants` (required) array of particpant objects with following structure
  *       `ref` (required)
  *       `email` (required)
  *       `fullName` (optional)
  *       `adjustments` (optional)
  */
  async function updateQualifyingTestParticipants(params) {

    if (!params) return { success: false, message: 'No params' };
    if (!params.testId) return { success: false, message: 'No testId' };
    if (!params.participants) return { success: false, message: 'No participants' };
    if (!params.participants.length) return { success: false, message: 'No participants (2)' };

    // get test
    const testRef = db.collection('qualifyingTests').doc(params.testId);
    const qualifyingTest = await getDocument(testRef);
    if (!qualifyingTest) return { success: false, message: 'Test not found' };

    // validate participants
    const participants = [];
    params.participants.forEach(p => {
      if (p.ref && p.email) {
        const participant = {};
        participant.srcId = p.srcId;
        participant.ref = p.ref;
        participant.email = p.email;
        participant.fullName = p.fullName ? p.fullName : '';
        participant.adjustments = p.adjustments || false;
        participants.push(participant);
      }
    });

    // update test with participants
    await testRef.update({
      participants: participants,
    });

    // TODO ensure all participants are imported. If not then return list of erroneous participants

    return {
      success: true,
      message: 'Participants imported successfully',
      total: participants.length,
    };

  }

};
