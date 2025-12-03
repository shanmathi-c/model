<template>
  <div class="h-full bg-gray-50 flex flex-col">
    <!-- Fixed Header Section - Sticky -->
    <div class="flex-shrink-0 px-6 py-4">
      <!-- Header Title -->
      <div class="mb-1 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Callback Requests</h1>
          <p class="text-gray-600 mt-1">View and manage customer callback requests</p>
        </div>

        <!-- Loading Indicator -->
        <div v-if="loading" class="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
          <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span class="text-sm text-blue-600 font-medium">Refreshing...</span>
        </div>
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
            <div class="p-3 max-h-96 overflow-y-auto custom-scrollbar">
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

              <!-- Date Range Filter -->
              <div class="mb-2">
                <button
                  @click="toggleFilterSection('dateRange')"
                  class="flex items-center justify-between w-full text-xs font-medium text-gray-700 hover:text-gray-900 py-1"
                >
                  <span>Date Range</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    class="w-3 h-3 transition-transform"
                    :class="{ 'rotate-90': expandedSections.dateRange }"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div v-if="expandedSections.dateRange" class="mt-1 space-y-2 pl-2">
                  <!-- Call Date Range -->
                  <div>
                    <label class="text-xs font-medium text-gray-600 mb-1 block">Call Date</label>
                    <DateRangePicker
                      :startDate="activeFilters.dateRange.callDateFrom"
                      :endDate="activeFilters.dateRange.callDateTo"
                      placeholder="Select call date range"
                      @update:startDate="activeFilters.dateRange.callDateFrom = $event"
                      @update:endDate="activeFilters.dateRange.callDateTo = $event"
                      @close-filter="closeFilterDropdown"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sort By Button -->
        <div ref="sortDropdownRef" class="relative">
          <button
            @click="toggleSortDropdown"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            title="Sort By"
          >
            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            <span class="text-sm font-medium">Sort</span>
          </button>

          <!-- Sort Dropdown -->
          <div
            v-if="showSortDropdown"
            class="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          >
            <div class="p-2">
              <!-- Sort By Field -->
              <div class="mb-2">
                <div class="space-y-1">
                  <label v-for="option in sortOptions" :key="option.value" class="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="radio"
                      :value="option.value"
                      v-model="sortBy"
                      class="w-3 h-3 text-blue-600 border-gray-300 focus:ring-blue-500"
                      @change="applySorting"
                    />
                    <span class="ml-1.5 text-xs text-gray-700">{{ option.label }}</span>
                  </label>
                </div>
              </div>

              <!-- Sort Order -->
              <div class="pt-1 border-t border-gray-200">
                <div class="flex gap-2">
                  <label class="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="asc"
                      v-model="sortOrder"
                      class="w-3 h-3 text-blue-600 border-gray-300 focus:ring-blue-500"
                      @change="applySorting"
                    />
                    <span class="ml-1 text-xs text-gray-700">Asc</span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="desc"
                      v-model="sortOrder"
                      class="w-3 h-3 text-blue-600 border-gray-300 focus:ring-blue-500"
                      @change="applySorting"
                    />
                    <span class="ml-1 text-xs text-gray-700">Desc</span>
                  </label>
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

    <!-- Table Container - Takes full remaining height with fixed pagination -->
    <div class="flex-1 overflow-hidden flex flex-col">
      <!-- Table Wrapper with scrollable content -->
      <div class="flex-1 overflow-auto" style="min-height: calc(100vh - 250px);">
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
          <div class="text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No calls found</h3>
            <p class="mt-1 text-sm text-gray-500">Try adjusting your search or filters</p>
          </div>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto" style="min-height: calc(100vh - 300px);">
          <div class="inline-block min-w-full align-middle h-full">
            <div class="overflow-hidden h-full">
              <table class="min-w-full border-collapse">
                <!-- Table Header -->
                <thead class="bg-gray-50 border-b-2 border-gray-300 sticky top-0 z-10">
                  <tr>
                    <th v-if="visibleColumns.callLogId" scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200" style="width: 120px; min-width: 120px;">
                      Call Log ID
                    </th>
                    <th v-if="visibleColumns.customerPhone" scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200" style="width: 180px; min-width: 180px;">
                      Customer
                    </th>
                    <th v-if="visibleColumns.agentName" scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200" style="width: 160px; min-width: 160px;">
                      Agent Name
                    </th>
                    <th v-if="visibleColumns.callType" scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200" style="width: 120px; min-width: 120px;">
                      Call Type
                    </th>
                    <th v-if="visibleColumns.duration" scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200" style="width: 110px; min-width: 110px;">
                      Duration
                    </th>
                    <th v-if="visibleColumns.status" scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200" style="width: 120px; min-width: 120px;">
                      Status
                    </th>
                    <th v-if="visibleColumns.callDateTime" scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200" style="width: 160px; min-width: 160px;">
                      Call Date & Time
                    </th>
                    <th v-if="visibleColumns.recording" scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200" style="width: 110px; min-width: 110px;">
                      Recording
                    </th>
                    <th v-if="visibleColumns.relatedTicketId" scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200" style="width: 140px; min-width: 140px;">
                      Related Ticket ID
                    </th>
                  </tr>
                </thead>

                <!-- Table Body - Fixed Height -->
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="call in paginatedCalls" :key="call.id" class="border-b border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer" @click="openCallDetails(call)">
                    <!-- Call Log ID -->
                    <td v-if="visibleColumns.callLogId" class="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 align-middle">
                      {{ call.callId || call.callLogId || 'N/A' }}
                    </td>

                    <!-- Customer -->
                    <td v-if="visibleColumns.customerPhone" class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 align-middle">
                      <div class="flex items-center gap-2">
                        <img
                          v-if="call.phone && call.phone !== 'N/A'"
                          src="/phone-call.svg"
                          alt="Call"
                          class="w-5 h-5 cursor-pointer hover:text-green-600 transition-colors phone-bounce"
                          @click.stop="openCallModal(call)"
                        />
                        <div class="flex flex-col">
                          <span class="font-medium text-gray-900">{{ call.customerName || 'Unknown' }}</span>
                          <span class="text-xs text-gray-500">{{ call.phone || 'N/A' }}</span>
                        </div>
                      </div>
                    </td>

                    <!-- Agent Name -->
                    <td v-if="visibleColumns.agentName" class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 align-middle">
                      <div class="space-y-1">
                        <div class="font-medium text-gray-900">{{ call.agentName || 'Not Assigned' }}</div>
                        <div class="text-xs text-gray-500">{{ call.agentPhone || 'N/A' }}</div>
                      </div>
                    </td>

                    <!-- Call Type -->
                    <td v-if="visibleColumns.callType" class="px-6 py-4 whitespace-nowrap align-middle">
                      <span :class="getCallTypeClass(call.callType)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                        {{ call.callType ? call.callType.charAt(0).toUpperCase() + call.callType.slice(1) : 'N/A' }}
                      </span>
                    </td>

                    <!-- Duration -->
                    <td v-if="visibleColumns.duration" class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 align-middle">
                      {{ formatDuration(call.duration) }}
                    </td>

                    <!-- Status -->
                    <td v-if="visibleColumns.status" class="px-6 py-4 whitespace-nowrap align-middle">
                      <span :class="getStatusClass(call.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                        {{ formatStatus(call.status) }}
                      </span>
                    </td>

                    <!-- Call Date & Time -->
                    <td v-if="visibleColumns.callDateTime" class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 align-middle">
                      {{ formatDateTime(call.callDateTime || call.createdAt || call.created_at) }}
                    </td>

                    <!-- Recording -->
                    <td v-if="visibleColumns.recording" class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 align-middle">
                      <button
                        v-if="call.recordingUrl"
                        @click.stop="openRecordingModal(call.recordingUrl)"
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
                    <td v-if="visibleColumns.relatedTicketId" class="px-6 py-4 whitespace-nowrap text-sm align-middle">
                      <span v-if="call.ticketId && call.ticketId !== 0 && call.ticketId !== '0' && call.ticketId !== null" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <svg class="w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {{ formatTicketId(call.ticketId) }}
                      </span>
                      <span v-else class="text-gray-400 text-xs">No Ticket</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination Controls - Fixed at the bottom of the table container -->
      <div class="px-4 py-3 bg-white border-t border-gray-200 flex-shrink-0">
        <div class="flex flex-col gap-2">
          <!-- Info row -->
          <!-- <div class="text-sm text-gray-700">
            Showing <span class="font-medium">{{ Math.min(((currentPage - 1) * itemsPerPage) + 1, filteredCalls.length) }}</span> to
            <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, filteredCalls.length) }}</span> of
            <span class="font-medium">{{ filteredCalls.length }}</span> calls (Page {{ currentPage }} of {{ totalPages }})
          </div> -->

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

                  <!-- Upload Recording File -->
                  <div class="mt-3 bg-white border border-gray-200 rounded-lg p-3">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline mr-2">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        <line x1="12" y1="19" x2="12" y2="23"></line>
                        <line x1="8" y1="23" x2="16" y2="23"></line>
                      </svg>
                      Upload Call Recording (MP3)
                    </label>
                    <input
                      type="file"
                      accept=".mp3,audio/mpeg"
                      @change="handleRecordingUpload"
                      class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p v-if="uploadedRecording" class="mt-2 text-xs text-green-600 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      {{ uploadedRecording.name }}
                    </p>
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

              <!-- Update Call Status -->
              <div class="bg-white border border-gray-200 rounded-lg p-4">
                <h5 class="font-medium text-gray-900 text-sm mb-3">Update Call Status</h5>
                <div class="space-y-3">
                  <select
                    v-model="selectedCallStatus"
                    @change="updateCallStatus"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="missed">Missed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <p class="text-xs text-gray-500">Select the current status of this call</p>
                </div>
              </div>
            </div>

              </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Call Details Side Panel -->
    <div v-if="showCallDetailsPanel" class="fixed inset-0 z-50 overflow-hidden">
      <!-- Background overlay -->
      <div class="absolute inset-0 bg-black bg-opacity-50" @click="closeCallDetails"></div>

      <!-- Side panel -->
      <div class="absolute right-0 top-0 h-full w-full max-w-3xl bg-gradient-to-br from-gray-50 to-white shadow-2xl transform transition-transform duration-300"
           :class="showCallDetailsPanel ? 'translate-x-0' : 'translate-x-full'">

        <!-- Panel Header -->
        <div class="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-5 shadow-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="bg-indigo-100 rounded-lg p-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-900">Call #{{ selectedCallDetails?.callId }}</h2>
                <p class="text-xs text-gray-500 mt-0.5">Call Details</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm"
                    :class="getCallStatusClass(selectedCallDetails?.status || selectedCallDetails?.callStatus)">
                {{ selectedCallDetails?.status || selectedCallDetails?.callStatus || 'pending' }}
              </span>
              <button @click="closeCallDetails" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg class="w-5 h-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Panel Content -->
        <div class="flex-1 overflow-y-auto" style="max-height: calc(100vh - 80px);">
          <div class="p-6 space-y-6">

            <!-- Call Metadata -->
            <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex items-center gap-2 mb-4">
                <div class="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 class="text-base font-bold text-gray-900">Call Information</h3>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-xs text-gray-500">Call Type</p>
                  <p class="text-sm font-medium text-gray-900">
                    <span class="inline-flex items-center gap-1">
                      <svg v-if="selectedCallDetails?.callType === 'inbound'" class="w-4 h-4 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      <svg v-else class="w-4 h-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      {{ selectedCallDetails?.callType || 'Unknown' }}
                    </span>
                  </p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Duration</p>
                  <p class="text-sm font-medium text-gray-900">{{ formatDuration(selectedCallDetails?.duration) || 'N/A' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Start Time</p>
                  <p class="text-sm font-medium text-gray-900">{{ formatDateTime(selectedCallDetails?.startTime) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">End Time</p>
                  <p class="text-sm font-medium text-gray-900">{{ formatDateTime(selectedCallDetails?.endTime) || 'Ongoing' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Provider</p>
                  <p class="text-sm font-medium text-gray-900">{{ selectedCallDetails?.provider || 'Default Provider' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Recording Status</p>
                  <p class="text-sm font-medium text-gray-900">
                    <span v-if="selectedCallDetails?.recordingUrl" class="text-green-600">Available</span>
                    <span v-else class="text-gray-400">Not Available</span>
                  </p>
                </div>
              </div>
            </div>

            <!-- Customer & Agent Information -->
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-center gap-2 mb-4">
                  <div class="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 class="text-base font-bold text-gray-900">Customer</h3>
                </div>
                <div class="space-y-2">
                  <div>
                    <p class="text-xs text-gray-500">Name</p>
                    <p class="text-sm font-medium text-gray-900">{{ selectedCallDetails?.customerName || 'Unknown' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500">Phone</p>
                    <p class="text-sm font-medium text-gray-900">{{ selectedCallDetails?.phone || 'N/A' }}</p>
                  </div>
                </div>
              </div>
              <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-center gap-2 mb-4">
                  <div class="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 class="text-base font-bold text-gray-900">Agent</h3>
                </div>
                <div class="space-y-3">
                  <div>
                    <p class="text-xs text-gray-500">Currently Assigned</p>
                    <p class="text-sm font-medium text-gray-900">{{ selectedCallDetails?.agentName || 'Not Assigned' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500">Phone</p>
                    <p class="text-sm font-medium text-gray-900">{{ selectedCallDetails?.agentPhone || 'N/A' }}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <select
                      v-model="selectedCallDetails.agentId"
                      class="px-2 py-1 border border-gray-300 rounded text-xs bg-white text-gray-900"
                    >
                      <option value="" disabled>Select agent</option>
                      <option
                        v-for="agent in availableAgentsForCall"
                        :key="agent.id"
                        :value="agent.id"
                      >
                        {{ agent.agentName || agent.name || agent.label }}
                      </option>
                    </select>
                    <button
                      @click="changeCallAgent"
                      :disabled="!selectedCallDetails?.agentId || changingCallAgent"
                      class="text-xs px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {{ changingCallAgent ? 'Updating...' : 'Update Agent' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Update Call Status -->
            <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex items-center gap-2 mb-4">
                <div class="bg-gradient-to-r from-violet-100 to-purple-100 rounded-lg p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 class="text-base font-bold text-gray-900">Update Call Status</h3>
              </div>
              <div class="space-y-3">
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-2">Current Status</label>
                  <div class="flex items-center gap-2 mb-3">
                    <span class="px-3 py-1.5 rounded-full text-xs font-semibold"
                          :class="getCallStatusClass(selectedCallDetails?.callStatus || 'pending')">
                      {{ (selectedCallDetails?.callStatus || 'pending').toUpperCase() }}
                    </span>
                  </div>
                </div>
                <div>
                  <label for="callStatusSelectPanel" class="block text-xs font-medium text-gray-700 mb-2">Change Status To</label>
                  <select
                    id="callStatusSelectPanel"
                    v-model="selectedCallDetailsStatus"
                    @change="updateCallDetailsStatus"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="missed">Missed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                <p class="text-xs text-gray-500 italic">Status will update immediately when changed</p>
              </div>
            </div>

            <!-- Call Recording Player -->
            <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex items-center gap-2 mb-4">
                <div class="bg-gradient-to-r from-red-100 to-rose-100 rounded-lg p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h3 class="text-base font-bold text-gray-900">Call Recording</h3>
              </div>
              <div v-if="selectedCallDetails?.recordingUrl" class="space-y-3">
                <audio controls class="w-full">
                  <source :src="selectedCallDetails.recordingUrl" type="audio/mpeg">
                  Your browser does not support the audio element.
                </audio>
                <div class="flex items-center justify-between text-xs text-gray-500">
                  <span>Duration: {{ formatDuration(selectedCallDetails?.duration) }}</span>
                  <button class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                    Download Recording
                  </button>
                </div>
              </div>
              <div v-else class="text-center py-8 text-gray-500">
                <svg class="mx-auto h-12 w-12 text-gray-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <p class="text-sm">No recording available for this call</p>
              </div>
            </div>

            <!-- Related Ticket Information -->
            <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex items-center gap-2 mb-4">
                <div class="bg-gradient-to-r from-orange-100 to-amber-100 rounded-lg p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <h3 class="text-base font-bold text-gray-900">Related Ticket</h3>
              </div>
              <div v-if="selectedCallDetails?.ticketId && selectedCallDetails.ticketId !== '' && selectedCallDetails.ticketId !== null && selectedCallDetails.ticketId !== 0 && selectedCallDetails.ticketId !== '0'">
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm font-medium text-yellow-900">Ticket #{{ selectedCallDetails.ticketId }}</p>
                      <p class="text-xs text-yellow-700 mt-1">{{ selectedCallDetails.ticketStatus || 'Active' }}</p>
                    </div>
                    <button @click="viewRelatedTicket" class="px-3 py-1.5 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors">
                      View Ticket
                    </button>
                  </div>
                </div>
                <div class="mt-3 space-y-2">
                  <div>
                    <p class="text-xs text-gray-500">Subject</p>
                    <p class="text-sm text-gray-900">{{ selectedCallDetails.reason || 'N/A' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500">Description</p>
                    <p class="text-sm text-gray-700">{{ selectedCallDetails.callDescription || 'N/A' }}</p>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-6 text-gray-500">
                <p class="text-sm">No ticket linked to this call</p>
              </div>
            </div>

            <!-- Call Notes -->
            <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <div class="bg-gradient-to-r from-teal-100 to-cyan-100 rounded-lg p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 class="text-base font-bold text-gray-900">Call Notes</h3>
                </div>
                <button @click="showAddCallNote = true" class="text-xs text-blue-600 hover:text-blue-700">+ Add Note</button>
              </div>
              <div v-if="showAddCallNote" class="mb-3">
                <textarea v-model="newCallNote" rows="3" placeholder="Enter your note..."
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"></textarea>
                <div class="flex gap-2 mt-2">
                  <button @click="addCallNote" class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                    Add Note
                  </button>
                  <button @click="showAddCallNote = false; newCallNote = ''" class="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400">
                    Cancel
                  </button>
                </div>
              </div>
              <div class="space-y-2">
                <div v-for="note in callNotes" :key="note.id" class="p-2 bg-gray-50 rounded-lg">
                  <p class="text-sm text-gray-900">{{ note.text }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ note.timestamp }}</p>
                </div>
                <div v-if="!callNotes || callNotes.length === 0" class="text-center py-4 text-gray-500">
                  <p class="text-sm">No notes added yet</p>
                </div>
              </div>
            </div>

            <!-- Activity Log -->
            <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex items-center gap-2 mb-4">
                <div class="bg-gradient-to-r from-slate-100 to-gray-100 rounded-lg p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 class="text-base font-bold text-gray-900">Call Activity</h3>
              </div>
              <div class="space-y-4">
                <div class="flex gap-3 relative">
                  <div class="flex flex-col items-center flex-shrink-0">
                    <div class="w-3 h-3 bg-green-500 rounded-full shadow-sm ring-4 ring-green-100"></div>
                    <div class="w-0.5 h-full bg-gray-200 mt-1"></div>
                  </div>
                  <div class="flex-1 pb-4">
                    <p class="text-sm text-gray-900">Call initiated</p>
                    <p class="text-xs text-gray-500">{{ formatDateTime(selectedCallDetails?.startTime) }}</p>
                  </div>
                </div>
                <div v-if="selectedCallDetails?.agentName" class="flex gap-3 relative">
                  <div class="flex flex-col items-center flex-shrink-0">
                    <div class="w-3 h-3 bg-blue-500 rounded-full shadow-sm ring-4 ring-blue-100"></div>
                    <div class="w-0.5 h-full bg-gray-200 mt-1"></div>
                  </div>
                  <div class="flex-1 pb-4">
                    <p class="text-sm text-gray-900">Connected to {{ selectedCallDetails.agentName }}</p>
                    <p class="text-xs text-gray-500">{{ formatDateTime(selectedCallDetails?.startTime) }}</p>
                  </div>
                </div>
                <div v-if="selectedCallDetails?.endTime" class="flex gap-3 relative">
                  <div class="flex flex-col items-center flex-shrink-0">
                    <div class="w-3 h-3 bg-gray-500 rounded-full shadow-sm ring-4 ring-gray-100"></div>
                    <div class="w-0.5 h-full bg-gray-200 mt-1"></div>
                  </div>
                  <div class="flex-1 pb-4">
                    <p class="text-sm text-gray-900">Call ended</p>
                    <p class="text-xs text-gray-500">{{ formatDateTime(selectedCallDetails?.endTime) }}</p>
                  </div>
                </div>
                <div v-if="selectedCallDetails?.ticketId" class="flex gap-3 relative">
                  <div class="flex flex-col items-center flex-shrink-0">
                    <div class="w-3 h-3 bg-yellow-500 rounded-full shadow-sm ring-4 ring-yellow-100"></div>
                    <div class="w-0.5 h-full bg-gray-200 mt-1"></div>
                  </div>
                  <div class="flex-1 pb-4">
                    <p class="text-sm text-gray-900">Ticket #{{ selectedCallDetails.ticketId }} created</p>
                    <p class="text-xs text-gray-500">{{ formatDateTime(selectedCallDetails?.createdAt) }}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Recording Modal -->
    <div v-if="showRecordingModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div class="bg-white rounded-lg shadow-2xl max-w-md w-full">
        <!-- Modal Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 class="text-base font-bold text-gray-900">Call Recording</h3>
          <button
            @click="closeRecordingModal"
            class="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Recording Content -->
        <div class="p-4">
          <!-- Audio Player -->
          <div class="w-full mb-3">
            <audio
              controls
              :src="recordingUrl || getDummyAudioUrl()"
              class="w-full h-9 rounded"
              preload="metadata"
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            @click="closeRecordingModal"
            class="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm font-medium transition-colors"
          >
            Close
          </button>
          <a
            :href="recordingUrl || getDummyAudioUrl()"
            download
            target="_blank"
            class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors inline-flex items-center gap-1.5"
          >
            <svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download
          </a>
        </div>
      </div>
    </div>
</template>

<script>
import DateRangePicker from '~/components/DateRangePicker.vue'

export default {
  name: 'CallTicketsList',

  components: {
    DateRangePicker
  },

  data() {
    return {
      // Data state
      calls: [],
      loading: false,
      error: null,

      // Auto-refresh
      refreshInterval: null,

      // Search and filter
      searchQuery: '',
      statusFilter: '',
      callTypeFilter: '',
      showFilter: false,
      showFilterDropdown: false,
      showSortDropdown: false,
      showDisplayDropdown: false,

      // Sort options
      sortBy: 'callId',
      sortOrder: 'asc',
      sortOptions: [
        { value: 'callId', label: 'Call ID' },
        { value: 'customerName', label: 'Customer Name' },
        { value: 'agentName', label: 'Agent Name' },
        { value: 'callType', label: 'Call Type' },
        { value: 'status', label: 'Status' },
        { value: 'duration', label: 'Duration' },
        { value: 'callDateTime', label: 'Call Date & Time' }
      ],

      // Filter options
      callTypeOptions: [
        { value: 'inbound', label: 'Inbound' },
        { value: 'outbound', label: 'Outbound' }
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
        duration: '',
        dateRange: {
          callDateFrom: null,
          callDateTo: null
        }
      },

      // Available agents (will be populated from data)
      agentOptions: [],

      // Expanded sections state
      expandedSections: {
        callType: false,
        status: false,
        agent: false,
        duration: false,
        dateRange: false
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
      itemsPerPage: 10,

      // Call Modal
      showCallModal: false,
      selectedCall: null,
      callStatus: 'pending',
      selectedCallStatus: 'pending',
      uploadedRecording: null, // Store uploaded recording file

      // Recording Modal
      showRecordingModal: false,
      recordingUrl: null,

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
      isSubmittingTicket: false,

      // Call Details Side Panel
      showCallDetailsPanel: false,
      selectedCallDetails: null,
      callNotes: [],
      showAddCallNote: false,
      newCallNote: '',

      // Agent change for call side panel
      availableAgentsForCall: [],
      changingCallAgent: false,

      // Call status update for side panel
      selectedCallDetailsStatus: 'pending'
    }
  },

  computed: {
    // Check if there are active filters
    hasActiveFilters() {
      return this.activeFilters.callTypes.length > 0 ||
             this.activeFilters.status.length > 0 ||
             this.activeFilters.agents.length > 0 ||
             this.activeFilters.duration !== '' ||
             this.activeFilters.dateRange.callDateFrom !== null ||
             this.activeFilters.dateRange.callDateTo !== null
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

      // Date Range chip
      if (this.activeFilters.dateRange.callDateFrom || this.activeFilters.dateRange.callDateTo) {
        const label = `Date: ${this.activeFilters.dateRange.callDateFrom || '...'} - ${this.activeFilters.dateRange.callDateTo || '...'}`
        chips.push({
          key: 'dateRange-callDate',
          label,
          type: 'dateRange',
          value: 'callDate'
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

      // Apply Call Date Range filter
      if (this.activeFilters.dateRange.callDateFrom || this.activeFilters.dateRange.callDateTo) {
        filtered = filtered.filter(call => {
          const callDateTime = call.callDateTime || call.createdAt || call.created_at
          if (!callDateTime) return false

          const callDate = new Date(callDateTime)

          if (this.activeFilters.dateRange.callDateFrom) {
            const fromDate = new Date(this.activeFilters.dateRange.callDateFrom)
            if (callDate < fromDate) return false
          }

          if (this.activeFilters.dateRange.callDateTo) {
            const toDate = new Date(this.activeFilters.dateRange.callDateTo)
            toDate.setHours(23, 59, 59, 999) // Include the entire "to" day
            if (callDate > toDate) return false
          }

          return true
        })
      }

      // Sort calls
      filtered = [...filtered].sort((a, b) => {
        let valueA = a[this.sortBy]
        let valueB = b[this.sortBy]

        // Handle null/undefined values
        if (valueA === null || valueA === undefined) valueA = ''
        if (valueB === null || valueB === undefined) valueB = ''

        // Handle callId sorting - extract numeric part if it exists
        if (this.sortBy === 'callId') {
          // Try to extract numbers from callId (e.g., "C001" -> 1)
          const numA = parseInt(String(valueA).match(/\d+/)?.[0] || '0')
          const numB = parseInt(String(valueB).match(/\d+/)?.[0] || '0')
          valueA = numA
          valueB = numB
        }

        // Handle date sorting
        if (this.sortBy === 'callDateTime') {
          valueA = valueA ? new Date(valueA).getTime() : 0
          valueB = valueB ? new Date(valueB).getTime() : 0
        }

        // Handle numeric sorting (duration)
        if (this.sortBy === 'duration') {
          valueA = Number(valueA) || 0
          valueB = Number(valueB) || 0
        }

        // Compare values
        let comparison = 0
        if (valueA > valueB) comparison = 1
        if (valueA < valueB) comparison = -1

        // Apply sort order
        return this.sortOrder === 'desc' ? comparison * -1 : comparison
      })

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

    // Setup auto-refresh every 10 seconds
    this.refreshInterval = setInterval(() => {
      this.fetchCallLogs();
    }, 10000); // 10000ms = 10 seconds

    // Add click event listener
    document.addEventListener('click', this.handleClickOutside);
  },

  beforeDestroy() {
    // Clean up event listener
    document.removeEventListener('click', this.handleClickOutside);

    // Clear auto-refresh interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  },

  methods: {
    // Fetch calls data from API
    async fetchCallLogs() {
      const startTime = Date.now()
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
          agentPhone: call.agentPhone,
          notes: call.notes // Internal notes from calls table
        }))

        // Extract unique agent names for filter dropdown
        const uniqueAgents = [...new Set(this.calls.map(call => call.agentName).filter(name => name && name !== 'Not Assigned'))]
        this.agentOptions = uniqueAgents.sort()

        // Build available agents list for call details side panel (simple structure with id + name)
        this.availableAgentsForCall = [...new Map(
          this.calls
            .filter(c => c.agentId && c.agentName && c.agentName !== 'Not Assigned')
            .map(c => [c.agentId, { id: c.agentId, agentName: c.agentName }])
        ).values()]

      } catch (error) {
        console.error('Error fetching calls:', error)
        this.error = error.message || 'Error fetching calls. Please try again.'
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

    // Close filter dropdown
    closeFilterDropdown() {
      this.showFilterDropdown = false
    },

    // Toggle sort dropdown
    toggleSortDropdown() {
      this.showSortDropdown = !this.showSortDropdown
    },

    // Apply sorting
    applySorting() {
      // Reset to first page when sorting changes
      this.currentPage = 1
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
        case 'dateRange':
          if (value === 'callDate') {
            this.activeFilters.dateRange.callDateFrom = null
            this.activeFilters.dateRange.callDateTo = null
          }
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
        duration: '',
        dateRange: {
          callDateFrom: null,
          callDateTo: null
        }
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

      // Close sort dropdown if clicking outside
      if (this.showSortDropdown) {
        const sortDropdown = this.$refs.sortDropdownRef;
        if (sortDropdown && !sortDropdown.contains(clickedElement)) {
          this.showSortDropdown = false;
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
      this.selectedCallStatus = call.status || 'pending'
      this.showCallModal = true
    },

    // Close call modal
    closeCallModal() {
      this.showCallModal = false
      this.selectedCall = null
      this.callStatus = 'pending'
    },

    // Update call status
    async updateCallStatus() {
      if (!this.selectedCall) return

      try {
        const callId = this.selectedCall.callId || this.selectedCall.id
        if (!callId) {
          console.error('No call ID found')
          return
        }

        console.log('Updating call status to:', this.selectedCallStatus)

        const response = await fetch(`http://localhost:5001/calls/${callId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: this.selectedCallStatus
          })
        })

        if (!response.ok) {
          throw new Error('Failed to update call status')
        }

        const result = await response.json()
        console.log('Call status updated successfully:', result)

        // Update local call data
        const callIndex = this.calls.findIndex(c => (c.callId || c.id) === callId)
        if (callIndex !== -1) {
          this.calls[callIndex].status = this.selectedCallStatus
          this.selectedCall.status = this.selectedCallStatus
        }

      } catch (error) {
        console.error('Error updating call status:', error)
        alert('Failed to update call status')
      }
    },

    // Open recording modal
    openRecordingModal(url) {
      this.recordingUrl = url
      this.showRecordingModal = true
    },

    // Close recording modal
    closeRecordingModal() {
      this.showRecordingModal = false
      this.recordingUrl = null
    },

    // Start call
    async startCall() {
      if (!this.selectedCall) return

      try {
        this.callStatus = 'connected'
        console.log('Call started with:', this.selectedCall.phone)

        // Check if this is a reconnect scenario (inbound+pending OR inbound+missed OR outbound+pending OR outbound+missed)
        console.log('=== RECONNECT CHECK ===')
        console.log('selectedCall.callType:', this.selectedCall.callType)
        console.log('selectedCall.status:', this.selectedCall.status)

        const isInboundPending = this.selectedCall.callType === 'inbound' && this.selectedCall.status === 'pending'
        const isInboundMissed = this.selectedCall.callType === 'inbound' && this.selectedCall.status === 'missed'
        const isOutboundPending = this.selectedCall.callType === 'outbound' && this.selectedCall.status === 'pending'
        const isOutboundMissed = this.selectedCall.callType === 'outbound' && this.selectedCall.status === 'missed'

        console.log('Is reconnect scenario?', isInboundPending || isInboundMissed || isOutboundPending || isOutboundMissed)
        console.log('  - Inbound+Pending:', isInboundPending)
        console.log('  - Inbound+Missed:', isInboundMissed)
        console.log('  - Outbound+Pending:', isOutboundPending)
        console.log('  - Outbound+Missed:', isOutboundMissed)
        console.log('=== END RECONNECT CHECK ===')

        if (isInboundPending || isInboundMissed || isOutboundPending || isOutboundMissed) {
          // Reconnect scenario: Create NEW callId
          console.log('🔄 RECONNECT: Creating new call for:', this.selectedCall.phone)

          const reconnectPayload = {
            customerPhone: this.selectedCall.phone,
            agentId: this.selectedCall.agentId || null,
            productId: this.selectedCall.productId || null,
            ticketId: this.selectedCall.ticketId || null,
            subject: this.selectedCall.reason || this.selectedCall.subject || 'Reconnect call'
          }

          console.log('Reconnect payload:', reconnectPayload)

          const response = await fetch('http://localhost:5001/calls/reconnect', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(reconnectPayload)
          })

          if (!response.ok) {
            throw new Error('Failed to create reconnect call')
          }

          const result = await response.json()
          console.log('✅ Reconnect call created successfully:', result)

          // Update selectedCall with the new call data
          this.selectedCall = {
            ...this.selectedCall,
            callId: result.data.callId,
            id: result.data.callId,
            callType: result.data.callType, // Use returned callType (will be 'outbound')
            status: result.data.callStatus, // Use preserved status from original call
            callDateTime: result.data.startTime,
            recordingUrl: result.data.recordingUrl,
            ticketId: result.data.ticketId,
            agentId: result.data.agentId
          }

          // Refresh the calls list to show the new call
          await this.fetchCallLogs()

        } else {
          // Normal scenario: Update existing call with start time
          const callIdToUpdate = this.selectedCall.callId || this.selectedCall.id

          if (!callIdToUpdate) {
            throw new Error('No call ID found to update')
          }

          console.log('Updating call status to connected for callId:', callIdToUpdate)

          const response = await fetch(`http://localhost:5001/calls/${callIdToUpdate}/start`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            }
          })

          if (!response.ok) {
            throw new Error('Failed to start call')
          }

          const result = await response.json()
          console.log('Call started successfully:', result)

          // Update local call data - keep status as pending, only update start time
          if (this.selectedCall) {
            this.selectedCall.callDateTime = result.data.startTime
          }

          // Refresh the calls list to show updated start time
          await this.fetchCallLogs()
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

        // Update the call log with end time and completed status
        const callIdToUpdate = this.selectedCall.callId || this.selectedCall.id

        if (!callIdToUpdate) {
          throw new Error('No call ID found to update')
        }

        console.log('Ending call for callId:', callIdToUpdate)

        const response = await fetch(`http://localhost:5001/calls/${callIdToUpdate}/end`, {
          method: 'PUT'
        })

        if (!response.ok) {
          throw new Error('Failed to end call')
        }

        const result = await response.json()
        console.log('Call ended successfully:', result)

        // Update local call data - keep status as pending, only update end time
        if (this.selectedCall) {
          this.selectedCall.endTime = result.data.endTime
        }

        // Refresh the calls list to show updated end time
        await this.fetchCallLogs()

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
        console.log('Current callStatus:', this.callStatus)
        console.log('Call type:', this.selectedCall.callType)

        // For OUTBOUND calls: Always mark as missed when disconnecting
        if (this.selectedCall.callType === 'outbound') {
          this.callStatus = 'missed'

          // Update existing call record as missed
          const callIdToUpdate = this.selectedCall.callId || this.selectedCall.id

          if (!callIdToUpdate) {
            throw new Error('No call ID found to update')
          }

          console.log('Marking outbound call as missed for callId:', callIdToUpdate)

          const response = await fetch(`http://localhost:5001/calls/${callIdToUpdate}/missed`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            }
          })

          if (!response.ok) {
            throw new Error('Failed to mark call as missed')
          }

          const result = await response.json()
          console.log('Outbound call marked as missed successfully:', result)

          // Update local call data with null values
          if (this.selectedCall) {
            this.selectedCall.status = 'missed'
            this.selectedCall.callDateTime = null
            this.selectedCall.endTime = null
            this.selectedCall.recordingUrl = null
          }

          // Refresh the calls list to show updated status
          await this.fetchCallLogs()
        } else {
          // For INBOUND calls: Just disconnect without marking as missed
          console.log('Disconnecting inbound call (not marking as missed)')
          this.callStatus = 'disconnected'

          // Close the modal
          this.closeCallModal()
        }

        // Keep modal open to show the missed status for outbound calls
        // User can close it manually

      } catch (error) {
        console.error('Error disconnecting call:', error)
        if (this.selectedCall.callType === 'outbound') {
          this.callStatus = 'missed' // Still update UI even if API fails
        }
      }
    },

    // Handle recording file upload
    async handleRecordingUpload(event) {
      const file = event.target.files[0]
      if (!file) return

      console.log('Selected file:', file.name, file.type, file.size)

      // Validate file type
      if (!file.type.includes('audio') && !file.name.endsWith('.mp3')) {
        alert('Please upload an MP3 audio file')
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }

      this.uploadedRecording = file

      // Upload file to server
      try {
        const formData = new FormData()
        formData.append('recording', file)
        formData.append('callId', this.selectedCall?.callId || this.selectedCall?.id || '')

        console.log('Uploading recording for callId:', this.selectedCall?.callId || this.selectedCall?.id)

        const response = await fetch('http://localhost:5001/calls/upload-recording', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error('Failed to upload recording')
        }

        const result = await response.json()
        console.log('Recording uploaded successfully:', result)

        // Update selectedCall with new recording URL
        if (this.selectedCall) {
          this.selectedCall.recordingUrl = result.data.recordingUrl
        }

        alert('Recording uploaded successfully!')

      } catch (error) {
        console.error('Error uploading recording:', error)
        alert('Failed to upload recording. Please try again.')
        this.uploadedRecording = null
      }
    },

    // Update call status
    async updateCallStatus() {
      if (!this.selectedCall) return

      try {
        const callIdToUpdate = this.selectedCall.callId || this.selectedCall.id

        if (!callIdToUpdate) {
          console.error('No call ID found to update')
          return
        }

        console.log('Updating call status to:', this.selectedCallStatus, 'for callId:', callIdToUpdate)

        const response = await fetch(`http://localhost:5001/calls/${callIdToUpdate}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            callStatus: this.selectedCallStatus
          })
        })

        if (!response.ok) {
          throw new Error('Failed to update call status')
        }

        const result = await response.json()
        console.log('Call status updated successfully:', result)

        // Update local call data
        if (this.selectedCall) {
          this.selectedCall.status = this.selectedCallStatus
        }

        // Refresh the calls list to show updated status
        await this.fetchCallLogs()

      } catch (error) {
        console.error('Error updating call status:', error)
        // Reset to previous status on error
        this.selectedCallStatus = this.selectedCall.status || 'pending'
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

        // Show success message based on whether ticket was reused or newly created
        if (result.reuseExisting) {
          alert(`Call connected to existing ticket!\n\nTicket ID: ${result.data.ticketId}\nAgent: ${result.data.agentName || 'Not Assigned'}\n\nThis phone number has an open ticket, so the call has been linked to the existing ticket.`)
        } else {
          alert(`Ticket created successfully! Ticket ID: ${result.data.ticketId}`)
        }

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
    },

    // Call Details Side Panel Methods
    openCallDetails(call) {
      this.selectedCallDetails = { ...call }
      this.selectedCallDetailsStatus = call.callStatus || call.status || 'pending'
      this.showCallDetailsPanel = true
      this.loadCallRelatedData(call.callId)
    },

    closeCallDetails() {
      this.showCallDetailsPanel = false
      this.selectedCallDetails = null
      this.callNotes = []
      this.showAddCallNote = false
      this.newCallNote = ''
    },

    async loadCallRelatedData(callId) {
      // TODO: Fetch call notes and related data from backend
      // For now, using placeholder data
      this.callNotes = []

      // Parse existing notes and display them in the call notes list
      if (this.selectedCallDetails?.notes) {
        const notesText = this.selectedCallDetails.notes
        // Split notes by the timestamp separator
        const notesParts = notesText.split(/\n\n--- (.*?) ---\n/)

        // Parse the notes into structured format
        const parsedNotes = []

        if (notesParts.length === 1) {
          // Single note without timestamp
          parsedNotes.push({
            id: Date.now(),
            text: notesText,
            timestamp: new Date().toLocaleString()
          })
        } else {
          // Add the first note (before any separator)
          if (notesParts[0] && notesParts[0].trim()) {
            parsedNotes.push({
              id: Date.now(),
              text: notesParts[0].trim(),
              timestamp: 'Initial Note'
            })
          }

          // Multiple notes with timestamps
          for (let i = 1; i < notesParts.length; i += 2) {
            if (notesParts[i] && notesParts[i + 1]) {
              parsedNotes.push({
                id: Date.now() + i,
                text: notesParts[i + 1].trim(),
                timestamp: notesParts[i]
              })
            }
          }
        }

        // Reverse to show newest first
        this.callNotes = parsedNotes.reverse()
      }

      // Load available agents for the call's product
      try {
        const productId = this.selectedCallDetails?.productId
        if (productId) {
          const resAgents = await $fetch(`http://localhost:5001/agents/product/${productId}`)
          this.availableAgentsForCall = resAgents.data || []
        } else {
          this.availableAgentsForCall = []
        }
      } catch (err) {
        console.error('Error loading agents for call', err)
        this.availableAgentsForCall = []
      }
    },

    async changeCallAgent() {
      if (!this.selectedCallDetails || !this.selectedCallDetails.agentId) return

      this.changingCallAgent = true
      const callId = this.selectedCallDetails.callId
      const agentId = this.selectedCallDetails.agentId
      const ticketId = this.selectedCallDetails.ticketId

      try {
        // Step 1: Update calls table
        const updateCallResponse = await $fetch(`http://localhost:5001/calls/${callId}/agent`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            agentId
          }
        })

        // Step 2: If there's a related ticket, update assign-ticket table
        if (ticketId && ticketId !== 0 && ticketId !== '0' && ticketId !== null) {
          await $fetch('http://localhost:5001/assign', {
            method: 'POST',
            body: {
              ticketId,
              agentId
            }
          })
        }

        // Update local call data with new agent info
        const agent = this.availableAgentsForCall.find(a => a.id == agentId)
        const agentName = agent ? (agent.agentName || agent.name) : this.selectedCallDetails.agentName

        this.selectedCallDetails = {
          ...this.selectedCallDetails,
          agentName,
          agentId
        }

        // Update in the calls list
        const idx = this.calls.findIndex(c => c.callId === callId)
        if (idx !== -1) {
          this.calls[idx] = {
            ...this.calls[idx],
            agentName,
            agentId
          }
        }

        alert('Agent updated successfully')
      } catch (error) {
        console.error('Error changing call agent', error)
        alert(`Failed to update agent: ${error.message || 'Unknown error'}`)
      } finally {
        this.changingCallAgent = false
      }
    },

    formatDuration(seconds) {
      if (!seconds) return 'N/A'
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },

    formatDateTime(dateTime) {
      if (!dateTime) return 'N/A'
      const date = new Date(dateTime)
      return date.toLocaleString()
    },

    getCallStatusClass(status) {
      switch(status?.toLowerCase()) {
        case 'pending': return 'bg-yellow-100 text-yellow-800'
        case 'connected': return 'bg-green-100 text-green-800'
        case 'ended': return 'bg-gray-100 text-gray-800'
        case 'missed': return 'bg-red-100 text-red-800'
        case 'cancelled': return 'bg-orange-100 text-orange-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    },

    async addCallNote() {
      if (this.newCallNote.trim()) {
        try {
          const ticketId = this.selectedCallDetails.ticketId

          if (!ticketId) {
            alert('No ticket associated with this call. Please create a ticket first.')
            return
          }

          // Save note to backend (calls table notes column via ticket endpoint)
          const response = await fetch(`http://localhost:5001/tickets/${ticketId}/details`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              notes: this.newCallNote
            })
          })

          const result = await response.json()

          if (!response.ok) {
            throw new Error(result.message || 'Failed to save note')
          }

          // Fetch updated call to get the full appended notes
          await this.fetchCalls()

          // Find the updated call
          const updatedCall = this.calls.find(c => c.id === this.selectedCallDetails.id)
          if (updatedCall) {
            this.selectedCallDetails.notes = updatedCall.notes
            // Reload notes to display them properly
            this.loadCallRelatedData(this.selectedCallDetails.callId)
          }

          this.newCallNote = ''
          this.showAddCallNote = false

          console.log('Note saved successfully')
        } catch (error) {
          console.error('Error saving note:', error)
          alert('Failed to save note: ' + error.message)
        }
      }
    },

    createTicketFromCall() {
      // Close the side panel and open ticket creation modal with call data
      this.selectedCall = this.selectedCallDetails
      this.closeCallDetails()
      this.viewCallDetails(this.selectedCallDetails)
    },

    viewRelatedTicket() {
      if (this.selectedCallDetails?.ticketId) {
        // Navigate to tickets page with ticket ID as query parameter
        this.$router.push({
          path: '/tickets',
          query: { ticketId: this.selectedCallDetails.ticketId }
        })
      }
    },

    // Update call status from side panel
    async updateCallDetailsStatus() {
      if (!this.selectedCallDetails) return

      try {
        const callIdToUpdate = this.selectedCallDetails.callId || this.selectedCallDetails.id

        if (!callIdToUpdate) {
          console.error('No call ID found to update')
          return
        }

        console.log('Updating call status to:', this.selectedCallDetailsStatus, 'for callId:', callIdToUpdate)

        const response = await fetch(`http://localhost:5001/calls/${callIdToUpdate}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            callStatus: this.selectedCallDetailsStatus
          })
        })

        if (!response.ok) {
          throw new Error('Failed to update call status')
        }

        const result = await response.json()
        console.log('Call status updated successfully:', result)

        // Update local call details data
        if (this.selectedCallDetails) {
          this.selectedCallDetails.callStatus = this.selectedCallDetailsStatus
          this.selectedCallDetails.status = this.selectedCallDetailsStatus
        }

        // Refresh the calls list to show updated status
        await this.fetchCallLogs()

      } catch (error) {
        console.error('Error updating call status:', error)
        // Reset to previous status on error
        this.selectedCallDetailsStatus = this.selectedCallDetails.callStatus || this.selectedCallDetails.status || 'pending'
      }
    },

    // Get dummy audio URL for demonstration
    getDummyAudioUrl() {
      // Local audio file path for customer-agent conversation
      // This simulates a realistic customer-agent interaction about:
      // - Curriculum link not received
      // - Dashboard not opening
      // - Course content unclear / videos too fast
      // Place your MP3 file at: public/audio/customer-agent-conversation.mp3
      return '/audio/customer-agent-conversation.mp3'
    }
  },

  watch: {
    'activeFilters.dateRange': {
      handler() {
        this.currentPage = 1
      },
      deep: true
    }
  }
}
</script>

<style scoped>
/* Side Panel Transition Animation */
.transform {
  transition: transform 0.3s ease-in-out;
}

.translate-x-0 {
  transform: translateX(0);
}

.translate-x-full {
  transform: translateX(100%);
}

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

/* Phone icon bounce effect */
.phone-bounce:hover {
  animation: phoneBounce 0.6s ease-in-out;
  transform-origin: center bottom;
}

@keyframes phoneBounce {
  0% {
    transform: scale(1) translateY(0);
  }
  50% {
    transform: scale(1.3) translateY(-2px);
  }
  100% {
    transform: scale(1) translateY(0);
  }
}
</style>