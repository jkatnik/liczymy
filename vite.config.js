import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' — zbudowany dist działa z dowolnego katalogu/hostingu
export default defineConfig({ plugins: [react()], base: './' })
