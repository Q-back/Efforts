<template>
  <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
    <div class="flex justify-between items-center mb-2">
      <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ title }}</h3>
      <span 
        v-if="change !== 0" 
        class="text-xs font-medium px-2 py-0.5 rounded-full"
        :class="changeClass"
      >
        {{ change > 0 ? '+' : '' }}{{ Math.round(change) }}%
      </span>
    </div>
    <div class="flex items-center">
      <div class="text-xl font-bold text-gray-800 dark:text-gray-200">{{ value }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  value: string
  change: number
  icon?: string
}>()

const changeClass = computed(() => {
  if (props.change > 0) {
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  } else if (props.change < 0) {
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  } else {
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
})
</script>
