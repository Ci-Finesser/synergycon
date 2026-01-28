'use client'

import { useCacheStore } from '@/lib/stores/cache-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Database, Trash2, RefreshCw, HardDrive } from 'lucide-react'
import { useEffect } from 'react'
import { formatBytes } from '@/lib/utils'

export function CacheManager() {
  const { stats, caches, isLoading, updateStats, clearCache, clearOldCaches } = useCacheStore()

  useEffect(() => {
    updateStats()
  }, [updateStats])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <div>
              <CardTitle>Cache Storage</CardTitle>
              <CardDescription>Manage offline data and cache</CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateStats()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overall Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Size</span>
            </div>
            <p className="text-2xl font-bold">
              {formatBytes(stats.totalSize)}
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-muted">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Items</span>
            </div>
            <p className="text-2xl font-bold">{stats.itemCount}</p>
          </div>
        </div>

        {/* Cache Breakdown */}
        {caches.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Cache Breakdown</h4>
            {caches.map((cache) => (
              <div key={cache.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{cache.name}</span>
                  <span className="text-muted-foreground">
                    {formatBytes(cache.size)}
                  </span>
                </div>
                <Progress 
                  value={(cache.size / stats.totalSize) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => clearOldCaches(7 * 24 * 60 * 60 * 1000)} // 7 days
            className="flex-1"
          >
            Clear Old Cache
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => clearCache()}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>

        {stats.lastUpdated && (
          <p className="text-xs text-muted-foreground text-center">
            Last updated: {new Date(stats.lastUpdated).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
