<template>
  <div
    class="qt_page"
    style="word-break:break-word;"
  >
    <LoadingMessage
      v-if="loaded === false"
      :load-failed="loadFailed"
    />
    <template v-else>
      <Countdown
        v-if="testInProgress && !isSupportingPage"
        :start-time="qualifyingTestResponse.statusLog.started"
        :end-time="qualifyingTestResponse.qualifyingTest.endDate"
        :duration="qualifyingTestResponse.duration.testDurationAdjusted"
        :server-time-offset="serverTimeOffset"
        :warning="5"
        :alert="1"
        @change="handleCountdown"
      >
        <template #left-slot>
          <span>
            <a
              v-if="!isReviewPage && showPrevious"
              id="previous-link"
              href=""
              :class="`govuk-link countdown-link info-btn--qualifying-tests--previous-question-${infoClass()}`"
              @click.prevent="btnPrevious"
            >
              ❮
            </a>
          </span>
        </template>

        <template #right-slot>
          <a
            v-if="!isReviewPage && showSkip"
            id="skip-link"
            :class="`govuk-link countdown-link info-btn--qualifying-tests--skip-question-${infoClass()}`"
            href=""
            @click.prevent="btnSkip"
          >
            ❯
          </a>
        </template>
      </Countdown>
      <Banner
        v-if="message && !isCompleted"
        status="information"
      >
        {{ message }}
      </Banner>
      <Modal
        ref="timeElapsedModalRef"
        title="Time has expired"
        button-text="I understand"
        :cancelable="false"
        message="Your time to complete this test has expired, we will submit the answers you have completed so far."
        @confirmed="btnModalConfirmed"
      />
      <Modal
        ref="exitModalRef"
        title="Are you sure?"
        button-text="Exit test"
        :cancelable="true"
        message="Are you sure you want to exit this test? The timer will continue ticking down even if you do?"
        @confirmed="btnExitModalConfirmed"
      />
      <RouterView
        v-if="isSupportingPage || testInProgress"
        :key="$route.fullPath"
        :time-is-up="timerEnded"
        :auto-save="autoSave"
        :exit-test="exitTest"
      />
    </template>
  </div>
</template>

<script>
import { Timestamp, serverTimestamp, arrayUnion } from '@firebase/firestore';
import LoadingMessage from '@/components/LoadingMessage.vue';
import Modal from '@/components/Page/Modal.vue';
import Countdown from '@/components/QualifyingTest/Countdown.vue';
import Banner from '@/components/Page/Banner.vue';
import { QUALIFYING_TEST } from '@/helpers/constants';

