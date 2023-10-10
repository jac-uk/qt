<template>
  <Form
    :id="id"
    @save="save"
    @cancel="cancel"
    @delete="remove"
  >
    <TextField
      id="name"
      v-model="formData.name"
      label="Name"
      required
    />
  </Form>
</template>

<script>
import Form from '@/components/Page/Form.vue';
import TextField from '@jac-uk/jac-kit/draftComponents/Form/TextField.vue';

export default {
  name: 'AddEditFolder',
  components: {
    Form,
    TextField,
  },
  extends: Form,
  methods: {
    load(data) {
      return {
        name: data ? data.name : '',
      };
    },
  },
};
</script>
