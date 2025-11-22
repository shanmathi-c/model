<template>
  <div class="h-screen bg-gray-50 flex flex-col">
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

    <!-- Table Container - Takes full remaining height with padding for fixed pagination -->
    <div class="flex-1 overflow-auto flex flex-col pb-20" style="min-height: calc(100vh - 200px);">
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
      <div v-else-if="filteredCalls.length === 0" class="flex items-center justify-center" style="min-height: 400px;">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No calls found</h3>
        <p class="mt-1 text-sm text-gray-500">Try adjusting your search or filters</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <div class="inline-block min-w-full align-middle">
          <div class="overflow-hidden">
            <table class="min-w-full divide-y divide-gray-300">
            <!-- Table Header -->
            <thead class="bg-gray-50">
              <tr>
                <th v-if="visibleColumns.callLogId" scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Call Log ID
                </th>
                <th v-if="visibleColumns.customerPhone" scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
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
                <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <!-- Table Body - Fixed Height -->
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="call in paginatedCalls" :key="call.id" class="hover:bg-gray-50 transition-colors">
                <!-- Call Log ID -->
                <td v-if="visibleColumns.callLogId" class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ call.callId || call.callLogId || 'N/A' }}
                </td>

                <!-- Customer -->
                <td v-if="visibleColumns.customerPhone" class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div class="flex items-center gap-2">
                    <img
                      v-if="call.phone && call.phone !== 'N/A'"
                      src="/phone-call.svg"
                      alt="Call"
                      class="w-5 h-5 cursor-pointer hover:text-green-600 transition-colors"
                      @click="openCallModal(call)"
                    />
                    <div class="flex flex-col">
                      <span class="font-medium text-gray-900">{{ call.customerName || 'Unknown' }}</span>
                      <span class="text-xs text-gray-500">{{ call.phone || 'N/A' }}</span>
                    </div>
                  </div>
                </td>

                <!-- Agent Name -->
                <td v-if="visibleColumns.agentName" class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div class="space-y-1">
                    <div class="font-medium text-gray-900">{{ call.agentName || 'Not Assigned' }}</div>
                    <div class="text-xs text-gray-500">{{ call.agentPhone || 'N/A' }}</div>
                  </div>
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
                <td v-if="visibleColumns.relatedTicketId" class="px-6 py-4 whitespace-nowrap text-sm">
                  <span v-if="call.ticketId && call.ticketId !== 0 && call.ticketId !== '0' && call.ticketId !== null" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <svg class="w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {{ formatTicketId(call.ticketId) }}
                  </span>
                  <span v-else class="text-gray-400 text-xs">No Ticket</span>
                </td>

                <!-- Actions -->
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <button @click="viewCallDetails(call)" class="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50 transition-colors" title="View Details">
                    <!-- Plus Circle Icon -->
                    <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Fixed Pagination Controls -->
        <div class="fixed bottom-0 left-0 right-0 px-4 py-3 bg-white border-t border-gray-200 z-10">
          <div class="flex flex-col gap-2">
            <!-- Info row -->
            <div class="text-sm text-gray-700">
              Showing <span class="font-medium">{{ Math.min(((currentPage - 1) * itemsPerPage) + 1, filteredCalls.length) }}</span> to
              <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, filteredCalls.length) }}</span> of
              <span class="font-medium">{{ filteredCalls.length }}</span> calls (Page {{ currentPage }} of {{ totalPages }})
            </div>

            <!-- Controls row -->
            <div class="flex items-center justify-center">
              <!-- Previous Button -->
              <button
                @click="prevPage"
                :disabled="currentPage === 1"
                class="px-3 py-1 text-sm border rounded-md transition-colors mr-2"
                :class="currentPage === 1
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
              >
                Previous
              </button>

              <!-- Page Numbers -->
              <template v-for="page in pageNumbers" :key="page">
                <button
                  @click="goToPage(page)"
                  class="px-2 py-1 text-sm border rounded-md transition-colors mx-0.5"
                  :class="page === currentPage
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
                >
                  {{ page }}
                </button>
              </template>

              <!-- Next Button -->
              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="px-3 py-1 text-sm border rounded-md transition-colors ml-2"
                :class="currentPage === totalPages
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
              >
                Next
              </button>
            </div>
          </div>
        </div>
    </div>

    <!-- Ticket Creation Modal -->
    <div v-if="showTicketModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-900">Create New Ticket</h3>
          <button
            @click="closeTicketModal"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Modal Content -->
        <div class="p-6">
          <form @submit.prevent="submitTicket" class="space-y-4">
            <!-- Call ID Display -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-semibold text-blue-900 text-sm">Selected Call</h4>
                  <p class="text-blue-700 text-sm mt-1">Call ID: <span class="font-mono font-bold">{{ selectedCall?.callId || 'N/A' }}</span></p>
                </div>
                <svg class="w-8 h-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
            </div>

            <!-- Agent Information (if assigned) -->
            <div v-if="selectedCall?.agentName && selectedCall?.agentName !== 'Not Assigned'" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <h4 class="font-semibold text-green-900 text-sm mb-2">Assigned Agent</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs text-green-700 mb-1">Agent Name</label>
                  <p class="text-sm font-medium text-green-900">{{ selectedCall.agentName }}</p>
                </div>
                <div v-if="selectedCall.agentPhone">
                  <label class="block text-xs text-green-700 mb-1">Agent Phone</label>
                  <p class="text-sm font-medium text-green-900">{{ selectedCall.agentPhone }}</p>
                </div>
              </div>
            </div>

            <!-- Customer Information (Pre-filled) -->
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <h4 class="font-semibold text-gray-900 text-sm mb-2">Customer Information</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Name</label>
                  <p class="text-sm font-medium text-gray-900">{{ ticketForm.customerName || 'Unknown' }}</p>
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Phone</label>
                  <p class="text-sm font-medium text-gray-900">{{ ticketForm.phone || 'N/A' }}</p>
                </div>
              </div>
            </div>

            <!-- Product Selection -->
            <div>
              <label for="product" class="block text-sm font-medium text-gray-700 mb-1">
                Product <span class="text-red-500">*</span>
              </label>
              <select
                id="product"
                v-model="ticketForm.productId"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Product</option>
                <option v-for="product in products" :key="product.productId" :value="product.productId">
                  {{ product.name || product.productName || 'Product ' + product.productId }}
                </option>
              </select>
            </div>

            <!-- Subject -->
            <div>
              <label for="subject" class="block text-sm font-medium text-gray-700 mb-1">
                Subject <span class="text-red-500">*</span>
              </label>
              <input
                id="subject"
                v-model="ticketForm.subject"
                type="text"
                required
                placeholder="Enter ticket subject"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Description -->
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
                Description <span class="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                v-model="ticketForm.description"
                required
                rows="4"
                placeholder="Describe the issue or request..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Email (Optional) -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                Email (Optional)
              </label>
              <input
                id="email"
                v-model="ticketForm.email"
                type="email"
                placeholder="customer@example.com"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                @click="closeTicketModal"
                class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isSubmittingTicket"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="!isSubmittingTicket">Create Ticket</span>
                <span v-else>Creating...</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Call Modal -->
    <div v-if="showCallModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-900">Call Management</h3>
          <button
            @click="closeCallModal"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Modal Content -->
        <div v-if="selectedCall" class="p-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Left Column - Agent & Customer Information -->
            <div class="space-y-4">
              <!-- Customer Information -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 class="font-semibold text-blue-900 text-sm mb-2">Customer Information</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span class="font-medium text-blue-800">{{ selectedCall.customerName || 'Unknown Customer' }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-blue-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <span>{{ selectedCall.phone || 'N/A' }}</span>
                  </div>
                </div>
              </div>

              <!-- Agent Information -->
              <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 class="font-semibold text-green-900 text-sm mb-2">Agent Information</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span class="font-medium text-green-800">{{ selectedCall.agentName || 'Not Assigned' }}</span>
                  </div>
                  <div v-if="selectedCall.agentPhone" class="flex items-center gap-2 text-green-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <span>{{ selectedCall.agentPhone }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column - Call Controls -->
            <div class="space-y-4">
              <h4 class="font-semibold text-gray-900 text-lg">Call Controls</h4>

              <!-- Call Status Display -->
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <!-- Pending State -->
                <div v-if="callStatus === 'pending' || callStatus === 'ended' || callStatus === 'cancelled' || callStatus === 'disconnected'">
                  <div class="flex items-center gap-3 mb-3">
                    <div class="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <div>
                      <p class="text-sm font-medium text-gray-700">Ready to Call</p>
                      <p class="text-xs text-gray-500">Click "Connect Call" to start the call</p>
                    </div>
                  </div>

                  <!-- Connect/Cancel Buttons - Show only when call is not active -->
                  <div class="flex gap-3">
                    <button
                      @click="startCall"
                      class="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                      Connect Call
                    </button>
                    <button
                      @click="disconnectCall"
                      class="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                      Disconnect
                    </button>
                  </div>
                </div>

                <!-- Connected State -->
                <div v-else-if="callStatus === 'connected'" class="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div class="flex items-center gap-3">
                    <div class="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
                    <div>
                      <p class="text-sm font-medium text-green-800">Call Connected</p>
                      <p class="text-xs text-green-600">Currently speaking with {{ selectedCall.customerName || 'Customer' }}</p>
                    </div>
                  </div>
                  <!-- Call Control Buttons in Connected State -->
                  <div class="flex gap-3 mt-3">
                    <button
                      @click="endCall"
                      class="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M16 8l2 2m0 0l2 2m-2-2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L5 12"></path>
                      </svg>
                      End Call
                    </button>
                    <button
                      @click="disconnectCall"
                      class="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M16 8l2 2m0 0l2 2m-2-2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L5 12"></path>
                      </svg>
                      Disconnect
                    </button>
                  </div>
                </div>

                <!-- Missed State -->
                <div v-else-if="callStatus === 'missed'" class="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p class="text-sm font-medium text-red-800">Call Missed</p>
                  <p class="text-xs text-red-600">The call was disconnected before being connected</p>
                </div>
              </div>

              <!-- Additional Call Information -->
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h5 class="font-medium text-gray-900 text-sm mb-2">Call Details</h5>
                <div class="space-y-1 text-xs text-gray-600">
                  <div class="flex justify-between">
                    <span>Call Log ID:</span>
                    <span class="font-medium">{{ selectedCall.callId || selectedCall.callLogId || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Call Type:</span>
                    <span class="font-medium">{{ selectedCall.callType ? selectedCall.callType.charAt(0).toUpperCase() + selectedCall.callType.slice(1) : 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Related Ticket ID:</span>
                    <span class="font-medium">{{ selectedCall.ticketId || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Current Status:</span>
                    <span :class="getStatusClass(selectedCall.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                      {{ formatStatus(selectedCall.status) }}
                    </span>
                  </div>
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
        { key: 'customerPhone', label: 'Customer' },
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
      itemsPerPage: 3,

      // Call Modal
      showCallModal: false,
      selectedCall: null,
      callStatus: 'pending',

      // Ticket Modal
      showTicketModal: false,
      ticketForm: {
        customerName: '',
        phone: '',
        email: '',
        productId: '',
        subject: '',
        description: ''
      },
      products: [],
      isSubmittingTicket: false
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

    // Page numbers to show in pagination
    pageNumbers() {
      const pages = []
      const maxVisiblePages = 5

      if (this.totalPages <= maxVisiblePages) {
        for (let i = 1; i <= this.totalPages; i++) {
          pages.push(i)
        }
      } else {
        const startPage = Math.max(1, this.currentPage - 2)
        const endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1)

        for (let i = startPage; i <= endPage; i++) {
          pages.push(i)
        }
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
    this.fetchProducts() // Fetch products for ticket creation
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
          customerName: call.customerName || 'Unknown Customer', // Customer name from conditional joins
          agentName: call.agentId ? `Agent ${call.agentId}` : 'Not Assigned',
          agentPhone: call.agentPhone, // Agent phone from database
          callType: call.callType || 'outbound', // inbound/outbound from database
          duration: this.calculateDuration(call.startTime, call.endTime), // Calculate duration
          status: call.callStatus || 'pending', // Use callStatus from calls table
          callDateTime: call.startTime, // Use startTime from calls table
          endTime: call.endTime,
          recordingUrl: call.recordingUrl,
          ticketId: call.ticketId, // Direct ticketId from calls table
          reason: call.reason,
          callDescription: call.callDescription,
          ticketStatus: call.ticketStatus,
          productId: call.productId,
          agentId: call.agentId,
          agentPhone: call.agentPhone
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
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },

    // View call details - Opens ticket creation modal
    viewCallDetails(call) {
      // Store the selected call for reference (includes all call details)
      this.selectedCall = call

      // Populate the ticket form with call information
      this.ticketForm = {
        customerName: call.customerName || 'Unknown Customer', // Use actual customer name from the call
        phone: call.phone || '',
        email: '',
        productId: call.productId || '',
        subject: '',
        description: ''
      }

      console.log('Opening ticket modal for call:', {
        callId: call.callId,
        agentName: call.agentName,
        agentId: call.agentId,
        agentPhone: call.agentPhone
      })

      // Open the ticket modal
      this.showTicketModal = true
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
    },

    // Open call modal for making a call
    openCallModal(call) {
      console.log('Opening call modal for:', call.phone)
      this.selectedCall = call
      this.callStatus = 'pending'
      this.showCallModal = true
    },

    // Close call modal
    closeCallModal() {
      this.showCallModal = false
      this.selectedCall = null
      this.callStatus = 'pending'
    },

    // Start call
    async startCall() {
      if (!this.selectedCall) return

      try {
        this.callStatus = 'connected'
        console.log('Call started with:', this.selectedCall.phone)

        // Create new call log entry when call is connected from calls page
        const callData = {
          callbackId: this.selectedCall.ticketId || 0,
          ticketId: this.selectedCall.ticketId || 0,
          agentId: this.extractAgentIdFromName(this.selectedCall.agentName),
          agentName: this.selectedCall.agentName || 'Unknown Agent',
          agentNumber: this.selectedCall.agentPhone || this.generateAgentPhone(this.extractAgentIdFromName(this.selectedCall.agentName)),
          customerPhone: this.selectedCall.phone,
          customerName: this.selectedCall.customerName || 'Customer',
          productId: this.selectedCall.productId || null,
          subject: `Follow-up call for ${this.selectedCall.customerName || 'Customer'}`,
          callType: 'inbound', // Calls from calls page are inbound (customer callback)
          ticketStatus: this.selectedCall.ticketStatus || 'in-progress'
        }

        console.log('Creating new call log from calls page:', callData)

        const response = await fetch('http://localhost:3000/api/calls/create-call-log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(callData)
        })

        if (!response.ok) {
          throw new Error('Failed to create call log')
        }

        const result = await response.json()
        console.log('Call log created successfully:', result)

        // Update the selected call with the new call log ID
        if (this.selectedCall) {
          this.selectedCall.newCallLogId = result.callId
        }

      } catch (error) {
        console.error('Error starting call:', error)
        this.callStatus = 'pending'
      }
    },

    // End call
    async endCall() {
      if (!this.selectedCall) return

      try {
        this.callStatus = 'ended'
        console.log('Call ended with:', this.selectedCall.phone)

        // Update the call log with end time - use new call log ID if available, otherwise existing call ID
        const callIdToUpdate = this.selectedCall.newCallLogId || this.selectedCall.id
        if (callIdToUpdate) {
          const response = await fetch(`http://localhost:3000/api/calls/${callIdToUpdate}/end`, {
            method: 'PUT'
          })

          if (!response.ok) {
            throw new Error('Failed to end call')
          }

          console.log('Call ended successfully')
        }

      } catch (error) {
        console.error('Error ending call:', error)
        this.callStatus = 'connected'
      }
    },

    // Disconnect call
    async disconnectCall() {
      if (!this.selectedCall) return

      try {
        console.log('Call disconnected for:', this.selectedCall.phone)

        // If disconnecting from pending state, mark as missed
        if (this.callStatus === 'pending') {
          this.callStatus = 'missed'

          // Create missed call log entry
          const callData = {
            callbackId: this.selectedCall.ticketId || 0,
            ticketId: this.selectedCall.ticketId || 0,
            agentId: this.extractAgentIdFromName(this.selectedCall.agentName),
            agentName: this.selectedCall.agentName || 'Unknown Agent',
            agentNumber: this.selectedCall.agentPhone || this.generateAgentPhone(this.extractAgentIdFromName(this.selectedCall.agentName)),
            customerPhone: this.selectedCall.phone,
            customerName: this.selectedCall.customerName || 'Customer',
            productId: this.selectedCall.productId || null,
            subject: `Missed call for ${this.selectedCall.customerName || 'Customer'}`,
            callType: 'inbound',
            ticketStatus: this.selectedCall.ticketStatus || 'missed'
          }

          console.log('Creating missed call log:', callData)

          const response = await fetch('http://localhost:3000/api/calls/create-call-log', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(callData)
          })

          if (!response.ok) {
            throw new Error('Failed to create missed call log')
          }

          const result = await response.json()
          console.log('Missed call log created successfully:', result)
        } else if (this.callStatus === 'connected') {
          // If disconnecting from connected state, end the call first
          await this.endCall()
          this.callStatus = 'disconnected'
        } else {
          this.callStatus = 'disconnected'
        }

        // Keep modal open to show the missed/disconnected status
        // User can close it manually

      } catch (error) {
        console.error('Error disconnecting call:', error)
      }
    },

    // Helper method to extract agent ID from agent name
    extractAgentIdFromName(agentName) {
      if (!agentName) return 1
      const match = agentName.match(/agent-(\d+)/i)
      if (match) {
        return parseInt(match[1])
      }
      // If no agent ID found in name, return a default ID
      return 1
    },

    // Helper method to generate agent phone
    generateAgentPhone(agentId) {
      return `+91-90000${agentId.toString().padStart(3, '0')}`
    },

    // Format ticket ID for display
    formatTicketId(ticketId) {
      if (!ticketId) return '';

      // If ticketId is already in format like T001, T002, just return it
      if (typeof ticketId === 'string' && ticketId.startsWith('T')) {
        return ticketId;
      }

      // If it's a numeric ID, format it
      if (typeof ticketId === 'number' || !isNaN(ticketId)) {
        return `T${String(ticketId).padStart(3, '0')}`;
      }

      // Otherwise return as is
      return ticketId;
    },

    // Close ticket modal
    closeTicketModal() {
      this.showTicketModal = false
      this.ticketForm = {
        customerName: '',
        phone: '',
        email: '',
        productId: '',
        subject: '',
        description: ''
      }
      this.isSubmittingTicket = false
    },

    // Fetch products for dropdown
    async fetchProducts() {
      try {
        const response = await fetch('http://localhost:5001/products', {
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
        this.products = result.data || []
      } catch (error) {
        console.error('Error fetching products:', error)
        this.products = []
      }
    },

    // Submit ticket
    async submitTicket() {
      this.isSubmittingTicket = true

      try {
        // Prepare ticket data with call and agent information
        const ticketData = {
          productId: this.ticketForm.productId,
          name: this.ticketForm.customerName,
          email: this.ticketForm.email || null,
          phone: this.ticketForm.phone,
          subject: this.ticketForm.subject,
          description: this.ticketForm.description,
          ticketType: 'call', // Mark as call-originated ticket
          callId: this.selectedCall?.callId || null, // Include the call ID
          agentId: this.selectedCall?.agentId || null, // Include agent ID if available
          agentName: this.selectedCall?.agentName || null, // Include agent name
          agentPhone: this.selectedCall?.agentPhone || null // Include agent phone
        }

        console.log('Submitting ticket with call details:', ticketData)

        const response = await fetch('http://localhost:5001/call-tickets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(ticketData)
        })

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`)
        }

        const result = await response.json()
        console.log('Ticket created:', result)

        // Show success message (you can add a toast/notification here)
        alert(`Ticket created successfully! Ticket ID: ${result.data.ticketId}`)

        // Close modal
        this.closeTicketModal()

        // Optionally refresh the call logs
        await this.fetchCallLogs()

      } catch (error) {
        console.error('Error creating ticket:', error)
        alert('Error creating ticket. Please try again.')
      } finally {
        this.isSubmittingTicket = false
      }
    }
  }
}
</script>

<style scoped>
/* Main container */
.h-screen {
  height: 100vh;
  overflow: hidden;
}

/* Flex utilities */
.flex-1 {
  flex: 1 1 0%;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

/* Ensure proper overflow handling */
.overflow-auto {
  overflow-y: auto;
  overflow-x: auto;
}

/* Custom scrollbar - vertical only visible */
.overflow-auto::-webkit-scrollbar {
  width: 8px;
  height: 0px;
}

.overflow-auto::-webkit-scrollbar:horizontal {
  height: 0px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Make horizontal scrollbar invisible */
.overflow-x-auto::-webkit-scrollbar {
  height: 0px;
}

.overflow-x-auto::-webkit-scrollbar:horizontal {
  height: 0px;
}

/* Firefox */
.overflow-x-auto {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

/* Smooth transitions */
.transition-colors {
  transition-property: background-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>