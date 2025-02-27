import { Timestamp, serverTimestamp, arrayUnion } from '@firebase/firestore';

const prepareSaveHistory = function (data, questionNumber) {
  const timeNow = serverTimestamp();
  const date = new Date();
  data = {
    ...data,
    timestamp: Timestamp.fromDate(date),
    utcOffset: date.getTimezoneOffset(),
  };
  if (questionNumber) {
    data = {
      ...data,
      question: questionNumber - 1,
      location: `question ${questionNumber}`,
    };
  }

  const objToSave = {
    history: arrayUnion(data),
    lastUpdated: timeNow,
  };
  return objToSave;
};

const prepareSaveQuestionSession = function (questionSessionStart, questionNumber) {
  const timeNow = serverTimestamp();
  const date = new Date();
  const data = {
    start: questionSessionStart,
    end: Timestamp.fromDate(date),
    question: questionNumber - 1,
    timestamp: Timestamp.fromDate(date),
    utcOffset: date.getTimezoneOffset(),
  };

  const objToSave = {
    questionSession: arrayUnion(data),
    lastUpdated: timeNow,
  };
  return objToSave;
};

const saveHistoryAndSession = function(data, number, questionSessionStart) {
  const historyToSave = prepareSaveHistory(data, number);
  const sessionToSave = prepareSaveQuestionSession(questionSessionStart, number);
  return {
    ...historyToSave,
    ...sessionToSave,
  };
};

export {
  prepareSaveQuestionSession,
  prepareSaveHistory,
  saveHistoryAndSession
};
