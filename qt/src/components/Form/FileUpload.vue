<template>
  <div
    class="govuk-form-group"
    :class="{'govuk-form-group--error': hasError}"
  >
    <label
      :for="id"
      class="govuk-heading-m govuk-!-margin-bottom-2"
    >
      {{ label }}
    </label>
    <span
      v-if="hint"
      class="govuk-hint"
    >
      {{ hint }}
    </span>
    <FormFieldError
      :id="id"
      :error-message="errorMessage"
    />
    <p
      v-if="haveFile && !isReplacing && !file"
      class="govuk-body-m"
    >
      Your file has been received.
      <a
        href="javascript:void(0)"
        class="govuk-link"
        @click.prevent="replaceFile"
      >Replace</a>
    </p>
    <p v-else-if="isUploading">
      Uploading...
    </p>
    <input
      v-else
      :id="id"
      ref="file"
      type="file"
      class="govuk-file-upload"
      :class="{'govuk-input--error': hasError}"
      @change="fileSelected"
    >
  </div>
</template>

<script>
import { ref, getDownloadURL, uploadBytes } from '@firebase/storage';
import { storage } from '@/firebase';
import FormField from '@/components/Form/FormField.vue';
import FormFieldError from '@/components/Form/FormFieldError.vue';

export default {
  components: {
    FormFieldError,
  },
  extends: FormField,
  props: {
    path: {
      type: String,
      required: true,
      default: '',
    },
    modelValue: {
      default: '',
      type: String,
    },
    name: {
      type: String,
      required: true,
      default: '',
    },
    messages: {
      type: Object,
      default: () => {
        return {
          required: 'Please choose a file to upload',
        };
      },
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      file: '',
      isReplacing: false,
      isUploading: false,
      acceptableExtensions: ['docx', 'doc', 'odt', 'txt', 'fodt'],
    };
  },
  computed: {
    haveFile() {
      return this.modelValue ? true : false;
    },
    fileName: {
      get() {
        return this.modelValue;
      },
      set(val) {
        if (val) {
          this.$emit('update:modelValue', val);
        }
      },
    },
  },
  async mounted () {
    if (typeof this.fileName === 'string' && this.fileName.length) {
      const isUploaded = await this.verifyFile(this.fileName);

      if (!isUploaded) {
        this.fileName = '';
        this.resetFile();
      }
    }
  },
  methods: {
    replaceFile() {
      this.isReplacing = true;
    },
    fileSelected() {
      const file = this.$refs.file.files[0];
      this.setError('');
      return this.upload(file);
    },
    generateFileName(originalName) {
      const parts = originalName.split('.');
      if ( parts.length === 1 || ( parts[0] === '' && parts.length === 2 )) {
        return this.name;
      }

      return [this.name, parts.pop()].join('.');
    },
    validFileExtension(originalName){
      const parts = originalName.split('.');

      if (parts.length < 2){
        return false;
      }

      if (this.acceptableExtensions.includes(parts.pop())){
        return true;
      }

      return false;
    },
    validFileSize(size){
      const megabyteSize = size / 1024 / 1024; // in MB
      return megabyteSize > 2 ? false : true;
    },
    resetFile() {
      this.$refs.file = null;
      this.isUploading = false;
    },
    async upload(file) {
      // @todo return more useful error messages
      if (!file) {
        this.setError('File upload failed, please try again');
        return false;
      }
      if (!this.validFileExtension(file.name)) {
        this.setError(`Invalid file type. Choose from: ${this.acceptableExtensions}`);
        return false;
      }
      if (!this.validFileSize(file.size)){
        this.setError('File is too large. Limit: 2MB');
        return false;
      }

      this.isUploading = true;
      const fileName = this.generateFileName(file.name);
      const uploadRef = ref(storage, `${this.path}/${fileName}`);

      try {
        const fileUploaded = await uploadBytes(uploadRef, file);
        if (fileUploaded && fileUploaded.state === 'success') {
          this.isReplacing = false;
          this.fileName = fileName;

          return true;
        } else {
          this.setError('File upload failed, please try again');

          return false;
        }
      } catch (e) {
        this.setError('File upload failed, please try again');

        return false;
      } finally {
        this.resetFile();
      }
    },
    async verifyFile(fileName) {
      if (!fileName) {
        return false;
      }
      const fileRef = ref(storage, `${this.path}/${fileName}`);

      // Check if file exists in storage
      try {
        const downloadUrl = await getDownloadURL(fileRef);

        if (typeof downloadUrl === 'string' && downloadUrl.length) {
          return true;
        }
        return false;
      } catch (e) {
        return false;
      }
    },
  },
};
</script>
