<template>
  <div 
    class="fixed inset-0 transition-all duration-1000 ease-in-out -z-10"
    :class="backgroundClass"
  >
    <div class="absolute inset-0 opacity-50 mix-blend-multiply dark:mix-blend-lighten transition-opacity duration-1000">
      <div class="absolute inset-0 bg-gradient-to-br" :class="gradientClass"></div>
    </div>
  </div>
  <div class="relative">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  state: 'home' | 'session' | 'rating';
}

const props = defineProps<Props>();

const backgroundClass = computed(() => ({
  'bg-blue-50 dark:bg-gray-900': props.state === 'home',
  'bg-indigo-50 dark:bg-gray-900': props.state === 'session',
  'bg-purple-50 dark:bg-gray-900': props.state === 'rating',
}));

const gradientClass = computed(() => ({
  'from-blue-100/30 to-blue-50/30 dark:from-blue-900/20 dark:to-blue-800/20': props.state === 'home',
  'from-indigo-100/30 to-indigo-50/30 dark:from-indigo-900/20 dark:to-indigo-800/20': props.state === 'session',
  'from-purple-100/30 to-purple-50/30 dark:from-purple-900/20 dark:to-purple-800/20': props.state === 'rating',
}));
</script>

<style scoped>
.transition-all {
  transition-property: all;
}
</style>
