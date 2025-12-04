<template>
  <div class="flex h-screen overflow-hidden">
    <Sidebar v-if="isSidebarOpen" @close="isSidebarOpen = false" />

    <!-- Toggle button when sidebar is closed -->
    <button
      v-if="!isSidebarOpen"
      @click="isSidebarOpen = true"
      class="fixed top-4 left-4 z-50 p-2 transition-colors"
      title="Show sidebar"
    >
      <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke-width="2"></rect>
        <path d="M9 3v18" stroke-width="2" stroke-linecap="round"></path>
      </svg>
    </button>

    <main class="flex-1 overflow-hidden p-6" :class="{ 'ml-0': !isSidebarOpen }">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isSidebarOpen = ref(true)
</script>
