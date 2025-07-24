'use client'

import { useState } from 'react'
import { Save, RefreshCw, Database, Mail, Palette } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: 'TISHOPE',
    siteDescription: 'Your ultimate shopping destination with a premium experience',
    currency: 'MWK',
    taxRate: 16.5,
    shippingFreeThreshold: 50000,
    emailNotifications: true,
    inventoryAlerts: true,
    lowStockThreshold: 10
  })

  const [loading, setLoading] = useState(false)

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      // Here you would typically save to your database
      // For now, we'll just simulate a save operation
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Admin Settings
        </h2>
        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <Save className="h-5 w-5 mr-2" />
          )}
          Save Settings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <Palette className="h-5 w-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              General Settings
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Site Description
              </label>
              <textarea
                rows={3}
                value={settings.siteDescription}
                onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Currency
              </label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({...settings, currency: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="MWK">Malawian Kwacha (MWK)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Business Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <Database className="h-5 w-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Business Settings
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.taxRate}
                onChange={(e) => setSettings({...settings, taxRate: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Free Shipping Threshold (MWK)
              </label>
              <input
                type="number"
                value={settings.shippingFreeThreshold}
                onChange={(e) => setSettings({...settings, shippingFreeThreshold: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Low Stock Alert Threshold
              </label>
              <input
                type="number"
                value={settings.lowStockThreshold}
                onChange={(e) => setSettings({...settings, lowStockThreshold: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <Mail className="h-5 w-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notification Settings
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Notifications
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Send email notifications for new orders
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Inventory Alerts
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Get notified when products are low in stock
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.inventoryAlerts}
                onChange={(e) => setSettings({...settings, inventoryAlerts: e.target.checked})}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            System Information
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Version:</span>
              <span className="font-medium text-gray-900 dark:text-white">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Database:</span>
              <span className="font-medium text-gray-900 dark:text-white">SQLite</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Framework:</span>
              <span className="font-medium text-gray-900 dark:text-white">Next.js 15</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Node Version:</span>
              <span className="font-medium text-gray-900 dark:text-white">20.x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Environment:</span>
              <span className="inline-flex px-2 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 rounded-full">
                Development
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-4">
          Danger Zone
        </h3>
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">
          These actions are irreversible. Please proceed with caution.
        </p>
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
            Clear All Orders
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
            Reset Database
          </button>
        </div>
      </div>
    </div>
  )
}
