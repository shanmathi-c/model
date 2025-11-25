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
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <!-- Total Tickets -->
        <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Total Tickets</p>
              <p class="text-2xl font-semibold text-gray-900">{{ metrics.totalTickets }}</p>
              <p class="text-xs text-gray-500 mt-1">
                <span :class="metrics.ticketsChange >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ Math.abs(metrics.ticketsChange) }}% {{ metrics.ticketsChange >= 0 ? '↑' : '↓' }}
                </span> vs previous period
              </p>
            </div>
            <div class="p-3 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <!-- First Call Resolution -->
        <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">First Call Resolution</p>
              <p class="text-2xl font-semibold text-gray-900">{{ metrics.fcrRate }}%</p>
              <p class="text-xs text-gray-500 mt-1">
                <span :class="metrics.fcrChange >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ Math.abs(metrics.fcrChange) }}% {{ metrics.fcrChange >= 0 ? '↑' : '↓' }}
                </span> vs previous period
              </p>
            </div>
            <div class="p-3 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Average Response Time -->
        <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Avg. Response Time</p>
              <p class="text-2xl font-semibold text-gray-900">{{ metrics.avgResponseTime }}m</p>
              <p class="text-xs text-gray-500 mt-1">
                <span :class="metrics.responseTimeChange <= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ Math.abs(metrics.responseTimeChange) }}% {{ metrics.responseTimeChange <= 0 ? '↓' : '↑' }}
                </span> vs previous period
              </p>
            </div>
            <div class="p-3 bg-yellow-100 rounded-lg">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Customer Satisfaction -->
        <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Customer Satisfaction</p>
              <p class="text-2xl font-semibold text-gray-900">{{ metrics.csatScore }}/5</p>
              <p class="text-xs text-gray-500 mt-1">
                <span :class="metrics.csatChange >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ Math.abs(metrics.csatChange) }}% {{ metrics.csatChange >= 0 ? '↑' : '↓' }}
                </span> vs previous period
              </p>
            </div>
            <div class="p-3 bg-purple-100 rounded-lg">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            </div>
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
    </div>
  </div>
</template>

<script>
import LineChart from '~/components/LineChart.vue'
import TimeDistributionChart from '~/components/TimeDistributionChart.vue'
import CustomerSatisfactionChart from '~/components/CustomerSatisfactionChart.vue'

export default {
  name: 'AnalyticsPage',
  components: {
    LineChart,
    TimeDistributionChart,
    CustomerSatisfactionChart
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
        totalTickets: 1247, // Updated placeholder value
        ticketsChange: 5.2, // Placeholder value
        fcrRate: 78.5, // Placeholder value
        fcrChange: 2.3, // Placeholder value
        avgResponseTime: 12, // Placeholder value
        responseTimeChange: -3.1, // Placeholder value
        csatScore: 4.2, // Placeholder value
        csatChange: 1.8 // Placeholder value
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

    // In a real app, you would have methods to fetch data from your API
    async fetchAnalyticsData() {
      try {
        // This would be an API call to fetch the analytics data
        // For now, we're just using placeholder data
        console.log('Fetching analytics data...');

        // Example API call structure with error handling:
        // const response = await $fetch('http://localhost:5001/analytics', {
        //   method: 'GET',
        //   query: {
        //     dateRange: this.selectedDateRange,
        //     agent: this.selectedAgent,
        //     product: this.selectedProductCategory,
        //     ticketType: this.selectedTicketType,
        //     team: this.selectedTeam
        //   }
        // });
        // this.metrics = response.data;

      } catch (error) {
        console.error('Error fetching analytics data:', error);
        // Handle H3 error or network errors gracefully
        // You could show a user-friendly error message here
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
