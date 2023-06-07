
<template>
  <div class="govuk-grid-row">
    <div class="govuk-grid-column-full govuk-!-margin-bottom-1">
      <h1 class="govuk-heading-l">
        {{ qualifyingTest.title | showAlternative(qualifyingTest.id) }}
        <span
          v-if="qualifyingTest.mode"
          class="govuk-tag govuk-tag--grey govuk-!-margin-left-2"
        >{{ qualifyingTest.mode | lookup }}</span>
      </h1>

      <table class="govuk-table">
        <tbody class="govuk-table__body">
          <tr class="govuk-table__row">
            <th class="govuk-table__header">
              Type
            </th>
            <td class="govuk-table__cell">
              {{ qualifyingTest.type | lookup }}
            </td>
            <th class="govuk-table__header">
              State
            </th>
            <td class="govuk-table__cell">
              {{ qualifyingTest.status | lookup }}
            </td>
          </tr>
          <tr class="govuk-table__row">
            <th class="govuk-table__header">
              Start Date
            </th>
            <td class="govuk-table__cell">
              {{ qualifyingTest.startDate | formatDate('longdatetime') }}
            </td>
            <th class="govuk-table__header">
              End Date
            </th>
            <td class="govuk-table__cell">
              {{ qualifyingTest.endDate | formatDate('longdatetime') }}
            </td>
          </tr>
          <tr class="govuk-table__row">
            <th class="govuk-table__header">
              URL
            </th>
            <td
              class="govuk-table__cell"
              colspan="3"
            >
              <a
                :href="testURL"
                target="_blank"
                class="govuk-link"
              >
                {{ testURL }}
              </a>
            </td>
          </tr>
          <tr class="govuk-table__row">
            <th class="govuk-table__header">
              Message
            </th>
            <td
              class="govuk-table__cell"
              colspan="3"
            >
              <EditableMessage
                getter="qualifyingTest/data"
                dispatcher="qualifyingTest/save"
                :message="qualifyingTestMessage"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="hasCounts"
      class="govuk-grid-column-one-half"
    >
      <div
        class="background-light-grey govuk-!-padding-4 govuk-!-margin-bottom-3"
      >
        <h2 class="govuk-heading-l">
          Number of Participants
        </h2>

        <p class="govuk-body">
          <RouterLink
            :to="{ name: routeNamePrefix + '-responses', params: { qualifyingTestId: $route.params.qualifyingTestId, status: 'all', }}"
          >
            Initialised
          </RouterLink>
          /
          <RouterLink
            :to="{ name: routeNamePrefix + '-responses', params: { qualifyingTestId: $route.params.qualifyingTestId, status: qtStatus('ACTIVATED') }}"
          >
            Activated
          </RouterLink>
          <span
            class="display-block govuk-heading-l govuk-!-margin-top-1"
          >{{ qualifyingTest.counts.initialised }} / {{ qualifyingTest.counts.activated }}</span>
        </p>
        <p class="govuk-body">
          <RouterLink
            :to="{ name: routeNamePrefix + '-responses', params: { qualifyingTestId: $route.params.qualifyingTestId, status: qtStatus('COMPLETED') }}"
          >
            Completed
          </RouterLink> / Auto-submitted
          <span
            class="display-block govuk-heading-l govuk-!-margin-top-1"
          >{{ qualifyingTest.counts.completed }} / {{ qualifyingTest.counts.outOfTime }}</span>
        </p>
      </div>
    </div>

    <div
      v-if="hasCounts"
      class="govuk-grid-column-one-half"
    >
      <div
        class="background-light-grey govuk-!-padding-4 govuk-!-margin-bottom-3"
      >
        <h2 class="govuk-heading-l">
          Progress
        </h2>
        <p class="govuk-body">
          <RouterLink
            :to="{ name: routeNamePrefix + '-responses', params: { qualifyingTestId: $route.params.qualifyingTestId, status: qtStatus('STARTED'), }}"
          >
            Started
          </RouterLink>
          <span class="govuk-heading-l govuk-!-margin-top-1">{{ qualifyingTest.counts.started }}</span>
        </p>
        <p class="govuk-body">
          <RouterLink
            :to="{ name: routeNamePrefix + '-responses', params: { qualifyingTestId: $route.params.qualifyingTestId, status: qtStatus('PROGRESS'), }}"
          >
            In Progress
          </RouterLink>
          <span class="govuk-heading-l govuk-!-margin-top-1">{{ qualifyingTest.counts.inProgress }}</span>
        </p>
      </div>
    </div>

    <div class="govuk-grid-column-full govuk-!-margin-bottom-2">
      <span v-if="isCreated || isSubmitted || isApproved">
        <button
          :disabled="false"
          class="govuk-button govuk-button--secondary govuk-!-margin-right-3"
          @click="btnEdit"
        >
          Edit
        </button>
        <button
          :disabled="false"
          class="govuk-button govuk-button--secondary govuk-!-margin-right-3"
          @click="btnReview"
        >
          Review
        </button>
      </span>

      <div v-if="isApproved">
        <div v-if="isDryRun">
          <ActionButton
            type="primary"
            :disabled="!isDryRunCandidates"
            class="govuk-!-margin-right-3"
            @click="btnInitialise"
          >
            Create dry run tests
          </ActionButton>
          <router-link
            v-if="!isDryRunCandidates"
            :to="{ name: 'qualifying-test-dry-run' }"
            class="govuk-hint"
          >
            Please add emails before creating
          </router-link>
        </div>
        <div v-else-if="isMopUp">
          <ActionButton
            type="primary"
            class="govuk-!-margin-right-3"
            @click="btnInitialise"
          >
            Create mop up tests
          </ActionButton>
        </div>
        <div v-else>
          <div v-if="hasParticipants">
            <ActionButton
              type="primary"
              :disabled="!hasParticipants"
              class="govuk-!-margin-right-3"
              @click="btnInitialise"
            >
              Create {{ qualifyingTest.participants.length }} tests
            </ActionButton>
          </div>
          <div v-else>
            <Banner
              :message="`No participants found`"
              status="warning"
            />
          </div>
        </div>
      </div>

      <Banner
        v-if="isTieBreaker && exerciseHasOpenQTs"
        message="You cannot open this tie-breaker test yet as there are still qualifying tests open for this exercise"
        status="warning"
      />

      <ActionButton
        v-if="isInitialised"
        :disabled="!isUserAdded || !canOpenTests"
        type="primary"
        class="govuk-!-margin-right-3"
        @click="btnActivate"
      >
        Open tests
      </ActionButton>

      <button
        v-if="isInitialised || isActivated || isPaused || isCompleted"
        class="govuk-button govuk-button--secondary govuk-!-margin-right-3"
        @click="btnResponses('all')"
      >
        Responses
      </button>

      <button
        v-if="isInitialised || isActivated || isPaused"
        class="govuk-button govuk-button--secondary govuk-!-margin-right-3"
        @click="btnResponses('reasonable-adjustments')"
      >
        Reasonable Adjustments
      </button>

      <button
        v-if="canCreateCopy"
        class="govuk-button govuk-button--secondary govuk-!-margin-right-3"
        @click="btnCreateCopy"
      >
        Create Mop Up Test
      </button>

      <button
        ref="btnCopyToClipboard"
        class="govuk-button govuk-button--secondary govuk-!-margin-right-3"
        @click="btnCopyToClipboard"
      >
        Copy QT to clipboard
      </button>

      <ActionButton
        v-if="isInitialised"
        type="secondary"
        :disabled="true"
        class="govuk-!-margin-right-3"
        @click="btnSendInvites"
      >
        Send invites
      </ActionButton>

      <ActionButton
        v-if="isActivated"
        type="primary"
        :disabled="isEndDatePassed"
        class="govuk-!-margin-right-3"
        @click="btnGetScores"
      >
        Close & Score
      </ActionButton>
    </div>
  </div>
