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

    <!-- Scrollable Content Area -->
    <div class="flex-1 overflow-auto scrollbar-thin" style="height: calc(130vh - 360px);">
        <!-- Table View -->
        <div class="overflow-x-auto scrollbar-thin" style="height: 100%;">
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
          <div v-if="filteredTickets.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No tickets found</h3>
            <p class="mt-1 text-sm text-gray-500">Try adjusting your search or filters</p>
          </div>
    </div>

    <!-- Fixed Pagination Controls -->
    <div class="flex-shrink-0 px-4 py-4 mt-4 bg-white border-t border-gray-200 sticky bottom-0">
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
      itemsPerPage: 10,

      // Data from backend
      tickets: [],
      allAgents: [],
      allProducts: []
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
          this.tickets = response.data.map(ticket => ({
            id: ticket.ticketId || ticket.id,
            customerName: ticket.name || '-',
            customerContact: ticket.email || ticket.phone || '-',
            phone: ticket.phone || '-',
            agentName: ticket.assignedAgentName || ticket.agentName || '-',
            productCategory: ticket.productName || 'No Product',
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
/* Thin scrollbar for all elements */
::-webkit-scrollbar {
  width: 4px !important;
  height: 4px !important;
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

/* For Firefox */
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
