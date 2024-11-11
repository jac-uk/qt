<template>
  <div>
    <div class="govuk-!-margin-bottom-1">
      <h2 class="govuk-heading-m">
        {{ isTieBreaker ? 'Equal merit tie-breaker' : 'Qualifying test' }} response:
        <span>
          <routerLink
            :to="{ name: `${routeNamePrefix}-view`, params: { qualifyingTestId: $route.params.qualifyingTestId } }"
          >
            {{ $filters.showAlternative(qualifyingTest.title, qualifyingTest.id) }}
          </routerLink>
          <!-- {{ qualifyingTest.mode == 'mop-up' ? 'Mop-up' : '' }} -->
        </span>
      </h2>
      <h3
        v-if="participant.fullName"
        class="govuk-heading-l"
      >
        {{ participant.fullName }} ({{ participant.email }})
      </h3>
      <h3
        v-else
        class="govuk-heading-l"
      >
        {{ participant.email }}
      </h3>

      <h2 class="govuk-heading-m">
        Test details
      </h2>

      <dl
        v-if="response"
        class="govuk-summary-list"
      >
        <div class="govuk-summary-list__row">
          <dt class="govuk-summary-list__key">
            Status
          </dt>
          <dd class="govuk-summary-list__value">
            {{ $filters.lookup(response.status) }} {{ response.isOutOfTime ? '(auto-submitted)' : '' }}
            <button
              v-if="authorisedToPerformAction"
              :disabled="hasActivated"
              type="secondary"
              class="govuk-button govuk-button--secondary float-right govuk-!-margin-bottom-1"
              @click="resetTest"
            >
              Reset
            </button>
            <ActionButton
              v-if="authorisedToPerformAction"
              :disabled="hasCompleted"
              type="secondary"
              class="float-right govuk-!-margin-bottom-1 govuk-!-margin-right-1"
              :action="markAsCompleted"
            >
              Mark as completed
            </ActionButton>
          </dd>
        </div>
        <div class="govuk-summary-list__row">
          <dt class="govuk-summary-list__key">
            Start date
          </dt>
          <dd class="govuk-summary-list__value">
            <template
              v-if="testStartTimestamps.length"
            >
              <span>
                <span
                  v-for="started in testStartTimestamps"
                  :key="started"
                >
                  {{ $filters.formatDate(started, 'datetime') }}
                  <br>
                </span>
              </span>
            </template>
            <span v-else>{{ $filters.formatDate(qualifyingTest.startDate, 'datetime') }}</span>
            <div v-if="hasRelatedTests && isEditingTestDate">
              <Select
                id="moveToTest"
                v-model="moveToTest"
                required
              >
                <option value="">
                  Choose new test date
                </option>
                <option
                  v-for="test in relatedTests"
                  :key="test.id"
                  :value="test.id"
                >
                  {{ test.title }} - {{ $filters.formatDate(test.startDate, 'datetime') }}
                </option>
              </Select>
              <button
                class="govuk-button"
                :disabled="!moveToTest"
                @click="btnMoveTest"
              >
                Save
              </button>
            </div>
            <span
              v-if="hasRelatedTests && !isEditingTestDate"
              class="float-right"
            >
              <a
                href="#"
                class="govuk-link print-none"
                @click.prevent="btnEditTestDate"
              >Change</a>
            </span>
          </dd>
        </div>
        <div
          v-if="hasCompleted"
          class="govuk-summary-list__row"
        >
          <dt class="govuk-summary-list__key">
            End date
          </dt>
          <dd class="govuk-summary-list__value">
            {{ $filters.formatDate(response.statusLog.completed, 'datetime') }}
          </dd>
        </div>
        <div
          v-if="hasCompleted"
          class="govuk-summary-list__row"
        >
          <dt class="govuk-summary-list__key">
            Time taken
          </dt>
          <dd class="govuk-summary-list__value">
            {{ timeTaken }}
          </dd>
        </div>
        <div
          v-if="response.score"
          class="govuk-summary-list__row"
        >
          <dt class="govuk-summary-list__key">
            Score
          </dt>
          <dd class="govuk-summary-list__value">
            {{ response.score }}
          </dd>
        </div>
        <div class="govuk-summary-list__row">
          <dt class="govuk-summary-list__key">
            Reasonable Adjustments
          </dt>
          <dd
            v-if="response"
            class="govuk-summary-list__value"
          >
            <table class="govuk-table">
              <tr class="govuk-table__row">
                <td class="govuk-table__cell">
                  Duration / Adjusted
                </td>
                <td class="govuk-table__cell">
                  {{ response.duration.testDuration }} min. / {{ response.duration.testDurationAdjusted }} min.
                </td>
              </tr>
              <tr class="govuk-table__row">
                <td class="govuk-table__cell">
                  Adjustment
                </td>
                <td class="govuk-table__cell">
                  <EditableField
                    :value="response.duration.reasonableAdjustment"
                    field="reasonableAdjustment"
                    :edit-mode="true"
                    @change-field="(obj) => actionReasonableAdjustment(obj, response.duration, responseId)"
                  />
                  {{ response.participant.reasonableAdjustmentsDetails }}
                </td>
              </tr>
              <tr
                v-if="response.duration.reasonableAdjustment"
                class="govuk-table__row"
              >
                <td class="govuk-table__cell">
                  Justification
                </td>
                <td class="govuk-table__cell">
                  <EditableField
                    :value="response.duration.reasonableAdjustmentsJustification"
                    field="reasonableAdjustmentsJustification"
                    :edit-mode="true"
                    type="textarea"
                    @change-field="(obj) => actionReasonableAdjustmentJustification(obj, responseId)"
                  />
                </td>
              </tr>
            </table>
          </dd>
        </div>
        <div
          v-if="authorisedToPerformAction"
          class="govuk-summary-list__row"
        >
          <dt class="govuk-summary-list__key">
            Message
          </dt>
          <dd class="govuk-summary-list__value">
            <EditableMessage
              getter="qualifyingTestResponses/data"
              dispatcher="qualifyingTestResponses/update"
              :message="responseMessage"
              :record-id="responseId"
            />
          </dd>
        </div>
      </dl>
      <Modal ref="confirmResetModal">
        <div class="container">
          <div class="modal__title govuk-!-padding-2 govuk-heading-m">
            Caution
          </div>
          <div class="modal__content govuk-!-padding-4">
            <p class="modal__message govuk-body-l">
              Reseting this participant's test will overwrite their
              'started', 'completed' and 'time taken' fields.
              <br>
              Please ensure there is a record of these before continuing.
            </p>

            <span>
              <button
                class="govuk-button govuk-button--secondary govuk-!-margin-right-3 deny info-btn--modal--cancel"
                @click="$refs['confirmResetModal'].closeModal()"
              >
                Cancel
              </button>
            </span>
            <ActionButton
              class="govuk-button govuk-button--warning"
              :action="confirmReset"
            >
              Reset Test
            </ActionButton>
          </div>
        </div>
      </Modal>
      <div v-if="hasStarted">
        <TabsList
          v-model:active-tab="activeTab"
          :tabs="tabs"
        />

        <div v-if="activeTab === 'questions'">
          <h2 class="govuk-heading-m">
            Questions
          </h2>

          <dl class="govuk-summary-list">
            <div
              v-if="response.testQuestions.introduction"
              class="govuk-summary-list__row"
            >
              <dt class="govuk-summary-list__key">
                Introduction
              </dt>
              <dd class="govuk-summary-list__value">
                {{ response.testQuestions.introduction }}
              </dd>
            </div>

            <div
              v-for="(testQuestion, index) in questions"
              :key="index"
              class="govuk-summary-list__row"
            >
              <dt class="govuk-summary-list__key">
                {{ questionLabel }} {{ index + 1 }}
                <br>
                <QuestionDuration
                  v-if="!isScenario"
                  :start="getQuestionDurationStart(responses, index)"
                  :end="lastUpdatedQuestion(index)"
                />
                <div
                  v-if="isScenario && responses[index]"
                >
                  <div
                    v-for="(res, i) in responses[index].responsesForScenario"
                    :key="i"
                  >
                    <span
                      v-if="responses[index].responsesForScenario[i].started"
                    >
                      <span
                        class="govuk-hint"
                      >
                        Question {{ i+1 }}
                        <QuestionDuration
                          :start="questionStartTimestamps(index).length ? questionStartTimestamps(index) : responses[index].responsesForScenario[i].started"
                          :end="responses[index].responsesForScenario[i].completed || lastUpdatedQuestion(scenarioQuestionIndex(i, index))"
                        />
                      </span>
                    </span>
                  </div>
                </div>
              </dt>
              <dd class="govuk-summary-list__value">
                <div v-if="isScenario">
                  <dl
                    v-for="(document, docIndex) in testQuestion.documents"
                    :key="docIndex"
                  >
                    <dt>{{ document.title }}</dt>
                    <!-- eslint-disable -->
                    <dd v-html="document.content" />
                    <!-- eslint-enable -->
                  </dl>
                </div>
                <div v-else>
                  {{ testQuestion.details }}
                </div>
                <hr class="govuk-section-break govuk-section-break--visible">
                <ol v-if="isCriticalAnalysis && responses[index]">
                  <li
                    v-for="(res, i) in testQuestion.options"
                    :key="i"
                    :class="checkSelected(i, testQuestion.correct, responses[index].selection)"
                  >
                    {{ res.answer }}
                  </li>
                </ol>

                <ol v-if="isSituationalJudgment && responses[index]">
                  <li
                    v-for="(res, i) in testQuestion.options"
                    :key="i"
                    :class="checkSelectedSituationalJudgement(i, {leastAppropriate: testQuestion.leastAppropriate, mostAppropriate: testQuestion.mostAppropriate}, { ...responses[index].selection })"
                  >
                    {{ res.answer }}
                  </li>
                </ol>

                <ol v-if="isScenario && responses[index]">
                  <li
                    v-for="(res, i) in responses[index].responsesForScenario"
                    :key="i"
                  >
                    <p>
                      <strong>{{ testQuestion.options[i].question }}</strong>
                      <span
                        v-if="testQuestion.options[i].hint"
                        class="govuk-hint"
                      >{{ testQuestion.options[i].hint
                      }}</span>
                    </p>
                    <span v-if="res.started !== null && res.text === null">
                      [Answer skipped]
                    </span>
                    <span v-else>
                      <p>{{ res.text }} </p>
                    </span>
                  </li>
                </ol>
              </dd>
            </div>
          </dl>
        </div>
        <div v-if="activeTab === 'logs'">
          <h2 class="govuk-heading-m">
            Connection
          </h2>
          <div
            v-for="(log, i) in logs"
            :key="i"
          >
            <table>
              <tr class="log_row">
                <td class="log_row_time">
                  {{ timeDifference(log) }}
                </td>
                <td class="log_row_date">
                  {{ log.on }}<br> {{ log.off }}
                </td>
              </tr>
              <tr>
                <td class="log_row_time">
                  {{ timeOffline(i) }}
                </td>
                <td class="log_row_date">
                  {{ timeOffline(i) ? 'OFFLINE' : '' }}
                </td>
              </tr>
            </table>
          </div>
        </div>
        <div v-if="activeTab === 'client'">
          <h2 class="govuk-heading-m">
            Client
          </h2>
          <dl
            v-if="response.client"
            class="govuk-summary-list"
          >
            <div class="govuk-summary-list__row">
              <dt class="govuk-summary-list__key">
                Platform
              </dt>
              <dd class="govuk-summary-list__value">
                {{ response.client.platform }}
              </dd>
            </div>
            <div class="govuk-summary-list__row">
              <dt class="govuk-summary-list__key">
                Browser
              </dt>
              <dd class="govuk-summary-list__value">
                {{ response.client.userAgent }}
              </dd>
            </div>
            <div class="govuk-summary-list__row">
              <dt class="govuk-summary-list__key">
                Timezone
              </dt>
              <dd class="govuk-summary-list__value">
                {{ response.client.timezone }}
              </dd>
            </div>
            <div
              v-if="initialServerOffset"
              class="govuk-summary-list__row"
            >
              <dt class="govuk-summary-list__key">
                Initial time offset
              </dt>
              <dd class="govuk-summary-list__value">
                {{ initialServerOffset / 1000 }} seconds
              </dd>
            </div>
            <div
              v-if="latestServerOffset"
              class="govuk-summary-list__row"
            >
              <dt class="govuk-summary-list__key">
                Latest time offset
              </dt>
              <dd class="govuk-summary-list__value">
                {{ latestServerOffset / 1000 }} seconds
              </dd>
            </div>
          </dl>
        </div>
        <div v-if="activeTab === 'history'">
          <h2 class="govuk-heading-m">
            History
          </h2>
          <div v-if="responses.length">
            <table class="history-logs">
              <div v-if="!isScenario">
                <div
                  v-for="(testQuestion, index) in questions"
                  :key="index"
                  class="log_row"
                >
                  <tr>
                    <td>
                      Question {{ index + 1 }}
                    </td>
                  </tr>
                  <tr>
                    <td>First started question: </td>
                    <td>
                      <li
                        style="list-style-type: none;"
                      >
                        {{ $filters.formatDate(responses[index].started, 'datetime') }}
                      </li>
                      <li
                        v-for="started in firstVisitOfDayToQuestion(index)"
                        :key="started"
                        style="list-style-type: none;"
                      >
                        {{ $filters.formatDate(started, 'datetime') }}
                      </li>
                    </td>
                  </tr>
                  <tr>
                    <td>Last updated answer: </td>
                    <td>{{ $filters.formatDate(lastUpdatedQuestion(index), 'datetime') }}</td>
                  </tr>
                  <tr>
                    <td>Amount of time on question: </td>
                    <td>{{ amountOfTimeOnQuestion(index) }}</td>
                  </tr>
                  <tr>
                    <td>How many times visited question: </td>
                    <td>{{ amountOfTimeVisitedQuestion(index) }} </td>
                  </tr>
                  <tr>
                    <td>How many times saved: </td>
                    <td>
                      {{ historyCount('save', index) }}
                    </td>
                  </tr>
                  <tr>
                    <td>How many times skipped: </td>
                    <td>{{ historyCount('skip', index) }}</td>
                  </tr>
                  <tr>
                    <td>How many times changed answer: </td>
                    <td>{{ historyCount('changed', index) }}</td>
                  </tr>
                </div>
              </div>
              <div v-else-if="isScenario">
                <hr>
                <div
                  v-for="(question, i) in questions"
                  :key="i"
                  class="log_row"
                >
                  <div
                    v-for="(testQuestion, index) in question.options"
                    :key="index"
                  >
                    <tr>
                      <td>
                        Question {{ getOverallQuestionNumber(i+1, index+1) }}
                        <br>
                        <span
                          class="govuk-hint govuk-caption-s govuk-!-margin-bottom-0"
                        >
                          Scenario {{ i + 1 }}: Question {{ index + 1 }}
                        </span>
                      </td>
                    </tr>
                    <hr>
                    <tr>
                      <td>First started question: </td>
                      <td>
                        <li
                          v-if="!firstVisitOfDayToQuestion(i, index).length"
                          style="list-style-type: none;"
                        >
                          {{ $filters.formatDate(responses[i].responsesForScenario[index].started, 'datetime') }}
                        </li>
                        <li
                          v-for="started in firstVisitOfDayToQuestion(scenarioQuestionIndex(i,index))"
                          v-else
                          :key="started"
                          style="list-style-type: none;"
                        >
                          {{ $filters.formatDate(started, 'datetime') }}
                        </li>
                      </td>
                    </tr>
                    <tr>
                      <td>Last updated answer: </td>
                      <td>{{ $filters.formatDate(lastUpdatedQuestion(scenarioQuestionIndex(i, index)), 'datetime') }}</td>
                    </tr>
                    <tr>
                      <td>Amount of time on question: </td>
                      <td>{{ amountOfTimeOnQuestion(scenarioQuestionIndex(i, index)) }}</td>
                    </tr>
                    <tr>
                      <td>How many times visited question: </td>
                      <td>{{ amountOfTimeVisitedQuestion(scenarioQuestionIndex(i, index)) }} </td>
                    </tr>
                    <tr>
                      <td>How many times saved: </td>
                      <td>
                        {{ historyCount('saved', scenarioQuestionIndex(i, index)) }}
                      </td>
                    </tr>
                    <tr>
                      <td>How many times skipped: </td>
                      <td>{{ historyCount('skip', scenarioQuestionIndex(i, index)) }}</td>
                    </tr>
                    <tr>
                      <td>How many times changed answer: </td>
                      <td>{{ historyCount('changed', scenarioQuestionIndex(i, index)) }}</td>
                    </tr>
                    <hr>
                  </div>
                </div>
              </div>
            </table>
          </div>
          <div
            v-for="(log, i) in sortHistory()"
            :key="i"
          >
            <table>
              <tr class="log_row">
                <td class="log_row_time">
                  {{ $filters.formatDate(log.timestamp, 'datetime') }}
                </td>
                <td class="log_row_date">
                  <span v-if="log.action">{{ log.action }} </span>
                  <span v-if="log.question >= 0">question {{ log.question + 1 }} </span>
                  <span v-if="log.txt">("{{ log.txt }}" on {{ log.location }})</span>
                  <span v-if="log.answer">(to answer {{ log.answer.value + 1 }} {{ log.answer.type }})</span>
                  <!-- <span v-if="log.location">{{ log.location }}</span> -->

                  <!-- <br>
                  {{ i }}<br> {{ log }} -->
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { auth } from '@/firebase';
import { QUALIFYING_TEST } from '@/helpers/constants';
import EditableField from '@jac-uk/jac-kit/draftComponents/EditableField.vue';
import Select from '@jac-uk/jac-kit/draftComponents/Form/Select.vue';
import TabsList from '@jac-uk/jac-kit/draftComponents/TabsList.vue';
import QuestionDuration from '@/components/Micro/QuestionDuration.vue';
import ActionButton from '@jac-uk/jac-kit/draftComponents/ActionButton.vue';
import { authorisedToPerformAction }  from '@/helpers/authUsers';
import Modal from '@jac-uk/jac-kit/components/Modal/Modal.vue';
import EditableMessage from '@/components/Micro/EditableMessage.vue';

