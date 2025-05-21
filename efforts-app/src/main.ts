import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'

// Import routes
import routes from './router'

// Create Vue Router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Create Pinia store
const pinia = createPinia()

// Create Vue app
const app = createApp(App)

// Use plugins
app.use(router)
app.use(pinia)

// Mount app
app.mount('#app')
