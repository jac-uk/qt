<template>
  <div id="firebaseui-auth-container" />
</template>

<script>
import { auth } from '@/firebase';
import { EmailAuthProvider } from '@firebase/auth';
import * as firebaseui from 'firebaseui';

export default {
  name: 'FirebaseUI',
  emits: ['signInSuccess'],
  data() {
    return {
      uiConfig: {
        signInOptions: [
          {
            provider: EmailAuthProvider.PROVIDER_ID,
            signInMethod: EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD,
          },
        ],
        credentialHelper: firebaseui.auth.CredentialHelper.NONE,
        callbacks: {
          signInSuccessWithAuthResult: this.signInSuccess,
        },
      },
    };
  },
  mounted() {
    this.ui = new firebaseui.auth.AuthUI(auth);
    this.ui.start('#firebaseui-auth-container', this.uiConfig);
  },
  unmounted() {
    this.ui.delete();
  },
  methods: {
    signInSuccess(authResult) {
      this.$emit('signInSuccess', authResult);
      // Return false to disable FirebaseUI auth redirect
      return false;
    },
  },
};
</script>

<style src="firebaseui/dist/firebaseui.css"></style>
