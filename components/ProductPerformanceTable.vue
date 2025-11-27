<template>
  <div class="bg-white rounded-lg shadow border border-gray-200">
    <div class="flex items-center justify-between p-6 border-b border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 text-left">
              <div
                class="flex items-center gap-1 text-xs font-medium text-gray-700 cursor-pointer hover:text-gray-900"
                @click="sortBy('category')"
              >
                Product Category
                <svg
                  class="w-4 h-4"
                  :class="{'rotate-180': sortColumn === 'category' && sortOrder === 'desc'}"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                </svg>
              </div>
            </th>
            <th class="px-6 py-3 text-left">
              <div
                class="flex items-center gap-1 text-xs font-medium text-gray-700 cursor-pointer hover:text-gray-900"
                @click="sortBy('volume')"
              >
                Volume
                <svg
                  class="w-4 h-4"
                  :class="{'rotate-180': sortColumn === 'volume' && sortOrder === 'desc'}"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                </svg>
              </div>
            </th>
            <th class="px-6 py-3 text-left">
              <div
                class="flex items-center gap-1 text-xs font-medium text-gray-700 cursor-pointer hover:text-gray-900"
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
            <th class="px-6 py-3 text-left">
              <div
                class="flex items-center gap-1 text-xs font-medium text-gray-700 cursor-pointer hover:text-gray-900"
                @click="sortBy('csat')"
              >
                Avg CSAT
                <svg
                  class="w-4 h-4"
                  :class="{'rotate-180': sortColumn === 'csat' && sortOrder === 'desc'}"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                </svg>
              </div>
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700">
              Trending
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="product in sortedProducts" :key="product.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div>
                <div class="text-sm font-medium text-gray-900">{{ product.category }}</div>
                <div class="text-xs text-gray-500">{{ product.description }}</div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-900">{{ product.volume.toLocaleString() }}</span>
                <span
                  class="text-xs px-1.5 py-0.5 rounded-full font-medium"
                  :class="getVolumeTrendClass(product.volumeTrend)"
                >
                  {{ getVolumeTrendText(product.volumeTrend) }}
                </span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-900">{{ formatResolutionTime(product.resolutionTime) }}</span>
                <span
                  class="text-xs px-1.5 py-0.5 rounded-full font-medium"
                  :class="getResolutionTimeTrendClass(product.resolutionTimeTrend)"
                >
                  {{ getResolutionTimeTrendText(product.resolutionTimeTrend) }}
                </span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-2">
                <span
                  class="text-sm font-medium"
                  :class="getCsatClass(product.csat)"
                >
                  {{ product.csat.toFixed(1) }}
                </span>
                <span class="text-xs text-gray-400">/5</span>
                <span
                  class="text-xs px-1.5 py-0.5 rounded-full font-medium"
                  :class="getCsatTrendClass(product.csatTrend)"
                >
                  {{ getCsatTrendText(product.csatTrend) }}
                </span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-1">
                <!-- Overall trend indicator -->
                <div class="flex items-center gap-1">
                  <span
                    class="text-sm font-medium px-2 py-1 rounded"
                    :class="getOverallTrendClass(product)"
                  >
                    {{ getOverallTrendText(product) }}
                  </span>
                </div>
                <!-- Sparkline trend visualization -->
                <div class="flex items-center gap-1">
                  <div
                    v-for="(point, index) in product.sparkline"
                    :key="index"
                    class="w-1 h-4 rounded"
                    :class="getSparklineColor(product, index)"
                    :style="{ height: getSparklineHeight(product, index) + 'px' }"
                  ></div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Summary Stats -->
    <!-- <div v-if="showSummary" class="p-6 border-t border-gray-200 bg-gray-50">
      <div class="grid grid-cols-4 gap-4 text-center">
        <div>
          <div class="text-2xl font-bold text-gray-900">{{ getSummaryStats().totalVolume.toLocaleString() }}</div>
          <div class="text-xs text-gray-500">Total Volume</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-blue-600">{{ formatResolutionTime(getSummaryStats().avgResolutionTime) }}</div>
          <div class="text-xs text-gray-500">Avg Resolution Time</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-green-600">{{ getSummaryStats().avgCsat.toFixed(1) }}</div>
          <div class="text-xs text-gray-500">Avg CSAT</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-purple-600">{{ getSummaryStats().topCategory }}</div>
          <div class="text-xs text-gray-500">Top Category</div>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script>
