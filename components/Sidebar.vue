<template>
  <aside class="w-64 bg-white border-r border-gray-300 flex flex-col h-screen">
    <!-- Fixed Header -->
    <div class="p-4 border-b border-gray-300">
      <h2 class="text-xl font-bold text-gray-800">Menu</h2>
    </div>

    <!-- Scrollable Navigation -->
    <nav class="flex-1 px-2 py-4 overflow-y-auto">
      <!-- Support Section -->
      <div class="mb-2">
        <div
          class="flex items-center justify-between p-3 hover:bg-gray-100 rounded cursor-pointer transition-colors"
          @click="toggleSupport"
        >
          <span class="font-medium text-gray-800">Support</span>
          <img
            src="/chevron-right.svg"
            alt="toggle"
            class="w-4 h-4 transition-transform duration-200"
            :class="{ 'rotate-90': isSupportOpen }"
          />
        </div>

        <!-- Sub-tabs -->
        <transition
          enter-active-class="transition-all duration-200 ease-out"
          leave-active-class="transition-all duration-200 ease-in"
          enter-from-class="max-h-0 opacity-0"
          enter-to-class="max-h-40 opacity-100"
          leave-from-class="max-h-40 opacity-100"
          leave-to-class="max-h-0 opacity-0"
        >
          <div v-show="isSupportOpen" class="ml-4 overflow-hidden">
            <NuxtLink
              to="/tickets"
              class="block p-2 pl-4 hover:bg-gray-100 rounded my-1 transition-colors text-gray-700"
              active-class="bg-blue-50 text-blue-600 border-l-2 border-blue-600"
            >
              Tickets
            </NuxtLink>
            <NuxtLink
              to="/call"
              class="block p-2 pl-4 hover:bg-gray-100 rounded my-1 transition-colors text-gray-700"
              active-class="bg-blue-50 text-blue-600 border-l-2 border-blue-600"
            >
              Call
            </NuxtLink>
          </div>
        </transition>
      </div>
    </nav>

    <!-- Fixed Footer -->
    <div class="p-4 border-t border-gray-300">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          <span class="text-gray-600 text-sm font-medium">U</span>
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-800">User Name</p>
          <p class="text-xs text-gray-500">user@example.com</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'

const isSupportOpen = ref(true)

const toggleSupport = () => {
  isSupportOpen.value = !isSupportOpen.value
}
</script>
