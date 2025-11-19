<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-500 to-cyan-600 p-4 flex justify-center items-center relative">
    <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 md:p-10 max-h-[95vh] overflow-y-auto">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-1">Create Call Ticket</h1>
        <p class="text-gray-600 text-sm">Create a ticket for phone call support</p>
      </div>

      <form @submit.prevent="handleSubmit" class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <!-- Customer Name Field -->
        <div :class="{ 'has-error': errors.name }">
          <label for="name" class="block text-xs font-semibold text-gray-700 mb-1.5">
            Customer Name <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            v-model="formData.name"
            class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm transition-all duration-200 bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
            :class="{ 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500 focus:ring-opacity-20 animate-shake': errors.name }"
            placeholder="Enter customer name"
            required
            maxlength="100"
            @input="clearError('name')"
          />
          <div class="mt-1 min-h-4">
            <span v-if="errors.name" class="text-red-500 text-xs animate-slideDown block">{{ errors.name }}</span>
          </div>
        </div>

        <!-- Phone Field -->
        <div :class="{ 'has-error': errors.phone }">
          <label for="phone" class="block text-xs font-semibold text-gray-700 mb-1.5">
            Phone Number <span class="text-red-500">*</span>
          </label>
          <div class="flex gap-0">
            <select
              v-model="formData.countryCode"
              class="px-3 py-2 border-2 border-gray-200 border-r-0 rounded-l-lg text-sm transition-all duration-200 bg-gray-50 min-w-[100px] cursor-pointer appearance-none bg-image-chevron focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 relative z-10"
              :class="{ 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500 focus:ring-opacity-20': errors.phone }"
              required
              @change="clearError('phone')"
            >
              <option value="+1">🇺🇸 +1</option>
              <option value="+44">🇬🇧 +44</option>
              <option value="+91">🇮🇳 +91</option>
              <option value="+86">🇨🇳 +86</option>
              <option value="+81">🇯🇵 +81</option>
              <option value="+49">🇩🇪 +49</option>
              <option value="+33">🇫🇷 +33</option>
              <option value="+39">🇮🇹 +39</option>
              <option value="+34">🇪🇸 +34</option>
              <option value="+61">🇦🇺 +61</option>
              <option value="+7">🇷🇺 +7</option>
              <option value="+55">🇧🇷 +55</option>
              <option value="+52">🇲🇽 +52</option>
              <option value="+27">🇿🇦 +27</option>
              <option value="+82">🇰🇷 +82</option>
              <option value="+31">🇳🇱 +31</option>
              <option value="+46">🇸🇪 +46</option>
              <option value="+47">🇳🇴 +47</option>
              <option value="+971">🇦🇪 +971</option>
              <option value="+65">🇸🇬 +65</option>
            </select>
            <input
              type="tel"
              id="phone"
              v-model="formData.phone"
              class="flex-1 px-3 py-2 border-2 border-gray-200 rounded-r-lg text-sm transition-all duration-200 bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 relative z-10"
              :class="{ 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500 focus:ring-opacity-20 animate-shake': errors.phone }"
              placeholder="123-456-7890"
              required
              @input="handlePhoneInput"
            />
          </div>
          <span v-if="errors.phone" class="text-red-500 text-xs mt-1 block animate-slideDown">{{ errors.phone }}</span>
        </div>

        <!-- Email Field -->
        <div class="md:col-span-2" :class="{ 'has-error': errors.email }">
          <label for="email" class="block text-xs font-semibold text-gray-700 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            v-model="formData.email"
            class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm transition-all duration-200 bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
            :class="{ 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500 focus:ring-opacity-20 animate-shake': errors.email }"
            placeholder="customer@example.com (optional)"
            @input="clearError('email')"
          />
          <span v-if="errors.email" class="text-red-500 text-xs mt-1 block animate-slideDown">{{ errors.email }}</span>
        </div>

        <!-- Call Subject Field -->
        <div class="md:col-span-2" :class="{ 'has-error': errors.subject }">
          <label for="subject" class="block text-xs font-semibold text-gray-700 mb-1.5">
            Call Subject <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="subject"
            v-model="formData.subject"
            class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm transition-all duration-200 bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
            :class="{ 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500 focus:ring-opacity-20 animate-shake': errors.subject }"
            placeholder="Brief summary of the call"
            required
            maxlength="200"
            @input="clearError('subject')"
          />
          <div class="mt-1 min-h-4">
            <span v-if="errors.subject" class="text-red-500 text-xs animate-slideDown block">{{ errors.subject }}</span>
            <span v-else-if="formData.subject.length > 0" class="text-gray-400 text-xs text-right block">{{ formData.subject.length }}/200</span>
          </div>
        </div>

        <!-- Call Notes Field -->
        <div class="md:col-span-2" :class="{ 'has-error': errors.description }">
          <label for="description" class="block text-xs font-semibold text-gray-700 mb-1.5">
            Call Notes <span class="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            v-model="formData.description"
            class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm transition-all duration-200 bg-gray-50 resize-vertical focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 font-sans"
            :class="{ 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500 focus:ring-opacity-20 animate-shake': errors.description }"
            rows="6"
            placeholder="Detailed notes about the call conversation..."
            required
            maxlength="5000"
            @input="clearError('description')"
          ></textarea>
          <div class="mt-1 min-h-4">
            <span v-if="errors.description" class="text-red-500 text-xs animate-slideDown block">{{ errors.description }}</span>
            <span v-else-if="formData.description.length > 0" class="text-gray-400 text-xs text-right block">{{ formData.description.length }}/5000</span>
          </div>
        </div>

        <!-- General Error Message -->
        <div v-if="errors.general" class="md:col-span-2 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-3 animate-slideIn">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p class="font-medium">{{ errors.general }}</p>
        </div>

        <!-- Submit Button -->
        <div class="md:col-span-2 flex justify-center">
          <button
            type="submit"
            class="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-8 py-3 rounded-lg font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/25 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            :disabled="isSubmitting"
          >
            <span v-if="!isSubmitting" class="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              Save Call Ticket
            </span>
            <span v-else class="flex items-center justify-center gap-2">
              <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </span>
          </button>
        </div>

          </form>

      <!-- Success Modal -->
      <div v-if="showSuccess" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-slideUp">
          <div class="text-center">
            <!-- Success Icon -->
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>

            <h2 class="text-2xl font-bold text-gray-900 mb-2">Call Ticket Saved!</h2>
            <p class="text-gray-600 mb-6">The call ticket has been successfully saved to the system.</p>

            <!-- Ticket Details -->
            <div v-if="ticketDetails" class="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 class="font-semibold text-gray-800 mb-3">Ticket Details</h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Ticket ID:</span>
                  <span class="font-mono font-semibold text-blue-600">{{ ticketDetails.ticketId }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Customer Name:</span>
                  <span class="text-gray-900">{{ ticketDetails.name }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Email:</span>
                  <span class="text-gray-900">{{ ticketDetails.email || 'Not provided' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Phone:</span>
                  <span class="text-gray-900">{{ ticketDetails.phone }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Subject:</span>
                  <span class="text-gray-900 truncate max-w-[200px]">{{ ticketDetails.subject }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Type:</span>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Phone Call
                  </span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3">
              <button
                @click="createNewTicket"
                class="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Create New Ticket
              </button>
              <button
                @click="closeModal"
                class="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
definePageMeta({
  layout: false
})

export default {
  name: 'CallTicket',

  data() {
    return {
      // Form data
      formData: {
        productId: null,  // Not required for call tickets
        name: '',
        email: '',
        countryCode: '+1',
        phone: '',
        subject: '',
        description: '',
        ticketType: 'call'  // Fixed for call page
      },

      // Form states
      isSubmitting: false,
      showSuccess: false,

      // Success modal
      ticketDetails: null,

      // Error states
      errors: {
        name: '',
        email: '',
        phone: '',
        subject: '',
        description: '',
        general: ''
      }
    }
  },

  methods: {
    // Handle form submission
    async handleSubmit() {
      // Clear previous errors
      this.clearErrors()

      // Validate form
      if (!this.validateForm()) {
        return
      }

      this.isSubmitting = true

      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

        // Sanitize form data
        const sanitizedData = this.sanitizeFormData()

        // Submit call ticket using call-tickets endpoint
        const response = await fetch('http://localhost:5001/call-tickets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify(sanitizedData),
          signal: controller.signal
        })
        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `Server error: ${response.status}`)
        }

        const result = await response.json()

        // Store ticket details for modal
        this.ticketDetails = {
          ticketId: result.data.ticketId,
          name: this.formData.name,
          email: this.formData.email,
          phone: this.formData.countryCode + ' ' + this.formData.phone,
          subject: this.formData.subject,
          ticketType: 'call'
        }

        // Show success modal
        this.showSuccess = true

      } catch (error) {
        console.error('Error submitting call ticket:', error)

        if (error.name === 'AbortError') {
          this.setError('general', 'Request timed out. Please try again.')
        } else if (error.message.includes('Failed to fetch')) {
          this.setError('general', 'Network error. Please check your connection and try again.')
        } else {
          this.setError('general', error.message || 'Error saving call ticket. Please try again.')
        }
      } finally {
        this.isSubmitting = false
      }
    },

    // Validate form (no product validation for calls)
    validateForm() {
      let isValid = true

      // Name validation
      if (!this.formData.name.trim()) {
        this.setError('name', 'Name is required')
        isValid = false
      } else if (this.formData.name.trim().length < 2) {
        this.setError('name', 'Name must be at least 2 characters')
        isValid = false
      }

      // Email validation (optional for calls)
      if (this.formData.email && !this.validateEmail(this.formData.email)) {
        this.setError('email', 'Please enter a valid email address')
        isValid = false
      }

      // Phone validation
      if (!this.formData.phone.trim()) {
        this.setError('phone', 'Phone number is required')
        isValid = false
      } else {
        const cleanPhone = this.cleanPhoneNumber(this.formData.phone)
        if (cleanPhone.length < 7) {
          this.setError('phone', 'Phone number must be at least 7 digits')
          isValid = false
        }
      }

      // Subject validation
      if (!this.formData.subject.trim()) {
        this.setError('subject', 'Subject is required')
        isValid = false
      } else if (this.formData.subject.trim().length < 3) {
        this.setError('subject', 'Subject must be at least 3 characters')
        isValid = false
      }

      // Description validation
      if (!this.formData.description.trim()) {
        this.setError('description', 'Call notes are required')
        isValid = false
      } else if (this.formData.description.trim().length < 10) {
        this.setError('description', 'Call notes must be at least 10 characters')
        isValid = false
      }

      return isValid
    },

    // Sanitize form data
    sanitizeFormData() {
      return {
        name: this.sanitizeText(this.formData.name),
        email: this.formData.email ? this.formData.email.toLowerCase().trim() : '',
        countryCode: this.formData.countryCode,
        phone: this.cleanPhoneNumber(this.formData.phone),
        subject: this.sanitizeText(this.formData.subject),
        description: this.sanitizeText(this.formData.description),
        ticketType: 'call'
      }
    },

    // Sanitize text input
    sanitizeText(text) {
      return text
        .trim()
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .slice(0, 5000)
    },

    // Clean phone number
    cleanPhoneNumber(phone) {
      return phone.replace(/\D/g, '')
    },

    // Handle phone input
    handlePhoneInput(event) {
      this.clearError('phone')
      let value = event.target.value
      value = value.replace(/[^\d\s\-\(\)]/g, '')
      this.formData.phone = value
    },

    // Validate email
    validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return re.test(email)
    },

    // Error handling methods
    setError(field, message) {
      this.errors[field] = message
    },

    clearErrors() {
      Object.keys(this.errors).forEach(key => {
        this.errors[key] = ''
      })
    },

    clearError(field) {
      this.errors[field] = ''
    },

    // Reset form to initial state
    resetForm() {
      this.formData = {
        productId: null,
        name: '',
        email: '',
        countryCode: '+1',
        phone: '',
        subject: '',
        description: '',
        ticketType: 'call'
      }
    },

    // Modal methods
    createNewTicket() {
      // Reset form and close modal
      this.resetForm()
      this.showSuccess = false
      this.ticketDetails = null
    },

    closeModal() {
      // Just close the modal
      this.showSuccess = false
      this.ticketDetails = null
    }
  }
}
</script>

<style scoped>
/* Custom animations */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

.animate-slideDown {
  animation: slideDown 0.2s ease-out;
}

.animate-slideIn {
  animation: slideIn 0.3s ease-out;
}

.animate-shake {
  animation: shake 0.3s ease-in-out;
}

/* Modal animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

.animate-slideUp {
  animation: slideUp 0.3s ease-out;
}
</style>