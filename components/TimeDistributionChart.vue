<template>
  <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
    </div>
    <div class="space-y-3">
      <div v-for="(timeSlot, index) in timeData" :key="index" class="flex items-center gap-3">
        <!-- Time Slot Label -->
        <div class="w-24 text-sm font-medium text-gray-700 flex-shrink-0">
          {{ timeSlot.timeRange }}
        </div>

        <!-- Bar Container -->
        <div class="flex-1 relative">
          <div class="h-8 bg-gray-100 rounded-md relative overflow-hidden">
            <!-- Agent Bars -->
            <div
              class="absolute left-0 top-0 h-full rounded-md group"
              :style="{
                width: `${getPercentage(timeSlot.total)}%`,
                backgroundColor: getAgentColor(timeSlot.agents[0]?.name || 'Tickets'),
              }"
              @mouseover="timeSlot.agents.length > 0 ? $emit('tooltip-show', { timeSlot: timeSlot.timeRange, agent: timeSlot.agents[0].name, count: timeSlot.agents[0].count, percentage: ((timeSlot.agents[0].count / timeSlot.total) * 100).toFixed(1), x: $event, y: $event }) : null"
              @mouseout="$emit('tooltip-hide')"
            >
              <!-- Tooltip on hover -->
              <div
                v-if="showTooltips && timeSlot.agents.length > 0 && timeSlot.agents[0].count > 0"
                class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10"
              >
                {{ timeSlot.agents[0].name }}: {{ timeSlot.agents[0].count }} ({{ ((timeSlot.agents[0].count / timeSlot.total) * 100).toFixed(1) }}%)
                <!-- Tooltip arrow -->
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>

            <!-- Total Count Label -->
            <div class="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-bold text-gray-800">
              {{ timeSlot.total }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="mt-6 flex flex-wrap gap-3 justify-center">
      <div
        v-for="agent in uniqueAgents"
        :key="agent"
        class="flex items-center gap-2"
      >
        <div
          class="w-3 h-3 rounded-sm"
          :style="{ backgroundColor: getAgentColor(agent) }"
        ></div>
        <span class="text-sm text-gray-600">{{ agent }}</span>
      </div>
    </div>

    <!-- Summary Stats -->
    <div v-if="showSummary" class="mt-4 pt-4 border-t border-gray-200">
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
          <div class="text-2xl font-bold text-gray-900">{{ getTotalTickets() }}</div>
          <div class="text-xs text-gray-500">Total Tickets</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-gray-900">{{ getPeakHour() }}</div>
          <div class="text-xs text-gray-500">Peak Hour</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-gray-900">{{ getAveragePerSlot() }}</div>
          <div class="text-xs text-gray-500">Avg per Slot</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TimeDistributionChart',
  props: {
    title: {
      type: String,
      default: 'Time Distribution'
    },
    timeData: {
      type: Array,
      required: true
    },
    showSummary: {
      type: Boolean,
      default: true
    },
    showTooltips: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      agentColors: {
        'Tickets': '#3b82f6',        // blue-500 (light blue)
        'John Doe': '#3b82f6',      // blue-500
        'Jane Smith': '#10b981',     // emerald-500
        'Mike Wilson': '#f59e0b',     // amber-500
        'Sarah Jones': '#ef4444',    // red-500
        'Alex Brown': '#8b5cf6',     // violet-500
        'David Chen': '#ec4899',     // pink-500
        'Emma Davis': '#14b8a6',     // teal-500
        'Tom Wilson': '#f97316'      // orange-500
      }
    }
  },
  computed: {
    uniqueAgents() {
      const agents = new Set()
      this.timeData.forEach(timeSlot => {
        timeSlot.agents.forEach(agent => {
          if (agent.count > 0) {
            agents.add(agent.name)
          }
        })
      })
      return Array.from(agents)
    },

    maxTotal() {
      return Math.max(...this.timeData.map(slot => slot.total), 1)
    },

    totalTickets() {
      const sum = this.timeData.reduce((total, slot) => total + slot.total, 0)
      return sum > 0 ? sum : 1
    }
  },
  methods: {
    getPercentage(value) {
      const total = this.totalTickets
      return Math.min((value / total) * 100, 100)
    },

    getAgentColor(agentName) {
      // Return predefined color if exists, otherwise generate one
      if (this.agentColors[agentName]) {
        return this.agentColors[agentName]
      }

      // Generate a color based on agent name hash
      const hash = agentName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      const colors = ['#06b6d4', '#84cc16', '#a855f7', '#f43f5e', '#0ea5e9', '#22c55e']
      return colors[hash % colors.length]
    },

    getTotalTickets() {
      return this.timeData.reduce((total, slot) => total + slot.total, 0)
    },

    getPeakHour() {
      const peakSlot = this.timeData.reduce((max, slot) =>
        slot.total > max.total ? slot : max, this.timeData[0])
      return peakSlot ? peakSlot.timeRange : 'N/A'
    },

    getAveragePerSlot() {
      const total = this.getTotalTickets()
      const slots = this.timeData.length
      return slots > 0 ? Math.round(total / slots) : 0
    }
  }
}
</script>

<style scoped>
.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}
</style>