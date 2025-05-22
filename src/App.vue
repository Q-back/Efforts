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
  <div class="w-full min-h-screen flex flex-col">
    <div class="w-full bg-primary-50 dark:bg-gray-900 transition-colors duration-500 flex-grow">
      <AppHeader />

      <main class="max-w-4xl w-full mx-auto px-2 sm:px-4 py-3 sm:py-6">
        <RouterView v-slot="{ Component }">
          <Transition
            enter-active-class="transition-opacity duration-150"
            leave-active-class="transition-opacity duration-150"
            enter-from-class="opacity-0"
            leave-to-class="opacity-0"
          >
            <div :key="$route.path">
              <component :is="Component" />
            </div>
          </Transition>
        </RouterView>
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
  </div>
</template>
