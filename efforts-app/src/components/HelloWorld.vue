<script setup lang="ts">
import LogoIcon from './LogoIcon.vue'

defineProps<{ msg: string }>()
</script>

<template>
  <div class="text-center py-8">
    <div class="flex items-center justify-center mb-4">
      <LogoIcon :size="64" className="text-primary-500" />
    </div>
    
    <h1 class="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">{{ msg }}</h1>
    
    <p class="text-lg text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
      A focus session tracker designed for people with ADHD
    </p>
  </div>
</template>
