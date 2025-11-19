<template>
  <aside class="w-64 bg-gray-800 text-white flex flex-col h-screen">
    <div class="p-4 border-b border-gray-700">
      <h2 class="text-xl font-bold">Menu</h2>
    </div>

    <nav class="flex-1 px-2 py-4">
      <!-- Support Section -->
      <div class="mb-2">
        <div
          class="flex items-center justify-between p-3 hover:bg-gray-700 rounded cursor-pointer transition-colors"
          @click="toggleSupport"
        >
          <span class="font-medium">Support</span>
          <img
            src="/chevron-right.svg"
            alt="toggle"
            class="w-4 h-4 transition-transform duration-200 filter invert"
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
              class="block p-2 pl-4 hover:bg-gray-700 rounded my-1 transition-colors"
              active-class="bg-gray-700"
            >
              Tickets
            </NuxtLink>
            <NuxtLink
              to="/call"
              class="block p-2 pl-4 hover:bg-gray-700 rounded my-1 transition-colors"
              active-class="bg-gray-700"
            >
              Call
            </NuxtLink>
          </div>
        </transition>
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { ref } from 'vue'

const isSupportOpen = ref(true)

const toggleSupport = () => {
  isSupportOpen.value = !isSupportOpen.value
}
</script>
