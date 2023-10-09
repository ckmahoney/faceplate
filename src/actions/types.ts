import type { DepthValues, Composition, Progression, RequestError} from '../types'
import type { AutoDjTrack } from '../apps/auto-dj/types'
import type { AppUser } from '../components/account/types'

export type PerformanceActions = {
  remix: (compId: string, perfId: string) => Promise<any>,
  repaint: (compId: string, perfId: string) => Promise<any>,
  reroll: (compId: string, perfId: string) => Promise<any>,
  speedUp: (compId: string, perfId: string) => Promise<any>,
  slowDown: (compId: string, perfId: string) => Promise<any>
}


export type MakeCompositionResponse = AutoDjTrack

export type GetCompositionsResponse = Array<{
  compositionId: string, 
  progression: Progression
}>


export type ClaimCompositionResponse = string | false // composition id or false if cannot be claimed

export type LoginResponse = {userId:number, refresh:string,access:string}
export type LogoutResponse = string
export type GetSelfResponse = AppUser
export type MakeArcParams = {
  quality: string
  dimensions: { size:number, base:number, cpc:number }
  complexity: keyof typeof DepthValues
  nEnharmonic: number
  nMelodic: number
}