</template>

<script>
import { functions } from '@/firebase';
import ActionButton from '@jac-uk/jac-kit/draftComponents/ActionButton';
import { QUALIFYING_TEST } from '@/helpers/constants';
import { isDateGreaterThan } from '@jac-uk/jac-kit/helpers/date';
import Banner from '@jac-uk/jac-kit/draftComponents/Banner';
import EditableMessage from '@/components/Micro/EditableMessage';
export default {
  components: {
    ActionButton,
    Banner,
    EditableMessage,
  },
  data() {
    return {
      exerciseStage: '',
      candidateStatus: 'all',
    };
  },
  computed: {
    folderId() {
      return this.$route.params.folderId;
    },
    folder() {
      return this.$store.state.folder.record;
    },
    exerciseId() {
      return this.$route.params.id;
    },
    exercise() {
      return this.$store.state.exerciseDocument.record;
    },
    isProcessing() {
      return true;
    },
    applicationRecordCounts() {
      return {};
    },
    qualifyingTestId() {
      return this.$route.params.qualifyingTestId;
    },
    qualifyingTest() {
      return this.$store.state.qualifyingTest.record;
    },
    qualifyingTestMessage() {
      return ('message' in this.qualifyingTest) ? this.qualifyingTest.message : '';
    },
    testURL() {
      let url = '';
      if (this.$store.getters.isLive) {
        url = 'https://qt.judicialappointments.digital';
      } else {
        url = 'https://qt-develop.judicialappointments.digital';
      }
      url += `/${this.qualifyingTestId}`;
      return url;
    },
    hasParticipants() {
      return this.qualifyingTest && this.qualifyingTest.participants && this.qualifyingTest.participants.length;
    },
    hasCounts() {
      return this.qualifyingTest.counts && this.qualifyingTest.counts.initialised;
    },
    isCreated() {
      return this.qualifyingTest.status === QUALIFYING_TEST.STATUS.CREATED;
    },
    isSubmitted() {
      return this.qualifyingTest.status === QUALIFYING_TEST.STATUS.SUBMITTED;
    },
    isApproved() {
      return this.qualifyingTest.status === QUALIFYING_TEST.STATUS.APPROVED;
    },
    isDryRun() {
      return this.qualifyingTest && this.qualifyingTest.mode && this.qualifyingTest.mode === 'dry-run';
    },
    isDryRunCandidates() {
      return this.qualifyingTest && this.qualifyingTest.invitedEmails && this.qualifyingTest.invitedEmails.length > 0;
    },
    isMopUp() {
      return this.qualifyingTest && this.qualifyingTest.mode && this.qualifyingTest.mode === 'mop-up';
    },
    isInitialised() {
      return this.qualifyingTest.status === QUALIFYING_TEST.STATUS.INITIALISED;
    },
    isUserAdded() {
      return this.qualifyingTest.counts.initialised > 0;
    },
    isActivated() {
      return this.qualifyingTest.status === QUALIFYING_TEST.STATUS.ACTIVATED;
    },
    isPaused() {
      return this.qualifyingTest.status === QUALIFYING_TEST.STATUS.PAUSED;
    },
    isCompleted() {
      return this.qualifyingTest.status === QUALIFYING_TEST.STATUS.COMPLETED;
    },
    isEndDatePassed() {
      const today = new Date();
      const endDate = new Date(this.qualifyingTest.endDate);
      return isDateGreaterThan(endDate, today);
    },
    canCreateCopy() {
      return !this.isMopUp && (
        this.isInitialised ||
        this.isActivated ||
        this.isPaused ||
        this.isCompleted
      );
    },
    canOpenTests() {
      // do not allow QTs or tie-breakers to be opened until they have been initialised
      // also, do not allow tie-breakers to be opened if there are open QTs for this exercise
      return this.isInitialised && !(this.isTieBreaker && this.exerciseHasOpenQTs);
    },
    exerciseHasOpenQTs() {
      const qtList = this.$store.getters['qualifyingTest/getActivatedQTs'].filter(row => {
        return !row.isTieBreaker;
      });
      return qtList.length > 0;
    },
    hasEMPCandidates() {
      const appRecs = this.applicationRecordCounts;
      return appRecs.reviewEMP || appRecs.shortlistedEMP || appRecs.selectedEMP;
    },
    isTieBreaker() {
      return this.qualifyingTest.isTieBreaker;
    },
    routeNamePrefix() {
      return this.isTieBreaker ? 'equal-merit-tie-breaker' : 'qualifying-test';
    },
    testQuestionsJson() {
      const {
        additionalInstructions,
        feedbackSurvey,
        maxScore,
        testDuration,
        testQuestions,
        title,
        type,
      } = this.qualifyingTest;

      const clipboardQT = {
        additionalInstructions,
        feedbackSurvey,
        maxScore,
        testDuration,
        testQuestions,
        title,
        type,
      };

      const returnValue = JSON.stringify(clipboardQT);
      return returnValue;
    },
  },
  created() {
    if (this.$store.state.qualifyingTest.records.length === 0) {
      this.$store.dispatch('qualifyingTest/bindQTs', { folderId: this.folderId });
    }
  },
  methods: {
    btnEdit() {
      this.$router.push({ name: `${this.routeNamePrefix}-edit`, params: { qualifyingTestId: this.qualifyingTestId } });
    },
    btnReview() {
      this.$router.push({ name: `${this.routeNamePrefix}-review`, params: { qualifyingTestId: this.qualifyingTestId } });
    },
    async btnSendInvites() {
      await functions.httpsCallable('sendQualifyingTestReminders')({ qualifyingTestId: this.qualifyingTestId });
      return true;
    },
    async btnInitialise() {
      const data = { qualifyingTestId: this.qualifyingTestId };
      await functions.httpsCallable('initialiseQualifyingTest')( data );
      return true;
    },
    async btnActivate() {
      await functions.httpsCallable('activateQualifyingTest')({ qualifyingTestId: this.qualifyingTestId });
      return true;
    },
    async btnGetScores() {
      await functions.httpsCallable('scoreQualifyingTest')({ qualifyingTestId: this.qualifyingTestId });
      return true;
    },
    btnResponses(status) {
      const route = {
        name: `${this.routeNamePrefix}-responses`,
        params: {
          qualifyingTestId: this.$route.params.qualifyingTestId,
          status: status,
        },
      };
      this.$router.push(route);
    },
    qtStatus(status) {
      return QUALIFYING_TEST.STATUS[status];
    },
    async btnCreateCopy() {
      const newTestId = await this.$store.dispatch('qualifyingTest/copy');
      this.$router.push({
        name: `${this.routeNamePrefix}-edit`,
        params: {
          qualifyingTestId: newTestId,
        },
      });
    },
    btnCopyToClipboard() {
      this.$refs.btnCopyToClipboard.innerText = 'Copying to clipboard ...';
      this.$refs.btnCopyToClipboard.disabled = 'disabled';
      const el = document.createElement('textarea');
      el.value = this.testQuestionsJson;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);

      setTimeout(() => {
        this.$refs.btnCopyToClipboard.innerText = 'QT Copied to clipboard';
        this.$refs.btnCopyToClipboard.disabled = false;
      },3000);
    },
  },
};
</script>
