import { Card, CardHeader, CardTitle, CardContent } from './card'
import { ScrollArea } from './scroll-area'
import { Separator } from './separator'
import { DetailField } from './DetailField'

interface FileInfo {
  fileName: string
  uploadedAt: string
  fileSize: number
  contentType: string
  parsedText?: string
  parseError?: string
}

interface FileInfoCardProps {
  file: FileInfo
  title?: string
  className?: string
}

/**
 * Component for displaying file information with optional parsed content
 * Now uses shadcn Card and ScrollArea components
 */
export function FileInfoCard({
  file,
  title = 'Attached File',
  className = '',
}: FileInfoCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <DetailField label="File Name" value={file.fileName} />
          <DetailField
            label="Uploaded"
            value={new Date(file.uploadedAt).toLocaleDateString()}
          />
          <DetailField
            label="File Size"
            value={`${(file.fileSize / 1024).toFixed(2)} KB`}
          />
          <DetailField label="Content Type" value={file.contentType} />
        </div>

        {file.parsedText && (
          <>
            <Separator className="my-4" />
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Parsed Content
                </p>
                <p className="text-xs text-muted-foreground">
                  Word Count:{' '}
                  {
                    file.parsedText
                      .trim()
                      .split(/\s+/)
                      .filter((word) => word.length > 0).length
                  }
                </p>
              </div>
              <ScrollArea className="h-64 rounded-md border bg-muted/50 p-3">
                <pre className="text-sm text-foreground whitespace-pre-wrap font-mono">
                  {file.parsedText}
                </pre>
              </ScrollArea>
            </div>
          </>
        )}

        {file.parseError && (
          <>
            <Separator className="my-4" />
            <div>
              <p className="text-xs font-medium text-destructive mb-2">
                Parse Error
              </p>
              <p className="text-sm text-destructive bg-destructive/10 rounded p-3">
                {file.parseError}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
