<template>
  <div>
    <TextField
      id="situational-judgement-question-input"
      v-model="text"
      ident="situational-judgement-question-input"
      label="Question Text"
    />
  </div>
</template>

<script>
import TextField from '@jac-uk/jac-kit/draftComponents/Form/TextField.vue';

export default {
  components: {
    TextField,
  },
  props: {
    value: {
      type: String,
      default: '',
    },
  },
  emits: ['input'],
  computed: {
    text: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      },
    },
  },
};
</script>
