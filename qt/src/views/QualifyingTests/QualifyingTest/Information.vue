<template>
  <div
    class="govuk-grid-row"
  >
    <div
      class="govuk-grid-column-two-thirds"
    >
      <h1 class="govuk-heading-l">
        {{ qualifyingTestResponse.qualifyingTest.title }}
      </h1>

      <Banner
        v-if="hasCompleted"
        status="information"
      >
        <template>
          You have already finished this test.
        </template>
      </Banner>

      <template v-else-if="qualifyingTestResponse.qualifyingTest.type === 'scenarioTest'">
        <ErrorSummary :errors="errors" />

        <h2 class="govuk-heading-m">
          Important information
        </h2>

        <ul class="govuk-list govuk-list--bullet">
          <li
            v-if="numberOfQuestions"
          >
            <span>
              This test contains
              <b style="white-space: pre;">
                {{ numberOfQuestions }}
              </b>
            </span>
            <br>
          </li>

          <div
            v-for="(scenario, index) in qualifyingTestResponse.testQuestions.questions"
            :key="index"
          >
            <div
              v-for="(question, i) in qualifyingTestResponse.testQuestions.questions[index].options"
              :key="i"
            >
              {{ `Scenario ${index+1}, Question ${i+1}: ${('marks' in question ? question.marks + " marks" : '')} ${question.wordLimit}-word limit` }}
            </div>
          </div>
          <li>
            You have <b>{{ qualifyingTestResponse.duration.testDurationAdjusted }} minutes</b> to complete this test.
            <span v-if="extraTime"> This includes <b>{{ extraTimeAmount }} minutes</b> of reasonable adjustment time.</span>
          </li>
          <li>
            You must submit your test by <b>{{ endTime }}</b>.
          </li>
          <li>
            Ensure your internet connection is stable <strong> before you start the test.</strong>
          </li>
          <li>
            If you experience any technical issues please contact the helpdesk.
          </li>
          <li>
            Once you have started the test, <strong> do not open the test on a second device.</strong>
          </li>
          <li>
            Your answers will be saved as you progress, but you will be able to edit them at the end before you submit your test, assuming you still have time remaining.
          </li>
          <li>
            If you run out of time, we will submit whatever answers you have completed up until that point
          </li>
        </ul>

        <h2 class="govuk-heading-m">
          Additional instructions
        </h2>

        <ul
          class="govuk-list govuk-list--bullet"
        >
          <li>
            You must answer the questions, giving your full reasoning and referring to the relevant parts of the legislation, rules and other information provided to you both in the pre-reading and the test
          </li>
          <li>
            The scenario test has been designed to test the following competencies: Exercising Judgement, Possessing and Building Knowledge, Assimilating and Clarifying Information, Working and Communicating with Others and Managing Work Efficiently
          </li>

          <template
            v-if="hasAdditionalInstructions"
          >
            <li
              v-for="(instruction, index) in additionalInstructions"
              :key="index"
            >
              {{ instruction.text }}
            </li>
          </template>
        </ul>

        <form
          ref="formRef"
          @submit.prevent="onSubmit"
        >
          <Banner
            v-if="qtNotActivatedYet"
            status="information"
          >
            <template>
              This online test is not open yet.
            </template>
          </Banner>

          <fieldset
            v-else
            class="govuk-fieldset"
          >
            <template v-if="!hasStarted">
              <Checkbox
                id="confirm-checkbox"
                ref="confirm-checkbox"
                v-model="confirmationChecked"
                name="confirm-checkbox"
                required
                :messages="{'required': 'Please confirm you agree'}"
              >
                <b>I confirm I will keep this test confidential and not share scenarios or questions at any point during or after the selection exercise.</b>
              </Checkbox>

              <StartButton
                :disabled="!confirmationChecked"
              >
                Start now
              </StartButton>
            </template>
            <StartButton v-else>
              Continue
            </StartButton>
          </fieldset>
        </form>
      </template>

      <template v-else-if="qualifyingTestResponse.qualifyingTest.type === 'criticalAnalysis' || 'situationalJudgement'">
        <ErrorSummary :errors="errors" />

        <h2 class="govuk-heading-m">
          Important information
        </h2>

        <ul class="govuk-list govuk-list--bullet">
          <li
            v-if="numberOfQuestions"
          >
            <span>
              This test contains
              <b style="white-space: pre;">
                {{ numberOfQuestions }}
              </b>
            </span>
          </li>
          <li>
            You have <b>{{ qualifyingTestResponse.duration.testDurationAdjusted }} minutes</b> to complete this test.
            <span v-if="extraTime"> This includes <b>{{ extraTimeAmount }} minutes</b> of reasonable adjustment time.</span>
          </li>
          <li>
            You must submit your test by <b>{{ endTime }}</b>.
          </li>
          <li>
            Ensure your internet connection is stable <strong> before you start the test.</strong>
          </li>
          <li>
            If you experience any technical issues please contact the helpdesk.
          </li>
          <li>
            Once you have started the test, <strong> do not open the test on a second device.</strong>
          </li>
          <li>
            Your answers will be saved as you progress, but you will be able to edit them at the end before you submit your test, assuming you still have time remaining.
          </li>
          <li>
            If you run out of time, we will submit whatever answers you have completed up until that point.
          </li>
          <li>
            If you switch to a different application or a different tab of your browser once you have started the test, the timer will continue to count down in the background.
          </li>
        </ul>

        <h2 class="govuk-heading-m">
          Additional instructions
        </h2>
        <ul class="govuk-list govuk-list--bullet">
          <template
            v-if="hasAdditionalInstructions"
          >
            <li
              v-for="(instruction, index) in additionalInstructions"
              :key="index"
            >
              {{ instruction.text }}
            </li>
          </template>
        </ul>

        <form
          ref="formRef"
          @submit.prevent="onSubmit"
        >
          <Banner
            v-if="qtNotActivatedYet"
            status="information"
          >
            <template>
              This online test is not open yet.
            </template>
          </Banner>

          <fieldset
            v-else
            class="govuk-fieldset"
          >
            <template v-if="!hasStarted">
              <Checkbox
                id="confirm-checkbox"
                ref="confirm-checkbox"
                v-model="confirmationChecked"
                name="confirm-checkbox"
                required
                :messages="{'required': 'Please confirm you agree'}"
              >
                <b>I confirm I will keep this test confidential and not share scenarios or questions at any point during or after the selection exercise.</b>
              </Checkbox>

              <StartButton
                :disabled="!confirmationChecked"
              >
                Start now
              </StartButton>
            </template>
            <StartButton v-else>
              Continue
            </StartButton>
          </fieldset>
        </form>
      </template>
    </div>
  </div>
