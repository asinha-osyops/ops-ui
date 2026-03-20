'use client'

import { GeminiResponseFileDto } from '@/lib/api-client'
import { formatDate } from '@/lib/utils/format-helpers'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { GeminiResponseFileCard } from '@/components/analysis/GeminiResponseFileCard'

interface GeminiAnalysisSectionProps<T> {
  geminiResponseFiles: GeminiResponseFileDto[] | undefined
  parseContent: (content: string) => T
  renderAnalysis: (analysis: T | null) => React.ReactNode
  title?: string
}

export function GeminiAnalysisSection<T>({
  geminiResponseFiles,
  parseContent,
  renderAnalysis,
  title = 'Gemini Analysis Results',
}: GeminiAnalysisSectionProps<T>) {
  if (!geminiResponseFiles || geminiResponseFiles.length === 0) {
    return null
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium text-foreground mb-3">
        {title} ({geminiResponseFiles.length})
      </h3>
      <Accordion type="single" collapsible className="space-y-2">
        {geminiResponseFiles.map((file, index) => (
          <AccordionItem
            key={file.id}
            value={file.id}
            className="border rounded-lg"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center justify-between w-full text-left">
                <span className="text-sm font-medium">
                  Analysis {index + 1} - {formatDate(file.uploadedAt)}
                </span>
                <span className="text-xs text-muted-foreground mr-2">
                  {(file.fileSize / 1024).toFixed(1)} KB
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <GeminiResponseFileCard
                file={file}
                parseContent={parseContent}
                renderAnalysis={renderAnalysis}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
