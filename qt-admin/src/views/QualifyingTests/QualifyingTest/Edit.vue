<template>
  <div class="govuk-grid-row">
    <div class="govuk-grid-column-two-thirds">
      <form @submit.prevent="validateAndSave">
        <h2 class="govuk-heading-l">
          Edit {{ isTieBreaker ? 'equal merit tie-breaker' : 'qualifying test' }} details
        </h2>

        <ErrorSummary
          :errors="errors"
          :show-save-button="false"
          @save="save"
        />

        <TextField
          id="qualifyingTest-title"
          v-model="qualifyingTest.title"
          label="Title"
          required
        />

        <DateInput
          id="qualifyingTest-startDate"
          v-model="qualifyingTest.startDate"
          type="datetime"
          label="Start date"
          required
          :min-date="minDate"
        />

        <DateInput
          id="qualifyingTest-endDate"
          v-model="qualifyingTest.endDate"
          type="datetime"
          label="End date"
          required
          :min-date="minDate"
        />

        <TextField
          id="qualifyingTest-testDuration"
          v-model="qualifyingTest.testDuration"
          label="Duration"
          hint="In minutes."
          type="number"
          required
          input-class="govuk-input--width-3"
        />

        <h3 class="govuk-heading-m">
          Additional instructions
        </h3>
        <span class="govuk-hint">Any additional instructions for the candidate - will be displayed before they start the test.</span>

        <RepeatableFields
          v-model="qualifyingTest.additionalInstructions"
          :component="repeatableFields.QTAdditionalInstruction"
          ident="additionalInstructions"
          required
        />

        <TextField
          id="qualifyingTest-feedback-survey"
          v-model="qualifyingTest.feedbackSurvey"
          label="Feedback Survey URL"
        />

        <button class="govuk-button">
          Save and continue
        </button>
      </form>
    </div>
    <div class="govuk-grid-column-one-third text-right">
      <button
        type="button"
        class="govuk-button govuk-button--secondary"
        @click="pasteFromClipboard"
      >
        Paste from clipboard
      </button>
    </div>
  </div>
</template>

<script>
import Form from '@jac-uk/jac-kit/draftComponents/Form/Form.vue';
import ErrorSummary from '@jac-uk/jac-kit/draftComponents/Form/ErrorSummary.vue';
import TextField from '@jac-uk/jac-kit/draftComponents/Form/TextField.vue';
import DateInput from '@jac-uk/jac-kit/draftComponents/Form/DateInput.vue';
import RepeatableFields from '@jac-uk/jac-kit/draftComponents/RepeatableFields.vue';
import QTAdditionalInstruction from '@/components/RepeatableFields/QualifyingTests/AdditionalInstruction.vue';
import { QUALIFYING_TEST } from '@/helpers/constants';
import { markRaw } from 'vue';

export default {
  components: {
    ErrorSummary,
    TextField,
    DateInput,
    RepeatableFields,
  },
  extends: Form,
  data(){
    const data = this.$store.getters['qualifyingTest/data']();

    const defaults = {
      title: null,
      startDate: null,
      endDate: null,
      testDuration: null,
      additionalInstructions: [],
      feedbackSurvey: null,
    };

    const qualifyingTest = { ...defaults, ...data };

    return {
      repeatableFields: {
        QTAdditionalInstruction: markRaw(QTAdditionalInstruction),
      },
      qualifyingTest: qualifyingTest,
    };
  },
  computed: {
    testTypes() {
      return QUALIFYING_TEST.TYPE;
    },
    isTieBreaker() {
      return this.qualifyingTest.isTieBreaker;
    },
    routeNamePrefix() {
      return this.isTieBreaker ? 'equal-merit-tie-breaker' : 'qualifying-test';
    },
    minDate() {
      return null;
    },
    maxDate() {
      return null;
    },
  },
  methods: {
    async save() {
      await this.$store.dispatch('qualifyingTest/save', this.qualifyingTest);
      this.$router.push({ name: `${this.routeNamePrefix}-question-builder` });
    },
    async pasteFromClipboard() {
      if (navigator && navigator.clipboard && navigator.clipboard.readText) {
        const clipboardText = await navigator.clipboard.readText();
        if (clipboardText && clipboardText.includes('testQuestions')) {
          const {
            additionalInstructions,
            feedbackSurvey,
            maxScore,
            testDuration,
            testQuestions,
          } = JSON.parse(clipboardText);
          this.qualifyingTest.additionalInstructions = additionalInstructions;
          this.qualifyingTest.feedbackSurvey = feedbackSurvey;
          this.qualifyingTest.maxScore = maxScore;
          this.qualifyingTest.testDuration = testDuration;
          this.qualifyingTest.testQuestions = testQuestions;
          await this.$store.dispatch('qualifyingTest/save', this.qualifyingTest);
        }
      }
    },
  },
};
</script>
