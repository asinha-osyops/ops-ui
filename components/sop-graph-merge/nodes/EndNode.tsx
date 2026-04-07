import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { Square } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DagStepNodeData } from '@/lib/hooks/useDagLayoutGeneric'
import type { StepDto } from '@/lib/api-client'

function EndNodeComponent({
  data,
  selected,
}: NodeProps<DagStepNodeData<StepDto>>) {
  const step = data.step

  return (
    <div
      className={cn(
        'group relative bg-orange-50 dark:bg-orange-950/20 border border-orange-300 dark:border-orange-800 border-l-4 border-l-destructive',
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
        className="!w-2 !h-2 !bg-destructive !border-none"
      />

      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-destructive/10 shrink-0">
          <Square className="w-3.5 h-3.5 text-destructive" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wider text-destructive mb-0.5">
            End
          </p>
          <p className="text-sm font-medium text-foreground truncate">
            {step.name}
          </p>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-destructive !border-none"
      />
    </div>
  )
}

export const EndNode = memo(EndNodeComponent)
