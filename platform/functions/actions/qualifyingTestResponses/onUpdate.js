const { applyUpdates } = require('../../shared/helpers');

module.exports = (config, firebase, db) => {

  const { sendEmail } = require('../../shared/notify')(config);

  return onUpdate;

  /**
   * Qualifying Test Response event handler for Update
   * - if status has changed to started or completed update counts in qualifyingTest
   * - if document has been moved to another qualifyingTest then update counts in both tests
   */
  async function onUpdate(dataBefore, dataAfter, ref) {
    if (dataBefore.status !== dataAfter.status) {
      const increment = firebase.firestore.FieldValue.increment(1);
      const decrement = firebase.firestore.FieldValue.increment(-1);
      const qualifyingTestId = dataBefore.qualifyingTest.id;
      const data = {};
      const statusBefore = dataBefore.status;
      const statusAfter = dataAfter.status;
      // started test
      if (
        statusBefore === config.QUALIFYING_TEST_RESPONSES.STATUS.ACTIVATED &&
        statusAfter === config.QUALIFYING_TEST_RESPONSES.STATUS.STARTED
      ) {
        data[`counts.${statusAfter}`] = increment;
        data['counts.inProgress'] = increment;
      }

      // reset started test
      if (
        statusBefore === config.QUALIFYING_TEST_RESPONSES.STATUS.STARTED &&
        statusAfter === config.QUALIFYING_TEST_RESPONSES.STATUS.ACTIVATED
      ) {
        data[`counts.${config.QUALIFYING_TEST_RESPONSES.STATUS.STARTED}`] = decrement;
        data['counts.inProgress'] = decrement;
      }

      // completed test
      if (
        statusBefore === config.QUALIFYING_TEST_RESPONSES.STATUS.STARTED &&
        statusAfter === config.QUALIFYING_TEST_RESPONSES.STATUS.COMPLETED
      ) {
        data[`counts.${statusAfter}`] = increment;
        data['counts.inProgress'] = decrement;
        if (dataAfter.isOutOfTime) {
          data['counts.outOfTime'] = increment;
        }

        // Send email to candidate confirming their test response has been received
        const participantEmail = dataAfter.participant.email;
        const feedbackSurvey = dataAfter.qualifyingTest.feedbackSurvey;
        // check if feedback survey link exists
        const templateId  = feedbackSurvey ? 'ea226c24-de15-4c51-9d5b-28755c9824b1' : '3717496b-69d7-4eab-b6bd-3b7815e4efc6';
        const testType = ('type' in dataAfter && dataAfter.type) ? dataAfter.type
          .replace(/([a-z])([A-Z])/g, '$1 $2')  // insert a space between lower & upper & make lowercase
          .toLowercase() : '';
        const personalisation = {
          testTitle: dataAfter.qualifyingTest.title,
          testType: testType,
          feedbackSurvey: feedbackSurvey,
        };
        sendEmail(participantEmail, templateId, personalisation);
      }

      // reset completed test
      if (
        statusBefore === config.QUALIFYING_TEST_RESPONSES.STATUS.COMPLETED &&
        statusAfter === config.QUALIFYING_TEST_RESPONSES.STATUS.ACTIVATED
      ) {
        data[`counts.${config.QUALIFYING_TEST_RESPONSES.STATUS.COMPLETED}`] = decrement;
        // rollback started number if added
        if (dataBefore.statusLog &&
            dataAfter.statusLog &&
            dataBefore.statusLog[config.QUALIFYING_TEST_RESPONSES.STATUS.STARTED] !== null &&
            dataAfter.statusLog[config.QUALIFYING_TEST_RESPONSES.STATUS.STARTED] === null) {
          
            data[`counts.${config.QUALIFYING_TEST_RESPONSES.STATUS.STARTED}`] = decrement; 
        }
        // reset auto submit counts and flag
        if (dataBefore.isOutOfTime && !dataAfter.isOutOfTime) {
          data['counts.outOfTime'] = decrement;
        }
      }

      // mark activated to completed
      if (
        statusBefore === config.QUALIFYING_TEST_RESPONSES.STATUS.ACTIVATED &&
        statusAfter === config.QUALIFYING_TEST_RESPONSES.STATUS.COMPLETED
      ) {
        data[`counts.${statusAfter}`] = increment;
      }

      if (Object.keys(data).length > 0) {
        await db.doc(`qualifyingTests/${qualifyingTestId}`).update(data);
      }
    }

    // move participant to other test (mop up test)
    if (dataBefore.qualifyingTest.id !== dataAfter.qualifyingTest.id) {
      const increment = firebase.firestore.FieldValue.increment(1);
      const decrement = firebase.firestore.FieldValue.increment(-1);

      // reset counts of previous statuses
      const previousStatuses = listPreviousStatuses(dataBefore.status);

      const updateBefore = previousStatuses.reduce((data, status) => {
        data[`counts.${status}`] = decrement;
        return data;
      }, {});
      if (dataBefore.isOutOfTime) {
        updateBefore['counts.outOfTime'] = decrement;
      }

      const updateAfter = {
        'counts.initialised': increment,
      };
      const commands = [];
      commands.push({
        command: 'update',
        ref: db.collection('qualifyingTests').doc(dataBefore.qualifyingTest.id),
        data: updateBefore,
      });
      commands.push({
        command: 'update',
        ref: db.collection('qualifyingTests').doc(dataAfter.qualifyingTest.id),
        data: updateAfter,
      });
      const result = await applyUpdates(db, commands);
      return result;
    }
    return true;
  }

  function listPreviousStatuses(targetStatus) {
    const orderedStatuses = [
      'initialised',
      config.QUALIFYING_TEST_RESPONSES.STATUS.ACTIVATED,
      config.QUALIFYING_TEST_RESPONSES.STATUS.STARTED,
      config.QUALIFYING_TEST_RESPONSES.STATUS.COMPLETED,
    ];

    if (!orderedStatuses.includes(targetStatus)) {
      return [];
    }

    const previousStatuses = [];
    for (const status of orderedStatuses) {
      previousStatuses.push(status);
      if (status === targetStatus) break;
    }
    return previousStatuses;
  }

};
