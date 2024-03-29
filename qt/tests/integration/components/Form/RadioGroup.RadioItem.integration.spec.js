import { shallowMount } from '@vue/test-utils';
import RadioGroup from '@/components/Form/RadioGroup.vue';
import RadioItem from '@/components/Form/RadioItem.vue';

const createTestSubject = () => {
  const radioItems = ['one', 'two'].map(number => {
    return `<RadioItem label="Option ${number}" value="${number}" hint="Hint ${number}" />`;
  });

  // RadioItem depends on the parent component being RadioGroup
  // So we're mocking RadioGroup with a RadioItem inside, and will return the RadioItem
  return shallowMount(RadioGroup, {
    propsData: {
      label: 'Example question',
      id: 'example',
      value: 'one',
    },
    stubs: {
      RadioItem,
    },
    slots: {
      default: radioItems,
    },
  });
};

/**
 * These tests are skipped as they are currently broken after the vue3 upgrade
 */
describe.skip('components/Form/RadioGroup and components/Form/RadioItem integration', () => {
  let subject;
  let radios;
  beforeEach(() => {
    subject = createTestSubject();
    radios = subject.findAll('input[type=radio]');
  });

  describe('binding to `inputValue`', () => {
    describe('when `inputValue` changes', () => {
      it('the selected radio input changes to match', () => {
        const [optionOne, optionTwo] = radios.wrappers.map(wrapper => wrapper.element);

        subject.setProps({ value: 'one' });
        expect(optionOne.checked).toBe(true);
        expect(optionTwo.checked).toBe(false);

        subject.setProps({ value: 'two' });
        expect(optionOne.checked).toBe(false);
        expect(optionTwo.checked).toBe(true);

        subject.setProps({ value: 'any-other-value' });
        expect(optionOne.checked).toBe(false);
        expect(optionTwo.checked).toBe(false);
      });
    });

    describe('when a radio input is checked', () => {
      it('it emits an `input` event with the value of the checked radio', () => {
        const [optionOne, optionTwo] = radios.wrappers;

        const lastEmittedInputValue = () => {
          const emitted = subject.emitted('input');
          return emitted[emitted.length - 1][0];
        };

        optionOne.setChecked();
        expect(lastEmittedInputValue()).toEqual('one');

        optionTwo.setChecked();
        expect(lastEmittedInputValue()).toEqual('two');
      });
    });
  });

  describe('RadioItem element IDs', () => {
    it('radio input IDs are unique', () => {
      const [radioOne, radioTwo] = radios.wrappers;
      expect(radioOne.attributes('id')).not.toEqual(radioTwo.attributes('id'));
    });

    it('hint element IDs are unique', () => {
      const [hintOne, hintTwo] = subject.findAll('.govuk-radios__hint').wrappers;
      expect(hintOne.attributes('id')).not.toEqual(hintTwo.attributes('id'));
    });
  });

  describe('radio inputs `name` attribute', () => {
    let nameOne, nameTwo;
    beforeEach(() => {
      [nameOne, nameTwo] = radios.wrappers.map(radio => radio.attributes('name'));
    });

    it('matches the parent RadioGroup `id`', () => {
      const radiosId = subject.attributes('id');
      expect(nameOne).toEqual(radiosId);
      expect(nameTwo).toEqual(radiosId);
    });

    it('all RadioItems have the same `name` attribute', () => {
      expect(nameOne).toEqual(nameTwo);
    });
  });
});
