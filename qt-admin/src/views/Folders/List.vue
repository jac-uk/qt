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
          <button
            class="govuk-button govuk-!-margin-right-1 govuk-!-margin-bottom-0"
            @click="createQT"
          >
            Create Online Test
          </button>
        </div>
      </div>
    </div>

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
            :to="{ name: 'qualifying-tests', params: { folderId: row.id } }"
          >
            {{ row.name }}
          </RouterLink>
        </TableCell>
        <TableCell :title="tableColumns[1].title">
          {{ row.created | formatDate }}
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
import { functions } from '@/firebase';
import { QUALIFYING_TEST } from '@jac-uk/jac-kit/helpers/constants';

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
        { title: 'Folder', sort: 'name', default: true },
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
    async createQT() {
      await functions.httpsCallable('adminCallAPI')({
        folder: 'JAC0006',
        test: {
          type: QUALIFYING_TEST.TYPE.CRITICAL_ANALYSIS,
          title: 'CA for JAC0006',
          startDate: '2022-05-17T09:00:00',
          endDate: '2022-05-18T21:00:00',
        },
      });
    },
  },
};
</script>
