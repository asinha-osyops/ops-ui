import { LogAnalysisDto } from '@/lib/api-client'
import { Badge } from '@/components/ui/badge'
import { AnalysisResultCard } from './AnalysisResultCard'

interface LogAnalysisDisplayProps {
  analysis: LogAnalysisDto | null
  className?: string
}

/**
 * Component for displaying parsed log analysis from Gemini AI
 * Uses AnalysisResultCard wrapper for consistent error handling
 */
export function LogAnalysisDisplay({
  analysis,
  className = '',
}: LogAnalysisDisplayProps) {
  return (
    <AnalysisResultCard analysis={analysis} className={className}>
      {/* System Section */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-foreground mb-2">System</h4>
        <Badge variant="secondary" className="text-sm">
          {analysis?.system}
        </Badge>
      </div>

      {/* Actions Section */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-foreground mb-2">Actions</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-foreground">
          {analysis?.actions.map((action, idx) => (
            <li key={idx}>{action}</li>
          ))}
        </ul>
      </div>

      {/* Users Section */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-2">Users</h4>
        <div className="flex flex-wrap gap-2">
          {analysis?.users.map((user, idx) => (
            <Badge key={idx} variant="outline">
              {user}
            </Badge>
          ))}
        </div>
      </div>
    </AnalysisResultCard>
  )
}
