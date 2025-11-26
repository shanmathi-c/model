<template>
  <div class="h-full bg-gray-50 flex flex-col">
    <!-- Fixed Header Section - Sticky -->
    <div class="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-2 shadow-sm">
      <!-- Header Title -->
      <div class="mb-2">
        <h1 class="text-xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p class="text-gray-600 mt-0.5 text-sm">View and analyze support performance metrics</p>
      </div>

      <!-- Search and Filter Bar -->
      <div class="flex items-center gap-3">
        <!-- Date Range Selector -->
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">Date Range:</label>
          <select
            v-model="analyticsFilters.dateRange"
            @change="applyFilters"
            class="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        <!-- Custom Date Range Picker (shown when 'custom' is selected) -->
        <div v-if="analyticsFilters.dateRange === 'custom'" class="flex items-center gap-2">
          <input
            type="date"
            v-model="customDateRange.start"
            class="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
          <span class="text-gray-500">to</span>
          <input
            type="date"
            v-model="customDateRange.end"
            class="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
          <button
            @click="applyCustomDateRange"
            class="ml-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Apply
          </button>
        </div>

        <!-- Filter Button -->
        <div ref="filterDropdownRef" class="relative">
          <button
            @click="toggleFilterDropdown"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            :class="{ 'bg-blue-50 border-blue-500': hasActiveFilters }"
          >
            <svg class="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
          </button>

          <!-- Filter Dropdown -->
          <div
            v-if="showFilterDropdown"
            class="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200"
            style="z-index: 50;"
          >
            <div class="p-3">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-sm font-semibold text-gray-900">Filters</h3>
                <div class="flex gap-1">
                  <button
                    @click="selectAllFilters"
                    class="text-xs text-blue-600 hover:text-blue-700 px-1 py-0.5 rounded hover:bg-blue-50"
                  >
                    All
                  </button>
                  <button
                    @click="clearAllFilters"
                    class="text-xs text-blue-600 hover:text-blue-700 px-1 py-0.5 rounded hover:bg-blue-50"
                  >
                    None
                  </button>
                </div>
              </div>

              <!-- Agents -->
              <div class="mb-3">
                <label class="text-xs font-semibold text-gray-700 block mb-1">Agents</label>
                <div class="space-y-1 max-h-24 overflow-y-auto">
                  <label
                    v-for="agent in agentOptions"
                    :key="agent.value"
                    class="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 p-1 rounded text-xs"
                  >
                    <input
                      type="checkbox"
                      :value="agent.value"
                      v-model="analyticsFilters.agents"
                      @change="applyFilters"
                      class="w-3 h-3 text-blue-600 rounded border-gray-300"
                    />
                    <span>{{ agent.label }}</span>
                  </label>
                </div>
              </div>

              <!-- Products -->
              <div class="mb-3">
                <label class="text-xs font-semibold text-gray-700 block mb-1">Products</label>
                <div class="space-y-1 max-h-24 overflow-y-auto">
                  <label
                    v-for="product in productOptions"
                    :key="product.value"
                    class="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 p-1 rounded text-xs"
                  >
                    <input
                      type="checkbox"
                      :value="product.value"
                      v-model="analyticsFilters.products"
                      @change="applyFilters"
                      class="w-3 h-3 text-blue-600 rounded border-gray-300"
                    />
                    <span>{{ product.label }}</span>
                  </label>
                </div>
              </div>

              <!-- Status -->
              <div>
                <label class="text-xs font-semibold text-gray-700 block mb-1">Status</label>
                <div class="space-y-1 max-h-24 overflow-y-auto">
                  <label
                    v-for="status in statusOptions"
                    :key="status.value"
                    class="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 p-1 rounded text-xs"
                  >
                    <input
                      type="checkbox"
                      :value="status.value"
                      v-model="analyticsFilters.status"
                      @change="applyFilters"
                      class="w-3 h-3 text-blue-600 rounded border-gray-300"
                    />
                    <span>{{ status.label }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Filter Chips (Below search bar) -->
      <div v-if="hasActiveFilters" class="flex gap-1.5 flex-wrap items-center mt-2">
        <span
          v-for="chip in activeFilterChips"
          :key="chip.key"
          class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full border border-blue-200 shadow-sm"
        >
          {{ chip.label }}
          <button
            @click.stop="removeFilter(chip.key)"
            class="hover:text-blue-900 hover:bg-blue-200 rounded-full w-4 h-4 flex items-center justify-center transition-colors"
          >
            ×
          </button>
        </span>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 overflow-auto p-6">
      <!-- Summary Cards -->
      <div class="grid grid-cols-5 gap-1 mb-6">
        <!-- Total Tickets -->
        <div class="bg-white rounded shadow-sm border border-gray-200 min-w-0 flex flex-col items-stretch">
          <div class="flex flex-col items-center text-center p-1 h-full">
            <div class="p-0.5 bg-blue-100 rounded mb-0.5 flex-shrink-0">
              <svg class="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p class="text-sm font-semibold text-gray-900 truncate w-full">
              {{ metrics.isLoading ? '...' : formatNumber(metrics.totalTickets) }}
            </p>
            <p class="text-xs text-gray-500 text-center leading-tight truncate w-full" style="font-size: 10px;">Total Tickets</p>
          </div>
        </div>

        <!-- Avg Resolution Time -->
        <div class="bg-white rounded shadow-sm border border-gray-200 min-w-0 flex flex-col items-stretch">
          <div class="flex flex-col items-center text-center p-1 h-full">
            <div class="p-0.5 bg-yellow-100 rounded mb-0.5 flex-shrink-0">
              <svg class="w-3 h-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="text-sm font-semibold text-gray-900 truncate w-full">
              {{ metrics.isLoading ? '...' : formatResolutionTime(metrics.avgResolutionTimeMinutes) }}
            </p>
            <p class="text-xs text-gray-500 text-center leading-tight truncate w-full" style="font-size: 10px;">Avg Resolution Time</p>
          </div>
        </div>

        <!-- First Call Resolution Rate -->
        <div class="bg-white rounded shadow-sm border border-gray-200 min-w-0 flex flex-col items-stretch">
          <div class="flex flex-col items-center text-center p-1 h-full">
            <div class="p-0.5 bg-green-100 rounded mb-0.5 flex-shrink-0">
              <svg class="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="text-sm font-semibold text-gray-900 truncate w-full">
              {{ metrics.isLoading ? '...' : `${metrics.fcrRate}%(${formatNumber(metrics.fcrCount)})` }}
            </p>
            <p class="text-xs text-gray-500 text-center leading-tight truncate w-full" style="font-size: 10px;">First-Call-Resolution Rate (%)</p>
          </div>
        </div>

        <!-- Avg Customer Satisfaction -->
        <div class="bg-white rounded shadow-sm border border-gray-200 min-w-0 flex flex-col items-stretch">
          <div class="flex flex-col items-center text-center p-1 h-full">
            <div class="p-0.5 bg-purple-100 rounded mb-0.5 flex-shrink-0">
              <svg class="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            </div>
            <p class="text-sm font-semibold text-gray-900 truncate w-full">
              {{ metrics.isLoading ? '...' : `${metrics.csatScore}/5(${formatNumber(metrics.csatCount)})` }}
            </p>
            <p class="text-xs text-gray-500 text-center leading-tight truncate w-full" style="font-size: 10px;">Avg Customer Satisfaction (star rating)</p>
          </div>
        </div>

        <!-- Callback Completion Rate -->
        <div class="bg-white rounded shadow-sm border border-gray-200 min-w-0 flex flex-col items-stretch">
          <div class="flex flex-col items-center text-center p-1 h-full">
            <div class="p-0.5 bg-orange-100 rounded mb-0.5 flex-shrink-0">
              <svg class="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <p class="text-sm font-semibold text-gray-900 truncate w-full">
              {{ metrics.isLoading ? '...' : `${metrics.callbackCompletionRate}%(${formatNumber(metrics.callbackCount)})` }}
            </p>
            <p class="text-xs text-gray-500 text-center leading-tight truncate w-full" style="font-size: 10px;">Callback Completion Rate (%)</p>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <!-- Line Chart Section -->
      <div class="mb-6">
        <!-- Tickets Created vs Resolved Over Time -->
        <LineChart
          title="Tickets Created vs Resolved Over Time"
          :created-data="ticketTrends.created"
          :resolved-data="ticketTrends.resolved"
          :x-labels="ticketTrends.labels"
          :period="ticketTrendsPeriod"
          @period-change="updateTicketTrendsPeriod"
        />
      </div>

      <!-- Resolution Time Distribution Chart Section -->
      <div class="mb-6">
        <!-- Resolution Time Distribution -->
        <TimeDistributionChart
          title="Resolution Time Distribution"
          :time-data="timeDistributionData"
          :period="timeDistributionPeriod"
          :show-summary="false"
          @period-change="updateTimeDistributionPeriod"
          @tooltip-show="onTooltipShow"
          @tooltip-hide="onTooltipHide"
        />
      </div>

      <!-- Customer Satisfaction Chart Section -->
      <div class="mb-6">
        <!-- Customer Satisfaction Distribution -->
        <CustomerSatisfactionChart
          :key="customerSatisfactionDataKey"
          title="Customer Satisfaction Distribution"
          :csat-data="customerSatisfactionData"
          :period="customerSatisfactionPeriod"
          :show-summary="false"
          @period-change="updateCustomerSatisfactionPeriod"
        />
      </div>

      <!-- Agent Performance Table Section -->
      <div class="mb-6">
        <!-- Agent Performance Leaderboard -->
        <AgentPerformanceTable
          title="Agent Performance Leaderboard"
          :agent-data="agentPerformanceData"
          :period="agentPerformancePeriod"
          @period-change="updateAgentPerformancePeriod"
        />
      </div>

      <!-- Call Statistics Chart Section -->
      <div class="mb-6">
        <!-- Call Statistics -->
        <CallStatisticsChart
          title="Call Statistics"
          :call-data="callStatisticsData"
          :period="callStatisticsPeriod"
          @period-change="updateCallStatisticsPeriod"
        />
      </div>

      <!-- Product Performance Table Section -->
      <div class="mb-6">
        <!-- Product Performance Breakdown -->
        <ProductPerformanceTable
          title="Product Performance Breakdown"
          :product-data="productPerformanceData"
          :period="productPerformancePeriod"
          @period-change="updateProductPerformancePeriod"
        />
      </div>

      <!-- Callback Status Chart Section -->
      <div class="mb-6">
        <!-- Callback Status -->
        <CallbackStatusChart
          title="Callback Status"
          :callback-data="callbackStatusData"
          :period="callbackStatusPeriod"
          @period-change="updateCallbackStatusPeriod"
        />
      </div>
    </div>
  </div>
</template>

<script>
import LineChart from '~/components/LineChart.vue'
import TimeDistributionChart from '~/components/TimeDistributionChart.vue'
import CustomerSatisfactionChart from '~/components/CustomerSatisfactionChart.vue'
import AgentPerformanceTable from '~/components/AgentPerformanceTable.vue'
import CallStatisticsChart from '~/components/CallStatisticsChart.vue'
import ProductPerformanceTable from '~/components/ProductPerformanceTable.vue'
import CallbackStatusChart from '~/components/CallbackStatusChart.vue'

export default {
  name: 'AnalyticsPage',
  components: {
    LineChart,
    TimeDistributionChart,
    CustomerSatisfactionChart,
    AgentPerformanceTable,
    CallStatisticsChart,
    ProductPerformanceTable,
    CallbackStatusChart
  },

  data() {
    return {
          // Filter dropdown state
      showFilterDropdown: false,

      // Analytics filters
      analyticsFilters: {
        dateRange: '30',
        agents: [],
        products: [],
        status: []
      },

      // Custom date range
      customDateRange: {
        start: this.getDateDaysAgo(30),
        end: this.getDateDaysAgo(0)
      },

      // Filter options
      agentOptions: [
        { value: 'john_doe', label: 'John Doe' },
        { value: 'jane_smith', label: 'Jane Smith' },
        { value: 'mike_wilson', label: 'Mike Wilson' },
        { value: 'sarah_jones', label: 'Sarah Jones' },
        { value: 'alex_brown', label: 'Alex Brown' }
      ],
      productOptions: [
        { value: 'software', label: 'Software' },
        { value: 'hardware', label: 'Hardware' },
        { value: 'services', label: 'Services' },
        { value: 'subscription', label: 'Subscription' }
      ],
      statusOptions: [
        { value: 'open', label: 'Open' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'pending', label: 'Pending' },
        { value: 'resolved', label: 'Resolved' },
        { value: 'closed', label: 'Closed' }
      ],
      metrics: {
        totalTickets: 0,
        ticketsChange: 0,
        avgResolutionTimeMinutes: 0,
        fcrRate: 0,
        fcrCount: 0,
        fcrChange: 0,
        avgResponseTime: 0,
        responseTimeChange: 0,
        csatScore: 0,
        csatCount: 0,
        csatChange: 0,
        callbackCompletionRate: 0,
        callbackCount: 0,
        isLoading: true
      },
      ticketTrendsPeriod: '30',
      // Chart data
      ticketTrends: {
        created: [45, 52, 38, 65, 48, 59, 67, 72, 58, 81, 69, 74, 62, 88, 76, 92, 85, 98, 103, 95, 108, 112, 105, 118, 125, 119, 132, 128, 135, 142],
        resolved: [42, 48, 45, 58, 52, 61, 63, 68, 65, 74, 71, 78, 75, 82, 79, 85, 88, 91, 95, 98, 102, 105, 108, 112, 115, 118, 122, 125, 128, 130],
        labels: this.generateDateLabels(30)
      },
      timeDistributionPeriod: '30',
      timeDistributionData: [
        {
          timeRange: '< 1 hour',
          total: 0,
          agents: [{ name: 'Tickets', count: 0 }]
        },
        {
          timeRange: '1-4 hours',
          total: 0,
          agents: [{ name: 'Tickets', count: 0 }]
        },
        {
          timeRange: '4-24 hours',
          total: 0,
          agents: [{ name: 'Tickets', count: 0 }]
        },
        {
          timeRange: '> 24 hours',
          total: 0,
          agents: [{ name: 'Tickets', count: 0 }]
        }
      ],
      customerSatisfactionPeriod: '30',
      customerSatisfactionData: {
        5: 0,  // Very Satisfied
        4: 0,  // Satisfied
        3: 0,  // Neutral
        2: 0,  // Dissatisfied
        1: 0   // Very Dissatisfied
      },
      customerSatisfactionDataKey: 0,
      agentPerformancePeriod: '30',
      agentPerformanceData: [],
      callStatisticsPeriod: '30',
      callStatisticsData: {
        inbound: 0,      // Total inbound calls
        outbound: 0,     // Total outbound calls
        completed: 0,    // Total completed calls
        missed: 0,        // Total missed calls
        callbacks: 0,     // Total callbacks made
        avgDuration: 0   // Average call duration in minutes
      },
      productPerformancePeriod: '30',
      productPerformanceData: [],
      callbackStatusPeriod: '30',
      callbackStatusData: {
        pending: 0,         // Pending callbacks
        missed: 0,          // Missed callbacks
        successful: 0,     // Successful callbacks
        total: 0,          // Total callbacks
        priorityCallbacks: 0, // High priority pending
        successRate: 0,   // Success rate percentage
        completionRate: 0, // Completion rate percentage
        escalationRate: 0,  // Escalation rate percentage
        avgResponseTime: 18.5 // Average response time in minutes
      }
    };
  },

  computed: {
    // Check if any filters are active
    hasActiveFilters() {
      return this.analyticsFilters.agents.length > 0 ||
             this.analyticsFilters.products.length > 0 ||
             this.analyticsFilters.status.length > 0 ||
             this.analyticsFilters.dateRange !== '30'
    },

    // Generate active filter chips for display
    activeFilterChips() {
      const chips = []

      // Date range chip
      if (this.analyticsFilters.dateRange !== '30') {
        const dateRangeOption = [
          { value: '7', label: 'Last 7 days' },
          { value: '30', label: 'Last 30 days' },
          { value: '90', label: 'Last 90 days' }
        ]
        const option = dateRangeOption.find(d => d.value === this.analyticsFilters.dateRange)
        if (option) {
          chips.push({
            key: `dateRange-${this.analyticsFilters.dateRange}`,
            label: `Date: ${option.label}`,
            type: 'dateRange',
            value: this.analyticsFilters.dateRange
          })
        }
      }

      // Agent chips
      this.analyticsFilters.agents.forEach(agent => {
        const agentOption = this.agentOptions.find(a => a.value === agent)
        if (agentOption) {
          chips.push({
            key: `agent-${agent}`,
            label: agentOption.label,
            type: 'agent',
            value: agent
          })
        }
      })

      // Product chips
      this.analyticsFilters.products.forEach(product => {
        const productOption = this.productOptions.find(p => p.value === product)
        if (productOption) {
          chips.push({
            key: `product-${product}`,
            label: productOption.label,
            type: 'product',
            value: product
          })
        }
      })

      // Status chips
      this.analyticsFilters.status.forEach(status => {
        const statusOption = this.statusOptions.find(s => s.value === status)
        if (statusOption) {
          chips.push({
            key: `status-${status}`,
            label: statusOption.label,
            type: 'status',
            value: status
          })
        }
      })

      return chips
    }
  },

  methods: {
    // Helper method to format numbers with commas
    formatNumber(num) {
      if (num === null || num === undefined || isNaN(num)) return '0';
      return Math.round(num).toLocaleString();
    },

    // Helper method to format resolution time
    formatResolutionTime(minutes) {
      if (minutes === null || minutes === undefined || isNaN(minutes)) return '0m';

      if (minutes < 60) {
        return `${Math.round(minutes)}m`;
      } else {
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return `${hours}h ${mins}m`;
      }
    },

    getDateDaysAgo(days) {
      const date = new Date();
      date.setDate(date.getDate() - days);
      return date.toISOString().split('T')[0];
    },

    generateDateLabels(days) {
      const labels = [];
      const today = new Date();

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        if (days <= 7) {
          // For 7 days, show day names
          labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        } else {
          // For longer periods, show month/day
          labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
      }

      return labels;
    },

    updateTicketTrendsPeriod(period) {
      this.ticketTrendsPeriod = period;
      // Fetch real data from backend
      this.fetchTicketTrends(period);
    },

    updateTimeDistributionPeriod(period) {
      this.timeDistributionPeriod = period;
      // Fetch real data from backend
      this.fetchResolutionTimeDistribution(period);
    },

    updateCustomerSatisfactionPeriod(period) {
      this.customerSatisfactionPeriod = period;
      // Fetch real data from backend
      this.fetchCustomerSatisfactionDistribution(period);
    },

    updateAgentPerformancePeriod(period) {
      this.agentPerformancePeriod = period;
      // Fetch real data from backend
      this.fetchAgentPerformance(period);
    },

  updateCallStatisticsPeriod(period) {
      this.callStatisticsPeriod = period;
      // Fetch real data from backend
      this.fetchCallStatistics(period);
    },

    updateProductPerformancePeriod(period) {
      this.productPerformancePeriod = period;
      // Fetch real data from backend
      this.fetchProductPerformance(period);
    },

    updateCallbackStatusPeriod(period) {
      this.callbackStatusPeriod = period;
      // Fetch real data from backend
      this.fetchCallbackStatus(period);
    },

    calculateAverageRating() {
      const data = this.customerSatisfactionData;
      let weightedSum = 0;
      let total = 0;

      for (const [rating, count] of Object.entries(data)) {
        weightedSum += parseInt(rating) * count;
        total += count;
      }

      return total > 0 ? (weightedSum / total).toFixed(1) : '0.0';
    },

    // Tooltip event handlers
    onTooltipShow(data) {
      console.log('Tooltip show:', data);
      // You can add custom tooltip handling here if needed
    },

    onTooltipHide() {
      console.log('Tooltip hide');
      // You can add custom tooltip hiding here if needed
    },

  
    generateRandomData(count, min, max) {
      const data = [];
      for (let i = 0; i < count; i++) {
        data.push(Math.floor(Math.random() * (max - min + 1)) + min);
      }
      return data;
    },

    // Toggle filter dropdown
    toggleFilterDropdown() {
      this.showFilterDropdown = !this.showFilterDropdown
    },

    // Select all filters
    selectAllFilters() {
      this.analyticsFilters.agents = this.agentOptions.map(a => a.value)
      this.analyticsFilters.products = this.productOptions.map(p => p.value)
      this.analyticsFilters.status = this.statusOptions.map(s => s.value)
      this.applyFilters()
    },

    // Clear all filters
    clearAllFilters() {
      this.analyticsFilters.agents = []
      this.analyticsFilters.products = []
      this.analyticsFilters.status = []
      this.analyticsFilters.dateRange = '30'
      this.applyFilters()
    },

    // Remove individual filter
    removeFilter(key) {
      const [type, value] = key.split('-')

      if (type === 'dateRange') {
        this.analyticsFilters.dateRange = '30'
      } else if (type === 'agent') {
        this.analyticsFilters.agents = this.analyticsFilters.agents.filter(a => a !== value)
      } else if (type === 'product') {
        this.analyticsFilters.products = this.analyticsFilters.products.filter(p => p !== value)
      } else if (type === 'status') {
        this.analyticsFilters.status = this.analyticsFilters.status.filter(s => s !== value)
      }

      this.applyFilters()
    },

    // Apply custom date range
    applyCustomDateRange() {
      console.log('Applying custom date range:', this.customDateRange)
      // Update analytics filters with custom range
      this.applyFilters()
    },

    // Apply filters and update analytics data
    applyFilters() {
      console.log('Applying analytics filters:', this.analyticsFilters)

      // Update ticket trends based on date range
      if (this.analyticsFilters.dateRange !== this.ticketTrendsPeriod) {
        this.updateTicketTrendsPeriod(this.analyticsFilters.dateRange)
      } else {
        // Refresh with current period if filters changed but period didn't
        this.fetchTicketTrends()
      }

      // Update resolution time distribution
      if (this.analyticsFilters.dateRange !== this.timeDistributionPeriod) {
        this.updateTimeDistributionPeriod(this.analyticsFilters.dateRange)
      } else {
        this.fetchResolutionTimeDistribution()
      }

      // Update customer satisfaction distribution
      if (this.analyticsFilters.dateRange !== this.customerSatisfactionPeriod) {
        this.updateCustomerSatisfactionPeriod(this.analyticsFilters.dateRange)
      } else {
        this.fetchCustomerSatisfactionDistribution()
      }

      // Update agent performance
      if (this.analyticsFilters.dateRange !== this.agentPerformancePeriod) {
        this.updateAgentPerformancePeriod(this.analyticsFilters.dateRange)
      } else {
        this.fetchAgentPerformance()
      }

      // Update call statistics
      if (this.analyticsFilters.dateRange !== this.callStatisticsPeriod) {
        this.updateCallStatisticsPeriod(this.analyticsFilters.dateRange)
      } else {
        this.fetchCallStatistics()
      }

      // Update product performance
      if (this.analyticsFilters.dateRange !== this.productPerformancePeriod) {
        this.updateProductPerformancePeriod(this.analyticsFilters.dateRange)
      } else {
        this.fetchProductPerformance()
      }

      // Update callback status
      if (this.analyticsFilters.dateRange !== this.callbackStatusPeriod) {
        this.updateCallbackStatusPeriod(this.analyticsFilters.dateRange)
      } else {
        this.fetchCallbackStatus()
      }

      // Fetch updated analytics data with filters
      this.fetchAnalyticsData()
    },

    // Close dropdown when clicking outside
    handleClickOutside(event) {
      const filterDropdown = this.$refs.filterDropdownRef
      if (filterDropdown && !filterDropdown.contains(event.target)) {
        this.showFilterDropdown = false
      }
    },

    // Fetch analytics card data from backend
    async fetchAnalyticsData() {
      try {
        this.metrics.isLoading = true;
        console.log('Fetching analytics cards data...');

        // Build query parameters from current filters
        const queryParams = new URLSearchParams();

        // Add date range if not custom
        if (this.analyticsFilters.dateRange !== 'custom') {
          queryParams.append('dateRange', this.analyticsFilters.dateRange);
        }

        // Add agent filters
        if (this.analyticsFilters.agents && this.analyticsFilters.agents.length > 0) {
          this.analyticsFilters.agents.forEach(agent => {
            queryParams.append('agents', agent);
          });
        }

        // Add product filters
        if (this.analyticsFilters.products && this.analyticsFilters.products.length > 0) {
          this.analyticsFilters.products.forEach(product => {
            queryParams.append('products', product);
          });
        }

        // Add status filters
        if (this.analyticsFilters.status && this.analyticsFilters.status.length > 0) {
          this.analyticsFilters.status.forEach(status => {
            queryParams.append('status', status);
          });
        }

        const queryString = queryParams.toString();
        const url = `http://localhost:5001/analytics/cards${queryString ? '?' + queryString : ''}`;

        const response = await $fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response && response.data) {
          // Update metrics with real backend data
          const data = response.data;

          this.metrics.totalTickets = data.totalTickets || 0;
          this.metrics.avgResolutionTimeMinutes = data.avgResolutionTime?.minutes || 0;
          this.metrics.fcrRate = data.firstCallResolution?.rate || 0;
          this.metrics.fcrCount = data.firstCallResolution?.fcr || 0;
          this.metrics.csatScore = data.avgCustomerSatisfaction?.score || 0;
          this.metrics.csatCount = data.avgCustomerSatisfaction?.totalRatings || 0;
          this.metrics.callbackCompletionRate = data.callbackCompletionRate?.rate || 0;
          this.metrics.callbackCount = data.callbackCompletionRate?.completed || 0;

          // Calculate placeholder change percentages for now
          // In a real implementation, you might want these from the backend as well
          this.metrics.ticketsChange = 5.2;
          this.metrics.fcrChange = 2.3;
          this.metrics.responseTimeChange = -3.1;
          this.metrics.csatChange = 1.8;

          console.log('Analytics cards data updated:', {
            totalTickets: this.metrics.totalTickets,
            avgResolutionTime: this.metrics.avgResolutionTimeMinutes,
            fcrRate: this.metrics.fcrRate,
            fcrCount: this.metrics.fcrCount,
            csatScore: this.metrics.csatScore,
            csatCount: this.metrics.csatCount,
            callbackCompletionRate: this.metrics.callbackCompletionRate,
            callbackCount: this.metrics.callbackCount
          });
        }

        this.metrics.isLoading = false;

      } catch (error) {
        console.error('Error fetching analytics cards data:', error);
        this.metrics.isLoading = false;

        // Set fallback values if API fails
        this.metrics.totalTickets = 0;
        this.metrics.avgResolutionTimeMinutes = 0;
        this.metrics.fcrRate = 0;
        this.metrics.fcrCount = 0;
        this.metrics.csatScore = 0;
        this.metrics.csatCount = 0;
        this.metrics.callbackCompletionRate = 0;
        this.metrics.callbackCount = 0;
      }
    },

    // Fetch ticket trends data for line chart
    async fetchTicketTrends(period = null) {
      try {
        console.log('Fetching ticket trends data...');

        // Use current period if not specified
        const dateRange = period || this.ticketTrendsPeriod;

        // Build query parameters from current filters
        const queryParams = new URLSearchParams();
        queryParams.append('dateRange', dateRange);

        // Add agent filters
        if (this.analyticsFilters.agents && this.analyticsFilters.agents.length > 0) {
          this.analyticsFilters.agents.forEach(agent => {
            queryParams.append('agents', agent);
          });
        }

        // Add product filters
        if (this.analyticsFilters.products && this.analyticsFilters.products.length > 0) {
          this.analyticsFilters.products.forEach(product => {
            queryParams.append('products', product);
          });
        }

        // Add status filters
        if (this.analyticsFilters.status && this.analyticsFilters.status.length > 0) {
          this.analyticsFilters.status.forEach(status => {
            queryParams.append('status', status);
          });
        }

        const queryString = queryParams.toString();
        const url = `http://localhost:5001/analytics/ticket-trends${queryString ? '?' + queryString : ''}`;

        const response = await $fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response && response.data) {
          // Update ticket trends with real data
          this.ticketTrends.labels = response.data.labels;
          this.ticketTrends.created = response.data.created;
          this.ticketTrends.resolved = response.data.resolved;

          console.log('Ticket trends data updated:', {
            labels: this.ticketTrends.labels.length,
            created: this.ticketTrends.created,
            resolved: this.ticketTrends.resolved
          });
        }

      } catch (error) {
        console.error('Error fetching ticket trends data:', error);
        // Keep existing data if API fails
      }
    },

    // Fetch resolution time distribution data
    async fetchResolutionTimeDistribution(period = null) {
      try {
        console.log('Fetching resolution time distribution data...');

        // Use current period if not specified
        const dateRange = period || this.timeDistributionPeriod;

        // Build query parameters from current filters
        const queryParams = new URLSearchParams();
        queryParams.append('dateRange', dateRange);

        // Add agent filters
        if (this.analyticsFilters.agents && this.analyticsFilters.agents.length > 0) {
          this.analyticsFilters.agents.forEach(agent => {
            queryParams.append('agents', agent);
          });
        }

        // Add product filters
        if (this.analyticsFilters.products && this.analyticsFilters.products.length > 0) {
          this.analyticsFilters.products.forEach(product => {
            queryParams.append('products', product);
          });
        }

        // Add status filters
        if (this.analyticsFilters.status && this.analyticsFilters.status.length > 0) {
          this.analyticsFilters.status.forEach(status => {
            queryParams.append('status', status);
          });
        }

        const queryString = queryParams.toString();
        const url = `http://localhost:5001/analytics/resolution-time-distribution${queryString ? '?' + queryString : ''}`;

        const response = await $fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response && response.data) {
          // Transform data into format expected by TimeDistributionChart
          const data = response.data;

          this.timeDistributionData = [
            {
              timeRange: '< 1 hour',
              total: data.under_1_hour || 0,
              agents: [{ name: 'Tickets', count: data.under_1_hour || 0 }]
            },
            {
              timeRange: '1-4 hours',
              total: data['1_to_4_hours'] || 0,
              agents: [{ name: 'Tickets', count: data['1_to_4_hours'] || 0 }]
            },
            {
              timeRange: '4-24 hours',
              total: data['4_to_24_hours'] || 0,
              agents: [{ name: 'Tickets', count: data['4_to_24_hours'] || 0 }]
            },
            {
              timeRange: '> 24 hours',
              total: data.over_24_hours || 0,
              agents: [{ name: 'Tickets', count: data.over_24_hours || 0 }]
            }
          ];

          console.log('Resolution time distribution data updated:', this.timeDistributionData);
        }

      } catch (error) {
        console.error('Error fetching resolution time distribution data:', error);
        // Keep existing data if API fails
      }
    },

    // Fetch customer satisfaction distribution data
    async fetchCustomerSatisfactionDistribution(period = null) {
      try {
        console.log('Fetching customer satisfaction distribution data...');

        // Use current period if not specified
        const dateRange = period || this.customerSatisfactionPeriod;

        // Build query parameters from current filters
        const queryParams = new URLSearchParams();
        queryParams.append('dateRange', dateRange);

        // Add agent filters
        if (this.analyticsFilters.agents && this.analyticsFilters.agents.length > 0) {
          this.analyticsFilters.agents.forEach(agent => {
            queryParams.append('agents', agent);
          });
        }

        // Add product filters
        if (this.analyticsFilters.products && this.analyticsFilters.products.length > 0) {
          this.analyticsFilters.products.forEach(product => {
            queryParams.append('products', product);
          });
        }

        // Add status filters
        if (this.analyticsFilters.status && this.analyticsFilters.status.length > 0) {
          this.analyticsFilters.status.forEach(status => {
            queryParams.append('status', status);
          });
        }

        const queryString = queryParams.toString();
        const url = `http://localhost:5001/analytics/customer-satisfaction-distribution${queryString ? '?' + queryString : ''}`;

        const response = await $fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response && response.data) {
          // Update customer satisfaction data with real data
          // Create new object with numeric keys and values
          const data = response.data;

          this.customerSatisfactionData = {
            1: Number(data['1']) || 0,
            2: Number(data['2']) || 0,
            3: Number(data['3']) || 0,
            4: Number(data['4']) || 0,
            5: Number(data['5']) || 0
          };

          // Force component re-render
          this.customerSatisfactionDataKey++;
        }

      } catch (error) {
        console.error('Error fetching customer satisfaction distribution data:', error);
        // Keep existing data if API fails
      }
    },

    // Fetch agent performance data
    async fetchAgentPerformance(period = null) {
      try {
        console.log('Fetching agent performance data...');

        // Use current period if not specified
        const dateRange = period || this.agentPerformancePeriod;

        // Build query parameters from current filters
        const queryParams = new URLSearchParams();
        queryParams.append('dateRange', dateRange);

        // Add product filters
        if (this.analyticsFilters.products && this.analyticsFilters.products.length > 0) {
          this.analyticsFilters.products.forEach(product => {
            queryParams.append('products', product);
          });
        }

        // Add status filters
        if (this.analyticsFilters.status && this.analyticsFilters.status.length > 0) {
          this.analyticsFilters.status.forEach(status => {
            queryParams.append('status', status);
          });
        }

        const queryString = queryParams.toString();
        const url = `http://localhost:5001/analytics/agent-performance${queryString ? '?' + queryString : ''}`;

        const response = await $fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response && response.data) {
          // Update agent performance data with real data
          this.agentPerformanceData = response.data;

          console.log('Agent performance data updated:', this.agentPerformanceData);
        }

      } catch (error) {
        console.error('Error fetching agent performance data:', error);
        // Keep existing data if API fails
      }
    },

    // Fetch call statistics data
    async fetchCallStatistics(period = null) {
      try {
        console.log('Fetching call statistics data...');

        // Use current period if not specified
        const dateRange = period || this.callStatisticsPeriod;

        // Build query parameters from current filters
        const queryParams = new URLSearchParams();
        queryParams.append('dateRange', dateRange);

        // Add agent filters
        if (this.analyticsFilters.agents && this.analyticsFilters.agents.length > 0) {
          this.analyticsFilters.agents.forEach(agent => {
            queryParams.append('agents', agent);
          });
        }

        // Add product filters
        if (this.analyticsFilters.products && this.analyticsFilters.products.length > 0) {
          this.analyticsFilters.products.forEach(product => {
            queryParams.append('products', product);
          });
        }

        const queryString = queryParams.toString();
        const url = `http://localhost:5001/analytics/call-statistics${queryString ? '?' + queryString : ''}`;

        const response = await $fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response && response.data) {
          // Update call statistics data with real data
          const data = response.data;

          this.callStatisticsData = {
            inbound: data.totalCalls?.inbound || 0,
            outbound: data.totalCalls?.outbound || 0,
            completed: data.callCompletionRate?.completed || 0,
            missed: data.missedCalls?.missed || 0,
            callbacks: data.missedCalls?.missed || 0, // Using missed calls as callbacks for now
            avgDuration: data.avgCallDuration?.minutes || 0
          };

          console.log('Call statistics data updated:', this.callStatisticsData);
        }

      } catch (error) {
        console.error('Error fetching call statistics data:', error);
        // Keep existing data if API fails
      }
    },

    // Fetch product performance data
    async fetchProductPerformance(period = null) {
      try {
        console.log('Fetching product performance data...');

        // Use current period if not specified
        const dateRange = period || this.productPerformancePeriod;

        // Build query parameters from current filters
        const queryParams = new URLSearchParams();
        queryParams.append('dateRange', dateRange);

        // Add agent filters
        if (this.analyticsFilters.agents && this.analyticsFilters.agents.length > 0) {
          this.analyticsFilters.agents.forEach(agent => {
            queryParams.append('agents', agent);
          });
        }

        // Add status filters
        if (this.analyticsFilters.status && this.analyticsFilters.status.length > 0) {
          this.analyticsFilters.status.forEach(status => {
            queryParams.append('status', status);
          });
        }

        const queryString = queryParams.toString();
        const url = `http://localhost:5001/analytics/product-performance${queryString ? '?' + queryString : ''}`;

        const response = await $fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response && response.data) {
          // Update product performance data with real data
          this.productPerformanceData = response.data;

          console.log('Product performance data updated:', this.productPerformanceData);
        }

      } catch (error) {
        console.error('Error fetching product performance data:', error);
        // Keep existing data if API fails
      }
    },

    // Fetch callback status data
    async fetchCallbackStatus(period = null) {
      try {
        console.log('Fetching callback status data...');

        // Use current period if not specified
        const dateRange = period || this.callbackStatusPeriod;

        // Build query parameters from current filters
        const queryParams = new URLSearchParams();
        queryParams.append('dateRange', dateRange);

        // Add agent filters
        if (this.analyticsFilters.agents && this.analyticsFilters.agents.length > 0) {
          this.analyticsFilters.agents.forEach(agent => {
            queryParams.append('agents', agent);
          });
        }

        // Add product filters
        if (this.analyticsFilters.products && this.analyticsFilters.products.length > 0) {
          this.analyticsFilters.products.forEach(product => {
            queryParams.append('products', product);
          });
        }

        const queryString = queryParams.toString();
        const url = `http://localhost:5001/analytics/callback-status${queryString ? '?' + queryString : ''}`;

        const response = await $fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response && response.data) {
          // Update callback status data with real data
          this.callbackStatusData = {
            pending: response.data.pending || 0,
            missed: response.data.missed || 0,
            successful: response.data.successful || 0,
            total: response.data.total || 0,
            successRate: response.data.successRate || 0
          };

          console.log('Callback status data updated:', this.callbackStatusData);
        }

      } catch (error) {
        console.error('Error fetching callback status data:', error);
        // Keep existing data if API fails
      }
    }
  },

  watch: {
    selectedDateRange(newVal) {
      if (newVal !== 'custom') {
        const days = parseInt(newVal);
        this.dateRange = {
          start: this.getDateDaysAgo(days),
          end: this.getDateDaysAgo(0)
        };
        this.applyDateRange();
      }
    }
  },

  mounted() {
    // Fetch initial data from backend
    this.fetchAnalyticsData();
    this.fetchTicketTrends();
    this.fetchResolutionTimeDistribution();
    this.fetchCustomerSatisfactionDistribution();
    this.fetchAgentPerformance();
    this.fetchCallStatistics();
    this.fetchProductPerformance();
    this.fetchCallbackStatus();

    // Add click outside listener for dropdown
    document.addEventListener('click', this.handleClickOutside)
  },

  beforeDestroy() {
    // Clean up click outside listener
    document.removeEventListener('click', this.handleClickOutside)
  }
};
</script>

<style scoped>
/* Add any custom styles here */
</style>
