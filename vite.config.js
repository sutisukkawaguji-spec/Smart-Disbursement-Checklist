import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'logo.png', 'icons.svg'],
      manifest: {
        name: 'SDC System - ระบบช่วยตรวจสอบเอกสารเบิกจ่าย',
        short_name: 'SDC System',
        description: 'ระบบช่วยตรวจสอบเอกสารเบิกจ่ายและอำนวยความสะดวกในการจัดทำเอกสารราชการ',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/Smart-Disbursement-Checklist/',
        start_url: '/Smart-Disbursement-Checklist/',
        icons: [
          {
            src: 'logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        cleanupOutdatedCaches: true,
      }
    })
  ],
  base: '/Smart-Disbursement-Checklist/',
})

