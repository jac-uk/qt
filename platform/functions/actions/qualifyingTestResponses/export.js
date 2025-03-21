import { formatDate } from '../../shared/converters/helpers.js';
import { getDocument, getDocuments } from '../../shared/helpers.js';

export default (config, firebase, db) => {

  const QUALIFYING_TEST = config.QUALIFYING_TEST;

  const getHeaders = (qualifyingTest) => {
    const headers = [
      'ID',
      'Reference number',
      'Full Name',
      'Total Duration',
      'Adjust applied',
      'Time Taken',
      'Status',
      'Started',
      'Completed',
      `${typeInitials(qualifyingTest.type)} Score`,
    ];

    qualifyingTest.testQuestions.questions.forEach((question, index) => {
      if (qualifyingTest.type === QUALIFYING_TEST.TYPE.SITUATIONAL_JUDGEMENT) {
        headers.push(
          `Q${ index + 1 }. Most Appropriate`,
          `Q${ index + 1 }. Least Appropriate`,
          `Q${ index + 1 }. Score`
        );
      }
      if (qualifyingTest.type === QUALIFYING_TEST.TYPE.SCENARIO) {
        question.options.forEach((option, decimal) => {
          headers.push(`Scenario ${ index + 1 }. Question ${ decimal + 1 }: ${ option.question }`);
        });
      }
      if (qualifyingTest.type === QUALIFYING_TEST.TYPE.CRITICAL_ANALYSIS) {
        headers.push(
          `Q${ index + 1 }. Answer`,
          `Q${ index + 1 }. Score`
        );
      }
    });

    return headers;
  };

  const getData = (qualifyingTest, qualifyingTestResponses) => {

    const sortedByScoresArr = qualifyingTestResponses.slice().sort((a, b) => {return a.score - b.score;}).reverse();

    return sortedByScoresArr.map(element => {
      const row = [
        element.id,
        element.participant.ref,
        element.participant.fullName || element.participant.email,
        element.duration.testDurationAdjusted,
        element.duration.reasonableAdjustment,
        timeTaken(element),
        element.status,
        formatDate(element.statusLog.started, 'longdatetime'),
        formatDate(element.statusLog.completed, 'longdatetime'),
        element.score,
      ];

      switch (qualifyingTest.type){
      case QUALIFYING_TEST.TYPE.SITUATIONAL_JUDGEMENT:
        qualifyingTest.testQuestions.questions.forEach((question, index) => {
          let response = [];
          if (element.responses.length) {
            response = element.responses[index];
          } else {
            if (element.testQuestions && element.testQuestions.questions) {
              response = element.testQuestions.questions[index].response;
            }
          }
          if (response && response.selection) {
            const responseSelection = response.selection;
            const mostAppropriate = responseSelection.mostAppropriate !== undefined && responseSelection.mostAppropriate !== null ? question.options[responseSelection.mostAppropriate].answer : '---';
            const leastAppropriate = responseSelection.leastAppropriate !== undefined && responseSelection.leastAppropriate !== null ? question.options[responseSelection.leastAppropriate].answer : '---';
            const score = response.score ? response.score : 0;
            row.push(
              mostAppropriate,
              leastAppropriate,
              score
            );
          } else {
            row.push(
              '---',
              '---',
              '---'
            );
          }
        });
        break;
      case QUALIFYING_TEST.TYPE.SCENARIO:
        qualifyingTest.testQuestions.questions.forEach((question, index) => {
          let responses = [];
          if (element.responses.length) {
            responses = element.responses[index].responsesForScenario;
          } else {
            if (element.testQuestions && element.testQuestions.questions) {
              responses = element.testQuestions.questions[index].responses;
            }
          }
          if (responses) {
            responses.forEach((response) => {
              row.push(response.text === undefined || response.text === null ? 'Question skipped' : response.text);
            });
          }
        });
        break;
      case QUALIFYING_TEST.TYPE.CRITICAL_ANALYSIS:
        qualifyingTest.testQuestions.questions.forEach((question, index) => {
          let response = [];
          if (element.responses.length) {
            response = element.responses[index];
          } else {
            if (element.testQuestions && element.testQuestions.questions) {
              response = element.testQuestions.questions[index].response;
            }
          }
          if (response) {
            const responseSelection = response.selection;
            if (responseSelection !== undefined && responseSelection !== null) {
              row.push(
                question.options[response.selection].answer,
                response.score
              );
            } else {
              row.push('---','---');
            }
          } else {
            row.push('---','---');
          }
        });
        break;
      }
      return row;
    });
  };

  const typeInitials = (string) => {
    let result;
    const strArray = string.split('-');
    if (strArray.length === 1) {
      result =  'SC';
    } else {
      result = `${strArray[0].charAt(0)}${strArray[strArray.length - 1].charAt(0)}`;
    }
    return result.toUpperCase();
  };

  const timeTaken = (response) => {
    let diff = 0;
    if (response.statusLog.completed && response.statusLog.started) {
      diff = response.statusLog.completed - response.statusLog.started;
    }
    const date = new Date(null);
    date.setSeconds(diff);
    const hhmmssFormat = date.toISOString().substring(11, 19);
    return hhmmssFormat;
  };

  /**
   * Generates an export of all application contacts for the specified exercise
   * @param {uuid} qualifyingTestId
   */
  async function exportQualifyingTestResponses(qualifyingTestId) {

    // get qualifying test
    const qualifyingTest = await getDocument(db.collection('qualifyingTests').doc(qualifyingTestId));

    // get responses
    const qualifyingTestResponses = await getDocuments(db.collection('qualifyingTestResponses')
      .where('qualifyingTest.id', '==', qualifyingTestId)
    );

    const report = {
      headers: getHeaders(qualifyingTest),
      rows: getData(qualifyingTest, qualifyingTestResponses),
    };

    return report;
  }

  return {
    exportQualifyingTestResponses,
  };

};
