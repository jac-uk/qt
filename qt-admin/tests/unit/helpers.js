import { shallowMount, createLocalVue } from '@vue/test-utils';
import * as filters from '@jac-uk/jac-kit/filters/filters';

const mocks = {
  route: {
    name: 'name-of-current-route',
    params: {
      id: 'abc123',
      applicationId: 'application1',
    },
  },
  router: {
    push: jest.fn(),
    replace: jest.fn(),
  },
  store: {
    dispatch: jest.fn(),
    state: {
      auth: {
        currentUser: {
          role: 'superadmin',
        },
      },
      vacancy: {
        record: {
          typeOfExercise: null,
          referenceNumber: null,
          isCourtOrTribunal: null,
          appointmentType: null,
          welshRequirement: null,
        },
      },
      candidate: {
        record: {
        },
      },
      application: {
        record: { 
          progress: { started: true },
        },
      },
      applications: {
        records: [],
      },
      qualifyingTest: {
        record: {
          title: null,
        },
      },
      qualifyingTestResponses: {
        record: {
        },
      },
      exerciseDocument: {
        record: {},
      },
    },
    getters: {
      'vacancy/getCloseDate': new Date(),
      'vacancy/id': jest.fn(),
      'application/data': jest.fn(),
      'vacancies/bind': jest.fn(), //see views/vacancies.spec.js
      'qualifyingTest/data': jest.fn(),
    },
  },
};

const localVue = createLocalVue();

// Register global filters
Object.keys(filters)
  .forEach((filterName) => {
    localVue.filter(filterName, filters[filterName]);
  });

const createTestSubject = (component, customMountOptions = {
  mocks: {},
  stubs: [],
  propsData: {},
}) => {
  return shallowMount(component, {
    localVue,
    mocks: {
      $route: mocks.route,
      $router: mocks.router,
      $store: mocks.store,
      ...customMountOptions.mocks,
    },
    stubs: [...customMountOptions.stubs],
    propsData: { ...customMountOptions.propsData },
  });
};

export {
  mocks,
  createTestSubject
};
