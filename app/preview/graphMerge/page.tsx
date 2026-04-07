'use client'

import { useState } from 'react'
import { SopGraphNew } from '@/components/sop-graph-merge/SopGraphNew'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ALL_TEST_SOPS } from '../test-data'

export default function GraphMergePage() {
  const [activeSop, setActiveSop] = useState(ALL_TEST_SOPS[0])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Graph Merge — Combined Solution
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Scratchpad for merging the best of Graph A and Graph B. Edit mode
          enabled for testing.
        </p>
      </div>

      {/* SOP selector */}
      <Tabs
        defaultValue={ALL_TEST_SOPS[0].id}
        onValueChange={(id) => {
          const sop = ALL_TEST_SOPS.find((s) => s.id === id)
          if (sop) setActiveSop(sop)
        }}
      >
        <TabsList>
          {ALL_TEST_SOPS.map((sop) => (
            <TabsTrigger key={sop.id} value={sop.id}>
              {sop.name} ({sop.steps.length} steps)
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <SopGraphNew sop={activeSop} graphHeight="h-[700px]" isEditable={true} />
    </div>
  )
}
