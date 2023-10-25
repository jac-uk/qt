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

    <Table
      data-key="id"
      :data="tableData"
      :page-size="50"
      :columns="tableColumns"
      @change="getTableData"
    >
      <template #row="{row}">
        <TableCell :title="tableColumns[0].title">
          <RouterLink :to="{ name: 'qualifying-tests', params: { folderId: row.id } }">
            {{ row.name }}
          </RouterLink>
        </TableCell>
        <TableCell :title="tableColumns[1].title">
          {{ $filters.formatDate(row.created) }}
        </TableCell>
        <TableCell class="text-right">
          <button
            type="button"
            class="govuk-button govuk-button--secondary govuk-!-margin-bottom-0"
            @click="btnEditFolder(row)"
          >
            Edit
          </button>
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
    <Modal ref="editFolderModal">
      <TitleBar>
        Edit folder
      </TitleBar>
      <FoldersForm
        :id="selectedFolder.id"
        class="govuk-!-margin-6"
        :data="selectedFolder"
        @save="editFolder"
        @cancel="$refs['editFolderModal'].closeModal()"
        @delete="deleteFolder"
      />
    </Modal>
  </div>
</template>

<script>
import Table from '@jac-uk/jac-kit/components/Table/Table.vue';
import TableCell from '@jac-uk/jac-kit/components/Table/TableCell.vue';
import Modal from '@jac-uk/jac-kit/components/Modal/Modal.vue';
import TitleBar from '@/components/Page/TitleBar.vue';
import FoldersForm from './components/AddEdit.vue';

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
        { title: '' },
      ],
      selectedFolder: {},
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
    btnEditFolder(folder) {
      this.selectedFolder = folder;
      this.$refs['editFolderModal'].openModal();
    },
    async createFolder(data) {
      await this.$store.dispatch('folder/create', data );
      this.$refs['createFolderModal'].closeModal();
    },
    async editFolder(data) {
      await this.$store.dispatch('folder/update', { id: this.selectedFolder.id, data: data });
      this.$refs['editFolderModal'].closeModal();
    },
    async deleteFolder() {
      await this.$store.dispatch('folder/delete', this.selectedFolder.id );
      this.$refs['editFolderModal'].closeModal();
    },
  },
};
</script>
