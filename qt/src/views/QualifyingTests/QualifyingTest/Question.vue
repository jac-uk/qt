<template>
  <div class="govuk-grid-row">
    <div class="govuk-grid-column-two-thirds">
      <form
        v-if="response && loaded"
        ref="formRef"
        @submit.prevent="save(true, {})"
      >

        <Banner
          v-if="previousTestQuestion"
          status="warning"
        >
          You cannot amend your answer for this question as it was started on a previous test
        </Banner>

        <component
          :is="questionType"
          v-model="response.selection"
          :question="`${questionNumber}. ${question.details}`"
          :options="question.options"
          :disabled="previousTestQuestion"
          @answered="questionAnswered"
        />

        <p
          v-if="!canSaveAndContinue && isSituationalJudgment"
          class="govuk-hint"
        >
          Please select one option 'Most appropriate' and one 'Least appropriate' before clicking on 'Save and continue'.
        </p>

        <div class="moj-button-menu">
          <div class="moj-button-menu__wrapper">
            <button
              :class="`moj-button-menu__item govuk-button govuk-button--secondary govuk-!-margin-right-2 info-btn--question-${questionNumber}-${$route.params.qualifyingTestId}-skip`"
              type="button"
              @click="skip"
            >
              {{ isComingFromReview || isLastQuestion ? 'Skip to Review' : 'Skip to next question' }}
            </button>
            <ActionButton
              v-if="!previousTestQuestion"
              :propclass="`moj-button-menu__item govuk-button info-btn--question-${questionNumber}-${$route.params.qualifyingTestId}-save-and-continue`"
              :disabled="!canSaveAndContinue"
              :action="save"
            >
              Save and continue
            </ActionButton>
          </div>
        </div>
      </form>
      <LoadingMessage v-else/>
    </div>
  </div>
</template>
<script>
import { Timestamp } from '@firebase/firestore';
import CriticalAnalysis from '@/views/QualifyingTests/QualifyingTest/Question/CriticalAnalysis.vue';
import SituationalJudgement from '@/views/QualifyingTests/QualifyingTest/Question/SituationalJudgement.vue';
import { QUALIFYING_TEST } from '@/helpers/constants';
import Banner from '@/components/Page/Banner.vue';
import { prepareSaveHistory, prepareSaveQuestionSession, saveHistoryAndSession } from '@/helpers/qualifyingTestResponseHelpers';
import ActionButton from '@/components/ActionButton.vue';
import LoadingMessage from '@/components/LoadingMessage.vue';

