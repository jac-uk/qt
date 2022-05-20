<script>
import { auth } from '@/firebase';

export default {
  render() {
    return '';
  },
  created() {
    console.log('created', auth);
    if (auth.isSignInWithEmailLink(window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        email = window.prompt('Please provide your email for confirmation');
      }
      auth.signInWithEmailLink(email, window.location.href)
        .then((result) => {
          window.localStorage.removeItem('emailForSignIn');
          console.log('successfully signed in', result.user);
          // this.$router.push({ name: 'online-tests' });
        })
        .catch((error) => {
          console.log('there was an error', error);
        });
    }
  },
};
</script>
