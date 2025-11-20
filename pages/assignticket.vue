<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- Header -->
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Assign Tickets to Agents</h1>
      <p class="text-gray-600">View all unassigned tickets and assign them to support agents</p>
    </div>

    <!-- Search and Filter Section -->
    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex flex-col gap-3">
        <!-- First Row: Search Bar, Filter, and Assign Controls -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <!-- Select All Checkbox -->
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                :checked="allTicketsSelected"
                :indeterminate="someTicketsSelected"
                @change="toggleSelectAll"
                class="w-4 h-4 text-blue-600 rounded border-gray-300"
              />
              <span class="text-sm font-medium text-gray-700">
                {{ selectedTickets.length > 0 ? `${selectedTickets.length} selected` : 'Select All' }}
              </span>
            </label>

            <!-- Search Bar -->
            <div class="relative w-80">
              <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by ticket ID, customer, keywords..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <!-- Filter Button -->
            <div class="relative" ref="filterDropdownRef">
              <button
                @click="toggleFilterDropdown($event)"
                class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                :class="{ 'bg-blue-50 border-blue-500': hasActiveFilters }"
              >
                <img src="/filter.svg" alt="filter" class="w-4 h-4" />
                <span class="text-sm font-medium">Filter</span>
              </button>

              <!-- Filter Dropdown -->
              <div
                v-if="showFilterDropdown"
                class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-96 overflow-y-auto"
              >
                <div class="p-3">
                  <div class="flex items-center justify-between mb-3">
                    <h3 class="text-sm font-semibold text-gray-900">Filters</h3>
                    <button
                      v-if="hasActiveFilters"
                      @click="clearFilters"
                      onclick="event.stopPropagation()"
                      class="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Clear All
                    </button>
                  </div>

                  <!-- Product Filter -->
                  <div class="mb-3">
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
                    <div v-if="expandedSections.product" class="mt-1 space-y-1">
                      <label v-for="product in products" :key="product.id" class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input type="checkbox" :value="product.productName" v-model="activeFilters.products" class="w-3 h-3 text-blue-600 rounded border-gray-300">
                        <span class="text-sm">{{ product.productName }}</span>
                      </label>
                    </div>
                  </div>

                  <!-- Ticket Type Filter -->
                  <div>
                    <button
                      @click="toggleFilterSection('type')"
                      class="flex items-center justify-between w-full text-xs font-medium text-gray-700 hover:text-gray-900 py-1"
                    >
                      <span>Ticket Type</span>
                      <img
                        src="/chevron-right.svg"
                        alt="expand"
                        class="w-3 h-3 transition-transform"
                        :class="{ 'rotate-90': expandedSections.type }"
                      />
                    </button>
                    <div v-if="expandedSections.type" class="mt-1 space-y-1">
                      <label class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input type="checkbox" value="freshdesk" v-model="activeFilters.type" class="w-3 h-3 text-blue-600 rounded border-gray-300">
                        <span class="text-sm">Freshdesk</span>
                      </label>
                      <label class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input type="checkbox" value="call" v-model="activeFilters.type" class="w-3 h-3 text-blue-600 rounded border-gray-300">
                        <span class="text-sm">Call</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Assign Controls (visible when tickets are selected) -->
          <div v-if="selectedTickets.length > 0" class="flex items-center gap-3">
            <!-- Agent Selection for Bulk Assign -->
            <div class="w-80">
              <div class="relative" ref="bulkAgentDropdown">
                <button
                  @click="toggleBulkAgentDropdown"
                  class="w-full px-3 py-2 pr-10 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-all duration-200 text-left"
                >
                  <span v-if="!bulkAssignAgent" class="text-gray-400">Select agent...</span>
                  <span v-else class="flex items-center gap-2">
                    <span>{{ allAvailableAgents.find(a => a.id == bulkAssignAgent)?.agentName || allAvailableAgents.find(a => a.id == bulkAssignAgent)?.name }}</span>
                    <span v-if="allAvailableAgents.find(a => a.id == bulkAssignAgent)?.team" class="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {{ allAvailableAgents.find(a => a.id == bulkAssignAgent)?.team }}
                    </span>
                  </span>
                </button>
                <!-- Custom dropdown arrow -->
                <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
                <!-- Dropdown options -->
                <div
                  v-if="showBulkAgentDropdown"
                  class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                  <div
                    v-for="agent in allAvailableAgents"
                    :key="agent.id"
                    @click="selectBulkAgent(agent.id)"
                    class="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-sm text-gray-900">{{ agent.agentName || agent.name }}</span>
                      <span v-if="agent.team" class="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {{ agent.team }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Bulk Assign Button -->
            <button
              @click="bulkAssignTickets"
              :disabled="!bulkAssignAgent || isBulkAssigning"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="!isBulkAssigning">Assign {{ selectedTickets.length }} Ticket(s)</span>
              <span v-else>Assigning...</span>
            </button>

            <!-- Clear Selection -->
            <button
              @click="clearSelection"
              class="px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Selection
            </button>
          </div>
        </div>

        <!-- Active Filter Chips -->
        <div v-if="hasActiveFilters" class="flex gap-1.5 flex-wrap items-center">
          <span
            v-for="chip in activeFilterChips"
            :key="chip.key"
            class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full border border-blue-200"
          >
            {{ chip.label }}
            <button
              @click.stop="removeFilter(chip.key)"
              class="hover:text-blue-900 rounded-full w-4 h-4 flex items-center justify-center transition-colors"
            >
              ×
            </button>
          </span>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="max-w-4xl mx-auto text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">Loading tickets...</p>
    </div>

    <!-- Tickets Container - Centered -->
    <div v-else class="max-w-4xl mx-auto">
      <div class="grid gap-4">
        <!-- Ticket Card -->
        <div
          v-for="ticket in filteredTickets"
          :key="ticket.id"
          class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          :class="{ 'ring-2 ring-blue-500 border-blue-500': ticket.selected }"
        >
          <!-- Card Header -->
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div class="flex items-center gap-3">
              <!-- Selection Checkbox -->
              <input
                type="checkbox"
                :value="ticket.id"
                v-model="ticket.selected"
                class="w-4 h-4 text-blue-600 rounded border-gray-300 cursor-pointer"
              />
              <span class="text-lg font-bold text-gray-900">{{ ticket.ticketId }}</span>
              <span
                class="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
              >
                {{ ticket.ticketType || 'freshdesk' }}
              </span>
            </div>
          </div>

          <!-- Card Body -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <!-- Customer Info -->
            <div>
              <p class="text-xs font-semibold text-gray-500 mb-1">Customer</p>
              <p class="text-sm font-medium text-gray-900">{{ ticket.name }}</p>
              <p class="text-xs text-gray-500">{{ ticket.email || ticket.phone }}</p>
            </div>

            <!-- Product Info -->
            <div>
              <p class="text-xs font-semibold text-gray-500 mb-1">Product</p>
              <p class="text-sm text-gray-900">{{ ticket.productName || 'No Product' }}</p>
            </div>
          </div>

          <!-- Subject -->
          <div class="mb-4">
            <p class="text-xs font-semibold text-gray-500 mb-1">Subject</p>
            <p class="text-sm text-gray-900">{{ ticket.subject }}</p>
          </div>

          <!-- Issue Description -->
          <div class="mb-4">
            <p class="text-xs font-semibold text-gray-500 mb-1">Description</p>
            <p class="text-sm text-gray-600">{{ ticket.description }}</p>
          </div>

          <!-- Assignment Actions -->
          <div class="pt-4 border-t border-gray-100">
            <button
              v-if="!ticket.showAssignment"
              @click="showAssignmentForm(ticket)"
              class="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Assign Ticket
            </button>
            <div v-else class="space-y-3">
              <!-- Loading agents for this product -->
              <div v-if="ticket.loadingAgents" class="text-center py-2">
                <div class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span class="ml-2 text-sm text-gray-600">Loading agents...</span>
              </div>
              <!-- Agent selection -->
              <div v-else>
                <p class="text-xs font-medium text-gray-700 mb-2">Available agents for {{ ticket.productName }}:</p>
                <div class="w-full max-w-lg">
                  <div class="relative" :ref="`ticketAgentDropdown-${ticket.id}`">
                    <button
                      @click="toggleTicketAgentDropdown(ticket)"
                      class="w-full px-3 py-2 pr-10 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-all duration-200 text-left"
                    >
                      <span v-if="!ticket.selectedAgent" class="text-gray-400">Select agent...</span>
                      <span v-else class="flex items-center gap-2">
                        <span>{{ ticket.availableAgents.find(a => a.id == ticket.selectedAgent)?.agentName || ticket.availableAgents.find(a => a.id == ticket.selectedAgent)?.name }}</span>
                        <span v-if="ticket.availableAgents.find(a => a.id == ticket.selectedAgent)?.team" class="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {{ ticket.availableAgents.find(a => a.id == ticket.selectedAgent)?.team }}
                        </span>
                      </span>
                    </button>
                    <!-- Custom dropdown arrow -->
                    <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                    <!-- Dropdown options -->
                    <div
                      v-if="ticket.showAgentDropdown"
                      class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    >
                      <div
                        v-for="agent in ticket.availableAgents"
                        :key="agent.id"
                        @click="selectTicketAgent(ticket, agent.id)"
                        class="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div class="flex items-center gap-2 flex-wrap">
                          <span class="text-sm text-gray-900">{{ agent.agentName || agent.name }}</span>
                          <span v-if="agent.team" class="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {{ agent.team }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="ticket.availableAgents && ticket.availableAgents.length === 0" class="text-xs text-gray-500 mt-1">
                  No available agents for this product
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  @click="assignTicket(ticket)"
                  :disabled="!ticket.selectedAgent || ticket.isAssigning"
                  class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <span v-if="!ticket.isAssigning">Submit</span>
                  <span v-else>Assigning...</span>
                </button>
                <button
                  @click="cancelAssignment(ticket)"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && filteredTickets.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
      <p class="text-gray-500">Try adjusting your search or filters</p>
    </div>

    <!-- Success Message -->
    <transition name="fade">
      <div v-if="showSuccess" class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{{ successMessage }}</span>
        </div>
      </div>
    </transition>

    <!-- Error Message -->
    <transition name="fade">
      <div v-if="showError" class="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>{{ errorMessage }}</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
