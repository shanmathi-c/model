<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-4 flex justify-center items-center">
    <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 md:p-10 max-h-[95vh] overflow-y-auto relative">
      <!-- Callback Request Button -->
      <button
        @click="handleDirectCallbackRequest"
        class="absolute top-4 right-4 z-50 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-green-500/25"
        :disabled="isSubmittingCallback"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
        <span v-if="!isSubmittingCallback" class="font-medium">Request Callback</span>
        <span v-else class="flex items-center justify-center gap-2">
          <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Processing...
        </span>
      </button>
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-1">Create Support Ticket</h1>
        <p class="text-gray-600 text-sm">Fill out the form below and we'll get back to you as soon as possible</p>
      </div>

      <!-- Offline Indicator -->
      <div v-if="isOffline" class="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg mb-6 flex items-center gap-3 text-sm animate-slideDown">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0">
          <path d="M1 1l22 22"></path>
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
          <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
          <path d="M1.42 9a16 16 0 0 1 2.58-3.94"></path>
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
          <line x1="12" y1="20" x2="12.01" y2="20"></line>
        </svg>
        <span>You're offline. Your data will be saved locally.</span>
      </div>

      <form @submit.prevent="handleSubmit" class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <!-- Product Selection -->
        <div class="md:col-span-2" :class="{ 'has-error': errors.product }">
          <label for="product" class="block text-xs font-semibold text-gray-700 mb-1.5">
            Select Product <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <select
              id="product"
              v-model="formData.productId"
              class="w-full px-3 py-2 pr-10 border-2 border-gray-200 rounded-lg text-sm transition-all duration-200 bg-gray-50 appearance-none cursor-pointer focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20"
              :class="{ 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500 focus:ring-opacity-20': errors.product }"
              required
              @change="clearError('product')"
            >
              <option value="" disabled>Select a product</option>
              <option
                v-for="product in products"
                :key="product.id"
                :value="product.id"
              >
                {{ product.productName }}
              </option>
            </select>
            <svg class="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
          <span v-if="errors.product" class="text-red-500 text-xs mt-1 block animate-slideDown">{{ errors.product }}</span>
        </div>

        <!-- Name Field -->
        <div :class="{ 'has-error': errors.name }">
          <label for="name" class="block text-xs font-semibold text-gray-700 mb-1.5">
            Full Name <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            v-model="formData.name"
            class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm transition-all duration-200 bg-gray-50 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20"
            :class="{ 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500 focus:ring-opacity-20 animate-shake': errors.name }"
            placeholder="Enter your full name"
            required
            maxlength="100"
            @input="clearError('name')"
          />
          <div class="mt-1 min-h-4">
            <span v-if="errors.name" class="text-red-500 text-xs animate-slideDown block">{{ errors.name }}</span>
          </div>
        </div>

        <!-- Email Field -->
        <div :class="{ 'has-error': errors.email }">
          <label for="email" class="block text-xs font-semibold text-gray-700 mb-1.5">
            Email Address <span class="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            v-model="formData.email"
            class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm transition-all duration-200 bg-gray-50 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20"
            :class="{ 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500 focus:ring-opacity-20 animate-shake': errors.email }"
            placeholder="email@example.com"
            required
            @input="clearError('email')"
          />
          <span v-if="errors.email" class="text-red-500 text-xs mt-1 block animate-slideDown">{{ errors.email }}</span>
        </div>

        <!-- Phone Field -->
        <div :class="{ 'has-error': errors.phone }">
          <label for="phone" class="block text-xs font-semibold text-gray-700 mb-1.5">
            Phone Number <span class="text-red-500">*</span>
          </label>
          <div class="flex gap-0">
            <select
              v-model="formData.countryCode"
              class="px-3 py-2 border-2 border-gray-200 border-r-0 rounded-l-lg text-sm transition-all duration-200 bg-gray-50 min-w-[100px] cursor-pointer appearance-none bg-image-chevron focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 relative z-10"
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
              class="flex-1 px-3 py-2 border-2 border-gray-200 rounded-r-lg text-sm transition-all duration-200 bg-gray-50 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 relative z-10"
              :class="{ 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500 focus:ring-opacity-20 animate-shake': errors.phone }"
              placeholder="123-456-7890"
              required
              @input="handlePhoneInput"
            />
          </div>
          <span v-if="errors.phone" class="text-red-500 text-xs mt-1 block animate-slideDown">{{ errors.phone }}</span>
        </div>

        <!-- Subject Field -->
        <div :class="{ 'has-error': errors.subject }">
          <label for="subject" class="block text-xs font-semibold text-gray-700 mb-1.5">
            Subject <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="subject"
            v-model="formData.subject"
            class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm transition-all duration-200 bg-gray-50 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20"
            :class="{ 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500 focus:ring-opacity-20 animate-shake': errors.subject }"
            placeholder="Brief description of your issue"
            required
            maxlength="200"
            @input="clearError('subject')"
          />
          <div class="mt-1 min-h-4">
            <span v-if="errors.subject" class="text-red-500 text-xs animate-slideDown block">{{ errors.subject }}</span>
          </div>
        </div>

        <!-- Description Field -->
        <div class="md:col-span-2" :class="{ 'has-error': errors.description }">
          <label for="description" class="block text-xs font-semibold text-gray-700 mb-1.5">
            Description <span class="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            v-model="formData.description"
            class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm transition-all duration-200 bg-gray-50 resize-vertical focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 font-sans"
            :class="{ 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500 focus:ring-opacity-20 animate-shake': errors.description }"
            rows="6"
            placeholder="Please provide detailed information about your issue or request..."
            required
            maxlength="5000"
            @input="clearError('description')"
          ></textarea>
          <div class="mt-1 min-h-4">
            <span v-if="errors.description" class="text-red-500 text-xs animate-slideDown block">{{ errors.description }}</span>
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

        <!-- Retry Indicator -->
        <div v-if="isRetrying" class="md:col-span-2 text-amber-600 text-sm flex items-center gap-2">
          <div class="w-4 h-4 border-2 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
          Retrying... ({{ retryCount }}/{{ maxRetries }})
        </div>

        <!-- Submit Button -->
        <div class="md:col-span-2 flex justify-center">
          <button
            type="submit"
            class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/25 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            :disabled="isSubmitting"
          >
            <span v-if="!isSubmitting" class="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 2L11 13"></path>
                <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
              </svg>
              Submit Ticket
            </span>
            <span v-else class="flex items-center justify-center gap-2">
              <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Submitting...
            </span>
          </button>
        </div>

        <!-- Auto-save Indicator -->
        <div v-if="lastSaveTime" class="md:col-span-2 text-gray-500 text-xs text-right opacity-70">
          Last saved: {{ formatTime(lastSaveTime) }}
        </div>

            </form>

      <!-- Success Message -->
      <div v-if="showSuccess && !showSuccessModal" class="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg animate-slideInRight">
        <div class="flex items-center gap-2">
          <!-- Success Icon -->
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>

          <div>
            <span class="font-medium">Success! </span>
            <span v-if="ticketDetails && ticketDetails.type === 'callback'">
              Callback requested successfully
            </span>
            <span v-else>
              Ticket created successfully
            </span>
            <span v-if="ticketDetails && ticketDetails.status" class="inline-block ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
              {{ ticketDetails.status === 'callback requested' ? 'CALLBACK REQUESTED' : ticketDetails.status.toUpperCase() }}
            </span>
            <span v-if="ticketDetails && ticketDetails.ticketId" class="font-mono text-sm ml-2">(ID: {{ ticketDetails.ticketId }})</span>
            <span v-if="ticketDetails && ticketDetails.callbackId" class="font-mono text-sm ml-2">(ID: {{ ticketDetails.callbackId }})</span>
          </div>
        </div>
      </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto transform transition-all animate-slideUp relative">
        <!-- Close Button - Top Right -->
        <button
          @click="closeSuccessModal"
          class="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
          title="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-600">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <!-- Success Icon and Title -->
        <div class="text-center mb-6 pr-12">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Callback Requested!</h2>
          <p class="text-gray-600">Your callback request has been successfully submitted.</p>
        </div>

        <!-- Landscape Layout Content -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Left Column - Customer Details -->
          <div v-if="ticketDetails" class="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 class="font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">Customer Details</h3>

            <!-- Callback ID -->
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Callback ID:</span>
              <span class="text-sm font-mono font-semibold text-blue-600">#{{ ticketDetails.callbackId }}</span>
            </div>

            <!-- Customer Name -->
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Name:</span>
              <span class="text-sm font-medium text-gray-900">{{ ticketDetails.name }}</span>
            </div>

            <!-- Email -->
            <div v-if="ticketDetails.email" class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Email:</span>
              <span class="text-sm text-gray-900">{{ ticketDetails.email }}</span>
            </div>

            <!-- Phone -->
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Phone:</span>
              <span class="text-sm font-medium text-gray-900">{{ ticketDetails.phone }}</span>
            </div>

            <!-- Subject -->
            <div v-if="ticketDetails.subject" class="flex justify-between items-start">
              <span class="text-sm text-gray-600">Subject:</span>
              <span class="text-sm text-gray-900 text-right max-w-[60%]">{{ ticketDetails.subject }}</span>
            </div>

            <!-- Status Badge -->
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Status:</span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {{ ticketDetails.status === 'callback requested' ? 'CALLBACK REQUESTED' : ticketDetails.status.toUpperCase() }}
              </span>
            </div>

            <!-- Expected Response Time -->
            <div class="bg-blue-50 rounded-lg p-3 mt-4">
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span class="text-sm text-blue-800">We'll call you back within 24 hours</span>
              </div>
            </div>
          </div>

          <!-- Right Column - Agent & Call Controls -->
          <div class="space-y-4">
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
                  <span class="text-sm font-medium text-indigo-900">{{ getAgentName() }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-indigo-700">Agent Phone:</span>
                  <span class="text-sm font-medium text-indigo-900">{{ getAgentPhone() }}</span>
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
            <div v-if="assignedAgent" class="space-y-3">
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
                  @click="cancelCallback"
                  class="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  Cancel
                </button>
              </div>

              <!-- Connecting State -->
              <div v-else-if="callStatus === 'connecting'" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div class="flex items-center gap-3">
                  <div class="w-6 h-6 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                  <div>
                    <p class="text-sm font-medium text-yellow-800">Connecting to agent...</p>
                    <p class="text-xs text-yellow-600">Please wait while we connect you to {{ getAgentName() }}</p>
                  </div>
                </div>
                <!-- Cancel button while connecting -->
                <button
                  @click="cancelCallback"
                  class="w-full mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  Cancel Connection
                </button>
              </div>

              <!-- Missed State - No buttons available -->
              <div v-else-if="callStatus === 'missed'" class="bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="flex items-center gap-3">
                  <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div>
                    <p class="text-sm font-medium text-red-800">Call Missed</p>
                    <p class="text-xs text-red-600">The call was disconnected</p>
                  </div>
                </div>
              </div>

              <!-- Connected State -->
              <div v-else-if="callStatus === 'connected'" class="bg-green-50 border border-green-200 rounded-lg p-4">
                <div class="flex items-center gap-3">
                  <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <p class="text-sm font-medium text-green-800">Call Connected</p>
                    <p class="text-xs text-green-600">You are now connected with {{ getAgentName() }}</p>
                  </div>
                </div>
                <!-- Call Control Buttons in Connected State -->
                <div class="mt-3 flex gap-3">
                  <button
                    @click="endCall"
                    class="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    End Call
                  </button>
                  <button
                    @click="disconnectCall"
                    class="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-1M8 21a2 2 0 002-2v-1c0-8.284-6.716-15-15-15h-1a2 2 0 00-2 2v1"></path>
                    </svg>
                    Disconnect
                  </button>
                </div>

                <!-- Call Recording Status -->
                <div v-if="currentCallLog" class="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polygon points="10 8 16 12 10 16 10 8"></polygon>
                      </svg>
                      <span class="text-sm font-medium text-blue-900">Recording</span>
                    </div>
                    <div class="text-right">
                      <p class="text-xs text-blue-700">Call ID: {{ currentCallLog.id }}</p>
                      <p class="text-xs text-blue-600" :class="getRecordingStatusClass()">
                        {{ getRecordingStatusText() }}
                      </p>
                    </div>
                  </div>
                  <div class="mt-2 text-xs text-blue-700">
                    <p><strong>Started:</strong> {{ currentCallLog.startTime || 'Not started' }}</p>
                    <p v-if="currentCallLog.endTime"><strong>Duration:</strong> {{ formatDuration(currentCallLog.duration) }}</p>
                    <p v-if="currentCallLog.recordingUrl" class="break-all"><strong>Recording:</strong> {{ currentCallLog.recordingUrl }}</p>
                  </div>
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

<script setup>
definePageMeta({
  layout: false
})
</script>

<script>
export default {
  name: 'CreateTicket',

  data() {
    return {
      // Form data
      formData: {
        productId: '',  // Store productId instead of productName
        userId: null,   // Add userId field - initialize as null
        name: '',
        email: '',
        countryCode: '+1',
        phone: '',
        subject: '',
        description: '',
        ticketType: 'freshdesk'  // Default for create page
      },

      // Form states
      isSubmitting: false,
      showSuccess: false,
      products: [],

      // Success modal
      ticketDetails: null,
      showSuccessModal: false,
      assignedAgent: null,
      callStatus: 'pending', // pending, connecting, connected, ended, cancelled, disconnected
      currentCallLog: null, // Store current call log data

      // Error states
      errors: {
        product: '',
        name: '',
        email: '',
        phone: '',
        subject: '',
        description: '',
        general: ''
      },

      // Network state
      isRetrying: false,
      retryCount: 0,
      maxRetries: 3,

      // UI states
      isOffline: false,
      lastSaveTime: null,
      autoSaveEnabled: true,

      // Auto-save interval ref (will be set in setupAutoSave)
      autoSaveInterval: null,

      // Callback state
      isSubmittingCallback: false,
    }
  },

  mounted() {
    // Component mounted
    console.log('Create ticket form loaded')

    // Load saved form data
    this.loadSavedFormData()

    // Always clear product selection to show placeholder
    this.formData.productId = ''

    // Fetch products
    this.fetchProducts()

    // Setup network listeners
    this.setupNetworkListeners()

    // Setup auto-save
    this.setupAutoSave()

    // Handle page visibility
    this.setupVisibilityHandler()
  },

  beforeUnmount() {
    // Cleanup when component unmounts
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
      this.autoSaveInterval = null
    }

    if (this.onlineHandler) {
      window.removeEventListener('online', this.onlineHandler)
    }

    if (this.offlineHandler) {
      window.removeEventListener('offline', this.offlineHandler)
    }

    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler)
    }

    // Save form data before leaving
    this.saveFormData()
  },

  methods: {
    // Fetch products from backend
    async fetchProducts() {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

        const response = await fetch('http://localhost:5001/products', {
          signal: controller.signal
        })
        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        if (result.data && Array.isArray(result.data)) {
          this.products = result.data.filter(product =>
            product && product.id && product.productName
          )
          console.log('Products loaded:', this.products)
        } else {
          throw new Error('Invalid products data format')
        }

      } catch (error) {
        console.error('Error fetching products:', error)

        if (error.name === 'AbortError') {
          this.setError('general', 'Request timed out. Please check your connection.')
        } else if (error.message.includes('Failed to fetch')) {
          this.setError('general', 'Unable to connect to server. Please check your internet connection.')
          this.isOffline = true
        } else {
          this.setError('general', 'Error loading products. Please refresh the page.')
        }

        // Load fallback products if available
        this.loadFallbackProducts()
      }
    },

    // Load fallback products
    loadFallbackProducts() {
      this.products = [
        { id: 1, productName: 'Product A' },
        { id: 2, productName: 'Product B' },
        { id: 3, productName: 'Service Package 1' },
        { id: 4, productName: 'Service Package 2' },
        { id: 5, productName: 'Other' }
      ]
    },

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

        // Store form data before submission since we'll clear it
        const formDataForSubmission = {
          name: this.formData.name,
          email: this.formData.email,
          phone: this.formData.countryCode + ' ' + this.formData.phone,
          subject: this.formData.subject,
          ticketType: 'freshdesk'
        }

        // Sanitize form data
        const sanitizedData = this.sanitizeFormData()

        // Submit ticket
        const response = await fetch('http://localhost:5001/new-tickets', {
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

        // Clear old ticket details immediately
        this.ticketDetails = null

        // Clear form IMMEDIATELY after successful submission
        this.resetForm()
        this.clearSavedFormData()

        // Close any existing modal first
        this.showSuccess = false
        await this.$nextTick()

        // Store NEW ticket details using stored form data
        this.ticketDetails = {
          ticketId: result.data && result.data.ticketId ? result.data.ticketId : null,
          name: formDataForSubmission.name,
          email: formDataForSubmission.email,
          phone: formDataForSubmission.phone,
          subject: formDataForSubmission.subject,
          status: 'created',
          ticketType: 'freshdesk'
        }

        // Show success message
        this.showSuccess = true

        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          this.showSuccess = false
        }, 3000)

      } catch (error) {
        console.error('Error submitting ticket:', error)

        if (error.name === 'AbortError') {
          this.setError('general', 'Request timed out. Please try again.')
        } else if (error.message.includes('Failed to fetch')) {
          this.setError('general', 'Network error. Please check your connection and try again.')
          this.isOffline = true
        } else if (error.message.includes('429')) {
          this.setError('general', 'Too many requests. Please wait a moment before trying again.')
        } else {
          this.setError('general', error.message || 'Error submitting ticket. Please try again.')
        }

        // Auto-retry for network errors
        if (this.shouldRetry(error) && this.retryCount < this.maxRetries) {
          await this.retrySubmission()
        }
      } finally {
        this.isSubmitting = false
      }
    },

    // Reset form to initial state
    resetForm() {
      this.formData = {
        productId: '',  // Always empty to show placeholder
        userId: this.generateUserId(),  // Keep or generate userId
        name: '',
        email: '',
        countryCode: '+1',
        phone: '',
        subject: '',
        description: '',
        ticketType: 'freshdesk'
      }
    },

    // Format date for display (optional helper method)
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' }
      return new Date(dateString).toLocaleDateString(undefined, options)
    },

    // Validate email format (optional helper method)
    validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return re.test(email)
    },

    // Validate phone format (optional helper method)
    validatePhone(phone) {
      const re = /^[\d\s\-\+\(\)]+$/
      return re.test(phone)
    },

    // Validate form
    validateForm() {
      let isValid = true

      // Product validation
      if (!this.formData.productId) {
        this.setError('product', 'Please select a product')
        isValid = false
      }

      // Name validation
      if (!this.formData.name.trim()) {
        this.setError('name', 'Name is required')
        isValid = false
      } else if (this.formData.name.trim().length < 2) {
        this.setError('name', 'Name must be at least 2 characters')
        isValid = false
      } else if (this.formData.name.trim().length > 100) {
        this.setError('name', 'Name must be less than 100 characters')
        isValid = false
      } else if (!/^[a-zA-Z\s\-'.]+$/.test(this.formData.name)) {
        this.setError('name', 'Name can only contain letters, spaces, hyphens, apostrophes, and periods')
        isValid = false
      }

      // Email validation
      if (!this.formData.email.trim()) {
        this.setError('email', 'Email is required')
        isValid = false
      } else if (!this.validateEmail(this.formData.email)) {
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
        } else if (cleanPhone.length > 15) {
          this.setError('phone', 'Phone number is too long')
          isValid = false
        } else if (!/^\d+$/.test(cleanPhone)) {
          this.setError('phone', 'Phone number can only contain digits')
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
      } else if (this.formData.subject.trim().length > 200) {
        this.setError('subject', 'Subject must be less than 200 characters')
        isValid = false
      }

      // Description validation
      if (!this.formData.description.trim()) {
        this.setError('description', 'Description is required')
        isValid = false
      } else if (this.formData.description.trim().length < 10) {
        this.setError('description', 'Description must be at least 10 characters')
        isValid = false
      } else if (this.formData.description.trim().length > 5000) {
        this.setError('description', 'Description must be less than 5000 characters')
        isValid = false
      }

      return isValid
    },

    // Sanitize form data
    sanitizeFormData() {
      return {
        productId: this.formData.productId,
        name: this.sanitizeText(this.formData.name),
        email: this.formData.email.toLowerCase().trim(),
        countryCode: this.formData.countryCode,
        phone: this.cleanPhoneNumber(this.formData.phone),
        subject: this.sanitizeText(this.formData.subject),
        description: this.sanitizeText(this.formData.description),
        ticketType: 'freshdesk'
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

    // Generate a sequential userId
    generateUserId() {
      // Get the last used userId from localStorage
      let lastUserId = parseInt(localStorage.getItem('lastUserId') || '0')

      // Increment to get the new userId
      let newUserId = lastUserId + 1

      // Save the new userId back to localStorage
      localStorage.setItem('lastUserId', newUserId.toString())

      // Also save the current userId for this user
      localStorage.setItem('currentUserId', newUserId.toString())

      return newUserId
    },

    // Format phone number as user types
    formatPhoneNumber() {
      const cleanPhone = this.cleanPhoneNumber(this.formData.phone)
      const countryCode = this.formData.countryCode

      // Basic formatting for US numbers
      if (countryCode === '+1' && cleanPhone.length === 10) {
        this.formData.phone = `(${cleanPhone.slice(0, 3)}) ${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6)}`
      }
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

    // Retry logic
    shouldRetry(error) {
      return (error && error.message && (
        error.message.includes('Failed to fetch') ||
        error.message.includes('Network error') ||
        error.message.includes('timeout')
      ))
    },

    async retrySubmission() {
      this.isRetrying = true
      this.retryCount++

      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, this.retryCount), 10000)

      await new Promise(resolve => setTimeout(resolve, delay))

      try {
        await this.handleSubmit()
      } catch (error) {
        if (this.retryCount >= this.maxRetries) {
          this.setError('general', 'Failed to submit after multiple attempts. Please check your connection and try again.')
        }
      } finally {
        this.isRetrying = false
      }
    },

    // Form data persistence
    saveFormData() {
      if (!this.autoSaveEnabled) return

      try {
        const dataToSave = {
          ...this.formData,
          timestamp: Date.now()
        }
        localStorage.setItem('ticketFormData', JSON.stringify(dataToSave))
        this.lastSaveTime = new Date()
      } catch (error) {
        console.warn('Failed to save form data:', error)
      }
    },

    loadSavedFormData() {
      try {
        const savedData = localStorage.getItem('ticketFormData')
        if (savedData) {
          const parsed = JSON.parse(savedData)
          const oneHour = 60 * 60 * 1000

          // Only load if less than an hour old
          if (Date.now() - parsed.timestamp < oneHour) {
            // Restore all fields
            this.formData = { ...this.formData, ...parsed }
            delete this.formData.timestamp // Remove timestamp from formData

            // Ensure userId is a number if it exists
            if (this.formData.userId) {
              this.formData.userId = parseInt(this.formData.userId)
              console.log('Loaded userId from localStorage:', this.formData.userId)
            }
          }
        }
      } catch (error) {
        console.warn('Failed to load saved form data:', error)
      }
    },

    clearSavedFormData() {
      try {
        localStorage.removeItem('ticketFormData')
      } catch (error) {
        console.warn('Failed to clear saved form data:', error)
      }
    },

    // Auto-save setup
    setupAutoSave() {
      if (!this.autoSaveEnabled) return

      // Save every 30 seconds
      this.autoSaveInterval = setInterval(() => {
        this.saveFormData()
      }, 30000)
    },

    // Network listeners
    setupNetworkListeners() {
      this.onlineHandler = () => {
        this.isOffline = false
        this.clearError('general')
        // Retry fetching products if we're back online
        if (this.products.length === 0) {
          this.fetchProducts()
        }
      }

      this.offlineHandler = () => {
        this.isOffline = true
        this.setError('general', 'You appear to be offline. Your data will be saved locally.')
      }

      window.addEventListener('online', this.onlineHandler)
      window.addEventListener('offline', this.offlineHandler)

      // Check initial online status
      this.isOffline = !navigator.onLine
    },

    // Page visibility handler
    setupVisibilityHandler() {
      this.visibilityHandler = () => {
        if (document.hidden) {
          // Page is hidden, save form data
          this.saveFormData()
        }
      }

      document.addEventListener('visibilitychange', this.visibilityHandler)
    },

    // Handle phone input with formatting
    handlePhoneInput(event) {
      this.clearError('phone')

      // Allow only numbers, spaces, dashes, parentheses
      let value = event.target.value
      value = value.replace(/[^\d\s\-\(\)]/g, '')
      this.formData.phone = value

      // Format phone number for US numbers
      this.$nextTick(() => {
        this.formatPhoneNumber()
      })
    },

    // Format time for display
    formatTime(date) {
      if (!date) return ''
      // ensure date is a Date object
      const d = (date instanceof Date) ? date : new Date(date)
      const now = new Date()
      const diff = now - d

      if (diff < 60000) {
        return 'Just now'
      } else if (diff < 3600000) {
        const mins = Math.floor(diff / 60000)
        return `${mins} minute${mins > 1 ? 's' : ''} ago`
      } else {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    },

    // Handle direct callback request without modal
    async handleDirectCallbackRequest() {
      // Clear any previous errors
      this.clearErrors()

      // Validate required form fields
      if (!this.validateFormForCallback()) {
        return
      }

      this.isSubmittingCallback = true

      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        // Send ALL form data
        const callbackPayload = {
          productId: this.formData.productId || null,
          name: this.formData.name,
          email: this.formData.email || null,
          countryCode: this.formData.countryCode,
          phone: this.cleanPhoneNumber(this.formData.phone),
          subject: this.formData.subject,
          description: this.formData.description,
          status: 'inbound'  // Add status as inbound
        }

        const response = await fetch('http://localhost:5001/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify(callbackPayload),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `Server error: ${response.status}`)
        }

        const result = await response.json()

        // Fetch and assign agent based on productId
        await this.assignAgentToCallback(callbackPayload.productId)

        // Show success modal
        this.showSuccess = true
        this.showSuccessModal = true
        this.ticketDetails = {
          callbackId: result.data && result.data.callbackId ? result.data.callbackId : null,
          name: this.formData.name,
          email: this.formData.email,
          phone: this.formData.countryCode + ' ' + this.formData.phone,
          subject: this.formData.subject,
          status: 'callback requested',
          type: 'callback',
          productId: callbackPayload.productId
        }

        // Clear form after successful callback request
        this.resetForm()
        this.clearSavedFormData()

        // Auto-hide success message (notification) after 3 seconds, but keep modal open
        setTimeout(() => {
          this.showSuccess = false
        }, 3000)

      } catch (error) {
        console.error('Error submitting callback request:', error)

        if (error.name === 'AbortError') {
          this.setError('general', 'Request timed out. Please try again.')
        } else if (error.message.includes('Failed to fetch')) {
          this.setError('general', 'Network error. Please check your connection and try again.')
          this.isOffline = true
        } else {
          this.setError('general', error.message || 'Error submitting callback request. Please try again.')
        }
      } finally {
        this.isSubmittingCallback = false
      }
    },

    // Close success modal
    closeSuccessModal() {
      this.showSuccessModal = false
      this.ticketDetails = null
      this.assignedAgent = null
      this.callStatus = 'pending'
      this.currentCallLog = null
    },

    // Print callback details
    printCallbackDetails() {
      if (!this.ticketDetails) return

      const printContent = `
        Callback Request Details
        =========================

        Callback ID: #${this.ticketDetails.callbackId}
        Name: ${this.ticketDetails.name}
        Email: ${this.ticketDetails.email || 'N/A'}
        Phone: ${this.ticketDetails.phone}
        Subject: ${this.ticketDetails.subject || 'N/A'}
        Status: ${this.ticketDetails.status}

        Expected Response: Within 24 hours
        Request Date: ${new Date().toLocaleDateString()}
      `

      const printWindow = window.open('', '_blank')
      printWindow.document.write(`
        <html>
          <head>
            <title>Callback Request Details</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
              h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
              .detail { margin: 10px 0; }
              .label { font-weight: bold; display: inline-block; min-width: 150px; }
              .footer { margin-top: 30px; font-style: italic; color: #666; }
            </style>
          </head>
          <body>
            <pre>${printContent}</pre>
            <div class="footer">This is a system-generated callback request confirmation.</div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    },

    // Assign agent to callback based on productId
    async assignAgentToCallback(productId) {
      // Default agent fallback
      const defaultAgent = {
        name: 'Support Agent',
        phone: '+1-800-SUPPORT',
        id: 'default-agent'
      }

      if (!productId) {
        console.log('No productId provided, assigning default agent')
        this.assignedAgent = defaultAgent
        return
      }

      try {
        console.log(`Fetching agents for productId: ${productId}`)
        const response = await fetch(`http://localhost:5001/agents/product/${productId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const result = await response.json()
          console.log('Agents response:', result)

          if (result.data && result.data.length > 0) {
            // Randomly select one agent from available agents
            const randomIndex = Math.floor(Math.random() * result.data.length)
            const selectedAgent = result.data[randomIndex]

            console.log(`Selected agent:`, selectedAgent)

            // Preserve all fields from the agent response
            this.assignedAgent = {
              ...selectedAgent,
              // Ensure we have an ID field
              id: selectedAgent.id || selectedAgent.agentId || randomIndex
            }

            // Log the assigned agent for debugging
            console.log('Assigned agent with all fields:', this.assignedAgent)
            console.log('Agent phone number field check:', {
              agentNumber: this.assignedAgent.agentNumber,
              phoneNumber: this.assignedAgent.phoneNumber,
              phone: this.assignedAgent.phone,
              contactNumber: this.assignedAgent.contactNumber,
              mobile: this.assignedAgent.mobile
            })
          } else {
            console.log('No agents found for this product, using default')
            this.assignedAgent = defaultAgent
          }
        } else {
          console.error(`Error fetching agents: ${response.status}`)
          this.assignedAgent = defaultAgent
        }
      } catch (error) {
        console.error('Error assigning agent:', error)
        this.assignedAgent = defaultAgent
      }
    },

    // Get call status CSS class
    getCallStatusClass() {
      const statusClasses = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'connecting': 'bg-blue-100 text-blue-800',
        'connected': 'bg-green-100 text-green-800',
        'ended': 'bg-gray-100 text-gray-800',
        'cancelled': 'bg-red-100 text-red-800',
        'disconnected': 'bg-red-100 text-red-800'
      }
      return statusClasses[this.callStatus] || 'bg-gray-100 text-gray-800'
    },

    // Get call status text
    getCallStatusText() {
      const statusTexts = {
        'pending': 'Pending',
        'connecting': 'Connecting...',
        'connected': 'Connected',
        'ended': 'Ended',
        'cancelled': 'Cancelled',
        'disconnected': 'Disconnected'
      }
      return statusTexts[this.callStatus] || 'Unknown'
    },

    // Get agent name with multiple field support
    getAgentName() {
      if (!this.assignedAgent) {
        return 'Not Assigned'
      }

      return this.assignedAgent.name ||
             this.assignedAgent.agentName ||
             this.assignedAgent.fullName ||
             this.assignedAgent.displayName ||
             'Not Assigned'
    },

    // Get agent phone with multiple field support
    getAgentPhone() {
      if (!this.assignedAgent) {
        return 'Not Available'
      }

      // Check multiple possible field names for phone number
      const phoneNumber = this.assignedAgent.agentNumber ||
                        this.assignedAgent.phoneNumber ||
                        this.assignedAgent.contactNumber ||
                        this.assignedAgent.mobile ||
                        this.assignedAgent.phone

      if (phoneNumber) {
        return phoneNumber
      } else {
        return 'Not Available'
      }
    },

    // Get recording status CSS class
    getRecordingStatusClass() {
      if (!this.currentCallLog) return ''

      // Since calls table doesn't have recordingStatus, show based on callStatus
      const statusClasses = {
        'ongoing': 'text-yellow-700 font-medium', // Call is active, recording
        'completed': 'text-green-700 font-medium', // Call ended, recording ready
        'missed': 'text-gray-500', // Call missed, no recording
        'cancelled': 'text-gray-500' // Call cancelled, no recording
      }
      return statusClasses[this.currentCallLog.callStatus] || 'text-gray-500'
    },

    // Get recording status text
    getRecordingStatusText() {
      if (!this.currentCallLog) return ''

      // Since calls table doesn't have recordingStatus, show based on callStatus
      const statusTexts = {
        'ongoing': 'Recording...',
        'completed': 'Ready',
        'missed': 'Not Recorded',
        'cancelled': 'Not Recorded'
      }
      return statusTexts[this.currentCallLog.callStatus] || 'Unknown'
    },

    // Format duration in HH:MM:SS
    formatDuration(seconds) {
      if (!seconds || seconds === 0) return '0:00'

      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60

      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`
      }
    },

    // Start call
    async startCall() {
      this.callStatus = 'connecting'

      try {
        // Create call log entry when call starts
        const response = await fetch('http://localhost:5001/calls', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify({
            callbackId: this.ticketDetails.callbackId,
            ticketId: 0, // No ticketId from callback form, use 0
            agentId: this.assignedAgent.id || this.assignedAgent.agentId,
            agentName: this.getAgentName(),
            agentNumber: this.getAgentPhone(),
            customerPhone: this.ticketDetails.phone,
            customerName: this.ticketDetails.name,
            productId: this.ticketDetails.productId || null,
            subject: this.ticketDetails.subject || 'Callback request from customer',
            callType: 'inbound' // Customer requests callback, so inbound
          })
        })

        if (response.ok) {
          const result = await response.json()
          this.currentCallLog = result.data
          console.log('Call log created:', result.data)

          // Simulate connection time and then set to connected
          setTimeout(() => {
            this.callStatus = 'connected'
            console.log('Call connected, recording:', this.currentCallLog.recordingUrl)
          }, 2000)
        } else {
          console.error('Error creating call log:', response.statusText)
          this.callStatus = 'pending'
        }
      } catch (error) {
        console.error('Error starting call:', error)
        this.callStatus = 'pending'
      }
    },

    // End call
    async endCall() {
      this.callStatus = 'closed' // Set to closed to disable all buttons

      try {
        // Update call log with end time and duration
        if (this.currentCallLog && this.currentCallLog.callId) {
          const response = await fetch(`http://localhost:5001/calls/${this.currentCallLog.callId}/end`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            }
          })

          if (response.ok) {
            const result = await response.json()
            console.log('Call ended successfully:', result.data)
            // Update current call log with end data
            this.currentCallLog = { ...this.currentCallLog, ...result.data }
          } else {
            console.error('Error ending call:', response.statusText)
          }
        }

        // Update callback status in backend
        if (this.ticketDetails && this.ticketDetails.callbackId) {
          const callDuration = this.currentCallLog ? this.currentCallLog.duration : Math.floor(Math.random() * 600)

          await fetch(`http://localhost:5001/callback/${this.ticketDetails.callbackId}/status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              status: 'completed',
              agentName: this.getAgentName(),
              callDuration: callDuration,
              recordingUrl: this.currentCallLog?.recordingUrl
            })
          })
        }
      } catch (error) {
        console.error('Error in endCall:', error)
      }
    },

    // End call
    async endCall() {
      this.callStatus = 'closed' // Set to closed to disable all buttons

      try {
        // Update call log with end time and duration
        if (this.currentCallLog && this.currentCallLog.callId) {
          const response = await fetch(`http://localhost:5001/calls/${this.currentCallLog.callId}/end`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            }
          })

          if (response.ok) {
            const result = await response.json()
            console.log('Call ended successfully:', result.data)
            // Update current call log with end data
            this.currentCallLog = { ...this.currentCallLog, ...result.data }
          } else {
            console.error('Error ending call:', response.statusText)
          }
        }

        // Update callback status in backend
        if (this.ticketDetails && this.ticketDetails.callbackId) {
          const callDuration = this.currentCallLog ? this.currentCallLog.duration : Math.floor(Math.random() * 600)

          await fetch(`http://localhost:5001/callback/${this.ticketDetails.callbackId}/status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              status: 'completed',
              agentName: this.getAgentName(),
              callDuration: callDuration,
              recordingUrl: this.currentCallLog?.recordingUrl
            })
          })
        }
      } catch (error) {
        console.error('Error in endCall:', error)
      }
    },

    // Disconnect call
    async disconnectCall() {
      this.callStatus = 'missed' // Set to missed to hide all buttons

      try {
        // Mark call as missed in calls table (null start/end times)
        if (this.currentCallLog && this.currentCallLog.callId) {
          const response = await fetch(`http://localhost:5001/calls/${this.currentCallLog.callId}/missed`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            }
          })

          if (response.ok) {
            const result = await response.json()
            console.log('Call marked as missed:', result.data)
          } else {
            console.error('Error marking call as missed:', response.statusText)
          }
        }

        // Update callback status in backend
        if (this.ticketDetails && this.ticketDetails.callbackId) {
          await fetch(`http://localhost:5001/callback/${this.ticketDetails.callbackId}/status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              status: 'disconnected',
              agentName: this.getAgentName(),
              reason: 'User disconnected the call'
            })
          })
        }
      } catch (error) {
        console.error('Error in disconnectCall:', error)
      }

      // Show alert message that call is missed
      alert('Call is missed')
    },

    // Cancel callback
    cancelCallback() {
      this.callStatus = 'cancelled'

      // Update callback status in backend
      if (this.ticketDetails && this.ticketDetails.callbackId) {
        fetch(`http://localhost:5001/callback/${this.ticketDetails.callbackId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: 'cancelled'
          })
        }).catch(error => {
          console.error('Error cancelling callback:', error)
        })
      }
    },

    // Validate form for callback (similar to validateForm but without product requirement)
    validateFormForCallback() {
      let isValid = true

      // Name validation
      if (!this.formData.name.trim()) {
        this.setError('name', 'Name is required for callback request')
        isValid = false
      } else if (this.formData.name.trim().length < 2) {
        this.setError('name', 'Name must be at least 2 characters')
        isValid = false
      } else if (this.formData.name.trim().length > 100) {
        this.setError('name', 'Name must be less than 100 characters')
        isValid = false
      }

      // Email validation (optional for callbacks)
      if (this.formData.email.trim() && !this.validateEmail(this.formData.email)) {
        this.setError('email', 'Please enter a valid email address')
        isValid = false
      }

      // Phone validation
      if (!this.formData.phone.trim()) {
        this.setError('phone', 'Phone number is required for callback')
        isValid = false
      } else {
        const cleanPhone = this.cleanPhoneNumber(this.formData.phone)
        if (cleanPhone.length < 7) {
          this.setError('phone', 'Phone number must be at least 7 digits')
          isValid = false
        } else if (cleanPhone.length > 15) {
          this.setError('phone', 'Phone number is too long')
          isValid = false
        }
      }

      // Subject validation
      if (!this.formData.subject.trim()) {
        this.setError('subject', 'Subject is required for callback request')
        isValid = false
      } else if (this.formData.subject.trim().length < 3) {
        this.setError('subject', 'Subject must be at least 3 characters')
        isValid = false
      }

      // Description validation
      if (!this.formData.description.trim()) {
        this.setError('description', 'Description is required for callback request')
        isValid = false
      } else if (this.formData.description.trim().length < 10) {
        this.setError('description', 'Description must be at least 10 characters')
        isValid = false
      }

      return isValid
    }
  },

  computed: {
    // Check if form is valid (computed)
    isFormValid() {
      return (
        this.formData.productId &&
        this.formData.name &&
        this.formData.email &&
        this.formData.phone &&
        this.formData.subject &&
        this.formData.description &&
        this.validateEmail(this.formData.email) &&
        this.validatePhone(this.formData.phone)
      )
    },

    // Get selected product label (use productId)
    selectedProductLabel() {
      const productMap = {
        '1': 'Product A',
        '2': 'Product B',
        '3': 'Service Package 1',
        '4': 'Service Package 2',
        '5': 'Other'
      }
      // If your product IDs are numeric, ensure string conversion for lookup
      return productMap[String(this.formData.productId)] || ''
    }
  },

  watch: {
    // Watch for changes in email
    'formData.email'(newVal) {
      if (newVal && !this.validateEmail(newVal)) {
        console.log('Invalid email format')
      }
    },

    // Watch for changes in phone
    'formData.phone'(newVal) {
      if (newVal && !this.validatePhone(newVal)) {
        console.log('Invalid phone format')
      }
    }
  }
}
</script>

<style scoped>
/* Success message animation */
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Modal animation */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slideUp {
  animation: slideUp 0.3s ease-out;
}

.animate-slideInRight {
  animation: slideInRight 0.3s ease-out;
}
</style>