export default {
  components: {
    CriticalAnalysis,
    SituationalJudgement,
    Banner,
    ActionButton,
    LoadingMessage,
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.isComingFromReview = from.name === 'online-test-review';
    });
  },
  beforeRouteUpdate(to, from, next) {
    this.isComingFromReview = from.name === 'online-test-review';
    next();
  },

  props: {
    autoSave: {
      type: Boolean,
      default: false,
    },
    exitTest: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    const questionNumber = this.$route.params.questionNumber;
    const questionNumberIndex = questionNumber - 1;
    const qualifyingTestResponse = this.$store.getters['qualifyingTestResponse/data']();
    const question = qualifyingTestResponse.testQuestions.questions[questionNumberIndex];
    let responses = qualifyingTestResponse.responses;

    if (responses.length === 0) {
      responses = new Array(qualifyingTestResponse.testQuestions.questions.length)
        .fill()
        .map(()=> {
          return ({
            selection: qualifyingTestResponse.qualifyingTest.type === QUALIFYING_TEST.TYPE.SITUATIONAL_JUDGEMENT ? {} : null,
            started: null,
            completed: null,
          });
        });
    }

    return {
      qualifyingTestResponse,
      question,
      response: responses[questionNumberIndex],
      responses,
      showDetails: true,
      previousTestQuestion: false,
      questionSessionStart: Timestamp.now(),
      isComingFromReview: false,
      loaded: false,
    };
  },
  computed: {
    questionType() {
      return this.qualifyingTestResponse.qualifyingTest.type;
    },
    questionNumber() {
      return parseInt(this.$route.params.questionNumber);
    },
    isLastQuestion() {
      return this.questionNumber === this.qualifyingTestResponse.testQuestions.questions.length;
    },
    hasStartedAllQuestions() {
      const firstQuestionNotStarted = this.qualifyingTestResponse.testQuestions.questions.find((question, index) => !(this.qualifyingTestResponse.responses[index] && this.qualifyingTestResponse.responses[index].started));
      return firstQuestionNotStarted ? false : true;
    },
    introduction() {
      return this.qualifyingTestResponse.qualifyingTest.questions.introduction;
    },
    isSituationalJudgment() {
      return this.qualifyingTestResponse.qualifyingTest.type === QUALIFYING_TEST.TYPE.SITUATIONAL_JUDGEMENT;
    },
    isCriticalAnalysis() {
      return this.qualifyingTestResponse.qualifyingTest.type === QUALIFYING_TEST.TYPE.CRITICAL_ANALYSIS;
    },
    isScenario() {
      return this.qualifyingTestResponse.qualifyingTest.type === QUALIFYING_TEST.TYPE.SCENARIO;
    },
    canSaveAndContinue() {
      if (this.previousTestQuestion) {
        return false;
      }
      switch (this.qualifyingTestResponse.qualifyingTest.type) {
      case QUALIFYING_TEST.TYPE.SITUATIONAL_JUDGEMENT:
        // eslint-disable-next-line no-case-declarations
        const haveMost = this.response.selection.mostAppropriate !== null && this.response.selection.mostAppropriate !== undefined;
        // eslint-disable-next-line no-case-declarations
        const haveLeast = this.response.selection.leastAppropriate !== null && this.response.selection.leastAppropriate !== undefined;
        return haveMost && haveLeast;
      case QUALIFYING_TEST.TYPE.CRITICAL_ANALYSIS:
        return this.response.selection != null && this.response.selection >= 0;
      }
      return false;
    },
    nextPage() {
      // Determine the next page for non-scenario-based tests
      if (this.isLastQuestion || isNaN(this.questionNumber + 1) || this.isComingFromReview) {
        return {
          name: 'online-test-review',
          params: {
            questionNumber: this.questionNumber + 1,
          },
        };
      } else {
        return {
          name: 'online-test-question',
          params: {
            questionNumber: this.questionNumber + 1,
          },
        };
      }
    },
  },
  watch: {
    exitTest: async function (newVal, oldVal) {
      if (newVal !== oldVal) {
        if (this.exitTest) { // exitTest therefore update history and session
          const sessionData =            {
            action: 'exit',
            txt: `Exit Test question ${this.questionNumber}`,
            location: 'modal',
            question: this.questionNumber - 1,
          };
          const saveData = saveHistoryAndSession(sessionData, this.questionNumber, this.questionSessionStart);
          await this.$store.dispatch('qualifyingTestResponse/save', saveData);
        }
      }
    },
  },
  async mounted() {
    window.scrollTo(0, 0);
  },
  async created() {
    await this.handleLanding();
    if (this.qualifyingTestResponse) {
      if (this.response && !this.response.started) {
        this.response.started = Timestamp.fromDate(new Date());
        const data = {
          responses: this.responses,
        };
        await this.$store.dispatch('qualifyingTestResponse/save', data);
      }

      if (this.qualifyingTestResponse._unlockPreviousAnswers !== true) {
        this.questionStartedOnPreviousTest();
      }
      this.loaded = true;
    }
  },
  methods: {
    async skip() {
      const saveData = saveHistoryAndSession({ action: 'skip', txt: 'Skip' }, this.questionNumber, this.questionSessionStart);
      await this.$store.dispatch('qualifyingTestResponse/save', saveData);
      this.$router.push(this.nextPage);
    },
    async save(isCompleted, history) {
      let data = {};
      if (isCompleted) {
        const historyToSave = prepareSaveHistory({ action: 'save', txt: 'Save and continue' }, this.questionNumber);
        const sessionToSave = prepareSaveQuestionSession(this.questionSessionStart, this.questionNumber);
        this.response.completed = Timestamp.fromDate(new Date());
        data = {
          ...historyToSave,
          ...sessionToSave,
          responses: this.responses,
        };
      } else {
        const historyToSave = prepareSaveHistory(history, this.questionNumber);
        data = {
          ...historyToSave,
          responses: this.responses,
        };
      }
      await this.$store.dispatch('qualifyingTestResponse/save', data);
      if (isCompleted) {
        this.$router.push(this.nextPage);
      }
    },
    async handleLanding() {
      if (this.isScenario) {
        this.$router.push({
          name: 'online-test-review',
        });
        return;
      }
      if (this.questionNumber > this.qualifyingTestResponse.testQuestions.questions.length) {
        this.$router.push({
          name: 'online-test-review',
        });
        return;
      } else {
        const saveData = saveHistoryAndSession({ action: 'start' }, this.questionNumber, this.questionSessionStart);
        await this.$store.dispatch('qualifyingTestResponse/save', saveData);
      }
    },
    async questionAnswered(val) {
      if (!this.previousTestQuestion) {
        const saveData = saveHistoryAndSession({ action: 'changed', txt: 'Changed', answer: { value: val.value, type: val.type } }, this.questionNumber, this.questionSessionStart);
        await this.$store.dispatch('qualifyingTestResponse/save', saveData);
        // this.save(false, { action: 'changed', answer: { value: val.value, type: val.type } });
      }
    },
    questionStartedOnPreviousTest() {
      if (this.response.started && this.response.completed) {
        if (
          this.response.started < this.qualifyingTestResponse.qualifyingTest.startDate
          && this.response.completed < this.qualifyingTestResponse.qualifyingTest.startDate
        ) {
          this.previousTestQuestion = true;
        }
      }
    },
  },
};
</script>
