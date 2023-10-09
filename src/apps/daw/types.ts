import type { OscType, Midi, MidiVal, Cps, Duration, Freq, Amp, Mote } from '../../types'
export type Timestamp = number
export type SynthEvent = [ Timestamp, Freq, Amp ]

export type RestorePart = () => void
export type TrigSample = (now:number, when:number, amp:Amp) => void
export type PrepSample = (amp?:Amp) => TrigSample

export type SoftwareSynthPart = {
  label: string
  type: OscType
  motes: Mote[]
  oscs?: Osc[]
  out: Osc[]
}

export type Osc = OscillatorNode & {
  gain: GainNode
}

export type SamplerPart = {
  label: string
  src: string
  motes: Mote[]
}

export type AddSynthPart = (label: string, type: OscType, motes:Mote[]) => void
export type AddSamplePart = (label: string, src: string, motes:Mote[]) => void

export type SynthPlayer = {
  ctx: AudioContext
  add: AddSynthPart
  play: (onInterupt?:() => Promise<any>, onFinishRun?:(rs:number) => Promise<any>, onFinishLoops?:() => Promise<any>) => void
  loop: (numRuns:number, onInterupt?:() => Promise<any>, onFinishRun?:(rs:number) => Promise<any>, onFinishLoops?:() => Promise<any>) => void
  stop: () => void
  clear: () => void
  updateCps: (cps:Cps) => void
}


export type Sampler = SynthPlayer & {
  add: AddSamplePart
  queue: () => void
  trig: () => void
}


export type Daw = Sampler & {
  knobs: {[label:string]: GainNode}
  analyser: AnalyserNode
  addSynth: AddSynthPart
  addSample: AddSamplePart
}