export default {
  components: {
    EditableField,
    Select,
    TabsList,
    Modal,
    QuestionDuration,
    ActionButton,
    EditableMessage,
  },
  data() {
    return {
      moveToTest: '',
      isEditingTestDate: false,
      activeTab: 'questions',
      authorisedToPerformAction: false,
      history: null,
    };
  },
  computed: {
    tabs(){
      const tabsList = [];
      if (this.response) {
        tabsList.push({
          ref: 'questions',
          title: 'Questions',
        });
        if (this.response.client) {
          tabsList.push({
            ref: 'client',
            title: 'Client',
          });
        }
        if (this.logs) {
          tabsList.push({
            ref: 'logs',
            title: 'Connection',
          });
        }
        if (this.response.history) {
          tabsList.push({
            ref: 'history',
            title: 'History',
          });
        }
      }
      return tabsList;
    },
    responseId() {
      const id = this.$route.params.responseId;
      return id;
    },
    response() {
      const qtList = this.$store.state.qualifyingTestResponses.record;
      return qtList;
    },
    responseMessage() {
      return ('message' in this.response) ? this.response.message : '';
    },
    responses() {
      let responses = [];
      if (this.response.responses && this.response.responses.length) {
        responses = this.response.responses;
      } else {  // check for responses on testQuestions (backward compatibility)
        if (this.response.testQuestions && this.response.testQuestions.questions) {
          this.response.testQuestions.questions.forEach(question => {
            if (this.isScenario) {
              if (question.responses) {
                responses.push({
                  responsesForScenario: question.responses,
                });
              }
            } else {
              if (question.response) {
                responses.push(question.response);
              }
            }
          });
        }
      }
      return responses;
    },
    qualifyingTest() {
      const qtList = this.$store.state.qualifyingTest.record;
      return qtList;
    },
    qualifyingTests() {
      return this.$store.state.qualifyingTest.records;
    },
    relatedTests() {
      if (this.qualifyingTests) {
        if (this.qualifyingTest && this.qualifyingTest.relationship && this.qualifyingTest.relationship.copiedFrom) {
          return this.qualifyingTests.filter(item => {
            return item.id === this.qualifyingTest.relationship.copiedFrom ||
              (item.relationship && item.relationship.copiedFrom === this.qualifyingTest.relationship.copiedFrom);
          });
        } else {
          return this.qualifyingTests.filter(item => {
            return item.relationship && item.relationship.copiedFrom === this.qualifyingTest.id;
          });
        }
      } else {
        return [];
      }
    },
    hasRelatedTests() {
      return this.relatedTests && this.relatedTests.length;
    },
    participant() {
      return this.response ? this.response.participant : {};
    },
    questionLabel() {
      let label = 'Question';

      if (this.qualifyingTest.type === QUALIFYING_TEST.TYPE.SCENARIO) {
        label = 'Scenario';
      }
      return label;
    },
    questions() {
      let returnQuestions = [];
      // merge the two objects;
      if (this.response.testQuestions.questions) {
        returnQuestions = this.response.testQuestions.questions.map((item, index) => {
          return { ...item, ...this.qualifyingTest.testQuestions.questions[index] };
        });
      }
      // #1077 get questions from the QT when copied over
      if (returnQuestions.length === 0) {
        returnQuestions = this.qualifyingTest.testQuestions && this.qualifyingTest.testQuestions.questions;
      }
      return returnQuestions;
    },
    timeTaken() {
      let diff = 0;
      if (this.response.statusLog.completed && this.response.statusLog.started) {
        diff = this.response.statusLog.completed - this.response.statusLog.started;
      }
      const newDate = new Date(diff);
      const hh = `0${newDate.getUTCHours()}`.slice(-2);
      const mm = `0${newDate.getUTCMinutes()}`.slice(-2);
      const ss = `0${newDate.getUTCSeconds()}`.slice(-2);
      const returnTimeTaken = `${hh}:${mm}:${ss}`;
      return returnTimeTaken;
    },
    isCriticalAnalysis() {
      return this.qualifyingTest.type === QUALIFYING_TEST.TYPE.CRITICAL_ANALYSIS;
    },
    isSituationalJudgment() {
      return this.qualifyingTest.type === QUALIFYING_TEST.TYPE.SITUATIONAL_JUDGEMENT;
    },
    isScenario() {
      return this.qualifyingTest.type === QUALIFYING_TEST.TYPE.SCENARIO;
    },
    hasActivated() {
      return this.response.status === QUALIFYING_TEST.STATUS.ACTIVATED;
    },
    hasStarted() {
      return this.response ? true : false;
    },
    hasCompleted() {
      return this.response && this.response.status === QUALIFYING_TEST.STATUS.COMPLETED;
    },
    logs() {
      return this.$store.state.connectionMonitor.records;
    },
    isTieBreaker() {
      return this.qualifyingTest.isTieBreaker;
    },
    routeNamePrefix() {
      return this.isTieBreaker ? 'equal-merit-tie-breaker' : 'qualifying-test';
    },
    initialServerOffset() {
      if (this.response && this.response.client && this.response.statusLog) {
        const offset = this.response.statusLog.started - this.response.client.timestamp;
        return offset;
      }
      return false;
    },
    latestServerOffset() {
      if (this.response && this.response.lastUpdated && this.response.lastUpdatedClientTime) {
        const offset = this.response.lastUpdated - this.response.lastUpdatedClientTime;
        return offset;
      }
      return false;
    },
    testStartTimestamps() {
      let result = [];
      if (this.response.history) {
        result = this.earliestVisitOnEachDate(this.response.history.filter(item => (item.action === 'start' && item.location === 'information')).map(item => item.timestamp));
      }
      return result;
    },
  },
  watch: {
    activeTab: async function (newActiveTab) {
      if (newActiveTab === 'logs') {
        const participantId = this.participant.id;
        const qualifyingTestId = this.$route.params.qualifyingTestId;
        await this.$store.dispatch('connectionMonitor/bind', { qualifyingTestId, participantId });
      }
      if (newActiveTab === 'history') {
        this.dateCalculate = null;
      }
    },
  },
  async created() {
    this.$store.dispatch('qualifyingTestResponses/bindRecord', { id: this.responseId });
    const email = auth.currentUser.email;
    this.authorisedToPerformAction = await authorisedToPerformAction(email);
  },
  methods: {
    getQuestionDurationStart(responses, index) {
      let result = null;
      if (responses && responses[index]) {
        result = this.questionStartTimestamps(index).length ? this.questionStartTimestamps(index) : responses[index].started;
      }
      return result;
    },
    scenarioQuestionIndex(scenario, question){
      return this.getOverallQuestionNumber(scenario + 1, question + 1) - 1;
    },
    getOverallQuestionNumber(scenarioNumber, questionNumber) {
      let overallQuestionNumber = 0;

      for (let i = 0; i < scenarioNumber - 1; i++) {
        overallQuestionNumber += this.response.testQuestions.questions[i].options.length;
      }

      overallQuestionNumber += questionNumber;

      return overallQuestionNumber;
    },
    earliestVisitOnEachDate(dates) {
      const result = {};

      // Loop through each date
      dates.forEach(dateStr => {
        const dateObj = new Date(dateStr);

        const dayKey = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format

        // Check if this is the earliest instance for this day
        if (!result[dayKey] || new Date(result[dayKey]) > dateObj) {
          result[dayKey] = dateStr; // Store the earliest instance for this day
        }
      });

      return Object.values(result);
    },
    firstVisitOfDayToQuestion(number) {
      const dates = this.questionStartTimestamps(number);
      const dayMap = this.earliestVisitOnEachDate(dates);

      return Object.values(dayMap);
    },
    questionStartTimestamps(number) {
      let result = [];
      if (this.response.history) {
        result = this.response.history.filter(item => item.action == 'start' && item.question == number).map(item => item.timestamp);
      }
      return result;
    },
    async confirmReset() {
      if (this.authorisedToPerformAction && this.authorisedToPerformAction === true) {
        try {
          await this.$store.dispatch('qualifyingTestResponses/resetTest');
          this.$refs['confirmResetModal'].closeModal();
          return true;
        } catch (_) {
          return false;
        }
      }
    },
    resetTest() {
      this.$refs['confirmResetModal'].openModal();
    },
    async markAsCompleted() {
      if (this.authorisedToPerformAction && this.authorisedToPerformAction === true) {
        try {
          await this.$store.dispatch('qualifyingTestResponses/markAsCompleted');
          return true;
        } catch (_) {
          return false;
        }
      }
    },
    actionReasonableAdjustment(obj, duration, id) {
      const reasonableAdjustment = Number(obj.reasonableAdjustment);
      const calculation = reasonableAdjustment + Number(duration.testDuration);
      const returnObj = {
        duration: {
          ...this.response.duration,
          testDuration: duration.testDuration,
          testDurationAdjusted: calculation,
          reasonableAdjustment: reasonableAdjustment,
        },
      };
      this.$store.dispatch('qualifyingTestResponses/updateRA', { data: returnObj, id: id });
    },
    actionReasonableAdjustmentJustification(obj, id) {
      const returnObj = {
        duration: {
          ...this.response.duration,
          reasonableAdjustmentsJustification: obj.reasonableAdjustmentsJustification,
        },
      };
      this.$store.dispatch('qualifyingTestResponses/updateRA', { data: returnObj, id: id });
    },
    checkSelected(index, rightAnswer, selectedAnswer) {
      let returnClass = '';
      const isSelectedAnswer = index === selectedAnswer;
      const isRightAnswer = index === rightAnswer;
      const isRightAndSelectedAnswer = isSelectedAnswer && isRightAnswer;

      // eslint-disable-next-line no-console
      // console.log('checkResponse', index, rightAnswer, selectedAnswer);
      if (isRightAnswer) {
        returnClass += ' answer--right';
      }
      if (isSelectedAnswer && !isRightAnswer) {
        returnClass += ' answer--selected--wrong';
      }
      if (isRightAndSelectedAnswer) {
        returnClass += ' answer--selected--correct';
      }

      return returnClass;
    },
    checkSelectedSituationalJudgement(index, rightAnswer, selectedAnswer) {
      // eslint-disable-next-line no-console
      // console.log('checkSelectedSituationalJudgement', index, rightAnswer, selectedAnswer);
      let returnClass = '';

      const isSelectedAnswerMost = index === selectedAnswer.mostAppropriate ;
      const isSelectedAnswerLeast = index === selectedAnswer.leastAppropriate;

      const isRightAnswerMost = index === rightAnswer.mostAppropriate;
      const isRightAnswerLeast = index === rightAnswer.leastAppropriate;

      const isRightAndSelectedAnswerMost = isRightAnswerMost && isSelectedAnswerMost;
      const isRightAndSelectedAnswerLeast = isRightAnswerLeast && isSelectedAnswerLeast;

      if (isRightAnswerMost || isRightAnswerLeast) {
        returnClass += ' answer--right';
      }
      if (isSelectedAnswerMost && !isRightAnswerMost || isSelectedAnswerLeast && !isRightAnswerLeast) {
        returnClass += ' answer--selected--wrong';
      }
      if (isRightAndSelectedAnswerMost || isRightAndSelectedAnswerLeast) {
        returnClass += ' answer--selected--correct';
      }

      return returnClass;
    },
    async btnMoveTest() {
      if (this.moveToTest) {
        const destinationTest = this.qualifyingTests.find(item => item.id === this.moveToTest);
        await this.$store.dispatch('qualifyingTestResponses/moveTest', { qualifyingTest: destinationTest, qualifyingTestResponse: this.response });
        this.isEditingTestDate = false;
        this.$router.push({
          name: `${this.routeNamePrefix}-responses`,
          params: {
            qualifyingTestId: this.qualifyingTest.id,
            status: 'all',  // TODO go to same list status as before
          },
        });
      }
    },
    btnEditTestDate() {
      this.isEditingTestDate = true;
    },
    timeDifference(log) {
      if (log.offline === undefined) {
        return 'ONLINE';
      } else {
        const minDate = (log.offline - log.online);
        return new Date(minDate).toISOString().substr(11, 8);
      }
    },
    differenceInTime(index, date) {
      const date2 = this.dateCalculate === null ? date : this.dateCalculate ;
      const minDate = date - date2;
      this.dateCalculate = date;
      return index === 0 ? '00:00:00' : new Date(minDate).toISOString().substr(11, 8);
    },
    differenceInMills(entry1, entry2) {
      return (entry1 - entry2);
    },
    timeOffline(index) {
      const thisTimeOffline = this.logs[index] && this.logs[index].offline;
      const nextIndex = index + 1 >= this.logs.length ? this.logs.length : index + 1;
      const nextTimeOnline = this.logs[nextIndex] && this.logs[nextIndex].online;
      const timeOffline = nextTimeOnline - thisTimeOffline;
      if (nextTimeOnline === undefined || thisTimeOffline === undefined) {
        return;
      } else {
        return new Date(timeOffline).toISOString().substr(11, 8);
      }
    },
    sortHistory() {
      let ordered = {};
      if (this.response.history) {
        ordered = Object.keys(this.response.history).sort()
          .reduce(
            (obj, key) => {
              obj[key] = this.response.history[key];
              return obj;
            },
            {}
          );
      }
      return ordered;
    },
    historyCount(value, index) {
      let timeSaved = {};
      if (this.response.history) {
        timeSaved = Object.keys(this.response.history)
          .filter(key => {
            return (this.response.history[key].action === value && this.response.history[key].question === index);
          });
      }
      const amountTimeSaved = Object.keys(timeSaved).length;
      return amountTimeSaved;
    },
    amountOfTimeOnQuestion(index) {
      let millisecs = 0;
      if (this.response.history && this.response.questionSession) {
        Object.keys(this.response.questionSession).map(key => {
          const item = this.response.questionSession[key];
          if (item.question === index) {
            const diff = this.differenceInMills(item.end, item.start);
            millisecs = millisecs + diff;
          }
        });
      }
      let result;
      if (!isNaN(millisecs)) {
        result = new Date(millisecs).toISOString().substr(11, 8);
      }
      return result;

    },
    amountOfTimeVisitedQuestion(index) {
      let counter = 0;
      if (this.response.history) {
        Object.keys(this.response.history).map(key => {
          const item = this.response.history[key];
          if (item.question === index && (item.action === 'save' || item.action === 'saved' || item.action === 'skip' || item.action === 'exit')) {
            counter++;
          }
        });
      }
      return counter;
    },
    lastUpdatedQuestion(index) {
      let latestTimestamp;
      if (this.response.history) {
        Object.keys(this.response.history).map(key => {
          const item = this.response.history[key];
          if (item.question === index && (item.action === 'save' || item.action === 'saved' || item.action === 'changed')) {
            if (item.timestamp && (!latestTimestamp || item.timestamp > latestTimestamp)) {
              latestTimestamp = item.timestamp;
            }
          }
        });
      } else {  // default to completed timestamp
        if (this.responses && this.responses[index]) {
          latestTimestamp = this.responses[index].completed;
        }
      }
      return latestTimestamp;
    },
  },
};
</script>

<style lang="scss" scoped>
  .deny {
    background-color: #f3f2f1;
  }
  .answer--right {
    font-weight: bold;
    text-decoration: underline;
  }
  .answer--selected--wrong {
    background-color: #FFCCCC;
  }
  .answer--selected--correct {
    background-color: #00FFCC;
  }
  .log_row_time {
    font-weight: bold;
    border-bottom: 1px solid silver;
    padding: 5px;
  }
  .log_row_date {
    font-size: 12px;;
    color: grey;
    border-bottom: 1px solid silver;
    line-height: 1;
    padding: 5px;
  }
  .history-logs {
    font-weight: bold;
    font-size: larger;
    width: 100%;
  }
</style>
