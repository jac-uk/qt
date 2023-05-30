<template>
  <div class="govuk-grid-row">
    <LoadingMessage
      v-if="loaded === false"
      :load-failed="loadFailed"
    />
    <template v-else>
      <div class="govuk-grid-column-two-thirds">
        <Table
          v-if="hasData"
          data-key="id"
          :data="tableData"
          :columns="tableColumns"
        >
          <template #row="{row}">
            <TableCell>
              <RouterLink
                v-if="isOpenTest(row)"
                :to="{ path: `/online-tests/${row.id}/information` }"
                :class="`info-btn--qualifying-tests--to--${row.id}`"
              >
                {{ row.qualifyingTest.title }}
              </RouterLink>
              <strong v-else>{{ row.qualifyingTest.title }}</strong>
              <br>
              <span v-if="isFutureTest(row)">Start {{ prettyDate(row.qualifyingTest.startDate) }}<br></span>
              <span v-else>Deadline {{ prettyDate(row.qualifyingTest.endDate) }}</span>
            </TableCell>
            <TableCell>
              {{ $filters.lookup(status(row)) }}<br>
              <a
                v-if="showSurvey(row)"
                :href="row.qualifyingTest.feedbackSurvey"
                :class="`govuk-link info-btn--qualifying-tests--feedback-${row.id}--click-here`"
                target="_blank"
              >
                Feedback Survey
              </a>
            </TableCell>
          </template>
        </Table>
        <p
          v-else
          class="govuk-body-l"
        >
          There are no live tests. All tests have been completed or expired.
        </p>
      </div>
    </template>
  </div>
</template>

<script>
import Table from '@/components/Page/Table/Table';
import TableCell from '@/components/Page/Table/TableCell';
import LoadingMessage from '@/components/LoadingMessage';
import { isToday, isDateInFuture, formatDate, helperTimeLeft } from '@/helpers/date';
import { QUALIFYING_TEST } from '@/helpers/constants';

export default {
  components: {
    Table,
    TableCell,
    LoadingMessage,
  },
  data(){
    return {
      loaded: false,
      loadFailed: false,
      tableColumns: [
        { title: 'Test' },
        { title: 'Status' },
      ],
    };
  },
  computed: {
    showFeedbackColumn() {
      return this.closedTests.some((element) => element.qualifyingTest.feedbackSurvey);
    },
    qualifyingTestResponses() {
      return this.$store.state.qualifyingTestResponses.records.concat(this.$store.state.qualifyingTestResponses.dryRuns)
        .filter((qt, index, qts) => qts.findIndex(i => i.id === qt.id) === index);
    },
    hasData() {
      return this.tableData.length;
    },
    tableData(){
      const yesterday = function(d){ d.setDate(d.getDate() - 1); return d; }(new Date);
      return this.qualifyingTestResponses.filter(qt => {
        if (!(qt.qualifyingTest.endDate && qt.qualifyingTest.endDate.getTime() > yesterday)) { return false; }
        return true;
      });
    },
  },
  async mounted() {
    this.qualifyingTest;
    try {
      await this.$store.dispatch('qualifyingTestResponses/bind');
      await this.$store.dispatch('qualifyingTestResponses/bindDryRuns');
      this.loaded = true;
    } catch (e) {
      this.loadFailed = true;
      throw e;
    }
  },
  unmounted() {
    this.$store.dispatch('qualifyingTestResponses/unbind');
    this.$store.dispatch('qualifyingTestResponses/unbindDryRuns');
  },
  methods: {
    status(obj) {
      // TODO this needs re-coding against requirements
      const startedOrCompleted = obj.status === QUALIFYING_TEST.STATUS.STARTED || obj.status === QUALIFYING_TEST.STATUS.COMPLETED;
      const timeout = this.isTimeOut(obj.status, obj.statusLog.completed, this.isTimeLeft(obj));
      if (timeout) {
        return 'Completed (auto-submitted)';
      }
      if (startedOrCompleted) {
        return obj.status;
      }
      return QUALIFYING_TEST.STATUS.NOT_STARTED;
    },
    showSurvey(qt) {
      if (!qt.qualifyingTest.feedbackSurvey) return false;
      if (qt.status === QUALIFYING_TEST.STATUS.COMPLETED) return true;
      if (this.isTimeOut(qt.status, qt.statusLog.completed, this.isTimeLeft(qt))) return true;
      return false;
    },
    prettyDate(date) {
      const time = formatDate(date, 'time');
      const day = formatDate(date);
      return isToday(date) ? `${time} today` : `${time} on ${day}`;
    },
    isTimeLeft(qt) {
      return helperTimeLeft(qt) > 0;
    },
    isTimeOut(testStatus, logCompleted, isTimeLeft) {
      const timeout = (testStatus == QUALIFYING_TEST.STATUS.STARTED && logCompleted === null && !isTimeLeft);
      return timeout;
    },
    isOpenTest(qt) {
      // status must be activated or started
      if ([QUALIFYING_TEST.STATUS.ACTIVATED, QUALIFYING_TEST.STATUS.STARTED].indexOf(qt.status) < 0) { return false; }

      // startDate must be earlier than now (TODO take account of serverTimeOffset)
      if (!(qt.qualifyingTest.startDate && qt.qualifyingTest.startDate.getTime() < Date.now())) { return false; }

      // endDate must be later than now
      if (!(qt.qualifyingTest.endDate && qt.qualifyingTest.endDate.getTime() > Date.now())) { return false; }

      // if test has started then it must have time left
      if (qt.status === QUALIFYING_TEST.STATUS.STARTED) {
        if (!this.isTimeLeft(qt)) { return false; }
      }

      return true;
    },
    isFutureTest(qt) {
      return isDateInFuture(qt.qualifyingTest.startDate)
        || (isDateInFuture(qt.qualifyingTest.endDate) && qt.status === QUALIFYING_TEST.STATUS.CREATED);
    },
  },
};
</script>
