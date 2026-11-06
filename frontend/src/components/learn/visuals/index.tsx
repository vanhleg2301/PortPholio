import { lazy, Suspense } from 'react'
import type { VisualId } from '@/data/lessons/types'
import { BucketSortVisual, PrefixSuffixVisual, TwoSumVisual } from './arrays'
import { HandshakeVisual, HeadOfLineVisual, SlowStartVisual } from './network'
import { AliasingVisual, SlicingVisual } from './python'
import { CallStackVisual, DynamicArrayVisual, HashTableVisual, HeapVisual } from './structures'

// three.js is large, so the 3D globe has its own chunk.
const GlobeVisual = lazy(() => import('./globe'))

function LazyGlobe({ caption }: { caption?: string }) {
  return (
    <Suspense fallback={<div className="aspect-square w-full max-w-sm animate-pulse rounded-full bg-foreground/[0.04] mx-auto" />}>
      <GlobeVisual caption={caption} />
    </Suspense>
  )
}

const VISUALS: Record<VisualId, (props: { caption?: string }) => React.JSX.Element> = {
  aliasing: AliasingVisual,
  slicing: SlicingVisual,
  'dynamic-array': DynamicArrayVisual,
  'hash-table': HashTableVisual,
  'call-stack': CallStackVisual,
  heap: HeapVisual,
  'two-sum': TwoSumVisual,
  'prefix-suffix': PrefixSuffixVisual,
  'bucket-sort': BucketSortVisual,
  handshake: HandshakeVisual,
  'slow-start': SlowStartVisual,
  'hol-blocking': HeadOfLineVisual,
  globe: LazyGlobe,
}

// Loaded lazily from LessonView, so the animations only download with a lesson that uses them.
export default function LessonVisual({ id, caption }: { id: VisualId; caption?: string }) {
  const Visual = VISUALS[id]
  return <Visual caption={caption} />
}
