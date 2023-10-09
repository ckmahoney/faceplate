import type { Conf, Composition, PlayControl } from '../../types'
import type { MakeArcParams  } from '../../actions/types'
import type { Daw } from '../../apps/daw/types'
export type AutoDjTrack = {
  ids?: {conf: number, composition: number}
  conf: Conf
  composition: Composition
}


export type AutoDj = {
  curr:null|AutoDjTrack
  next:null|AutoDjTrack
  tracks: AutoDjTrack[]
}

