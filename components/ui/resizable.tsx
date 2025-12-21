'use client'

import * as React from 'react'
import { GripVerticalIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type ResizablePanelGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  direction?: 'horizontal' | 'vertical'
};

function ResizablePanelGroup({
  className,
  direction = 'horizontal',
  ...props
}: ResizablePanelGroupProps) {
  return (
    <div
      data-slot="resizable-panel-group"
      data-panel-group-direction={direction}
      className={cn(
        'flex h-full w-full',
        direction === 'vertical' && 'flex-col',
        className,
      )}
      {...props}
    />
  )
}

type ResizablePanelProps = React.HTMLAttributes<HTMLDivElement> & {
  defaultSize?: number;
};

function ResizablePanel({ className, ...props }: ResizablePanelProps) {
  return (
    <div
      data-slot="resizable-panel"
      className={cn('flex-1 min-w-[100px] min-h-[60px]', className)}
      {...props}
    />
  )
}

type ResizableHandleProps = React.HTMLAttributes<HTMLDivElement> & {
  withHandle?: boolean;
};

function ResizableHandle({
  withHandle,
  className,
  ...props
}: ResizableHandleProps) {
  return (
    <div
      data-slot="resizable-handle"
      className={cn(
        'bg-border relative flex w-px items-center justify-center ' +
          'data-[panel-group-direction=vertical]:h-px ' +
          'data-[panel-group-direction=vertical]:w-full',
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border">
          <GripVerticalIcon className="size-2.5" />
        </div>
      )}
    </div>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
