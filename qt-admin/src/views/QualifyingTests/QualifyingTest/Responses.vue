<template>
  <div class="govuk-!-margin-bottom-1">
    <h1
      class="govuk-heading-l govuk-!-margin-bottom-4"
      @click="goToQualifyingTest"
    >
      {{ $filters.showAlternative(qualifyingTest.title, qualifyingTest.id) }}
      <span
        v-if="qualifyingTest.mode"
        class="govuk-tag govuk-tag--grey govuk-!-margin-left-2"
      >{{ $filters.lookup(qualifyingTest.mode) }}</span>
    </h1>
    <button
      class="govuk-button govuk-!-margin-bottom-0 float-right"
      @click="downloadResponses"
    >
      Download responses
    </button>
    <h2 class="govuk-heading-m">
      {{ isTieBreaker ? 'Equal merit tie-breaker' : 'Qualifying test' }} responses / {{ $filters.lookup(searchStatus) }}
    </h2>
    <Table
      data-key="id"
      :data="responses"
      :page-size="50"
      :columns="tableColumns"
      :search-map="searchMapConfig"
      @change="getTableData"
    >
      <template #row="{row}">
        <TableCell :title="tableColumns[0].title">
          {{ $filters.showAlternative(row.participant.fullName, row.participant.email) }}
        </TableCell>
        <TableCell :title="tableColumns[1].title">
          {{ $filters.lookup(row.status) }} {{ row.isOutOfTime ? '(auto-submitted)' : '' }}
        </TableCell>
        <TableCell :title="tableColumns[2].title">
          {{ formatTimeLimit(row.duration.testDurationAdjusted) }}
        </TableCell>
        <TableCell :title="tableColumns[3].title">
          <RouterLink
            :to="{ name: `${routeNamePrefix}-response-view`, params: { qualifyingTestId: qualifyingTestId, responseId: row.id, status: 'all' } }"
          >
            View
          </RouterLink>
        </TableCell>
      </template>
    </Table>
  </div>
</template>

<script>
import Table from '@jac-uk/jac-kit/components/Table/Table.vue';
import TableCell from '@jac-uk/jac-kit/components/Table/TableCell.vue';
import { functions } from '@/firebase';
import { downloadXLSX } from '@jac-uk/jac-kit/helpers/export';
import * as filters from '@jac-uk/jac-kit/filters/filters';
import { httpsCallable } from '@firebase/functions';

export default {
  components: {
    Table,
    TableCell,
  },
  data() {
    const qualifyingTest = this.$store.state.qualifyingTest.record;
    const tableColumns = [];
    if (qualifyingTest.mode === 'dry-run') {
      tableColumns.push({ title: 'Name', sort: 'participant.email', default: true });
      tableColumns.push({ title: 'Status' });
      tableColumns.push({ title: 'Time Limit' });
      tableColumns.push({ title: '' });
    } else {
      tableColumns.push({ title: 'Name', sort: 'participant.fullName', default: true });
      tableColumns.push({ title: 'Status' });
      tableColumns.push({ title: 'Time Limit', sort: 'duration.testDurationAdjusted' });
      tableColumns.push({ title: '' });
    }

    return {
      tableColumns: tableColumns,
      searchMapConfig: {
        title: 'Search responses',
        tooltip: {
          visible: ['Name'],
          hidden: [],
        },
      },
    };
  },
  computed: {
    exerciseId() {
      return this.$route.params.id;
    },
    equalityAndDiversity() {
      const localDocs = this.$store.state.candidates.equalityAndDiversitySurvey;
      return localDocs || {};
    },
    responses() {
      const responsesList = this.$store.state.qualifyingTestResponses.records;
      return responsesList;
    },
    qualifyingTest() {
      const record = this.$store.state.qualifyingTest.record;
      return record;
    },
    qualifyingTestId() {
      return this.$route.params.qualifyingTestId;
    },
    searchStatus() {
      return this.$route.query.status || 'all';
    },
    isTieBreaker() {
      return this.qualifyingTest.isTieBreaker;
    },
    routeNamePrefix() {
      return this.isTieBreaker ? 'equal-merit-tie-breaker' : 'qualifying-test';
    },
  },
  methods: {
    async gatherExportData() {

      // fetch data
      const response = await httpsCallable(functions, 'exportQualifyingTestResponses')({ qualifyingTestId: this.qualifyingTest.id });

      const reportData = [];

      // get headers
      reportData.push(response.data.headers.map(header => header));

      // get rows
      response.data.rows.forEach((row) => {
        reportData.push(Object.values(row).map(cell => cell));
      });

      return reportData;
    },
    async downloadResponses() {
      const xlsxData = await this.gatherExportData();

      downloadXLSX(
        xlsxData,
        {
          title: `${this.qualifyingTest.title} - ${this.typeInitials(this.qualifyingTest.type)} - ${filters.formatDate(this.qualifyingTest.endDate)} - responses`,
          sheetName: `${this.qualifyingTest.title} - ${this.typeInitials(this.qualifyingTest.type)} - ${filters.formatDate(this.qualifyingTest.endDate)} - responses`,
          fileName: `${this.qualifyingTest.title} - ${this.typeInitials(this.qualifyingTest.type)} - ${filters.formatDate(this.qualifyingTest.endDate)} - responses`,
        }
      );
    },
    isReasonableAdjustment(needAdjustment) {
      return needAdjustment;
    },
    formatTimeLimit(timeLimit) {
      // TODO
      // Function to format the time limit
      // If activated ...
      // If Started ...
      // If completed
      return `${timeLimit} min`;
    },
    getTableData(params) {
      return this.$store.dispatch(
        'qualifyingTestResponses/bind',
        {
          qualifyingTestId: this.qualifyingTestId,
          searchStatus: this.searchStatus,
          ...params,
        }
      );
    },
    goToQualifyingTest() {
      this.$router.push({ name: `${this.routeNamePrefix}-view`, params: { qualifyingTestId: this.qualifyingTestId } });
    },
    typeInitials(string) {
      let result;
      const strArray = string.split('-');
      if (strArray.length === 1) {
        result =  'SC';
      } else {
        result = `${strArray[0].charAt(0)}${strArray[strArray.length - 1].charAt(0)}`;
      }
      return result.toUpperCase();
    },
    timeTaken(response) {
      let diff = 0;
      if (response.statusLog.completed && response.statusLog.started) {
        diff = response.statusLog.completed - response.statusLog.started;
      }
      const newDate = new Date(diff);
      const hh = `0${newDate.getUTCHours()}`.slice(-2);
      const mm = `0${newDate.getUTCMinutes()}`.slice(-2);
      const ss = `0${newDate.getUTCSeconds()}`.slice(-2);
      const returnTimeTaken = `${hh}:${mm}:${ss}`;
      return returnTimeTaken;
    },
    async candidateSearch(searchTerm) {
      return await this.$store.dispatch('candidates/search', { searchTerm: searchTerm, exerciseId: this.exerciseId });
    },
  },
};
</script>
