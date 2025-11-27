<template>
  <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
    </div>
    <div class="h-64 relative">
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

        <!-- Created Line -->
        <polyline
          :points="createdLinePoints"
          fill="none"
          :stroke="colors.created"
          stroke-width="3"
          stroke-linejoin="round"
          stroke-linecap="round"
        />

        <!-- Resolved Line -->
        <polyline
          :points="resolvedLinePoints"
          fill="none"
          :stroke="colors.resolved"
          stroke-width="3"
          stroke-linejoin="round"
          stroke-linecap="round"
        />

        <!-- Data Points for Created -->
        <g v-for="(point, index) in createdData" :key="`created-${index}`">
          <circle
            :cx="getXPosition(index)"
            :cy="getYPosition(point)"
            r="4"
            :fill="colors.created"
            class="cursor-pointer hover:r-6"
            @mouseover="showTooltip($event, 'created', index, point, xLabels[index])"
            @mouseout="hideTooltip"
          />
        </g>

        <!-- Data Points for Resolved -->
        <g v-for="(point, index) in resolvedData" :key="`resolved-${index}`">
          <circle
            :cx="getXPosition(index)"
            :cy="getYPosition(point)"
            r="4"
            :fill="colors.resolved"
            class="cursor-pointer hover:r-6"
            @mouseover="showTooltip($event, 'resolved', index, point, xLabels[index])"
            @mouseout="hideTooltip"
          />
        </g>

        <!-- Legend -->
        <g>
          <!-- Created Legend -->
          <line
            :x1="chartWidth - 150"
            :y1="20"
            :x2="chartWidth - 130"
            :y2="20"
            :stroke="colors.created"
            stroke-width="3"
          />
          <circle :cx="chartWidth - 140" :cy="20" r="3" :fill="colors.created" />
          <text :x="chartWidth - 120" :y="25" class="text-xs fill-gray-700">Created</text>

          <!-- Resolved Legend -->
          <line
            :x1="chartWidth - 150"
            :y1="40"
            :x2="chartWidth - 130"
            :y2="40"
            :stroke="colors.resolved"
            stroke-width="3"
          />
          <circle :cx="chartWidth - 140" :cy="40" r="3" :fill="colors.resolved" />
          <text :x="chartWidth - 120" :y="45" class="text-xs fill-gray-700">Resolved</text>
        </g>
      </svg>

      <!-- Tooltip -->
      <div
        v-show="tooltip.visible"
        :class="[
          'absolute bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg border border-gray-700 pointer-events-none z-50',
          'transition-all duration-200 ease-in-out',
          tooltip.visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'
        ]"
        :style="{
          left: tooltip.x + 'px',
          top: tooltip.y + 'px',
          transform: `translate(-50%, -100%)`,
          maxWidth: '200px'
        }"
      >
        <div class="text-sm font-semibold mb-1">{{ tooltip.date }}</div>
        <div class="flex flex-col gap-1">
          <div v-if="tooltip.created !== null" class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: colors.created }"></div>
            <span class="text-xs">Created: <strong>{{ tooltip.created }}</strong> tickets</span>
          </div>
          <div v-if="tooltip.resolved !== null" class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: colors.resolved }"></div>
            <span class="text-xs">Resolved: <strong>{{ tooltip.resolved }}</strong> tickets</span>
          </div>
        </div>
        <!-- Tooltip Arrow -->
        <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
          <div class="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LineChart',
  props: {
    title: {
      type: String,
      default: 'Ticket Trends'
    },
    createdData: {
      type: Array,
      required: true
    },
    resolvedData: {
      type: Array,
      required: true
    },
    xLabels: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      chartWidth: 800,
      chartHeight: 256,
      padding: {
        top: 20,
        right: 40,
        bottom: 60, // Increased bottom padding for rotated labels
        left: 60
      },
      colors: {
        created: '#3b82f6', // blue-500
        resolved: '#10b981'  // emerald-500
      },
      tooltip: {
        visible: false,
        x: 0,
        y: 0,
        date: '',
        created: null,
        resolved: null
      },
      tooltipTimeout: null
    }
  },
  computed: {
    maxValue() {
      const allValues = [...this.createdData, ...this.resolvedData]
      return Math.max(...allValues.filter(v => v !== null && v !== undefined), 10)
    },

    yTicks() {
      const max = this.maxValue
      const tickCount = 5
      const step = Math.ceil(max / tickCount / 10) * 10

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

    createdLinePoints() {
      return this.createdData.map((point, index) => {
        if (point === null || point === undefined) return null
        return `${this.getXPosition(index)},${this.getYPosition(point)}`
      }).filter(Boolean).join(' ')
    },

    resolvedLinePoints() {
      return this.resolvedData.map((point, index) => {
        if (point === null || point === undefined) return null
        return `${this.getXPosition(index)},${this.getYPosition(point)}`
      }).filter(Boolean).join(' ')
    },

    // Calculate if labels should be rotated to prevent overlapping
    shouldRotateLabels() {
      return this.xLabels.length > 10
    },

    // Calculate which labels to show to prevent overlapping
    visibleXLabels() {
      const labels = []
      const maxLabels = this.shouldRotateLabels ? 15 : 8 // Show more labels if rotated

      if (this.xLabels.length <= maxLabels) {
        // Show all labels if there aren't too many
        return this.xLabels.map((label, index) => ({
          text: label,
          originalIndex: index
        }))
      }

      // Calculate step size to show evenly distributed labels
      const step = Math.ceil(this.xLabels.length / maxLabels)

      for (let i = 0; i < this.xLabels.length; i += step) {
        labels.push({
          text: this.xLabels[i],
          originalIndex: i
        })
      }

      // Always include the last label
      if (labels[labels.length - 1]?.originalIndex !== this.xLabels.length - 1) {
        labels.push({
          text: this.xLabels[this.xLabels.length - 1],
          originalIndex: this.xLabels.length - 1
        })
      }

      return labels
    }
  },
  methods: {
    getXPosition(index) {
      if (this.xLabels.length <= 1) return this.padding.left + this.chartAreaWidth / 2

      const step = this.chartAreaWidth / (this.xLabels.length - 1)
      return this.padding.left + (index * step)
    },

    getYPosition(value) {
      const maxTick = Math.max(...this.yTicks)
      const ratio = value / maxTick
      return this.chartHeight - this.padding.bottom - (ratio * this.chartAreaHeight)
    },

    formatYTick(tick) {
      if (tick >= 1000) {
        return (tick / 1000).toFixed(1) + 'k'
      }
      return tick.toString()
    },

    showTooltip(event, type, index, value, date) {
      // Clear any existing timeout to prevent flickering
      if (this.tooltipTimeout) {
        clearTimeout(this.tooltipTimeout)
        this.tooltipTimeout = null
      }

      // Get mouse position relative to the chart container
      const chartContainer = this.$el.querySelector('.h-64')
      const rect = chartContainer.getBoundingClientRect()

      // Calculate position relative to the chart container
      let x = event.clientX - rect.left
      let y = event.clientY - rect.top

      // Keep tooltip within chart bounds (add some padding)
      const tooltipWidth = 200 // Approximate tooltip width
      const tooltipHeight = 100 // Approximate tooltip height
      const padding = 10

      // Adjust horizontal position if tooltip would go outside right edge
      if (x + tooltipWidth/2 > rect.width) {
        x = rect.width - tooltipWidth/2 - padding
      }

      // Adjust horizontal position if tooltip would go outside left edge
      if (x - tooltipWidth/2 < 0) {
        x = tooltipWidth/2 + padding
      }

      // Adjust vertical position if tooltip would go outside top edge
      if (y - tooltipHeight - padding < 0) {
        y = tooltipHeight + padding
      }

      // Update tooltip data
      this.tooltip.x = x
      this.tooltip.y = y
      this.tooltip.date = date
      this.tooltip.visible = true

      // Reset values
      this.tooltip.created = null
      this.tooltip.resolved = null

      // Set the appropriate value based on type
      if (type === 'created') {
        this.tooltip.created = value
        this.tooltip.resolved = this.resolvedData[index] || 0
      } else {
        this.tooltip.resolved = value
        this.tooltip.created = this.createdData[index] || 0
      }
    },

    hideTooltip() {
      // Clear any existing timeout
      if (this.tooltipTimeout) {
        clearTimeout(this.tooltipTimeout)
      }

      // Add a small delay before hiding to prevent flickering
      this.tooltipTimeout = setTimeout(() => {
        this.tooltip.visible = false
        this.tooltipTimeout = null
      }, 50)
    }
  }
}
</script>

<style scoped>
svg {
  width: 100%;
  height: 100%;
}

circle:hover {
  r: 6;
}
</style>