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
          Create {{ isTieBreaker ? 'an equal merit tie-breaker' : 'a qualifying test' }}
        </h2>

        <ErrorSummary
          :errors="errors"
          :show-save-button="false"
          @save="save"
        />

        <RadioGroup
          id="qualifyingTest-type"
          v-model="qualifyingTest.type"
          label="Type of test"
          required
        >
          <RadioItem
            v-for="item in testTypes"
            :key="item"
            :value="item"
            :label="$filters.lookup(item)"
          />
        </RadioGroup>

        <button class="govuk-button">
          Save and continue
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import Form from '@jac-uk/jac-kit/draftComponents/Form/Form.vue';
import ErrorSummary from '@jac-uk/jac-kit/draftComponents/Form/ErrorSummary.vue';
import RadioGroup from '@jac-uk/jac-kit/draftComponents/Form/RadioGroup.vue';
import RadioItem from '@jac-uk/jac-kit/draftComponents/Form/RadioItem.vue';
import { QUALIFYING_TEST } from '@/helpers/constants';

export default {
  components: {
    ErrorSummary,
    RadioGroup,
    RadioItem,
  },
  extends: Form,
  props: {
    isTieBreaker: {
      required: true,
      type: Boolean,
    },
  },
  data(){
    const exercise = this.$store.state.exerciseDocument.record;
    const folder = this.$store.state.folder.record;
    const defaults = {
      isTieBreaker: this.isTieBreaker,
      type: this.isTieBreaker ? QUALIFYING_TEST.TYPE.SCENARIO : null,
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
      isDryRun: true, // all tests created on QT Platform are considered mock assessments. Main tests are created via API integration
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
      return this.isTieBreaker ? [QUALIFYING_TEST.TYPE.SCENARIO] : QUALIFYING_TEST.TYPE;
    },
    routeNamePrefix() {
      return this.isTieBreaker ? 'equal-merit-tie-breaker' : 'qualifying-test';
    },
  },
  methods: {
    async save() {
      if (this.isDryRun) {
        this.qualifyingTest.mode = QUALIFYING_TEST.MODE.DRY_RUN;
      }
      const qualifyingTestId = await this.$store.dispatch('qualifyingTest/create', this.qualifyingTest);

      this.$router.push({
        name: `${this.routeNamePrefix}-edit`,
        params: {
          qualifyingTestId: qualifyingTestId,
        },
      });
    },
  },
};
</script>
