<template>
  <EditableField
    type="textarea"
    :value="message"
    field="message"
    :edit-mode="true"
    @changeField="setMessage"
  />
</template>
<script>
import EditableField from '@jac-uk/jac-kit/draftComponents/EditableField';
export default {
  name: 'EditableMessage',
  components: {
    EditableField,
  },
  props: {
    getter: {
      type: String,
      required: true,
    },
    dispatcher: {
      type: String,
      required: true,
    },
    recordId: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      default: '',
    },
  },
  methods: {
    async setMessage(obj) {
      let storeObj;
      const data = this.$store.getters[this.getter]();
      if ('message' in data) {
        storeObj = { ...data };
        storeObj.message = obj.message;
      }
      else {
        storeObj = { ...obj, ...data };
      }
      // @TODO: this is a temp fix until we have a store module dedicated to a single QTR
      if (this.recordId) {
        await this.$store.dispatch(this.dispatcher, {
          id: this.recordId,
          data: storeObj,
        });
      }
      else {
        await this.$store.dispatch(this.dispatcher, storeObj);
      }
    },
  },
};
</script>
