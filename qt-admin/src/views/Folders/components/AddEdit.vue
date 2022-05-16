<template>
  <Form
    :id="id"
    @save="save"
    @cancel="cancel"
    @delete="remove"
  >
    <TextField
      id="full-name"
      v-model="formData.name"
      label="Name"
      required
    />
  </Form>
</template>

<script>
import Form from '@/components/Page/Form';
import TextField from '@jac-uk/jac-kit/draftComponents/Form/TextField';

export default {
  name: 'SelectPanel',
  components: {
    Form,
    TextField,
  },
  extends: Form,
  methods: {
    load(data) {
      return {
        fullName: data ? data.name : '',
      };
    },
  },
};
</script>
