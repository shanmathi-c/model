<template>
  <div class="flex flex-col h-screen overflow-hidden">
    <!-- Fixed Header -->
    <div class="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">Support Tickets</h1>

      <!-- Search and Filters -->
      <div class="flex flex-col gap-3">
        <!-- First Row: Search Bar and Buttons -->
        <div class="flex items-center gap-3">
          <!-- Search Bar -->
          <div class="relative w-80">
            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by ticket ID, customer phone, keywords..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

        <!-- Filter Button -->
        <div ref="filterDropdownRef" class="relative">
          <button
            @click="toggleFilterDropdown"
            class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            :class="{ 'bg-blue-50 border-blue-500': hasActiveFilters }"
          >
            <img src="/filter.svg" alt="filter" class="w-4 h-4" />
            <span class="text-sm font-medium">Filter</span>
          </button>

  
          <!-- Dropdown -->
          <div
            v-if="showFilterDropdown"
            class="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-96 overflow-y-auto"
          >
            <div class="p-2">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-xs font-semibold text-gray-900">Filters</h3>
                <button
                  v-if="hasActiveFilters"
                  @click="clearFilters"
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
            class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
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
            @click="removeFilter(chip.key)"
            class="hover:text-blue-900 hover:bg-blue-200 rounded-full w-4 h-4 flex items-center justify-center transition-colors"
          >
            ×
          </button>
        </span>
      </div>
    </div>

    <!-- Scrollable Content Area -->
    <div class="flex-1 overflow-auto bg-gray-50" style="height: calc(100vh - 400px);">
      <div class="p-6 min-h-full">
        <!-- Table View -->
        <div class="bg-white rounded-lg shadow overflow-hidden" style="min-height: 400px;">
          <div class="overflow-x-auto" style="height: 100%;">
            <table class="w-full" style="min-width: 1200px;">
              <thead class="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th v-if="visibleColumns.ticketId" class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" style="width: 100px; min-width: 100px;">Ticket ID</th>
                  <th v-if="visibleColumns.customer" class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" style="width: 200px; min-width: 200px;">Customer</th>
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
                >
                  <!-- Ticket ID -->
                  <td v-if="visibleColumns.ticketId" class="px-4 py-4 whitespace-nowrap">
                    <span class="text-sm font-medium text-blue-600">#{{ ticket.id }}</span>
                  </td>

                  <!-- Customer -->
                  <td v-if="visibleColumns.customer" class="px-4 py-4">
                    <div class="text-sm">
                      <div class="font-medium text-gray-900">{{ ticket.customerName }}</div>
                      <div class="text-gray-500">{{ ticket.customerContact }}</div>
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
          <div v-if="filteredTickets.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No tickets found</h3>
            <p class="mt-1 text-sm text-gray-500">Try adjusting your search or filters</p>
          </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fixed Pagination Controls -->
    <div class="flex-shrink-0 px-6 py-4 bg-white border-t border-gray-200 sticky bottom-0">
      <div class="flex flex-col gap-3">
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
            class="px-4 py-2 text-sm border rounded-md transition-colors mr-2"
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
              class="px-3 py-2 text-sm border rounded-md transition-colors mx-1"
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
            class="px-4 py-2 text-sm border rounded-md transition-colors ml-2"
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

      // Filters
      searchQuery: '',
      showFilterDropdown: false,
      showDisplayDropdown: false,

      // Filter options
      statusOptions: [
        { value: 'unresolved', label: 'Unresolved' },
        { value: 'in-progress', label: 'In Progress' },
        { value: 'pending', label: 'Pending' },
        { value: 'resolved', label: 'Resolved' },
        { value: 'closed', label: 'Closed' }
      ],

      agentOptions: ['Sarah Smith', 'Mike Johnson', 'Emily Davis'],
      productOptions: ['Product A', 'Product B', 'Product C', 'Service Package 1', 'Service Package 2'],

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

      // Compact column options
      columnOptions: [
        { key: 'ticketId', label: 'ID' },
        { key: 'customer', label: 'Customer' },
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
      itemsPerPage: 5,

      // Sample data
      tickets: [
        {
          id: 'T001',
          customerName: 'John Doe',
          customerContact: 'john@example.com',
          agentName: 'Sarah Smith',
          productCategory: 'Product A',
          type: 'technical',
          status: 'unresolved',
          createdDate: '2024-01-15',
          resolvedDate: null,
          csatRating: null,
          firstCallResolution: false,
          notes: 'Customer experiencing login issues with the mobile app'
        },
        {
          id: 'T002',
          customerName: 'Jane Wilson',
          customerContact: '+1 (555) 123-4567',
          agentName: 'Mike Johnson',
          productCategory: 'Service Package 1',
          type: 'billing',
          status: 'resolved',
          createdDate: '2024-01-14',
          resolvedDate: '2024-01-14',
          csatRating: 5,
          firstCallResolution: true,
          notes: 'Billing inquiry about subscription renewal'
        },
        {
          id: 'T003',
          customerName: 'Bob Anderson',
          customerContact: 'bob.anderson@company.com',
          agentName: 'Emily Davis',
          productCategory: 'Product B',
          type: 'general',
          status: 'in-progress',
          createdDate: '2024-01-13',
          resolvedDate: null,
          csatRating: null,
          firstCallResolution: false,
          notes: 'General inquiry about product features and capabilities'
        },
        {
          id: 'T004',
          customerName: 'Alice Brown',
          customerContact: '+1 (555) 987-6543',
          agentName: 'Sarah Smith',
          productCategory: 'Product C',
          type: 'feature',
          status: 'closed',
          createdDate: '2024-01-10',
          resolvedDate: '2024-01-12',
          csatRating: 4,
          firstCallResolution: false,
          notes: 'Feature request for bulk export functionality'
        },
        {
          id: 'T005',
          customerName: 'Charlie Green',
          customerContact: 'charlie@startup.io',
          agentName: 'Mike Johnson',
          productCategory: 'Service Package 2',
          type: 'technical',
          status: 'resolved',
          createdDate: '2024-01-08',
          resolvedDate: '2024-01-08',
          csatRating: 5,
          firstCallResolution: true,
          notes: 'API integration support - successfully resolved'
        },
        {
          id: 'T006',
          customerName: 'David Lee',
          customerContact: '+1 (555) 246-8135',
          agentName: 'Emily Davis',
          productCategory: 'Product A',
          type: 'billing',
          status: 'pending',
          createdDate: '2024-01-16',
          resolvedDate: null,
          csatRating: null,
          firstCallResolution: false,
          notes: 'Requesting invoice for recent purchase'
        },
        {
          id: 'T007',
          customerName: 'Emma Watson',
          customerContact: 'emma.w@company.com',
          agentName: 'Sarah Smith',
          productCategory: 'Product B',
          type: 'technical',
          status: 'resolved',
          createdDate: '2024-01-11',
          resolvedDate: '2024-01-13',
          csatRating: 3,
          firstCallResolution: false,
          notes: 'Software installation support provided'
        },
        {
          id: 'T008',
          customerName: 'Frank Miller',
          customerContact: '+1 (555) 345-6789',
          agentName: 'Mike Johnson',
          productCategory: 'Product C',
          type: 'billing',
          status: 'unresolved',
          createdDate: '2024-01-17',
          resolvedDate: null,
          csatRating: null,
          firstCallResolution: false,
          notes: 'Customer billing dispute - subscription renewal issue'
        },
        {
          id: 'T009',
          customerName: 'Grace Chen',
          customerContact: 'grace.chen@techcorp.com',
          agentName: 'Emily Davis',
          productCategory: 'Product A',
          type: 'technical',
          status: 'in-progress',
          createdDate: '2024-01-17',
          resolvedDate: null,
          csatRating: null,
          firstCallResolution: false,
          notes: 'Database connection timeout issues - investigating'
        },
        {
          id: 'T010',
          customerName: 'Henry Williams',
          customerContact: '+1 (555) 456-7890',
          agentName: 'Sarah Smith',
          productCategory: 'Service Package 1',
          type: 'general',
          status: 'resolved',
          createdDate: '2024-01-16',
          resolvedDate: '2024-01-16',
          csatRating: 5,
          firstCallResolution: true,
          notes: 'General inquiry about new features roadmap'
        },
        {
          id: 'T011',
          customerName: 'Isabella Garcia',
          customerContact: 'isabella.g@startup.io',
          agentName: 'Mike Johnson',
          productCategory: 'Product B',
          type: 'feature',
          status: 'pending',
          createdDate: '2024-01-18',
          resolvedDate: null,
          csatRating: null,
          firstCallResolution: false,
          notes: 'Request for API documentation in Spanish language'
        },
        {
          id: 'T012',
          customerName: 'Jack Thompson',
          customerContact: '+1 (555) 567-8901',
          agentName: 'Emily Davis',
          productCategory: 'Service Package 2',
          type: 'technical',
          status: 'unresolved',
          createdDate: '2024-01-18',
          resolvedDate: null,
          csatRating: null,
          firstCallResolution: false,
          notes: 'Integration with third-party calendar app failing'
        },
        {
          id: 'T013',
          customerName: 'Karen Lee',
          customerContact: 'karen.lee@enterprise.com',
          agentName: 'Sarah Smith',
          productCategory: 'Product A',
          type: 'billing',
          status: 'resolved',
          createdDate: '2024-01-15',
          resolvedDate: '2024-01-16',
          csatRating: 4,
          firstCallResolution: false,
          notes: 'Invoice correction for annual subscription'
        },
        {
          id: 'T014',
          customerName: 'Liam Martinez',
          customerContact: '+1 (555) 678-9012',
          agentName: 'Mike Johnson',
          productCategory: 'Product C',
          type: 'general',
          status: 'closed',
          createdDate: '2024-01-09',
          resolvedDate: '2024-01-11',
          csatRating: 2,
          firstCallResolution: false,
          notes: 'Feature request denied - customer unhappy with response'
        },
        {
          id: 'T015',
          customerName: 'Mia Rodriguez',
          customerContact: 'mia.r@company.org',
          agentName: 'Emily Davis',
          productCategory: 'Service Package 1',
          type: 'technical',
          status: 'in-progress',
          createdDate: '2024-01-19',
          resolvedDate: null,
          csatRating: null,
          firstCallResolution: false,
          notes: 'Mobile app crashing on iOS devices - investigating'
        },
        {
          id: 'T016',
          customerName: 'Nathan Brown',
          customerContact: '+1 (555) 789-0123',
          agentName: 'Sarah Smith',
          productCategory: 'Product B',
          type: 'feature',
          status: 'pending',
          createdDate: '2024-01-19',
          resolvedDate: null,
          csatRating: null,
          firstCallResolution: false,
          notes: 'Request for dark mode feature in dashboard'
        },
        {
          id: 'T017',
          customerName: 'Olivia Davis',
          customerContact: 'olivia.d@startup.co',
          agentName: 'Mike Johnson',
          productCategory: 'Service Package 2',
          type: 'billing',
          status: 'resolved',
          createdDate: '2024-01-14',
          resolvedDate: '2024-01-15',
          csatRating: 5,
          firstCallResolution: true,
          notes: 'Successful plan upgrade - customer very satisfied'
        },
        {
          id: 'T018',
          customerName: 'Peter Johnson',
          customerContact: '+1 (555) 890-1234',
          agentName: 'Emily Davis',
          productCategory: 'Product A',
          type: 'technical',
          status: 'unresolved',
          createdDate: '2024-01-20',
          resolvedDate: null,
          csatRating: null,
          firstCallResolution: false,
          notes: 'Server response time degradation - urgent'
        },
        {
          id: 'T019',
          customerName: 'Test User 1',
          customerContact: '+1 (555) 111-1111',
          agentName: 'Sarah Smith',
          productCategory: 'Product A',
          type: 'technical',
          status: 'pending',
          createdDate: '2024-01-31',
          resolvedDate: null,
          csatRating: null,
          firstCallResolution: false,
          notes: 'Test ticket for pagination'
        },
        {
          id: 'T020',
          customerName: 'Test User 2',
          customerContact: '+1 (555) 222-2222',
          agentName: 'Mike Johnson',
          productCategory: 'Product B',
          type: 'billing',
          status: 'resolved',
          createdDate: '2024-01-31',
          resolvedDate: '2024-01-31',
          csatRating: 5,
          firstCallResolution: true,
          notes: 'Another test ticket'
        },
        {
          id: 'T021',
          customerName: 'Test User 3',
          customerContact: '+1 (555) 333-3333',
          agentName: 'Emily Davis',
          productCategory: 'Product C',
          type: 'general',
          status: 'in-progress',
          createdDate: '2024-02-01',
          resolvedDate: null,
          csatRating: null,
          firstCallResolution: false,
          notes: 'Third test ticket'
        }
      ]
    }
  },

  created() {
    // Initialize visible columns
    this.visibleColumns = Object.fromEntries(this.columnOptions.map(col => [col.key, true]))
  },

  mounted() {
    document.addEventListener('click', this.handleClickOutside)
  },

  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside)
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
  },

  methods: {
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
      if (this.filterDropdownRef && !this.filterDropdownRef.contains(event.target)) {
        this.showFilterDropdown = false
      }
      if (this.displayDropdownRef && !this.displayDropdownRef.contains(event.target)) {
        this.showDisplayDropdown = false
      }
    },

    // Get status badge class
    getStatusClass(status) {
      const classes = {
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
    }
  }
}
</script>

<style scoped>
/* Force scrollbar visibility */
.overflow-auto::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 6px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* For Firefox */
.overflow-auto {
  scrollbar-width: auto;
}

/* Ensure horizontal scrollbar for table */
.overflow-x-auto::-webkit-scrollbar {
  height: 12px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 6px;
}
</style>