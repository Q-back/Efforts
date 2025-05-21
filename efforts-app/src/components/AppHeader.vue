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
            <RouterLink to="/" class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
              Home
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/stats" class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
              Stats
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/history" class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
              History
            </RouterLink>
          </li>
          <li v-if="hasActiveSession">
            <RouterLink to="/session" class="text-green-600 dark:text-green-400 font-medium hover:text-green-700 dark:hover:text-green-300">
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
import { RouterLink } from 'vue-router'
import { useSessionStore } from '../stores/sessionStore'
import LogoIcon from './LogoIcon.vue'
import DarkModeToggle from './DarkModeToggle.vue'

const sessionStore = useSessionStore()
const hasActiveSession = computed(() => sessionStore.hasActiveSession)
</script>
