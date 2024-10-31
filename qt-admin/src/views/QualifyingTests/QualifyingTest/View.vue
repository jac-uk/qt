
<template>
  <div class="govuk-grid-row">
    <div class="govuk-grid-column-full govuk-!-margin-bottom-1">
      <h1 class="govuk-heading-l">
        {{ $filters.showAlternative(qualifyingTest.title, qualifyingTest.id) }}
        <span
          v-if="qualifyingTest.mode"
          class="govuk-tag govuk-tag--grey govuk-!-margin-left-2"
        >{{ $filters.lookup(qualifyingTest.mode) }}</span>
      </h1>

      <table class="govuk-table">
        <tbody class="govuk-table__body">
          <tr class="govuk-table__row">
            <th class="govuk-table__header">
              Type
            </th>
            <td class="govuk-table__cell">
              {{ $filters.lookup(qualifyingTest.type) }}
            </td>
            <th class="govuk-table__header">
              State
            </th>
            <td class="govuk-table__cell">
              {{ $filters.lookup(qualifyingTest.status) }}
            </td>
          </tr>
          <tr class="govuk-table__row">
            <th class="govuk-table__header">
              Start Date
            </th>
            <td class="govuk-table__cell">
              {{ $filters.formatDate(qualifyingTest.startDate, 'longdatetime') }}
            </td>
            <th class="govuk-table__header">
              End Date
            </th>
            <td class="govuk-table__cell">
              {{ $filters.formatDate(qualifyingTest.endDate, 'longdatetime') }}
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
          <tr
            v-if="authorisedToPerformAction"
            class="govuk-table__row"
          >
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

        <div
          class="govuk-body govuk-!-margin-bottom-0"
          style="display: flex;"
        >
          <div>
            <RouterLink
              :to="{ name: routeNamePrefix + '-responses', params: { qualifyingTestId: $route.params.qualifyingTestId, status: 'all', }}"
            >
              Initialised
            </RouterLink>
          </div>
          <div class="tooltip-anchor">
            <div class="tooltip-wrapper">
              <Tooltip>
                <template #content>
                  <div style="width: 300px;">
                    <ul style="margin: 0; padding-left: 20px;">
                      <li>The test has been created, submitted for approval and approved, however, the ‘Open tests’ button has not been pressed.</li>
                      <li>A test URL is present and a participant can log in to the QT platform using their registered email.</li>
                      <li>Only the title of the test, start date and time, and status (which will be ‘Not started’) will appear on the QT platform, but it will not be clickable.</li>
                    </ul>
                  </div>
                </template>
              </Tooltip>
            </div>
          </div>
          <div>/</div>
          <div>
            <RouterLink
              :to="{ name: routeNamePrefix + '-responses', params: { qualifyingTestId: $route.params.qualifyingTestId, status: qtStatus('ACTIVATED') }}"
            >
              Activated
            </RouterLink>
          </div>

          <div class="tooltip-anchor">
            <div class="tooltip-wrapper">
              <Tooltip>
                <template #content>
                  <div style="width: 300px;">
                    <ul style="margin: 0; padding-left: 20px;">
                      <li>The test has been created, submitted for approval, approved and the ‘Open tests’ button has been pressed.</li>
                      <li>If the test start date is in the future then the 'activated' test will display exactly as an 'initialised' test and a participant can log in to the QT platform using their registered email.</li>
                      <li>
                        If the test is open, it will appear as a clickable link leading to the start page of the QT, where candidates will be able to view the important information and additional information sections, before starting the test.
                      </li>
                    </ul>
                  </div>
                </template>
              </Tooltip>
            </div>
          </div>
        </div>

        <p class="govuk-body">
          <span
            class="display-block govuk-heading-l govuk-!-margin-top-1"
          >{{ qualifyingTest.counts.initialised }} / {{ qualifyingTest.counts.activated }}</span>
        </p>

        <div
          class="govuk-body govuk-!-margin-bottom-0"
          style="display: flex;"
        >
          <div>
            <RouterLink
              :to="{ name: routeNamePrefix + '-responses', params: { qualifyingTestId: $route.params.qualifyingTestId, status: qtStatus('COMPLETED') }}"
            >
              Completed
            </RouterLink>
          </div>
          <div class="tooltip-anchor">
            <div class="tooltip-wrapper">
              <Tooltip>
                <template #content>
                  <div style="width: 300px;">
                    Completed includes Auto-submitted tests.
                  </div>
                </template>
              </Tooltip>
            </div>
          </div>
          <div>/</div>
          <div>
            Auto-submitted
          </div>
          <div class="tooltip-anchor">
            <div class="tooltip-wrapper">
              <Tooltip>
                <template #content>
                  <div style="width: 300px;">
                    Auto-submitted tests will not show as completed until Close and score is clicked.
                  </div>
                </template>
              </Tooltip>
            </div>
          </div>
        </div>
        <p class="govuk-body">
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
            :action="btnInitialise"
          >
            Create mock assessment tests
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
            :action="btnInitialise"
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
              :action="btnInitialise"
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
        :action="btnActivate"
      >
        Open tests
      </ActionButton>

      <button
        v-if="isInitialised || isActivated || isPaused || isCompleted"
        class="govuk-button govuk-button--secondary govuk-!-margin-right-3"
        @click="btnResponses('all')"
      >
        All responses
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
        :action="btnSendInvites"
      >
        Send invites
      </ActionButton>

      <ActionButton
        v-if="isActivated"
        type="primary"
        :disabled="isEndDatePassed"
        class="govuk-!-margin-right-3"
        :action="btnGetScores"
      >
        Close & Score
      </ActionButton>
    </div>

    <div class="govuk-grid-column-full govuk-!-margin-bottom-2">
      <h2 class="govuk-heading-m">
        Questions
      </h2>

      <dl
        v-if="qualifyingTest.testQuestions"
        class="govuk-summary-list"
      >
        <div
          v-if="qualifyingTest.testQuestions.introduction"
          class="govuk-summary-list__row"
        >
          <dt
            class="govuk-summary-list__key"
          >
            Introduction
          </dt>
          <dd class="govuk-summary-list__value">
            {{ qualifyingTest.testQuestions.introduction }}
          </dd>
        </div>
        <div
          v-for="(testQuestion, index) in qualifyingTest.testQuestions.questions"
          :key="index"
          class="govuk-summary-list__row"
        >
          <dt class="govuk-summary-list__key">
            {{ questionLabel }} {{ index + 1 }}
          </dt>
          <dd class="govuk-summary-list__value">
            {{ testQuestion.details }}

            <hr class="govuk-section-break govuk-section-break--visible">
            <ol
              v-if="isSituationalJudgement() || isCriticalAnalysis()"
              class="govuk-!-padding-left-0"
            >
              <li
                v-for="(option, i) in testQuestion.options"
                id="option"
                :key="i"
                class="question-or-option"
              >
                {{ option.answer }}
              </li>
            </ol>
            <hr
              v-if="isSituationalJudgement() || isCriticalAnalysis()"
              class="govuk-section-break govuk-section-break--visible"
            >
            <div
              v-if="isSituationalJudgement() && testQuestion.mostAppropriate >= 0 && testQuestion.leastAppropriate >= 0"
              class="govuk-!-padding-1"
            >
              <strong>
                Most appropriate:
              </strong>
              {{ testQuestion.options[testQuestion.mostAppropriate].answer }}
              <br>
              <strong>
                Least appropriate:
              </strong>
              {{ testQuestion.options[testQuestion.leastAppropriate].answer }}
            </div>
            <div
              v-if="isCriticalAnalysis() && testQuestion.correct >= 0"
              class="govuk-!-padding-1"
            >
              <span>
                <strong>
                  Correct:
                </strong>
                {{ testQuestion.options[testQuestion.correct].answer }}
              </span>
            </div>

            <div
              v-if="isScenario()"
              class="govuk-!-padding-1"
            >
              <div
                v-for="(document, docNum) in testQuestion.documents"
                :key="docNum"
              >
                <strong>
                  {{ document.title }}
                </strong>
                <!-- eslint-disable -->
                <p
                  v-html="document.content"
                />
                <!-- eslint-enable -->
                <hr>
              </div>
              <ol
                class="govuk-!-padding-left-0"
              >
                <li
                  v-for="(option, i) in testQuestion.options"
                  id="question"
                  :key="i"
                  class="question-or-option"
                >
                  {{ option.question }}
                  <span
                    v-if="option.hint"
                    class="govuk-hint"
                  >
                    {{ option.hint }}
                  </span>
                </li>
              </ol>
            </div>
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>

