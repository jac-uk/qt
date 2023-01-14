<template>
  <div class="govuk-grid-row">
    <div class="govuk-grid-column-two-thirds">
      <RouterLink
        class="govuk-back-link"
        :to="{ name: 'qualifying-tests', params: { folderId: folderId } }"
      >
        Back
      </RouterLink>
      <span class="govuk-caption-l">{{ folder.name }}</span>
      <form @submit.prevent="validateAndSave">
        <h2 class="govuk-heading-l">
          Create a qualifying test from Clipboard
        </h2>

        <ErrorSummary
          :errors="errors"
          :show-save-button="false"
          @save="save"
        />

        <TextareaInput
          id="statutory-consultation-waived-details"
          v-model="copiedTest"
          hint="Paste the copied qualifying test from the clipboard: (Ctrl + V)"
          label="Clipboard text"
          rows="15"
          required
        />

        <button class="govuk-button">
          Save and continue
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import Form from '@jac-uk/jac-kit/draftComponents/Form/Form';
import ErrorSummary from '@jac-uk/jac-kit/draftComponents/Form/ErrorSummary';
import TextareaInput from '@jac-uk/jac-kit/draftComponents/Form/TextareaInput';
import { QUALIFYING_TEST } from '@/helpers/constants';

export default {
  components: {
    ErrorSummary,
    TextareaInput,
  },
  extends: Form,
  data(){
    const exercise = this.$store.state.exerciseDocument.record;
    const folder = this.$store.state.folder.record;
    const defaults = {
      type: null,
      folderId: folder.id,
      vacancy: {
        mailbox: exercise.exerciseMailbox,
        contactPhone: exercise.exercisePhoneNumber,
        id: exercise.id,
        referenceNumber: exercise.referenceNumber,
        name: exercise.name,
      },
    };
    const data = this.$store.getters['qualifyingTest/data']();

    const qualifyingTest = { ...defaults, ...data };

    return {
      qualifyingTest: qualifyingTest,
      copiedTest: null,
      isDryRun: true,
    };
  },
  computed: {
    folderId() {
      return this.$route.params.folderId;
    },
    folder() {
      return this.$store.state.folder.record;
    },
    testTypes() {
      return QUALIFYING_TEST.TYPE;
    },
  },
  methods: {
    async save() {
      const data = { ...this.qualifyingTest, ...JSON.parse(this.copiedTest) };
      if (this.isDryRun) {
        data.mode = QUALIFYING_TEST.MODE.DRY_RUN;
      }
      if (data.type === 'critical-analysis') { data.type = QUALIFYING_TEST.TYPE.CRITICAL_ANALYSIS; }
      if (data.type === 'situational-judgement') { data.type = QUALIFYING_TEST.TYPE.SITUATIONAL_JUDGEMENT; }
      const qualifyingTestId = await this.$store.dispatch('qualifyingTest/create', data);
      this.$router.push({
        name: 'qualifying-test-edit',
        params: {
          qualifyingTestId: qualifyingTestId,
        },
      });
    },
  },
};
</script>
