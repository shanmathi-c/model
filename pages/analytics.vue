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

      <!-- Time Distribution Chart Section -->
      <div class="mb-6">
        <!-- Time Distribution -->
        <TimeDistributionChart
          title="Ticket Distribution by Time"
          :time-data="timeDistributionData"
          :period="timeDistributionPeriod"
          @period-change="updateTimeDistributionPeriod"
          @tooltip-show="onTooltipShow"
          @tooltip-hide="onTooltipHide"
        />
      </div>

      <!-- Customer Satisfaction Chart Section -->
      <div class="mb-6">
        <!-- Customer Satisfaction Distribution -->
        <CustomerSatisfactionChart
          title="Customer Satisfaction Distribution"
          :csat-data="customerSatisfactionData"
          :period="customerSatisfactionPeriod"
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
          timeRange: '00:00-06:00',
          total: 45,
          agents: [
            { name: 'John Doe', count: 12 },
            { name: 'Jane Smith', count: 8 },
            { name: 'Mike Wilson', count: 15 },
            { name: 'Sarah Jones', count: 10 }
          ]
        },
        {
          timeRange: '06:00-12:00',
          total: 156,
          agents: [
            { name: 'John Doe', count: 45 },
            { name: 'Jane Smith', count: 38 },
            { name: 'Mike Wilson', count: 42 },
            { name: 'Sarah Jones', count: 31 }
          ]
        },
        {
          timeRange: '12:00-18:00',
          total: 234,
          agents: [
            { name: 'John Doe', count: 68 },
            { name: 'Jane Smith', count: 52 },
            { name: 'Mike Wilson', count: 61 },
            { name: 'Sarah Jones', count: 53 }
          ]
        },
        {
          timeRange: '18:00-00:00',
          total: 128,
          agents: [
            { name: 'John Doe', count: 35 },
            { name: 'Jane Smith', count: 28 },
            { name: 'Mike Wilson', count: 32 },
            { name: 'Sarah Jones', count: 33 }
          ]
        }
      ],
      customerSatisfactionPeriod: '30',
      customerSatisfactionData: {
        5: 512,  // Very Satisfied
        4: 289,  // Satisfied
        3: 156,  // Neutral
        2: 42,   // Dissatisfied
        1: 18    // Very Dissatisfied
      },
      agentPerformancePeriod: '30',
      agentPerformanceData: [
        {
          id: 1,
          name: 'Sarah Jones',
          assigned: 324,
          resolved: 298,
          resolutionTime: 45, // minutes
          fcrRate: 82.5,
          csatRating: 4.6
        },
        {
          id: 2,
          name: 'John Doe',
          assigned: 298,
          resolved: 265,
          resolutionTime: 52,
          fcrRate: 78.2,
          csatRating: 4.3
        },
        {
          id: 3,
          name: 'Jane Smith',
          assigned: 267,
          resolved: 239,
          resolutionTime: 38,
          fcrRate: 85.1,
          csatRating: 4.7
        },
        {
          id: 4,
          name: 'Mike Wilson',
          assigned: 245,
          resolved: 218,
          resolutionTime: 48,
          fcrRate: 76.8,
          csatRating: 4.1
        },
        {
          id: 5,
          name: 'Alex Brown',
          assigned: 189,
          resolved: 167,
          resolutionTime: 55,
          fcrRate: 74.2,
          csatRating: 4.0
        },
        {
          id: 6,
          name: 'Emily Davis',
          assigned: 156,
          resolved: 143,
          resolutionTime: 42,
          fcrRate: 79.6,
          csatRating: 4.4
        }
      ],
      callStatisticsPeriod: '30',
      callStatisticsData: {
        inbound: 2847,      // Total inbound calls
        outbound: 1653,     // Total outbound calls
        completed: 4186,    // Total completed calls
        missed: 314,        // Total missed calls
        callbacks: 186,     // Total callbacks made
        avgDuration: 12.5   // Average call duration in minutes
      },
      productPerformancePeriod: '30',
      productPerformanceData: [
        {
          id: 1,
          category: 'Software',
          description: 'Desktop and web applications',
          volume: 892,
          resolutionTime: 35.2,
          csat: 4.2,
          volumeTrend: 8.5,       // +8.5% vs previous period
          resolutionTimeTrend: -3.2, // -3.2% (faster resolution is better)
          csatTrend: 0.3,        // +0.3 points
          sparkline: [65, 72, 68, 75, 82, 78, 85, 88, 92] // Last 9 data points
        },
        {
          id: 2,
          category: 'Hardware',
          description: 'Physical devices and equipment',
          volume: 634,
          resolutionTime: 48.7,
          csat: 3.8,
          volumeTrend: -2.1,
          resolutionTimeTrend: 5.8,  // Slower resolution
          csatTrend: -0.2,
          sparkline: [88, 82, 85, 79, 76, 78, 74, 71, 68]
        },
        {
          id: 3,
          category: 'Services',
          description: 'Professional and consulting services',
          volume: 567,
          resolutionTime: 42.1,
          csat: 4.5,
          volumeTrend: 12.3,
          resolutionTimeTrend: -1.5,
          csatTrend: 0.4,
          sparkline: [45, 48, 52, 58, 63, 68, 72, 75, 79]
        },
        {
          id: 4,
          category: 'Subscription',
          description: 'Monthly and annual subscriptions',
          volume: 423,
          resolutionTime: 28.3,
          csat: 4.7,
          volumeTrend: 15.8,
          resolutionTimeTrend: -8.2,
          csatTrend: 0.5,
          sparkline: [32, 38, 42, 48, 55, 62, 68, 74, 82]
        },
        {
          id: 5,
          category: 'Mobile App',
          description: 'iOS and Android applications',
          volume: 356,
          resolutionTime: 31.8,
          csat: 4.1,
          volumeTrend: 6.2,
          resolutionTimeTrend: 2.1,
          csatTrend: 0.1,
          sparkline: [42, 45, 43, 48, 51, 49, 54, 57, 60]
        },
        {
          id: 6,
          category: 'Cloud',
          description: 'Cloud infrastructure and platforms',
          volume: 289,
          resolutionTime: 38.5,
          csat: 4.3,
          volumeTrend: 18.4,
          resolutionTimeTrend: -4.7,
          csatTrend: 0.6,
          sparkline: [28, 32, 36, 41, 46, 51, 58, 64, 71]
        }
      ],
      callbackStatusPeriod: '30',
      callbackStatusData: {
        pending: 89,         // Pending callbacks
        missed: 24,          // Missed callbacks
        successful: 324,     // Successful callbacks
        total: 437,          // Total callbacks
        priorityCallbacks: 12, // High priority pending
        successRate: 74.1,   // Success rate percentage
        completionRate: 89.5, // Completion rate percentage
        escalationRate: 5.2,  // Escalation rate percentage
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

      // Generate new data based on period
      const days = parseInt(period);
      const dataPoints = Math.min(days, 30); // Show max 30 data points

      this.ticketTrends.created = this.generateRandomData(dataPoints, 30, 150);
      this.ticketTrends.resolved = this.generateRandomData(dataPoints, 25, 145);
      this.ticketTrends.labels = this.generateDateLabels(days);
    },

    updateTimeDistributionPeriod(period) {
      this.timeDistributionPeriod = period;

      // Generate new time distribution data based on period
      const multiplier = parseInt(period) / 30; // Base on 30 days
      this.timeDistributionData = [
        {
          timeRange: '00:00-06:00',
          total: Math.round(45 * multiplier),
          agents: [
            { name: 'John Doe', count: Math.round(12 * multiplier) },
            { name: 'Jane Smith', count: Math.round(8 * multiplier) },
            { name: 'Mike Wilson', count: Math.round(15 * multiplier) },
            { name: 'Sarah Jones', count: Math.round(10 * multiplier) }
          ]
        },
        {
          timeRange: '06:00-12:00',
          total: Math.round(156 * multiplier),
          agents: [
            { name: 'John Doe', count: Math.round(45 * multiplier) },
            { name: 'Jane Smith', count: Math.round(38 * multiplier) },
            { name: 'Mike Wilson', count: Math.round(42 * multiplier) },
            { name: 'Sarah Jones', count: Math.round(31 * multiplier) }
          ]
        },
        {
          timeRange: '12:00-18:00',
          total: Math.round(234 * multiplier),
          agents: [
            { name: 'John Doe', count: Math.round(68 * multiplier) },
            { name: 'Jane Smith', count: Math.round(52 * multiplier) },
            { name: 'Mike Wilson', count: Math.round(61 * multiplier) },
            { name: 'Sarah Jones', count: Math.round(53 * multiplier) }
          ]
        },
        {
          timeRange: '18:00-00:00',
          total: Math.round(128 * multiplier),
          agents: [
            { name: 'John Doe', count: Math.round(35 * multiplier) },
            { name: 'Jane Smith', count: Math.round(28 * multiplier) },
            { name: 'Mike Wilson', count: Math.round(32 * multiplier) },
            { name: 'Sarah Jones', count: Math.round(33 * multiplier) }
          ]
        }
      ];
    },

    updateCustomerSatisfactionPeriod(period) {
      this.customerSatisfactionPeriod = period;

      // Generate new CSAT data based on period
      const multiplier = parseInt(period) / 30; // Base on 30 days
      this.customerSatisfactionData = {
        5: Math.round(512 * multiplier),  // Very Satisfied
        4: Math.round(289 * multiplier),  // Satisfied
        3: Math.round(156 * multiplier),  // Neutral
        2: Math.round(42 * multiplier),   // Dissatisfied
        1: Math.round(18 * multiplier)    // Very Dissatisfied
      };

      // Update the summary metrics as well
      this.metrics.csatScore = parseFloat(this.calculateAverageRating()).toFixed(1);
      this.metrics.csatChange = 1.8; // Placeholder change value
    },

    updateAgentPerformancePeriod(period) {
      this.agentPerformancePeriod = period;

      // Generate new agent performance data based on period
      const multiplier = parseInt(period) / 30; // Base on 30 days
      this.agentPerformanceData = [
        {
          id: 1,
          name: 'Sarah Jones',
          assigned: Math.round(324 * multiplier),
          resolved: Math.round(298 * multiplier),
          resolutionTime: 45 + Math.random() * 20, // Add some variation
          fcrRate: 82.5 + Math.random() * 10 - 5, // Add variation +/- 5%
          csatRating: 4.6 + Math.random() * 0.4 - 0.2 // Add variation +/- 0.2
        },
        {
          id: 2,
          name: 'John Doe',
          assigned: Math.round(298 * multiplier),
          resolved: Math.round(265 * multiplier),
          resolutionTime: 52 + Math.random() * 20,
          fcrRate: 78.2 + Math.random() * 10 - 5,
          csatRating: 4.3 + Math.random() * 0.4 - 0.2
        },
        {
          id: 3,
          name: 'Jane Smith',
          assigned: Math.round(267 * multiplier),
          resolved: Math.round(239 * multiplier),
          resolutionTime: 38 + Math.random() * 20,
          fcrRate: 85.1 + Math.random() * 10 - 5,
          csatRating: 4.7 + Math.random() * 0.4 - 0.2
        },
        {
          id: 4,
          name: 'Mike Wilson',
          assigned: Math.round(245 * multiplier),
          resolved: Math.round(218 * multiplier),
          resolutionTime: 48 + Math.random() * 20,
          fcrRate: 76.8 + Math.random() * 10 - 5,
          csatRating: 4.1 + Math.random() * 0.4 - 0.2
        },
        {
          id: 5,
          name: 'Alex Brown',
          assigned: Math.round(189 * multiplier),
          resolved: Math.round(167 * multiplier),
          resolutionTime: 55 + Math.random() * 20,
          fcrRate: 74.2 + Math.random() * 10 - 5,
          csatRating: 4.0 + Math.random() * 0.4 - 0.2
        },
        {
          id: 6,
          name: 'Emily Davis',
          assigned: Math.round(156 * multiplier),
          resolved: Math.round(143 * multiplier),
          resolutionTime: 42 + Math.random() * 20,
          fcrRate: 79.6 + Math.random() * 10 - 5,
          csatRating: 4.4 + Math.random() * 0.4 - 0.2
        }
      ];
    },

  updateCallStatisticsPeriod(period) {
      this.callStatisticsPeriod = period;

      // Generate new call statistics data based on period
      const multiplier = parseInt(period) / 30; // Base on 30 days
      const baseInbound = 2847;
      const baseOutbound = 1653;
      const baseCompleted = 4186;
      const baseMissed = 314;
      const baseCallbacks = 186;
      const baseAvgDuration = 12.5;

      this.callStatisticsData = {
        inbound: Math.round(baseInbound * multiplier),
        outbound: Math.round(baseOutbound * multiplier),
        completed: Math.round(baseCompleted * multiplier),
        missed: Math.round(baseMissed * multiplier),
        callbacks: Math.round(baseCallbacks * multiplier),
        avgDuration: baseAvgDuration + Math.random() * 5 - 2.5 // Add variation
      };
    },

    updateProductPerformancePeriod(period) {
      this.productPerformancePeriod = period;

      // Generate new product performance data based on period
      const multiplier = parseInt(period) / 30; // Base on 30 days

      const baseProducts = [
        {
          id: 1,
          category: 'Software',
          description: 'Desktop and web applications',
          baseVolume: 892,
          baseResolutionTime: 35.2,
          baseCsat: 4.2
        },
        {
          id: 2,
          category: 'Hardware',
          description: 'Physical devices and equipment',
          baseVolume: 634,
          baseResolutionTime: 48.7,
          baseCsat: 3.8
        },
        {
          id: 3,
          category: 'Services',
          description: 'Professional and consulting services',
          baseVolume: 567,
          baseResolutionTime: 42.1,
          baseCsat: 4.5
        },
        {
          id: 4,
          category: 'Subscription',
          description: 'Monthly and annual subscriptions',
          baseVolume: 423,
          baseResolutionTime: 28.3,
          baseCsat: 4.7
        },
        {
          id: 5,
          category: 'Mobile App',
          description: 'iOS and Android applications',
          baseVolume: 356,
          baseResolutionTime: 31.8,
          baseCsat: 4.1
        },
        {
          id: 6,
          category: 'Cloud',
          description: 'Cloud infrastructure and platforms',
          baseVolume: 289,
          baseResolutionTime: 38.5,
          baseCsat: 4.3
        }
      ];

      this.productPerformanceData = baseProducts.map(product => ({
        ...product,
        volume: Math.round(product.baseVolume * multiplier),
        resolutionTime: product.baseResolutionTime + Math.random() * 10 - 5,
        csat: product.baseCsat + Math.random() * 0.4 - 0.2,
        volumeTrend: (Math.random() * 30) - 10, // -10% to +20%
        resolutionTimeTrend: (Math.random() * 20) - 10, // -10% to +10%
        csatTrend: (Math.random() * 1) - 0.3, // -0.3 to +0.7
        sparkline: this.generateSparkline(9)
      }));
    },

    generateSparkline(length) {
      const sparkline = [];
      const base = 50;
      for (let i = 0; i < length; i++) {
        sparkline.push(Math.round(base + (Math.random() * 40) - 20));
      }
      return sparkline;
    },

    updateCallbackStatusPeriod(period) {
      this.callbackStatusPeriod = period;

      // Generate new callback status data based on period
      const multiplier = parseInt(period) / 30; // Base on 30 days

      const baseCallbacks = {
        pending: 89,
        missed: 24,
        successful: 324,
        priorityCallbacks: 12,
        successRate: 74.1,
        completionRate: 89.5,
        escalationRate: 5.2,
        avgResponseTime: 18.5
      };

      this.callbackStatusData = {
        pending: Math.round(baseCallbacks.pending * multiplier),
        missed: Math.round(baseCallbacks.missed * multiplier),
        successful: Math.round(baseCallbacks.successful * multiplier),
        total: Math.round((baseCallbacks.pending + baseCallbacks.missed + baseCallbacks.successful) * multiplier),
        priorityCallbacks: Math.round(baseCallbacks.priorityCallbacks * multiplier),
        successRate: baseCallbacks.successRate + (Math.random() * 10 - 5), // Add variation
        completionRate: baseCallbacks.completionRate + (Math.random() * 8 - 4),
        escalationRate: Math.max(0, baseCallbacks.escalationRate + (Math.random() * 6 - 3)),
        avgResponseTime: baseCallbacks.avgResponseTime + (Math.random() * 10 - 5)
      };
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
      }

      // In a real app, you would make an API call to fetch filtered analytics data
      // For now, just regenerate some data to simulate filtering
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
    // In a real app, you would fetch the initial data here
    this.fetchAnalyticsData();

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