<script>
import { functions, auth } from '@/firebase';
import ActionButton from '@jac-uk/jac-kit/draftComponents/ActionButton.vue';
import { QUALIFYING_TEST } from '@/helpers/constants';
import { isDateGreaterThan } from '@jac-uk/jac-kit/helpers/date';
import Banner from '@jac-uk/jac-kit/draftComponents/Banner.vue';
import EditableMessage from '@/components/Micro/EditableMessage.vue';
import { authorisedToPerformAction }  from '@/helpers/authUsers';
import { httpsCallable } from '@firebase/functions';
import { isScenario, isCriticalAnalysis, isSituationalJudgement } from '../../../helpers/qualifyingTestHelpers';
import Tooltip from '@/components/Micro/Tooltip.vue';

export default {
  components: {
    ActionButton,
    Banner,
    EditableMessage,
    Tooltip,
  },
  data() {
    return {
      exerciseStage: '',
      candidateStatus: 'all',
      authorisedToPerformAction: false,
    };
  },
  computed: {
    questionLabel() {
      let label = 'Question';

      if (this.qualifyingTest.type === QUALIFYING_TEST.TYPE.SCENARIO) {
        label = 'Scenario';
      }
      return label;
    },
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
    isScenario() {
      return isScenario;
    },
    isSituationalJudgement() {
      return isSituationalJudgement;
    },
    isCriticalAnalysis() {
      return isCriticalAnalysis;
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
  async created() {
    if (this.$store.state.qualifyingTest.records.length === 0) {
      this.$store.dispatch('qualifyingTest/bindQTs', { folderId: this.folderId });
    }
    this.authorisedToPerformAction = await authorisedToPerformAction(auth.currentUser.email);
  },
  methods: {
    btnEdit() {
      this.$router.push({ name: `${this.routeNamePrefix}-edit`, params: { qualifyingTestId: this.qualifyingTestId } });
    },
    btnReview() {
      this.$router.push({ name: `${this.routeNamePrefix}-review`, params: { qualifyingTestId: this.qualifyingTestId } });
    },
    async btnSendInvites() {
      await httpsCallable(functions, 'sendQualifyingTestReminders')({ qualifyingTestId: this.qualifyingTestId });
      return true;
    },
    async btnInitialise() {
      const data = { qualifyingTestId: this.qualifyingTestId };
      await httpsCallable(functions, 'initialiseQualifyingTest')( data );
      return true;
    },
    async btnActivate() {
      await httpsCallable(functions, 'activateQualifyingTest')({ qualifyingTestId: this.qualifyingTestId });
      return true;
    },
    async btnGetScores() {
      await httpsCallable(functions, 'scoreQualifyingTest')({ qualifyingTestId: this.qualifyingTestId });
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

<style scoped>
.tooltip-anchor {
  position: relative;
  width: 20px;
}

.question-or-option {
  position: relative;
  list-style-type: none;
  counter-increment: item;
}

#question::before {
  content: "Question " counter(item) ". ";
  font-weight: bold;
}

#option::before {
  content: "Option " counter(item) ". ";
  font-weight: bold;
}

.tooltip-wrapper {
  position: absolute;
  top: -10px
}
</style>
