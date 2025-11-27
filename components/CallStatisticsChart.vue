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

    <!-- Line Chart Section -->
    <div v-if="trendsData && trendsData.labels && trendsData.labels.length > 0" class="mt-6 pt-6 border-t border-gray-200">
      <h4 class="text-sm font-semibold text-gray-700 mb-4">Call Trends Over Time</h4>
      <div class="h-80 relative">
        <svg :width="chartWidth" :height="chartHeight" class="w-full h-full">
          <!-- Grid Lines -->
          <g v-for="tick in yTicks" :key="tick">
            <line
              :x1="padding.left"
              :y1="getYPosition(tick)"
              :x2="chartWidth - padding.right"
              :y2="getYPosition(tick)"
              stroke="#e5e7eb"
              stroke-width="1"
            />
            <text
              :x="padding.left - 10"
              :y="getYPosition(tick) + 5"
              text-anchor="end"
              class="text-xs fill-gray-500"
            >
              {{ formatYTick(tick) }}
            </text>
          </g>

          <!-- X-axis labels -->
          <g v-for="(label, index) in visibleXLabels" :key="index">
            <text
              :x="getXPosition(label.originalIndex)"
              :y="chartHeight - padding.bottom + (shouldRotateLabels ? 35 : 20)"
              :text-anchor="shouldRotateLabels ? 'start' : 'middle'"
              :transform="shouldRotateLabels ? `rotate(-45, ${getXPosition(label.originalIndex)}, ${chartHeight - padding.bottom + 35})` : ''"
              class="text-xs fill-gray-500"
            >
              {{ label.text }}
            </text>
          </g>

          <!-- Line for each metric -->
          <polyline
            v-if="showInbound"
            :points="getLinePoints(trendsData.inbound)"
            fill="none"
            :stroke="colors.inbound"
            stroke-width="2"
            stroke-linejoin="round"
            stroke-linecap="round"
          />
          <polyline
            v-if="showOutbound"
            :points="getLinePoints(trendsData.outbound)"
            fill="none"
            :stroke="colors.outbound"
            stroke-width="2"
            stroke-linejoin="round"
            stroke-linecap="round"
          />
          <polyline
            v-if="showMissed"
            :points="getLinePoints(trendsData.missed)"
            fill="none"
            :stroke="colors.missed"
            stroke-width="2"
            stroke-linejoin="round"
            stroke-linecap="round"
          />
          <polyline
            v-if="showCompleted"
            :points="getLinePoints(trendsData.completed)"
            fill="none"
            :stroke="colors.completed"
            stroke-width="2"
            stroke-linejoin="round"
            stroke-linecap="round"
          />
          <polyline
            v-if="showPending"
            :points="getLinePoints(trendsData.pending)"
            fill="none"
            :stroke="colors.pending"
            stroke-width="2"
            stroke-linejoin="round"
            stroke-linecap="round"
          />

          <!-- Data Points -->
          <g v-if="showInbound" v-for="(point, index) in trendsData.inbound" :key="`inbound-${index}`">
            <circle
              :cx="getXPosition(index)"
              :cy="getYPosition(point)"
              r="3"
              :fill="colors.inbound"
              class="cursor-pointer"
              @mouseover="showTooltip($event, 'Inbound', index, point)"
              @mouseout="hideTooltip"
            />
          </g>
          <g v-if="showOutbound" v-for="(point, index) in trendsData.outbound" :key="`outbound-${index}`">
            <circle
              :cx="getXPosition(index)"
              :cy="getYPosition(point)"
              r="3"
              :fill="colors.outbound"
              class="cursor-pointer"
              @mouseover="showTooltip($event, 'Outbound', index, point)"
              @mouseout="hideTooltip"
            />
          </g>
          <g v-if="showMissed" v-for="(point, index) in trendsData.missed" :key="`missed-${index}`">
            <circle
              :cx="getXPosition(index)"
              :cy="getYPosition(point)"
              r="3"
              :fill="colors.missed"
              class="cursor-pointer"
              @mouseover="showTooltip($event, 'Missed', index, point)"
              @mouseout="hideTooltip"
            />
          </g>
          <g v-if="showCompleted" v-for="(point, index) in trendsData.completed" :key="`completed-${index}`">
            <circle
              :cx="getXPosition(index)"
              :cy="getYPosition(point)"
              r="3"
              :fill="colors.completed"
              class="cursor-pointer"
              @mouseover="showTooltip($event, 'Completed', index, point)"
              @mouseout="hideTooltip"
            />
          </g>
          <g v-if="showPending" v-for="(point, index) in trendsData.pending" :key="`pending-${index}`">
            <circle
              :cx="getXPosition(index)"
              :cy="getYPosition(point)"
              r="3"
              :fill="colors.pending"
              class="cursor-pointer"
              @mouseover="showTooltip($event, 'Pending', index, point)"
              @mouseout="hideTooltip"
            />
          </g>

          <!-- Legend with toggle functionality -->
          <g>
            <!-- Inbound Legend -->
            <g @click="toggleLine('inbound')" class="cursor-pointer">
              <rect :x="chartWidth - 160" :y="12" width="12" height="12" :fill="showInbound ? colors.inbound : '#e5e7eb'" :stroke="colors.inbound" stroke-width="2" rx="2" />
              <text :x="chartWidth - 140" :y="22" :class="['text-xs', showInbound ? 'fill-gray-700' : 'fill-gray-400']">Inbound</text>
            </g>
            <!-- Outbound Legend -->
            <g @click="toggleLine('outbound')" class="cursor-pointer">
              <rect :x="chartWidth - 160" :y="32" width="12" height="12" :fill="showOutbound ? colors.outbound : '#e5e7eb'" :stroke="colors.outbound" stroke-width="2" rx="2" />
              <text :x="chartWidth - 140" :y="42" :class="['text-xs', showOutbound ? 'fill-gray-700' : 'fill-gray-400']">Outbound</text>
            </g>
            <!-- Missed Legend -->
            <g @click="toggleLine('missed')" class="cursor-pointer">
              <rect :x="chartWidth - 160" :y="52" width="12" height="12" :fill="showMissed ? colors.missed : '#e5e7eb'" :stroke="colors.missed" stroke-width="2" rx="2" />
              <text :x="chartWidth - 140" :y="62" :class="['text-xs', showMissed ? 'fill-gray-700' : 'fill-gray-400']">Missed</text>
            </g>
            <!-- Completed Legend -->
            <g @click="toggleLine('completed')" class="cursor-pointer">
              <rect :x="chartWidth - 160" :y="72" width="12" height="12" :fill="showCompleted ? colors.completed : '#e5e7eb'" :stroke="colors.completed" stroke-width="2" rx="2" />
              <text :x="chartWidth - 140" :y="82" :class="['text-xs', showCompleted ? 'fill-gray-700' : 'fill-gray-400']">Completed</text>
            </g>
            <!-- Pending Legend -->
            <g @click="toggleLine('pending')" class="cursor-pointer">
              <rect :x="chartWidth - 160" :y="92" width="12" height="12" :fill="showPending ? colors.pending : '#e5e7eb'" :stroke="colors.pending" stroke-width="2" rx="2" />
              <text :x="chartWidth - 140" :y="102" :class="['text-xs', showPending ? 'fill-gray-700' : 'fill-gray-400']">Pending</text>
            </g>
          </g>
        </svg>

        <!-- Tooltip -->
        <div
          v-show="tooltip.visible"
          :class="[
            'absolute bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg border border-gray-700 pointer-events-none z-50',
            'transition-all duration-200 ease-in-out',
            tooltip.visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          ]"
          :style="{
            left: tooltip.x + 'px',
            top: tooltip.y + 'px',
            transform: `translate(-50%, -100%)`,
            maxWidth: '200px'
          }"
        >
          <div class="text-sm font-semibold mb-1">{{ tooltip.date }}</div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: tooltip.color }"></div>
            <span class="text-xs">{{ tooltip.label }}: <strong>{{ tooltip.value }}</strong></span>
          </div>
          <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
            <div class="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
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
    trendsData: {
      type: Object,
      default: null
    },
    showSummary: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      chartWidth: 800,
      chartHeight: 320,
      padding: {
        top: 20,
        right: 180,
        bottom: 60,
        left: 60
      },
      colors: {
        inbound: '#3b82f6',
        outbound: '#10b981',
        missed: '#ef4444',
        completed: '#10b981',
        pending: '#f59e0b'
      },
      showInbound: true,
      showOutbound: true,
      showMissed: true,
      showCompleted: true,
      showPending: true,
      tooltip: {
        visible: false,
        x: 0,
        y: 0,
        date: '',
        label: '',
        value: null,
        color: ''
      },
      tooltipTimeout: null
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
    },

    maxValue() {
      if (!this.trendsData) return 10
      const allValues = [
        ...(this.showInbound ? this.trendsData.inbound || [] : []),
        ...(this.showOutbound ? this.trendsData.outbound || [] : []),
        ...(this.showMissed ? this.trendsData.missed || [] : []),
        ...(this.showCompleted ? this.trendsData.completed || [] : []),
        ...(this.showPending ? this.trendsData.pending || [] : [])
      ]
      return Math.max(...allValues.filter(v => v !== null && v !== undefined), 10)
    },

    yTicks() {
      const max = this.maxValue
      const tickCount = 5
      const step = Math.ceil(max / tickCount / 10) * 10 || 10

      const ticks = []
      for (let i = 0; i <= tickCount; i++) {
        ticks.push(i * step)
      }
      return ticks
    },

    chartAreaWidth() {
      return this.chartWidth - this.padding.left - this.padding.right
    },

    chartAreaHeight() {
      return this.chartHeight - this.padding.top - this.padding.bottom
    },

    shouldRotateLabels() {
      if (!this.trendsData || !this.trendsData.labels) return false
      return this.trendsData.labels.length > 10
    },

    visibleXLabels() {
      if (!this.trendsData || !this.trendsData.labels) return []
      const labels = this.trendsData.labels
      const maxLabels = this.shouldRotateLabels ? 15 : 8

      if (labels.length <= maxLabels) {
        return labels.map((label, index) => ({
          text: label,
          originalIndex: index
        }))
      }

      const result = []
      const step = Math.ceil(labels.length / maxLabels)

      for (let i = 0; i < labels.length; i += step) {
        result.push({
          text: labels[i],
          originalIndex: i
        })
      }

      if (result[result.length - 1]?.originalIndex !== labels.length - 1) {
        result.push({
          text: labels[labels.length - 1],
          originalIndex: labels.length - 1
        })
      }

      return result
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
    },

    // Line chart methods
    getXPosition(index) {
      if (!this.trendsData || !this.trendsData.labels || this.trendsData.labels.length <= 1) {
        return this.padding.left + this.chartAreaWidth / 2
      }

      const step = this.chartAreaWidth / (this.trendsData.labels.length - 1)
      return this.padding.left + (index * step)
    },

    getYPosition(value) {
      const maxTick = Math.max(...this.yTicks)
      const ratio = value / maxTick
      return this.chartHeight - this.padding.bottom - (ratio * this.chartAreaHeight)
    },

    getLinePoints(data) {
      if (!data || data.length === 0) return ''
      return data.map((point, index) => {
        if (point === null || point === undefined) return null
        return `${this.getXPosition(index)},${this.getYPosition(point)}`
      }).filter(Boolean).join(' ')
    },

    formatYTick(tick) {
      if (tick >= 1000) {
        return (tick / 1000).toFixed(1) + 'k'
      }
      return tick.toString()
    },

    toggleLine(metric) {
      switch (metric) {
        case 'inbound':
          this.showInbound = !this.showInbound
          break
        case 'outbound':
          this.showOutbound = !this.showOutbound
          break
        case 'missed':
          this.showMissed = !this.showMissed
          break
        case 'completed':
          this.showCompleted = !this.showCompleted
          break
        case 'pending':
          this.showPending = !this.showPending
          break
      }
    },

    showTooltip(event, label, index, value) {
      if (this.tooltipTimeout) {
        clearTimeout(this.tooltipTimeout)
        this.tooltipTimeout = null
      }

      const chartContainer = this.$el.querySelector('.h-80')
      if (!chartContainer) return

      const rect = chartContainer.getBoundingClientRect()

      let x = event.clientX - rect.left
      let y = event.clientY - rect.top

      const tooltipWidth = 200
      const tooltipHeight = 100
      const padding = 10

      if (x + tooltipWidth/2 > rect.width) {
        x = rect.width - tooltipWidth/2 - padding
      }

      if (x - tooltipWidth/2 < 0) {
        x = tooltipWidth/2 + padding
      }

      if (y - tooltipHeight - padding < 0) {
        y = tooltipHeight + padding
      }

      this.tooltip.x = x
      this.tooltip.y = y
      this.tooltip.date = this.trendsData.labels[index] || ''
      this.tooltip.label = label
      this.tooltip.value = value
      this.tooltip.color = this.colors[label.toLowerCase()]
      this.tooltip.visible = true
    },

    hideTooltip() {
      if (this.tooltipTimeout) {
        clearTimeout(this.tooltipTimeout)
      }

      this.tooltipTimeout = setTimeout(() => {
        this.tooltip.visible = false
        this.tooltipTimeout = null
      }, 50)
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