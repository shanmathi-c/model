<template>
  <div class="h-full bg-gray-50 flex flex-col">
    <!-- Fixed Header Section - Sticky -->
    <div class="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-2 shadow-md">
      <!-- Header Title -->
      <div class="">
        <h1 class="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p class="text-gray-600 mt-1">View and analyze support performance metrics</p>
      </div>

      <!-- Date Range and Filters Row -->
      <div class="flex flex-wrap items-center gap-4 mb-4">
        <!-- Date Range Selector -->
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

      <!-- Filters Row -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Agent Selection Filter -->
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">Agent:</label>
          <div class="relative">
            <select
              v-model="selectedAgent"
              class="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white pr-8"
              style="min-width: 150px;"
            >
              <option value="all">All Agents</option>
              <option value="john_doe">John Doe</option>
              <option value="jane_smith">Jane Smith</option>
              <option value="mike_wilson">Mike Wilson</option>
              <option value="sarah_jones">Sarah Jones</option>
              <option value="alex_brown">Alex Brown</option>
            </select>
            <svg class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <!-- Product Category Filter -->
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">Product:</label>
          <div class="relative">
            <select
              v-model="selectedProductCategory"
              class="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white pr-8"
              style="min-width: 150px;"
            >
              <option value="all">All Products</option>
              <option value="software">Software</option>
              <option value="hardware">Hardware</option>
              <option value="services">Services</option>
              <option value="subscription">Subscription</option>
            </select>
            <svg class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <!-- Ticket Type Filter -->
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">Type:</label>
          <div class="relative">
            <select
              v-model="selectedTicketType"
              class="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white pr-8"
              style="min-width: 150px;"
            >
              <option value="all">All Types</option>
              <option value="incident">Incident</option>
              <option value="request">Request</option>
              <option value="complaint">Complaint</option>
              <option value="inquiry">Inquiry</option>
            </select>
            <svg class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <!-- Agent Team/Group Filter -->
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">Team:</label>
          <div class="relative">
            <select
              v-model="selectedTeam"
              class="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white pr-8"
              style="min-width: 150px;"
            >
              <option value="all">All Teams</option>
              <option value="tier1">Tier 1 Support</option>
              <option value="tier2">Tier 2 Support</option>
              <option value="specialist">Specialist Team</option>
              <option value="escalation">Escalation Team</option>
            </select>
            <svg class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <!-- Apply Filters Button -->
        <button
          @click="applyFilters"
          class="px-4 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
        >
          Apply Filters
        </button>

        <!-- Clear Filters Button -->
        <button
          @click="clearFilters"
          class="px-4 py-1.5 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
        >
          Clear
        </button>
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
      // Filter properties
      selectedAgent: 'all',
      selectedProductCategory: 'all',
      selectedTicketType: 'all',
      selectedTeam: 'all',
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

    // Apply all filters
    applyFilters() {
      console.log('Applying filters:', {
        dateRange: this.selectedDateRange,
        agent: this.selectedAgent,
        product: this.selectedProductCategory,
        ticketType: this.selectedTicketType,
        team: this.selectedTeam
      });

      // In a real app, this would trigger an API call with all filter parameters
      // Example API call would be something like:
      // this.fetchFilteredAnalyticsData();

      // For now, just log the filters
      this.fetchAnalyticsData();
    },

    // Clear all filters
    clearFilters() {
      this.selectedAgent = 'all';
      this.selectedProductCategory = 'all';
      this.selectedTicketType = 'all';
      this.selectedTeam = 'all';
      this.selectedDateRange = '30';

      console.log('Filters cleared');
      // In a real app, this would reset the analytics data
      this.fetchAnalyticsData();
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
