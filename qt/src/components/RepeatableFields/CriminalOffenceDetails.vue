<template>
  <div>
    <TextField
      :id="`offence_title_${name}_${index}`"
      v-model="row.title"
      :label="label"
      required
    />
    <DateInput
      :id="`offence_date_${name}_${index}`"
      v-model="row.date"
      label="Date of offence"
      required
    />
    <TextareaInput
      :id="`offence_details_${name}_${index}`"
      v-model="row.details"
      label="Details"
      :hint="hint"
      rows="5"
      required
    />
    <slot name="removeButton" />
  </div>
</template>

<script>
import DateInput from '@/components/Form/DateInput.vue';
import TextField from '@/components/Form/TextField.vue';
import TextareaInput from '@/components/Form/TextareaInput.vue';

export default {
  name: 'CriminalOffenceDetails',
  components: {
    DateInput,
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
    label: {
      required: false,
      type: String,
      default: '',
    },
    hint: {
      required: false,
      type: String,
      default: '',
    },
    name: {
      required: false,
      type: String,
      default: 'criminal-offences',
    },
  },
};
</script>
