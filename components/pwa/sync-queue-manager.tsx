'use client'

import { useSyncQueueStore } from '@/lib/stores/sync-queue-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { CloudOff, RefreshCw, Trash2, AlertCircle, CheckCircle } from 'lucide-react'
import { useState } from 'react'

export function SyncQueueManager() {
  const { 
    queue, 
    isSyncing, 
    processQueue, 
    clearCompleted, 
    clearAll,
    retryFailed,
    getPendingCount,
    getFailedCount,
  } = useSyncQueueStore()
  
  const [isOpen, setIsOpen] = useState(false)
  
  const pendingCount = getPendingCount()
  const failedCount = getFailedCount()
  
  if (queue.length === 0) {
    return null
  }

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {(pendingCount > 0 || failedCount > 0) && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-36 right-4 z-40"
          >
            <Button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-full h-14 w-14 shadow-lg relative"
              variant={failedCount > 0 ? "destructive" : "default"}
            >
              <CloudOff className="h-6 w-6" />
              {(pendingCount > 0 || failedCount > 0) && (
                <Badge 
                  className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 flex items-center justify-center"
                  variant={failedCount > 0 ? "destructive" : "secondary"}
                >
                  {pendingCount + failedCount}
                </Badge>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Queue Manager Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full max-w-lg"
              onClick={(e:any) => e.stopPropagation()}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Sync Queue</CardTitle>
                      <CardDescription>
                        Manage pending and failed requests
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                    >
                      Close
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 rounded-lg bg-muted text-center">
                      <div className="text-2xl font-bold">{queue.length}</div>
                      <div className="text-xs text-muted-foreground">Total</div>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-500/10 text-center">
                      <div className="text-2xl font-bold text-blue-500">{pendingCount}</div>
                      <div className="text-xs text-muted-foreground">Pending</div>
                    </div>
                    <div className="p-3 rounded-lg bg-destructive/10 text-center">
                      <div className="text-2xl font-bold text-destructive">{failedCount}</div>
                      <div className="text-xs text-muted-foreground">Failed</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => processQueue()}
                      disabled={isSyncing || pendingCount === 0}
                      className="flex-1"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                      Sync Now
                    </Button>
                    {failedCount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => retryFailed()}
                        disabled={isSyncing}
                        className="flex-1"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry Failed
                      </Button>
                    )}
                  </div>

                  {/* Queue Items */}
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {queue.map((request) => (
                      <div
                        key={request.id}
                        className="p-3 rounded-lg border bg-card"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge 
                                variant={
                                  request.status === 'completed' ? 'default' :
                                  request.status === 'failed' ? 'destructive' :
                                  request.status === 'syncing' ? 'secondary' :
                                  'outline'
                                }
                                className="text-xs"
                              >
                                {request.status}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {request.method}
                              </Badge>
                              {request.priority === 'high' && (
                                <Badge variant="destructive" className="text-xs">
                                  High Priority
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm font-medium truncate">{request.url}</p>
                            {request.error && (
                              <p className="text-xs text-destructive mt-1">{request.error}</p>
                            )}
                            {request.retryCount > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Retry {request.retryCount}/{request.maxRetries}
                              </p>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            {request.status === 'completed' && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                            {request.status === 'failed' && (
                              <AlertCircle className="h-5 w-5 text-destructive" />
                            )}
                            {request.status === 'syncing' && (
                              <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Clear Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearCompleted}
                      className="flex-1"
                    >
                      Clear Completed
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAll}
                      className="flex-1 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