definePageMeta({
  layout: false
})

export default {
  name: 'AssignTicket',

  data() {
    return {
      // Search and filters
      searchQuery: '',
      showFilterDropdown: false,
      loading: false,

      // Active filters
      activeFilters: {
        products: [],
        type: []
      },

      // Expanded sections state
      expandedSections: {
        product: false,
        type: false
      },

      // States
      showSuccess: false,
      showError: false,
      successMessage: '',
      errorMessage: '',
      ignoreNextClick: false,
      bulkAssignAgent: null,
      isBulkAssigning: false,
      showBulkAgentDropdown: false,

      // Refs
      filterDropdownRef: null,

      // Data from backend
      tickets: [],
      products: [],
      allAvailableAgents: []
    }
  },

  computed: {
    filteredTickets() {
      let result = this.tickets

      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        result = result.filter(ticket =>
          ticket.ticketId.toLowerCase().includes(query) ||
          ticket.name.toLowerCase().includes(query) ||
          (ticket.email && ticket.email.toLowerCase().includes(query)) ||
          (ticket.phone && ticket.phone.toLowerCase().includes(query)) ||
          ticket.subject.toLowerCase().includes(query) ||
          ticket.description.toLowerCase().includes(query)
        )
      }

      // Filter by products
      if (this.activeFilters.products.length > 0) {
        result = result.filter(ticket =>
          ticket.productName && this.activeFilters.products.includes(ticket.productName)
        )
      }

      // Filter by ticket type
      if (this.activeFilters.type.length > 0) {
        result = result.filter(ticket =>
          this.activeFilters.type.includes(ticket.ticketType || 'freshdesk')
        )
      }

      return result
    },

    // Active filter chips for display
    activeFilterChips() {
      const chips = []

      this.activeFilters.products.forEach(product => {
        chips.push({ key: `product-${product}`, label: product })
      })

      this.activeFilters.type.forEach(type => {
        const typeLabel = type.charAt(0).toUpperCase() + type.slice(1)
        chips.push({ key: `type-${type}`, label: typeLabel })
      })

      return chips
    },

    // Check if any filters are active
    hasActiveFilters() {
      return this.activeFilterChips.length > 0
    },

    // Get selected tickets
    selectedTickets() {
      return this.tickets.filter(ticket => ticket.selected)
    },

    // Check if all tickets are selected
    allTicketsSelected() {
      return this.filteredTickets.length > 0 && this.filteredTickets.every(ticket => ticket.selected)
    },

    // Check if some (but not all) tickets are selected
    someTicketsSelected() {
      const selected = this.filteredTickets.filter(ticket => ticket.selected).length
      return selected > 0 && selected < this.filteredTickets.length
    }
  },

  methods: {
    // Fetch data from backend
    async fetchTickets() {
      this.loading = true
      try {
        const response = await $fetch('http://localhost:5001/unassigned-tickets')
        if (response.data) {
          // Add reactive properties to each ticket
          this.tickets = response.data.map(ticket => ({
            ...ticket,
            selected: false,
            showAssignment: false,
            selectedAgent: null,
            isAssigning: false,
            loadingAgents: false,
            availableAgents: null,
            showAgentDropdown: false
          }))
        }
      } catch (error) {
        console.error('Error fetching tickets:', error)
        this.showError = true
        this.errorMessage = 'Failed to load tickets'
        setTimeout(() => {
          this.showError = false
        }, 3000)
      } finally {
        this.loading = false
      }
    },

    async fetchProducts() {
      try {
        const response = await $fetch('http://localhost:5001/products')
        if (response.data) {
          this.products = response.data
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      }
    },

    async fetchAllAvailableAgents() {
      try {
        // This would ideally be a new endpoint to get all available agents
        // For now, we'll fetch agents for each product as needed
        const agents = []
        for (const product of this.products) {
          try {
            const response = await $fetch(`http://localhost:5001/agents/product/${product.id}`)
            if (response.data) {
              agents.push(...response.data)
            }
          } catch (error) {
            console.error(`Error fetching agents for product ${product.id}:`, error)
          }
        }
        this.allAvailableAgents = agents
      } catch (error) {
        console.error('Error fetching agents:', error)
      }
    },

    async fetchAgentsForProduct(ticket) {
      if (!ticket.productId) {
        ticket.availableAgents = []
        ticket.loadingAgents = false
        return
      }

      ticket.loadingAgents = true
      try {
        const response = await $fetch(`http://localhost:5001/agents/product/${ticket.productId}`)
        if (response.data) {
          ticket.availableAgents = response.data
        } else {
          ticket.availableAgents = []
        }
      } catch (error) {
        console.error('Error fetching agents:', error)
        ticket.availableAgents = []
      } finally {
        ticket.loadingAgents = false
      }
    },

    // Toggle bulk agent dropdown
    toggleBulkAgentDropdown() {
      this.showBulkAgentDropdown = !this.showBulkAgentDropdown
    },

    // Select bulk agent
    selectBulkAgent(agentId) {
      this.bulkAssignAgent = agentId
      this.showBulkAgentDropdown = false
    },

    // Toggle ticket agent dropdown
    toggleTicketAgentDropdown(ticket) {
      ticket.showAgentDropdown = !ticket.showAgentDropdown
    },

    // Select ticket agent
    selectTicketAgent(ticket, agentId) {
      ticket.selectedAgent = agentId
      ticket.showAgentDropdown = false
    },

    // Toggle filter dropdown
    toggleFilterDropdown(event) {
      event.preventDefault()
      event.stopPropagation()
      this.ignoreNextClick = true
      this.showFilterDropdown = !this.showFilterDropdown
      setTimeout(() => {
        this.ignoreNextClick = false
      }, 100)
    },

    // Toggle filter section
    toggleFilterSection(section) {
      this.expandedSections[section] = !this.expandedSections[section]
    },

    // Remove individual filter
    removeFilter(chipKey) {
      const [type, value] = chipKey.split('-')

      switch(type) {
        case 'product':
          const productIndex = this.activeFilters.products.findIndex(p => p.includes(value))
          if (productIndex > -1) this.activeFilters.products.splice(productIndex, 1)
          break
        case 'type':
          const typeIndex = this.activeFilters.type.findIndex(t => t.includes(value))
          if (typeIndex > -1) this.activeFilters.type.splice(typeIndex, 1)
          break
      }
    },

    // Clear all filters
    clearFilters() {
      this.activeFilters = {
        products: [],
        type: []
      }
    },

    // Toggle select all tickets
    toggleSelectAll() {
      const allSelected = this.allTicketsSelected
      this.filteredTickets.forEach(ticket => {
        ticket.selected = !allSelected
      })
    },

    // Clear ticket selection
    clearSelection() {
      this.tickets.forEach(ticket => {
        ticket.selected = false
      })
      this.bulkAssignAgent = null
    },

    // Bulk assign tickets
    async bulkAssignTickets() {
      if (!this.bulkAssignAgent || this.selectedTickets.length === 0) return

      this.isBulkAssigning = true

      try {
        const ticketIds = this.selectedTickets.map(t => t.id)
        const response = await $fetch('http://localhost:5001/bulk-assign', {
          method: 'POST',
          body: {
            ticketIds: ticketIds,
            agentId: this.bulkAssignAgent
          }
        })

        if (response.message) {
          this.showSuccess = true
          this.successMessage = `Successfully assigned ${response.data?.assignedCount || ticketIds.length} tickets`
          setTimeout(() => {
            this.showSuccess = false
          }, 3000)

          // Remove assigned tickets from list
          this.selectedTickets.forEach(ticket => {
            const index = this.tickets.indexOf(ticket)
            if (index > -1) {
              this.tickets.splice(index, 1)
            }
          })

          // Clear selection and agent
          this.clearSelection()
        }
      } catch (error) {
        console.error('Error assigning tickets:', error)
        this.showError = true
        this.errorMessage = 'Failed to assign tickets'
        setTimeout(() => {
          this.showError = false
        }, 3000)
      } finally {
        this.isBulkAssigning = false
      }
    },

    // Show assignment form for a ticket
    async showAssignmentForm(ticket) {
      ticket.showAssignment = true
      if (ticket.productId && !ticket.availableAgents) {
        await this.fetchAgentsForProduct(ticket)
      }
    },

    // Cancel assignment
    cancelAssignment(ticket) {
      ticket.showAssignment = false
      ticket.selectedAgent = null
    },

    // Assign ticket to agent
    async assignTicket(ticket) {
      if (!ticket.selectedAgent) return

      ticket.isAssigning = true

      try {
        const response = await $fetch('http://localhost:5001/assign', {
          method: 'POST',
          body: {
            ticketId: ticket.id,
            agentId: ticket.selectedAgent
          }
        })

        if (response.message) {
          this.showSuccess = true
          this.successMessage = 'Ticket assigned successfully'
          setTimeout(() => {
            this.showSuccess = false
          }, 3000)

          // Remove ticket from list after successful assignment
          const index = this.tickets.indexOf(ticket)
          if (index > -1) {
            this.tickets.splice(index, 1)
          }
        }
      } catch (error) {
        console.error('Error assigning ticket:', error)
        this.showError = true
        this.errorMessage = 'Failed to assign ticket'
        setTimeout(() => {
          this.showError = false
        }, 3000)
      } finally {
        ticket.isAssigning = false
      }
    }
  },

  async mounted() {
    // Add click event listener for closing dropdown
    document.addEventListener('click', this.handleClickOutside)

    // Fetch initial data
    await this.fetchTickets()
    await this.fetchProducts()
    await this.fetchAllAvailableAgents()
  },

  beforeUnmount() {
    // Clean up event listener
    document.removeEventListener('click', this.handleClickOutside)
  },

  // Handle click outside dropdown
  handleClickOutside(event) {
    // Skip if we just clicked the filter button
    if (this.ignoreNextClick) {
      return
    }

    // Close filter dropdown
    if (this.showFilterDropdown) {
      const filterDropdown = this.$refs.filterDropdownRef;
      if (filterDropdown && !filterDropdown.contains(event.target)) {
        this.showFilterDropdown = false;
      }
    }

    // Close bulk agent dropdown
    if (this.showBulkAgentDropdown) {
      const bulkAgentDropdown = this.$refs.bulkAgentDropdown;
      if (bulkAgentDropdown && !bulkAgentDropdown.contains(event.target)) {
        this.showBulkAgentDropdown = false;
      }
    }

    // Close ticket agent dropdowns
    this.tickets.forEach(ticket => {
      if (ticket.showAgentDropdown) {
        const ticketDropdown = this.$refs[`ticketAgentDropdown-${ticket.id}`];
        if (ticketDropdown && ticketDropdown.length > 0 && !ticketDropdown[0].contains(event.target)) {
          ticket.showAgentDropdown = false;
        }
      }
    });
  }
}
</script>

<style>
/* Vue transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>