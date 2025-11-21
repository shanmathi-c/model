<template>
  <div class="h-screen bg-gray-50 flex flex-col ">
    <!-- Fixed Header Section - Sticky -->
    <div class="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 shadow-md">
      <!-- Header Title -->
      <div class="mb-4">
        <h1 class="text-2xl font-bold text-gray-900">Callback Requests</h1>
        <p class="text-gray-600 mt-1">View and manage customer callback requests</p>
      </div>

      <!-- Search and Filter Bar -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Search Bar -->
        <div class="relative w-96 max-w-full">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            v-model="searchQuery"
            class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Search callbacks by name, phone, or ID..."
            @input="handleSearch"
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
          </button>

          <!-- Filter Dropdown -->
          <div
            v-if="showFilterDropdown"
            class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200"
            style="z-index: 50;"
          >
            <div class="p-3">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-sm font-semibold text-gray-900">Filters</h3>
                <button
                  v-if="hasActiveFilters"
                  @click="clearFilters"
                  onclick="event.stopPropagation()"
                  class="text-xs text-blue-600 hover:text-blue-700"
                >
                  Clear
                </button>
              </div>

              <!-- Call Type Filter -->
              <div class="mb-2">
                <button
                  @click="toggleFilterSection('callType')"
                  class="flex items-center justify-between w-full text-xs font-medium text-gray-700 hover:text-gray-900 py-1"
                >
                  <span>Call Type</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    class="w-3 h-3 transition-transform"
                    :class="{ 'rotate-90': expandedSections.callType }"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div v-if="expandedSections.callType" class="mt-1 space-y-1 pl-2">
                  <label v-for="type in callTypeOptions" :key="type.value" class="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 p-1 rounded text-xs">
                    <input type="checkbox" :value="type.value" v-model="activeFilters.callTypes" class="w-3 h-3 text-blue-600 rounded border-gray-300">
                    <span>{{ type.label }}</span>
                  </label>
                </div>
              </div>

              <!-- Status Filter -->
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
                <div v-if="expandedSections.status" class="mt-1 space-y-1 pl-2">
                  <label v-for="status in statusOptions" :key="status.value" class="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 p-1 rounded text-xs">
                    <input type="checkbox" :value="status.value" v-model="activeFilters.status" class="w-3 h-3 text-blue-600 rounded border-gray-300">
                    <span>{{ status.label }}</span>
                  </label>
                </div>
              </div>

              <!-- Agent Filter -->
              <div class="mb-2">
                <button
                  @click="toggleFilterSection('agent')"
                  class="flex items-center justify-between w-full text-xs font-medium text-gray-700 hover:text-gray-900 py-1"
                >
                  <span>Agent</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    class="w-3 h-3 transition-transform"
                    :class="{ 'rotate-90': expandedSections.agent }"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div v-if="expandedSections.agent" class="mt-1 space-y-1 pl-2 max-h-32 overflow-y-auto">
                  <label v-for="agent in agentOptions" :key="agent" class="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 p-1 rounded text-xs">
                    <input type="checkbox" :value="agent" v-model="activeFilters.agents" class="w-3 h-3 text-blue-600 rounded border-gray-300">
                    <span>{{ agent }}</span>
                  </label>
                </div>
              </div>

              <!-- Duration Filter -->
              <div class="mb-2">
                <button
                  @click="toggleFilterSection('duration')"
                  class="flex items-center justify-between w-full text-xs font-medium text-gray-700 hover:text-gray-900 py-1"
                >
                  <span>Duration</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    class="w-3 h-3 transition-transform"
                    :class="{ 'rotate-90': expandedSections.duration }"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div v-if="expandedSections.duration" class="mt-1 pl-2">
                  <select v-model="activeFilters.duration" class="w-full text-xs border border-gray-300 rounded p-1.5 focus:ring-1 focus:ring-blue-500">
                    <option value="">All Durations</option>
                    <option value="short">Under 1 min</option>
                    <option value="medium">1-5 min</option>
                    <option value="long">Over 5 min</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Display Settings Button -->
        <div ref="displayDropdownRef" class="relative">
          <button
            @click="toggleDisplayDropdown"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            title="Display Settings"
          >
            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="text-sm font-medium">Display</span>
          </button>

          <!-- Display Dropdown -->
          <div
            v-if="showDisplayDropdown"
            class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200"
            style="z-index: 50;"
          >
            <div class="p-3">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-sm font-semibold text-gray-900">Show Columns</h3>
                <div class="flex gap-1">
                  <button
                    @click="selectAllColumns"
                    class="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    All
                  </button>
                  <span class="text-gray-300">|</span>
                  <button
                    @click="deselectAllColumns"
                    class="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div class="space-y-1">
                <label
                  v-for="col in columnOptions"
                  :key="col.key"
                  class="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 p-1.5 rounded text-xs"
                >
                  <input
                    type="checkbox"
                    v-model="visibleColumns[col.key]"
                    class="w-3 h-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span class="text-gray-700">{{ col.label }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Filter Chips (Below search bar) -->
      <div v-if="hasActiveFilters" class="flex gap-1.5 flex-wrap items-center mt-2 px-6">
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
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </span>
      </div>
    </div>

    <!-- Table Container - Scrollable Content -->
    <div class="flex-1 overflow-auto">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center h-64">
        <div class="flex flex-col items-center">
          <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p class="mt-4 text-gray-600">Loading call tickets...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex items-center justify-center h-64">
        <div class="text-center">
          <svg class="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Error loading tickets</h3>
          <p class="mt-1 text-sm text-gray-500">{{ error }}</p>
          <div class="mt-6">
            <button @click="fetchCallTickets" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Try again
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredCalls.length === 0" class="flex items-center justify-center h-64">
        <div class="text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No callbacks found</h3>
          <p class="mt-1 text-sm text-gray-500">No callback requests match your search criteria.</p>
          <div class="mt-6">
            <button @click="clearFilters" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Tickets Table Wrapper -->
      <div v-else class="h-full">
        <div class="inline-block min-w-full align-middle h-full">
          <div class="overflow-hidden">
            <table class="min-w-full divide-y divide-gray-300">
            <!-- Table Header - Fixed -->
            <thead class="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th v-if="visibleColumns.callLogId" scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Call Log ID
                </th>
                <th v-if="visibleColumns.customerPhone" scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Phone
                </th>
                <th v-if="visibleColumns.agentName" scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent Name
                </th>
                <th v-if="visibleColumns.callType" scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Call Type
                </th>
                <th v-if="visibleColumns.duration" scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th v-if="visibleColumns.status" scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th v-if="visibleColumns.callDateTime" scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Call Date & Time
                </th>
                <th v-if="visibleColumns.recording" scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recording
                </th>
                <th v-if="visibleColumns.relatedTicketId" scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Related Ticket ID
                </th>
                <th scope="col" class="relative px-6 py-3">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>

            <!-- Table Body - Scrollable -->
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="call in paginatedCalls" :key="call.id" class="hover:bg-gray-50 transition-colors">
                <!-- Call Log ID -->
                <td v-if="visibleColumns.callLogId" class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ call.callId || call.callLogId || 'N/A' }}
                </td>

                <!-- Customer Phone -->
                <td v-if="visibleColumns.customerPhone" class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ call.phone || 'N/A' }}
                </td>

                <!-- Agent Name -->
                <td v-if="visibleColumns.agentName" class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ call.agentName || 'Not Assigned' }}
                </td>

                <!-- Call Type -->
                <td v-if="visibleColumns.callType" class="px-6 py-4 whitespace-nowrap">
                  <span :class="getCallTypeClass(call.callType)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ call.callType ? call.callType.charAt(0).toUpperCase() + call.callType.slice(1) : 'N/A' }}
                  </span>
                </td>

                <!-- Duration -->
                <td v-if="visibleColumns.duration" class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDuration(call.duration) }}
                </td>

                <!-- Status -->
                <td v-if="visibleColumns.status" class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClass(call.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ formatStatus(call.status) }}
                  </span>
                </td>

                <!-- Call Date & Time -->
                <td v-if="visibleColumns.callDateTime" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDateTime(call.callDateTime || call.createdAt || call.created_at) }}
                </td>

                <!-- Recording -->
                <td v-if="visibleColumns.recording" class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <button
                    v-if="call.recordingUrl"
                    @click="playRecording(call.recordingUrl)"
                    class="text-blue-600 hover:text-blue-900 inline-flex items-center"
                    title="Play Recording"
                  >
                    <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <span v-else class="text-gray-400">N/A</span>
                </td>

                <!-- Related Ticket ID -->
                <td v-if="visibleColumns.relatedTicketId" class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ call.ticketId || 'N/A' }}
                </td>

                <!-- Actions -->
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button @click="viewCallDetails(call)" class="text-blue-600 hover:text-blue-900 mr-3">
                    View
                  </button>
                  <button @click="editCall(call)" class="text-indigo-600 hover:text-indigo-900">
                    Edit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div class="flex-1 flex justify-between sm:hidden">
              <button
                @click="prevPage"
                :disabled="currentPage === 1"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Showing
                  <span class="font-medium">{{ startIndex + 1 }}</span>
                  to
                  <span class="font-medium">{{ Math.min(endIndex, filteredCalls.length) }}</span>
                  of
                  <span class="font-medium">{{ filteredCalls.length }}</span>
                  results
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    @click="prevPage"
                    :disabled="currentPage === 1"
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span class="sr-only">Previous</span>
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>
                  <span
                    v-for="page in visiblePages"
                    :key="page"
                    @click="goToPage(page)"
                    :class="[
                      'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                      page === currentPage
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    ]"
                  >
                    {{ page }}
                  </span>
                  <button
                    @click="nextPage"
                    :disabled="currentPage === totalPages"
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span class="sr-only">Next</span>
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
export default {
  name: 'CallTicketsList',

  data() {
    return {
      // Data state
      calls: [],
      loading: false,
      error: null,

      // Search and filter
      searchQuery: '',
      statusFilter: '',
      callTypeFilter: '',
      showFilter: false,
      showFilterDropdown: false,
      showDisplayDropdown: false,

      // Filter options
      callTypeOptions: [
        { value: 'inbound', label: 'Inbound' },
        { value: 'outbound', label: 'Outbound' },
        { value: 'missed', label: 'Missed' },
        { value: 'voicemail', label: 'Voicemail' }
      ],
      statusOptions: [
        { value: 'pending', label: 'Pending' },
        { value: 'ongoing', label: 'Ongoing' },
        { value: 'completed', label: 'Completed' },
        { value: 'missed', label: 'Missed' },
        { value: 'cancelled', label: 'Cancelled' }
      ],

      // Active filters
      activeFilters: {
        callTypes: [],
        status: [],
        agents: [],
        duration: ''
      },

      // Available agents (will be populated from data)
      agentOptions: [],

      // Expanded sections state
      expandedSections: {
        callType: false,
        status: false,
        agent: false,
        duration: false
      },

      // Display settings
      columnOptions: [
        { key: 'callLogId', label: 'Call Log ID' },
        { key: 'customerPhone', label: 'Customer Phone' },
        { key: 'agentName', label: 'Agent Name' },
        { key: 'callType', label: 'Call Type' },
        { key: 'duration', label: 'Duration' },
        { key: 'status', label: 'Status' },
        { key: 'callDateTime', label: 'Call Date & Time' },
        { key: 'recording', label: 'Recording' },
        { key: 'relatedTicketId', label: 'Related Ticket ID' }
      ],
      visibleColumns: {},

      // Pagination
      currentPage: 1,
      itemsPerPage: 10
    }
  },

  computed: {
    // Check if there are active filters
    hasActiveFilters() {
      return this.activeFilters.callTypes.length > 0 ||
             this.activeFilters.status.length > 0 ||
             this.activeFilters.agents.length > 0 ||
             this.activeFilters.duration !== ''
    },

    // Generate active filter chips
    activeFilterChips() {
      const chips = []

      // Call type chips
      this.activeFilters.callTypes.forEach(callType => {
        const option = this.callTypeOptions.find(opt => opt.value === callType)
        if (option) {
          chips.push({
            key: `callType-${callType}`,
            label: option.label,
            type: 'callType',
            value: callType
          })
        }
      })

      // Status chips
      this.activeFilters.status.forEach(status => {
        const option = this.statusOptions.find(opt => opt.value === status)
        if (option) {
          chips.push({
            key: `status-${status}`,
            label: option.label,
            type: 'status',
            value: status
          })
        }
      })

      // Agent chips
      this.activeFilters.agents.forEach(agent => {
        chips.push({
          key: `agent-${agent}`,
          label: agent,
          type: 'agent',
          value: agent
        })
      })

      // Duration chip
      if (this.activeFilters.duration) {
        const durationLabels = {
          'short': 'Under 1 min',
          'medium': '1-5 min',
          'long': 'Over 5 min'
        }
        chips.push({
          key: `duration-${this.activeFilters.duration}`,
          label: durationLabels[this.activeFilters.duration] || this.activeFilters.duration,
          type: 'duration',
          value: this.activeFilters.duration
        })
      }

      return chips
    },

    // Filter calls based on search and status filter
    filteredCalls() {
      let filtered = this.calls

      // Apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(call =>
          call.callId?.toLowerCase().includes(query) ||
          call.callLogId?.toLowerCase().includes(query) ||
          call.phone?.toLowerCase().includes(query) ||
          call.customerName?.toLowerCase().includes(query) ||
          call.reason?.toLowerCase().includes(query) ||
          call.callDescription?.toLowerCase().includes(query) ||
          call.agentName?.toLowerCase().includes(query) ||
          call.ticketId?.toLowerCase().includes(query)
        )
      }

      // Apply call type filters
      if (this.activeFilters.callTypes.length > 0) {
        filtered = filtered.filter(call =>
          this.activeFilters.callTypes.includes(call.callType)
        )
      }

      // Apply status filters
      if (this.activeFilters.status.length > 0) {
        filtered = filtered.filter(call =>
          this.activeFilters.status.includes(call.status)
        )
      }

      // Apply agent filters
      if (this.activeFilters.agents.length > 0) {
        filtered = filtered.filter(call =>
          this.activeFilters.agents.includes(call.agentName)
        )
      }

      // Apply duration filter
      if (this.activeFilters.duration) {
        filtered = filtered.filter(call => {
          if (!call.duration) return false
          const duration = call.duration

          switch(this.activeFilters.duration) {
            case 'short':
              return duration < 60 // Less than 1 minute
            case 'medium':
              return duration >= 60 && duration <= 300 // 1-5 minutes
            case 'long':
              return duration > 300 // More than 5 minutes
            default:
              return true
          }
        })
      }

      return filtered
    },

    // Paginated calls
    paginatedCalls() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredCalls.slice(start, end)
    },

    // Total pages
    totalPages() {
      return Math.ceil(this.filteredCalls.length / this.itemsPerPage)
    },

    // Start index for pagination display
    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage
    },

    // End index for pagination display
    endIndex() {
      return this.startIndex + this.itemsPerPage
    },

    // Visible page numbers for pagination
    visiblePages() {
      const pages = []
      const maxVisible = 5
      let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2))
      let end = Math.min(this.totalPages, start + maxVisible - 1)

      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1)
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      return pages
    }
  },

  created() {
    // Initialize visible columns
    this.visibleColumns = Object.fromEntries(this.columnOptions.map(col => [col.key, true]))
  },

  mounted() {
    this.fetchCallLogs()
    // Add click event listener
    document.addEventListener('click', this.handleClickOutside);
  },

  beforeDestroy() {
    // Clean up event listener
    document.removeEventListener('click', this.handleClickOutside);
  },

  methods: {
    // Fetch calls data from API
    async fetchCallLogs() {
      this.loading = true
      this.error = null

      try {
        const response = await fetch('http://localhost:5001/calls', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        })

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`)
        }

        const result = await response.json()

        // Map calls table data to display format
        this.calls = (result.data || []).map(call => ({
          id: call.id,
          callId: call.callId, // C001, C002, etc.
          callLogId: call.callId, // For backward compatibility
          phone: call.userPhone,
          agentName: call.agentId ? `Agent ${call.agentId}` : 'Not Assigned',
          callType: call.callType || 'outbound', // inbound/outbound from database
          duration: this.calculateDuration(call.startTime, call.endTime), // Calculate duration
          status: call.callStatus || 'pending', // Use callStatus from calls table
          callDateTime: call.startTime, // Use startTime from calls table
          endTime: call.endTime,
          recordingUrl: call.recordingUrl,
          ticketId: call.ticketId,
          reason: call.reason,
          callDescription: call.callDescription,
          ticketStatus: call.ticketStatus,
          productId: call.productId,
          agentId: call.agentId,
          agentPhone: call.agentPhone,
          customerName: call.userPhone // Use phone as customer name for now
        }))

        // Extract unique agent names for filter dropdown
        const uniqueAgents = [...new Set(this.calls.map(call => call.agentName).filter(name => name && name !== 'Not Assigned'))]
        this.agentOptions = uniqueAgents.sort()

        // Reset to first page when filtering
        this.currentPage = 1

      } catch (error) {
        console.error('Error fetching calls:', error)
        this.error = error.message || 'Error fetching calls. Please try again.'
      } finally {
        this.loading = false
      }
    },

    // Calculate duration from startTime and endTime
    calculateDuration(startTime, endTime) {
      if (!startTime || !endTime) return null

      try {
        const start = new Date(startTime)
        const end = new Date(endTime)
        const diffMs = end - start
        return Math.floor(diffMs / 1000) // Return duration in seconds
      } catch (error) {
        console.error('Error calculating duration:', error)
        return null
      }
    },

    // Handle search input
    handleSearch() {
      // Reset to first page when searching
      this.currentPage = 1
    },

    // Toggle filter dropdown
    toggleFilterDropdown() {
      this.showFilterDropdown = !this.showFilterDropdown
    },

    // Toggle filter section
    toggleFilterSection(section) {
      this.expandedSections[section] = !this.expandedSections[section]
    },

    // Remove individual filter
    removeFilter(chipKey) {
      const [type, value] = chipKey.split('-')

      switch(type) {
        case 'callType':
          const callTypeIndex = this.activeFilters.callTypes.indexOf(value)
          if (callTypeIndex > -1) this.activeFilters.callTypes.splice(callTypeIndex, 1)
          break
        case 'status':
          const statusIndex = this.activeFilters.status.indexOf(value)
          if (statusIndex > -1) this.activeFilters.status.splice(statusIndex, 1)
          break
        case 'agent':
          const agentIndex = this.activeFilters.agents.findIndex(a => a.includes(value))
          if (agentIndex > -1) this.activeFilters.agents.splice(agentIndex, 1)
          break
        case 'duration':
          this.activeFilters.duration = ''
          break
      }
      this.currentPage = 1
    },

    // Clear all filters
    clearFilters() {
      this.searchQuery = ''
      this.activeFilters = {
        callTypes: [],
        status: [],
        agents: [],
        duration: ''
      }
      this.showFilterDropdown = false
      this.currentPage = 1
    },

    // Pagination methods
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
      }
    },

    goToPage(page) {
      this.currentPage = page
    },

    // View call details
    viewCallDetails(call) {
      // Navigate to call details page or open modal
      console.log('View call details:', call)
      // You can implement a modal or navigate to a details page
    },

    // Edit call
    editCall(call) {
      // Navigate to edit page or open edit modal
      console.log('Edit call:', call)
      // You can implement an edit modal or navigate to edit page
    },

    // Play recording
    playRecording(url) {
      // Open or play the call recording
      console.log('Playing recording:', url)
      window.open(url, '_blank')
    },

    // Get call type CSS class
    getCallTypeClass(callType) {
      const callTypeClasses = {
        'inbound': 'bg-green-100 text-green-800',
        'outbound': 'bg-blue-100 text-blue-800',
        'missed': 'bg-red-100 text-red-800',
        'voicemail': 'bg-purple-100 text-purple-800'
      }
      return callTypeClasses[callType] || 'bg-gray-100 text-gray-800'
    },

    // Get status CSS class
    getStatusClass(status) {
      const statusClasses = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'ongoing': 'bg-blue-100 text-blue-800',
        'completed': 'bg-green-100 text-green-800',
        'missed': 'bg-red-100 text-red-800',
        'cancelled': 'bg-red-100 text-red-800'
      }
      return statusClasses[status] || 'bg-gray-100 text-gray-800'
    },

    // Format status text
    formatStatus(status) {
      return status ? status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown'
    },

    // Format duration from seconds to HH:MM:SS
    formatDuration(seconds) {
      if (!seconds) return 'N/A'

      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60

      return [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        secs.toString().padStart(2, '0')
      ].join(':')
    },

    // Format date and time
    formatDateTime(dateString) {
      if (!dateString) return 'N/A'

      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      } catch {
        return 'Invalid Date'
      }
    },

    // Format date (legacy method)
    formatDate(dateString) {
      return this.formatDateTime(dateString)
    },

    // Toggle display dropdown
    toggleDisplayDropdown() {
      this.showDisplayDropdown = !this.showDisplayDropdown
    },

    // Select all columns
    selectAllColumns() {
      Object.keys(this.visibleColumns).forEach(key => {
        this.visibleColumns[key] = true
      })
    },

    // Deselect all columns
    deselectAllColumns() {
      Object.keys(this.visibleColumns).forEach(key => {
        this.visibleColumns[key] = false
      })
    },

    // Handle click outside to close dropdowns
    handleClickOutside(event) {
      const clickedElement = event.target;

      // Close filter dropdown if clicking outside
      if (this.showFilterDropdown) {
        const filterDropdown = this.$refs.filterDropdownRef;
        if (filterDropdown && !filterDropdown.contains(clickedElement)) {
          this.showFilterDropdown = false;
        }
      }

      // Close display dropdown if clicking outside
      if (this.showDisplayDropdown) {
        const displayDropdown = this.$refs.displayDropdownRef;
        if (displayDropdown && !displayDropdown.contains(clickedElement)) {
          this.showDisplayDropdown = false;
        }
      }
    }
  }
}
</script>

<style scoped>
/* Fix double scrollbar - main container should not scroll */
.h-screen {
  height: 100vh;
  overflow: hidden;
}

/* Only allow scrolling on the main content area */
.flex-1.overflow-auto {
  overflow-y: auto;
  overflow-x: auto;
}

/* Custom scrollbar */
.flex-1.overflow-auto::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.flex-1.overflow-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.flex-1.overflow-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.flex-1.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Ensure no overflow on other elements */
.overflow-hidden {
  overflow: hidden !important;
}

/* Smooth transitions */
.transition-colors {
  transition-property: background-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>