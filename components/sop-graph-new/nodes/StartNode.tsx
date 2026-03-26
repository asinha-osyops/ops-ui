import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DagStepNodeData } from '@/lib/hooks/useDagLayoutGeneric'
import type { StepDto } from '@/lib/api-client'

function StartNodeComponent({
  data,
  selected,
}: NodeProps<DagStepNodeData<StepDto>>) {
  const step = data.step
  const direction = data.stepAccessors ? 'TB' : 'TB'

  return (
    <div
      className={cn(
        'group relative bg-card border border-border border-l-4 border-l-green-500 dark:border-l-green-400',
        'rounded-lg shadow-sm px-4 py-3',
        'transition-all duration-200',
        'hover:shadow-md hover:scale-[1.02]',
        selected && 'ring-2 ring-ring ring-offset-2 ring-offset-background'
      )}
      style={{ width: 200 }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-green-500 !border-none"
      />

      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-green-500/10 dark:bg-green-400/10 shrink-0">
          <Play className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wider text-green-600 dark:text-green-400 mb-0.5">
            Start
          </p>
          <p className="text-sm font-medium text-foreground truncate">
            {step.name}
          </p>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-green-500 !border-none"
      />
    </div>
  )
}

export const StartNode = memo(StartNodeComponent)
