<template>
  <div>
    <TextField
      :id="`answer_${id}_${index}`"
      v-model="row.answer"
      :label="`${label} ${1 + index}`"
    />
    <slot name="removeButton" />
  </div>
</template>

<script>
import TextField from '@jac-uk/jac-kit/draftComponents/Form/TextField.vue';

export default {
  name: 'Answer',
  components: {
    TextField,
  },
  props: {
    row: {
      required: true,
      type: Object,
    },
    index: {
      required: true,
      type: Number,
    },
    id: {
      required: false,
      type: String,
      default: '',
    },
    label: {
      required: false,
      type: String,
      default: 'Answer option',
    },
  },
};
</script>
