const { getDocument, getDocuments, applyUpdates } = require('../../shared/helpers');
const updateQualifyingTestParticipants = require('./updateQualifyingTestParticipants');

module.exports = (config, firebase, db) => {

  return getQualifyingTestScores;

  /**
  * getQualifyingTestScores
  * Get scores for a qualifying test
  * @param {*} `params` is an object containing
  *   `testId` (required) Id of test
  */
  async function getQualifyingTestScores(params) {

    if (!params) return { success: false, message: 'No params' };
    if (!params.testId) return { success: false, message: 'No testId' };

    // get test
    const testRef = db.collection('qualifyingTests').doc(params.testId);
    const qualifyingTest = await getDocument(testRef);
    if (!qualifyingTest) return { success: false, message: 'Test not found' };
    if (qualifyingTest.status !== config.QUALIFYING_TEST.STATUS.COMPLETED) return { success: false, message: 'Test not completed' };

    // get test responses
    let qualifyingTestResponsesRef = db.collection('qualifyingTestResponses')
      .where('qualifyingTest.id', '==', qualifyingTest.id)
      // .where('activated', '==', null)
      .select('score', 'status', 'participant');
    const qualifyingTestResponses = await getDocuments(qualifyingTestResponsesRef);

    // TODO ensure we include all mopup test responses too

    // get scores data
    const scores = {};
    qualifyingTestResponses.forEach(response => {
      scores[response.participant.srcId] = response.score;
    });

    return {
      success: true,
      message: 'Scores are available',
      scores: scores,
    };

  }

};
