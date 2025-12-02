<template>
  <div class="h-full bg-gray-50 flex flex-col ">
    <!-- Fixed Header Section - Sticky -->
    <div class="flex-shrink-0 px-6">
      <!-- Header Title -->
      <div class="mb-1">
        <h1 class="text-2xl font-bold text-gray-900">Tickets Management</h1>
        <p class="text-gray-600 mt-1">View and manage support tickets</p>
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
              v-model="searchQuery"
              type="text"
              placeholder="Search by ticket ID, customer phone, keywords..."
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
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

  
          <!-- Dropdown -->
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

              <!-- Status Filter -->
              <div class="mb-2">
                <button
                  @click="toggleFilterSection('status')"
                  class="flex items-center justify-between w-full text-xs font-medium text-gray-700 hover:text-gray-900 py-1"
                >
                  <span>Status</span>
                  <img
                    src="/chevron-right.svg"
                    alt="expand"
                    class="w-3 h-3 transition-transform"
                    :class="{ 'rotate-90': expandedSections.status }"
                  />
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
                  <img
                    src="/chevron-right.svg"
                    alt="expand"
                    class="w-3 h-3 transition-transform"
                    :class="{ 'rotate-90': expandedSections.agent }"
                  />
                </button>
                <div v-if="expandedSections.agent" class="mt-1 space-y-1 pl-2">
                  <label v-for="agent in agentOptions" :key="agent" class="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 p-1 rounded text-xs">
                    <input type="checkbox" :value="agent" v-model="activeFilters.agents" class="w-3 h-3 text-blue-600 rounded border-gray-300">
                    <span>{{ agent }}</span>
                  </label>
                </div>
              </div>

              <!-- Product Filter -->
              <div class="mb-2">
                <button
                  @click="toggleFilterSection('product')"
                  class="flex items-center justify-between w-full text-xs font-medium text-gray-700 hover:text-gray-900 py-1"
                >
                  <span>Product</span>
                  <img
                    src="/chevron-right.svg"
                    alt="expand"
                    class="w-3 h-3 transition-transform"
                    :class="{ 'rotate-90': expandedSections.product }"
                  />
                </button>
                <div v-if="expandedSections.product" class="mt-1 space-y-1 pl-2">
                  <label v-for="product in productOptions" :key="product" class="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 p-1 rounded text-xs">
                    <input type="checkbox" :value="product" v-model="activeFilters.products" class="w-3 h-3 text-blue-600 rounded border-gray-300">
                    <span>{{ product }}</span>
                  </label>
                </div>
              </div>

              <!-- FCR Filter -->
              <div class="mb-2">
                <button
                  @click="toggleFilterSection('fcr')"
                  class="flex items-center justify-between w-full text-xs font-medium text-gray-700 hover:text-gray-900 py-1"
                >
                  <span>FCR</span>
                  <img
                    src="/chevron-right.svg"
                    alt="expand"
                    class="w-3 h-3 transition-transform"
                    :class="{ 'rotate-90': expandedSections.fcr }"
                  />
                </button>
                <div v-if="expandedSections.fcr" class="mt-1 space-y-1 pl-2">
                  <label class="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 p-1 rounded text-xs">
                    <input type="checkbox" value="yes" v-model="activeFilters.fcr" class="w-3 h-3 text-blue-600 rounded border-gray-300">
                    <span>Yes</span>
                  </label>
                  <label class="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 p-1 rounded text-xs">
                    <input type="checkbox" value="no" v-model="activeFilters.fcr" class="w-3 h-3 text-blue-600 rounded border-gray-300">
                    <span>No</span>
                  </label>
                </div>
              </div>

              <!-- CSAT Rating Filter -->
              <div class="mb-2">
                <button
                  @click="toggleFilterSection('csat')"
                  class="flex items-center justify-between w-full text-xs font-medium text-gray-700 hover:text-gray-900 py-1"
                >
                  <span>CSAT Rating</span>
                  <img
                    src="/chevron-right.svg"
                    alt="expand"
                    class="w-3 h-3 transition-transform"
                    :class="{ 'rotate-90': expandedSections.csat }"
                  />
                </button>
                <div v-if="expandedSections.csat" class="mt-1 space-y-1 pl-2">
                  <label v-for="rating in csatRatingOptions" :key="rating.value" class="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 p-1 rounded text-xs">
                    <input type="checkbox" :value="rating.value" v-model="activeFilters.csatRating" class="w-3 h-3 text-blue-600 rounded border-gray-300">
                    <span>{{ rating.label }}</span>
                  </label>
                </div>
              </div>

              <!-- Date Range Filter -->
              <div>
                <button
                  @click="toggleFilterSection('dateRange')"
                  class="flex items-center justify-between w-full text-xs font-medium text-gray-700 hover:text-gray-900 py-1"
                >
                  <span>Date Range</span>
                  <img
                    src="/chevron-right.svg"
                    alt="expand"
                    class="w-3 h-3 transition-transform"
                    :class="{ 'rotate-90': expandedSections.dateRange }"
                  />
                </button>
                <div v-if="expandedSections.dateRange" class="mt-1 space-y-3 pl-2">
                  <!-- Created Date Range -->
                  <div>
                    <label class="text-xs font-medium text-gray-600 mb-1 block">Created Date</label>
                    <DateRangePicker
                      :startDate="activeFilters.dateRange.createdFrom"
                      :endDate="activeFilters.dateRange.createdTo"
                      placeholder="Select created date range"
                      @update:startDate="activeFilters.dateRange.createdFrom = $event"
                      @update:endDate="activeFilters.dateRange.createdTo = $event"
                      @close-filter="closeFilterDropdown"
                    />
                  </div>
                  <!-- Resolved Date Range -->
                  <div>
                    <label class="text-xs font-medium text-gray-600 mb-1 block">Resolved Date</label>
                    <DateRangePicker
                      :startDate="activeFilters.dateRange.resolvedFrom"
                      :endDate="activeFilters.dateRange.resolvedTo"
                      placeholder="Select resolved date range"
                      @update:startDate="activeFilters.dateRange.resolvedFrom = $event"
                      @update:endDate="activeFilters.dateRange.resolvedTo = $event"
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
          >
            <svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            Sort
          </button>

          <!-- Sort Dropdown -->
          <div
            v-if="showSortDropdown"
            class="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200"
            style="z-index: 50;"
          >
            <div class="p-2">
              <!-- Sort By Field -->
              <div class="mb-2">
                <div class="space-y-1">
                  <label
                    v-for="option in sortOptions"
                    :key="option.value"
                    class="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 p-1 rounded text-xs"
                    @click="setSortBy(option.value)"
                  >
                    <input
                      type="radio"
                      :value="option.value"
                      v-model="sortBy"
                      class="w-3 h-3 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span class="text-gray-700">{{ option.label }}</span>
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
            <img src="/setting.svg" alt="display settings" class="w-5 h-5" />
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
                    class="text-xs text-blue-600 hover:text-blue-700 px-1 py-0.5 rounded hover:bg-blue-50"
                  >
                    All
                  </button>
                  <button
                    @click="deselectAllColumns"
                    class="text-xs text-blue-600 hover:text-blue-700 px-1 py-0.5 rounded hover:bg-blue-50"
                  >
                    None
                  </button>
                </div>
              </div>

              <!-- Column Toggles -->
              <div class="grid grid-cols-2 gap-1">
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

    <!-- Table Container - Takes full remaining height with fixed pagination -->
    <div class="flex-1 overflow-hidden flex flex-col">
      <!-- Table Wrapper with scrollable content -->
      <div class="flex-1 overflow-auto" style="min-height: calc(100vh - 250px);">
        <!-- Empty State -->
        <div v-if="filteredTickets.length === 0" class="flex items-center justify-center" style="min-height: 400px;">
          <div class="text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No tickets found</h3>
            <p class="mt-1 text-sm text-gray-500">Try adjusting your search or filters</p>
          </div>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto" style="min-height: calc(100vh - 300px);">
          <div class="inline-block min-w-full align-middle h-full">
            <div class="overflow-hidden h-full">
              <table class="min-w-full border-collapse">
                <thead class="bg-gray-50 border-b-2 border-gray-300 sticky top-0 z-10">
                <tr>
                  <th v-if="visibleColumns.serialId" class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200" style="width: 60px; min-width: 60px;">ID</th>
                  <th v-if="visibleColumns.ticketId" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200" style="width: 110px; min-width: 110px;">Ticket ID</th>
                  <th v-if="visibleColumns.freshdeskId" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200" style="width: 110px; min-width: 110px;">Freshdesk ID</th>
                  <th v-if="visibleColumns.callId" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200" style="width: 110px; min-width: 110px;">Call ID</th>
                  <th v-if="visibleColumns.customer" class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200" style="width: 200px; min-width: 200px;">Customer</th>
                  <th v-if="visibleColumns.phone" class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200" style="width: 140px; min-width: 140px;">Phone</th>
                  <th v-if="visibleColumns.agent" class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200" style="width: 160px; min-width: 160px;">Agent</th>
                  <th v-if="visibleColumns.product" class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200" style="width: 130px; min-width: 130px;">Product</th>
                  <th v-if="visibleColumns.mergeId" class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200" style="width: 110px; min-width: 110px;">Merge ID</th>
                  <th v-if="visibleColumns.communicationWay" class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200" style="width: 150px; min-width: 150px;">Way of Communication</th>
                  <th v-if="visibleColumns.type" class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200" style="width: 110px; min-width: 110px;">Type</th>
                  <th v-if="visibleColumns.status" class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200" style="width: 130px; min-width: 130px;">Status</th>
                  <th v-if="visibleColumns.created" class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200" style="width: 130px; min-width: 130px;">Created</th>
                  <th v-if="visibleColumns.resolved" class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200" style="width: 130px; min-width: 130px;">Resolved</th>
                  <th v-if="visibleColumns.csat" class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200" style="width: 110px; min-width: 110px;">CSAT</th>
                  <th v-if="visibleColumns.fcr" class="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200" style="width: 90px; min-width: 90px;">FCR</th>
                  <th v-if="visibleColumns.notes" class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200" style="width: 200px; min-width: 200px;">Notes</th>
                  <th v-if="visibleColumns.feedback" class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200" style="width: 150px; min-width: 150px;">Feedback</th>
                  <th v-if="visibleColumns.actions" class="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200" style="width: 80px; min-width: 80px;">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="ticket in paginatedTickets"
                  :key="ticket.ticketId || ticket.callId || ticket.id"
                  class="border-b border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                  @click="openTicketDetails(ticket)"
                >
                  <!-- Serial ID (1, 2, 3...) -->
                  <td v-if="visibleColumns.serialId" class="px-6 py-4 whitespace-nowrap align-middle">
                    <span class="text-sm font-medium text-gray-600">{{ (currentPage - 1) * itemsPerPage + (filteredTickets.indexOf(ticket) % itemsPerPage) + 1 }}</span>
                  </td>

                  <!-- Ticket ID -->
                  <td v-if="visibleColumns.ticketId" class="px-6 py-4 whitespace-nowrap align-middle">
                    <span class="text-sm font-medium text-gray-600">
                      {{ ticket.ticketId === '0' || ticket.ticketId === '-' || ticket.ticketId === null || ticket.ticketId === undefined ? '-' : ticket.ticketId || '#' + ticket.id }}
                    </span>
                  </td>

                  <!-- Freshdesk ID -->
                  <td v-if="visibleColumns.freshdeskId" class="px-6 py-4 whitespace-nowrap align-middle">
                    <span v-if="ticket.freshdeskId" class="text-sm font-medium text-gray-600">{{ ticket.freshdeskId }}</span>
                    <span v-else class="text-sm text-gray-400">-</span>
                  </td>

                  <!-- Call ID -->
                  <td v-if="visibleColumns.callId" class="px-6 py-4 whitespace-nowrap align-middle">
                    <span v-if="ticket.callId" class="text-sm font-medium text-gray-600">{{ ticket.callId }}</span>
                    <span v-else class="text-sm text-gray-400">-</span>
                  </td>

                  <!-- Customer -->
                  <td v-if="visibleColumns.customer" class="px-6 py-4 align-middle">
                    <div class="text-sm leading-tight">
                      <div class="font-medium text-gray-900">{{ ticket.customerName }}</div>
                      <div class="flex items-center gap-1 text-gray-500 mt-0.5">
                        <span>{{ ticket.customerContact }}</span>
                        <img
                          v-if="isPhoneNumber(ticket.customerContact)"
                          src="/phone-call.svg"
                          alt="Call"
                          class="w-5 h-5 cursor-pointer hover:text-green-600 transition-colors phone-bounce"
                          @click.stop="openCallModal(ticket)"
                        />
                      </div>
                    </div>
                  </td>

                  <!-- Phone -->
                  <td v-if="visibleColumns.phone" class="px-6 py-4 whitespace-nowrap align-middle">
                    <div class="flex items-center gap-2">
                      <img
                        v-if="isPhoneNumber(ticket.phone)"
                        src="/phone-call.svg"
                        alt="Call"
                        class="w-5 h-5 cursor-pointer hover:text-green-600 transition-colors phone-bounce"
                        @click.stop="openCallModal(ticket)"
                      />
                      <span class="text-sm text-gray-900">{{ ticket.phone || '-' }}</span>
                    </div>
                  </td>

                  <!-- Agent -->
                  <td v-if="visibleColumns.agent" class="px-6 py-4 whitespace-nowrap align-middle">
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <span class="text-xs font-medium text-gray-600">{{ getInitials(ticket.agentName) }}</span>
                      </div>
                      <span class="text-sm text-gray-900">{{ ticket.agentName }}</span>
                    </div>
                  </td>

                  <!-- Product -->
                  <td v-if="visibleColumns.product" class="px-6 py-4 whitespace-nowrap align-middle">
                    <span class="text-sm text-gray-900">{{ ticket.productCategory }}</span>
                  </td>

                  <!-- Merge ID -->
                  <td v-if="visibleColumns.mergeId" class="px-6 py-4 whitespace-nowrap align-middle">
                    <span v-if="ticket.mergeId" class="text-sm font-medium text-purple-600">{{ ticket.mergeId }}</span>
                    <span v-else class="text-sm text-gray-400">-</span>
                  </td>

                  <!-- Way of Communication -->
                  <td v-if="visibleColumns.communicationWay" class="px-6 py-4 whitespace-nowrap align-middle" @click.stop>
                    <select v-model="ticket.wayOfCommunication" class="px-2 py-1 text-xs border border-gray-300 rounded-md bg-white" @change="updateCommunicationWay(ticket)" @click.stop>
                      <option value="">Select...</option>
                      <option value="Call" :selected="ticket.wayOfCommunication === 'Call'">Call</option>
                      <option value="Email" :selected="ticket.wayOfCommunication === 'Email'">Email</option>
                      <option value="Chat" :selected="ticket.wayOfCommunication === 'Chat'">Chat</option>
                    </select>
                  </td>

                  <!-- Type -->
                  <td v-if="visibleColumns.type" class="px-6 py-4 whitespace-nowrap align-middle">
                    <span class="text-sm text-gray-700 capitalize">{{ ticket.type }}</span>
                  </td>

                  <!-- Status -->
                  <td v-if="visibleColumns.status" class="px-6 py-4 whitespace-nowrap align-middle" @click.stop>
                    <select
                      v-model="ticket.status"
                      class="px-2 py-1 text-xs border border-gray-300 rounded-md capitalize"
                      @change="updateTicketStatus(ticket)"
                      @click.stop
                    >
                      <option value="created">Created</option>
                      <option value="assigned">Assigned</option>
                      <option value="in-progress">In Progress</option>
                      <option value="pending">Pending</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>

                  <!-- Created Date -->
                  <td v-if="visibleColumns.created" class="px-6 py-4 whitespace-nowrap align-middle text-sm text-gray-600">
                    {{ formatDate(ticket.createdDate) }}
                  </td>

                  <!-- Resolved Date -->
                  <td v-if="visibleColumns.resolved" class="px-6 py-4 whitespace-nowrap align-middle text-sm text-gray-600">
                    {{ ticket.resolvedDate ? formatDate(ticket.resolvedDate) : '-' }}
                  </td>

                  <!-- CSAT Rating -->
                  <td v-if="visibleColumns.csat" class="px-6 py-4 whitespace-nowrap align-middle">
                    <div v-if="ticket.feedbackRating" class="flex items-center gap-0.5">
                      <span
                        v-for="n in 5"
                        :key="n"
                        class="text-yellow-400"
                      >
                        <svg v-if="n <= ticket.feedbackRating" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </span>
                      <span class="ml-1 text-xs text-gray-600">({{ ticket.feedbackRating }})</span>
                    </div>
                    <span v-else class="text-sm text-gray-400">-</span>
                  </td>

                  <!-- FCR Indicator -->
                  <td v-if="visibleColumns.fcr" class="px-6 py-4 whitespace-nowrap align-middle text-center">
                    <span
                      v-if="ticket.firstCallResolution"
                      class="inline-flex items-center justify-center w-6 h-6 bg-green-100 rounded-full"
                      title="First Call Resolution"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-green-600">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </span>
                    <span v-else class="text-gray-300">-</span>
                  </td>

                  <!-- Notes Preview -->
                  <td v-if="visibleColumns.notes" class="px-6 py-4 align-middle">
                    <div class="text-sm text-gray-600 truncate" style="max-width: 200px;">
                      {{ getLatestNotePreview(ticket.notes) }}
                    </div>
                  </td>

                  <!-- Feedback -->
                  <td v-if="visibleColumns.feedback" class="px-6 py-4 align-middle">
                    <!-- Show "Feedback Received" if status is received -->
                    <div v-if="ticket.feedbackStatus === 'received'" class="flex items-center gap-2">
                      <button
                        @click.stop="openFeedbackDetailsModal(ticket)"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors cursor-pointer whitespace-nowrap"
                        title="Click to view feedback details"
                      >
                        Feedback Received
                      </button>
                      <span v-if="ticket.feedbackRating" class="text-xs text-gray-600 whitespace-nowrap">
                        ({{ ticket.feedbackRating }}/5)
                      </span>
                    </div>
                    <!-- Show Open/Copy buttons if status is pending -->
                    <div v-else-if="ticket.feedbackStatus === 'pending' && ticket.feedbackLink" class="flex items-center gap-2">
                      <button
                        @click.stop="openFeedbackLinkInNewTab(ticket.feedbackLink)"
                        class="px-2 py-0.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors whitespace-nowrap"
                        title="Open feedback form"
                      >
                        Open
                      </button>
                      <button
                        @click.stop="copyFeedbackLinkFromTable(ticket.feedbackLink)"
                        class="px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors whitespace-nowrap"
                        title="Copy feedback link"
                      >
                        {{ ticket.feedbackLinkCopied ? 'Copied!' : 'Copy' }}
                      </button>
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 whitespace-nowrap">
                        Pending
                      </span>
                    </div>
                    <!-- Fallback: Show - if no feedback -->
                    <span v-else class="text-sm text-gray-400">-</span>
                  </td>

                  <!-- Actions -->
                  <td v-if="visibleColumns.actions" class="px-6 py-4 whitespace-nowrap text-center align-middle">
                    <button
                      @click.stop="toggleActionsMenu(ticket)"
                      class="p-1 rounded hover:bg-gray-100 transition-colors"
                      title="Actions"
                    >
                      <img src="/three-dots.svg" alt="Actions" class="w-5 h-5 cursor-pointer" />
                    </button>
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
          <!-- Controls row -->
          <div class="flex items-center justify-center">
            <!-- Previous Button -->
            <button
              @click="previousPage"
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

    <!-- Actions Menu Modal -->
    <div v-if="showActionsMenu" class="fixed inset-0 bg-black bg-opacity-50 z-50" @click="closeActionsMenu">
      <div class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[160px] py-2" @click.stop>
        <!-- Create Ticket Option -->
        <button
          @click="handleCreateTicket"
          class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-3"
        >
          <svg class="w-4 h-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create Ticket
        </button>

        <!-- Merge Ticket Option -->
        <button
          @click="handleMergeTicket"
          class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-3"
        >
          <svg class="w-4 h-4 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Merge Ticket
        </button>
      </div>
    </div>

    <!-- Call Modal -->
    <div v-if="showCallModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-900">Call Details</h3>
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
        <div v-if="selectedTicket" class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Left Column - Ticket Information -->
            <div class="space-y-4">
              <h4 class="font-semibold text-gray-900 text-lg">Ticket Information</h4>

              <!-- Ticket ID -->
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Ticket ID:</span>
                <span class="text-sm font-mono font-semibold text-blue-600">{{ selectedTicket.id }}</span>
              </div>

              <!-- Customer Name -->
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Customer Name:</span>
                <span class="text-sm font-medium text-gray-900">{{ selectedTicket.customerName }}</span>
              </div>

              <!-- Phone -->
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Phone:</span>
                <span class="text-sm font-medium text-gray-900">{{ selectedTicket.customerContact || '-' }}</span>
              </div>

              <!-- Status -->
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Status:</span>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="getStatusBadgeClass(selectedTicket.status)">
                  {{ selectedTicket.status }}
                </span>
              </div>

              <!-- Product -->
              <div v-if="selectedTicket.productName" class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Product:</span>
                <span class="text-sm text-gray-900">{{ selectedTicket.productName }}</span>
              </div>

              <!-- Issue Type -->
              <div v-if="selectedTicket.issueType" class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Issue Type:</span>
                <span class="text-sm text-gray-900">{{ selectedTicket.issueType }}</span>
              </div>
            </div>

            <!-- Right Column - Agent & Call Controls -->
            <div class="space-y-4">
              <h4 class="font-semibold text-gray-900 text-lg">Call Controls</h4>

              <!-- Agent Assignment Section -->
              <div v-if="assignedAgent" class="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <h4 class="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Assigned Agent
                </h4>
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-indigo-700">Agent Name:</span>
                    <span class="text-sm font-medium text-indigo-900">{{ selectedTicket.agentName || 'Not Assigned' }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-indigo-700">Call Status:</span>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                          :class="getCallStatusClass()">
                      {{ getCallStatusText() }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Call Control Buttons -->
              <div class="space-y-3">
                <!-- Connect/Cancel Buttons - Show only when call is not active -->
                <div v-if="callStatus === 'pending' || callStatus === 'ended' || callStatus === 'cancelled' || callStatus === 'disconnected'" class="flex gap-3">
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

                <!-- Connected State -->
                <div v-else-if="callStatus === 'connected'" class="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div class="flex items-center gap-3">
                    <div class="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
                    <div>
                      <p class="text-sm font-medium text-green-800">Call Connected</p>
                      <p class="text-xs text-green-600">Currently speaking with {{ selectedTicket.customerName }}</p>
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
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Ticket Details Side Panel -->
    <div v-if="showTicketDetails" class="fixed inset-0 z-50 overflow-hidden">
      <!-- Background overlay -->
      <div class="absolute inset-0 bg-black bg-opacity-50" @click="closeTicketDetails"></div>

      <!-- Side panel -->
      <div class="absolute right-0 top-0 h-full w-full max-w-3xl bg-gradient-to-br from-gray-50 to-white shadow-2xl transform transition-transform duration-300"
           :class="showTicketDetails ? 'translate-x-0' : 'translate-x-full'">

        <!-- Panel Header -->
        <div class="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-5 shadow-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="bg-blue-100 rounded-lg p-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-900">{{ selectedTicketDetails?.ticketId || '#' + selectedTicketDetails?.id }}</h2>
                <p class="text-xs text-gray-500 mt-0.5">Ticket Details</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm"
                    :class="getStatusBadgeClass(selectedTicketDetails?.status)">
                {{ selectedTicketDetails?.status }}
              </span>
              <button @click="closeTicketDetails" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
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

            <!-- Quick Actions Bar -->
            <div class="flex gap-3 flex-wrap">
              <button @click="editMode ? saveTicketDetails() : editMode = true"
                      class="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {{ editMode ? 'Save Changes' : 'Edit Details' }}
              </button>
              <button @click="goToAssignTicket"
                      class="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Link to Freshdesk
              </button>
            </div>

            <!-- Customer Information -->
            <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex items-center gap-2 mb-4">
                <div class="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 class="text-base font-bold text-gray-900">Customer Information</h3>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-gray-50 rounded-lg p-3">
                  <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Name</p>
                  <p class="text-sm font-medium text-gray-900">{{ selectedTicketDetails?.customerName }}</p>
                </div>
                <div class="bg-gray-50 rounded-lg p-3">
                  <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone</p>
                  <p class="text-sm font-medium text-gray-900">{{ selectedTicketDetails?.phone }}</p>
                </div>
                <div class="bg-gray-50 rounded-lg p-3">
                  <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</p>
                  <p class="text-sm font-medium text-gray-900">{{ selectedTicketDetails?.customerContact || 'N/A' }}</p>
                </div>
                <div class="bg-gray-50 rounded-lg p-3">
                  <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Product</p>
                  <p class="text-sm font-medium text-gray-900">{{ selectedTicketDetails?.productCategory || 'N/A' }}</p>
                </div>
              </div>
            </div>

            <!-- Ticket Details -->
            <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex items-center gap-2 mb-4">
                <div class="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 class="text-base font-bold text-gray-900">Ticket Details</h3>
              </div>
              <div class="space-y-3">
                <div>
                  <p class="text-xs text-gray-500">Subject</p>
                  <input v-if="editMode" v-model="editedTicket.subject" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm" />
                  <p v-else class="text-sm text-gray-900">{{ selectedTicketDetails?.subject || 'No subject' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Description</p>
                  <textarea v-if="editMode" v-model="editedTicket.description" rows="3"
                            class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"></textarea>
                  <p v-else class="text-sm text-gray-900 whitespace-pre-wrap">{{ selectedTicketDetails?.description || 'No description' }}</p>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-xs text-gray-500">Priority</p>
                    <select v-if="editMode" v-model="editedTicket.priority" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                    <p v-else class="text-sm font-medium text-gray-900">{{ selectedTicketDetails?.priority || 'Medium' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500">Type</p>
                    <p class="text-sm font-medium text-gray-900">{{ selectedTicketDetails?.type || '-' }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Agent Assignment & History -->
            <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex items-center gap-2 mb-4">
                <div class="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 class="text-base font-bold text-gray-900">Agent Assignment</h3>
              </div>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-xs text-gray-500">Currently Assigned To</p>
                    <p class="text-sm font-medium text-gray-900">{{ selectedTicketDetails?.agentName || 'Unassigned' }}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <select
                      v-model="selectedTicketDetails.agentId"
                      class="px-2 py-1 border border-gray-300 rounded text-xs"
                    >
                      <option value="" disabled>Select agent</option>
                      <option
                        v-for="agent in availableAgentsForTicket"
                        :key="agent.id"
                        :value="agent.id"
                      >
                        {{ agent.agentName || agent.name }}
                      </option>
                    </select>
                    <button
                      @click="changeTicketAgent"
                      :disabled="!selectedTicketDetails?.agentId || changingAgent"
                      class="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {{ changingAgent ? 'Updating...' : 'Update Agent' }}
                    </button>
                  </div>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-2">Assignment History</p>
                  <div v-if="assignmentHistory && assignmentHistory.length > 0" class="space-y-1 text-xs text-gray-600">
                    <div v-for="assignment in assignmentHistory" :key="assignment.id" class="flex justify-between">
                      <span>{{ assignment.agentName || 'Unknown Agent' }}</span>
                      <span>{{ formatAssignmentDate(assignment.createdAt) }}</span>
                    </div>
                  </div>
                  <div v-else class="text-xs text-gray-500 italic">
                    No assignment history available
                  </div>
                </div>
              </div>
            </div>

            <!-- Follow-up Information -->
            <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex items-center gap-2 mb-4">
                <div class="bg-gradient-to-r from-orange-100 to-amber-100 rounded-lg p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 class="text-base font-bold text-gray-900">Follow-up Information</h3>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-xs text-gray-500">Follow-up Date</p>
                  <input v-if="editMode" type="date" v-model="editedTicket.followupDate"
                         class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm" />
                  <p v-else class="text-sm text-gray-900">{{ selectedTicketDetails?.followupDate || 'Not set' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Follow-up Status</p>
                  <select v-if="editMode" v-model="editedTicket.followupStatus"
                          class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm">
                    <option value="pending">Pending</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <p v-else class="text-sm text-gray-900">{{ selectedTicketDetails?.followupStatus || 'Pending' }}</p>
                </div>
              </div>
            </div>

            <!-- Update Ticket Status -->
            <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex items-center gap-2 mb-4">
                <div class="bg-gradient-to-r from-violet-100 to-purple-100 rounded-lg p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 class="text-base font-bold text-gray-900">Update Ticket Status</h3>
              </div>
              <div class="space-y-3">
                <p class="text-xs text-gray-600">Change the status across all related tables</p>
                <select
                  v-model="sidebarSelectedStatus"
                  @change="updateTicketStatusFromSidebar"
                  class="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select Status</option>
                  <option value="created">Created</option>
                  <option value="assigned">Assigned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <div v-if="selectedTicketDetails.status" class="mt-2">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getStatusBadgeClass(selectedTicketDetails.status)">
                    Current: {{ selectedTicketDetails.status }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Related Calls & Recordings -->
            <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex items-center gap-2 mb-4">
                <div class="bg-gradient-to-r from-indigo-100 to-blue-100 rounded-lg p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 class="text-base font-bold text-gray-900">Related Calls & Recordings</h3>
              </div>
              <div class="space-y-2">
                <template v-if="relatedCalls && relatedCalls.length > 0">
                  <div v-for="call in relatedCalls" :key="call.id" class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div class="flex items-center gap-3">
                      <svg class="w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <div>
                        <p class="text-sm font-medium">Call #{{ call.callId || call.id }}</p>
                        <p class="text-xs text-gray-500">
                          {{ formatCallDuration(call.startTime, call.endTime) }} | {{ formatCallTime(call.startTime) }}
                        </p>
                      </div>
                    </div>
                    <button v-if="call.recordingUrl" @click="playRecording(call.recordingUrl)" class="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                      Play Recording
                    </button>
                    <span v-else class="px-2 py-1 text-xs text-gray-400">
                      No Recording
                    </span>
                  </div>
                </template>
                <div v-if="!relatedCalls || relatedCalls.length === 0" class="text-center py-4 text-gray-500">
                  <p class="text-sm">No calls connected</p>
                </div>
              </div>
            </div>

            <!-- Internal Notes -->
            <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <div class="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 class="text-base font-bold text-gray-900">Internal Notes</h3>
                </div>
                <button @click="showAddNote = true" class="text-xs text-blue-600 hover:text-blue-700">+ Add Note</button>
              </div>
              <div v-if="showAddNote" class="mb-3">
                <textarea v-model="newNote" rows="3" placeholder="Enter your note..."
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"></textarea>
                <div class="flex gap-2 mt-2">
                  <button @click="addInternalNote" class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                    Add Note
                  </button>
                  <button @click="showAddNote = false; newNote = ''" class="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400">
                    Cancel
                  </button>
                </div>
              </div>
              <div class="space-y-2">
                <div v-for="note in internalNotes" :key="note.id" class="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div class="flex justify-between items-start">
                    <div>
                      <p class="text-sm text-gray-900">{{ note.text }}</p>
                      <p class="text-xs text-gray-500 mt-1">By {{ note.author }} - {{ note.timestamp }}</p>
                    </div>
                  </div>
                </div>
                <div v-if="!internalNotes || internalNotes.length === 0" class="text-center py-4 text-gray-500">
                  <p class="text-sm">No notes added yet</p>
                </div>
              </div>
            </div>

            <!-- Customer Feedback & Comments -->
            <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex items-center gap-2 mb-4">
                <div class="bg-gradient-to-r from-rose-100 to-pink-100 rounded-lg p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <h3 class="text-base font-bold text-gray-900">Customer Feedback</h3>
              </div>

              <!-- Empty state when there is no feedback -->
              <div v-if="!selectedTicketDetails || !selectedTicketDetails.feedback || selectedTicketDetails.feedback.length === 0" class="text-sm text-gray-500">
                No customer feedback submitted yet.
              </div>

              <!-- Feedback list -->
              <div v-else class="space-y-3">
                <div
                  v-for="item in selectedTicketDetails.feedback"
                  :key="item.id || item.createdAt"
                  class="border border-gray-200 rounded-lg p-3 bg-white"
                >
                  <!-- Feedback Status Badge -->
                  <div class="flex items-center justify-between mb-2">
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      :class="item.deliveryStatus === 'received' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
                    >
                      {{ item.deliveryStatus === 'received' ? 'Feedback Received' : 'Pending' }}
                    </span>
                    <span class="text-xs text-gray-400">{{ item.feedbackId }}</span>
                  </div>

                  <!-- Rating - only show if received -->
                  <div v-if="item.deliveryStatus === 'received' && item.rating" class="mb-2">
                    <div class="flex items-center gap-3">
                      <p class="text-xs text-gray-500">Rating:</p>
                      <div class="flex gap-1">
                        <span
                          v-for="i in 5"
                          :key="i"
                          class="text-lg"
                          :class="i <= (item.rating || 0) ? 'text-yellow-500' : 'text-gray-300'"
                        >
                          ★
                        </span>
                      </div>
                      <span class="text-sm font-semibold text-gray-700">{{ item.rating }}/5</span>
                    </div>
                  </div>

                  <!-- Comment - only show if received -->
                  <div v-if="item.deliveryStatus === 'received'">
                    <p class="text-xs text-gray-500 mb-1">Customer Comment:</p>
                    <p class="text-sm text-gray-700 italic bg-gray-50 rounded p-2">
                      {{ item.feedbackComment || 'No comment provided' }}
                    </p>
                  </div>

                  <!-- Pending message -->
                  <div v-else class="text-sm text-gray-500 italic">
                    Waiting for customer to submit feedback
                  </div>

                  <!-- Timestamp -->
                  <div class="mt-2 text-xs text-gray-400">
                    <span v-if="item.deliveryStatus === 'received'">
                      Received: {{ formatDate(item.updatedAt || item.collectedTimestamp) }}
                    </span>
                    <span v-else>
                      Sent: {{ formatDate(item.createdAt) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Ticket Status Modal -->
            <div v-if="showStatusModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div class="bg-white rounded-lg shadow-xl p-4 w-full max-w-sm">
                <h3 class="text-sm font-semibold mb-3">Ticket Lifecycle & Status</h3>
                <div class="space-y-2 mb-4 max-h-64 overflow-y-auto">
                  <label
                    v-for="status in ticketStatusOptions"
                    :key="status"
                    class="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <input
                      type="radio"
                      :value="status"
                      v-model="newStatus"
                      class="text-purple-600"
                    />
                    <span>{{ status }}</span>
                  </label>
                </div>
                <div class="flex justify-end gap-2">
                  <button class="px-3 py-1.5 text-sm border rounded" @click="showStatusModal = false">
                    Cancel
                  </button>
                  <button class="px-3 py-1.5 text-sm bg-purple-600 text-white rounded" @click="changeTicketStatus">
                    Update Status
                  </button>
                </div>
              </div>
            </div>

            <!-- Feedback Link Modal -->
            <div v-if="showFeedbackLinkModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold text-gray-900">Customer Feedback Link Generated</h3>
                  <button @click="showFeedbackLinkModal = false" class="text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>

                <div class="mb-4">
                  <p class="text-sm text-gray-600 mb-3">Share this link with the customer to collect their feedback:</p>
                  <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p class="text-sm font-mono text-gray-800 break-all">{{ feedbackLink }}</p>
                  </div>
                </div>

                <div class="flex gap-3">
                  <button
                    @click="copyFeedbackLink"
                    class="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg v-if="!feedbackLinkCopied" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>{{ feedbackLinkCopied ? 'Copied!' : 'Copy Link' }}</span>
                  </button>
                  <button
                    @click="openFeedbackLink"
                    class="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    <span>Open in New Tab</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Feedback Details Modal -->
            <div v-if="showFeedbackDetailsModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold text-gray-900">Customer Feedback Details</h3>
                  <button @click="showFeedbackDetailsModal = false" class="text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>

                <div v-if="loadingFeedbackDetails" class="text-center py-8">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p class="text-sm text-gray-500 mt-2">Loading feedback...</p>
                </div>

                <div v-else-if="feedbackDetailsError" class="text-center py-8">
                  <p class="text-sm text-red-600">{{ feedbackDetailsError }}</p>
                </div>

                <div v-else-if="feedbackDetails" class="space-y-4">
                  <!-- Ticket Information -->
                  <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 class="text-sm font-semibold text-gray-700 mb-2">Ticket Information</h4>
                    <div class="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span class="text-gray-500">Ticket ID:</span>
                        <span class="ml-2 font-medium text-gray-900">{{ feedbackDetails.ticketId }}</span>
                      </div>
                      <div>
                        <span class="text-gray-500">Type:</span>
                        <span class="ml-2 font-medium text-gray-900">{{ feedbackDetails.ticketType }}</span>
                      </div>
                      <div>
                        <span class="text-gray-500">Product:</span>
                        <span class="ml-2 font-medium text-gray-900">{{ feedbackDetails.productName || 'N/A' }}</span>
                      </div>
                      <div>
                        <span class="text-gray-500">Agent:</span>
                        <span class="ml-2 font-medium text-gray-900">{{ feedbackDetails.agentName || 'N/A' }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Rating -->
                  <div>
                    <label class="text-sm font-semibold text-gray-700 block mb-2">Customer Rating</label>
                    <div class="flex items-center gap-1">
                      <svg v-for="star in 5" :key="star"
                           xmlns="http://www.w3.org/2000/svg"
                           width="24"
                           height="24"
                           viewBox="0 0 24 24"
                           :fill="star <= (feedbackDetails.rating || 0) ? '#FBBF24' : 'none'"
                           :stroke="star <= (feedbackDetails.rating || 0) ? '#FBBF24' : '#D1D5DB'"
                           stroke-width="2"
                           stroke-linecap="round"
                           stroke-linejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                      <span class="ml-2 text-lg font-semibold text-gray-900">{{ feedbackDetails.rating || 0 }}/5</span>
                    </div>
                  </div>

                  <!-- Comments -->
                  <div>
                    <label class="text-sm font-semibold text-gray-700 block mb-2">Customer Comments</label>
                    <div class="bg-gray-50 rounded-lg p-3 border border-gray-200 min-h-[100px]">
                      <p class="text-sm text-gray-800 whitespace-pre-wrap">{{ feedbackDetails.feedbackComment || 'No comments provided' }}</p>
                    </div>
                  </div>

                  <!-- Timestamp -->
                  <div class="border-t pt-3">
                    <div class="flex items-center justify-between text-xs text-gray-500">
                      <span>Feedback ID: {{ feedbackDetails.feedbackId }}</span>
                      <span>Received: {{ formatDate(feedbackDetails.updatedAt || feedbackDetails.collectedTimestamp) }}</span>
                    </div>
                  </div>
                </div>

                <div class="mt-6 flex justify-end">
                  <button
                    @click="showFeedbackDetailsModal = false"
                    class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
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
                <h3 class="text-base font-bold text-gray-900">Activity History</h3>
              </div>

              <!-- Loading State -->
              <div v-if="loadingActivityLogs" class="text-center py-6">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p class="text-xs text-gray-500 mt-2">Loading...</p>
              </div>

              <!-- Activity Logs from Database -->
              <div v-else-if="activityLogs.length > 0" class="space-y-4 max-h-96 overflow-y-auto">
                <div v-for="log in activityLogs" :key="log.id" class="flex gap-3 relative">
                  <div class="flex flex-col items-center flex-shrink-0">
                    <div class="w-3 h-3 bg-blue-500 rounded-full shadow-sm ring-4 ring-blue-100"></div>
                    <div class="w-0.5 h-full bg-gray-200 mt-1"></div>
                  </div>
                  <div class="flex-1 pb-4">
                    <p class="text-sm text-gray-900">{{ log.description }}</p>
                    <!-- Additional Details -->
                    <div v-if="log.agentName || log.previousStatus || log.callId" class="mt-1 space-y-0.5">
                      <p v-if="log.agentName" class="text-xs text-gray-600">Agent: {{ log.agentName }}</p>
                      <p v-if="log.previousStatus && log.currentStatus" class="text-xs text-gray-600">
                        Status: {{ log.previousStatus }} → {{ log.currentStatus }}
                      </p>
                      <p v-if="log.callId" class="text-xs text-gray-600">Call ID: {{ log.callId }}</p>
                      <p v-if="log.callStatus" class="text-xs text-gray-600">Call Status: {{ log.callStatus }}</p>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">
                      {{ formatDate(log.statusUpdatedAt || log.createdAt) }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Fallback: Show from Tickets/Calls Table -->
              <div v-else class="space-y-4">
                <!-- Ticket Created -->
                <div v-if="selectedTicketDetails?.createdDate" class="flex gap-3 relative">
                  <div class="flex flex-col items-center flex-shrink-0">
                    <div class="w-3 h-3 bg-blue-500 rounded-full shadow-sm ring-4 ring-blue-100"></div>
                    <div class="w-0.5 h-full bg-gray-200 mt-1"></div>
                  </div>
                  <div class="flex-1 pb-4">
                    <p class="text-sm text-gray-900">Ticket created</p>
                    <p class="text-xs text-gray-500">{{ formatDate(selectedTicketDetails?.createdDate) }}</p>
                  </div>
                </div>

                <!-- Assigned to Agent -->
                <div v-if="selectedTicketDetails?.agentName" class="flex gap-3 relative">
                  <div class="flex flex-col items-center flex-shrink-0">
                    <div class="w-3 h-3 bg-green-500 rounded-full shadow-sm ring-4 ring-green-100"></div>
                    <div class="w-0.5 h-full bg-gray-200 mt-1"></div>
                  </div>
                  <div class="flex-1 pb-4">
                    <p class="text-sm text-gray-900">Assigned to {{ selectedTicketDetails?.agentName }}</p>
                    <p class="text-xs text-gray-500">{{ selectedTicketDetails?.assignedDate ? formatDate(selectedTicketDetails.assignedDate) : 'Assignment date not available' }}</p>
                  </div>
                </div>

                <!-- Status Changed -->
                <div v-if="selectedTicketDetails?.status" class="flex gap-3 relative">
                  <div class="flex flex-col items-center flex-shrink-0">
                    <div class="w-3 h-3 bg-yellow-500 rounded-full shadow-sm ring-4 ring-yellow-100"></div>
                    <div class="w-0.5 h-full bg-gray-200 mt-1"></div>
                  </div>
                  <div class="flex-1 pb-4">
                    <p class="text-sm text-gray-900">Status changed to {{ selectedTicketDetails?.status }}</p>
                    <p class="text-xs text-gray-500">{{ selectedTicketDetails?.statusUpdatedAt ? formatDate(selectedTicketDetails.statusUpdatedAt) : formatDate(selectedTicketDetails?.createdDate) }}</p>
                  </div>
                </div>

                <!-- Call Started (from calls table) -->
                <div v-if="relatedCalls && relatedCalls.length > 0 && relatedCalls[0].startTime" class="flex gap-3 relative">
                  <div class="flex flex-col items-center flex-shrink-0">
                    <div class="w-3 h-3 bg-purple-500 rounded-full shadow-sm ring-4 ring-purple-100"></div>
                    <div class="w-0.5 h-full bg-gray-200 mt-1"></div>
                  </div>
                  <div class="flex-1 pb-4">
                    <p class="text-sm text-gray-900">Call started</p>
                    <p class="text-xs text-gray-600">Call ID: {{ relatedCalls[0].callId }}</p>
                    <p class="text-xs text-gray-500">{{ formatDate(relatedCalls[0].startTime) }}</p>
                  </div>
                </div>

                <!-- Call Ended (from calls table) -->
                <div v-if="relatedCalls && relatedCalls.length > 0 && relatedCalls[0].endTime" class="flex gap-3 relative">
                  <div class="flex flex-col items-center flex-shrink-0">
                    <div class="w-3 h-3 bg-purple-500 rounded-full shadow-sm ring-4 ring-purple-100"></div>
                    <div class="w-0.5 h-full bg-gray-200 mt-1"></div>
                  </div>
                  <div class="flex-1 pb-4">
                    <p class="text-sm text-gray-900">Call ended</p>
                    <p class="text-xs text-gray-600">Call ID: {{ relatedCalls[0].callId }}</p>
                    <p class="text-xs text-gray-500">{{ formatDate(relatedCalls[0].endTime) }}</p>
                  </div>
                </div>

                <!-- Ticket Resolved -->
                <div v-if="selectedTicketDetails?.resolvedDate || selectedTicketDetails?.resolvedOn" class="flex gap-3 relative">
                  <div class="flex flex-col items-center flex-shrink-0">
                    <div class="w-3 h-3 bg-green-600 rounded-full shadow-sm ring-4 ring-green-100"></div>
                    <div class="w-0.5 h-full bg-gray-200 mt-1"></div>
                  </div>
                  <div class="flex-1 pb-4">
                    <p class="text-sm text-gray-900">Ticket resolved</p>
                    <p class="text-xs text-gray-500">{{ formatDate(selectedTicketDetails?.resolvedDate || selectedTicketDetails?.resolvedOn) }}</p>
                  </div>
                </div>

                <!-- No Data Message -->
                <div v-if="!selectedTicketDetails?.createdDate" class="text-center py-6">
                  <p class="text-sm text-gray-500">No activity history available</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Create Ticket Modal -->
    <div v-if="showCreateTicketModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-900">Create New Ticket</h3>
          <button
            @click="closeCreateTicketModal"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Modal Content -->
        <div class="p-6">
          <form @submit.prevent="submitCreateTicket" class="space-y-4">
            <!-- Reference Ticket Display -->
            <div v-if="selectedActionsTicket" class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-semibold text-blue-900 text-sm">Reference Ticket</h4>
                  <p class="text-blue-700 text-sm mt-1">Ticket ID: <span class="font-mono font-bold">{{ selectedActionsTicket.ticketId }}</span></p>
                </div>
                <svg class="w-8 h-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>

            
          <!-- Call Data Display (if available) -->
            <div v-if="selectedCallData" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 class="font-semibold text-blue-900 text-sm mb-4 flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Data Information
              </h4>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Call ID -->
                <div class="bg-white border border-gray-300 rounded-lg p-3">
                  <h5 class="font-medium text-gray-800 text-xs mb-2 uppercase tracking-wide">Call ID</h5>
                  <p class="text-lg font-bold text-blue-600">{{ selectedCallData.callId || 'N/A' }}</p>
                </div>

                <!-- Agent ID -->
                <div class="bg-white border border-gray-300 rounded-lg p-3">
                  <h5 class="font-medium text-gray-800 text-xs mb-2 uppercase tracking-wide">Agent ID</h5>
                  <p class="text-lg font-bold text-green-600">{{ selectedCallData.agentId || 'N/A' }}</p>
                </div>

                <!-- Product ID -->
                <div class="bg-white border border-gray-300 rounded-lg p-3">
                  <h5 class="font-medium text-gray-800 text-xs mb-2 uppercase tracking-wide">Product ID</h5>
                  <p class="text-lg font-bold text-purple-600">{{ selectedCallData.productId || 'N/A' }}</p>
                </div>
              </div>

              <!-- Customer Information Section -->
              <div class="mt-4 bg-white border border-gray-300 rounded-lg p-3">
                <h5 class="font-medium text-gray-800 text-xs mb-2 uppercase tracking-wide">Customer Information</h5>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span class="text-xs text-gray-600">Name:</span>
                    <p class="text-sm font-medium text-gray-900">{{ selectedTicketForModal?.customerName || 'N/A' }}</p>
                  </div>
                  <div>
                    <span class="text-xs text-gray-600">Phone:</span>
                    <p class="text-sm font-medium text-gray-900">{{ selectedCallData.userPhone || selectedCallData.phone || 'N/A' }}</p>
                  </div>
                  <div>
                    <span class="text-xs text-gray-600">Email:</span>
                    <p class="text-sm font-medium text-gray-900">{{ selectedTicketForModal?.customerEmail || selectedTicketForModal?.customerContact || 'N/A' }}</p>
                  </div>
                </div>
              </div>

              <div class="mt-3 text-xs text-blue-700">
                ✅ Call entry will be created and linked to call {{ selectedCallData.callId }}
              </div>
            </div>

            <!-- Product Selection -->
            <div>
              <label for="create-product" class="block text-sm font-medium text-gray-700 mb-1">
                Product <span class="text-red-500">*</span>
              </label>
              <select
                id="create-product"
                v-model="createTicketForm.productId"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Product</option>
                <option v-for="product in allProducts" :key="product.productId" :value="product.productId">
                  {{ product.name || product.productName || 'Product ' + product.productId }}
                </option>
              </select>
            </div>

            <!-- Subject -->
            <div>
              <label for="create-subject" class="block text-sm font-medium text-gray-700 mb-1">
                Subject <span class="text-red-500">*</span>
              </label>
              <input
                id="create-subject"
                v-model="createTicketForm.subject"
                type="text"
                required
                placeholder="Enter ticket subject"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Description -->
            <div>
              <label for="create-description" class="block text-sm font-medium text-gray-700 mb-1">
                Description <span class="text-red-500">*</span>
              </label>
              <textarea
                id="create-description"
                v-model="createTicketForm.description"
                required
                rows="4"
                placeholder="Describe the issue or request..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Email -->
            <div>
              <label for="create-email" class="block text-sm font-medium text-gray-700 mb-1">
                Email (Optional)
              </label>
              <input
                id="create-email"
                v-model="createTicketForm.customerEmail"
                type="email"
                placeholder="customer@example.com"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                @click="closeCreateTicketModal"
                class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isCreatingTicket"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="!isCreatingTicket">Create Ticket</span>
                <span v-else>Creating...</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DateRangePicker from '~/components/DateRangePicker.vue'

export default {
  name: 'TicketsPage',

  components: {
    DateRangePicker
  },

  data() {
    return {
      // Refs
      filterDropdownRef: null,
      displayDropdownRef: null,
      sortDropdownRef: null,

      // Loading state
      loading: false,
      error: null,

      // Filters
      searchQuery: '',
      showFilterDropdown: false,
      showDisplayDropdown: false,
      showSortDropdown: false,

      // Sort options
      sortBy: 'ticketId',
      sortOrder: 'asc',
      sortOptions: [
        { value: 'ticketId', label: 'Ticket ID' },
        { value: 'customerName', label: 'Customer Name' },
        { value: 'agentName', label: 'Agent Name' },
        { value: 'productName', label: 'Product Name' },
        { value: 'status', label: 'Status' },
        { value: 'priority', label: 'Priority' },
        { value: 'createdDate', label: 'Created Date' },
        { value: 'resolvedDate', label: 'Resolved Date' },
        { value: 'csatRating', label: 'CSAT Rating' }
      ],

      // Filter options
      statusOptions: [
        { value: 'created', label: 'Unresolved' },
        { value: 'assigned', label: 'Assigned' },
        { value: 'in-progress', label: 'In Progress' },
        { value: 'pending', label: 'Pending' },
        { value: 'resolved', label: 'Resolved' },
        { value: 'closed', label: 'Closed' }
      ],

      agentOptions: [],
      productOptions: [],
      csatRatingOptions: [
        { value: '5', label: '5 - Excellent' },
        { value: '4', label: '4 - Good' },
        { value: '3', label: '3 - Average' },
        { value: '2', label: '2 - Poor' },
        { value: '1', label: '1 - Very Poor' }
      ],

      // Active filters state
      activeFilters: {
        status: [],
        agents: [],
        products: [],
        fcr: [],
        csatRating: [],
        dateRange: {
          createdFrom: null,
          createdTo: null,
          resolvedFrom: null,
          resolvedTo: null
        }
      },

      // Expanded sections state
      expandedSections: {
        status: false,
        agent: false,
        product: false,
        fcr: false,
        csat: false,
        dateRange: false
      },

      // Call modal state
      showCallModal: false,
      selectedTicket: null,
      callStatus: 'pending',
      assignedAgent: null,
      uploadedRecording: null, // Store uploaded recording file

      // Actions menu state
      showActionsMenu: false,
      selectedActionsTicket: null,

      // Create Ticket Modal
      showCreateTicketModal: false,
      isCreatingTicket: false,
      createTicketForm: {
        productId: '',
        subject: '',
        description: '',
        customerEmail: ''
      },

      // Call data for create ticket modal
      selectedCallData: null,
      selectedTicketForModal: null,

      // Compact column options
      columnOptions: [
        { key: 'serialId', label: 'ID' },
        { key: 'ticketId', label: 'Ticket ID' },
        { key: 'freshdeskId', label: 'Freshdesk ID' },
        { key: 'callId', label: 'Call ID' },
        { key: 'customer', label: 'Customer' },
        { key: 'phone', label: 'Phone' },
        { key: 'agent', label: 'Agent' },
        { key: 'product', label: 'Product' },
        { key: 'mergeId', label: 'Merge ID' },
        { key: 'communicationWay', label: 'Way of Communication' },
        { key: 'type', label: 'Type' },
        { key: 'status', label: 'Status' },
        { key: 'created', label: 'Created' },
        { key: 'resolved', label: 'Resolved' },
        { key: 'csat', label: 'CSAT' },
        { key: 'fcr', label: 'FCR' },
        { key: 'notes', label: 'Notes' },
        { key: 'feedback', label: 'Feedback' },
        { key: 'actions', label: 'Actions' }
      ],

      // Visible columns state
      visibleColumns: {},

      // Pagination
      currentPage: 1,
      itemsPerPage: 10,

      // Data from backend
      tickets: [],
      allAgents: [],
      allProducts: [],

      // Ticket Details Side Panel
      showTicketDetails: false,
      selectedTicketDetails: null,
      editMode: false,
      editedTicket: {},
      showAddNote: false,
      newNote: '',
      internalNotes: [],
      activityHistory: [],
      availableAgentsForTicket: [],
      changingAgent: false,
      relatedCalls: [],
      assignmentHistory: [],

      // Status modal state
      showStatusModal: false,
      newStatus: null,
      ticketStatusOptions: [
        'created',
        'assigned',
        'in-progress',
        'pending',
        'resolved',
        'closed'
      ],

      // Feedback modal state
      showFeedbackLinkModal: false,
      feedbackLink: '',
      feedbackLinkCopied: false,

      // Feedback details modal
      showFeedbackDetailsModal: false,
      feedbackDetails: null,
      loadingFeedbackDetails: false,
      feedbackDetailsError: null,

      // Sidebar status update
      sidebarSelectedStatus: '',

      // Activity History
      activityLogs: [],
      loadingActivityLogs: false
    }
  },

  async created() {
    // Initialize visible columns
    this.visibleColumns = Object.fromEntries(this.columnOptions.map(col => [col.key, true]))

    // Fetch data from backend
    await this.fetchTickets()
    await this.fetchProducts()
    await this.fetchAgents()
  },

  async mounted() {
    // Add click event listener
    document.addEventListener('click', this.handleClickOutside);

    // Check if ticketId is in query params (from call page navigation)
    const ticketIdFromQuery = this.$route.query.ticketId;
    if (ticketIdFromQuery) {
      // Fetch tickets first
      await this.fetchTickets();

      // Find the ticket with matching ticketId
      const ticket = this.tickets.find(t => t.ticketId === ticketIdFromQuery || t.id === parseInt(ticketIdFromQuery));

      // Open ticket details if found
      if (ticket) {
        this.openTicketDetails(ticket);
      }
    }
  },

  beforeDestroy() {
    // Clean up event listener
    document.removeEventListener('click', this.handleClickOutside);
  },

  methods: {
    // Fetch tickets from backend
    async fetchTickets() {
      this.loading = true
      this.error = null
      try {
        // Fetch all tickets; frontend filters will handle status
        const response = await $fetch('http://localhost:5001/tickets?limit=1000')
        if (response.data) {
          console.log('Raw ticket data sample:', response.data[0]); // Debug to see actual structure
          if (response.data[0]) {
            console.log('Agent-related fields in ticket:', {
              agentId: response.data[0].agentId,
              agent_id: response.data[0].agent_id,
              assignedAgentId: response.data[0].assignedAgentId,
              agentName: response.data[0].agentName,
              assignedAgentName: response.data[0].assignedAgentName
            });
          }
          this.tickets = response.data.map(ticket => {
            // Debug: Log status from backend
            if (ticket.ticketId === 1 || ticket.id === 1) {
              console.log('Ticket 1 status from backend:', ticket.status)
            }
            return {
              id: ticket.id,  // Numeric ID for backend operations
              ticketId: ticket.ticketId,  // Formatted ID for display
              customerName: ticket.customerName || '-',
              customerContact: ticket.customerEmail || '-',
              phone: ticket.customerPhone || '-',
              subject: ticket.subject || null,
              description: ticket.description || null,
              priority: ticket.priority || 'medium',
              agentName: ticket.assignedAgentName || ticket.agentName || '-',
              agentId: ticket.agentId || ticket.agent_id || ticket.assignedAgentId || this.extractAgentIdFromName(ticket.agentName || ticket.assignedAgentName),
              productCategory: ticket.productName || 'No Product',
              productId: ticket.productId || ticket.product_id || null,
              type: ticket.ticketType || '-',
              status: ticket.status || 'assigned',
              createdDate: ticket.createdAt || ticket.created_at || new Date().toISOString(),
              assignedDate: ticket.assignedAt || ticket.assigned_at || ticket.assignedDate || null,
              statusUpdatedAt: ticket.statusUpdatedAt || ticket.status_updated_at || ticket.updatedAt || ticket.updated_at || null,
              resolvedDate: ticket.resolvedOn || ticket.resolvedAt || ticket.resolved_at || null,
              csatRating: ticket.feedbackRating || ticket.csatRating || ticket.csat_rating || null,
              firstCallResolution: ticket.fcr === 1 || ticket.first_call_resolution === 1 ? true : (ticket.fcr === 0 || ticket.first_call_resolution === 0 ? false : null),
              notes: ticket.notes || null,
              importAction: ticket.importAction || null,
              feedbackStatus: ticket.feedbackStatus || null,
              feedbackRating: ticket.feedbackRating || null,
              feedbackComment: ticket.feedbackComment || null,
              followupDate: ticket.followupDate || ticket.followup_date || null,
              followupStatus: ticket.followupStatus || ticket.followup_status || null,
              freshdeskId: ticket.freshdeskId || null,
              callId: ticket.callId || null,
              wayOfCommunication: ticket.wayOfCommunication || null,
              dataSource: ticket.dataSource || 'ticket', // Track if data is from ticket or call
              feedbackLink: null,
              feedbackLinkCopied: false
            }
          })
        }
      } catch (error) {
        console.error('Error fetching tickets:', error)
        this.error = 'Failed to load tickets'
        this.tickets = []
      } finally {
        this.loading = false
      }
    },

    // Fetch products from backend
    async fetchProducts() {
      try {
        const response = await $fetch('http://localhost:5001/products')
        if (response.data) {
          this.allProducts = response.data
          this.productOptions = response.data.map(p => p.name || p.productName || p.title)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
        this.productOptions = []
      }
    },

    // Get latest note preview for table display (text only, truncated)
    getLatestNotePreview(notes) {
      if (!notes) return '-'

      // Split by timestamp separator to get all notes
      const notesParts = notes.split(/\n\n--- (.*?) ---\n/)

      // Get the last note (most recent)
      let latestNote = ''
      if (notesParts.length === 1) {
        // Single note without timestamp
        latestNote = notes
      } else if (notesParts.length > 1) {
        // Get the last note text (after the last timestamp)
        latestNote = notesParts[notesParts.length - 1]?.trim() || notesParts[0]?.trim() || ''
      }

      // Truncate if longer than 50 characters and add "..."
      if (latestNote.length > 50) {
        return latestNote.substring(0, 50) + '...'
      }

      return latestNote || '-'
    },

    // Fetch all agents
    async fetchAgents() {
      try {
        // We'll need to fetch agents from all products since there's no "all agents" endpoint
        // For now, we'll extract unique agent names from tickets
        const uniqueAgents = [...new Set(this.tickets.map(t => t.agentName).filter(a => a && a !== '-'))]
        this.agentOptions = uniqueAgents
      } catch (error) {
        console.error('Error fetching agents:', error)
        this.agentOptions = []
      }
    },

    // Toggle filter dropdown
    toggleFilterDropdown() {
      this.showFilterDropdown = !this.showFilterDropdown
    },

    // Toggle filter section
    toggleFilterSection(section) {
      this.expandedSections[section] = !this.expandedSections[section]
    },

    // Close filter dropdown
    closeFilterDropdown() {
      this.showFilterDropdown = false
    },


    // Toggle display dropdown
    toggleDisplayDropdown() {
      this.showDisplayDropdown = !this.showDisplayDropdown
    },

    // Toggle sort dropdown
    toggleSortDropdown() {
      this.showSortDropdown = !this.showSortDropdown
    },

    // Set sort by field
    setSortBy(field) {
      this.sortBy = field
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

    // Remove individual filter
    removeFilter(chipKey) {
      const [type, value] = chipKey.split('-')

      switch(type) {
        case 'status':
          const statusIndex = this.activeFilters.status.indexOf(value)
          if (statusIndex > -1) this.activeFilters.status.splice(statusIndex, 1)
          break
        case 'agent':
          const agentIndex = this.activeFilters.agents.findIndex(a => a.includes(value))
          if (agentIndex > -1) this.activeFilters.agents.splice(agentIndex, 1)
          break
        case 'product':
          const productIndex = this.activeFilters.products.findIndex(p => p.includes(value))
          if (productIndex > -1) this.activeFilters.products.splice(productIndex, 1)
          break
        case 'fcr':
          const fcrIndex = this.activeFilters.fcr.indexOf(value)
          if (fcrIndex > -1) this.activeFilters.fcr.splice(fcrIndex, 1)
          break
        case 'csat':
          const csatIndex = this.activeFilters.csatRating.indexOf(value)
          if (csatIndex > -1) this.activeFilters.csatRating.splice(csatIndex, 1)
          break
        case 'dateRange':
          if (value === 'created') {
            this.activeFilters.dateRange.createdFrom = null
            this.activeFilters.dateRange.createdTo = null
          } else if (value === 'resolved') {
            this.activeFilters.dateRange.resolvedFrom = null
            this.activeFilters.dateRange.resolvedTo = null
          }
          break
      }
    },

    // Clear all filters
    clearFilters() {
      this.activeFilters = {
        status: [],
        agents: [],
        products: [],
        fcr: [],
        csatRating: [],
        dateRange: {
          createdFrom: null,
          createdTo: null,
          resolvedFrom: null,
          resolvedTo: null
        }
      }
    },

    // Close dropdown when clicking outside
    handleClickOutside(event) {
      // Get the clicked element
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

      // Close actions menu if clicking outside
      if (this.showActionsMenu) {
        this.closeActionsMenu();
      }
    },

    // Actions menu methods
    toggleActionsMenu(ticket) {
      this.selectedActionsTicket = ticket;
      this.showActionsMenu = true;
    },

    closeActionsMenu() {
      this.showActionsMenu = false;
      this.selectedActionsTicket = null;
    },

    async handleCreateTicket() {
      // Store the selected ticket data before closing menu
      const currentTicket = this.selectedActionsTicket;

      this.closeActionsMenu();
      // Reset form
      this.createTicketForm = {
        productId: '',
        subject: '',
        description: '',
        customerEmail: ''
      };

      // Reset call data
      this.selectedCallData = null;

      // Store the ticket data for display in modal
      this.selectedTicketForModal = currentTicket;

      // Check if selected ticket has a callId and fetch call data
      if (currentTicket && currentTicket.callId) {
        await this.fetchCallData(currentTicket.callId);
      }

      // Open create ticket modal
      this.showCreateTicketModal = true;
    },

    closeCreateTicketModal() {
      this.showCreateTicketModal = false;
      this.createTicketForm = {
        productId: '',
        subject: '',
        description: '',
        customerEmail: ''
      };
      this.selectedCallData = null;
    },

    // Fetch call data by callId
    async fetchCallData(callId) {
      try {
        const response = await fetch(`http://localhost:5001/calls/details/${callId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const result = await response.json();
          this.selectedCallData = result.data;

          // Pre-fill form with call data
          if (this.selectedCallData) {
            this.createTicketForm.productId = this.selectedCallData.productId || '';

            // Fetch customer data from callback table using phone number
            const phone = this.selectedCallData.userPhone || this.selectedCallData.phone;
            if (phone) {
              await this.fetchCustomerDataFromCallback(phone);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching call data:', error);
      }
    },

    // Fetch customer data from callback table using phone number
    async fetchCustomerDataFromCallback(phone) {
      try {
        const response = await fetch(`http://localhost:5001/callbacks`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const result = await response.json();
          const callbacks = result.data || result;

          // Find callback with matching phone number
          const matchingCallback = callbacks.find(cb =>
            cb.phone === phone || cb.phone.includes(phone) || phone.includes(cb.phone)
          );

          if (matchingCallback) {
            // Add customer data to selectedCallData
            this.selectedCallData.customerName = this.selectedCallData.customerName || matchingCallback.name;
            this.selectedCallData.customerEmail = this.selectedCallData.customerEmail || matchingCallback.email;
            this.selectedCallData.customerPhone = matchingCallback.phone;
          }
        }
      } catch (error) {
        console.error('Error fetching customer data from callback:', error);
      }
    },

    async submitCreateTicket() {
      this.isCreatingTicket = true;
      try {
        // Step 1: Create the ticket in tickets table
        const ticketData = {
          productId: this.createTicketForm.productId,
          subject: this.createTicketForm.subject,
          description: this.createTicketForm.description,
          status: 'assigned', // Status should be 'assigned'
          ticketType: 'call' // Ticket type should be 'call'
        };

        // Add customer data if available from call data
        if (this.selectedCallData && this.selectedCallData.callId) {
          // Get name from the ticket row (already displayed in customer column)
          ticketData.name = this.selectedTicketForModal?.customerName || 'Unknown Customer';

          // Get phone from call data
          ticketData.phone = this.selectedCallData.userPhone || this.selectedCallData.phone || '';

          // Get email from ticket row first (customerContact might contain email), then form input
          ticketData.email =
            this.selectedTicketForModal?.customerEmail ||
            this.selectedTicketForModal?.customerContact ||
            this.selectedCallData.customerEmail ||
            this.selectedCallData.email ||
            this.createTicketForm.customerEmail || '';

          ticketData.callId = this.selectedCallData.callId; // Link to call
          ticketData.agentId = this.selectedCallData.agentId; // Add agentId for assign-ticket table

          console.log('Ticket data being sent (3 tables):', {
            name: ticketData.name,
            phone: ticketData.phone,
            email: ticketData.email,
            callId: ticketData.callId,
            agentId: ticketData.agentId,
            status: ticketData.status,
            ticketType: ticketData.ticketType
          });
        }

        // Create ticket first
        const ticketResponse = await $fetch('http://localhost:5001/new-tickets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: ticketData
        });

        if (ticketResponse.success) {
          let ticketId = ticketResponse.ticketId || ticketResponse.data?.ticketId;
          console.log('✅ Ticket created successfully with ID:', ticketId);
          console.log('✅ Calls table also updated automatically with ticketId:', ticketId);
          console.log('Full ticket response:', ticketResponse);

          // Show success message
          alert('Ticket created successfully and linked to call!');
          this.closeCreateTicketModal();
          // Refresh tickets list
          await this.fetchTickets();
        } else {
          alert('Failed to create ticket: ' + (ticketResponse.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error creating ticket:', error);
        alert('Failed to create ticket. Please try again.');
      } finally {
        this.isCreatingTicket = false;
      }
    },

    handleMergeTicket() {
      this.closeActionsMenu();
      // TODO: Implement merge ticket logic
      console.log('Merge ticket for:', this.selectedActionsTicket);
      alert(`Merge ticket functionality for ticket ID: ${this.selectedActionsTicket.ticketId}`);
    },

    // Get status badge class
    getStatusClass(status) {
      const classes = {
        'created': 'bg-yellow-100 text-yellow-800',
        'assigned': 'bg-green-100 text-green-800',
        'unresolved': 'bg-red-100 text-red-800',
        'in-progress': 'bg-yellow-100 text-yellow-800',
        'pending': 'bg-orange-100 text-orange-800',
        'resolved': 'bg-green-100 text-green-800',
        'closed': 'bg-gray-100 text-gray-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    },

    // Get communication way badge class
    getCommunicationWayClass(way) {
      const classes = {
        'phone': 'bg-blue-100 text-blue-800',
        'email': 'bg-green-100 text-green-800',
        'chat': 'bg-purple-100 text-purple-800',
        'whatsapp': 'bg-green-100 text-green-800',
        'sms': 'bg-yellow-100 text-yellow-800',
        'video': 'bg-indigo-100 text-indigo-800',
        'walkin': 'bg-orange-100 text-orange-800'
      }
      return classes[way] || 'bg-gray-100 text-gray-800'
    },

    // Update communication way
    async updateCommunicationWay(ticket) {
      try {
        const response = await $fetch(`http://localhost:5001/tickets/${ticket.id}/details`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            communicationWay: ticket.wayOfCommunication
          }
        })

        if (response.message && response.message.includes('successfully')) {
          console.log('Communication way updated successfully')
        } else {
          console.error('Failed to update communication way:', response)
          // Revert the change if update failed
          ticket.wayOfCommunication = ticket.wayOfCommunication === 'phone' ? 'email' : 'phone'
        }
      } catch (error) {
        console.error('Error updating communication way:', error)
        // Revert the change if update failed
        ticket.wayOfCommunication = ticket.wayOfCommunication === 'phone' ? 'email' : 'phone'
      }
    },

    // Update ticket status
    async updateTicketStatus(ticket) {
      try {
        // Store original status to revert if needed
        const originalStatus = ticket.status

        const response = await $fetch(`http://localhost:5001/tickets/${ticket.id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            status: ticket.status
          }
        })

        if (response.message && response.message.includes('successfully')) {
          console.log('Ticket status updated successfully')

          // If status is resolved, show feedback link modal
          if (ticket.status === 'resolved') {
            this.selectedTicketDetails = ticket
            await this.generateFeedbackLink()
          }
        } else {
          console.error('Failed to update ticket status:', response)
          // Revert the change if update failed
          ticket.status = originalStatus
        }
      } catch (error) {
        console.error('Error updating ticket status:', error)
        // Revert the change if update failed
        ticket.status = originalStatus
      }
    },

    // Format date
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'short', day: 'numeric' }
      return new Date(dateString).toLocaleDateString('en-US', options)
    },

    // Get initials from name
    getInitials(name) {
      if (!name || name === '-') return '?'
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
    },

    // Pagination methods
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },

    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
      }
    },

    changeItemsPerPage(count) {
      this.itemsPerPage = count
      this.currentPage = 1 // Reset to first page when changing items per page
    },

    // Check if string is a phone number starting with specific digits
    isPhoneNumber(contact) {
      if (!contact || contact === '-' || contact.includes('@')) {
        return false
      }

      // Remove spaces, hyphens, parentheses, and plus signs
      const cleanNumber = contact.replace(/[\s\-\(\)]/g, '').replace('+', '')

      // Check if it contains only digits and has valid phone number length
      if (!/^\d+$/.test(cleanNumber)) {
        return false
      }

      // Check length (6-15 digits is typical for phone numbers)
      if (cleanNumber.length < 6 || cleanNumber.length > 15) {
        return false
      }

      // Show icon for numbers starting with these digits:
      // Mobile number prefixes and common phone number patterns
      const validStartingDigits = ['6', '7', '8', '9', '91', '92', '93', '94', '95', '96', '97', '98', '99', '1', '2', '3', '4', '5']

      // Check if the number starts with any valid prefix
      return validStartingDigits.some(prefix => cleanNumber.startsWith(prefix))
    },

    // Call modal methods
    openCallModal(ticket) {
      this.selectedTicket = ticket
      this.assignedAgent = ticket.agentName
      this.callStatus = 'pending'
      this.showCallModal = true
    },

    closeCallModal() {
      this.showCallModal = false
      this.selectedTicket = null
      this.assignedAgent = null
      this.callStatus = 'pending'
    },

    async startCall() {
      try {
        // Create call log when call starts
        const callData = {
          callbackId: this.selectedTicket.id, // Backend expects callbackId for internal id
          ticketId: this.selectedTicket.ticketId, // Use formatted ticketId (TKT001, etc.)
          agentId: this.selectedTicket.agentId,
          agentName: this.selectedTicket.agentName || 'Unknown Agent',
          agentNumber: this.selectedTicket.agentPhone || this.selectedTicket.agentContact || this.generateAgentPhone(this.selectedTicket.agentId),
          customerPhone: this.selectedTicket.phone,
          customerName: this.selectedTicket.customerName,
          productId: this.selectedTicket.productId || null,
          subject: `Call for ticket ${this.selectedTicket.ticketId} - ${this.selectedTicket.productCategory || 'No Product'}`,
          callType: 'outbound', // Calls from tickets page are outbound (support calling customer)
          ticketStatus: this.selectedTicket.status || 'assigned' // Send current ticket status
        }

        console.log('Sending call data:', callData); // Debug log to see what's being sent
        console.log('Selected ticket details:', {
          agentId: this.selectedTicket.agentId,
          agentName: this.selectedTicket.agentName,
          callType: 'outbound', // Confirming it's set to outbound
          subject: callData.subject
        }); // Enhanced debug info

        const response = await $fetch('http://localhost:5001/calls', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: callData
        })

        if (response.message && response.message.includes('successfully')) {
          this.callStatus = 'connected'
          this.selectedTicket.callLogId = response.data.callId // Store call ID for end call

          console.log('=== CALL STARTED ===');
          console.log('Call ID:', response.data.callId);
          console.log('Ticket ID:', response.data.ticketId);
          console.log('Scenario:', response.data.scenario);
          console.log('Start Time:', response.data.startTime);
          console.log('Call Status:', response.data.callStatus);
          console.log('===================');

          // Show appropriate message based on scenario
          if (response.data.ticketId === null) {
            alert(`Call connected successfully! \n\nScenario 1: New call (${response.data.callId}) created - new ticket will be created from call page`);
          } else {
            alert(`Call connected successfully! \n\nScenario 2: Multiple calls for same ticket (${response.data.ticketId}) - Call ID: ${response.data.callId}`);
          }
        } else {
          alert('Failed to start call')
        }
      } catch (error) {
        console.error('Error starting call:', error)
        this.callStatus = 'connected' // Still update UI even if API fails
        alert('Call started (recording not available)')
      }
    },

    async endCall() {
      try {
        // Update call log when call ends
        if (this.selectedTicket.callLogId) {
          console.log('Ending call with ID:', this.selectedTicket.callLogId)

          const response = await $fetch(`http://localhost:5001/calls/${this.selectedTicket.callLogId}/end`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: {
              endTime: new Date().toISOString()
            }
          })

          console.log('End call response:', response)

          if (response.message && response.message.includes('successfully')) {
            this.callStatus = 'ended'
            alert('Call ended and recorded successfully')
          } else {
            console.error('End call failed:', response)
            alert(`Failed to end call recording: ${response.message || 'Unknown error'}`)
          }
        } else {
          console.log('No callLogId found, just updating status')
          this.callStatus = 'ended'
          alert('Call ended')
        }
      } catch (error) {
        console.error('Error ending call:', error)
        this.callStatus = 'ended' // Still update UI even if API fails
        alert(`Call ended (recording not available): ${error.message}`)
      }
    },

    // Handle recording file upload
    async handleRecordingUpload(event) {
      // Prevent any default behavior
      event.preventDefault()
      event.stopPropagation()

      const file = event.target.files[0]
      if (!file) return

      console.log('Selected file:', file.name, file.type, file.size)

      // Validate file type
      if (!file.type.includes('audio') && !file.name.endsWith('.mp3')) {
        console.error('Invalid file type')
        this.uploadedRecording = null
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        console.error('File too large')
        this.uploadedRecording = null
        return
      }

      this.uploadedRecording = file

      // Upload file to server
      try {
        const formData = new FormData()
        formData.append('recording', file)
        formData.append('callId', this.selectedTicket?.callLogId || '')

        console.log('Uploading recording for callId:', this.selectedTicket?.callLogId)

        const response = await $fetch('http://localhost:5001/calls/upload-recording', {
          method: 'POST',
          body: formData
        })

        console.log('✅ Recording uploaded successfully:', response)
        // Don't close modal, just keep the file reference

      } catch (error) {
        console.error('Error uploading recording:', error)
        this.uploadedRecording = null
      }

      // Keep modal open - don't change callStatus or close modal
      return false
    },

    async disconnectCall() {
      try {
        // Mark call as missed
        if (this.selectedTicket.callLogId) {
          const response = await $fetch(`http://localhost:5001/calls/${this.selectedTicket.callLogId}/missed`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            }
          })

          if (response.success) {
            this.callStatus = 'missed'
            alert('Call is missed and recorded')
          } else {
            alert('Failed to record missed call')
          }
        } else {
          this.callStatus = 'missed'
          alert('Call is missed')
        }
      } catch (error) {
        console.error('Error disconnecting call:', error)
        this.callStatus = 'missed' // Still update UI even if API fails
        alert('Call is missed (recording not available)')
      }
    },

    getCallStatusClass() {
      switch (this.callStatus) {
        case 'pending':
          return 'bg-gray-100 text-gray-800'
        case 'connecting':
          return 'bg-yellow-100 text-yellow-800'
        case 'connected':
          return 'bg-green-100 text-green-800'
        case 'ended':
          return 'bg-blue-100 text-blue-800'
        case 'missed':
          return 'bg-red-100 text-red-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    },

    getCallStatusText() {
      switch (this.callStatus) {
        case 'pending':
          return 'Pending'
        case 'connecting':
          return 'Connecting...'
        case 'connected':
          return 'Connected'
        case 'ended':
          return 'Ended'
        case 'missed':
          return 'Missed'
        default:
          return 'Unknown'
      }
    },

    // Extract agent ID from agent name (e.g., "agent-4" -> 4)
    extractAgentIdFromName(agentName) {
      if (!agentName || agentName === '-') {
        return null
      }

      // Try to extract number from agent name patterns like "agent-4", "Agent 4", etc.
      const match = agentName.match(/agent[-\s]?(\d+)/i)
      if (match) {
        return parseInt(match[1])
      }

      // If no number found, return null
      return null
    },

    // Generate agent phone number based on agent ID
    generateAgentPhone(agentId) {
      if (!agentId) {
        return 'Unknown'
      }

      // Generate a phone number based on agent ID (e.g., agent 4 -> 9876543204)
      const baseNumber = 9876543200
      return `${baseNumber + parseInt(agentId)}`
    },

    getStatusBadgeClass(status) {
      switch (status?.toLowerCase()) {
        case 'created':
          return 'bg-gray-100 text-gray-800'
        case 'assigned':
          return 'bg-yellow-100 text-yellow-800'
        case 'in-progress':
          return 'bg-blue-100 text-blue-800'
        case 'pending':
          return 'bg-yellow-100 text-yellow-800'
        case 'resolved':
          return 'bg-green-100 text-green-800'
        case 'closed':
          return 'bg-gray-100 text-gray-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    },

    // Format call duration
    formatCallDuration(startTime, endTime) {
      if (!startTime) return 'No duration'
      if (!endTime) return 'Ongoing'

      const start = new Date(startTime)
      const end = new Date(endTime)
      const durationMs = end - start

      if (durationMs < 0) return 'Invalid'

      const minutes = Math.floor(durationMs / 60000)
      const seconds = Math.floor((durationMs % 60000) / 1000)

      return `Duration: ${minutes}:${seconds.toString().padStart(2, '0')}`
    },

    // Format call time
    formatCallTime(startTime) {
      if (!startTime) return 'Unknown time'

      const date = new Date(startTime)
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    },

    // Play recording
    playRecording(recordingUrl) {
      if (recordingUrl) {
        window.open(recordingUrl, '_blank')
      } else {
        alert('Recording URL not available')
      }
    },

    // Format assignment date
    formatAssignmentDate(dateString) {
      if (!dateString) return 'Unknown date'

      const date = new Date(dateString)
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    },

    // Ticket Details Side Panel Methods
    openTicketDetails(ticket) {
      this.selectedTicketDetails = { ...ticket }
      this.editedTicket = { ...ticket }
      this.showTicketDetails = true
      this.editMode = false
      this.showAddNote = false
      this.newNote = ''
      // Load related data (calls, notes, history, etc.)
      // Pass both numeric id and formatted ticketId
      this.loadTicketRelatedData(ticket.id, ticket.ticketId)
    },

    closeTicketDetails() {
      this.showTicketDetails = false
      this.selectedTicketDetails = null
      this.editMode = false
      this.showAddNote = false
      this.newNote = ''
    },

    async loadTicketRelatedData(numericId, formattedTicketId) {
      this.internalNotes = []
      this.activityHistory = []
      this.relatedCalls = []
      this.assignmentHistory = []

      if (!numericId && !formattedTicketId) return

      // Use numeric ID for endpoints that accept it
      const ticketId = numericId || formattedTicketId
      // Use formatted ticketId for calls query (T001, T002, etc.)
      const queryTicketId = formattedTicketId || numericId

      try {
        const response = await $fetch(`http://localhost:5001/tickets/${ticketId}/feedback`)
        const feedback = response && (response.data || response) || []

        this.selectedTicketDetails = {
          ...this.selectedTicketDetails,
          feedback
        }
      } catch (error) {
        console.error('Error loading ticket feedback', error)
        this.selectedTicketDetails = {
          ...this.selectedTicketDetails,
          feedback: []
        }
      }

      // Fetch activity logs for this ticket
      this.loadingActivityLogs = true
      try {
        const activityResponse = await $fetch(`http://localhost:5001/tickets/${ticketId}/activity-logs`)
        this.activityLogs = activityResponse && activityResponse.data || []
      } catch (error) {
        console.error('Error loading activity logs', error)
        this.activityLogs = []
      } finally {
        this.loadingActivityLogs = false
      }

      // Fetch related calls for this ticket - try both IDs
      try {
        // First try with formatted ticketId
        let callsResponse = await $fetch(`http://localhost:5001/calls?ticketId=${queryTicketId}`)
        this.relatedCalls = callsResponse.data || []

        // If no calls found and we have both IDs, try numeric ID
        if ((!this.relatedCalls || this.relatedCalls.length === 0) && formattedTicketId && numericId && formattedTicketId !== numericId) {
          callsResponse = await $fetch(`http://localhost:5001/calls?ticketId=${numericId}`)
          this.relatedCalls = callsResponse.data || []
        }

        console.log('Related calls loaded:', this.relatedCalls)
      } catch (error) {
        console.error('Error loading related calls:', error)
        this.relatedCalls = []
      }

      // Fetch assignment history for this ticket
      try {
        const historyResponse = await $fetch(`http://localhost:5001/tickets/${ticketId}/assignment-history`)
        this.assignmentHistory = historyResponse.data || []
        console.log('Assignment history loaded:', this.assignmentHistory)
      } catch (error) {
        console.error('Error loading assignment history:', error)
        this.assignmentHistory = []
      }

      // Parse existing notes and display them in the internal notes list
      if (this.selectedTicketDetails?.notes) {
        const notesText = this.selectedTicketDetails.notes
        // Split notes by the timestamp separator
        const notesParts = notesText.split(/\n\n--- (.*?) ---\n/)

        // Parse the notes into structured format
        const parsedNotes = []

        if (notesParts.length === 1) {
          // Single note without timestamp
          parsedNotes.push({
            id: Date.now(),
            text: notesText,
            author: 'Agent',
            timestamp: new Date().toLocaleString()
          })
        } else {
          // Add the first note (before any separator)
          if (notesParts[0] && notesParts[0].trim()) {
            parsedNotes.push({
              id: Date.now(),
              text: notesParts[0].trim(),
              author: 'Agent',
              timestamp: 'Initial Note'
            })
          }

          // Multiple notes with timestamps
          for (let i = 1; i < notesParts.length; i += 2) {
            if (notesParts[i] && notesParts[i + 1]) {
              parsedNotes.push({
                id: Date.now() + i,
                text: notesParts[i + 1].trim(),
                author: 'Agent',
                timestamp: notesParts[i]
              })
            }
          }
        }

        // Reverse to show newest first
        this.internalNotes = parsedNotes.reverse()
      }

      // Load available agents for this ticket's product
      try {
        const productId = this.selectedTicketDetails?.productId
        if (productId) {
          const resAgents = await $fetch(`http://localhost:5001/agents/product/${productId}`)
          this.availableAgentsForTicket = resAgents.data || []
        } else {
          this.availableAgentsForTicket = []
        }
      } catch (err) {
        console.error('Error loading agents for ticket', err)
        this.availableAgentsForTicket = []
      }
    },

    async addInternalNote() {
      if (this.newNote.trim()) {
        try {
          const ticketId = this.selectedTicketDetails.id

          // Save note to backend (calls table notes column)
          const response = await fetch(`http://localhost:5001/tickets/${ticketId}/details`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              notes: this.newNote
            })
          })

          const result = await response.json()

          if (!response.ok) {
            throw new Error(result.message || 'Failed to save note')
          }

          // Fetch updated ticket to get the full appended notes
          await this.fetchTickets()

          // Find the updated ticket
          const updatedTicket = this.tickets.find(t => t.id === ticketId)
          if (updatedTicket) {
            this.selectedTicketDetails.notes = updatedTicket.notes
            // Reload notes to display them properly
            this.loadTicketRelatedData(ticketId)
          }

          this.newNote = ''
          this.showAddNote = false

          console.log('Note saved successfully')
        } catch (error) {
          console.error('Error saving note:', error)
          alert('Failed to save note: ' + error.message)
        }
      }
    },

    async changeTicketAgent() {
      if (!this.selectedTicketDetails || !this.selectedTicketDetails.agentId) return

      this.changingAgent = true
      const ticketId = this.selectedTicketDetails.id
      const agentId = this.selectedTicketDetails.agentId

      try {
        await $fetch('http://localhost:5001/assign', {
          method: 'POST',
          body: {
            ticketId,
            agentId
          }
        })

        // Update local ticket data with new agent info
        const agent = this.availableAgentsForTicket.find(a => a.id == agentId)
        const agentName = agent ? (agent.agentName || agent.name) : this.selectedTicketDetails.agentName

        this.selectedTicketDetails = {
          ...this.selectedTicketDetails,
          agentName,
          agentId
        }

        const idx = this.tickets.findIndex(t => t.id === ticketId)
        if (idx !== -1) {
          this.$set(this.tickets, idx, {
            ...this.tickets[idx],
            agentName,
            agentId
          })
        }
      } catch (error) {
        console.error('Error changing ticket agent', error)
      } finally {
        this.changingAgent = false
      }
    },

    // Update First Call Resolution
    async updateFirstCallResolution() {
      if (!this.selectedTicketDetails) return

      try {
        const ticketId = this.selectedTicketDetails.id
        const fcrValue = this.selectedTicketDetails.firstCallResolution

        console.log('Updating FCR for ticket:', ticketId, 'to:', fcrValue)

        // Update in backend (you may need to create this endpoint)
        await fetch(`http://localhost:5001/tickets/${ticketId}/fcr`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstCallResolution: fcrValue
          })
        })

        // Update local ticket data
        const idx = this.tickets.findIndex(t => t.id === ticketId)
        if (idx !== -1) {
          this.tickets[idx].firstCallResolution = fcrValue
        }

        console.log('FCR updated successfully')
      } catch (error) {
        console.error('Error updating FCR:', error)
        alert('Failed to update First Call Resolution')
      }
    },

    // Save ticket details and sync to calls table
    async saveTicketDetails() {
      if (!this.selectedTicketDetails) return

      try {
        const ticketId = this.selectedTicketDetails.id

        // Prepare the data to send
        const updateData = {
          subject: this.editedTicket.subject || this.selectedTicketDetails.subject,
          description: this.editedTicket.description || this.selectedTicketDetails.description,
          priority: this.editedTicket.priority || this.selectedTicketDetails.priority,
          followupDate: this.editedTicket.followupDate || this.selectedTicketDetails.followupDate,
          followupStatus: this.editedTicket.followupStatus || this.selectedTicketDetails.followupStatus,
          firstCallResolution: this.selectedTicketDetails.firstCallResolution,
          notes: this.editedTicket.notes || this.selectedTicketDetails.notes || null
        }

        console.log('Saving ticket details:', updateData)

        // Call backend to update ticket details and calls table
        const response = await fetch(`http://localhost:5001/tickets/${ticketId}/details`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData)
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || 'Failed to save ticket details')
        }

        // Update local ticket data
        this.selectedTicketDetails = {
          ...this.selectedTicketDetails,
          ...updateData
        }

        const idx = this.tickets.findIndex(t => t.id === ticketId)
        if (idx !== -1) {
          this.tickets[idx] = {
            ...this.tickets[idx],
            ...updateData,
            notes: updateData.notes
          }
        }

        // Exit edit mode
        this.editMode = false
        console.log('Ticket details saved successfully')
      } catch (error) {
        console.error('Error saving ticket details:', error)
        alert('Failed to save ticket details: ' + error.message)
      }
    },

    
    // Update ticket status from sidebar (updates all tables)
    async updateTicketStatusFromSidebar() {
      if (!this.sidebarSelectedStatus || !this.selectedTicketDetails) {
        return
      }

      try {
        // Use formatted ticketId (like T011) for backend updates
        const ticketId = this.selectedTicketDetails.ticketId
        const newStatus = this.sidebarSelectedStatus

        console.log('Selected ticket details:', this.selectedTicketDetails)
        console.log('Ticket ID:', ticketId)
        console.log('Updating ticket status to:', newStatus)

        if (!ticketId) {
          throw new Error('Ticket ID is missing')
        }

        // Call backend to update status in all tables using ticketId
        const response = await fetch(`http://localhost:5001/tickets/${ticketId}/update-all-status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: newStatus
          })
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || 'Failed to update status')
        }

        console.log('Backend update result:', result)

        // Update local state only after successful backend update
        this.selectedTicketDetails.status = newStatus
        const ticketIndex = this.tickets.findIndex(t => t.ticketId === ticketId)
        if (ticketIndex !== -1) {
          this.tickets[ticketIndex].status = newStatus
        }

        // If status is resolved, show feedback link modal
        if (newStatus === 'resolved') {
          await this.generateFeedbackLink()
        }

        console.log('Ticket status updated successfully across all tables')
      } catch (error) {
        console.error('Error updating ticket status:', error)
        alert('Failed to update ticket status: ' + error.message)
        // Reload tickets to get the correct status from backend
        await this.fetchTickets()
      } finally {
        this.sidebarSelectedStatus = ''
      }
    },

    // Open status modal
    openStatusModal() {
      if (!this.selectedTicketDetails) return
      this.newStatus = this.selectedTicketDetails.status || 'assigned'
      this.showStatusModal = true
    },

    // Change ticket status via backend
    async changeTicketStatus() {
      if (!this.newStatus || !this.selectedTicketDetails) {
        this.showStatusModal = false
        return
      }

      try {
        const id = this.selectedTicketDetails.id
        await $fetch(`http://localhost:5001/tickets/${id}/status`, {
          method: 'PUT',
          body: {
            status: this.newStatus
          }
        })

        // Update local state
        this.selectedTicketDetails.status = this.newStatus
        const ticketIndex = this.tickets.findIndex(t => t.id === id)
        if (ticketIndex !== -1) {
          this.$set(this.tickets, ticketIndex, {
            ...this.tickets[ticketIndex],
            status: this.newStatus
          })
        }

        // If status is resolved, show feedback link modal
        if (this.newStatus === 'resolved') {
          await this.generateFeedbackLink()
        }
      } catch (error) {
        console.error('Failed to update ticket status', error)
      } finally {
        this.showStatusModal = false
      }
    },

    // Generate feedback link and show modal
    async generateFeedbackLink() {
      try {
        const ticketId = this.selectedTicketDetails.ticketId || this.selectedTicketDetails.id
        const customerEmail = this.selectedTicketDetails.customerContact || this.selectedTicketDetails.email || this.selectedTicketDetails.customerEmail

        console.log('Generating feedback link for ticket:', ticketId, 'email:', customerEmail)

        if (!customerEmail) {
          console.error('Customer email is missing')
          alert('Customer email is required to send feedback request')
          return
        }

        // Request feedback from backend
        const response = await $fetch('http://localhost:5001/feedback/request', {
          method: 'POST',
          body: {
            ticketId: ticketId,
            customerEmail: customerEmail,
            ratingScale: 5,
            includeComments: true
          }
        })

        // Generate feedback link with feedback ID
        const feedbackId = response.data.feedbackId
        const baseUrl = window.location.origin
        const generatedLink = `${baseUrl}/feedback-form?id=${feedbackId}`

        this.feedbackLink = generatedLink
        this.feedbackLinkCopied = false
        // Don't show modal - buttons will appear in the table Feedback column
        // this.showFeedbackLinkModal = true

        // Store the feedback link in the ticket object for table display
        if (this.selectedTicketDetails) {
          this.selectedTicketDetails.feedbackLink = generatedLink
          this.selectedTicketDetails.feedbackStatus = 'pending'
          const ticketIndex = this.tickets.findIndex(t => t.ticketId === ticketId)
          console.log('Looking for ticket with ticketId:', ticketId, 'Found at index:', ticketIndex)
          if (ticketIndex !== -1) {
            // Vue 3 doesn't need $set - direct assignment works with reactivity
            this.tickets[ticketIndex].feedbackLink = generatedLink
            this.tickets[ticketIndex].feedbackLinkCopied = false
            this.tickets[ticketIndex].feedbackStatus = 'pending'
            console.log('Feedback link set on ticket:', this.tickets[ticketIndex])
            console.log('Ticket status:', this.tickets[ticketIndex].status)
          } else {
            console.error('Could not find ticket in array with ticketId:', ticketId)
          }
        }

        console.log('Feedback link generated successfully! Check the Feedback column.')
        console.log('Generated link:', generatedLink)
      } catch (error) {
        console.error('Failed to generate feedback link', error)
        alert('Failed to generate feedback link: ' + error.message)
      }
    },

    // Copy feedback link to clipboard
    async copyFeedbackLink() {
      try {
        await navigator.clipboard.writeText(this.feedbackLink)
        this.feedbackLinkCopied = true
        setTimeout(() => {
          this.feedbackLinkCopied = false
        }, 2000)
      } catch (error) {
        console.error('Failed to copy link', error)
      }
    },

    // Open feedback link in new tab
    openFeedbackLink() {
      window.open(this.feedbackLink, '_blank')
    },

    // Open feedback link from table in new tab
    openFeedbackLinkInNewTab(link) {
      window.open(link, '_blank')
    },

    // Open feedback details modal
    async openFeedbackDetailsModal(ticket) {
      this.showFeedbackDetailsModal = true
      this.loadingFeedbackDetails = true
      this.feedbackDetailsError = null
      this.feedbackDetails = null

      try {
        // We need to get the feedback ID from the feedbacks table
        // Since we have ticketId, we'll fetch feedback by ticketId
        const response = await $fetch(`http://localhost:5001/feedback?ticketId=${ticket.ticketId}`)

        if (response.data && response.data.length > 0) {
          // Get the most recent feedback for this ticket
          this.feedbackDetails = response.data[0]
        } else {
          this.feedbackDetailsError = 'No feedback found for this ticket'
        }
      } catch (error) {
        console.error('Failed to fetch feedback details', error)
        this.feedbackDetailsError = 'Failed to load feedback details'
      } finally {
        this.loadingFeedbackDetails = false
      }
    },

    // Copy feedback link from table to clipboard
    async copyFeedbackLinkFromTable(link) {
      try {
        await navigator.clipboard.writeText(link)

        // Find the ticket and update its copied state
        const ticket = this.tickets.find(t => t.feedbackLink === link)
        if (ticket) {
          ticket.feedbackLinkCopied = true
          setTimeout(() => {
            ticket.feedbackLinkCopied = false
          }, 2000)
        }
      } catch (error) {
        console.error('Failed to copy link from table', error)
      }
    },

    // Navigate to assign ticket page with current ticket id
    goToAssignTicket() {
      if (!this.selectedTicketDetails) return
      const ticketId = this.selectedTicketDetails.id || this.selectedTicketDetails.ticketId
      if (!ticketId) return
      this.$router.push({
        path: '/assignticket',
        query: {
          ticketId
        }
      })
    },

    // Secondary formatter for feedback timestamps (avoids duplicate name)
    formatFeedbackDate(date) {
      if (!date) return ''
      const d = new Date(date)
      if (isNaN(d.getTime())) return ''
      const options = { year: 'numeric', month: 'short', day: 'numeric' }
      return d.toLocaleDateString('en-US', options)
    }
  },

  computed: {
    // Active filter chips for display
    activeFilterChips() {
      const chips = []

      this.activeFilters.status.forEach(status => {
        const statusOption = this.statusOptions.find(s => s.value === status)
        if (statusOption) {
          chips.push({ key: `status-${status}`, label: statusOption.label, type: 'status', value: status })
        }
      })

      this.activeFilters.agents.forEach(agent => {
        chips.push({ key: `agent-${agent}`, label: agent, type: 'agent', value: agent })
      })

      this.activeFilters.products.forEach(product => {
        chips.push({ key: `product-${product}`, label: product, type: 'product', value: product })
      })

      this.activeFilters.fcr.forEach(fcr => {
        chips.push({ key: `fcr-${fcr}`, label: `FCR: ${fcr}`, type: 'fcr', value: fcr })
      })

      this.activeFilters.csatRating.forEach(rating => {
        const ratingOption = this.csatRatingOptions.find(r => r.value === rating)
        if (ratingOption) {
          chips.push({ key: `csat-${rating}`, label: `CSAT: ${ratingOption.label}`, type: 'csat', value: rating })
        }
      })

      if (this.activeFilters.dateRange.createdFrom || this.activeFilters.dateRange.createdTo) {
        const label = `Created: ${this.activeFilters.dateRange.createdFrom || '...'} - ${this.activeFilters.dateRange.createdTo || '...'}`
        chips.push({ key: 'dateRange-created', label, type: 'dateRange', value: 'created' })
      }

      if (this.activeFilters.dateRange.resolvedFrom || this.activeFilters.dateRange.resolvedTo) {
        const label = `Resolved: ${this.activeFilters.dateRange.resolvedFrom || '...'} - ${this.activeFilters.dateRange.resolvedTo || '...'}`
        chips.push({ key: 'dateRange-resolved', label, type: 'dateRange', value: 'resolved' })
      }

      return chips
    },

    // Computed filtered tickets (all tickets after filtering)
    filteredTickets() {
      let result = this.tickets

      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase().trim()
        result = result.filter(ticket => {
          // Search in ticket ID (formatted ID like "TCK-001")
          const ticketIdMatch = ticket.ticketId && String(ticket.ticketId).toLowerCase().includes(query)

          // Search in customer phone
          const phoneMatch = ticket.phone && String(ticket.phone).toLowerCase().includes(query)

          // Search in customer name
          const nameMatch = ticket.customerName && String(ticket.customerName).toLowerCase().includes(query)

          // Search in customer contact (email)
          const contactMatch = ticket.customerContact && String(ticket.customerContact).toLowerCase().includes(query)

          // Search in subject (keywords)
          const subjectMatch = ticket.subject && String(ticket.subject).toLowerCase().includes(query)

          // Search in description (keywords)
          const descriptionMatch = ticket.description && String(ticket.description).toLowerCase().includes(query)

          // Search in notes (keywords)
          const notesMatch = ticket.notes && String(ticket.notes).toLowerCase().includes(query)

          return ticketIdMatch || phoneMatch || nameMatch || contactMatch || subjectMatch || descriptionMatch || notesMatch
        })
      }

      // Filter by status
      if (this.activeFilters.status.length > 0) {
        result = result.filter(ticket => this.activeFilters.status.includes(ticket.status))
      }

      // Filter by agent
      if (this.activeFilters.agents.length > 0) {
        result = result.filter(ticket => this.activeFilters.agents.includes(ticket.agentName))
      }

      // Filter by product
      if (this.activeFilters.products.length > 0) {
        result = result.filter(ticket => this.activeFilters.products.includes(ticket.productCategory))
      }

      // Filter by FCR
      if (this.activeFilters.fcr.length > 0) {
        result = result.filter(ticket => {
          const fcrValue = ticket.firstCallResolution

          if (this.activeFilters.fcr.includes('yes')) {
            // Check for any truthy FCR value (true, 1, '1', 'yes')
            return fcrValue === true || fcrValue === 1 || fcrValue === '1' || String(fcrValue).toLowerCase() === 'yes'
          }

          if (this.activeFilters.fcr.includes('no')) {
            // Check for any falsy/No FCR value (false, 0, '0', 'no', null, undefined)
            return fcrValue === false || fcrValue === 0 || fcrValue === '0' || String(fcrValue).toLowerCase() === 'no' || fcrValue === null || fcrValue === undefined
          }

          return false
        })
      }

      // Filter by CSAT Rating
      if (this.activeFilters.csatRating.length > 0) {
        result = result.filter(ticket => {
          if (!ticket.csatRating) return false
          const rating = String(ticket.csatRating)
          return this.activeFilters.csatRating.includes(rating)
        })
      }

      // Filter by Created Date Range
      if (this.activeFilters.dateRange.createdFrom || this.activeFilters.dateRange.createdTo) {
        result = result.filter(ticket => {
          if (!ticket.createdDate) return false
          const createdDate = new Date(ticket.createdDate)

          if (this.activeFilters.dateRange.createdFrom) {
            const fromDate = new Date(this.activeFilters.dateRange.createdFrom)
            if (createdDate < fromDate) return false
          }

          if (this.activeFilters.dateRange.createdTo) {
            const toDate = new Date(this.activeFilters.dateRange.createdTo)
            toDate.setHours(23, 59, 59, 999) // Include the entire "to" day
            if (createdDate > toDate) return false
          }

          return true
        })
      }

      // Filter by Resolved Date Range
      if (this.activeFilters.dateRange.resolvedFrom || this.activeFilters.dateRange.resolvedTo) {
        result = result.filter(ticket => {
          if (!ticket.resolvedDate) return false
          const resolvedDate = new Date(ticket.resolvedDate)

          if (this.activeFilters.dateRange.resolvedFrom) {
            const fromDate = new Date(this.activeFilters.dateRange.resolvedFrom)
            if (resolvedDate < fromDate) return false
          }

          if (this.activeFilters.dateRange.resolvedTo) {
            const toDate = new Date(this.activeFilters.dateRange.resolvedTo)
            toDate.setHours(23, 59, 59, 999) // Include the entire "to" day
            if (resolvedDate > toDate) return false
          }

          return true
        })
      }

      // Sort tickets
      result = [...result].sort((a, b) => {
        let valueA = a[this.sortBy]
        let valueB = b[this.sortBy]

        // Handle null/undefined values
        if (valueA === null || valueA === undefined) valueA = ''
        if (valueB === null || valueB === undefined) valueB = ''

        // Handle ticketId sorting - extract numeric part if it exists
        if (this.sortBy === 'ticketId') {
          // Try to extract numbers from ticketId (e.g., "TCK-123" -> 123)
          const numA = parseInt(String(valueA).match(/\d+/)?.[0] || '0')
          const numB = parseInt(String(valueB).match(/\d+/)?.[0] || '0')

          const comparison = numA - numB
          return this.sortOrder === 'asc' ? comparison : -comparison
        }

        // Handle date sorting
        if (this.sortBy === 'createdDate' || this.sortBy === 'resolvedDate') {
          valueA = valueA ? new Date(valueA).getTime() : 0
          valueB = valueB ? new Date(valueB).getTime() : 0
        }

        // Handle numeric sorting (CSAT rating, priority)
        if (this.sortBy === 'csatRating' || this.sortBy === 'priority') {
          valueA = Number(valueA) || 0
          valueB = Number(valueB) || 0
        }

        // Handle string sorting (case-insensitive)
        if (typeof valueA === 'string') valueA = valueA.toLowerCase()
        if (typeof valueB === 'string') valueB = valueB.toLowerCase()

        // Compare values
        let comparison = 0
        if (valueA > valueB) comparison = 1
        if (valueA < valueB) comparison = -1

        // Apply sort order
        return this.sortOrder === 'asc' ? comparison : -comparison
      })

      return result
    },

    // Paginated tickets (tickets for current page)
    paginatedTickets() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage
      const endIndex = startIndex + this.itemsPerPage
      return this.filteredTickets.slice(startIndex, endIndex)
    },

    // Total pages
    totalPages() {
      return Math.ceil(this.filteredTickets.length / this.itemsPerPage)
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
    },

    // Count active filters
    activeFiltersCount() {
      return this.activeFilterChips.length
    },

    // Check if any filters are active
    hasActiveFilters() {
      return this.activeFiltersCount > 0
    }
  },

  watch: {
    // Watch for changes in activeFilters and reset to page 1
    'activeFilters.status': {
      handler() {
        this.currentPage = 1
      },
      deep: true
    },
    'activeFilters.agents': {
      handler() {
        this.currentPage = 1
      },
      deep: true
    },
    'activeFilters.products': {
      handler() {
        this.currentPage = 1
      },
      deep: true
    },
    'activeFilters.fcr': {
      handler() {
        this.currentPage = 1
      },
      deep: true
    },
    'activeFilters.csatRating': {
      handler() {
        this.currentPage = 1
      },
      deep: true
    },
    'activeFilters.dateRange': {
      handler() {
        this.currentPage = 1
      },
      deep: true
    },
    // Watch search query
    searchQuery() {
      this.currentPage = 1
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

/* Thin scrollbar for vertical, invisible for horizontal */
::-webkit-scrollbar {
  width: 4px !important;
  height: 0px !important;
}

::-webkit-scrollbar:horizontal {
  height: 0px !important;
}

::-webkit-scrollbar-track {
  background: transparent !important;
}

::-webkit-scrollbar-thumb {
  background: #d1d5db !important;
  border-radius: 2px !important;
}

::-webkit-scrollbar-thumb:hover {
  background: #9ca3af !important;
}

/* Make horizontal scrollbar invisible - Higher specificity */
div.overflow-x-auto::-webkit-scrollbar {
  height: 0px;
  display: none;
}

div.overflow-x-auto::-webkit-scrollbar:horizontal {
  height: 0px;
  display: none;
}

div.overflow-x-auto::-webkit-scrollbar-thumb {
  display: none;
}

div.overflow-x-auto::-webkit-scrollbar-track {
  display: none;
}

/* For Firefox - Higher specificity */
div.overflow-x-auto {
  scrollbar-width: none !important; /* Firefox */
  -ms-overflow-style: none !important; /* IE and Edge */
}

* {
  scrollbar-width: thin !important;
  scrollbar-color: #d1d5db transparent !important;
}

/* Specific overrides */
.overflow-auto::-webkit-scrollbar {
  width: 4px !important;
  height: 4px !important;
}


.scrollbar-thin::-webkit-scrollbar {
  width: 4px !important;
  height: 4px !important;
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
