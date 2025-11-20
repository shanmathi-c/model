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

                  <!-- Priority Filter -->
                  <div class="mb-3">
                    <button
                      @click="toggleFilterSection('priority')"
                      class="flex items-center justify-between w-full text-xs font-medium text-gray-700 hover:text-gray-900 py-1"
                    >
                      <span>Priority</span>
                      <img
                        src="/chevron-right.svg"
                        alt="expand"
                        class="w-3 h-3 transition-transform"
                        :class="{ 'rotate-90': expandedSections.priority }"
                      />
                    </button>
                    <div v-if="expandedSections.priority" class="mt-1 space-y-1">
                      <label class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input type="checkbox" value="high" v-model="activeFilters.priority" class="w-3 h-3 text-blue-600 rounded border-gray-300">
                        <span class="text-sm">High</span>
                      </label>
                      <label class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input type="checkbox" value="medium" v-model="activeFilters.priority" class="w-3 h-3 text-blue-600 rounded border-gray-300">
                        <span class="text-sm">Medium</span>
                      </label>
                      <label class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input type="checkbox" value="low" v-model="activeFilters.priority" class="w-3 h-3 text-blue-600 rounded border-gray-300">
                        <span class="text-sm">Low</span>
                      </label>
                    </div>
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
                      <label class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input type="checkbox" value="Product A" v-model="activeFilters.products" class="w-3 h-3 text-blue-600 rounded border-gray-300">
                        <span class="text-sm">Product A</span>
                      </label>
                      <label class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input type="checkbox" value="Product B" v-model="activeFilters.products" class="w-3 h-3 text-blue-600 rounded border-gray-300">
                        <span class="text-sm">Product B</span>
                      </label>
                      <label class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input type="checkbox" value="Product C" v-model="activeFilters.products" class="w-3 h-3 text-blue-600 rounded border-gray-300">
                        <span class="text-sm">Product C</span>
                      </label>
                      <label class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input type="checkbox" value="Service Package 1" v-model="activeFilters.products" class="w-3 h-3 text-blue-600 rounded border-gray-300">
                        <span class="text-sm">Service Package 1</span>
                      </label>
                      <label class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input type="checkbox" value="Service Package 2" v-model="activeFilters.products" class="w-3 h-3 text-blue-600 rounded border-gray-300">
                        <span class="text-sm">Service Package 2</span>
                      </label>
                    </div>
                  </div>

                  <!-- Status Filter -->
                  <div>
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
                    <div v-if="expandedSections.status" class="mt-1 space-y-1">
                      <label class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input type="checkbox" value="unresolved" v-model="activeFilters.status" class="w-3 h-3 text-blue-600 rounded border-gray-300">
                        <span class="text-sm">Unresolved</span>
                      </label>
                      <label class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input type="checkbox" value="pending" v-model="activeFilters.status" class="w-3 h-3 text-blue-600 rounded border-gray-300">
                        <span class="text-sm">Pending</span>
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
            <select
              v-model="bulkAssignAgent"
              class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Select agent"
            >
              <option value="">Select an agent...</option>
              <option
                v-for="agent in availableAgents"
                :key="agent.id"
                :value="agent.id"
              >
                {{ agent.name }} - {{ agent.specialization }}
              </option>
            </select>

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

    <!-- Tickets Container - Centered -->
    <div class="max-w-4xl mx-auto">
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
              <span class="text-lg font-bold text-gray-900">{{ ticket.id }}</span>
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="getPriorityClass(ticket.priority)"
              >
                {{ ticket.priority }}
              </span>
              <span
                class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium"
                :class="getStatusClass(ticket.status)"
              >
                {{ ticket.status }}
              </span>
            </div>
            <span
              class="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
            >
              {{ ticket.type }}
            </span>
          </div>

          <!-- Card Body -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <!-- Customer Info -->
            <div>
              <p class="text-xs font-semibold text-gray-500 mb-1">Customer</p>
              <p class="text-sm font-medium text-gray-900">{{ ticket.customerName }}</p>
              <p class="text-xs text-gray-500">{{ ticket.customerContact }}</p>
            </div>

            <!-- Product Info -->
            <div>
              <p class="text-xs font-semibold text-gray-500 mb-1">Product</p>
              <p class="text-sm text-gray-900">{{ ticket.productCategory }}</p>
            </div>
          </div>

          <!-- Issue Description -->
          <div class="mb-4">
            <p class="text-xs font-semibold text-gray-500 mb-1">Issue Description</p>
            <p class="text-sm text-gray-600">{{ ticket.notes }}</p>
          </div>

          <!-- Assignment Actions -->
          <div class="pt-4 border-t border-gray-100">
            <button
              v-if="!ticket.showAssignment"
              @click="showAssignmentForm(ticket)"
              class="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Assign Ticket
            </button>
            <div v-else class="space-y-3">
              <select
                v-model="ticket.selectedAgent"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select an agent...</option>
                <option
                  v-for="agent in availableAgents"
                  :key="agent.id"
                  :value="agent.id"
                >
                  {{ agent.name }} - {{ agent.specialization }}
                </option>
              </select>
              <div class="flex gap-2">
                <button
                  @click="assignTicket(ticket)"
                  :disabled="!ticket.selectedAgent || ticket.isAssigning"
                  class="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <span v-if="!ticket.isAssigning">Submit Assignment</span>
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
    <div v-if="filteredTickets.length === 0" class="text-center py-12">
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
          <span>Ticket assigned successfully!</span>
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

      // Active filters
      activeFilters: {
        priority: [],
        products: [],
        status: []
      },

      // Expanded sections state
      expandedSections: {
        priority: false,
        product: false,
        status: false
      },

      // States
      showSuccess: false,
      ignoreNextClick: false,
      bulkAssignAgent: null,
      isBulkAssigning: false,

      // Refs
      filterDropdownRef: null,

      // Available agents
      availableAgents: [
        { id: 1, name: 'Sarah Smith', specialization: 'Technical Support' },
        { id: 2, name: 'Mike Johnson', specialization: 'Billing Specialist' },
        { id: 3, name: 'Emily Davis', specialization: 'General Support' },
        { id: 4, name: 'David Lee', specialization: 'Product Expert' },
        { id: 5, name: 'Grace Chen', specialization: 'Technical Support' }
      ],

      // Sample tickets
      tickets: [
        {
          id: 'T001',
          customerName: 'John Doe',
          customerContact: 'john@example.com',
          productCategory: 'Product A',
          type: 'technical',
          status: 'unresolved',
          priority: 'high',
          notes: 'Customer experiencing login issues with the mobile app',
          showAssignment: false,
          selectedAgent: null,
          isAssigning: false,
          selected: false
        },
        {
          id: 'T002',
          customerName: 'Jane Wilson',
          customerContact: '+1 (555) 123-4567',
          productCategory: 'Service Package 1',
          type: 'billing',
          status: 'pending',
          priority: 'medium',
          notes: 'Billing inquiry about subscription renewal',
          showAssignment: false,
          selectedAgent: null,
          isAssigning: false,
          selected: false
        },
        {
          id: 'T003',
          customerName: 'Bob Anderson',
          customerContact: 'bob.anderson@company.com',
          productCategory: 'Product B',
          type: 'general',
          status: 'unresolved',
          priority: 'low',
          notes: 'General inquiry about product features and capabilities',
          showAssignment: false,
          selectedAgent: null,
          isAssigning: false,
          selected: false
        },
        {
          id: 'T004',
          customerName: 'Alice Brown',
          customerContact: '+1 (555) 987-6543',
          productCategory: 'Product C',
          type: 'technical',
          status: 'pending',
          priority: 'high',
          notes: 'Customer cannot access dashboard after recent update',
          showAssignment: false,
          selectedAgent: null,
          isAssigning: false,
          selected: false
        },
        {
          id: 'T005',
          customerName: 'Charlie Green',
          customerContact: 'charlie@startup.io',
          productCategory: 'Service Package 2',
          type: 'feature',
          status: 'unresolved',
          priority: 'low',
          notes: 'Request for API documentation in Spanish language',
          showAssignment: false,
          selectedAgent: null,
          isAssigning: false,
          selected: false
        },
        {
          id: 'T006',
          customerName: 'David Martinez',
          customerContact: '+1 (555) 246-8135',
          productCategory: 'Product A',
          type: 'billing',
          status: 'pending',
          priority: 'medium',
          notes: 'Dispute about recent charge on credit card',
          showAssignment: false,
          selectedAgent: null,
          isAssigning: false,
          selected: false
        }
      ]
    }
  },

  computed: {
    filteredTickets() {
      let result = this.tickets

      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        result = result.filter(ticket =>
          ticket.id.toLowerCase().includes(query) ||
          ticket.customerName.toLowerCase().includes(query) ||
          ticket.customerContact.toLowerCase().includes(query) ||
          ticket.notes.toLowerCase().includes(query)
        )
      }

      // Filter by priority
      if (this.activeFilters.priority.length > 0) {
        result = result.filter(ticket => this.activeFilters.priority.includes(ticket.priority))
      }

      // Filter by products
      if (this.activeFilters.products.length > 0) {
        result = result.filter(ticket => this.activeFilters.products.includes(ticket.productCategory))
      }

      // Filter by status
      if (this.activeFilters.status.length > 0) {
        result = result.filter(ticket => this.activeFilters.status.includes(ticket.status))
      }

      return result
    },

    // Active filter chips for display
    activeFilterChips() {
      const chips = []

      this.activeFilters.priority.forEach(priority => {
        const priorityLabel = priority.charAt(0).toUpperCase() + priority.slice(1)
        chips.push({ key: `priority-${priority}`, label: priorityLabel })
      })

      this.activeFilters.products.forEach(product => {
        chips.push({ key: `product-${product}`, label: product })
      })

      this.activeFilters.status.forEach(status => {
        const statusLabel = status.charAt(0).toUpperCase() + status.slice(1)
        chips.push({ key: `status-${status}`, label: statusLabel })
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
    // Toggle filter dropdown
    toggleFilterDropdown(event) {
      event.preventDefault()
      event.stopPropagation()
      this.ignoreNextClick = true
      this.showFilterDropdown = !this.showFilterDropdown
      // Reset the flag after a short delay
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
        case 'priority':
          const priorityIndex = this.activeFilters.priority.indexOf(value)
          if (priorityIndex > -1) this.activeFilters.priority.splice(priorityIndex, 1)
          break
        case 'product':
          const productIndex = this.activeFilters.products.findIndex(p => p.includes(value))
          if (productIndex > -1) this.activeFilters.products.splice(productIndex, 1)
          break
        case 'status':
          const statusIndex = this.activeFilters.status.findIndex(s => s.includes(value))
          if (statusIndex > -1) this.activeFilters.status.splice(statusIndex, 1)
          break
      }
    },

    // Clear all filters
    clearFilters() {
      this.activeFilters = {
        priority: [],
        products: [],
        status: []
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
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Find the agent details
        const agent = this.availableAgents.find(a => a.id === this.bulkAssignAgent)

        // Assign each selected ticket
        const assignedTickets = []
        this.selectedTickets.forEach(ticket => {
          // Here you would send the data to your backend
          console.log('Assigning ticket:', {
            ticketId: ticket.id,
            agentId: agent.id,
            agentName: agent.name,
            assignedAt: new Date().toISOString()
          })

          // Store assigned ticket for removal
          assignedTickets.push(ticket)
        })

        // Show success message
        this.showSuccess = true
        setTimeout(() => {
          this.showSuccess = false
        }, 3000)

        // Remove assigned tickets from list
        assignedTickets.forEach(ticket => {
          const index = this.tickets.indexOf(ticket)
          if (index > -1) {
            this.tickets.splice(index, 1)
          }
        })

        // Clear selection and agent
        this.clearSelection()

      } catch (error) {
        console.error('Error assigning tickets:', error)
      } finally {
        this.isBulkAssigning = false
      }
    },

    // Show assignment form for a ticket
    showAssignmentForm(ticket) {
      ticket.showAssignment = true
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
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Find the agent details
        const agent = this.availableAgents.find(a => a.id === ticket.selectedAgent)

        // Here you would send the data to your backend
        console.log('Assigning ticket:', {
          ticketId: ticket.id,
          agentId: agent.id,
          agentName: agent.name,
          assignedAt: new Date().toISOString()
        })

        // Show success message
        this.showSuccess = true
        setTimeout(() => {
          this.showSuccess = false
        }, 3000)

        // Remove ticket from list after successful assignment
        const index = this.tickets.indexOf(ticket)
        if (index > -1) {
          this.tickets.splice(index, 1)
        }

      } catch (error) {
        console.error('Error assigning ticket:', error)
      } finally {
        ticket.isAssigning = false
      }
    },

    // Get priority class
    getPriorityClass(priority) {
      const classes = {
        'high': 'bg-red-100 text-red-800',
        'medium': 'bg-yellow-100 text-yellow-800',
        'low': 'bg-green-100 text-green-800'
      }
      return classes[priority] || 'bg-gray-100 text-gray-800'
    },

    // Get status class
    getStatusClass(status) {
      const classes = {
        'unresolved': 'bg-red-100 text-red-700',
        'pending': 'bg-orange-100 text-orange-700',
        'in-progress': 'bg-blue-100 text-blue-700',
        'resolved': 'bg-green-100 text-green-700',
        'closed': 'bg-gray-100 text-gray-700'
      }
      return classes[status] || 'bg-gray-100 text-gray-700'
    }
  },

  mounted() {
    // Add click event listener for closing dropdown
    document.addEventListener('click', this.handleClickOutside)
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

    if (this.showFilterDropdown) {
      const filterDropdown = this.$refs.filterDropdownRef;
      if (filterDropdown && !filterDropdown.contains(event.target)) {
        this.showFilterDropdown = false;
      }
    }
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