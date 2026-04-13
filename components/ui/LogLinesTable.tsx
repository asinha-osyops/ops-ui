import { useState } from 'react'
import { LogLineDto } from '@/lib/api-client'
import {
  useEnrichedLogLines,
  type EnrichedLogLine,
} from '@/lib/hooks/useEnrichedLogLines'
import { DetailField } from './DetailField'
import { useAppContext } from '@/lib/app-context'
import { useColorScheme } from '@/lib/hooks/useColorScheme'
import { getServiceDisplayName } from '@/lib/utils/logline-type-guards'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table'
import { Badge } from './badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from './sheet'

interface LogLinesTableProps {
  logLines: LogLineDto[]
  totalCount?: number
  className?: string
}

export function LogLinesTable({
  logLines,
  totalCount,
  className = '',
}: LogLinesTableProps) {
  const [selectedLine, setSelectedLine] = useState<EnrichedLogLine | null>(null)
  const { getEmployeeName } = useAppContext()
  const { getPlatformColor, getServiceColor } = useColorScheme()

  // Pre-compute employee names to avoid repeated function calls during rendering
  const enrichedLines = useEnrichedLogLines(logLines, getEmployeeName)

  if (!logLines || logLines.length === 0) {
    return (
      <div className={className}>
        <h3 className="text-lg font-medium text-foreground mb-3">Log Lines</h3>
        <p className="text-sm text-muted-foreground">No log lines available</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <h3 className="text-lg font-medium text-foreground mb-3">
        Log Lines ({totalCount ?? logLines.length})
      </h3>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Platform</TableHead>
              <TableHead>Service</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead>Event</TableHead>
              <TableHead className="hidden lg:table-cell">Actor</TableHead>
              <TableHead className="hidden md:table-cell">Actor Name</TableHead>
              <TableHead className="hidden lg:table-cell">Owner Name</TableHead>
              <TableHead className="hidden lg:table-cell">
                Target Name
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrichedLines.map((line) => (
              <TableRow
                key={line.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setSelectedLine(line)}
              >
                <TableCell>
                  <Badge chartColor={getPlatformColor(line.platform)}>
                    {line.platform}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    chartColor={getServiceColor(line.service || '')}
                    variant="outline"
                  >
                    {getServiceDisplayName(line)}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {new Date(line.date).toLocaleString()}
                </TableCell>
                <TableCell>{line.event || '-'}</TableCell>
                <TableCell className="hidden lg:table-cell">
                  {line.actor || '-'}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {line.actorName}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {line.ownerName}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {line.targetName}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Log Line Details Sheet */}
      <Sheet
        open={selectedLine !== null}
        onOpenChange={(open) => !open && setSelectedLine(null)}
      >
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedLine && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Badge chartColor={getPlatformColor(selectedLine.platform)}>
                    {selectedLine.platform}
                  </Badge>
                  <Badge
                    chartColor={getServiceColor(selectedLine.service || '')}
                    variant="outline"
                  >
                    {getServiceDisplayName(selectedLine)}
                  </Badge>
                  <span>{selectedLine.event || 'Log Entry'}</span>
                </SheetTitle>
                <SheetDescription>
                  {new Date(selectedLine.date).toLocaleString()}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Event Details */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">
                    Event
                  </h4>
                  <div className="grid gap-3">
                    <DetailField
                      label="Event"
                      value={selectedLine.event || '-'}
                    />
                    <DetailField
                      label="Event Category"
                      value={selectedLine.eventCategory || '-'}
                    />
                    {selectedLine.resourceTitle && (
                      <DetailField
                        label="Resource Title"
                        value={selectedLine.resourceTitle}
                      />
                    )}
                    {selectedLine.resourceId && (
                      <DetailField
                        label="Resource ID"
                        value={selectedLine.resourceId}
                      />
                    )}
                    {selectedLine.resourceType && (
                      <DetailField
                        label="Resource Type"
                        value={selectedLine.resourceType}
                      />
                    )}
                    {selectedLine.visibility && (
                      <DetailField
                        label="Visibility"
                        value={selectedLine.visibility}
                      />
                    )}
                  </div>
                </div>

                {/* Actor Section */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">
                    Actor
                  </h4>
                  <div className="grid gap-3">
                    <DetailField
                      label="Actor ID"
                      value={selectedLine.actor || '-'}
                    />
                    <DetailField
                      label="Actor Name"
                      value={selectedLine.actorName}
                    />
                  </div>
                </div>

                {/* Owner Section */}
                {(selectedLine.owner ||
                  selectedLine.ownerName !== 'Unknown') && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">
                      Owner
                    </h4>
                    <div className="grid gap-3">
                      {selectedLine.owner && (
                        <DetailField
                          label="Owner ID"
                          value={selectedLine.owner}
                        />
                      )}
                      <DetailField
                        label="Owner Name"
                        value={selectedLine.ownerName}
                      />
                    </div>
                  </div>
                )}

                {/* Target Section */}
                {(selectedLine.target ||
                  selectedLine.targetName !== 'Unknown') && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">
                      Target
                    </h4>
                    <div className="grid gap-3">
                      {selectedLine.target && (
                        <DetailField
                          label="Target ID"
                          value={selectedLine.target}
                        />
                      )}
                      <DetailField
                        label="Target Name"
                        value={selectedLine.targetName}
                      />
                    </div>
                  </div>
                )}

                {/* Network Details */}
                {(selectedLine.domain || selectedLine.ipAddress) && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">
                      Network
                    </h4>
                    <div className="grid gap-3">
                      {selectedLine.domain && (
                        <DetailField
                          label="Domain"
                          value={selectedLine.domain}
                        />
                      )}
                      {selectedLine.ipAddress && (
                        <DetailField
                          label="IP Address"
                          value={selectedLine.ipAddress}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Metadata Section */}
                {selectedLine.metadata &&
                  Object.keys(selectedLine.metadata).length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-foreground">
                        Additional Details
                      </h4>
                      <div className="grid gap-3">
                        {Object.entries(selectedLine.metadata).map(
                          ([key, value]) => {
                            if (
                              value === null ||
                              value === undefined ||
                              value === ''
                            )
                              return null
                            const displayKey = key
                              .replace(/([A-Z])/g, ' $1')
                              .replace(/^./, (str) => str.toUpperCase())
                            const displayValue =
                              typeof value === 'object'
                                ? JSON.stringify(value)
                                : String(value)
                            return (
                              <DetailField
                                key={key}
                                label={displayKey}
                                value={displayValue}
                              />
                            )
                          }
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
