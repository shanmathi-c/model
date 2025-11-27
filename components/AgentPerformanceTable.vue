<template>
  <div class="bg-white rounded-lg shadow border border-gray-200">
    <div class="flex items-center justify-between p-6 border-b border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead class="bg-gray-50 border-b-2 border-gray-300 sticky top-0 z-10">
          <tr>
            <th class="px-6 py-4 text-left">
              <div
                class="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:text-gray-900"
                @click="sortBy('name')"
              >
                Agent Name
                <svg
                  class="w-4 h-4"
                  :class="{'rotate-180': sortColumn === 'name' && sortOrder === 'desc'}"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                </svg>
              </div>
            </th>
            <th class="px-6 py-4 text-left">
              <div
                class="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:text-gray-900"
                @click="sortBy('assigned')"
              >
                Assigned
                <svg
                  class="w-4 h-4"
                  :class="{'rotate-180': sortColumn === 'assigned' && sortOrder === 'desc'}"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                </svg>
              </div>
            </th>
            <th class="px-6 py-4 text-left">
              <div
                class="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:text-gray-900"
                @click="sortBy('resolved')"
              >
                Resolved
                <svg
                  class="w-4 h-4"
                  :class="{'rotate-180': sortColumn === 'resolved' && sortOrder === 'desc'}"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                </svg>
              </div>
            </th>
            <th class="px-6 py-4 text-left">
              <div
                class="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:text-gray-900"
                @click="sortBy('resolutionTime')"
              >
                Avg Resolution Time
                <svg
                  class="w-4 h-4"
                  :class="{'rotate-180': sortColumn === 'resolutionTime' && sortOrder === 'desc'}"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                </svg>
              </div>
            </th>
            <th class="px-6 py-4 text-left">
              <div
                class="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:text-gray-900"
                @click="sortBy('fcrRate')"
              >
                FCR Rate
                <svg
                  class="w-4 h-4"
                  :class="{'rotate-180': sortColumn === 'fcrRate' && sortOrder === 'desc'}"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                </svg>
              </div>
            </th>
            <th class="px-6 py-4 text-left">
              <div
                class="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:text-gray-900"
                @click="sortBy('csatRating')"
              >
                Avg CSAT
                <svg
                  class="w-4 h-4"
                  :class="{'rotate-180': sortColumn === 'csatRating' && sortOrder === 'desc'}"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                </svg>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(agent, index) in sortedAgents" :key="agent.id" class="border-b border-gray-200 hover:bg-gray-100 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap align-middle">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-8 w-8">
                  <div class="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                    {{ getInitials(agent.name) }}
                  </div>
                </div>
                <div class="ml-3">
                  <div class="text-sm font-medium text-gray-900">{{ agent.name }}</div>
                  <div v-if="agent.rank && agent.rank <= 3" class="flex items-center gap-1">
                    <span v-if="agent.rank === 1" class="text-yellow-500">🥇</span>
                    <span v-if="agent.rank === 2" class="text-gray-400">🥈</span>
                    <span v-if="agent.rank === 3" class="text-orange-600">🥉</span>
                    <span class="text-xs text-gray-500">{{ getOrdinal(agent.rank) }} Place</span>
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 align-middle">
              {{ agent.assigned.toLocaleString() }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap align-middle">
              <div class="flex flex-col">
                <span class="text-sm text-gray-900 font-medium">{{ agent.resolved.toLocaleString() }}</span>
                <span class="text-xs text-gray-500">({{ getResolutionRate(agent) }}%)</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 align-middle">
              {{ formatResolutionTime(agent.resolutionTime) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap align-middle">
              <span :class="getFcrRateClass(agent.fcrRate)" class="text-sm font-medium">
                {{ agent.fcrRate.toFixed(1) }}%
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap align-middle">
              <div class="flex items-center gap-1">
                <span :class="getCsatClass(agent.csatRating)" class="text-sm font-medium">
                  {{ agent.csatRating.toFixed(1) }}
                </span>
                <span class="text-xs text-gray-400">/5</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AgentPerformanceTable',
  props: {
    title: {
      type: String,
      default: 'Agent Performance Leaderboard'
    },
    agentData: {
      type: Array,
      required: true
    },
    showSummary: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      sortColumn: 'rank', // Default sort by rank
      sortOrder: 'asc'
    }
  },
  computed: {
    sortedAgents() {
      const agents = [...this.agentData].map(agent => ({
        ...agent,
        rank: this.calculateRank(agent)
      }))

      return agents.sort((a, b) => {
        let aValue = a[this.sortColumn]
        let bValue = b[this.sortColumn]

        // Handle special cases for different column types
        if (this.sortColumn === 'name') {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }

        let comparison = 0
        if (aValue < bValue) comparison = -1
        if (aValue > bValue) comparison = 1

        return this.sortOrder === 'asc' ? comparison : -comparison
      })
    }
  },
  methods: {
    sortBy(column) {
      if (this.sortColumn === column) {
        // Toggle sort order if same column
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        // Set new column and default order
        this.sortColumn = column
        this.sortOrder = this.sortColumn === 'name' ? 'asc' : 'desc'
      }
    },

    calculateRank(agent) {
      // Calculate rank based on weighted score
      const score =
        (agent.resolved * 0.3) +
        (agent.csatRating * 0.3) +
        (agent.fcrRate * 0.2) -
        (agent.resolutionTime * 0.2)

      // Simple ranking based on score
      const sorted = [...this.agentData].map(a => ({
        ...a,
        score: (a.resolved * 0.3) + (a.csatRating * 0.3) + (a.fcrRate * 0.2) - (a.resolutionTime * 0.2)
      })).sort((a, b) => b.score - a.score)

      return sorted.findIndex(a => a.id === agent.id) + 1
    },

    getInitials(name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    },

    getOrdinal(rank) {
      const suffixes = ['th', 'st', 'nd', 'rd']
      const v = rank % 100
      return rank + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0])
    },

    getResolutionRate(agent) {
      return agent.assigned > 0 ? ((agent.resolved / agent.assigned) * 100).toFixed(1) : 0
    },

    formatResolutionTime(minutes) {
      if (minutes < 60) {
        return `${Math.round(minutes)}m`
      } else if (minutes < 1440) {
        const hours = Math.floor(minutes / 60)
        const mins = Math.round(minutes % 60)
        return `${hours}h ${mins}m`
      } else {
        const days = Math.floor(minutes / 1440)
        const hours = Math.floor((minutes % 1440) / 60)
        return `${days}d ${hours}h`
      }
    },

    getFcrRateClass(rate) {
      if (rate >= 80) return 'text-green-600'
      if (rate >= 60) return 'text-yellow-600'
      return 'text-red-600'
    },

    getCsatClass(rating) {
      if (rating >= 4.5) return 'text-green-600'
      if (rating >= 3.5) return 'text-yellow-600'
      return 'text-red-600'
    },

    getTotals() {
      if (this.agentData.length === 0) {
        return {
          totalAgents: 0,
          totalAssigned: 0,
          totalResolved: 0,
          overallResolutionRate: 0,
          avgResolutionTime: 0,
          avgFcrRate: 0,
          avgCsat: 0
        }
      }

      const totalAgents = this.agentData.length
      const totalAssigned = this.agentData.reduce((sum, agent) => sum + agent.assigned, 0)
      const totalResolved = this.agentData.reduce((sum, agent) => sum + agent.resolved, 0)
      const overallResolutionRate = totalAssigned > 0 ? ((totalResolved / totalAssigned) * 100).toFixed(1) : 0
      const avgResolutionTime = this.agentData.reduce((sum, agent) => sum + agent.resolutionTime, 0) / totalAgents
      const avgFcrRate = this.agentData.reduce((sum, agent) => sum + agent.fcrRate, 0) / totalAgents
      const avgCsat = this.agentData.reduce((sum, agent) => sum + agent.csatRating, 0) / totalAgents

      return {
        totalAgents,
        totalAssigned,
        totalResolved,
        overallResolutionRate,
        avgResolutionTime,
        avgFcrRate,
        avgCsat
      }
    }
  }
}
</script>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
}
</style>