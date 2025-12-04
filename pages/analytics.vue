<template>
  <div class="h-full bg-gray-50 flex flex-col">
    <!-- Fixed Header Section - Sticky -->
    <div class="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-2 shadow-sm">
      <!-- Header Title -->
      <div class="mb-2 flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p class="text-gray-600 mt-0.5 text-sm">View and analyze support performance metrics</p>
        </div>

        <!-- Loading Indicator -->
        <div v-if="loading" class="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
          <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span class="text-sm text-blue-600 font-medium">Refreshing...</span>
        </div>
      </div>

      <!-- Search and Filter Bar -->
      <div class="flex items-center gap-3">
        <!-- Date Range Selector -->
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">Date Range:</label>
          <select
            v-model="analyticsFilters.dateRange"
            @change="handleDateRangeChange"
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
          <DateRangePicker
            :startDate="customDateRange.start"
            :endDate="customDateRange.end"
            placeholder="Select custom date range"
            :autoApply="true"
            @update:startDate="customDateRange.start = $event; applyCustomDateRange()"
            @update:endDate="customDateRange.end = $event; applyCustomDateRange()"
            @apply="applyCustomDateRange"
          />
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
            <svg
              class="ml-2 h-4 w-4 transition-transform duration-200"
              :class="{ 'rotate-180': showFilterDropdown }"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Filter Dropdown -->
          <div
            v-if="showFilterDropdown"
            class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200"
            style="z-index: 50;"
          >
            <div class="p-3 max-h-96 overflow-y-auto custom-scrollbar">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-sm font-semibold text-gray-900">Filters</h3>
                <button
                  v-if="hasActiveFilters"
                  @click="clearAllFilters"
                  onclick="event.stopPropagation()"
                  class="text-xs text-blue-600 hover:text-blue-700"
                >
                  Clear
                </button>
              </div>

              <!-- Agents -->
              <div class="mb-2">
                <button
                  @click="toggleFilterSection('agents')"
                  class="flex items-center justify-between w-full text-xs font-medium text-gray-700 hover:text-gray-900 py-1"
                >
                  <span>Agents</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    class="w-3 h-3 transition-transform"
                    :class="{ 'rotate-90': expandedSections.agents }"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div v-if="expandedSections.agents" class="mt-1 space-y-1 pl-2 max-h-32 overflow-y-auto">
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
              <div class="mb-2">
                <button
                  @click="toggleFilterSection('products')"
                  class="flex items-center justify-between w-full text-xs font-medium text-gray-700 hover:text-gray-900 py-1"
                >
                  <span>Products</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    class="w-3 h-3 transition-transform"
                    :class="{ 'rotate-90': expandedSections.products }"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div v-if="expandedSections.products" class="mt-1 space-y-1 pl-2 max-h-32 overflow-y-auto">
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
              <div class="mb-2">
                <button
                  @click="toggleFilterSection('status')"
                  class="flex items-center justify-between w-full text-xs font-medium text-gray-700 hover:text-gray-900 py-1"
                >
                  <span>Status</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    class="w-3 h-3 transition-transform"
                    :class="{ 'rotate-90': expandedSections.status }"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div v-if="expandedSections.status" class="mt-1 space-y-1 pl-2 max-h-32 overflow-y-auto">
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

              <!-- Ticket Type -->
              <div class="mb-2">
                <button
                  @click="toggleFilterSection('ticketTypes')"
                  class="flex items-center justify-between w-full text-xs font-medium text-gray-700 hover:text-gray-900 py-1"
                >
                  <span>Ticket Type</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    class="w-3 h-3 transition-transform"
                    :class="{ 'rotate-90': expandedSections.ticketTypes }"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div v-if="expandedSections.ticketTypes" class="mt-1 space-y-1 pl-2 max-h-32 overflow-y-auto">
                  <label
                    v-for="type in ticketTypeOptions"
                    :key="type.value"
                    class="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 p-1 rounded text-xs"
                  >
                    <input
                      type="checkbox"
                      :value="type.value"
                      v-model="analyticsFilters.ticketTypes"
                      @change="applyFilters"
                      class="w-3 h-3 text-blue-600 rounded border-gray-300"
                    />
                    <span>{{ type.label }}</span>
                  </label>
                </div>
              </div>

              <!-- Agent Team/Group -->
              <div class="mb-2">
                <button
                  @click="toggleFilterSection('teams')"
                  class="flex items-center justify-between w-full text-xs font-medium text-gray-700 hover:text-gray-900 py-1"
                >
                  <span>Agent Team/Group</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    class="w-3 h-3 transition-transform"
                    :class="{ 'rotate-90': expandedSections.teams }"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div v-if="expandedSections.teams" class="mt-1 space-y-1 pl-2 max-h-32 overflow-y-auto">
                  <label
                    v-for="team in teamOptions"
                    :key="team.teamName"
                    class="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 p-1 rounded text-xs"
                  >
                    <input
                      type="checkbox"
                      :value="team.teamName"
                      v-model="analyticsFilters.teams"
                      @change="applyFilters"
                      class="w-3 h-3 text-blue-600 rounded border-gray-300"
                    />
                    <span>{{ team.teamName }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Export Button -->
        <div ref="exportDropdownRef" class="relative ml-auto">
          <button
            @click="toggleExportDropdown"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <svg class="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
            <svg class="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Export Dropdown -->
          <div
            v-if="showExportDropdown"
            class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200"
            style="z-index: 50;"
          >
            <div class="py-1">
              <button
                @click="exportToPDF"
                class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <svg class="h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Download as PDF
              </button>
              <button
                @click="exportToExcel"
                class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <svg class="h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download as Excel
              </button>
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

    <!-- Loading Overlay for PDF Export -->
    <div v-if="isExportingPDF" style="position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 9998; display: flex; align-items: center; justify-content: center;">
      <div class="text-white text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
        <p class="text-lg font-semibold">Generating PDF...</p>
        <p class="text-sm mt-2">Please wait, this may take a few seconds</p>
      </div>
    </div>

    <!-- Hidden Export View (Tables only, no charts) -->
    <div v-if="isExportingPDF" ref="exportContent" class="export-content bg-white" style="position: fixed; left: 0; top: 0; width: 210mm; padding: 15mm 20mm; z-index: 9999; overflow: visible; box-sizing: border-box;">
      <div class="mb-6 text-center border-b pb-3">
        <h1 class="text-2xl font-bold text-gray-900">Analytics Report</h1>
        <p class="text-sm text-gray-600 mt-1">Generated on {{ new Date().toLocaleDateString() }}</p>
        <p class="text-sm text-gray-600">Period: Last {{ analyticsFilters.dateRange }} days</p>
      </div>

      <!-- Summary Metrics Table -->
      <div class="mb-6">
        <h2 class="text-lg font-bold text-gray-900 mb-3 border-b pb-2">Summary Metrics</h2>
        <table class="w-full border-collapse border border-gray-300" style="font-size: 11px;">
          <thead>
            <tr class="bg-gray-100">
              <th class="border border-gray-300 px-3 py-2 text-left font-semibold">Metric</th>
              <th class="border border-gray-300 px-3 py-2 text-left font-semibold">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-gray-300 px-3 py-2">Total Tickets</td>
              <td class="border border-gray-300 px-3 py-2 font-medium">{{ formatNumber(metrics.totalTickets) }}</td>
            </tr>
            <tr class="bg-gray-50">
              <td class="border border-gray-300 px-3 py-2">Assigned Tickets</td>
              <td class="border border-gray-300 px-3 py-2 font-medium">{{ formatNumber(metrics.assignedCount) }}</td>
            </tr>
            <tr>
              <td class="border border-gray-300 px-3 py-2">Pending Tickets</td>
              <td class="border border-gray-300 px-3 py-2 font-medium">{{ formatNumber(metrics.pendingCount) }}</td>
            </tr>
            <tr class="bg-gray-50">
              <td class="border border-gray-300 px-3 py-2">In Progress Tickets</td>
              <td class="border border-gray-300 px-3 py-2 font-medium">{{ formatNumber(metrics.inProgressCount) }}</td>
            </tr>
            <tr>
              <td class="border border-gray-300 px-3 py-2">Resolved Tickets</td>
              <td class="border border-gray-300 px-3 py-2 font-medium">{{ formatNumber(metrics.resolvedCount) }}</td>
            </tr>
            <tr class="bg-gray-50">
              <td class="border border-gray-300 px-3 py-2">Closed Tickets</td>
              <td class="border border-gray-300 px-3 py-2 font-medium">{{ formatNumber(metrics.closedCount) }}</td>
            </tr>
            <tr>
              <td class="border border-gray-300 px-3 py-2">Average Resolution Time</td>
              <td class="border border-gray-300 px-3 py-2 font-medium">{{ formatResolutionTime(metrics.avgResolutionTimeMinutes) }}</td>
            </tr>
            <tr class="bg-gray-50">
              <td class="border border-gray-300 px-3 py-2">Average Reconnection Time</td>
              <td class="border border-gray-300 px-3 py-2 font-medium">{{ formatResolutionTime(metrics.avgReconnectionTimeMinutes) }} ({{ formatNumber(metrics.reconnectionCount) }} reconnections)</td>
            </tr>
            <tr>
              <td class="border border-gray-300 px-3 py-2">First Call Resolution Rate</td>
              <td class="border border-gray-300 px-3 py-2 font-medium">{{ metrics.fcrRate }}% ({{ formatNumber(metrics.fcrCount) }} tickets)</td>
            </tr>
            <tr class="bg-gray-50">
              <td class="border border-gray-300 px-3 py-2">Average Customer Satisfaction</td>
              <td class="border border-gray-300 px-3 py-2 font-medium">{{ metrics.csatScore }}/5 or {{ Math.round((metrics.csatScore / 5) * 100) }}% ({{ formatNumber(metrics.csatCount) }} ratings)</td>
            </tr>
            <tr>
              <td class="border border-gray-300 px-3 py-2">Callback Completion Rate</td>
              <td class="border border-gray-300 px-3 py-2 font-medium">{{ metrics.callbackCompletionRate }}% ({{ formatNumber(metrics.callbackCount) }} completed)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Ticket Trends Table -->
      <div class="mb-6">
        <h2 class="text-lg font-bold text-gray-900 mb-3 border-b pb-2">Tickets Created vs Resolved Over Time</h2>
        <table class="w-full border-collapse border border-gray-300" style="font-size: 8px;">
          <thead>
            <tr class="bg-gray-100">
              <th class="border border-gray-300 px-3 py-2 text-left font-semibold">Date</th>
              <th class="border border-gray-300 px-3 py-2 text-right font-semibold">Created</th>
              <th class="border border-gray-300 px-3 py-2 text-right font-semibold">Resolved</th>
              <th class="border border-gray-300 px-3 py-2 text-right font-semibold">Difference</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(label, index) in ticketTrends.labels" :key="index" :class="{ 'bg-gray-50': index % 2 === 0 }">
              <td class="border border-gray-300 px-3 py-2">{{ label }}</td>
              <td class="border border-gray-300 px-3 py-2 text-right">{{ ticketTrends.created[index] || 0 }}</td>
              <td class="border border-gray-300 px-3 py-2 text-right">{{ ticketTrends.resolved[index] || 0 }}</td>
              <td class="border border-gray-300 px-3 py-2 text-right" :class="{ 'text-green-600': (ticketTrends.resolved[index] || 0) >= (ticketTrends.created[index] || 0), 'text-red-600': (ticketTrends.resolved[index] || 0) < (ticketTrends.created[index] || 0) }">
                {{ (ticketTrends.resolved[index] || 0) - (ticketTrends.created[index] || 0) }}
              </td>
            </tr>
            <tr class="bg-blue-50 font-semibold">
              <td class="border border-gray-300 px-3 py-2">Total</td>
              <td class="border border-gray-300 px-3 py-2 text-right">{{ ticketTrends.created.reduce((a, b) => a + b, 0) }}</td>
              <td class="border border-gray-300 px-3 py-2 text-right">{{ ticketTrends.resolved.reduce((a, b) => a + b, 0) }}</td>
              <td class="border border-gray-300 px-3 py-2 text-right">{{ ticketTrends.resolved.reduce((a, b) => a + b, 0) - ticketTrends.created.reduce((a, b) => a + b, 0) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Freshdesk Ticket Trends Table -->
      <div class="mb-6">
        <h2 class="text-lg font-bold text-gray-900 mb-3 border-b pb-2">Freshdesk Tickets Created vs Resolved Over Time</h2>
        <table class="w-full border-collapse border border-gray-300" style="font-size: 8px;">
          <thead>
            <tr class="bg-gray-100">
              <th class="border border-gray-300 px-3 py-2 text-left font-semibold">Date</th>
              <th class="border border-gray-300 px-3 py-2 text-right font-semibold">Created</th>
              <th class="border border-gray-300 px-3 py-2 text-right font-semibold">Resolved</th>
              <th class="border border-gray-300 px-3 py-2 text-right font-semibold">Difference</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!freshdeskTicketTrends.labels || freshdeskTicketTrends.labels.length === 0">
              <td colspan="4" class="border border-gray-300 px-3 py-4 text-center text-gray-500">No Freshdesk ticket trends data available</td>
            </tr>
            <tr v-for="(label, index) in freshdeskTicketTrends.labels" :key="index" :class="{ 'bg-gray-50': index % 2 === 0 }">
              <td class="border border-gray-300 px-3 py-2">{{ label }}</td>
              <td class="border border-gray-300 px-3 py-2 text-right">{{ freshdeskTicketTrends.created[index] || 0 }}</td>
              <td class="border border-gray-300 px-3 py-2 text-right">{{ freshdeskTicketTrends.resolved[index] || 0 }}</td>
              <td class="border border-gray-300 px-3 py-2 text-right" :class="{ 'text-green-600': (freshdeskTicketTrends.resolved[index] || 0) >= (freshdeskTicketTrends.created[index] || 0), 'text-red-600': (freshdeskTicketTrends.resolved[index] || 0) < (freshdeskTicketTrends.created[index] || 0) }">
                {{ (freshdeskTicketTrends.resolved[index] || 0) - (freshdeskTicketTrends.created[index] || 0) }}
              </td>
            </tr>
            <tr v-if="freshdeskTicketTrends.labels && freshdeskTicketTrends.labels.length > 0" class="bg-blue-50 font-semibold">
              <td class="border border-gray-300 px-3 py-2">Total</td>
              <td class="border border-gray-300 px-3 py-2 text-right">{{ freshdeskTicketTrends.created.reduce((a, b) => a + b, 0) }}</td>
              <td class="border border-gray-300 px-3 py-2 text-right">{{ freshdeskTicketTrends.resolved.reduce((a, b) => a + b, 0) }}</td>
              <td class="border border-gray-300 px-3 py-2 text-right">{{ freshdeskTicketTrends.resolved.reduce((a, b) => a + b, 0) - freshdeskTicketTrends.created.reduce((a, b) => a + b, 0) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Resolution Time Distribution Table -->
      <div class="mb-6">
        <h2 class="text-lg font-bold text-gray-900 mb-3 border-b pb-2">Resolution Time Distribution</h2>
        <table class="w-full border-collapse border border-gray-300" style="font-size: 11px;">
          <thead>
            <tr class="bg-gray-100">
              <th class="border border-gray-300 px-3 py-1 text-left font-semibold">Time Range</th>
              <th class="border border-gray-300 px-3 py-1 text-right font-semibold">Count</th>
              <th class="border border-gray-300 px-3 py-1 text-right font-semibold">Percentage</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in timeDistributionData" :key="index" :class="{ 'bg-gray-50': index % 2 === 0 }">
              <td class="border border-gray-300 px-3 py-1">{{ item.timeRange }}</td>
              <td class="border border-gray-300 px-3 py-1 text-right">{{ item.total }}</td>
              <td class="border border-gray-300 px-3 py-1 text-right">{{ getTimeDistributionPercentage(item.total) }}%</td>
            </tr>
            <tr class="bg-blue-50 font-semibold">
              <td class="border border-gray-300 px-3 py-1">Total</td>
              <td class="border border-gray-300 px-3 py-1 text-right">{{ getTotalTimeDistribution() }}</td>
              <td class="border border-gray-300 px-3 py-1 text-right">100%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Customer Satisfaction Distribution Table -->
      <div class="mb-6">
        <h2 class="text-lg font-bold text-gray-900 mb-3 border-b pb-2">Customer Satisfaction Distribution</h2>
        <table class="w-full border-collapse border border-gray-300" style="font-size: 11px;">
          <thead>
            <tr class="bg-gray-100">
              <th class="border border-gray-300 px-2 py-1 text-left font-semibold">Rating</th>
              <th class="border border-gray-300 px-2 py-1 text-left font-semibold">Description</th>
              <th class="border border-gray-300 px-2 py-1 text-right font-semibold">Count</th>
              <th class="border border-gray-300 px-2 py-1 text-right font-semibold">Percentage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-gray-300 px-2 py-1">5 Stars</td>
              <td class="border border-gray-300 px-2 py-1">Very Satisfied</td>
              <td class="border border-gray-300 px-2 py-1 text-right">{{ customerSatisfactionData[5] || 0 }}</td>
              <td class="border border-gray-300 px-2 py-1 text-right">{{ getCSATPercentage(5) }}%</td>
            </tr>
            <tr class="bg-gray-50">
              <td class="border border-gray-300 px-2 py-1">4 Stars</td>
              <td class="border border-gray-300 px-2 py-1">Satisfied</td>
              <td class="border border-gray-300 px-2 py-1 text-right">{{ customerSatisfactionData[4] || 0 }}</td>
              <td class="border border-gray-300 px-2 py-1 text-right">{{ getCSATPercentage(4) }}%</td>
            </tr>
            <tr>
              <td class="border border-gray-300 px-2 py-1">3 Stars</td>
              <td class="border border-gray-300 px-2 py-1">Neutral</td>
              <td class="border border-gray-300 px-2 py-1 text-right">{{ customerSatisfactionData[3] || 0 }}</td>
              <td class="border border-gray-300 px-2 py-1 text-right">{{ getCSATPercentage(3) }}%</td>
            </tr>
            <tr class="bg-gray-50">
              <td class="border border-gray-300 px-2 py-1">2 Stars</td>
              <td class="border border-gray-300 px-2 py-1">Dissatisfied</td>
              <td class="border border-gray-300 px-2 py-1 text-right">{{ customerSatisfactionData[2] || 0 }}</td>
              <td class="border border-gray-300 px-2 py-1 text-right">{{ getCSATPercentage(2) }}%</td>
            </tr>
            <tr>
              <td class="border border-gray-300 px-2 py-1">1 Star</td>
              <td class="border border-gray-300 px-2 py-1">Very Dissatisfied</td>
              <td class="border border-gray-300 px-2 py-1 text-right">{{ customerSatisfactionData[1] || 0 }}</td>
              <td class="border border-gray-300 px-2 py-1 text-right">{{ getCSATPercentage(1) }}%</td>
            </tr>
            <tr class="bg-blue-50 font-semibold">
              <td class="border border-gray-300 px-2 py-1" colspan="2">Total Ratings</td>
              <td class="border border-gray-300 px-2 py-1 text-right">{{ getTotalCSAT() }}</td>
              <td class="border border-gray-300 px-2 py-1 text-right">100%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Agent Performance Table -->
      <div class="mb-6">
        <h2 class="text-lg font-bold text-gray-900 mb-3 border-b pb-2">Agent Performance Leaderboard</h2>
        <table class="w-full border-collapse border border-gray-300" style="font-size: 9px;">
          <thead>
            <tr class="bg-gray-100">
              <th class="border border-gray-300 px-1 py-1 text-center font-semibold">Rank</th>
              <th class="border border-gray-300 px-2 py-1 text-left font-semibold">Agent Name</th>
              <th class="border border-gray-300 px-1 py-1 text-right font-semibold">Assigned</th>
              <th class="border border-gray-300 px-1 py-1 text-right font-semibold">Resolved</th>
              <th class="border border-gray-300 px-1 py-1 text-right font-semibold">Res.Rate</th>
              <th class="border border-gray-300 px-1 py-1 text-right font-semibold">Avg Time</th>
              <th class="border border-gray-300 px-1 py-1 text-right font-semibold">FCR%</th>
              <th class="border border-gray-300 px-1 py-1 text-right font-semibold">CSAT</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!agentPerformanceData || agentPerformanceData.length === 0">
              <td colspan="8" class="border border-gray-300 px-3 py-4 text-center text-gray-500">No agent performance data available</td>
            </tr>
            <tr v-for="(agent, index) in agentPerformanceData" :key="index" :class="{ 'bg-gray-50': index % 2 === 0 }">
              <td class="border border-gray-300 px-1 py-1 text-center">{{ agent.rank || (index + 1) }}</td>
              <td class="border border-gray-300 px-2 py-1">{{ agent.name }}</td>
              <td class="border border-gray-300 px-1 py-1 text-right">{{ agent.assigned }}</td>
              <td class="border border-gray-300 px-1 py-1 text-right">{{ agent.resolved }}</td>
              <td class="border border-gray-300 px-1 py-1 text-right">{{ getAgentResolutionRate(agent) }}%</td>
              <td class="border border-gray-300 px-1 py-1 text-right">{{ formatResolutionTime(agent.resolutionTime) }}</td>
              <td class="border border-gray-300 px-1 py-1 text-right">{{ agent.fcrRate }}%</td>
              <td class="border border-gray-300 px-1 py-1 text-right">{{ agent.csatRating }}/5</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Call Statistics & Callback Status Table -->
      <div class="mb-6">
        <h2 class="text-lg font-bold text-gray-900 mb-3 border-b pb-2">Call Statistics & Callback Status</h2>
        <table class="w-full border-collapse border border-gray-300" style="font-size: 11px;">
          <thead>
            <tr class="bg-gray-100">
              <th class="border border-gray-300 px-3 py-1 text-left font-semibold">Metric</th>
              <th class="border border-gray-300 px-3 py-1 text-right font-semibold">Count</th>
              <th class="border border-gray-300 px-3 py-1 text-right font-semibold">Percentage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-gray-300 px-3 py-1">Total Inbound Calls</td>
              <td class="border border-gray-300 px-3 py-1 text-right font-medium">{{ formatNumber(callStatisticsData.inbound) }}</td>
              <td class="border border-gray-300 px-3 py-1 text-right">-</td>
            </tr>
            <tr class="bg-gray-50">
              <td class="border border-gray-300 px-3 py-1">Total Outbound Calls</td>
              <td class="border border-gray-300 px-3 py-1 text-right font-medium">{{ formatNumber(callStatisticsData.outbound) }}</td>
              <td class="border border-gray-300 px-3 py-1 text-right">-</td>
            </tr>
            <tr>
              <td class="border border-gray-300 px-3 py-1">Completed Calls</td>
              <td class="border border-gray-300 px-3 py-1 text-right font-medium">{{ formatNumber(callStatisticsData.completed) }}</td>
              <td class="border border-gray-300 px-3 py-1 text-right">-</td>
            </tr>
            <tr class="bg-gray-50">
              <td class="border border-gray-300 px-3 py-1">Missed Calls</td>
              <td class="border border-gray-300 px-3 py-1 text-right font-medium">{{ formatNumber(callStatisticsData.missed) }}</td>
              <td class="border border-gray-300 px-3 py-1 text-right">-</td>
            </tr>
            <tr>
              <td class="border border-gray-300 px-3 py-1">Average Call Duration</td>
              <td class="border border-gray-300 px-3 py-1 text-right font-medium">{{ formatResolutionTime(callStatisticsData.avgDuration) }}</td>
              <td class="border border-gray-300 px-3 py-1 text-right">-</td>
            </tr>
            <tr class="bg-blue-50 font-semibold">
              <td class="border border-gray-300 px-3 py-1">Total Calls</td>
              <td class="border border-gray-300 px-3 py-1 text-right">{{ formatNumber(callStatisticsData.inbound + callStatisticsData.outbound) }}</td>
              <td class="border border-gray-300 px-3 py-1 text-right">-</td>
            </tr>
            <tr>
              <td class="border border-gray-300 px-3 py-1">Pending Callbacks</td>
              <td class="border border-gray-300 px-3 py-1 text-right font-medium">{{ formatNumber(callbackStatusData.pending) }}</td>
              <td class="border border-gray-300 px-3 py-1 text-right">{{ getCallbackPercentage(callbackStatusData.pending) }}%</td>
            </tr>
            <tr class="bg-green-50">
              <td class="border border-gray-300 px-3 py-1">Callback Success Rate</td>
              <td class="border border-gray-300 px-3 py-1 text-right font-medium" colspan="2">{{ callbackStatusData.successRate }}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Inbound Call Trends Table -->
      <div class="mb-6">
        <h2 class="text-lg font-bold text-gray-900 mb-3 border-b pb-2">Inbound Call Trends</h2>
        <table class="w-full border-collapse border border-gray-300" style="font-size: 9px;">
          <thead>
            <tr class="bg-gray-100">
              <th class="border border-gray-300 px-3 py-2 text-left font-semibold">Date</th>
              <th class="border border-gray-300 px-3 py-2 text-right font-semibold">Inbound Calls</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!callTrendsData.labels || callTrendsData.labels.length === 0">
              <td colspan="2" class="border border-gray-300 px-3 py-4 text-center text-gray-500">No inbound call trends data available</td>
            </tr>
            <tr v-for="(label, index) in callTrendsData.labels" :key="index" :class="{ 'bg-gray-50': index % 2 === 0 }">
              <td class="border border-gray-300 px-3 py-2">{{ label }}</td>
              <td class="border border-gray-300 px-3 py-2 text-right font-medium">{{ callTrendsData.inbound[index] || 0 }}</td>
            </tr>
            <tr v-if="callTrendsData.labels && callTrendsData.labels.length > 0" class="bg-blue-50 font-semibold">
              <td class="border border-gray-300 px-3 py-2">Total</td>
              <td class="border border-gray-300 px-3 py-2 text-right">{{ callTrendsData.inbound.reduce((a, b) => a + b, 0) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Outbound Call Trends Table -->
      <div class="mb-6">
        <h2 class="text-lg font-bold text-gray-900 mb-3 border-b pb-2">Outbound Call Trends</h2>
        <table class="w-full border-collapse border border-gray-300" style="font-size: 9px;">
          <thead>
            <tr class="bg-gray-100">
              <th class="border border-gray-300 px-3 py-2 text-left font-semibold">Date</th>
              <th class="border border-gray-300 px-3 py-2 text-right font-semibold">Outbound Calls</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!callTrendsData.labels || callTrendsData.labels.length === 0">
              <td colspan="2" class="border border-gray-300 px-3 py-4 text-center text-gray-500">No outbound call trends data available</td>
            </tr>
            <tr v-for="(label, index) in callTrendsData.labels" :key="index" :class="{ 'bg-gray-50': index % 2 === 0 }">
              <td class="border border-gray-300 px-3 py-2">{{ label }}</td>
              <td class="border border-gray-300 px-3 py-2 text-right font-medium">{{ callTrendsData.outbound[index] || 0 }}</td>
            </tr>
            <tr v-if="callTrendsData.labels && callTrendsData.labels.length > 0" class="bg-blue-50 font-semibold">
              <td class="border border-gray-300 px-3 py-2">Total</td>
              <td class="border border-gray-300 px-3 py-2 text-right">{{ callTrendsData.outbound.reduce((a, b) => a + b, 0) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Product Performance Table -->
      <div class="mb-6">
        <h2 class="text-lg font-bold text-gray-900 mb-3 border-b pb-2">Product Performance Breakdown</h2>
        <table class="w-full border-collapse border border-gray-300" style="font-size: 10px;">
          <thead>
            <tr class="bg-gray-100">
              <th class="border border-gray-300 px-3 py-2 text-left font-semibold">Product</th>
              <th class="border border-gray-300 px-3 py-2 text-right font-semibold">Total Tickets</th>
              <th class="border border-gray-300 px-3 py-2 text-right font-semibold">Avg Resolution Time</th>
              <th class="border border-gray-300 px-3 py-2 text-right font-semibold">CSAT</th>
              <th class="border border-gray-300 px-3 py-2 text-right font-semibold">Volume Trend</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!productPerformanceData || productPerformanceData.length === 0">
              <td colspan="5" class="border border-gray-300 px-3 py-4 text-center text-gray-500">No product performance data available</td>
            </tr>
            <tr v-for="(product, index) in productPerformanceData" :key="index" :class="{ 'bg-gray-50': index % 2 === 0 }">
              <td class="border border-gray-300 px-3 py-2">{{ product.category }}</td>
              <td class="border border-gray-300 px-3 py-2 text-right font-medium">{{ formatNumber(product.volume) }}</td>
              <td class="border border-gray-300 px-3 py-2 text-right">{{ formatResolutionTime(product.resolutionTime) }}</td>
              <td class="border border-gray-300 px-3 py-2 text-right font-medium">{{ product.csat }}/5</td>
              <td class="border border-gray-300 px-3 py-2 text-right">{{ product.volumeTrend > 0 ? '+' : '' }}{{ product.volumeTrend }}%</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>

    <!-- Main Content Area -->
    <div class="flex-1 overflow-auto p-6 analytics-content">
      <!-- Summary Cards -->
      <!-- Main Cards Container -->
      <div class="space-y-6 mb-6">
        <!-- Main Card 1: Ticket Status Metrics -->
        <div class="bg-white rounded-lg shadow-md border border-gray-300 p-4">
          <h2 class="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Ticket Status</h2>
          <div class="grid grid-cols-3 gap-3">
        <!-- Total Tickets -->
        <div class="min-w-0 flex flex-col items-stretch">
          <div class="flex flex-col items-center text-center p-1 h-full">
            <div class="p-1 bg-blue-100 rounded mb-1 flex-shrink-0">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p class="text-base font-bold text-gray-900 truncate w-full">
              {{ metrics.isLoading ? '...' : formatNumber(metrics.totalTickets) }}
            </p>
            <p class="text-sm text-gray-500 text-center leading-tight truncate w-full">Total Tickets</p>
          </div>
        </div>

        <!-- Assigned -->
        <div class="min-w-0 flex flex-col items-stretch">
          <div class="flex flex-col items-center text-center p-1 h-full">
            <div class="p-1 bg-indigo-100 rounded mb-1 flex-shrink-0">
              <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p class="text-base font-bold text-gray-900 truncate w-full">
              {{ metrics.isLoading ? '...' : formatNumber(metrics.assignedCount) }}
            </p>
            <p class="text-sm text-gray-500 text-center leading-tight truncate w-full">Assigned</p>
          </div>
        </div>

        <!-- Pending -->
        <div class="min-w-0 flex flex-col items-stretch">
          <div class="flex flex-col items-center text-center p-1 h-full">
            <div class="p-1 bg-orange-100 rounded mb-1 flex-shrink-0">
              <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="text-base font-bold text-gray-900 truncate w-full">
              {{ metrics.isLoading ? '...' : formatNumber(metrics.pendingCount) }}
            </p>
            <p class="text-sm text-gray-500 text-center leading-tight truncate w-full">Pending</p>
          </div>
        </div>

        <!-- In Progress -->
        <div class="min-w-0 flex flex-col items-stretch">
          <div class="flex flex-col items-center text-center p-1 h-full">
            <div class="p-1 bg-cyan-100 rounded mb-1 flex-shrink-0">
              <svg class="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p class="text-base font-bold text-gray-900 truncate w-full">
              {{ metrics.isLoading ? '...' : formatNumber(metrics.inProgressCount) }}
            </p>
            <p class="text-sm text-gray-500 text-center leading-tight truncate w-full">In Progress</p>
          </div>
        </div>

        <!-- Resolved -->
        <div class="min-w-0 flex flex-col items-stretch">
          <div class="flex flex-col items-center text-center p-1 h-full">
            <div class="p-1 bg-green-100 rounded mb-1 flex-shrink-0">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="text-base font-bold text-gray-900 truncate w-full">
              {{ metrics.isLoading ? '...' : formatNumber(metrics.resolvedCount) }}
            </p>
            <p class="text-sm text-gray-500 text-center leading-tight truncate w-full">Resolved</p>
          </div>
        </div>

        <!-- Closed -->

        <div class="min-w-0 flex flex-col items-stretch">
          <div class="flex flex-col items-center text-center p-1 h-full">
            <div class="p-1 bg-gray-100 rounded mb-1 flex-shrink-0">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p class="text-base font-bold text-gray-900 truncate w-full">
              {{ metrics.isLoading ? '...' : formatNumber(metrics.closedCount) }}
            </p>
            <p class="text-sm text-gray-500 text-center leading-tight truncate w-full">Closed</p>
          </div>
        </div>
          </div>
        </div>

        <!-- Main Card 2: Performance Metrics -->
        <div class="bg-white rounded-lg shadow-md border border-gray-300 p-4">
          <h2 class="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Performance Metrics</h2>
          <div class="flex flex-row gap-4">

        <!-- Avg Resolution Time -->
        <div class="flex-1 min-w-0 flex flex-col items-stretch">
          <div class="flex flex-col items-center text-center p-1 h-full">
            <div class="p-1 bg-yellow-100 rounded mb-1 flex-shrink-0">
              <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="text-base font-bold text-gray-900 truncate w-full">
              {{ metrics.isLoading ? '...' : formatResolutionTime(metrics.avgResolutionTimeMinutes) }}
            </p>
            <p class="text-sm text-gray-500 text-center leading-tight truncate w-full">Avg Resolution Time</p>
          </div>
        </div>

        <!-- Avg Reconnection Time -->
        <div class="flex-1 min-w-0 flex flex-col items-stretch">
          <div class="flex flex-col items-center text-center p-1 h-full">
            <div class="p-1 bg-pink-100 rounded mb-1 flex-shrink-0">
              <svg class="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p class="text-base font-bold text-gray-900 truncate w-full">
              {{ metrics.isLoading ? '...' : `${formatResolutionTime(metrics.avgReconnectionTimeMinutes)}(${formatNumber(metrics.reconnectionCount)})` }}
            </p>
            <p class="text-sm text-gray-500 text-center leading-tight truncate w-full">Avg Reconnection Time</p>
          </div>
        </div>

        <!-- First Call Resolution Rate -->
        <div class="flex-1 min-w-0 flex flex-col items-stretch">
          <div class="flex flex-col items-center text-center p-1 h-full">
            <div class="p-1 bg-teal-100 rounded mb-1 flex-shrink-0">
              <svg class="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="text-base font-bold text-gray-900 truncate w-full">
              {{ metrics.isLoading ? '...' : `${metrics.fcrRate}%(${formatNumber(metrics.fcrCount)})` }}
            </p>
            <p class="text-sm text-gray-500 text-center leading-tight truncate w-full">FCR Rate (%)</p>
          </div>
        </div>

        <!-- Avg Customer Satisfaction -->
        <div class="flex-1 min-w-0 flex flex-col items-stretch">
          <div class="flex flex-col items-center text-center p-1 h-full">
            <div class="p-1 bg-purple-100 rounded mb-1 flex-shrink-0">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            </div>
            <p class="text-base font-bold text-gray-900 truncate w-full">
              {{ metrics.isLoading ? '...' : `${Math.round((metrics.csatScore / 5) * 100)}% | ${metrics.csatScore}/5 | (${formatNumber(metrics.csatCount)})` }}
            </p>
            <p class="text-sm text-gray-500 text-center leading-tight truncate w-full">Avg Customer Satisfaction</p>
          </div>
        </div>

        <!-- Callback Completion Rate -->
        <div class="flex-1 min-w-0 flex flex-col items-stretch">
          <div class="flex flex-col items-center text-center p-1 h-full">
            <div class="p-1 bg-orange-100 rounded mb-1 flex-shrink-0">
              <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <p class="text-base font-bold text-gray-900 truncate w-full">
              {{ metrics.isLoading ? '...' : `${metrics.callbackCompletionRate}%(${formatNumber(metrics.callbackCount)})` }}
            </p>
            <p class="text-sm text-gray-500 text-center leading-tight truncate w-full">Callback Completion Rate (%)</p>
          </div>
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
        />
      </div>

      <!-- Freshdesk Tickets Line Chart Section -->
      <div class="mb-6">
        <!-- Freshdesk Tickets Created vs Resolved Over Time -->
        <LineChart
          title="Freshdesk Tickets Created vs Resolved Over Time"
          :created-data="freshdeskTicketTrends.created"
          :resolved-data="freshdeskTicketTrends.resolved"
          :x-labels="freshdeskTicketTrends.labels"
        />
      </div>

      <!-- Resolution Time Distribution Chart Section -->
      <div class="mb-6">
        <!-- Resolution Time Distribution -->
        <TimeDistributionChart
          title="Resolution Time Distribution"
          :time-data="timeDistributionData"
          :show-summary="false"
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
          :show-summary="false"
        />
      </div>

      <!-- Agent Performance Table Section -->
      <div class="mb-6">
        <!-- Agent Performance Leaderboard -->
        <AgentPerformanceTable
          title="Agent Performance Leaderboard"
          :agent-data="agentPerformanceData"
        />
      </div>

      <!-- Call Statistics Chart Section -->
      <div class="mb-6">
        <!-- Call Statistics -->
        <CallStatisticsChart
          title="Call Statistics"
          :call-data="callStatisticsData"
          :callback-data="callbackStatusData"
          :trends-data="callTrendsData"
        />
      </div>

      <!-- Product Performance Table Section -->
      <div class="mb-6">
        <!-- Product Performance Breakdown -->
        <ProductPerformanceTable
          title="Product Performance Breakdown"
          :product-data="productPerformanceData"
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
import html2pdf from 'html2pdf.js'

export default {
  name: 'AnalyticsPage',
  components: {
    LineChart,
    TimeDistributionChart,
    CustomerSatisfactionChart,
    AgentPerformanceTable,
    CallStatisticsChart,
    ProductPerformanceTable
  },

  data() {
    return {
      // Loading state
      loading: false,

      // Filter dropdown state
      showFilterDropdown: false,
      showExportDropdown: false,
      isExportingPDF: false,

      // Auto-refresh
      refreshInterval: null,

      // Expanded sections in filter dropdown
      expandedSections: {
        agents: false,
        products: false,
        status: false,
        ticketTypes: false,
        teams: false
      },

      // Analytics filters
      analyticsFilters: {
        dateRange: '30',
        agents: [],
        products: [],
        status: [],
        ticketTypes: [],
        teams: []
      },

      // Custom date range
      customDateRange: {
        start: this.getDateDaysAgo(30),
        end: this.getDateDaysAgo(0)
      },

      // Filter options (loaded from backend)
      agentOptions: [],
      productOptions: [],
      statusOptions: [],
      ticketTypeOptions: [],
      teamOptions: [],
      metrics: {
        totalTickets: 0,
        assignedCount: 0,
        pendingCount: 0,
        inProgressCount: 0,
        resolvedCount: 0,
        closedCount: 0,
        ticketsChange: 0,
        avgResolutionTimeMinutes: 0,
        avgReconnectionTimeMinutes: 0,
        reconnectionCount: 0,
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
      freshdeskTicketTrends: {
        created: [],
        resolved: [],
        labels: []
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
      callTrendsData: {
        labels: [],
        inbound: [],
        outbound: [],
        missed: [],
        completed: [],
        pending: []
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
             this.analyticsFilters.ticketTypes.length > 0 ||
             this.analyticsFilters.teams.length > 0 ||
             this.analyticsFilters.dateRange !== '30'
    },

    // Generate active filter chips for display
    activeFilterChips() {
      const chips = []

      // Date range chip
      if (this.analyticsFilters.dateRange !== '30') {
        if (this.analyticsFilters.dateRange === 'custom') {
          // Custom date range chip
          if (this.customDateRange.start && this.customDateRange.end) {
            chips.push({
              key: `dateRange-custom`,
              label: `Date: ${this.customDateRange.start} to ${this.customDateRange.end}`,
              type: 'dateRange',
              value: 'custom'
            })
          }
        } else {
          // Predefined date range chip
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

      // Ticket type chips
      this.analyticsFilters.ticketTypes.forEach(ticketType => {
        const typeOption = this.ticketTypeOptions.find(t => t.value === ticketType)
        if (typeOption) {
          chips.push({
            key: `ticketType-${ticketType}`,
            label: `Type: ${typeOption.label}`,
            type: 'ticketType',
            value: ticketType
          })
        }
      })

      // Team chips
      this.analyticsFilters.teams.forEach(team => {
        const teamOption = this.teamOptions.find(t => t.teamName === team)
        if (teamOption) {
          chips.push({
            key: `team-${team}`,
            label: `Team: ${teamOption.teamName}`,
            type: 'team',
            value: team
          })
        }
      })

      return chips
    }
  },

  methods: {
    // Refresh all analytics data
    async refreshAllData() {
      const startTime = Date.now()
      this.loading = true

      try {
        await Promise.all([
          this.fetchAnalyticsData(),
          this.fetchTicketTrends(),
          this.fetchFreshdeskTicketTrends(),
          this.fetchResolutionTimeDistribution(),
          this.fetchCustomerSatisfactionDistribution(),
          this.fetchAgentPerformance(),
          this.fetchCallStatistics(),
          this.fetchCallTrends(),
          this.fetchProductPerformance(),
          this.fetchCallbackStatus()
        ])
      } finally {
        // Ensure loading indicator shows for at least 1 second
        const elapsedTime = Date.now() - startTime
        const minimumLoadingTime = 1000 // 1 second
        if (elapsedTime < minimumLoadingTime) {
          setTimeout(() => {
            this.loading = false
          }, minimumLoadingTime - elapsedTime)
        } else {
          this.loading = false
        }
      }
    },

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
      this.fetchFreshdeskTicketTrends(period);
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
      this.fetchCallTrends(period);
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
      this.showExportDropdown = false // Close export dropdown when opening filter
    },

    // Close filter dropdown
    closeFilterDropdown() {
      this.showFilterDropdown = false
    },

    toggleExportDropdown() {
      this.showExportDropdown = !this.showExportDropdown
      this.showFilterDropdown = false // Close filter dropdown when opening export
    },

    // Toggle filter section (collapsible sections inside filter dropdown)
    toggleFilterSection(section) {
      this.expandedSections[section] = !this.expandedSections[section]
    },

    // Select all filters
    selectAllFilters() {
      this.analyticsFilters.agents = this.agentOptions.map(a => a.value)
      this.analyticsFilters.products = this.productOptions.map(p => p.value)
      this.analyticsFilters.status = this.statusOptions.map(s => s.value)
      this.analyticsFilters.ticketTypes = this.ticketTypeOptions.map(t => t.value)
      this.analyticsFilters.teams = this.teamOptions.map(t => t.teamName)
      this.applyFilters()
    },

    // Clear all filters
    clearAllFilters() {
      this.analyticsFilters.agents = []
      this.analyticsFilters.products = []
      this.analyticsFilters.status = []
      this.analyticsFilters.ticketTypes = []
      this.analyticsFilters.teams = []
      this.analyticsFilters.dateRange = '30'
      // Clear custom date range
      this.customDateRange.start = ''
      this.customDateRange.end = ''
      this.applyFilters()
    },

    // Remove individual filter
    removeFilter(key) {
      // Split only on the first dash to handle values with dashes (like "agent-1")
      const firstDashIndex = key.indexOf('-')
      const type = key.substring(0, firstDashIndex)
      const value = key.substring(firstDashIndex + 1)

      if (type === 'dateRange') {
        this.analyticsFilters.dateRange = '30'
        // Also clear custom date range
        if (value === 'custom') {
          this.customDateRange.start = ''
          this.customDateRange.end = ''
        }
      } else if (type === 'agent') {
        this.analyticsFilters.agents = this.analyticsFilters.agents.filter(a => a !== value)
      } else if (type === 'product') {
        this.analyticsFilters.products = this.analyticsFilters.products.filter(p => p !== value)
      } else if (type === 'status') {
        this.analyticsFilters.status = this.analyticsFilters.status.filter(s => s !== value)
      } else if (type === 'ticketType') {
        this.analyticsFilters.ticketTypes = this.analyticsFilters.ticketTypes.filter(t => t !== value)
      } else if (type === 'team') {
        this.analyticsFilters.teams = this.analyticsFilters.teams.filter(t => t !== value)
      }

      this.applyFilters()
    },

    // Handle date range dropdown change
    handleDateRangeChange() {
      // If custom is selected, clear previous custom date values
      if (this.analyticsFilters.dateRange === 'custom') {
        this.customDateRange.start = ''
        this.customDateRange.end = ''
      } else {
        // For non-custom ranges, apply filters immediately
        this.applyFilters()
      }
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
        this.fetchFreshdeskTicketTrends()
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
        this.fetchCallTrends()
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
      const exportDropdown = this.$refs.exportDropdownRef

      if (filterDropdown && !filterDropdown.contains(event.target)) {
        this.showFilterDropdown = false
      }

      if (exportDropdown && !exportDropdown.contains(event.target)) {
        this.showExportDropdown = false
      }
    },

    // Fetch analytics card data from backend
    async fetchAnalyticsData() {
      try {
        this.metrics.isLoading = true;
        console.log('Fetching analytics cards data...');

        // Build query parameters from current filters
        const queryParams = new URLSearchParams();

        // Add date range
        if (this.analyticsFilters.dateRange === 'custom') {
          queryParams.append('dateRange', 'custom');
          if (this.customDateRange.start) {
            queryParams.append('startDate', this.customDateRange.start);
          }
          if (this.customDateRange.end) {
            queryParams.append('endDate', this.customDateRange.end);
          }
        } else {
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

        // Add ticket type filters
        if (this.analyticsFilters.ticketTypes && this.analyticsFilters.ticketTypes.length > 0) {
          this.analyticsFilters.ticketTypes.forEach(ticketType => {
            queryParams.append('ticketTypes', ticketType);
          });
        }

        // Add team filters
        if (this.analyticsFilters.teams && this.analyticsFilters.teams.length > 0) {
          this.analyticsFilters.teams.forEach(team => {
            queryParams.append('teams', team);
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
          this.metrics.assignedCount = data.assignedCount || 0;
          this.metrics.pendingCount = data.pendingCount || 0;
          this.metrics.inProgressCount = data.inProgressCount || 0;
          this.metrics.resolvedCount = data.resolvedCount || 0;
          this.metrics.closedCount = data.closedCount || 0;
          this.metrics.avgResolutionTimeMinutes = data.avgResolutionTime?.minutes || 0;
          this.metrics.avgReconnectionTimeMinutes = data.avgReconnectionTime?.minutes || 0;
          this.metrics.reconnectionCount = data.avgReconnectionTime?.count || 0;
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
            assignedCount: this.metrics.assignedCount,
            pendingCount: this.metrics.pendingCount,
            inProgressCount: this.metrics.inProgressCount,
            resolvedCount: this.metrics.resolvedCount,
            closedCount: this.metrics.closedCount,
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
        this.metrics.assignedCount = 0;
        this.metrics.pendingCount = 0;
        this.metrics.inProgressCount = 0;
        this.metrics.resolvedCount = 0;
        this.metrics.closedCount = 0;
        this.metrics.avgResolutionTimeMinutes = 0;
        this.metrics.avgReconnectionTimeMinutes = 0;
        this.metrics.reconnectionCount = 0;
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

        // Handle custom date range
        if (this.analyticsFilters.dateRange === 'custom') {
          queryParams.append('dateRange', 'custom');
          if (this.customDateRange.start) {
            queryParams.append('startDate', this.customDateRange.start);
          }
          if (this.customDateRange.end) {
            queryParams.append('endDate', this.customDateRange.end);
          }
        } else {
          queryParams.append('dateRange', dateRange);
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

        // Add ticket type filters
        if (this.analyticsFilters.ticketTypes && this.analyticsFilters.ticketTypes.length > 0) {
          this.analyticsFilters.ticketTypes.forEach(ticketType => {
            queryParams.append('ticketTypes', ticketType);
          });
        }

        // Add team filters
        if (this.analyticsFilters.teams && this.analyticsFilters.teams.length > 0) {
          this.analyticsFilters.teams.forEach(team => {
            queryParams.append('teams', team);
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

    // Fetch Freshdesk ticket trends data
    async fetchFreshdeskTicketTrends(period = null) {
      try {
        console.log('Fetching Freshdesk ticket trends data...');

        // Use current period if not specified
        const dateRange = period || this.ticketTrendsPeriod;

        // Build query parameters from current filters
        const queryParams = new URLSearchParams();

        // Handle custom date range
        if (this.analyticsFilters.dateRange === 'custom') {
          queryParams.append('dateRange', 'custom');
          if (this.customDateRange.start) {
            queryParams.append('startDate', this.customDateRange.start);
          }
          if (this.customDateRange.end) {
            queryParams.append('endDate', this.customDateRange.end);
          }
        } else {
          queryParams.append('dateRange', dateRange);
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

        // Add team filters
        if (this.analyticsFilters.teams && this.analyticsFilters.teams.length > 0) {
          this.analyticsFilters.teams.forEach(team => {
            queryParams.append('teams', team);
          });
        }

        const queryString = queryParams.toString();
        const url = `http://localhost:5001/analytics/freshdesk-ticket-trends${queryString ? '?' + queryString : ''}`;

        const response = await $fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response && response.data) {
          // Update Freshdesk ticket trends with real data
          this.freshdeskTicketTrends.labels = response.data.labels;
          this.freshdeskTicketTrends.created = response.data.created;
          this.freshdeskTicketTrends.resolved = response.data.resolved;

          console.log('Freshdesk ticket trends data updated:', {
            labels: this.freshdeskTicketTrends.labels.length,
            created: this.freshdeskTicketTrends.created,
            resolved: this.freshdeskTicketTrends.resolved
          });
        }

      } catch (error) {
        console.error('Error fetching Freshdesk ticket trends data:', error);
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

        // Handle custom date range
        if (this.analyticsFilters.dateRange === 'custom') {
          queryParams.append('dateRange', 'custom');
          if (this.customDateRange.start) {
            queryParams.append('startDate', this.customDateRange.start);
          }
          if (this.customDateRange.end) {
            queryParams.append('endDate', this.customDateRange.end);
          }
        } else {
          queryParams.append('dateRange', dateRange);
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

        // Add ticket type filters
        if (this.analyticsFilters.ticketTypes && this.analyticsFilters.ticketTypes.length > 0) {
          this.analyticsFilters.ticketTypes.forEach(ticketType => {
            queryParams.append('ticketTypes', ticketType);
          });
        }

        // Add team filters
        if (this.analyticsFilters.teams && this.analyticsFilters.teams.length > 0) {
          this.analyticsFilters.teams.forEach(team => {
            queryParams.append('teams', team);
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

        // Handle custom date range
        if (this.analyticsFilters.dateRange === 'custom') {
          queryParams.append('dateRange', 'custom');
          if (this.customDateRange.start) {
            queryParams.append('startDate', this.customDateRange.start);
          }
          if (this.customDateRange.end) {
            queryParams.append('endDate', this.customDateRange.end);
          }
        } else {
          queryParams.append('dateRange', dateRange);
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

        // Add ticket type filters
        if (this.analyticsFilters.ticketTypes && this.analyticsFilters.ticketTypes.length > 0) {
          this.analyticsFilters.ticketTypes.forEach(ticketType => {
            queryParams.append('ticketTypes', ticketType);
          });
        }

        // Add team filters
        if (this.analyticsFilters.teams && this.analyticsFilters.teams.length > 0) {
          this.analyticsFilters.teams.forEach(team => {
            queryParams.append('teams', team);
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

        // Handle custom date range
        if (this.analyticsFilters.dateRange === 'custom') {
          queryParams.append('dateRange', 'custom');
          if (this.customDateRange.start) {
            queryParams.append('startDate', this.customDateRange.start);
          }
          if (this.customDateRange.end) {
            queryParams.append('endDate', this.customDateRange.end);
          }
        } else {
          queryParams.append('dateRange', dateRange);
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

        // Add ticket type filters
        if (this.analyticsFilters.ticketTypes && this.analyticsFilters.ticketTypes.length > 0) {
          this.analyticsFilters.ticketTypes.forEach(ticketType => {
            queryParams.append('ticketTypes', ticketType);
          });
        }

        // Add team filters
        if (this.analyticsFilters.teams && this.analyticsFilters.teams.length > 0) {
          this.analyticsFilters.teams.forEach(team => {
            queryParams.append('teams', team);
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

        // Handle custom date range
        if (this.analyticsFilters.dateRange === 'custom') {
          queryParams.append('dateRange', 'custom');
          if (this.customDateRange.start) {
            queryParams.append('startDate', this.customDateRange.start);
          }
          if (this.customDateRange.end) {
            queryParams.append('endDate', this.customDateRange.end);
          }
        } else {
          queryParams.append('dateRange', dateRange);
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

        // Add ticket type filters
        if (this.analyticsFilters.ticketTypes && this.analyticsFilters.ticketTypes.length > 0) {
          this.analyticsFilters.ticketTypes.forEach(ticketType => {
            queryParams.append('ticketTypes', ticketType);
          });
        }

        // Add team filters
        if (this.analyticsFilters.teams && this.analyticsFilters.teams.length > 0) {
          this.analyticsFilters.teams.forEach(team => {
            queryParams.append('teams', team);
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

    // Fetch call trends data for line chart
    async fetchCallTrends(period = null) {
      try {
        console.log('Fetching call trends data...');

        // Use current period if not specified
        const dateRange = period || this.callStatisticsPeriod;

        // Build query parameters from current filters
        const queryParams = new URLSearchParams();

        // Handle custom date range
        if (this.analyticsFilters.dateRange === 'custom') {
          queryParams.append('dateRange', 'custom');
          if (this.customDateRange.start) {
            queryParams.append('startDate', this.customDateRange.start);
          }
          if (this.customDateRange.end) {
            queryParams.append('endDate', this.customDateRange.end);
          }
        } else {
          queryParams.append('dateRange', dateRange);
        }

        // Add other filters
        if (this.analyticsFilters.agents && this.analyticsFilters.agents.length > 0) {
          this.analyticsFilters.agents.forEach(agent => {
            queryParams.append('agents', agent);
          });
        }

        if (this.analyticsFilters.products && this.analyticsFilters.products.length > 0) {
          this.analyticsFilters.products.forEach(product => {
            queryParams.append('products', product);
          });
        }

        if (this.analyticsFilters.status && this.analyticsFilters.status.length > 0) {
          this.analyticsFilters.status.forEach(status => {
            queryParams.append('status', status);
          });
        }

        if (this.analyticsFilters.ticketTypes && this.analyticsFilters.ticketTypes.length > 0) {
          this.analyticsFilters.ticketTypes.forEach(type => {
            queryParams.append('ticketTypes', type);
          });
        }

        if (this.analyticsFilters.teams && this.analyticsFilters.teams.length > 0) {
          this.analyticsFilters.teams.forEach(team => {
            queryParams.append('teams', team);
          });
        }

        const queryString = queryParams.toString();
        const url = `http://localhost:5001/analytics/call-trends${queryString ? '?' + queryString : ''}`;

        const response = await $fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response && response.data) {
          this.callTrendsData = {
            labels: response.data.labels || [],
            inbound: response.data.inbound || [],
            outbound: response.data.outbound || [],
            missed: response.data.missed || [],
            completed: response.data.completed || [],
            pending: response.data.pending || []
          };

          console.log('Call trends data updated:', this.callTrendsData);
        }

      } catch (error) {
        console.error('Error fetching call trends data:', error);
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

        // Handle custom date range
        if (this.analyticsFilters.dateRange === 'custom') {
          queryParams.append('dateRange', 'custom');
          if (this.customDateRange.start) {
            queryParams.append('startDate', this.customDateRange.start);
          }
          if (this.customDateRange.end) {
            queryParams.append('endDate', this.customDateRange.end);
          }
        } else {
          queryParams.append('dateRange', dateRange);
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

        // Add ticket type filters
        if (this.analyticsFilters.ticketTypes && this.analyticsFilters.ticketTypes.length > 0) {
          this.analyticsFilters.ticketTypes.forEach(ticketType => {
            queryParams.append('ticketTypes', ticketType);
          });
        }

        // Add team filters
        if (this.analyticsFilters.teams && this.analyticsFilters.teams.length > 0) {
          this.analyticsFilters.teams.forEach(team => {
            queryParams.append('teams', team);
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

        // Handle custom date range
        if (this.analyticsFilters.dateRange === 'custom') {
          queryParams.append('dateRange', 'custom');
          if (this.customDateRange.start) {
            queryParams.append('startDate', this.customDateRange.start);
          }
          if (this.customDateRange.end) {
            queryParams.append('endDate', this.customDateRange.end);
          }
        } else {
          queryParams.append('dateRange', dateRange);
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

        // Add ticket type filters
        if (this.analyticsFilters.ticketTypes && this.analyticsFilters.ticketTypes.length > 0) {
          this.analyticsFilters.ticketTypes.forEach(ticketType => {
            queryParams.append('ticketTypes', ticketType);
          });
        }

        // Add team filters
        if (this.analyticsFilters.teams && this.analyticsFilters.teams.length > 0) {
          this.analyticsFilters.teams.forEach(team => {
            queryParams.append('teams', team);
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
    },

    // Fetch filter options from backend
    async fetchFilterOptions() {
      try {
        console.log('Fetching filter options...');

        const response = await $fetch('http://localhost:5001/analytics/filter-options', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response && response.data) {
          const data = response.data;

          // Update filter options with real data
          this.agentOptions = data.agents || [];
          this.productOptions = data.products || [];
          this.statusOptions = data.statuses || [];
          this.ticketTypeOptions = data.ticketTypes || [];
          this.teamOptions = data.teams || [];

          console.log('Filter options loaded:', {
            agents: this.agentOptions.length,
            products: this.productOptions.length,
            statuses: this.statusOptions.length,
            ticketTypes: this.ticketTypeOptions.length,
            teams: this.teamOptions.length
          });
        }

      } catch (error) {
        console.error('Error fetching filter options:', error);
        // Keep empty arrays if API fails
      }
    },

    // Export to PDF
    async exportToPDF() {
      try {
        this.showExportDropdown = false;

        // Show loading message
        console.log('Generating PDF...');

        // Store current filters
        const currentDateRange = this.analyticsFilters.dateRange;

        // Temporarily use current date range for all fetches
        const dateRangeToUse = this.analyticsFilters.dateRange;

        // Ensure all data is fetched before generating PDF
        console.log('Fetching all data for PDF export with date range:', dateRangeToUse);

        try {
          await Promise.all([
            this.fetchAnalyticsData(),
            this.fetchTicketTrends(dateRangeToUse),
            this.fetchFreshdeskTicketTrends(dateRangeToUse),
            this.fetchResolutionTimeDistribution(dateRangeToUse),
            this.fetchCustomerSatisfactionDistribution(dateRangeToUse),
            this.fetchAgentPerformance(dateRangeToUse),
            this.fetchCallStatistics(dateRangeToUse),
            this.fetchProductPerformance(dateRangeToUse),
            this.fetchCallbackStatus(dateRangeToUse),
            this.fetchCallTrends(dateRangeToUse)
          ]);
        } catch (fetchError) {
          console.error('Error fetching data:', fetchError);
          // Continue anyway with whatever data we have
        }

        const dataSummary = {
          totalTickets: this.metrics?.totalTickets || 0,
          agentPerformanceCount: this.agentPerformanceData?.length || 0,
          productPerformanceCount: this.productPerformanceData?.length || 0,
          callStatisticsInbound: this.callStatisticsData?.inbound || 0,
          callbackStatusTotal: this.callbackStatusData?.total || 0,
          callTrendsLabels: this.callTrendsData?.labels?.length || 0,
          ticketTrendsLabels: this.ticketTrends?.labels?.length || 0
        };

        console.log('All data fetched. Data summary:', dataSummary);
        console.log('Detailed Agent Performance Data:', this.agentPerformanceData);
        console.log('Detailed Product Performance Data:', this.productPerformanceData);
        console.log('Detailed Call Statistics Data:', this.callStatisticsData);

        // Log if data is available
        const dataAvailability = {
          hasAgentData: !!(this.agentPerformanceData && this.agentPerformanceData.length > 0),
          agentCount: this.agentPerformanceData?.length || 0,
          hasProductData: !!(this.productPerformanceData && this.productPerformanceData.length > 0),
          productCount: this.productPerformanceData?.length || 0,
          hasCallStatsData: !!(this.callStatisticsData && this.callStatisticsData.inbound !== undefined),
          callStatsInbound: this.callStatisticsData?.inbound || 0
        };

        console.log('Data availability check:', dataAvailability);

        // Show the export content
        this.isExportingPDF = true;

        // Wait for Vue to render the element and ensure DOM is ready
        await this.$nextTick();

        // Log data right before rendering
        console.log('Data right before PDF render:', {
          agentPerformanceData: JSON.stringify(this.agentPerformanceData),
          productPerformanceData: JSON.stringify(this.productPerformanceData),
          callStatisticsData: JSON.stringify(this.callStatisticsData),
          productPerformanceCount: this.productPerformanceData?.length || 0
        });

        await new Promise(resolve => setTimeout(resolve, 5000));

        // Use the export content
        const element = this.$refs.exportContent;

        if (!element) {
          this.isExportingPDF = false;
          throw new Error('Export content element not found');
        }

        console.log('Element found, generating PDF...', {
          scrollHeight: element.scrollHeight,
          clientHeight: element.clientHeight,
          offsetWidth: element.offsetWidth,
          offsetHeight: element.offsetHeight
        });

        // Log all table sections to verify they exist
        const tables = element.querySelectorAll('h2');
        console.log('Number of table sections found:', tables.length);
        tables.forEach((table, index) => {
          console.log(`Table ${index + 1}: ${table.textContent}`);
        });

        // Verify element has content
        if (element.scrollHeight < 100) {
          console.error('Element appears to be empty or not rendered properly');
          this.isExportingPDF = false;
          throw new Error('Export content is empty. Please ensure data is loaded.');
        }

        // Ensure we capture full content height
        const fullHeight = Math.max(element.scrollHeight, element.offsetHeight, element.clientHeight);
        console.log('Using full height for PDF:', fullHeight);

        const opt = {
          margin: 0,
          filename: `Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`,
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: {
            scale: 1.5,
            useCORS: true,
            logging: true,
            allowTaint: true,
            scrollY: 0,
            scrollX: 0,
            backgroundColor: '#ffffff',
            windowWidth: element.offsetWidth,
            windowHeight: fullHeight + 1000,
            width: element.offsetWidth,
            height: fullHeight + 1000,
            x: 0,
            y: 0,
            removeContainer: false,
            letterRendering: true
          },
          jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
            compress: true
          },
          pagebreak: {
            mode: ['avoid-all', 'css', 'legacy']
          },
          enableLinks: false
        };

        console.log('Starting PDF generation with html2pdf...');

        // Use html2pdf with proper multi-page support
        try {
          await html2pdf()
            .set(opt)
            .from(element)
            .toPdf()
            .get('pdf')
            .then(function (pdf) {
              const totalPages = pdf.internal.getNumberOfPages();
              console.log('Total pages in PDF:', totalPages);

              // Add page numbers
              for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFontSize(10);
                pdf.setTextColor(128);
                pdf.text('Page ' + i + ' of ' + totalPages, pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });
              }
            })
            .save();
        } catch (pdfError) {
          console.error('Error in PDF generation:', pdfError);
          throw pdfError;
        }

        // Hide the export content after generating PDF
        this.isExportingPDF = false;

        console.log('PDF generated successfully!');
        alert('PDF exported successfully!');
      } catch (error) {
        console.error('Error exporting to PDF:', error);
        this.isExportingPDF = false;
        alert('Error exporting to PDF: ' + error.message + '. Please try again.');
      }
    },

    // Export to Excel
    exportToExcel() {
      try {
        this.showExportDropdown = false;

        // Prepare data for Excel export with ALL analytics sections
        const exportData = {
          'Summary Metrics': [
            { Metric: 'Total Tickets', Value: this.formatNumber(this.metrics.totalTickets) },
            { Metric: 'Assigned Tickets', Value: this.formatNumber(this.metrics.assignedCount) },
            { Metric: 'Pending Tickets', Value: this.formatNumber(this.metrics.pendingCount) },
            { Metric: 'In Progress Tickets', Value: this.formatNumber(this.metrics.inProgressCount) },
            { Metric: 'Resolved Tickets', Value: this.formatNumber(this.metrics.resolvedCount) },
            { Metric: 'Closed Tickets', Value: this.formatNumber(this.metrics.closedCount) },
            { Metric: 'Avg Resolution Time', Value: this.formatResolutionTime(this.metrics.avgResolutionTimeMinutes) },
            { Metric: 'Avg Reconnection Time', Value: `${this.formatResolutionTime(this.metrics.avgReconnectionTimeMinutes)} (${this.formatNumber(this.metrics.reconnectionCount)} reconnections)` },
            { Metric: 'First Call Resolution Rate', Value: `${this.metrics.fcrRate}% (${this.formatNumber(this.metrics.fcrCount)} tickets)` },
            { Metric: 'Avg Customer Satisfaction', Value: `${this.metrics.csatScore}/5 or ${Math.round((this.metrics.csatScore / 5) * 100)}% (${this.formatNumber(this.metrics.csatCount)} ratings)` },
            { Metric: 'Callback Completion Rate', Value: `${this.metrics.callbackCompletionRate}% (${this.formatNumber(this.metrics.callbackCount)} completed)` }
          ],
          'Tickets Trends': this.ticketTrends.labels.map((label, index) => ({
            Date: label,
            Created: this.ticketTrends.created[index] || 0,
            Resolved: this.ticketTrends.resolved[index] || 0,
            Difference: (this.ticketTrends.resolved[index] || 0) - (this.ticketTrends.created[index] || 0)
          })),
          'Freshdesk Tickets Trends': this.freshdeskTicketTrends.labels?.map((label, index) => ({
            Date: label,
            Created: this.freshdeskTicketTrends.created[index] || 0,
            Resolved: this.freshdeskTicketTrends.resolved[index] || 0,
            Difference: (this.freshdeskTicketTrends.resolved[index] || 0) - (this.freshdeskTicketTrends.created[index] || 0)
          })) || [],
          'Resolution Time Distribution': this.timeDistributionData.map(item => ({
            'Time Range': item.timeRange,
            Count: item.total,
            Percentage: `${this.getTimeDistributionPercentage(item.total)}%`
          })),
          'Customer Satisfaction': [
            { Rating: '5 Stars (Very Satisfied)', Count: this.customerSatisfactionData[5] || 0, Percentage: `${this.getCSATPercentage(5)}%` },
            { Rating: '4 Stars (Satisfied)', Count: this.customerSatisfactionData[4] || 0, Percentage: `${this.getCSATPercentage(4)}%` },
            { Rating: '3 Stars (Neutral)', Count: this.customerSatisfactionData[3] || 0, Percentage: `${this.getCSATPercentage(3)}%` },
            { Rating: '2 Stars (Dissatisfied)', Count: this.customerSatisfactionData[2] || 0, Percentage: `${this.getCSATPercentage(2)}%` },
            { Rating: '1 Star (Very Dissatisfied)', Count: this.customerSatisfactionData[1] || 0, Percentage: `${this.getCSATPercentage(1)}%` }
          ],
          'Agent Performance': this.agentPerformanceData.map(agent => ({
            Rank: agent.rank || '',
            Name: agent.name,
            Assigned: agent.assigned,
            Resolved: agent.resolved,
            'Resolution Rate': `${this.getAgentResolutionRate(agent)}%`,
            'Avg Resolution Time': this.formatResolutionTime(agent.resolutionTime),
            'FCR Rate': `${agent.fcrRate}%`,
            'CSAT Rating': `${agent.csatRating}/5`
          })),
          'Call Statistics & Callback Status': [
            { Metric: 'Total Inbound Calls', Count: this.formatNumber(this.callStatisticsData.inbound), Percentage: '-' },
            { Metric: 'Total Outbound Calls', Count: this.formatNumber(this.callStatisticsData.outbound), Percentage: '-' },
            { Metric: 'Completed Calls', Count: this.formatNumber(this.callStatisticsData.completed), Percentage: '-' },
            { Metric: 'Missed Calls', Count: this.formatNumber(this.callStatisticsData.missed), Percentage: '-' },
            { Metric: 'Average Call Duration', Count: this.formatResolutionTime(this.callStatisticsData.avgDuration), Percentage: '-' },
            { Metric: 'Total Calls', Count: this.formatNumber(this.callStatisticsData.inbound + this.callStatisticsData.outbound), Percentage: '-' },
            { Metric: 'Pending Callbacks', Count: this.formatNumber(this.callbackStatusData.pending), Percentage: `${this.getCallbackPercentage(this.callbackStatusData.pending)}%` },
            { Metric: 'Callback Success Rate', Count: `${this.callbackStatusData.successRate}%`, Percentage: '-' }
          ],
          'Inbound Call Trends': this.callTrendsData.labels?.map((label, index) => ({
            Date: label,
            'Inbound Calls': this.callTrendsData.inbound[index] || 0
          })) || [],
          'Outbound Call Trends': this.callTrendsData.labels?.map((label, index) => ({
            Date: label,
            'Outbound Calls': this.callTrendsData.outbound[index] || 0
          })) || [],
          'Product Performance': this.productPerformanceData.map(product => ({
            Product: product.category,
            'Total Tickets': this.formatNumber(product.volume),
            'Avg Resolution Time': this.formatResolutionTime(product.resolutionTime),
            'CSAT': `${product.csat}/5`,
            'Volume Trend': `${product.volumeTrend > 0 ? '+' : ''}${product.volumeTrend}%`
          }))
        };

        // Convert to CSV format (simple implementation)
        let csv = '';
        Object.keys(exportData).forEach(sheet => {
          csv += `\n${sheet}\n`;
          const data = exportData[sheet];
          if (data.length > 0) {
            const headers = Object.keys(data[0]);
            csv += headers.join(',') + '\n';
            data.forEach(row => {
              csv += headers.map(h => row[h]).join(',') + '\n';
            });
          }
        });

        // Download CSV file
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        console.log('Excel/CSV exported successfully!');
      } catch (error) {
        console.error('Error exporting to Excel:', error);
        alert('Error exporting to Excel. Please try again.');
      }
    },

    // Share snapshot
    shareSnapshot() {
      this.showExportDropdown = false;

      // Generate a shareable link (mock implementation)
      const shareUrl = window.location.href;

      // Copy to clipboard
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl).then(() => {
          alert('Dashboard link copied to clipboard! You can share it with others.');
        }).catch(() => {
          alert(`Share this link: ${shareUrl}`);
        });
      } else {
        alert(`Share this link: ${shareUrl}`);
      }
    },

    // Schedule report
    scheduleReport() {
      this.showExportDropdown = false;

      // Mock implementation - would integrate with backend scheduling system
      alert('Report scheduling feature coming soon! This will allow you to:\n\n• Schedule daily/weekly/monthly reports\n• Choose recipients\n• Select report format (PDF/Excel)\n• Customize report content');
    },

    // Helper methods for export PDF calculations
    getTotalTimeDistribution() {
      return this.timeDistributionData.reduce((sum, item) => sum + item.total, 0);
    },

    getTimeDistributionPercentage(value) {
      const total = this.getTotalTimeDistribution();
      return total > 0 ? Math.round((value / total) * 100) : 0;
    },

    getTotalCSAT() {
      return Object.values(this.customerSatisfactionData).reduce((sum, val) => sum + val, 0);
    },

    getCSATPercentage(rating) {
      const total = this.getTotalCSAT();
      const value = this.customerSatisfactionData[rating] || 0;
      return total > 0 ? Math.round((value / total) * 100) : 0;
    },

    getCallbackPercentage(value) {
      const total = this.callbackStatusData.total;
      return total > 0 ? Math.round((value / total) * 100) : 0;
    },

    getAgentResolutionRate(agent) {
      if (!agent || !agent.assigned || agent.assigned === 0) return 0;
      return Math.round((agent.resolved / agent.assigned) * 100);
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

  async mounted() {
    // Fetch filter options first
    await this.fetchFilterOptions();

    // Fetch initial data from backend
    this.refreshAllData();

    // Setup auto-refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.refreshAllData();
    }, 30000); // 30000ms = 30 seconds

    // Add click outside listener for dropdown
    document.addEventListener('click', this.handleClickOutside)
  },

  beforeDestroy() {
    // Clean up click outside listener
    document.removeEventListener('click', this.handleClickOutside)

    // Clear auto-refresh interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
};
</script>

<style scoped>
/* Arrow rotation animation */
.rotate-90 {
  transform: rotate(90deg);
}

.rotate-180 {
  transform: rotate(180deg);
}

.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.duration-200 {
  transition-duration: 200ms;
}

/* Custom scrollbar for filter dropdown */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Export content styles for PDF */
.export-content table {
  table-layout: fixed;
  width: 100%;
  word-wrap: break-word;
  page-break-inside: auto;
}

.export-content tr {
  page-break-inside: avoid;
  page-break-after: auto;
}

.export-content td,
.export-content th {
  overflow-wrap: break-word;
  page-break-inside: avoid;
}

.export-content thead {
  display: table-header-group;
}

.export-content tfoot {
  display: table-footer-group;
}

.page-break-before {
  page-break-before: always;
}
</style>
