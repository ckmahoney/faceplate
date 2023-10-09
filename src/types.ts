import type { Daw } from './apps/daw/types'
import type { AutoDjTrack } from './apps/auto-dj/types'

export type Float = number
export type Range = number
export type NonZeroFloat = number

export type PosNonZeroFloat = number
export type PosInt = number 
export type ByteSigned = number // The values 0 to 127
export type Id = string

type Atom<T> = T
interface PatternPlus<T> extends Array<PatternPlus<T> | Atom<T>> {}
export type Pattern<T> = Atom<T> | PatternPlus<T>;


export type Quality = "major" | "minor";
export type Size
 = -4
 | -3
 | -2
 | -1
 | 0
 | 1
 | 2
 | 3
 | 4
 | 5
 | 6

export type Cpc 
  = 1
  | 2
  | 3
  | 4 
  | 5
  | 6
  | 7
  | 8
  | 9 
  | 10
  | 11 
  | 12

export type Beat
  = 'kick' 
  | 'perc' 
  | 'hats' 
  
export type Inst
  = 'lead' 
  | 'bass' 
  | 'chords'

export type Role 
  = Beat
  | Inst


export type Register = 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 


export type OscType
  = "sine" 
  | "square" 
  | "sawtooth" 
  | "triangle"


export type Root = number

export type Step = NonZeroFloat
export type Tala = Step[]

export type Cps = PosNonZeroFloat
export type Duration = PosNonZeroFloat
export type Position = Float
export type Freq = PosNonZeroFloat
export type Amp = Range
export type Volume = Range
export type Vel = ByteSigned
export type MidiVal = PosInt
export type SignedByte = PosInt


export type Midi  = [ Duration, MidiVal, SignedByte ]
export type Mote  = [ Duration, Freq, Range ]

export type MoteBook = {
  [label: string]: Array<Mote>
}

export type MidiChanges = Array<MidiVoicing>


export type IndexRoot = number
export type MidiVoicing = [ IndexRoot, MidiVal[] ]

export type MidiNote = [ Step, MidiVal | MidiVal[], Vel ]
export type PitchClass = string
export type ChordLabel = string

export type Place = [ Duration, ChordLabel ] 
export type Progression = Array<Place>

export type ChromaVal = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

 


export type Conf = {
  id?: number
  origin: ChordLabel
  cps: Cps
  duration: number
  transposition: ChromaVal
  title: string
}


export type Dimensions =  { 
  base: number
  size: number
  cpc: number
}

export type Spec = {
  role: string  
  register: number
  fill: string
  type?: OscType
  src?: string
}


export type MidiLine = Array<Midi>
export type Melody = Array<MidiLine>


export type Composition = {
  id?:any
  quality: Quality
  dimensions: Dimensions
  duration:number
  progression: Progression
  parts: Array<[
   Spec, 
   Melody
  ]>
}

export type StubComposition = {
  compositionId: string
  progression: Progression
  specs: Spec[]
}

export type Performance = {
  id: number
  createdAt: string|Date;
  updatedAt: string|Date;
  userId: number;
  compositionId: number;
  status: string;
  url: string;
}

export type Capture = {
  captureId: number
  compositionId: number
  createdAt: Date
  notes: string
  title: string
  performances: Array<Performance>
  generationParams:string
  favorite?: boolean
}

export type RequestError = {error:string}

export type SampleParam = { src: string, midiEvents: Midi[] }

export type HigherOrderFx = void


export type ClientProgression = Array<[number, string]>
export type ClientSpec = {
  role: string  
  register: number
  fill: string
  type?: OscType
  src?: string
}

export type ClientComposition = {
  quality: string
  dimensions: Dimensions
  progression: ClientProgression
  parts: Array<[
      ClientSpec,
      Midi[][]
  ]>
}

export type JSONParsesTo<Value> = string
export type Cache<Of> = {
  [resourceId:string]: JSONParsesTo<Of>
}
export type PlayControl = {
  daw:Daw
  playing:boolean
  curr: AutoDjTrack|null
  fetching:Promise<any>|null
  cache: Cache<AutoDjTrack>
  get: (compositionId:number) => Promise<AutoDjTrack|null>
  load: (composition:Composition) => PlayControl
  play: (compositionId:number, onTrackComplete:(remaining:number)=>void) => Promise<PlayControl>
  loop: (compositionId:number, onRunComplete:(nCompleted:number)=>void,  onLoopEnd:()=>void, n?:number) => Promise<PlayControl>
  stop: () => Promise<PlayControl>
  updateCps: (cps:number) => PlayControl
}
export type Editor<V> = {
    from: V
    curr: V
    update:(next:Capture) => Promise<any>
    save:() => Promise<any>
    cancel:() => Promise<any>
}

export enum DepthValues {
  simple = "simple",
  standard = "standard",
  complex = "complex",
}