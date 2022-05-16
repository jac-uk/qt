<template>
  <div>
    <div class="govuk-grid-row print-none">
      <div class="govuk-grid-column-full">
        <div class="text-right">
          <button
            class="govuk-button govuk-!-margin-right-1 govuk-!-margin-bottom-0"
            @click="$refs['createFolderModal'].openModal()"
          >
            Add a folder
          </button>
        </div>
      </div>
    </div>

    <h1
      class="govuk-heading-xl govuk-!-margin-bottom-6"
    >
      Qualifying Tests
    </h1>

    <Table
      data-key="id"
      :data="tableData"
      :page-size="50"
      :columns="tableColumns"
      @change="getTableData"
    >
      <template #row="{row}">
        <TableCell :title="tableColumns[0].title">
          <RouterLink
            :to="{ name: 'folders-view', params: { id: row.id } }"
          >
            {{ row.name }}
          </RouterLink>
        </TableCell>
        <TableCell :title="tableColumns[1].title">
          {{ row.created }}
        </TableCell>
      </template>
    </Table>

    <Modal ref="createFolderModal">
      <TitleBar>
        Create folder
      </TitleBar>
      <FoldersForm
        class="govuk-!-margin-6"
        @save="createFolder"
        @cancel="$refs['createFolderModal'].closeModal()"
      />
    </Modal>
  </div>
</template>

<script>
import Table from '@jac-uk/jac-kit/components/Table/Table';
import TableCell from '@jac-uk/jac-kit/components/Table/TableCell';
import Modal from '@jac-uk/jac-kit/components/Modal/Modal';
import TitleBar from '@/components/Page/TitleBar';
import FoldersForm from './components/AddEdit';

export default {
  components: {
    Table,
    TableCell,
    Modal,
    TitleBar,
    FoldersForm,
  },
  data() {
    return {
      tableColumns: [
        { title: 'Name', sort: 'name', default: true },
        { title: 'Created', sort: 'created' },
      ],
    };
  },
  computed: {
    tableData() {
      return this.$store.state.folders.records;
    },
  },
  methods: {
    getTableData(params) {
      this.$store.dispatch('folders/bind', params);
    },
    async createFolder(data) {
      await this.$store.dispatch('folder/create', data );
      this.$refs['createFolderModal'].closeModal();
    },
  },
};
</script>
