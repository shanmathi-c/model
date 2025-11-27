<template>
  <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
    </div>

    <!-- Summary Cards -->
    <div v-if="showSummary" class="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-2.5">
      <div class="bg-blue-50 rounded-lg p-2.5 border border-blue-200 min-h-[75px]">
        <div class="flex items-center justify-between h-full">
          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium text-blue-600 mb-1">Total Calls</p>
            <p class="text-xl font-bold text-blue-900 truncate">{{ formatNumber(summaryStats.totalCalls) }}</p>
            <p class="text-xs text-blue-700">
              {{ summaryStats.inboundCalls }} in / {{ summaryStats.outboundCalls }} out
            </p>
          </div>
          <div class="p-1.5 bg-blue-100 rounded-lg flex-shrink-0 ml-1.5">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-green-50 rounded-lg p-2.5 border border-green-200 min-h-[75px]">
        <div class="flex items-center justify-between h-full">
          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium text-green-600 mb-1">Avg Duration</p>
            <p class="text-xl font-bold text-green-900 truncate">{{ formatDuration(summaryStats.avgDuration) }}</p>
            <p class="text-xs text-green-700">
              per call
            </p>
          </div>
          <div class="p-1.5 bg-green-100 rounded-lg flex-shrink-0 ml-1.5">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-purple-50 rounded-lg p-2.5 border border-purple-200 min-h-[75px]">
        <div class="flex items-center justify-between h-full">
          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium text-purple-600 mb-1">Completion Rate</p>
            <p class="text-xl font-bold text-purple-900 truncate">{{ summaryStats.completionRate }}%</p>
            <p class="text-xs text-purple-700">
              {{ getCompletionRateClass(summaryStats.completionRate) }}
            </p>
          </div>
          <div class="p-1.5 bg-purple-100 rounded-lg flex-shrink-0 ml-1.5">
            <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Inbound Card -->
      <div class="bg-blue-50 rounded-lg p-2.5 border border-blue-200 min-h-[75px]">
        <div class="flex items-center justify-between h-full">
          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium text-blue-600 mb-1">Inbound</p>
            <p class="text-xl font-bold text-blue-900 truncate">{{ formatNumber(callData.inbound) }}</p>
            <p class="text-xs text-blue-700">
              {{ getPercentage(callData.inbound, callData.inbound + callData.outbound) }}%
            </p>
          </div>
          <div class="p-1.5 bg-blue-100 rounded-lg flex-shrink-0 ml-1.5">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Second Row Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-2.5">
      <!-- Outbound Card -->
      <div class="bg-green-50 rounded-lg p-2.5 border border-green-200 min-h-[75px]">
        <div class="flex items-center justify-between h-full">
          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium text-green-600 mb-1">Outbound</p>
            <p class="text-xl font-bold text-green-900 truncate">{{ formatNumber(callData.outbound) }}</p>
            <p class="text-xs text-green-700">
              {{ getPercentage(callData.outbound, callData.inbound + callData.outbound) }}%
            </p>
          </div>
          <div class="p-1.5 bg-green-100 rounded-lg flex-shrink-0 ml-1.5">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Missed Card -->
      <div class="bg-red-50 rounded-lg p-2.5 border border-red-200 min-h-[75px]">
        <div class="flex items-center justify-between h-full">
          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium text-red-600 mb-1">Missed</p>
            <p class="text-xl font-bold text-red-900 truncate">{{ formatNumber(callbackData.missed) }}</p>
            <p class="text-xs text-red-700">
              {{ getCallbackPercentage(callbackData.missed) }}%
            </p>
          </div>
          <div class="p-1.5 bg-red-100 rounded-lg flex-shrink-0 ml-1.5">
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Completed Card -->
      <div class="bg-emerald-50 rounded-lg p-2.5 border border-emerald-200 min-h-[75px]">
        <div class="flex items-center justify-between h-full">
          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium text-emerald-600 mb-1">Completed</p>
            <p class="text-xl font-bold text-emerald-900 truncate">{{ formatNumber(callbackData.successful) }}</p>
            <p class="text-xs text-emerald-700">
              {{ getCallbackPercentage(callbackData.successful) }}%
            </p>
          </div>
          <div class="p-1.5 bg-emerald-100 rounded-lg flex-shrink-0 ml-1.5">
            <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Pending Card -->
      <div class="bg-yellow-50 rounded-lg p-2.5 border border-yellow-200 min-h-[75px]">
        <div class="flex items-center justify-between h-full">
          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium text-yellow-600 mb-1">Pending</p>
            <p class="text-xl font-bold text-yellow-900 truncate">{{ formatNumber(callbackData.pending) }}</p>
            <p class="text-xs text-yellow-700">
              {{ getCallbackPercentage(callbackData.pending) }}%
            </p>
          </div>
          <div class="p-1.5 bg-yellow-100 rounded-lg flex-shrink-0 ml-1.5">
            <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
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
    callbackData: {
      type: Object,
      required: true
    },
    showSummary: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {}
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
    },

    getCallbackPercentage(value) {
      const total = this.callbackData.total || 0
      return total > 0 ? Math.round((value / total) * 100) : 0
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