export default {
  name: 'ProductPerformanceTable',
  props: {
    title: {
      type: String,
      default: 'Product Performance Breakdown'
    },
    productData: {
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
      sortColumn: 'volume', // Default sort by volume
      sortOrder: 'desc'
    }
  },
  computed: {
    sortedProducts() {
      const products = [...this.productData]

      return products.sort((a, b) => {
        let aValue = a[this.sortColumn]
        let bValue = b[this.sortColumn]

        // Handle special cases for different column types
        if (this.sortColumn === 'category') {
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
        this.sortOrder = this.sortColumn === 'category' ? 'asc' : 'desc'
      }
    },

    
    formatResolutionTime(minutes) {
      if (minutes < 60) {
        return `${Math.round(minutes)}m`
      } else {
        const hours = Math.floor(minutes / 60)
        const mins = Math.round(minutes % 60)
        return `${hours}h ${mins}m`
      }
    },

    getVolumeTrendClass(trend) {
      if (trend > 5) return 'bg-green-100 text-green-700'
      if (trend > 0) return 'bg-green-50 text-green-600'
      if (trend < -5) return 'bg-red-100 text-red-700'
      if (trend < 0) return 'bg-red-50 text-red-600'
      return 'bg-gray-100 text-gray-600'
    },

    getVolumeTrendText(trend) {
      return trend > 0 ? `+${trend}%` : `${trend}%`
    },

    getResolutionTimeTrendClass(trend) {
      if (trend < -5) return 'bg-green-100 text-green-700' // Decrease in time is good
      if (trend < 0) return 'bg-green-50 text-green-600'
      if (trend > 5) return 'bg-red-100 text-red-700' // Increase in time is bad
      if (trend > 0) return 'bg-red-50 text-red-600'
      return 'bg-gray-100 text-gray-600'
    },

    getResolutionTimeTrendText(trend) {
      return trend > 0 ? `+${trend}%` : `${trend}%`
    },

    getCsatClass(csat) {
      if (csat >= 4.5) return 'text-green-600'
      if (csat >= 3.5) return 'text-yellow-600'
      return 'text-red-600'
    },

    getCsatTrendClass(trend) {
      if (trend > 0.1) return 'bg-green-100 text-green-700'
      if (trend > 0) return 'bg-green-50 text-green-600'
      if (trend < -0.1) return 'bg-red-100 text-red-700'
      if (trend < 0) return 'bg-red-50 text-red-600'
      return 'bg-gray-100 text-gray-600'
    },

    getCsatTrendText(trend) {
      return trend > 0 ? `+${trend.toFixed(1)}` : `${trend.toFixed(1)}`
    },

    getOverallTrendClass(product) {
      // Calculate overall trend based on multiple factors
      const volumeGood = product.volumeTrend > 0
      const resolutionGood = product.resolutionTimeTrend < 0
      const csatGood = product.csatTrend > 0

      const goodFactors = [volumeGood, resolutionGood, csatGood].filter(Boolean).length

      if (goodFactors >= 2) return 'bg-green-100 text-green-700'
      if (goodFactors >= 1) return 'bg-yellow-100 text-yellow-700'
      return 'bg-red-100 text-red-700'
    },

    getOverallTrendText(product) {
      const volumeGood = product.volumeTrend > 0
      const resolutionGood = product.resolutionTimeTrend < 0
      const csatGood = product.csatTrend > 0

      const goodFactors = [volumeGood, resolutionGood, csatGood].filter(Boolean).length

      if (goodFactors >= 2) return '📈 Strong'
      if (goodFactors >= 1) return '➡️ Stable'
      return '📉 Declining'
    },

    getSparklineHeight(product, index) {
      const max = Math.max(...product.sparkline)
      const min = Math.min(...product.sparkline)
      const range = max - min || 1
      return ((product.sparkline[index] - min) / range) * 16 + 4 // Height between 4-20px
    },

    getSparklineColor(product, index) {
      const value = product.sparkline[index]
      const avg = product.sparkline.reduce((a, b) => a + b, 0) / product.sparkline.length

      // Color based on whether it's above or below average
      if (value > avg * 1.1) return 'bg-green-400'
      if (value < avg * 0.9) return 'bg-red-400'
      return 'bg-blue-400'
    },

    getSummaryStats() {
      if (this.productData.length === 0) {
        return {
          totalVolume: 0,
          avgResolutionTime: 0,
          avgCsat: 0,
          topCategory: 'N/A'
        }
      }

      const totalVolume = this.productData.reduce((sum, product) => sum + product.volume, 0)
      const avgResolutionTime = this.productData.reduce((sum, product) => sum + product.resolutionTime, 0) / this.productData.length
      const avgCsat = this.productData.reduce((sum, product) => sum + product.csat, 0) / this.productData.length
      const topProduct = this.productData.reduce((max, product) => product.volume > max.volume ? product : max, this.productData[0])

      return {
        totalVolume,
        avgResolutionTime,
        avgCsat,
        topCategory: topProduct.category
      }
    }
  }
}
</script>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
}

/* Sparkline animation */
.h-4 {
  height: 1rem;
}

.h-1 {
  width: 0.25rem;
  transition: all 0.2s ease;
}
</style>