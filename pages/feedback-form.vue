<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Loading feedback form...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-500 mx-auto mb-4">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Error</h2>
        <p class="text-gray-600">{{ error }}</p>
      </div>

      <!-- Success State -->
      <div v-else-if="submitted" class="text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-500 mx-auto mb-4">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
        <p class="text-gray-600">Your feedback has been submitted successfully.</p>
      </div>

      <!-- Feedback Form -->
      <div v-else>
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">We Value Your Feedback</h1>
          <p class="text-gray-600">Help us improve our service by sharing your experience</p>
        </div>

        <!-- Ticket Information -->
        <div class="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
          <h3 class="text-sm font-semibold text-blue-900 mb-3">Ticket Details</h3>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p class="text-blue-600 font-medium">Ticket ID</p>
              <p class="text-gray-900">{{ ticketInfo.ticketId || 'N/A' }}</p>
            </div>
            <div>
              <p class="text-blue-600 font-medium">Product</p>
              <p class="text-gray-900">{{ ticketInfo.productName || 'N/A' }}</p>
            </div>
            <div>
              <p class="text-blue-600 font-medium">Type</p>
              <p class="text-gray-900">{{ ticketInfo.ticketType || 'N/A' }}</p>
            </div>
            <div>
              <p class="text-blue-600 font-medium">Agent</p>
              <p class="text-gray-900">{{ ticketInfo.agentName || 'N/A' }}</p>
            </div>
          </div>
        </div>

        <!-- Rating Section -->
        <div class="mb-6">
          <label class="block text-sm font-semibold text-gray-900 mb-3">
            How would you rate our service?
          </label>
          <div class="flex justify-center gap-2 mb-2">
            <button
              v-for="star in 5"
              :key="star"
              @click="rating = star"
              class="focus:outline-none transition-transform hover:scale-110"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                :fill="star <= rating ? '#fbbf24' : 'none'"
                stroke="#fbbf24"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </button>
          </div>
          <div class="text-center">
            <span v-if="rating > 0" class="text-sm font-medium text-gray-700">
              {{ ratingLabels[rating - 1] }}
            </span>
            <span v-else class="text-sm text-gray-500">Click to rate</span>
          </div>
        </div>

        <!-- Comments Section -->
        <div class="mb-6">
          <label class="block text-sm font-semibold text-gray-900 mb-2">
            Additional Comments (Optional)
          </label>
          <textarea
            v-model="comments"
            rows="4"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Tell us more about your experience..."
          ></textarea>
        </div>

        <!-- Submit Button -->
        <button
          @click="submitFeedback"
          :disabled="rating === 0 || submitting"
          class="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <span v-if="submitting">Submitting...</span>
          <span v-else>Submit Feedback</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

// Disable default layout for this page
definePageMeta({
  layout: false
})

const route = useRoute()

const loading = ref(true)
const error = ref(null)
const submitted = ref(false)
const submitting = ref(false)

const feedbackId = ref(null)
const ticketInfo = ref({})
const rating = ref(0)
const comments = ref('')

const ratingLabels = [
  'Poor',
  'Below Average',
  'Average',
  'Good',
  'Excellent'
]

onMounted(async () => {
  feedbackId.value = route.query.id

  if (!feedbackId.value) {
    error.value = 'Invalid feedback link'
    loading.value = false
    return
  }

  await loadFeedbackRequest()
})

async function loadFeedbackRequest() {
  try {
    const response = await $fetch(`http://localhost:5001/feedback/${feedbackId.value}`)

    if (response.data.status === 'received') {
      error.value = 'This feedback has already been submitted'
      loading.value = false
      return
    }

    ticketInfo.value = {
      ticketId: response.data.ticketId,
      productName: response.data.productName,
      ticketType: response.data.ticketType,
      agentName: response.data.agentName
    }

    loading.value = false
  } catch (err) {
    console.error('Failed to load feedback request:', err)
    error.value = 'Failed to load feedback form. Please check the link.'
    loading.value = false
  }
}

async function submitFeedback() {
  if (rating.value === 0) {
    return
  }

  submitting.value = true

  try {
    await $fetch(`http://localhost:5001/feedback/${feedbackId.value}/response`, {
      method: 'PUT',
      body: {
        rating: rating.value,
        comments: comments.value || null
      }
    })

    submitted.value = true
  } catch (err) {
    console.error('Failed to submit feedback:', err)
    error.value = 'Failed to submit feedback. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>
