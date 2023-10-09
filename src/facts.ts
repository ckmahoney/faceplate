import type { AutoDjTrack } from './apps/auto-dj/types'

export const emptyTrack:AutoDjTrack = {
    ids: { conf: -1, composition: -1 },
    conf: { 
      origin: "F minor",
      cps: 2.1,
      duration: 64,
      transposition: 0,
      title: "<empty>",
    },
    composition: {
      quality: "minor",
      dimensions: {
        size: 0,
        cpc: 1,
        base: 2
      },
      duration: 64,
      progression: [],
      parts: []
    }
  }