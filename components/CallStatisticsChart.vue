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

    <!-- Summary Cards -->
    <div v-if="showSummary" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-blue-600">Total Calls</p>
            <p class="text-2xl font-bold text-blue-900">{{ formatNumber(summaryStats.totalCalls) }}</p>
            <p class="text-xs text-blue-700 mt-1">
              {{ summaryStats.inboundCalls }} in / {{ summaryStats.outboundCalls }} out
            </p>
          </div>
          <div class="p-2 bg-blue-100 rounded-lg">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-green-50 rounded-lg p-4 border border-green-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-green-600">Avg Duration</p>
            <p class="text-2xl font-bold text-green-900">{{ formatDuration(summaryStats.avgDuration) }}</p>
            <p class="text-xs text-green-700 mt-1">
              per call
            </p>
          </div>
          <div class="p-2 bg-green-100 rounded-lg">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-yellow-600">Missed Calls</p>
            <p class="text-2xl font-bold text-yellow-900">{{ formatNumber(summaryStats.missedCalls) }}</p>
            <p class="text-xs text-yellow-700 mt-1">
              {{ summaryStats.callbacks }} callbacks
            </p>
          </div>
          <div class="p-2 bg-yellow-100 rounded-lg">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-purple-50 rounded-lg p-4 border border-purple-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-purple-600">Completion Rate</p>
            <p class="text-2xl font-bold text-purple-900">{{ summaryStats.completionRate }}%</p>
            <p class="text-xs text-purple-700 mt-1">
              {{ getCompletionRateClass(summaryStats.completionRate) }}
            </p>
          </div>
          <div class="p-2 bg-purple-100 rounded-lg">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Bar Charts -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Inbound vs Outbound Calls -->
      <div>
        <h4 class="text-sm font-medium text-gray-700 mb-3">Call Volume by Type</h4>
        <div class="space-y-3">
          <div>
            <div class="flex justify-between items-center mb-1">
              <span class="text-sm text-gray-600">Inbound Calls</span>
              <span class="text-sm font-medium text-gray-900">{{ formatNumber(callData.inbound) }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
              <div
                class="bg-gradient-to-r from-blue-500 to-blue-600 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-300"
                :style="{ width: getPercentage(callData.inbound, callData.inbound + callData.outbound) + '%' }"
              >
                <span class="text-xs text-white font-medium">{{ getPercentage(callData.inbound, callData.inbound + callData.outbound) }}%</span>
              </div>
            </div>
          </div>

          <div>
            <div class="flex justify-between items-center mb-1">
              <span class="text-sm text-gray-600">Outbound Calls</span>
              <span class="text-sm font-medium text-gray-900">{{ formatNumber(callData.outbound) }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
              <div
                class="bg-gradient-to-r from-green-500 to-green-600 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-300"
                :style="{ width: getPercentage(callData.outbound, callData.inbound + callData.outbound) + '%' }"
              >
                <span class="text-xs text-white font-medium">{{ getPercentage(callData.outbound, callData.inbound + callData.outbound) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Call Outcome Distribution -->
      <div>
        <h4 class="text-sm font-medium text-gray-700 mb-3">Call Outcomes</h4>
        <div class="space-y-3">
          <div>
            <div class="flex justify-between items-center mb-1">
              <span class="text-sm text-gray-600">Completed</span>
              <span class="text-sm font-medium text-gray-900">{{ formatNumber(callData.completed) }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
              <div
                class="bg-gradient-to-r from-green-500 to-green-600 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-300"
                :style="{ width: getPercentage(callData.completed, callData.completed + callData.missed) + '%' }"
              >
                <span class="text-xs text-white font-medium">{{ getPercentage(callData.completed, callData.completed + callData.missed) }}%</span>
              </div>
            </div>
          </div>

          <div>
            <div class="flex justify-between items-center mb-1">
              <span class="text-sm text-gray-600">Missed</span>
              <span class="text-sm font-medium text-gray-900">{{ formatNumber(callData.missed) }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
              <div
                class="bg-gradient-to-r from-red-500 to-red-600 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-300"
                :style="{ width: getPercentage(callData.missed, callData.completed + callData.missed) + '%' }"
              >
                <span class="text-xs text-white font-medium">{{ getPercentage(callData.missed, callData.completed + callData.missed) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'CallStatisticsChart',
  props: {
    title: {
      type: String,
      default: 'Call Statistics'
    },
    callData: {
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
    summaryStats() {
      const totalCalls = this.callData.inbound + this.callData.outbound
      const avgDuration = this.callData.avgDuration || 0
      const completionRate = totalCalls > 0 ? ((this.callData.completed / totalCalls) * 100).toFixed(1) : 0

      return {
        totalCalls,
        inboundCalls: this.callData.inbound,
        outboundCalls: this.callData.outbound,
        avgDuration,
        missedCalls: this.callData.missed,
        callbacks: this.callData.callbacks,
        completionRate
      }
    }
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

    getPercentage(value, total) {
      return total > 0 ? Math.round((value / total) * 100) : 0
    },

    getCompletionRateClass(rate) {
      if (rate >= 85) return 'Excellent'
      if (rate >= 70) return 'Good'
      if (rate >= 50) return 'Average'
      return 'Needs Improvement'
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
.h-40 {
  height: 10rem;
}

/* Custom scrollbar for long labels */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>