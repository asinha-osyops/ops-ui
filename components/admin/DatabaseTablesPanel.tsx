'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient, DbTableInfoDto } from '@/lib/api-client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RefreshCw, Table2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface DatabaseTablesPanelProps {
  className?: string
}

function formatBytes(bytes?: number): string {
  if (bytes === undefined || bytes === null) return '-'
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function formatNumber(num: number): string {
  return num.toLocaleString()
}

export function DatabaseTablesPanel({ className }: DatabaseTablesPanelProps) {
  const [tables, setTables] = useState<DbTableInfoDto[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  const fetchTables = useCallback(async () => {
    setLoading(true)
    try {
      const response = await apiClient.getDbTables()
      // Sort by row count descending
      setTables(response.sort((a, b) => b.rowCount - a.rowCount))
    } catch (error) {
      console.error('Failed to fetch database tables:', error)
      toast.error('Failed to fetch table information')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSyncCounts = async () => {
    setSyncing(true)
    try {
      const result = await apiClient.syncDbCounts()
      if (result.success) {
        toast.success('Database counts synchronized successfully')
        // Refresh table data after sync
        await fetchTables()
      } else {
        toast.error(result.message || 'Failed to sync counts')
      }
    } catch (error) {
      console.error('Failed to sync counts:', error)
      toast.error('Failed to synchronize database counts')
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    fetchTables()
  }, [fetchTables])

  const totalRows = tables.reduce((sum, t) => sum + t.rowCount, 0)
  const totalSize = tables.reduce((sum, t) => sum + (t.sizeBytes || 0), 0)

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table2 className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-medium">
              Database Tables
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncCounts}
              disabled={syncing}
            >
              {syncing ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : null}
              Sync Counts
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={fetchTables}
              disabled={loading}
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </Button>
          </div>
        </div>
        <CardDescription>
          {tables.length} tables | {formatNumber(totalRows)} total rows |{' '}
          {formatBytes(totalSize)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading && tables.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table Name</TableHead>
                  <TableHead className="text-right">Rows</TableHead>
                  <TableHead className="text-right">Size</TableHead>
                  <TableHead className="text-right">Indexes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables.map((table) => (
                  <TableRow key={table.tableName}>
                    <TableCell className="font-mono text-sm">
                      {table.tableName}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(table.rowCount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatBytes(table.sizeBytes)}
                    </TableCell>
                    <TableCell className="text-right">
                      {table.indexes?.length ?? '-'}
                    </TableCell>
                  </TableRow>
                ))}
                {tables.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No table data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