export default {
  components: {
    LoadingMessage,
    Modal,
    Countdown,
    Banner,
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.isComingFromReview = from.name === 'online-test-review';
      return true;
    });
  },
  data() {
    return {
      loaded: false,
      loadFailed: false,
      timerEnded: false,
      autoSave: false,
      exitTest: false,
      serverTimeOffset: 0,
      testInProgress: false,
    };
  },
  computed: {
    isSituationalJudgement() {
      return this.qualifyingTestResponse.qualifyingTest.type === QUALIFYING_TEST.TYPE.SITUATIONAL_JUDGEMENT;
    },
    isCriticalAnalysis() {
      return this.qualifyingTestResponse.qualifyingTest.type === QUALIFYING_TEST.TYPE.CRITICAL_ANALYSIS;
    },
    isScenario() {
      return this.qualifyingTestResponse.qualifyingTest.type === QUALIFYING_TEST.TYPE.SCENARIO;
    },
    showPrevious() {
      if (this.isSituationalJudgement || this.isCriticalAnalysis)
        return this.$route.params.questionNumber > 1;
      else if (this.isScenario)
        return !(this.isFirstScenario && this.isFirstQuestionInScenario);
      return false;
    },
    showSkip() {
      if (this.isSituationalJudgement || this.isCriticalAnalysis)
        return this.$route.params.questionNumber < this.qualifyingTestResponse.testQuestions.questions.length;
      else if (this.isScenario)
        return !(this.isLastScenario && this.isLastQuestionInScenario);
      return false;
    },
    scenarioNumber() {
      return parseInt(this.$route.params.scenarioNumber);
    },
    questionNumber() {
      return parseInt(this.$route.params.questionNumber);
    },
    numberOfScenarios() {
      return this.qualifyingTestResponse.testQuestions.questions.length;
    },
    numberOfQuestionsInCurrentScenario() {
      return this.scenarioNumber && this.questionNumber
        ? this.getNumberQuestionsInScenario(this.scenarioNumber - 1)
        : 0;
    },
    isFirstQuestion() {
      return !this.isScenario && this.questionNumber === 1;
    },
    isFirstQuestionInScenario() {
      return this.isScenario && this.questionNumber === 1;
    },
    isFirstScenario() {
      return this.scenarioNumber === 1;
    },
    isLastScenario() {
      return this.scenarioNumber === this.numberOfScenarios;
    },
    isLastQuestionInScenario() {
      return this.numberOfQuestionsInCurrentScenario
        ? this.questionNumber === this.numberOfQuestionsInCurrentScenario
        : false;
    },
    qualifyingTestResponse() {
      return this.$store.state.qualifyingTestResponse.record;
    },
    qualifyingTestId() {
      return this.qualifyingTestResponse.qualifyingTest.id;
    },
    isSupportingPage() {
      return ['online-test-information', 'online-test-submitted'].indexOf(this.$route.name) >= 0;
    },
    message() {
      if (this.qualifyingTestResponse && ('message' in this.qualifyingTestResponse)) {
        return this.qualifyingTestResponse.message;
      }
      return '';
    },
    isCompleted() {
      return this.$store.getters['qualifyingTestResponse/isCompleted'];
    },
    isReviewPage() {
      return this.$route.name === 'online-test-review';
    },
    isLastQuestion() {
      return this.questionNumber === this.qualifyingTestResponse.testQuestions.questions.length;
    },
    nextPage() {
      // Handle navigation to the review page for both scenarios and non-scenarios

      // Determine the next page for scenario-based tests
      if (this.isScenario) { // Check if this is a scenario-based test
        if ((this.isLastQuestionInScenario && this.isLastScenario) || this.isComingFromReview) {
          return {
            name: 'online-test-review',
          };
        }
        if (this.isLastQuestionInScenario) {
          // If it's the last question in the current scenario, move to the next scenario
          return {
            name: 'online-test-scenario',
            params: {
              scenarioNumber: this.scenarioNumber + 1,
              questionNumber: 1, // Reset to the first question of the next scenario
            },
          };
        } else {
          // If it's not the last question, move to the next question in the current scenario
          return {
            name: 'online-test-scenario',
            params: {
              scenarioNumber: this.scenarioNumber,
              questionNumber: this.questionNumber + 1,
            },
          };
        }
      } else if (this.isLastQuestion) {
        return {
          name: 'online-test-review',
        };
      }

      // Determine the next page for non-scenario-based tests
      return {
        name: 'online-test-question',
        params: {
          questionNumber: this.questionNumber + 1,
        },
      };
    },
    currentQuestion() {
      if (!this.scenarioNumber || !this.questionNumber) return false;
      return this.qualifyingTestResponse.testQuestions.questions[this.scenarioNumber - 1].options[this.questionNumber - 1];
    },
    getOverallQuestionNumber() {
      if (!this.scenarioNumber || !this.questionNumber) return 0;

      let overallQuestionNumber = 0;

      // Loop through all previous scenarios and add their number of questions
      for (let i = 0; i < this.scenarioNumber - 1; i++) {
        overallQuestionNumber += this.qualifyingTestResponse.testQuestions.questions[i].options.length;
      }

      // Add the current question number within the current scenario
      overallQuestionNumber += this.questionNumber;

      return overallQuestionNumber;
    },
  },
  watch: {
    qualifyingTestResponse: async function (newVal) {
      if (newVal) {
        if (this.qualifyingTestResponse && this.qualifyingTestResponse.lastUpdated && this.qualifyingTestResponse.lastUpdatedClientTime) {
          this.serverTimeOffset = this.qualifyingTestResponse.lastUpdated.getTime() - this.qualifyingTestResponse.lastUpdatedClientTime.getTime();
          this.testInProgress = this.$store.getters['qualifyingTestResponse/testInProgress'];
        }
        if (this.testInProgress) {
          await this.$store.dispatch('connectionMonitor/start', `qualifyingTest/${this.qualifyingTestId}`);
        } else {
          this.$store.dispatch('connectionMonitor/stop');
        }
      }
    },
    '$route.params.qualifyingTestId'() {
      this.loadQualifyingTestResponse();
    },
  },
  async created() {
    await this.loadQualifyingTestResponse();
    this.questionSessionStart = Timestamp.now();
  },
  mounted() {
    window.addEventListener('beforeunload', this.handleBeforeUnload);
  },
  beforeUnmount() {
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
  },
  unmounted() {
    this.$store.dispatch('qualifyingTestResponse/unbind');
  },
  methods: {
    async loadQualifyingTestResponse() {
      if ((this.$route.params.questionNumber || this.$route.params.scenarioNumber) <= 0) {
        this.$router.push({
          name: 'online-test-review',
        });
      }
      try {
        const qualifyingTestResponse = await this.$store.dispatch('qualifyingTestResponse/bind', this.$route.params.qualifyingTestId);
        if (qualifyingTestResponse === null) {
          return this.redirectToList();
        }
        if (!this.$store.getters['qualifyingTestResponse/isOpen']) {
          return this.redirectToList();
        }
        if (!(this.$store.getters['qualifyingTestResponse/timeLeft'] > 0)) {
          return this.redirectToList();
        }
        if (this.$store.getters['qualifyingTestResponse/isCompleted']) {
          return this.redirectToList();
        }
        this.loaded = true;
      } catch (e) {
        this.loadFailed = true;
        throw e;
      }
    },
    btnPrevious() {
      if (this.isSituationalJudgement || this.isCriticalAnalysis) {
        this.$router.replace({ params: { questionNumber: this.$route.params.questionNumber - 1 } });
      } else if (this.isScenario) {
        // Move to the previous question unless it's at the first question of the first scenario (in which case go to the review pg)
        if (this.isFirstScenario && this.isFirstQuestionInScenario) {
          this.$router.push({
            name: 'online-test-review',
          });
        }
        else {
          const newScenarioNumber = this.isFirstQuestionInScenario ? this.scenarioNumber - 1 : this.scenarioNumber;
          const newQuestionNumber = this.isFirstQuestionInScenario
            ? this.getNumberQuestionsInScenario(newScenarioNumber)
            : this.questionNumber - 1;
          this.$router.push({
            name: 'online-test-scenario',
            params: {
              scenarioNumber: newScenarioNumber,
              questionNumber: newQuestionNumber,
            },
          });
        }
      }
    },
    btnSkip() {
      const dataToSave = this.prepareSaveHistory({ action: 'skip', txt: 'Skip' });
      this.$store.dispatch('qualifyingTestResponse/save', dataToSave);

      if (this.isSituationalJudgement || this.isCriticalAnalysis) {
        this.$router.replace({ params: { questionNumber: (parseInt(this.$route.params.questionNumber) + 1) } });
      } else if (this.isScenario) {
        // Move to the next question unless it's at the last question of the last scenario (in which case go to the review pg)
        if (this.isLastScenario && this.isLastQuestionInScenario) {
          this.$router.push({
            name: 'online-test-review',
          });
        }
        else {
          const scenarioNumber = this.isLastQuestionInScenario ? this.scenarioNumber + 1 : this.scenarioNumber;
          const questionNumber = this.isLastQuestionInScenario ? 1 : this.questionNumber + 1;
          this.$router.push({
            name: 'online-test-scenario',
            params: {
              scenarioNumber: scenarioNumber,
              questionNumber: questionNumber,
            },
          });
        }
      }
    },
    redirectToList() {
      this.$router.replace({ name: 'online-tests' });
    },
    handleCountdown(params) {
      switch (params.action) {
      case 'refresh':
        this.$store.dispatch('qualifyingTestResponse/save', {});
        break;
      case 'ended':
        this.autoSave = false;
        this.timerEnded = true;
        this.$store.dispatch('qualifyingTestResponse/outOfTime');
        this.openTimeElapsedModal();
        break;
      case 'autoSave':
        this.autoSave = true;
        break;
      case 'cleanAutoSave':
        this.autoSave = false;
        break;
      }
    },
    openTimeElapsedModal(){
      this.$refs.timeElapsedModalRef.openModal();
    },
    openExitModal(){
      const historyToSave = this.prepareSaveHistory({
        action: 'exit',
        txt: 'Exit Test',
        location: 'timer bar',
        question: this.$route.params.questionNumber - 1,
      });
      this.$store.dispatch('qualifyingTestResponse/save', historyToSave);
      this.$refs.exitModalRef.openModal();
    },
    btnModalConfirmed() {
      this.$router.push({ name: 'online-test-submitted' });
    },
    btnClockChangedModalConfirmed() {
      this.$router.push({ name: 'online-tests' });
    },
    btnExitModalConfirmed() {
      if (this.$route.params.questionNumber) {
        this.exitTest = true; // question view will exit test
      } else {
        const dataToSave = this.prepareSaveHistory({
          action: 'exit',
          txt: 'Exit Test',
          location: 'modal',
          question: null,
        });
        this.$store.dispatch('qualifyingTestResponse/save', dataToSave);
      }
      this.timerEnded = true;
      this.$nextTick(() => {  // ensures change is picked up before we leave this route
        this.$router.push({ name: 'online-tests' });
      });
    },
    infoClass() {
      const params = this.$route.params;
      const hyphenated = `${params.qualifyingTestId}--scenario-${params.scenarioNumber}--from-${params.questionNumber}-to-${params.questionNumber - 1}`;
      return hyphenated;
    },
    prepareSaveHistory(data) {
      const date = new Date();
      const objToSave = {
        history: arrayUnion({
          ...data,
          timestamp: Timestamp.fromDate(date),
        }),
      };
      return objToSave;
    },
    handleBeforeUnload(event) {
      if (!this.exitTest) {
        // Show default browser msg warning user they're closing the tab/window
        event.preventDefault();
        event.returnValue = '';
      }
    },
    getNumberQuestionsInScenario(scenarioNumber) {
      const scenarioIndex = scenarioNumber - 1;
      return this.qualifyingTestResponse.testQuestions.questions[scenarioIndex].options.length;
    },
    async saveHistoryAndSession(data) {
      const historyToSave = this.prepareSaveHistory(data);
      const sessionToSave = this.prepareSaveQuestionSession();
      const objToSave = {
        ...historyToSave,
        ...sessionToSave,
      };
      await this.$store.dispatch('qualifyingTestResponse/save', objToSave);
    },
    prepareSaveQuestionSession() {
      const timeNow = serverTimestamp();
      const date = new Date();
      const objToSave = {
        questionSession: arrayUnion({
          start: this.questionSessionStart,
          end: Timestamp.fromDate(date),
          question: this.questionNumber - 1,
          timestamp: Timestamp.fromDate(date),
          utcOffset: date.getTimezoneOffset(),
        }),
        lastUpdated: timeNow,
      };
      return objToSave;
    },
  },
};
</script>

<style lang="scss" scoped>

  @mixin mobile-view {
    @media (max-width: 599px) { @content; }
  }

  #previous-link::after{
    content: 'Previous question';
  }

  #skip-link::before{
    content: 'Skip to the next question';
  }

  @include mobile-view {
    #previous-link::after{
      content: '';
    }
    #skip-link::before{
      content: '';
    }
  }

  .govuk-width-container{
    width: 100%;
    padding-top: 0 !important;
  }

  .countdown-link {
    color: white !important;
  }

  .qt_page {
    // padding-top: 60px;
  }

</style>
