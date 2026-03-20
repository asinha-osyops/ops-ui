import { useMemo } from 'react'
import { GeminiResponseFileDto } from '@/lib/api-client'
import { truncateId, formatDateTime } from '@/lib/utils/format-helpers'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface GeminiResponseFileCardProps<T> {
  file: GeminiResponseFileDto
  parseContent: (content: string) => T | null
  renderAnalysis: (analysis: T | null) => React.ReactNode
  className?: string
}

/**
 * Generic component for displaying Gemini AI response files with parsed analysis
 * Uses memoization to avoid re-parsing on every render
 */
export function GeminiResponseFileCard<T>({
  file,
  parseContent,
  renderAnalysis,
  className = '',
}: GeminiResponseFileCardProps<T>) {
  // Memoize parsing to avoid re-computing on every render
  const parsedAnalysis = useMemo(() => {
    try {
      return parseContent(file.fileContent)
    } catch (error) {
      console.error('Error parsing Gemini response file:', error)
      return null
    }
  }, [file.fileContent, parseContent])

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              {file.fileName}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDateTime(file.uploadedAt)} •{' '}
              {(file.fileSize / 1024).toFixed(2)} KB
            </p>
          </div>
          <span className="text-xs text-muted-foreground">
            Request ID: {truncateId(file.sourceRequestId)}
          </span>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        {renderAnalysis(parsedAnalysis)}
      </CardContent>
    </Card>
  )
}
