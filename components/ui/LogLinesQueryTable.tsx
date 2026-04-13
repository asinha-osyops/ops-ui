'use client'

import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { LogLineDto, Platform } from '@/lib/api-client'
import { DataTable } from './data-table'
import { Badge } from './badge'
import {
  useEnrichedLogLines,
  EnrichedLogLine,
} from '@/lib/hooks/useEnrichedLogLines'
import { useColorScheme } from '@/lib/hooks/useColorScheme'
import { useAppContext } from '@/lib/app-context'
import { getServiceDisplayName } from '@/lib/utils/logline-type-guards'

interface LogLinesQueryTableProps {
  logLines: LogLineDto[]
  className?: string
}

export function LogLinesQueryTable({
  logLines,
  className = '',
}: LogLinesQueryTableProps) {
  const { getEmployeeName } = useAppContext()
  const { getPlatformColor, getServiceColor } = useColorScheme()

  // Pre-compute employee names
  const enrichedLines = useEnrichedLogLines(logLines, getEmployeeName)

  // Define columns with proper typing
  const columns = useMemo<ColumnDef<EnrichedLogLine>[]>(
    () => [
      {
        accessorKey: 'platform',
        header: 'Platform',
        cell: ({ row }) => {
          const platform = row.getValue('platform') as Platform
          const color = getPlatformColor(platform)
          return <Badge chartColor={color}>{platform}</Badge>
        },
      },
      {
        accessorKey: 'service',
        header: 'Service',
        cell: ({ row }) => {
          const line = row.original
          const color = getServiceColor(line.service || '')
          return (
            <Badge chartColor={color} variant="outline">
              {getServiceDisplayName(line)}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => {
          const date = row.getValue('date') as string
          return (
            <span className="whitespace-nowrap">
              {new Date(date).toLocaleString()}
            </span>
          )
        },
      },
      {
        accessorKey: 'event',
        header: 'Event',
        cell: ({ row }) => (
          <div className="max-w-[200px]">{row.getValue('event') || '-'}</div>
        ),
      },
      {
        accessorKey: 'eventCategory',
        header: 'Category',
        cell: ({ row }) => row.getValue('eventCategory') || '-',
      },
      {
        accessorKey: 'actor',
        header: 'Actor',
        cell: ({ row }) => (
          <div
            className="max-w-[200px] truncate"
            title={row.getValue('actor') as string}
          >
            {row.getValue('actor') || '-'}
          </div>
        ),
      },
      {
        accessorKey: 'actorName',
        header: 'Actor Name',
        cell: ({ row }) => row.getValue('actorName') || '-',
      },
      {
        accessorKey: 'actorRoleTitle',
        header: 'Actor Role',
        cell: ({ row }) => {
          const role = row.getValue('actorRoleTitle') as string | undefined
          return role ? (
            <Badge variant="secondary" className="text-xs">
              {role}
            </Badge>
          ) : (
            '-'
          )
        },
      },
      {
        accessorKey: 'owner',
        header: 'Owner',
        cell: ({ row }) => (
          <div
            className="max-w-[200px] truncate"
            title={row.getValue('owner') as string}
          >
            {row.getValue('owner') || '-'}
          </div>
        ),
      },
      {
        accessorKey: 'ownerName',
        header: 'Owner Name',
        cell: ({ row }) => row.getValue('ownerName') || '-',
      },
      {
        accessorKey: 'ownerRoleTitle',
        header: 'Owner Role',
        cell: ({ row }) => {
          const role = row.getValue('ownerRoleTitle') as string | undefined
          return role ? (
            <Badge variant="secondary" className="text-xs">
              {role}
            </Badge>
          ) : (
            '-'
          )
        },
      },
      {
        accessorKey: 'target',
        header: 'Target',
        cell: ({ row }) => (
          <div
            className="max-w-[200px] truncate"
            title={row.getValue('target') as string}
          >
            {row.getValue('target') || '-'}
          </div>
        ),
      },
      {
        accessorKey: 'targetName',
        header: 'Target Name',
        cell: ({ row }) => row.getValue('targetName') || '-',
      },
      {
        accessorKey: 'targetRoleTitle',
        header: 'Target Role',
        cell: ({ row }) => {
          const role = row.getValue('targetRoleTitle') as string | undefined
          return role ? (
            <Badge variant="secondary" className="text-xs">
              {role}
            </Badge>
          ) : (
            '-'
          )
        },
      },
      {
        accessorKey: 'resourceTitle',
        header: 'Resource',
        cell: ({ row }) => (
          <div
            className="max-w-[250px]"
            title={row.getValue('resourceTitle') as string}
          >
            {row.getValue('resourceTitle') || '-'}
          </div>
        ),
      },
      {
        accessorKey: 'resourceId',
        header: 'Resource ID',
        cell: ({ row }) => (
          <div
            className="max-w-[150px] truncate font-mono text-xs"
            title={row.getValue('resourceId') as string}
          >
            {row.getValue('resourceId') || '-'}
          </div>
        ),
      },
      {
        accessorKey: 'domain',
        header: 'Domain',
        cell: ({ row }) => row.getValue('domain') || '-',
      },
      {
        accessorKey: 'ipAddress',
        header: 'IP Address',
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {row.getValue('ipAddress') || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'visibility',
        header: 'Visibility',
        cell: ({ row }) => row.getValue('visibility') || '-',
      },
    ],
    [getPlatformColor, getServiceColor]
  )

  if (!enrichedLines || enrichedLines.length === 0) {
    return (
      <div className={className}>
        <p className="text-sm text-muted-foreground text-center py-8">
          No log lines found
        </p>
      </div>
    )
  }

  return (
    <div className={className}>
      <DataTable columns={columns} data={enrichedLines} />
    </div>
  )
}
