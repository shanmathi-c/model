<template>
  <div class="h-screen bg-gray-50 flex flex-col ">
    <!-- Fixed Header Section - Sticky -->
    <div class="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 shadow-md">
      <!-- Header Title -->
      <div class="mb-4">
        <h1 class="text-2xl font-bold text-gray-900">Tickets Management</h1>
        <p class="text-gray-600 mt-1">View and manage support tickets</p>
      </div>

      <!-- Search and Filter Bar -->
      <div class="flex items-center gap-3">
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
              <div>
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
                    <span>First Call Resolution</span>
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

    <!-- Scrollable Content Area with padding for fixed pagination -->
    <div class="flex-1 overflow-auto scrollbar-thin pb-20" style="min-height: calc(100vh - 200px);">
        <!-- Table View -->
        <div class="overflow-x-auto scrollbar-thin" style="min-height: calc(100vh - 300px);">
          <table class="w-full" style="min-width: 1200px;">
              <thead class="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th v-if="visibleColumns.ticketId" class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" style="width: 100px; min-width: 100px;">Ticket ID</th>
                  <th v-if="visibleColumns.customer" class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" style="width: 200px; min-width: 200px;">Customer</th>
                  <th v-if="visibleColumns.phone" class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" style="width: 130px; min-width: 130px;">Phone</th>
                  <th v-if="visibleColumns.agent" class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" style="width: 150px; min-width: 150px;">Agent</th>
                  <th v-if="visibleColumns.product" class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" style="width: 120px; min-width: 120px;">Product</th>
                  <th v-if="visibleColumns.type" class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" style="width: 100px; min-width: 100px;">Type</th>
                  <th v-if="visibleColumns.status" class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" style="width: 120px; min-width: 120px;">Status</th>
                  <th v-if="visibleColumns.created" class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" style="width: 120px; min-width: 120px;">Created</th>
                  <th v-if="visibleColumns.resolved" class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" style="width: 120px; min-width: 120px;">Resolved</th>
                  <th v-if="visibleColumns.csat" class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" style="width: 80px; min-width: 80px;">CSAT</th>
                  <th v-if="visibleColumns.fcr" class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider" style="width: 60px; min-width: 60px;">FCR</th>
                  <th v-if="visibleColumns.notes" class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" style="width: 300px; min-width: 300px;">Notes</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr
                  v-for="ticket in paginatedTickets"
                  :key="ticket.id"
                  class="hover:bg-gray-50 transition-colors cursor-pointer"
                  @click="openTicketDetails(ticket)"
                >
                  <!-- Ticket ID -->
                  <td v-if="visibleColumns.ticketId" class="px-4 py-4 whitespace-nowrap">
                    <span class="text-sm font-medium text-blue-600">#{{ ticket.id }}</span>
                  </td>

                  <!-- Customer -->
                  <td v-if="visibleColumns.customer" class="px-4 py-4">
                    <div class="text-sm">
                      <div class="font-medium text-gray-900">{{ ticket.customerName }}</div>
                      <div class="flex items-center gap-1 text-gray-500">
                        <span>{{ ticket.customerContact }}</span>
                        <img
                          v-if="isPhoneNumber(ticket.customerContact)"
                          src="/phone-call.svg"
                          alt="Call"
                          class="w-5 h-5 cursor-pointer hover:text-green-600 transition-colors"
                          @click.stop="openCallModal(ticket)"
                        />
                      </div>
                    </div>
                  </td>

                  <!-- Phone -->
                  <td v-if="visibleColumns.phone" class="px-4 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <img
                        v-if="isPhoneNumber(ticket.phone)"
                        src="/phone-call.svg"
                        alt="Call"
                        class="w-5 h-5 cursor-pointer hover:text-green-600 transition-colors"
                        @click.stop="openCallModal(ticket)"
                      />
                      <span class="text-sm text-gray-900">{{ ticket.phone || '-' }}</span>
                    </div>
                  </td>

                  <!-- Agent -->
                  <td v-if="visibleColumns.agent" class="px-4 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span class="text-xs font-medium text-gray-600">{{ getInitials(ticket.agentName) }}</span>
                      </div>
                      <span class="text-sm text-gray-900">{{ ticket.agentName }}</span>
                    </div>
                  </td>

                  <!-- Product -->
                  <td v-if="visibleColumns.product" class="px-4 py-4 whitespace-nowrap">
                    <span class="text-sm text-gray-900">{{ ticket.productCategory }}</span>
                  </td>

                  <!-- Type -->
                  <td v-if="visibleColumns.type" class="px-4 py-4 whitespace-nowrap">
                    <span class="text-sm text-gray-700 capitalize">{{ ticket.type }}</span>
                  </td>

                  <!-- Status -->
                  <td v-if="visibleColumns.status" class="px-4 py-4 whitespace-nowrap">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="getStatusClass(ticket.status)"
                    >
                      {{ ticket.status }}
                    </span>
                  </td>

                  <!-- Created Date -->
                  <td v-if="visibleColumns.created" class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(ticket.createdDate) }}
                  </td>

                  <!-- Resolved Date -->
                  <td v-if="visibleColumns.resolved" class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ ticket.resolvedDate ? formatDate(ticket.resolvedDate) : '-' }}
                  </td>

                  <!-- CSAT Rating -->
                  <td v-if="visibleColumns.csat" class="px-4 py-4 whitespace-nowrap">
                    <div v-if="ticket.csatRating" class="flex items-center gap-1">
                      <span
                        v-for="n in 5"
                        :key="n"
                        class="text-yellow-400"
                      >
                        <svg v-if="n <= ticket.csatRating" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </span>
                      <span class="ml-1 text-xs text-gray-600">({{ ticket.csatRating }})</span>
                    </div>
                    <span v-else class="text-sm text-gray-400">-</span>
                  </td>

                  <!-- FCR Indicator -->
                  <td v-if="visibleColumns.fcr" class="px-4 py-4 whitespace-nowrap text-center">
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
                  <td v-if="visibleColumns.notes" class="px-4 py-4">
                    <div class="text-sm text-gray-600 max-w-xs truncate">
                      {{ ticket.notes }}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

  
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
      <div class="absolute right-0 top-0 h-full w-full max-w-3xl bg-white shadow-2xl transform transition-transform duration-300"
           :class="showTicketDetails ? 'translate-x-0' : 'translate-x-full'">

        <!-- Panel Header -->
        <div class="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <h2 class="text-xl font-bold text-gray-900">Ticket #{{ selectedTicketDetails?.id }}</h2>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getStatusBadgeClass(selectedTicketDetails?.status)">
                {{ selectedTicketDetails?.status }}
              </span>
            </div>
            <button @click="closeTicketDetails" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg class="w-5 h-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Panel Content -->
        <div class="flex-1 overflow-y-auto" style="max-height: calc(100vh - 80px);">
          <div class="p-6 space-y-6">

            <!-- Quick Actions Bar -->
            <div class="flex gap-2 flex-wrap">
              <button @click="editMode = !editMode" class="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                {{ editMode ? 'Save Changes' : 'Edit Details' }}
              </button>
              <button class="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                Assign Agent
              </button>
              <button class="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors">
                Change Status
              </button>
              <button class="px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors">
                Link to Freshdesk
              </button>
            </div>

            <!-- Customer Information -->
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 class="text-sm font-semibold text-gray-900 mb-3">Customer Information</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-xs text-gray-500">Name</p>
                  <p class="text-sm font-medium text-gray-900">{{ selectedTicketDetails?.customerName }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Phone</p>
                  <p class="text-sm font-medium text-gray-900">{{ selectedTicketDetails?.phone }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Email</p>
                  <p class="text-sm font-medium text-gray-900">{{ selectedTicketDetails?.customerContact || 'N/A' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Product</p>
                  <p class="text-sm font-medium text-gray-900">{{ selectedTicketDetails?.productCategory || 'N/A' }}</p>
                </div>
              </div>
            </div>

            <!-- Ticket Details -->
            <div class="bg-white rounded-lg p-4 border border-gray-200">
              <h3 class="text-sm font-semibold text-gray-900 mb-3">Ticket Details</h3>
              <div class="space-y-3">
                <div>
                  <p class="text-xs text-gray-500">Subject</p>
                  <input v-if="editMode" v-model="editedTicket.subject" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm" />
                  <p v-else class="text-sm text-gray-900">{{ selectedTicketDetails?.notes || 'No subject' }}</p>
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
                    <p class="text-sm font-medium text-gray-900">{{ selectedTicketDetails?.type || 'General' }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Agent Assignment & History -->
            <div class="bg-white rounded-lg p-4 border border-gray-200">
              <h3 class="text-sm font-semibold text-gray-900 mb-3">Agent Assignment</h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-xs text-gray-500">Currently Assigned To</p>
                    <p class="text-sm font-medium text-gray-900">{{ selectedTicketDetails?.agentName || 'Unassigned' }}</p>
                  </div>
                  <button class="text-xs text-blue-600 hover:text-blue-700">Change Agent</button>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-2">Assignment History</p>
                  <div class="space-y-1 text-xs text-gray-600">
                    <div class="flex justify-between">
                      <span>Agent John Doe</span>
                      <span>2024-01-15 10:30 AM</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Agent Jane Smith</span>
                      <span>2024-01-14 02:15 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Follow-up Information -->
            <div class="bg-white rounded-lg p-4 border border-gray-200">
              <h3 class="text-sm font-semibold text-gray-900 mb-3">Follow-up Information</h3>
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
                    <option value="completed">Completed</option>
                  </select>
                  <p v-else class="text-sm text-gray-900">{{ selectedTicketDetails?.followupStatus || 'Pending' }}</p>
                </div>
              </div>
            </div>

            <!-- Related Calls & Recordings -->
            <div class="bg-white rounded-lg p-4 border border-gray-200">
              <h3 class="text-sm font-semibold text-gray-900 mb-3">Related Calls & Recordings</h3>
              <div class="space-y-2">
                <div class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div class="flex items-center gap-3">
                    <svg class="w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <p class="text-sm font-medium">Call #C001</p>
                      <p class="text-xs text-gray-500">Duration: 5:23 | 2024-01-15 10:30 AM</p>
                    </div>
                  </div>
                  <button class="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                    Play Recording
                  </button>
                </div>
                <div class="text-center py-2 text-xs text-gray-500">
                  No more related calls
                </div>
              </div>
            </div>

            <!-- Internal Notes -->
            <div class="bg-white rounded-lg p-4 border border-gray-200">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-gray-900">Internal Notes</h3>
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
                <div class="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div class="flex justify-between items-start">
                    <div>
                      <p class="text-sm text-gray-900">Customer requested callback tomorrow morning</p>
                      <p class="text-xs text-gray-500 mt-1">By Agent John - 2024-01-15 3:30 PM</p>
                    </div>
                    <button class="text-xs text-red-500 hover:text-red-700">Delete</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Customer Feedback & Comments -->
            <div class="bg-white rounded-lg p-4 border border-gray-200">
              <h3 class="text-sm font-semibold text-gray-900 mb-3">Customer Feedback & Comments</h3>
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <p class="text-xs text-gray-500">CSAT Rating:</p>
                  <div class="flex gap-1">
                    <span v-for="i in 5" :key="i" class="text-lg"
                          :class="i <= (selectedTicketDetails?.csatRating || 0) ? 'text-yellow-500' : 'text-gray-300'">
                      ★
                    </span>
                  </div>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">Customer Comment:</p>
                  <p class="text-sm text-gray-700 italic">"Great service, issue resolved quickly!"</p>
                </div>
              </div>
            </div>

            <!-- Activity Log -->
            <div class="bg-white rounded-lg p-4 border border-gray-200">
              <h3 class="text-sm font-semibold text-gray-900 mb-3">Activity History</h3>
              <div class="space-y-3">
                <div class="flex gap-3">
                  <div class="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                  <div class="flex-1">
                    <p class="text-sm text-gray-900">Ticket created</p>
                    <p class="text-xs text-gray-500">{{ formatDate(selectedTicketDetails?.createdDate) }}</p>
                  </div>
                </div>
                <div class="flex gap-3">
                  <div class="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                  <div class="flex-1">
                    <p class="text-sm text-gray-900">Assigned to {{ selectedTicketDetails?.agentName }}</p>
                    <p class="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div class="flex gap-3">
                  <div class="w-2 h-2 bg-yellow-500 rounded-full mt-1.5"></div>
                  <div class="flex-1">
                    <p class="text-sm text-gray-900">Status changed to In Progress</p>
                    <p class="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Fixed Pagination Controls -->
    <div class="fixed bottom-0 left-0 right-0 px-4 py-3 bg-white border-t border-gray-200 z-10">
      <div class="flex flex-col gap-2">
        <!-- Info row -->
        <div class="text-sm text-gray-700">
          Showing <span class="font-medium">{{ ((currentPage - 1) * itemsPerPage) + 1 }}</span> to
          <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, filteredTickets.length) }}</span> of
          <span class="font-medium">{{ filteredTickets.length }}</span> tickets (Page {{ currentPage }} of {{ totalPages }})
        </div>

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
  </div>
</template>

<script>
export default {
  name: 'TicketsPage',

  data() {
    return {
      // Refs
      filterDropdownRef: null,
      displayDropdownRef: null,

      // Loading state
      loading: false,
      error: null,

      // Filters
      searchQuery: '',
      showFilterDropdown: false,
      showDisplayDropdown: false,

      // Filter options
      statusOptions: [
        { value: 'created', label: 'Created' },
        { value: 'assigned', label: 'Assigned' },
        { value: 'in-progress', label: 'In Progress' },
        { value: 'pending', label: 'Pending' },
        { value: 'resolved', label: 'Resolved' },
        { value: 'closed', label: 'Closed' }
      ],

      agentOptions: [],
      productOptions: [],

      // Active filters state
      activeFilters: {
        status: [],
        agents: [],
        products: [],
        fcr: []
      },

      // Expanded sections state
      expandedSections: {
        status: false,
        agent: false,
        product: false,
        fcr: false
      },

      // Call modal state
      showCallModal: false,
      selectedTicket: null,
      callStatus: 'pending',
      assignedAgent: null,

      // Compact column options
      columnOptions: [
        { key: 'ticketId', label: 'ID' },
        { key: 'customer', label: 'Customer' },
        { key: 'phone', label: 'Phone' },
        { key: 'agent', label: 'Agent' },
        { key: 'product', label: 'Product' },
        { key: 'type', label: 'Type' },
        { key: 'status', label: 'Status' },
        { key: 'created', label: 'Created' },
        { key: 'resolved', label: 'Resolved' },
        { key: 'csat', label: 'CSAT' },
        { key: 'fcr', label: 'FCR' },
        { key: 'notes', label: 'Notes' }
      ],

      // Visible columns state
      visibleColumns: {},

      // Pagination
      currentPage: 1,
      itemsPerPage: 3,

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
      activityHistory: []
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

  mounted() {
    // Add click event listener
    document.addEventListener('click', this.handleClickOutside);
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
        // Fetch only assigned tickets
        const response = await $fetch('http://localhost:5001/tickets?status=assigned&limit=1000')
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
          this.tickets = response.data.map(ticket => ({
            id: ticket.ticketId || ticket.id,
            customerName: ticket.name || '-',
            customerContact: ticket.email || '-',
            phone: ticket.phone || '-',
            agentName: ticket.assignedAgentName || ticket.agentName || '-',
            agentId: ticket.agentId || ticket.agent_id || ticket.assignedAgentId || this.extractAgentIdFromName(ticket.agentName || ticket.assignedAgentName),
            productCategory: ticket.productName || 'No Product',
            productId: ticket.productId || ticket.product_id || null,
            type: ticket.ticketType || 'general',
            status: ticket.status || 'assigned',
            createdDate: ticket.createdAt || ticket.created_at || new Date().toISOString(),
            resolvedDate: ticket.resolvedAt || ticket.resolved_at || null,
            csatRating: ticket.csatRating || ticket.csat_rating || null,
            firstCallResolution: ticket.fcr || ticket.first_call_resolution || false,
            notes: ticket.subject || ticket.description || '-',
            importAction: ticket.importAction || null
          }))
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
      }
    },

    // Clear all filters
    clearFilters() {
      this.activeFilters = {
        status: [],
        agents: [],
        products: [],
        fcr: []
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

      // Close display dropdown if clicking outside
      if (this.showDisplayDropdown) {
        const displayDropdown = this.$refs.displayDropdownRef;
        if (displayDropdown && !displayDropdown.contains(clickedElement)) {
          this.showDisplayDropdown = false;
        }
      }
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
          callbackId: this.selectedTicket.id, // Backend expects callbackId for ticketId
          ticketId: this.selectedTicket.id,
          agentId: this.selectedTicket.agentId,
          agentName: this.selectedTicket.agentName || 'Unknown Agent',
          agentNumber: this.selectedTicket.agentPhone || this.selectedTicket.agentContact || this.generateAgentPhone(this.selectedTicket.agentId),
          customerPhone: this.selectedTicket.phone,
          customerName: this.selectedTicket.customerName,
          productId: this.selectedTicket.productId || null,
          subject: `Call for ticket ${this.selectedTicket.id} - ${this.selectedTicket.productCategory || 'No Product'}`,
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
          console.log('Call started with ID:', response.data.callId)
          alert('Call connected successfully')
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

    // Ticket Details Side Panel Methods
    openTicketDetails(ticket) {
      this.selectedTicketDetails = { ...ticket }
      this.editedTicket = { ...ticket }
      this.showTicketDetails = true
      this.editMode = false
      this.showAddNote = false
      this.newNote = ''
      // Load related data (calls, notes, history, etc.)
      this.loadTicketRelatedData(ticket.id)
    },

    closeTicketDetails() {
      this.showTicketDetails = false
      this.selectedTicketDetails = null
      this.editMode = false
      this.showAddNote = false
      this.newNote = ''
    },

    async loadTicketRelatedData(ticketId) {
      // TODO: Fetch related calls, notes, and activity history from backend
      // For now, using placeholder data
      this.internalNotes = []
      this.activityHistory = []
    },

    addInternalNote() {
      if (this.newNote.trim()) {
        const note = {
          id: Date.now(),
          text: this.newNote,
          author: 'Current Agent',
          timestamp: new Date().toISOString()
        }
        this.internalNotes.unshift(note)
        this.newNote = ''
        this.showAddNote = false
        // TODO: Save note to backend
      }
    },

    formatDate(date) {
      if (!date) return 'N/A'
      const d = new Date(date)
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString()
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

      if (this.activeFilters.fcr.includes('yes')) {
        chips.push({ key: 'fcr-yes', label: 'FCR', type: 'fcr', value: 'yes' })
      }

      return chips
    },

    // Computed filtered tickets (all tickets after filtering)
    filteredTickets() {
      let result = this.tickets

      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        result = result.filter(ticket =>
          ticket.id.toLowerCase().includes(query) ||
          ticket.customerName.toLowerCase().includes(query) ||
          ticket.customerContact.toLowerCase().includes(query) ||
          ticket.agentName.toLowerCase().includes(query) ||
          ticket.notes.toLowerCase().includes(query)
        )
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
      if (this.activeFilters.fcr.includes('yes')) {
        result = result.filter(ticket => ticket.firstCallResolution === true)
      }

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

/* Make horizontal scrollbar invisible */
.overflow-x-auto::-webkit-scrollbar {
  height: 0px;
}

.overflow-x-auto::-webkit-scrollbar:horizontal {
  height: 0px;
}

/* For Firefox */
.overflow-x-auto {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
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

.overflow-x-auto::-webkit-scrollbar {
  height: 4px !important;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 4px !important;
  height: 4px !important;
}
</style>
