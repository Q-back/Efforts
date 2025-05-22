<script setup lang="ts">
import { onMounted } from "vue";
import { RouterView } from "vue-router";
import AppHeader from "./components/AppHeader.vue";
import { useSessionStore } from "./stores/sessionStore";
import { useStatsStore } from "./stores/statsStore";

const sessionStore = useSessionStore();
const statsStore = useStatsStore();

// Initialize the app
onMounted(async () => {
  await sessionStore.init();
  await statsStore.init();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <AppHeader />

    <main class="container mx-auto px-4 py-6">
      <RouterView />
    </main>

    <footer
      class="py-4 text-center text-sm text-gray-500 dark:text-gray-400 mt-auto"
    >
      <p>
        Efforts &copy; {{ new Date().getFullYear() }}
        <a href="https://github.com/Q-back/Efforts">Open Source</a>
      </p>
    </footer>
  </div>
</template>