</template>
<script>
import { Timestamp, serverTimestamp, arrayUnion } from '@firebase/firestore';
import Form from '@/components/Form/Form.vue';
import ErrorSummary from '@/components/Form/ErrorSummary.vue';
import Checkbox from '@/components/Form/Checkbox.vue';
import StartButton from '@/components/Page/StartButton.vue';
import Banner from '@/components/Page/Banner.vue';
import { isToday, formatDate } from '@/helpers/date';
import { QUALIFYING_TEST } from '@/helpers/constants';

export default {
  components: {
    ErrorSummary,
    Checkbox,
    StartButton,
    Banner,
  },
  extends: Form,
  data() {
    return {
      confirmationChecked: false,
    };
  },
  computed: {
    qualifyingTestResponse() {
      return this.$store.getters['qualifyingTestResponse/data']();
    },
    endTime() {
      const time = formatDate(this.qualifyingTestResponse.qualifyingTest.endDate, 'time');
      const day = formatDate(this.qualifyingTestResponse.qualifyingTest.endDate);
      return isToday(this.qualifyingTestResponse.qualifyingTest.endDate) ? `${time} today` : `${time} on ${day}`;
    },
    extraTime() {
      return this.qualifyingTestResponse.duration.reasonableAdjustment != 0;
    },
    extraTimeAmount() {
      return this.qualifyingTestResponse.duration.testDurationAdjusted - this.qualifyingTestResponse.duration.testDuration;
    },
    numberOfQuestions() {
      const questions = this.qualifyingTestResponse.testQuestions.questions;
      const plural = questions.length > 1 ? 's' : '';
      let result;
      if (!(this.qualifyingTestResponse.qualifyingTest.type === QUALIFYING_TEST.TYPE.SCENARIO)) {
        result = `${questions.length} question${plural}`;
      } else {
        result = `${questions.length} Scenario${plural}:`;
        questions.forEach((question, index) => {
          result += ` Scenario ${index + 1} with ${question.options.length} question${question.options.length > 1 ? 's' : ''}`;
          if (!(index + 1 === questions.length)){
            result += ', ';
          }
        });
      }
      result += '.';
      return result;
    },
    additionalInstructions() {
      return this.qualifyingTestResponse.qualifyingTest.additionalInstructions;
    },
    hasStarted() {
      return this.qualifyingTestResponse.status === QUALIFYING_TEST.STATUS.STARTED && this.qualifyingTestResponse.statusLog.started != null;
    },
    hasCompleted() {
      return this.qualifyingTestResponse.status === QUALIFYING_TEST.STATUS.COMPLETED && this.qualifyingTestResponse.statusLog.completed != null;
    },
    hasAdditionalInstructions(){
      let result;
      this.additionalInstructions.forEach(instruction => {
        result = !!Object.keys(instruction).length;
      });
      return result;
    },
    qtNotActivatedYet() {
      return this.qualifyingTestResponse.status === QUALIFYING_TEST.STATUS.CREATED;
    },
    nextPage() {
      if (this.qualifyingTestResponse.qualifyingTest.type === QUALIFYING_TEST.TYPE.SCENARIO) {
        return {
          name: 'online-test-scenario',
          params: {
            scenarioNumber: 1,
            questionNumber: 1,
          },
        };
      }
      return {
        name: 'online-test-question',
        params: {
          questionNumber: 1,
        },
      };
    },
  },
  methods: {
    scrollToTop () {
      this.$el.scrollIntoView();
    },
    async onSubmit() {
      this.validate();
      if (this.isValid()) {
        try {
          if (this.hasStarted) {
            await this.$store.dispatch('qualifyingTestResponse/save', {});
            // ensures we refresh lastUpdated timestamps so we have a current `serverOffset`
          } else {
            if (!this.confirmationChecked) {
              throw new Error('You must agree to keep this test confidential.');
            }
            await this.$store.dispatch('qualifyingTestResponse/startTest');

          }
          this.$router.push(this.nextPage);
        } catch (error) {
          this.errors.push({ message: error.message });
          this.scrollToTop();
        }
        const saveHistory = this.prepareSaveHistory({ action: 'start', location: 'information' });
        await this.$store.dispatch('qualifyingTestResponse/save', saveHistory);
      }
    },
    prepareSaveHistory(data) {
      const timeNow = serverTimestamp();
      const date = new Date();
      const objToSave = {
        history: arrayUnion({
          ...data,
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
