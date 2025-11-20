<template>
  <div class="flex h-screen overflow-hidden">
    <Sidebar />
    <main class="flex-1 overflow-hidden p-6 bg-gray-50">
      <slot />
    </main>
  </div>
</template>
