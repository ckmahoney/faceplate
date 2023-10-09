import type { Quality, ChromaVal, Progression, Midi, SampleParam } from '../../types'
import type { ClaimCompositionResponse } from '../../actions/types'

type SharpName = string
type FlatName = string
export type PitchName = [ ChromaVal, SharpName, FlatName ]

export type PlaybackAttrs = {
  duration: number
  title: string
  bpm: number
}

export type PlayviewAttrs = {
  playback: PlaybackAttrs,
  progression: Progression
  quality: Quality
  chroma: ChromaVal
}


