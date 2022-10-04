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

    // get scores (for CA & SJ)
    let scores;
    if ([config.QUALIFYING_TEST.TYPE.CRITICAL_ANALYSIS, config.QUALIFYING_TEST.TYPE.SITUATIONAL_JUDGEMENT].indexOf(qualifyingTest.type) >= 0) {
      // get test responses
      let qualifyingTestResponsesRef = db.collection('qualifyingTestResponses')
        .where('qualifyingTest.id', '==', qualifyingTest.id)
        .select('score', 'status', 'participant');
      const qualifyingTestResponses = await getDocuments(qualifyingTestResponsesRef);

      // TODO ensure we include all mopup test responses too

      // get scores data
      scores = {};
      qualifyingTestResponses.forEach(response => {
        scores[response.participant.srcId] = response.score;
      });
    }

    const returnData = {
      success: true,
      message: 'Results are available',
      questionIds: getQuestionIds(qualifyingTest),
    };
    if (scores) returnData.scores = scores;
    if (qualifyingTest.maxScore) returnData.maxScore = qualifyingTest.maxScore;

    return returnData;
  }

  function getQuestionIds(qualifyingTest) {
    const questionIds = [];
    if (!qualifyingTest) return questionIds;
    if (!qualifyingTest.testQuestions) return questionIds;
    if (!qualifyingTest.testQuestions.questions) return questionIds;
    if (qualifyingTest.type === config.QUALIFYING_TEST.TYPE.SCENARIO) {
      qualifyingTest.testQuestions.questions.forEach((s, sIndex) => {
        s.options.forEach((q, qIndex) => {
          questionIds.push(`S${1 + sIndex}.Q${1+qIndex}`);
        });
      });
    } else {
      qualifyingTest.testQuestions.questions.forEach((q, qIndex) => {
        questionIds.push(`Q${1+qIndex}`);
      });
    }
    return questionIds;
  }

};
