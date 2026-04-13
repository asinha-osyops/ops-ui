'use client'

import { useMemo, useCallback, useState, useRef } from 'react'
import ReactFlow, {
  Background,
  BackgroundVariant,
  type NodeTypes,
  type EdgeTypes,
  type NodeMouseHandler,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { ArrowDownUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AccessibleGraphControls } from '@/components/graph-nodes/AccessibleGraphControls'
import { StartNode } from '@/components/sop/graph/nodes/StartNode'
import { StepNode } from '@/components/sop/graph/nodes/StepNode'
import { EndNode } from '@/components/sop/graph/nodes/EndNode'
import { SopEdge } from '@/components/sop/graph/edges/SopEdge'
import { useNodeHover } from '@/components/sop/graph/hooks/useNodeHover'
import { LAYOUT_DEFAULTS } from '@/components/sop/graph/nodes/node-config'
import {
  useDagLayoutGeneric,
  type StepAccessors,
  type EdgeAccessors,
  type LayoutDirection,
} from '@/lib/hooks/useDagLayoutGeneric'
import {
  TraceSopStepsResponseDto,
  StepAnalysisDto,
  EdgeDto,
} from '@/lib/api-client'
import {
  transformToGraphFormat,
  extractLogLineData,
  getStepAnalysisById,
  type StepLogLineData,
} from '@/lib/utils/analysis-transforms'
import {
  formatEdgeDuration,
  isDurationOverThreshold,
  type DurationInput,
} from '@/lib/utils/duration-utils'
import { REACTFLOW_FIT_VIEW_OPTIONS } from '@/lib/constants/graph-config'
import { AnalysisStepFooter } from './AnalysisStepFooter'
import { AnalysisStepExpandedContent } from './AnalysisStepExpandedContent'

// Step accessors for StepAnalysisDto
const analysisStepAccessors: StepAccessors<StepAnalysisDto> = {
  getId: (s) => s.id,
  getName: (s) => s.name,
  getDetails: (s) => s.details,
  getNodeType: (s) => s.nodeType,
  getIsFork: (s) => s.isFork,
  getIsJoin: (s) => s.isJoin,
  getActorRoleTitle: (s) => s.actorRoleTitle,
}

const edgeAccessors: EdgeAccessors<EdgeDto> = {
  getId: (e) => e.id,
  getFrom: (e) => e.from,
  getTo: (e) => e.to,
  getTransitionDuration: (e) => e.transitionDuration,
}

// Reuse node types from sop/graph — StepAnalysisDto is compatible with StepDto
const nodeTypes: NodeTypes = {
  analysisNode: ({ data, selected, ...rest }: any) => {
    const step = data.step
    switch (step.nodeType) {
      case 'START':
        return <StartNode data={data} selected={selected} {...rest} />
      case 'END':
        return <EndNode data={data} selected={selected} {...rest} />
      default:
        return <StepNode data={data} selected={selected} {...rest} />
    }
  },
}

const edgeTypes: EdgeTypes = {
  sopEdge: SopEdge,
}

interface AnalysisGraphNewProps {
  results: TraceSopStepsResponseDto
  className?: string
}

export function AnalysisGraphNew({
  results,
  className,
}: AnalysisGraphNewProps) {
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null)
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null)
  const [direction, setDirection] = useState<LayoutDirection>('TB')

  // Transform response to graph format
  const sopAnalysis = useMemo(() => transformToGraphFormat(results), [results])

  // Layout
  const layoutOptions = useMemo(
    () => ({
      direction,
      nodeWidth: LAYOUT_DEFAULTS.nodeWidth,
      nodeHeight: LAYOUT_DEFAULTS.nodeHeight,
      rankSep: LAYOUT_DEFAULTS.rankSep,
      nodeSep: LAYOUT_DEFAULTS.nodeSep,
      edgeType: 'sopEdge',
    }),
    [direction]
  )

  const { nodes, edges } = useDagLayoutGeneric<StepAnalysisDto, EdgeDto>(
    sopAnalysis.steps,
    sopAnalysis.edges,
    analysisStepAccessors,
    edgeAccessors,
    selectedStepId,
    null,
    'analysisNode',
    layoutOptions
  )

  // Edge labels with duration color-coding
  const edgeDtoMap = useMemo(() => {
    const map = new Map<string, EdgeDto>()
    for (const e of sopAnalysis.edges) map.set(e.id, e)
    return map
  }, [sopAnalysis.edges])

  const labeledEdges = useMemo(
    () =>
      edges.map((edge) => {
        const dto = edgeDtoMap.get(edge.id)
        const duration = dto?.transitionDuration
        const label = duration ? formatEdgeDuration(duration) : undefined
        const isOverThreshold = duration
          ? isDurationOverThreshold(duration)
          : false
        return {
          ...edge,
          type: 'sopEdge',
          data: { ...edge.data, label, isOverThreshold },
        }
      }),
    [edges, edgeDtoMap]
  )

  // Analysis data lookups
  const logLineDataMap = useMemo(
    () => extractLogLineData(results.stepAnalyses),
    [results.stepAnalyses]
  )

  const getStepAnalysis = useCallback(
    (stepId: string): StepAnalysisDto | undefined =>
      getStepAnalysisById(results, stepId),
    [results]
  )

  const getLogLineDataForStep = useCallback(
    (stepId: string): StepLogLineData[] => logLineDataMap.get(stepId) || [],
    [logLineDataMap]
  )

  const getStepTotals = useCallback(
    (
      stepId: string
    ): {
      eventCount: number
      logLineCount: number
      stepDuration?: DurationInput
    } => {
      const analysis = getStepAnalysis(stepId)
      if (!analysis) return { eventCount: 0, logLineCount: 0 }
      const eventCount = analysis.matchingActivityEvents.length
      const logLineData = getLogLineDataForStep(stepId)
      const logLineCount = logLineData.reduce(
        (sum, d) => sum + d.totalLogLines,
        0
      )
      return { eventCount, logLineCount, stepDuration: analysis.stepDuration }
    },
    [getStepAnalysis, getLogLineDataForStep]
  )

  // Click toggles expansion
  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedStepId(node.id)
    setExpandedStepId((prev) => (prev === node.id ? null : node.id))
  }, [])

  // Keyboard: Escape to deselect
  const graphContainerRef = useRef<HTMLDivElement>(null)

  const toggleDirection = useCallback(() => {
    setDirection((d) => (d === 'TB' ? 'LR' : 'TB'))
  }, [])

  // Find expanded step data
  const expandedStep = useMemo(() => {
    if (!expandedStepId) return null
    return results.stepAnalyses.find((s) => s.id === expandedStepId) ?? null
  }, [expandedStepId, results.stepAnalyses])

  // Stats
  const stepCount = sopAnalysis.steps.length
  const edgeCount = sopAnalysis.edges.length

  return (
    <div className={className}>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {stepCount} step{stepCount !== 1 ? 's' : ''}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {edgeCount} edge{edgeCount !== 1 ? 's' : ''}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleDirection}
          className="gap-1.5"
        >
          <ArrowDownUp className="h-3.5 w-3.5" />
          {direction === 'TB' ? 'Top-Down' : 'Left-Right'}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Graph */}
        <div
          ref={graphContainerRef}
          className="h-[500px] md:h-[900px] flex-1 rounded-lg border border-border bg-background overflow-hidden relative"
        >
          <ReactFlow
            nodes={nodes}
            edges={labeledEdges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodeClick={onNodeClick}
            fitView
            fitViewOptions={REACTFLOW_FIT_VIEW_OPTIONS}
            minZoom={0.1}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={true}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="hsl(var(--muted-foreground) / 0.15)"
            />
            <AccessibleGraphControls position="bottom-right" />
          </ReactFlow>
        </div>

        {/* Expanded step detail panel (click-to-expand) */}
        {expandedStep && (
          <div className="w-full md:w-[400px] md:shrink-0">
            <div className="rounded-lg border border-border bg-card overflow-hidden flex flex-col h-[500px] md:h-[900px]">
              <div className="p-3 border-b border-border bg-muted/50 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium truncate">
                    {expandedStep.name}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      setExpandedStepId(null)
                      setSelectedStepId(null)
                    }}
                  >
                    &times;
                  </Button>
                </div>
                <AnalysisStepFooter
                  eventCount={getStepTotals(expandedStep.id).eventCount}
                  logLineCount={getStepTotals(expandedStep.id).logLineCount}
                  stepDuration={getStepTotals(expandedStep.id).stepDuration}
                />
              </div>
              <ScrollArea className="flex-1">
                <div className="p-3">
                  <AnalysisStepExpandedContent
                    step={expandedStep}
                    stepAnalysis={getStepAnalysis(expandedStep.id)}
                    logLineData={getLogLineDataForStep(expandedStep.id)}
                  />
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
