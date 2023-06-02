<template>
  <div>
    <div class="govuk-grid-row print-none">
      <div class="govuk-grid-column-one-half">
        <RouterLink
          class="govuk-back-link govuk-!-margin-top-0"
          :to="{ name: 'folders' }"
        >
          Back
        </RouterLink>
        <span class="govuk-caption-l">{{ folder.name }}</span>
        <h1 class="govuk-heading-l govuk-!-margin-bottom-0">
          Qualifying tests
        </h1>
      </div>
      <div class="govuk-grid-column-one-half text-right">
        <button
          class="govuk-button govuk-button--secondary govuk-!-margin-right-3"
          @click="btnCreateFromClipboard"
        >
          Create New from Clipboard
        </button>
        <button
          class="govuk-button govuk-!-margin-right-3"
          @click="btnCreate"
        >
          Create New
        </button>
      </div>
    </div>

    <Table
      data-key="id"
      :data="qualifyingTests"
      :page-size="50"
      :columns="tableColumns"
      @change="getTableData"
    >
      <template #row="{row}">
        <TableCell :title="tableColumns[0].title">
          <RouterLink
            class="govuk-link"
            :to="{ name: getViewName(row), params: { qualifyingTestId: row.id } }"
          >
            {{ $filters.showAlternative(row.title, row.id) }}
          </RouterLink>
          <span
            v-if="row.mode"
            class="govuk-tag govuk-tag--grey govuk-!-margin-left-1"
          >{{ $filters.lookup(row.mode) }}</span>
          <br>
          <span class="govuk-body-s">{{ $filters.formatDate(row.startDate, 'longdatetime') }}</span>
        </TableCell>
        <TableCell :title="tableColumns[1].title">
          {{ $filters.lookup(row.type) }}
        </TableCell>
        <TableCell :title="tableColumns[2].title">
          {{ $filters.lookup(row.status) }}
        </TableCell>
      </template>
    </Table>
  </div>
</template>

<script>
import Table from '@jac-uk/jac-kit/components/Table/Table';
import TableCell from '@jac-uk/jac-kit/components/Table/TableCell';
import { QUALIFYING_TEST } from '@/helpers/constants';

export default {
  components: {
    Table,
    TableCell,
  },
  props: {
    tieBreakers: {
      required: true,
      type: Boolean,
    },
  },
  data() {
    return {
      tableColumns: [
        { title: 'Title', sort: 'title', default: true },
        { title: 'Type' },
        { title: 'Status' },
      ],
    };
  },
  computed: {
    folderId() {
      return this.$route.params.folderId;
    },
    folder() {
      return this.$store.state.folder.record;
    },
    qualifyingTests() {
      const qtList = this.$store.state.qualifyingTest.records;
      // For the Tie-breakers page we want to show tests where isTieBreaker == true
      // For the Qualifying Tests page we want to show tests where isTieBreaker == false
      // To support old records though, on the Qualifying Tests page we also need to show tests where the
      // isTieBreaker field is absent
      // Note: We filter on this here (instead of in the store function) because the firebase SDK does not
      // allow the where() function to query on the absense of a field
      return qtList.filter(row => {
        return this.tieBreakers == (row.isTieBreaker == true); // to cater for the isTieBreaker field being absent
      });
    },
    routeNamePrefix() {
      return this.tieBreakers ? 'equal-merit-tie-breaker' : 'qualifying-test';
    },
  },
  methods: {
    btnCreate() {
      this.$router.push({ name: `${this.routeNamePrefix}-new` });
    },
    btnCreateFromClipboard() {
      this.$router.push({ name: 'qualifying-test-new-from-clipboard' });
    },
    getViewName(qualifyingTest) {
      if (
        qualifyingTest.status === QUALIFYING_TEST.STATUS.CREATED
        || qualifyingTest.status === QUALIFYING_TEST.STATUS.SUBMITTED
      ) {
        return `${this.routeNamePrefix}-review`;
      } else {
        return `${this.routeNamePrefix}-view`;
      }
    },
    getTableData(params) {
      this.$store.dispatch(
        'qualifyingTest/bindQTs',
        {
          folderId: this.folderId,
          ...params,
        }
      );
    },
  },
};
</script>

<style scoped>
  .separator {
    height: 100px;
  }
</style>
