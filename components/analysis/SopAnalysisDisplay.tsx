import { SopAnalysisDto } from '@/lib/api-client'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AnalysisResultCard } from './AnalysisResultCard'

interface SopAnalysisDisplayProps {
  analysis: SopAnalysisDto | null
  className?: string
}

/**
 * Component for displaying parsed SOP analysis from Gemini AI
 * Uses AnalysisResultCard wrapper for consistent error handling
 */
export function SopAnalysisDisplay({
  analysis,
  className = '',
}: SopAnalysisDisplayProps) {
  return (
    <AnalysisResultCard analysis={analysis} className={className}>
      {/* Steps Section */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">SOP Steps</h4>
        <div className="space-y-3">
          {analysis?.steps && analysis.steps.length > 0 ? (
            analysis.steps.map((step, idx) => (
              <Card key={idx}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Step {idx + 1}
                    </span>
                    {step.actorRoleTitle && (
                      <>
                        <span className="text-xs text-muted-foreground">-</span>
                        <Badge variant="secondary">{step.actorRoleTitle}</Badge>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Name
                    </p>
                    <p className="text-sm text-foreground">{step.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Details
                    </p>
                    <p className="text-sm text-foreground">{step.details}</p>
                  </div>
                  {step.postStepDocumentation && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Post-Step Documentation
                      </p>
                      <p className="text-sm text-foreground">
                        {step.postStepDocumentation}
                      </p>
                    </div>
                  )}
                  {step.monitoringRequirements && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Monitoring Requirements
                      </p>
                      <p className="text-sm text-foreground">
                        {step.monitoringRequirements}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No steps found in analysis.
            </p>
          )}
        </div>
      </div>
    </AnalysisResultCard>
  )
}
