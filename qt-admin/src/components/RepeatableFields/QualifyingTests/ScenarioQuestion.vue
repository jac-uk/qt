<template>
  <div>
    <TextField
      :id="`scenarioquestion_${id}_${index}`"
      v-model="row.question"
      :label="`${label} ${1 + index}`"
    />
    <TextareaInput
      :id="`scenarioquestion_hint_${id}_${index}`"
      v-model="row.hint"
      :label="`${label} ${1 + index} - hint`"
      rows="2"
    />
    <TextField
      :id="`scenarioquestion_word_limit_${id}_${index}`"
      v-model="row.wordLimit"
      type="number"
      :label="`${label} ${1 + index} - word limit`"
    />
    <TextField
      :id="`scenarioquestion_marks_${id}_${index}`"
      v-model="row.marks"
      type="number"
      :label="`${label} ${1 + index} - marks`"
    />
    <slot name="removeButton" />
  </div>
</template>

<script>
import TextField from '@jac-uk/jac-kit/draftComponents/Form/TextField.vue';
import TextareaInput from '@jac-uk/jac-kit/draftComponents/Form/TextareaInput.vue';

export default {
  name: 'ScenarioQuestion',
  components: {
    TextField,
    TextareaInput,
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
