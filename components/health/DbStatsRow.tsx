'use client'

import {
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react'
import { apiClient, DbStatsDto } from '@/lib/api-client'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BarChart3, AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export interface DbStatsRowHandle {
  refresh: () => void
}

export const DbStatsRow = forwardRef<DbStatsRowHandle>(
  function DbStatsRow(_props, ref) {
    const [data, setData] = useState<DbStatsDto | null>(null)
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)

    const fetchStats = useCallback(async () => {
      setLoading(true)
      try {
        const response = await apiClient.getDbStats()
        setData(response)
      } catch {
        setData(null)
      } finally {
        setLoading(false)
      }
    }, [])

    useImperativeHandle(ref, () => ({ refresh: fetchStats }), [fetchStats])

    useEffect(() => {
      fetchStats()
    }, [fetchStats])

    const handleSyncCounts = async () => {
      setSyncing(true)
      try {
        const result = await apiClient.syncDbCounts()
        if (result.success) {
          toast.success('Database counts synchronized')
          await fetchStats()
        } else {
          toast.error(result.message || 'Failed to sync counts')
        }
      } catch {
        toast.error('Failed to synchronize database counts')
      } finally {
        setSyncing(false)
      }
    }

    const hasMismatches = (data?.logCountMismatches ?? 0) > 0

    return (
      <AccordionItem value="db-stats" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-3 flex-1">
            <BarChart3 className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium text-sm">Database Stats</span>
            <div className="flex items-center gap-2 ml-auto mr-4">
              {data?.totalDbSize && (
                <Badge variant="secondary" className="text-xs">
                  {data.totalDbSize}
                </Badge>
              )}
              {hasMismatches && (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {!data && !loading ? (
            <p className="text-sm text-muted-foreground">
              Failed to load database statistics.
            </p>
          ) : (
            <div className="space-y-5">
              {/* Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">Tables</span>
                  <div className="font-medium">{data?.totalTables ?? '-'}</div>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Indexes</span>
                  <div className="font-medium">{data?.totalIndexes ?? '-'}</div>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">
                    Total Size
                  </span>
                  <div className="font-medium">{data?.totalDbSize ?? '-'}</div>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">
                    Count Mismatches
                  </span>
                  <div className="flex items-center gap-1 font-medium">
                    {hasMismatches && (
                      <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
                    )}
                    {data?.logCountMismatches ?? 0}
                  </div>
                </div>
              </div>

              {/* Largest Tables */}
              {data?.largestTables && data.largestTables.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Largest Tables
                  </h4>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Table</TableHead>
                          <TableHead className="text-xs text-right">
                            Rows
                          </TableHead>
                          <TableHead className="text-xs text-right">
                            Total
                          </TableHead>
                          <TableHead className="text-xs text-right hidden sm:table-cell">
                            Data
                          </TableHead>
                          <TableHead className="text-xs text-right hidden sm:table-cell">
                            Index
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.largestTables.map((table, i) => (
                          <TableRow key={table.tableName ?? `table-${i}`}>
                            <TableCell className="font-mono text-xs">
                              {table.tableName}
                            </TableCell>
                            <TableCell className="text-xs text-right">
                              {table.rowCount?.toLocaleString() ?? '-'}
                            </TableCell>
                            <TableCell className="text-xs text-right">
                              {table.totalSize ?? '-'}
                            </TableCell>
                            <TableCell className="text-xs text-right hidden sm:table-cell">
                              {table.dataSize ?? '-'}
                            </TableCell>
                            <TableCell className="text-xs text-right hidden sm:table-cell">
                              {table.indexSize ?? '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Unused Indexes */}
              {data?.unusedIndexes && data.unusedIndexes.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Unused Indexes ({data.unusedIndexes.length})
                  </h4>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Table</TableHead>
                          <TableHead className="text-xs">Index</TableHead>
                          <TableHead className="text-xs text-right">
                            Scans
                          </TableHead>
                          <TableHead className="text-xs text-right">
                            Size
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.unusedIndexes.map((idx, i) => (
                          <TableRow key={idx.indexName ?? `idx-${i}`}>
                            <TableCell className="font-mono text-xs">
                              {idx.tableName}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {idx.indexName}
                            </TableCell>
                            <TableCell className="text-xs text-right">
                              {idx.indexScans ?? 0}
                            </TableCell>
                            <TableCell className="text-xs text-right">
                              {idx.indexSizePretty ?? '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Actions + timestamp */}
              <div className="flex items-center justify-between pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSyncCounts}
                  disabled={syncing}
                >
                  {syncing && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                  Sync Counts
                </Button>
                {data?.calculatedAt && (
                  <span className="text-xs text-muted-foreground">
                    Calculated: {new Date(data.calculatedAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    )
  }
)
