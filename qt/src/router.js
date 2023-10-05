import {
  createWebHistory,
  createRouter
} from 'vue-router';

import store from '@/store';

import Default from '@/views/Default';
import SignIn from '@/views/SignIn';
import SignedOut from '@/views/SignedOut';
import BrowserTest from '@/views/BrowserTest';

// Online Tests
import QualifyingTests from '@/views/QualifyingTests/QualifyingTests';
import QualifyingTest from '@/views/QualifyingTests/QualifyingTest';
import QualifyingTestInformation from '@/views/QualifyingTests/QualifyingTest/Information';
import QualifyingTestQuestion from '@/views/QualifyingTests/QualifyingTest/Question';
import QualifyingTestScenario from '@/views/QualifyingTests/QualifyingTest/Scenario';
import QualifyingTestReview from '@/views/QualifyingTests/QualifyingTest/Review';
import QualifyingTestSubmitted from '@/views/QualifyingTests/QualifyingTest/Submitted';

// Error pages
import NotFound from '@/views/NotFound.vue';

const routes = [
  {
    path: '/browser-test',
    name: 'browser-test',
    component: BrowserTest,
    meta: {
      requiresAuth: false,
      title: 'Browser Test',
    },
  },
  {
    path: '/',
    name: 'default',
    component: Default,
    meta: {
      requiresAuth: false,
      title: 'Online Tests',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound,
    meta: {
      requiresAuth: false,
      title: 'Error',
    },
  },
  {
    path: '/online-tests',
    component: QualifyingTests,
    name: 'online-tests',
    meta: {
      requiresAuth: true,
      title: 'Online Tests | List',
    },
  },
  {
    path: '/online-tests/:qualifyingTestId/',
    component: QualifyingTest,
    children: [
      {
        path: '',
        redirect: 'information',
      },
      {
        path: 'information',
        component: QualifyingTestInformation,
        name: 'online-test-information',
        meta: {
          requiresAuth: true,
          title: 'Online Test | Information',
        },
      },
      {
        path: 'question/:questionNumber',
        component: QualifyingTestQuestion,
        name: 'online-test-question',
        meta: {
          requiresAuth: true,
          title: 'Online Test | Question',
          fullPageMode: true,
        },
      },
      {
        path: 'scenario/:scenarioNumber/:questionNumber',
        component: QualifyingTestScenario,
        name: 'online-test-scenario',
        meta: {
          requiresAuth: true,
          title: 'Online Test | Scenario',
          fullPageMode: true,
        },
      },
      {
        path: 'review',
        component: QualifyingTestReview,
        name: 'online-test-review',
        meta: {
          requiresAuth: true,
          title: 'Online Test | Review',
          fullPageMode: true,
        },
      },
      {
        path: 'submitted',
        component: QualifyingTestSubmitted,
        name: 'online-test-submitted',
        meta: {
          requiresAuth: true,
          title: 'Online Test | Submitted',
        },
      },
    ],
  },
  {
    path: '/signed-out',
    name: 'signed-out',
    component: SignedOut,
    meta: {
      requiresAuth: false,
      title: 'Signed Out',
    },
  },
  {
    path: '/:qualifyingTestId',
    name: 'sign-in',
    component: SignIn,
    meta: {
      requiresAuth: false,
      title: 'Sign In',
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { x: 0, y: 0 };
    }
  },
});

// Global before guard to verify if a user can have access to other than sign-in pages.
// It redirects unauthorized users to a sign-in page.
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(x => x.meta.requiresAuth);
  const isSignedIn = store.getters['auth/isSignedIn'];
  if (requiresAuth && !isSignedIn) {
    if (to.params.qualifyingTestId) {
      return next({ name: 'sign-in', params: to.params });
    } else {
      return next({ name: 'default' });
    }
  }
  if (!requiresAuth && isSignedIn) {
    return next({ name: 'online-tests' });
  }
  return next();
});

// Global after hook to set an appropriate title for the page
router.afterEach((to) => {
  document.title = `${to.meta.title} | Judicial Appointments Commission`;
});

export default router;
