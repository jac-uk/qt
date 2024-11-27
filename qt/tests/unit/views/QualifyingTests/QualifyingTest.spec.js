import { shallowMount } from '@vue/test-utils';
// import { shallowMount, createLocalVue } from '@vue/test-utils';
// import VueRouter from 'vue-router';
import QualifyingTest from '@/views/QualifyingTests/QualifyingTest.vue';

// Mock Countdown component globally
// jest.mock('@/components/QualifyingTest/Countdown.vue', () => ({
//   name: 'Countdown',
//   render: () => null,
// }));

// const localVue = createLocalVue();
// localVue.use(VueRouter);

// const router = new VueRouter();
let router;

describe.skip('QualifyingTest.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(QualifyingTest, {
      // localVue,
      router,
    });
  });

  it('sets isComingFromReview when coming from review route', async () => {
    router.push({ name: 'online-test-review' });

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.isComingFromReview).toBe(true);
  });

  it('sets isComingFromReview to false for non-review routes', async () => {
    router.push({ name: 'another-route' });

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.isComingFromReview).toBe(false);
  });

  it('renders Countdown component (mocked)', () => {
    const countdownComponent = wrapper.findComponent({ name: 'Countdown' });
    expect(countdownComponent.exists()).toBe(true);
  });
});
