import QualifyingTests from '@/views/QualifyingTests/QualifyingTests.vue';
import { createTestSubject } from '../../helpers';

const dateInTest = new Date('Jan 01 2020 09:45:00 GMT+0000');

const started = {
  date: new Date('Jan 01 2020 09:30:00 GMT+0000'),
  status: 'started',
};

const completed = {
  date: new Date('Jan 01 2020 10:00:00 GMT+0000'),
  status: 'completed',
};

const reset = {
  date: new Date('Jan 01 2020 10:30:00 GMT+0000'),
  status: 'reset',
};

const activated = {
  date: new Date('Jan 01 2020 09:00:00 GMT+0000'),
  status: 'activated',
};

const created = {
  date: new Date('Dec 31 2019 00:00:00 GMT+0000'),
  status: 'created',
};

const mockQT = () => {
  return {
    status: 'activated',
    statusLog: {
      created: created.date,
      activated: activated.date,
    },
    qualifyingTest: {
      startDate: new Date('Jan 01 2020 09:00:00 GMT+0000'),
      endDate: new Date('Jan 01 2020 21:00:00 GMT+0000'),
    },
    duration: {
      testDurationAdjusted: 40,
      testDuration: 40,
      reasonableAdjustment: 0,
    },
  };
};

const RealDate = Date.now;

describe('views/QualifyingTests/QualifyingTests', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createTestSubject(QualifyingTests, {
      stubs: ['RouterLink'],
    });
    wrapper.vm.$store.state.qualifyingTestResponses.records = [
      mockQT(),
    ];
  });

  it('renders the component', () => {
    expect(wrapper.exists()).toBe(true);
  });

  describe('tabs', () => {
    describe('Open tab', () => {

      beforeAll(() => {
        global.Date.now = jest.fn(() => dateInTest);
      });

      afterAll(() => {
        global.Date.now = RealDate;
      });

      describe('lists tests', () => {

        it('lists open tests', () => {
          expect(wrapper.vm.openTests.length).toBe(1);
        });

      });

      describe('opening a test', () => {
        beforeEach(()=>{
          wrapper.vm.$store.state.qualifyingTestResponses.records[0].statusLog.started = started.date;
          wrapper.vm.$store.state.qualifyingTestResponses.records[0].status = started.status;
        });
        afterEach(() => {
          wrapper.vm.$store.state.qualifyingTestResponses.records = [
            mockQT(),
          ];
        });
        it('lists open tests', () => {
          expect(wrapper.vm.openTests.length).toBe(1);
        });
        it('status started', () => {
          expect(wrapper.vm.status(wrapper.vm.$store.state.qualifyingTestResponses.records[0])).toBe(started.status);
        });
      });

      describe('test reset, not restarted', () => {
        beforeEach(()=>{
          wrapper.vm.$store.state.qualifyingTestResponses.records[0].statusLog = {
            ...wrapper.vm.$store.state.qualifyingTestResponses.records[0].statusLog,
            completed: completed.date,
            reset: reset.date,
          };
          wrapper.vm.$store.state.qualifyingTestResponses.records[0].status = 'activated';
        });
        afterEach(() => {
          wrapper.vm.$store.state.qualifyingTestResponses.records = [
            mockQT(),
          ];
        });
        it('lists open tests', () => {
          expect(wrapper.vm.openTests.length).toBe(1);
        });
        it('status started', () => {
          expect(wrapper.vm.status(wrapper.vm.$store.state.qualifyingTestResponses.records[0])).toBe('not-started');
        });
      });

      describe('test reset, restarted', () => {
        beforeEach(()=>{
          wrapper.vm.$store.state.qualifyingTestResponses.records[0].statusLog = {
            created: new Date('Jan 01 2020 00:00:00 GMT+0000'),
            activated: new Date('Jan 01 2020 09:00:00 GMT+0000'),
            started: new Date('Jan 01 2020 09:30:00 GMT+0000'),
            completed: new Date('Jan 01 2020 10:00:00 GMT+0000'),
            reset: new Date('Jan 01 2020 10:30:00 GMT+0000'),
          };
          wrapper.vm.$store.state.qualifyingTestResponses.records[0].status = 'started';
        });
        afterEach(() => {
          wrapper.vm.$store.state.qualifyingTestResponses.records = [
            mockQT(),
          ];
        });
        it('lists open tests', () => {
          expect(wrapper.vm.openTests.length).toBe(1);
        });
        it('status started', () => {
          expect(wrapper.vm.status(wrapper.vm.$store.state.qualifyingTestResponses.records[0])).toBe('started');
        });
      });
    });

  });

});
