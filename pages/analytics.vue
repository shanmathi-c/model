<template>
  <div class="h-full bg-gray-50 flex flex-col">
    <!-- Fixed Header Section - Sticky -->
    <div class="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 shadow-md">
      <!-- Header Title -->
      <div class="mb-4">
        <h1 class="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p class="text-gray-600 mt-1">View and analyze support performance metrics</p>
      </div>

      <!-- Date Range Picker -->
      <div class="flex items-center gap-4 mb-4">
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">Date Range:</label>
          <select 
            v-model="selectedDateRange" 
            class="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
        
        <!-- Custom Date Range Picker (shown when 'custom' is selected) -->
        <div v-if="selectedDateRange === 'custom'" class="flex items-center gap-2">
          <input 
            type="date" 
            v-model="dateRange.start" 
            class="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
          <span class="text-gray-500">to</span>
          <input 
            type="date" 
            v-model="dateRange.end" 
            class="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
          <button 
            @click="applyDateRange"
            class="ml-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Apply
          </button>
        </div>
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

      <!-- Charts Row 1 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Tickets by Status -->
        <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Tickets by Status</h3>
            <select v-model="ticketsByStatusPeriod" class="text-sm border border-gray-300 rounded-md px-2 py-1">
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
          <div class="h-64">
            <!-- Chart will be rendered here -->
            <div class="flex items-center justify-center h-full text-gray-400">
              <p>Ticket status chart will be displayed here</p>
            </div>
          </div>
        </div>

        <!-- Tickets by Priority -->
        <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Tickets by Priority</h3>
            <select v-model="ticketsByPriorityPeriod" class="text-sm border border-gray-300 rounded-md px-2 py-1">
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
          <div class="h-64">
            <!-- Chart will be rendered here -->
            <div class="flex items-center justify-center h-full text-gray-400">
              <p>Priority distribution chart will be displayed here</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row 2 -->
      <div class="grid grid-cols-1 gap-6">
        <!-- Ticket Volume Over Time -->
        <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Ticket Volume Over Time</h3>
            <div class="flex gap-2">
              <button 
                v-for="period in ['day', 'week', 'month']" 
                :key="period"
                @click="ticketVolumePeriod = period"
                :class="[
                  'px-3 py-1 text-sm rounded-md',
                  ticketVolumePeriod === period 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                {{ period.charAt(0).toUpperCase() + period.slice(1) }}
              </button>
            </div>
          </div>
          <div class="h-80">
            <!-- Chart will be rendered here -->
            <div class="flex items-center justify-center h-full text-gray-400">
              <p>Ticket volume over time chart will be displayed here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AnalyticsPage',
  
  data() {
    return {
      selectedDateRange: '30',
      dateRange: {
        start: this.getDateDaysAgo(30),
        end: this.getDateDaysAgo(0)
      },
      metrics: {
        totalTickets: 1, // Placeholder value
        ticketsChange: 5.2, // Placeholder value
        fcrRate: 78.5, // Placeholder value
        fcrChange: 2.3, // Placeholder value
        avgResponseTime: 12, // Placeholder value
        responseTimeChange: -3.1, // Placeholder value
        csatScore: 4.2, // Placeholder value
        csatChange: 1.8 // Placeholder value
      },
      ticketsByStatusPeriod: '30',
      ticketsByPriorityPeriod: '30',
      ticketVolumePeriod: 'week'
    };
  },

  methods: {
    getDateDaysAgo(days) {
      const date = new Date();
      date.setDate(date.getDate() - days);
      return date.toISOString().split('T')[0];
    },

    applyDateRange() {
      // In a real app, this would trigger a data refresh with the new date range
      console.log('Applying date range:', this.dateRange);
      // Here you would typically call a method to fetch data with the new date range
    },

    // In a real app, you would have methods to fetch data from your API
    fetchAnalyticsData() {
      // This would be an API call to fetch the analytics data
      // For now, we're just using placeholder data
      console.log('Fetching analytics data...');
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
    },
    
    ticketsByStatusPeriod() {
      // In a real app, this would refresh the tickets by status data
      console.log('Updating tickets by status data for period:', this.ticketsByStatusPeriod);
    },
    
    ticketsByPriorityPeriod() {
      // In a real app, this would refresh the tickets by priority data
      console.log('Updating tickets by priority data for period:', this.ticketsByPriorityPeriod);
    },
    
    ticketVolumePeriod() {
      // In a real app, this would refresh the ticket volume data
      console.log('Updating ticket volume data for period:', this.ticketVolumePeriod);
    }
  },

  mounted() {
    // In a real app, you would fetch the initial data here
    this.fetchAnalyticsData();
  }
};
</script>

<style scoped>
/* Add any custom styles here */
</style>
