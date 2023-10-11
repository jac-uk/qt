import Scenario from '@/views/QualifyingTests/QualifyingTest/Scenario.vue';
import { mount } from '@vue/test-utils';

describe.skip('views/QualifyingTests/QualifyingTest/Scenario', () => {
  let wrapper;
  beforeEach(()=>{
    wrapper = mount(Scenario, {
      shallow: true,
      global: {
        stubs: ['RouterView'],
      },
    });

  });
  it('renders the component', () => {
    //expect(wrapper.exists()).toBe(true);
    expect(wrapper.hasClass('jac-scenario')).toBe(true);
  });
});

