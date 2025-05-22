<template>
  <header class="bg-white dark:bg-gray-800 shadow">
    <div class="container mx-auto px-4 py-3 flex justify-between items-center">
      <div class="flex items-center space-x-2">
        <LogoIcon class="text-primary-600 dark:text-primary-400" />
        <h1 class="text-xl font-bold text-primary-600 dark:text-primary-400">Efforts</h1>
      </div>
      
      <nav>
        <ul class="flex space-x-4 items-center">
          <li>
            <RouterLink 
              to="/" 
              class="px-3 py-2 rounded-md transition-colors" 
              :class="[
                currentRoute === '/' 
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300 font-medium' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400'
              ]"
            >
              Home
            </RouterLink>
          </li>
          <li>
            <RouterLink 
              to="/stats" 
              class="px-3 py-2 rounded-md transition-colors"
              :class="[
                currentRoute === '/stats' 
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300 font-medium' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400'
              ]"
            >
              Stats
            </RouterLink>
          </li>
          <li>
            <RouterLink 
              to="/history" 
              class="px-3 py-2 rounded-md transition-colors"
              :class="[
                currentRoute === '/history' 
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300 font-medium' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400'
              ]"
            >
              History
            </RouterLink>
          </li>
          <li v-if="hasActiveSession">
            <RouterLink 
              to="/session" 
              class="px-3 py-2 rounded-md transition-colors"
              :class="[
                currentRoute === '/session' 
                  ? 'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300 font-medium' 
                  : 'text-green-600 dark:text-green-400 font-medium hover:bg-green-50 dark:hover:bg-green-900 hover:text-green-700 dark:hover:text-green-300'
              ]"
            >
              Active Session
            </RouterLink>
          </li>
          <li class="ml-2">
            <DarkModeToggle />
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useSessionStore } from '../stores/sessionStore'
import LogoIcon from './LogoIcon.vue'
import DarkModeToggle from './DarkModeToggle.vue'

const route = useRoute()
const sessionStore = useSessionStore()
const hasActiveSession = computed(() => sessionStore.hasActiveSession)

// Compute current route path for active tab highlighting
const currentRoute = computed(() => route.path)
</script>
