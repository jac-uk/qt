/*eslint func-style: ["error", "declaration"]*/
import { QUALIFYING_TEST } from '@/helpers/constants';

export {
  isDryRun,
  isScenario,
  isCriticalAnalysis,
  isSituationalJudgement
};

function isDryRun() {
  return this.qualifyingTest && this.qualifyingTest.mode && this.qualifyingTest.mode === 'dry-run';
}

function isScenario() {
  return this.qualifyingTest.type === QUALIFYING_TEST.TYPE.SCENARIO;
}

function isCriticalAnalysis() {
  return this.qualifyingTest.type === QUALIFYING_TEST.TYPE.CRITICAL_ANALYSIS;
}

function isSituationalJudgement() {
  return this.qualifyingTest.type === QUALIFYING_TEST.TYPE.SITUATIONAL_JUDGEMENT;
}
