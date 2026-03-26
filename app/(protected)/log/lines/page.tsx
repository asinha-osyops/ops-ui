'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogLineDto } from '@/lib/api-client'
import { Route } from '@/lib/routes'
import { Button } from '@/components/ui/button'
import { PageLayout } from '@/components/PageLayout'
import { LogLinesQueryTable } from '@/components/ui/LogLinesQueryTable'
import { UnifiedQueryBuilder } from '@/components/ui/query-builder'
import {
  downloadLogLinesAsJSON,
  downloadLogLinesAsCSV,
} from '@/lib/utils/download'

export default function LogLinesPage() {
  const router = useRouter()
  const [logLines, setLogLines] = useState<LogLineDto[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleResults = (results: LogLineDto[]) => {
    setLogLines(results)
    setHasSearched(true)
  }

  const handleExportJSON = () => {
    downloadLogLinesAsJSON(logLines)
  }

  const handleExportCSV = () => {
    downloadLogLinesAsCSV(logLines)
  }

  return (
    <PageLayout
      title="Query Log Lines"
      breadcrumbs={[
        { label: 'Logs', route: Route.LOG },
        { label: 'Query Log Lines' },
      ]}
      headerActions={
        <>
          <Button variant="outline" onClick={() => router.push(Route.LOG)}>
            Back to Logs
          </Button>
          {logLines.length > 0 && (
            <>
              <Button variant="secondary" onClick={handleExportJSON}>
                Export JSON
              </Button>
              <Button variant="secondary" onClick={handleExportCSV}>
                Export CSV
              </Button>
            </>
          )}
        </>
      }
    >
      {/* Unified Query Builder */}
      <UnifiedQueryBuilder
        onResults={handleResults}
        loading={loading}
        onLoadingChange={setLoading}
      />

      {/* Results Section */}
      {hasSearched && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-medium text-foreground">
              Results ({logLines.length})
            </h2>
          </div>

          <LogLinesQueryTable logLines={logLines} />
        </div>
      )}

      {/* Initial state */}
      {!hasSearched && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            Select a query type and enter search criteria to view log lines
          </p>
        </div>
      )}
    </PageLayout>
  )
}
