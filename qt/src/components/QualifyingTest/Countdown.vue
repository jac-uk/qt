<template>
  <div
    v-if="showCountdown"
    class="countdown"
    :class="bckClass"
  >
    <div class="govuk-!-padding-2 govuk-grid-row govuk-width-container">
      <div class="text-left govuk-grid-column-one-third">
        <div
          class="header-background clearfix"
          style="display: flex;"
        >
          <slot
            name="left-slot"
          />
        </div>
      </div>
      <div class="text-center govuk-grid-column-one-third">
        <span
          id="time-remaining"
        >
          <span
            v-if="hours"
          >
            {{ zeroPad(hours) }}:
          </span>
          <span
            style="margin-right: 5px;"
          >
            {{ zeroPad(minutes) }}:{{ zeroPad(seconds) }}
          </span>
          <svg
            v-if="bckClass"
            class="moj-banner__icon"
            focusable="false"
            xmlns="http://www.w3.org/2000/svg"
            height="25"
            width="25"
          >
            <path
              d="M13.7,18.5h-2.4v-2.4h2.4V18.5z M12.5,13.7c-0.7,0-1.2-0.5-1.2-1.2V7.7c0-0.7,0.5-1.2,1.2-1.2s1.2,0.5,1.2,1.2v4.8 C13.7,13.2,13.2,13.7,12.5,13.7z M12.5,0.5c-6.6,0-12,5.4-12,12s5.4,12,12,12s12-5.4,12-12S19.1,0.5,12.5,0.5z"
            />
          </svg>
        </span>
      </div>
      <div class="text-right govuk-grid-column-one-third">
        <slot
          name="right-slot"
        />
      </div>
    </div>
  </div>
</template>

<script>
import countdownWorkerScript from '@/workers/countdown';
import { isWebWorkerSupported } from '@/helpers/browser';

const second = 1000;
const minute = 60 * second;

export default {
  props: {
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      default: null,
    },
    serverTimeOffset: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      required: false,
      default: 15,
    },
    warning: {
      type: Number,
      default: 5,
    },
    alert: {
      type: Number,
      default: 1,
    },
  },
  emits: ['change'],
  data: function() {
    return {
      showCountdown: false,
      start: '',
      end: '',
      interval: '',
      //days: '',
      hours: '',
      minutes: '',
      seconds: '',
      bckClass: '',
      saveCounter: 0,
      saveSeconds: 5,
      ticksPerSecond: 1,
      countdownWorker: null,
    };
  },
  watch: {
    serverTimeOffset(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.resumeCountdown();
      }
    },
  },
  created() {
    window.addEventListener('focus', this.onFocus);

    const start = new Date(this.startTime);
    let end = new Date(this.startTime);
    end.setMinutes(end.getMinutes() + this.duration);

    // if we are provided an endTime and it is sooner than expected end then use it instead
    if (this.endTime !== null) {
      const absoluteEnd = new Date(this.endTime);
      const isAbsoluteEndBeforetheEnd = absoluteEnd < end;
      if (isAbsoluteEndBeforetheEnd) {
        end = absoluteEnd;
      }
    }

    this.start = start.getTime();
    this.end = end.getTime();

    // use web worker to implement countdown
    if (isWebWorkerSupported()) {
      this.prepareWebWorker();
      this.startCountdown();
    }
  },
  unmounted() {
    window.removeEventListener('focus', this.onFocus);
    this.endCountdown();
  },
  methods: {
    zeroPad(value) {
      if (typeof value === 'number') {
        return value.toString().padStart(2, '0');
      }
      return value;
    },
    onFocus() {
      this.$emit('change', { action: 'refresh' });
      this.resumeCountdown();
    },
    prepareWebWorker() {
      this.countdownWorker = new Worker(countdownWorkerScript);
      this.countdownWorker.onmessage = (e) => {
        if (e.data.action === 'autoSave') {
          this.$emit('change', { action: 'autoSave' });
        } else if (e.data.action === 'cleanAutoSave') {
          this.$emit('change', { action: 'cleanAutoSave' });
        } else if (e.data.action === 'ended') {
          this.$emit('change', { action: 'ended' });
          this.endCountdown();
        } else if (e.data.action === 'update') {
          const timeRemaining = e.data.payload.timeRemaining;
          this.hours = Math.floor((timeRemaining % (24 * 60 * minute)) / (60 * minute));
          this.minutes = Math.floor((timeRemaining % (60 * minute)) / (minute));
          this.seconds = Math.floor((timeRemaining % (minute)) / 1000);
          if (this.hours < 1) {
            this.bckClass = '';
            if (this.minutes < this.warning) {
              this.bckClass = 'warning';
            }
            if (this.minutes < this.alert) {
              this.bckClass = 'alert';
            }
          }
        }
      };
    },
    startWebWorker() {
      this.countdownWorker.postMessage({
        action: 'start',
        payload: {
          saveSeconds: this.saveSeconds,
          ticksPerSecond: this.ticksPerSecond,
          end: this.end,
          serverTimeOffset: this.serverTimeOffset,
        },
      });
    },
    endWebWorker() {
      // ensure the web worker is terminated
      this.countdownWorker.terminate();
    },
    startCountdown() {
      this.startWebWorker();
      this.showCountdown = true;
    },
    endCountdown() {
      this.endWebWorker();
      this.showCountdown = false;
    },
    resumeCountdown() {
      this.startWebWorker();
    },
  },
};
</script>

<style lang="scss" scoped>

  #time-remaining:before {
    content: 'Time remaining: ';
    @media (max-width: 599px) {
      content: '';
    }
  }

  span {
    vertical-align: middle;
    display: inline-block;
  }

  .countdown {
    background-color: green;
    color: white;
    text-align: center;
    font-weight: bold;
    // padding-bottom: 10px;
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 9;
    left: 0;

    &.alert {
      background-color: red;
    }

    div {
      text-align: center;
    }

  }

  .text-right {
    text-align: right !important;
    display: inline;
    min-height: 1px;
    float: right;
  }

  .text-center {
    text-align: center !important;
    display: inline-block;
    min-height: 1px;
  }

  .text-left {
    text-align: left !important;
    display: inline;
    min-height: 1px;
    float: left;
  }

</style>
