import {
  createWebHistory,
  createRouter
} from 'vue-router';

import store from '@/store';

import SignIn from '@/views/SignIn';

import Folders from '@/views/Folders/List';
import Folder from '@/views/Folders/View';

import QualifyingTests from '@/views/QualifyingTests/List';
import QualifyingTest from '@/views/QualifyingTests/QualifyingTest';
import QualifyingTestNew from '@/views/QualifyingTests/New';
import QualifyingTestNewFromClipboard from '@/views/QualifyingTests/NewFromClipboard';
import QualifyingTestEdit from '@/views/QualifyingTests/QualifyingTest/Edit';
import QualifyingTestView from '@/views/QualifyingTests/QualifyingTest/View';
import QualifyingTestQuestionBuilder from '@/views/QualifyingTests/QualifyingTest/TestBuilder';
import QualifyingTestDryRun from '@/views/QualifyingTests/QualifyingTest/DryRun';
import QualifyingTestReview from '@/views/QualifyingTests/QualifyingTest/Review';
import QualifyingTestResponses from '@/views/QualifyingTests/QualifyingTest/Responses';
import QualifyingTestResponse from '@/views/QualifyingTests/QualifyingTest/Response';
import QualifyingTestResponseView from '@/views/QualifyingTests/QualifyingTest/Response/View';

// Error pages
import PageNotFound from '@/views/Errors/PageNotFound';

const routes = [
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'folders' },
  },
  {
    path: '/folders',
    component: Folders,
    name: 'folders',
    meta: {
      requiresAuth: true,
      title: 'Folders',
    },
  },
  {
    path: '/folder/:folderId/',
    component: Folder,
    children: [
      {
        path: 'qualifying-tests',
        component: QualifyingTests,
        props: {
          tieBreakers: false,
        },
        name: 'qualifying-tests',
        meta: {
          requiresAuth: true,
          title: 'Qualifying Tests',
        },
      },
      {
        path: 'qualifying-tests/new',
        component: QualifyingTestNew,
        props: {
          isTieBreaker: false,
        },
        name: 'qualifying-test-new',
        meta: {
          requiresAuth: true,
          title: 'Create Qualifying Test',
        },
      },
      {
        path: 'qualifying-tests/new-from-clipboard',
        component: QualifyingTestNewFromClipboard,
        name: 'qualifying-test-new-from-clipboard',
        meta: {
          requiresAuth: true,
          title: 'Create Qualifying Test from Clipboard',
        },
      },
      {
        path: 'qualifying-tests/:qualifyingTestId/',
        component: QualifyingTest,
        children: [
          {
            path: '',
            component: QualifyingTestView,
            name: 'qualifying-test-view',
            meta: {
              requiresAuth: true,
              title: 'Qualifying Test',
            },
          },
          {
            path: 'edit',
            component: QualifyingTestEdit,
            name: 'qualifying-test-edit',
            meta: {
              requiresAuth: true,
              title: 'Edit Qualifying Test',
            },
          },
          {
            path: 'build',
            component: QualifyingTestQuestionBuilder,
            name: 'qualifying-test-question-builder',
            meta: {
              requiresAuth: true,
              title: 'Edit Questions | Qualifying Test',
            },
          },
          {
            path: 'dry-run',
            component: QualifyingTestDryRun,
            name: 'qualifying-test-dry-run',
            meta: {
              requiresAuth: true,
              title: 'Dry Run | Qualifying Test',
            },
          },
          {
            path: 'review',
            component: QualifyingTestReview,
            name: 'qualifying-test-review',
            meta: {
              requiresAuth: true,
              title: 'Review | Qualifying Test',
            },
          },
          {
            path: 'responses/:status',
            component: QualifyingTestResponses,
            name: 'qualifying-test-responses',
            meta: {
              requiresAuth: true,
              title: 'Responses | Qualifying Test',
            },
          },
          {
            path: 'response/:responseId/',
            component: QualifyingTestResponse,
            children: [
              {
                path: '',
                component: QualifyingTestResponseView,
                name: 'qualifying-test-response-view',
                meta: {
                  requiresAuth: true,
                  title: 'Response | Qualifying Test',
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '/errors/page-not-found',
    name: 'page-not-found',
    component: PageNotFound,
    meta: {
      requiresAuth: true,
      title: 'Page Not Found',
    },
  },
  {
    path: '/sign-in',
    name: 'sign-in',
    component: SignIn,
    meta: {
      requiresAuth: false,
      title: 'Sign In',
    },
    beforeEnter: (to, from, next) => {
      const isSignedIn = store.getters['auth/isSignedIn'];
      if (isSignedIn) {
        return next({ name: 'folders' });
      }
      return next();
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
    return next({ name: 'sign-in' });
  }
  return next();
});

// Global after hook to set an appropriate title for the page
router.afterEach((to) => {
  document.title = `${to.meta.title} | JAC Digital Platform`;
});

export default router;
