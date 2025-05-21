<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Statistics</h1>
    
    <!-- Time range selector -->
    <div class="flex space-x-2 mb-6">
      <button
        v-for="range in timeRanges"
        :key="range.value"
        @click="activeTimeRange = range.value"
        class="px-4 py-2 rounded-md transition-colors"
        :class="{
          'bg-primary-500 text-white': activeTimeRange === range.value,
          'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300': activeTimeRange !== range.value
        }"
      >
        {{ range.label }}
      </button>
    </div>
    
    <!-- Loading state -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      <p class="mt-2 text-gray-600 dark:text-gray-400">Loading statistics...</p>
    </div>
    
    <!-- Stats content -->
    <div v-else>
      <!-- No data state -->
      <div v-if="!currentStats" class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
        <p class="text-gray-600 dark:text-gray-400">
          No data available for this time period.
        </p>
      </div>
      
      <!-- Stats summary -->
      <div v-else class="space-y-6">
        <!-- Summary cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Total focus time -->
          <StatCard
            title="Focus Time"
            :value="formatDuration(currentStats.totalFocusTime)"
            :change="percentageChange.totalFocusTime"
            icon="clock"
          />
          
          <!-- Completed sessions -->
          <StatCard
            title="Sessions"
            :value="currentStats.totalSessions.toString()"
            :change="percentageChange.totalSessions"
            icon="clipboard-list"
          />
          
          <!-- Total points -->
          <StatCard
            title="Points"
            :value="currentStats.totalPoints.toString()"
            :change="percentageChange.totalPoints"
            icon="star"
          />
          
          <!-- Average session length -->
          <StatCard
            title="Avg Session"
            :value="formatDuration(Math.round(currentStats.averageSessionLength))"
            :change="percentageChange.averageSessionLength"
            icon="chart-bar"
          />
        </div>
        
        <!-- Quality distribution -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Session Quality Distribution
          </h3>
          
          <div class="grid grid-cols-4 gap-2">
            <div 
              v-for="(count, quality) in qualityDistribution" 
              :key="quality"
              class="text-center p-3"
            >
              <div class="text-2xl mb-1">{{ getQualityEmoji(quality) }}</div>
              <div class="text-lg font-semibold">{{ count }}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400 capitalize">{{ quality }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useStatsStore } from '../stores/statsStore'
import { formatDuration, getQualityEmoji } from '../utils/sessionUtils'
import type { SessionQuality } from '../types'
import StatCard from '../components/StatCard.vue'

// Store
const statsStore = useStatsStore()

// UI state
const isLoading = ref(false)
const activeTimeRange = ref<'day' | 'week' | 'month'>('day')

// Time range options
const timeRanges = [
  { label: 'Daily', value: 'day' },
  { label: 'Weekly', value: 'week' },
  { label: 'Monthly', value: 'month' },
]

// Computed stats based on selected time range
const stats = computed(() => {
  switch (activeTimeRange.value) {
    case 'day':
      return statsStore.dailyStats
    case 'week':
      return statsStore.weeklyStats
    case 'month':
      return statsStore.monthlyStats
    default:
      return null
  }
})

const currentStats = computed(() => {
  return stats.value?.current || null
})

const percentageChange = computed(() => {
  return stats.value?.percentageChange || {
    totalSessions: 0,
    totalFocusTime: 0,
    totalPoints: 0,
    averageSessionLength: 0,
  }
})

const qualityDistribution = computed(() => {
  return currentStats.value?.qualityDistribution || {
    poor: 0,
    normal: 0,
    great: 0,
    deep: 0,
  }
})

// Load stats when time range changes
const loadStats = async () => {
  isLoading.value = true
  try {
    await statsStore.loadStats(activeTimeRange.value)
  } catch (error) {
    console.error(`Error loading ${activeTimeRange.value} stats:`, error)
  } finally {
    isLoading.value = false
  }
}

// Watch for time range changes
watch(activeTimeRange, () => {
  loadStats()
})

// Initialize
onMounted(async () => {
  await loadStats()
})
</script>
