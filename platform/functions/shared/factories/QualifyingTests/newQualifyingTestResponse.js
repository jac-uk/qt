const { getSearchMap } = require('../../search');
 
module.exports = (config, firebase) => {

  return newQualifyingTestResponse;

  function newQualifyingTestResponse(qualifyingTest, inputData) {
    const data = {
      qualifyingTest: {
        id: qualifyingTest.id,
        type: qualifyingTest.type,
        isTieBreaker: qualifyingTest.isTieBreaker ? qualifyingTest.isTieBreaker : false,
        title: qualifyingTest.title,
        startDate: qualifyingTest.startDate,
        endDate: qualifyingTest.endDate,
        additionalInstructions: qualifyingTest.additionalInstructions,
        // questions: [],  // @TODO move questions here instead of testQuestions
      },
      testQuestions: [],
      duration: {
        testDuration: qualifyingTest.testDuration,
        reasonableAdjustment: 0,
        testDurationAdjusted: qualifyingTest.testDuration,
      },
      responses: [],
      statusLog: {
        created: firebase.firestore.FieldValue.serverTimestamp(),
        activated: null,
        started: null,
        completed: null,
      },
      status: config.QUALIFYING_TEST_RESPONSES.STATUS.CREATED,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
    };
    if (qualifyingTest.mode === 'dry-run') {
      data.participant = {
        email: inputData.toLowerCase(),
        id: null,
        fullName: null,
        reasonableAdjustments: false,
      };
    } else {
      data.participant = {
        id: null, // reserved for user's auth id and is set (via UI) when they start the test
        srcId: inputData.srcId || '',
        ref: inputData.ref || '',
        email: inputData.email,
        fullName: inputData.fullName,
        reasonableAdjustments: inputData.adjustments ? true : false,
      };
    }

    // add search map
    data._search = getSearchMap([data.participant.email, data.participant.fullName]);

    return data;
  }
};

