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

    <!-- Chart Container with Pie and Legend Side by Side -->
    <div class="flex items-center justify-center gap-8">
      <!-- Pie Chart -->
      <div class="relative">
        <svg :width="svgSize" :height="svgSize" class="w-full h-full">
          <!-- Pie slices -->
          <g v-for="(slice, index) in pieSlices" :key="index">
            <path
              :d="slice.path"
              :fill="slice.color"
              stroke="white"
              stroke-width="2"
              class="cursor-pointer hover:opacity-80 transition-opacity"
              @mouseover="showTooltip($event, slice)"
              @mouseout="hideTooltip"
            />
          </g>

          <!-- Center circle for donut effect -->
          <circle
            :cx="center"
            :cy="center"
            :r="innerRadius"
            fill="white"
          />

          <!-- Center text -->
          <text
            :x="center"
            :y="center - 10"
            text-anchor="middle"
            class="text-3xl font-bold fill-gray-900"
          >
            {{ averageRating }}
          </text>
          <text
            :x="center"
            :y="center + 12"
            text-anchor="middle"
            class="text-sm fill-gray-500"
          >
            Avg Rating
          </text>
        </svg>

        <!-- Tooltip -->
        <div
          v-if="tooltip.visible"
          class="absolute bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg border border-gray-700 pointer-events-none z-50"
          :style="{
            left: tooltip.x + 'px',
            top: tooltip.y + 'px',
            transform: 'translate(-50%, -100%)'
          }"
        >
          <div class="text-sm font-semibold mb-1">{{ tooltip.label }}</div>
          <div class="text-xs text-gray-300">
            {{ tooltip.count }} responses ({{ tooltip.percentage }}%)
          </div>
          <div class="text-xs text-blue-300 mt-1">
            Rating: {{ tooltip.rating }}/5
          </div>
          <!-- Tooltip Arrow -->
          <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
            <div class="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>

      <!-- Legend - Vertical on Right Side -->
      <div class="flex flex-col gap-3">
        <div v-for="rating in [5, 4, 3, 2, 1]" :key="rating" class="flex items-center gap-2">
          <div
            class="w-4 h-4 rounded-sm flex-shrink-0"
            :style="{ backgroundColor: ratingColors[rating] }"
          ></div>
          <span class="text-sm text-gray-700">
            Ratings-{{ rating }}: <span class="font-semibold">{{ csatData[rating] || 0 }}</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Summary Stats -->
    <div v-if="showSummary" class="mt-4 pt-4 border-t border-gray-200">
      <div class="grid grid-cols-4 gap-4 text-center">
        <div>
          <div class="text-2xl font-bold text-gray-900">{{ getTotalResponses() }}</div>
          <div class="text-xs text-gray-500">Total Responses</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-green-600">{{ getPositivePercentage() }}%</div>
          <div class="text-xs text-gray-500">Positive (4-5★)</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-yellow-600">{{ getNeutralPercentage() }}%</div>
          <div class="text-xs text-gray-500">Neutral (3★)</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-red-600">{{ getNegativePercentage() }}%</div>
          <div class="text-xs text-gray-500">Negative (1-2★)</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomerSatisfactionChart',
  props: {
    title: {
      type: String,
      default: 'Customer Satisfaction Distribution'
    },
    csatData: {
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
      selectedPeriod: this.period,
      svgSize: 300,
      innerRadius: 80,
      outerRadius: 130,
      tooltip: {
        visible: false,
        x: 0,
        y: 0,
        label: '',
        count: 0,
        percentage: 0,
        rating: 0
      },
      ratingColors: {
        5: '#10b981', // green
        4: '#f97316', // orange
        3: '#3b82f6', // blue
        2: '#eab308', // yellow
        1: '#ef4444'  // red
      }
    }
  },
  computed: {
    center() {
      return this.svgSize / 2
    },

    total() {
      return Object.values(this.csatData).reduce((sum, count) => sum + count, 0)
    },

    averageRating() {
      let weightedSum = 0
      for (const [rating, count] of Object.entries(this.csatData)) {
        weightedSum += parseInt(rating) * count
      }
      return this.total > 0 ? (weightedSum / this.total).toFixed(1) : '0.0'
    },

    pieSlices() {
      const slices = []
      let currentAngle = -90 // Start from top

      // Sort by rating descending (5 to 1) for better visual order
      const sortedRatings = Object.keys(this.csatData)
        .map(Number)
        .sort((a, b) => b - a)

      sortedRatings.forEach(rating => {
        const count = this.csatData[rating]
        if (count === 0) return

        const percentage = ((count / this.total) * 100).toFixed(1)
        const angle = (count / this.total) * 360

        const startAngle = currentAngle
        // If this is 100% (or very close), make it slightly less than 360 degrees
        const endAngle = angle >= 359.9 ? currentAngle + 359.9 : currentAngle + angle

        const path = this.createSlicePath(startAngle, endAngle)

        slices.push({
          label: this.getRatingLabel(rating),
          rating,
          count,
          percentage,
          color: this.ratingColors[rating],
          path
        })

        currentAngle = endAngle
      })

      return slices
    }
  },
  methods: {
    getRatingLabel(rating) {
      const labels = {
        5: 'Very Satisfied',
        4: 'Satisfied',
        3: 'Neutral',
        2: 'Dissatisfied',
        1: 'Very Dissatisfied'
      }
      return labels[rating] || `${rating}`
    },

    createSlicePath(startAngle, endAngle) {
      const startAngleRad = (startAngle * Math.PI) / 180
      const endAngleRad = (endAngle * Math.PI) / 180

      const x1 = this.center + this.outerRadius * Math.cos(startAngleRad)
      const y1 = this.center + this.outerRadius * Math.sin(startAngleRad)
      const x2 = this.center + this.outerRadius * Math.cos(endAngleRad)
      const y2 = this.center + this.outerRadius * Math.sin(endAngleRad)

      const x3 = this.center + this.innerRadius * Math.cos(endAngleRad)
      const y3 = this.center + this.innerRadius * Math.sin(endAngleRad)
      const x4 = this.center + this.innerRadius * Math.cos(startAngleRad)
      const y4 = this.center + this.innerRadius * Math.sin(startAngleRad)

      const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0

      return [
        `M ${x1} ${y1}`,
        `A ${this.outerRadius} ${this.outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${this.innerRadius} ${this.innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
        'Z'
      ].join(' ')
    },

    showTooltip(event, slice) {
      const rect = this.$el.getBoundingClientRect()
      const svg = this.$el.querySelector('svg')
      const svgRect = svg.getBoundingClientRect()

      // Get mouse position relative to the SVG
      const x = event.clientX - svgRect.left
      const y = event.clientY - svgRect.top

      // Update tooltip data
      this.tooltip.x = x
      this.tooltip.y = y
      this.tooltip.label = slice.label
      this.tooltip.count = slice.count
      this.tooltip.percentage = slice.percentage
      this.tooltip.rating = slice.rating
      this.tooltip.visible = true
    },

    hideTooltip() {
      this.tooltip.visible = false
    },

    // Summary calculation methods
    getTotalResponses() {
      return this.total
    },

    getPositivePercentage() {
      const positive = (this.csatData[4] || 0) + (this.csatData[5] || 0)
      return this.total > 0 ? ((positive / this.total) * 100).toFixed(0) : 0
    },

    getNeutralPercentage() {
      return this.total > 0 ? (((this.csatData[3] || 0) / this.total) * 100).toFixed(0) : 0
    },

    getNegativePercentage() {
      const negative = (this.csatData[1] || 0) + (this.csatData[2] || 0)
      return this.total > 0 ? ((negative / this.total) * 100).toFixed(0) : 0
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
svg {
  width: 100%;
  height: auto;
}

path:hover {
  opacity: 0.8;
}
</style>