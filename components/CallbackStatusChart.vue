<template>
  <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
      <div v-if="showPeriodSelector" class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-700">Period:</label>
        <select
          v-model="selectedPeriod"
          @change="$emit('period-change', selectedPeriod)"
          class="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>
    </div>

    <!-- Callback Status Horizontal Bar Chart -->
    <div class="space-y-3">
      <!-- Successful Callbacks -->
      <div class="flex items-center gap-3">
        <div class="w-16 text-sm text-gray-600">Successful</div>
        <div class="flex-1 bg-gray-200 rounded-full h-6 relative">
          <div
            class="bg-green-500 h-6 rounded-full transition-all duration-300"
            :style="{ width: getPercentage(callbackData.successful, callbackData.total) + '%' }"
          ></div>
        </div>
        <div class="w-16 text-right">
          <span class="text-sm font-medium text-gray-900">{{ formatNumber(callbackData.successful) }}</span>
          <span class="text-xs text-gray-500 ml-1">({{ getPercentage(callbackData.successful, callbackData.total) }}%)</span>
        </div>
      </div>

      <!-- Pending Callbacks -->
      <div class="flex items-center gap-3">
        <div class="w-16 text-sm text-gray-600">Pending</div>
        <div class="flex-1 bg-gray-200 rounded-full h-6 relative">
          <div
            class="bg-yellow-500 h-6 rounded-full transition-all duration-300"
            :style="{ width: getPercentage(callbackData.pending, callbackData.total) + '%' }"
          ></div>
        </div>
        <div class="w-16 text-right">
          <span class="text-sm font-medium text-gray-900">{{ formatNumber(callbackData.pending) }}</span>
          <span class="text-xs text-gray-500 ml-1">({{ getPercentage(callbackData.pending, callbackData.total) }}%)</span>
        </div>
      </div>

      <!-- Missed Callbacks -->
      <div class="flex items-center gap-3">
        <div class="w-16 text-sm text-gray-600">Missed</div>
        <div class="flex-1 bg-gray-200 rounded-full h-6 relative">
          <div
            class="bg-red-500 h-6 rounded-full transition-all duration-300"
            :style="{ width: getPercentage(callbackData.missed, callbackData.total) + '%' }"
          ></div>
        </div>
        <div class="w-16 text-right">
          <span class="text-sm font-medium text-gray-900">{{ formatNumber(callbackData.missed) }}</span>
          <span class="text-xs text-gray-500 ml-1">({{ getPercentage(callbackData.missed, callbackData.total) }}%)</span>
        </div>
      </div>
    </div>

    <!-- Total Summary -->
    <div class="mt-4 pt-4 border-t border-gray-200">
      <div class="flex justify-between items-center">
        <span class="text-sm font-medium text-gray-700">Total Callbacks</span>
        <span class="text-lg font-bold text-gray-900">{{ formatNumber(callbackData.total) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CallbackStatusChart',
  props: {
    title: {
      type: String,
      default: 'Callback Status'
    },
    callbackData: {
      type: Object,
      required: true
    },
    showPeriodSelector: {
      type: Boolean,
      default: true
    },
    showSummary: {
      type: Boolean,
      default: true
    },
    period: {
      type: String,
      default: '30'
    }
  },
  data() {
    return {
      selectedPeriod: this.period
    }
  },
  computed: {
  },
  methods: {
    formatNumber(num) {
      return num.toLocaleString()
    },

    formatDuration(minutes) {
      if (minutes < 60) {
        return `${Math.round(minutes)}m`
      } else {
        const hours = Math.floor(minutes / 60)
        const mins = Math.round(minutes % 60)
        return `${hours}h ${mins}m`
      }
    },

    getMissedRate() {
      return this.callbackData.total > 0 ?
        ((this.callbackData.missed / this.callbackData.total) * 100).toFixed(1) : 0
    },

    getSuccessRateClass(rate) {
      if (rate >= 90) return 'Excellent'
      if (rate >= 75) return 'Good'
      if (rate >= 60) return 'Average'
      return 'Needs Improvement'
    },

    getPercentage(value, total) {
      return total > 0 ? Math.round((value / total) * 100) : 0
    }
  },
  watch: {
    period(newVal) {
      this.selectedPeriod = newVal
    }
  }
}
</script>

<style scoped>
/* Custom styles for charts */
svg {
  width: 100%;
  height: auto;
}

path:hover {
  opacity: 0.8;
}
</style>