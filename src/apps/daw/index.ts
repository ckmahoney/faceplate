import type { OscType,Midi, MidiVal, Cps, Duration, Freq, Amp, Mote } from '../../types'
import type { Daw, SynthPlayer, SoftwareSynthPart, SamplerPart, Sampler,  Osc, RestorePart, SynthEvent, PrepSample, TrigSample } from './types'

import _ from 'lodash'


type HookInterrupt = () => Promise<any>
type HookFinishRun = (numRuns:number) => Promise<any>
type HookFinishLoops = () => Promise<any>

// @chatgpt
export function midiToFreq(midiNote:number, referenceHz:number = 440):number {
  const semitoneRatio = 2 ** (1 / 12);
  const midiNoteOffset = midiNote - 69; // MIDI note A4 is 69

  // Calculate the frequency using the formula: frequency = referenceHz * (semitoneRatio ^ midiNoteOffset)
  const frequency = referenceHz * (semitoneRatio ** midiNoteOffset);
  return frequency;
}


function createReverbNode(context:AudioContext, decayTime = 1.2) {
  const reverbNode = context.createConvolver();

  // Create an impulse response buffer for the reverb
  const bufferLength = context.sampleRate * decayTime;
  const impulseResponse = context.createBuffer(2, bufferLength, context.sampleRate);

  // Fill the buffer with random noise for a simple reverb effect
  for (let channel = 0; channel < impulseResponse.numberOfChannels; channel++) {
    const channelData = impulseResponse.getChannelData(channel);
    for (let i = 0; i < bufferLength; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferLength, 2);
    }
  }

  reverbNode.buffer = impulseResponse;

  return reverbNode
}


function loadSample(ctx:AudioContext, mix:GainNode, src:string):PrepSample  {
  let buff:any; 
  const request = new XMLHttpRequest();
    
  request.open("GET", src, true);
  request.responseType = "arraybuffer";
  request.onload = function bufferDataLoaded(){
    ctx.decodeAudioData(request.response,  function onDecoded(buffer:any) {
        buff = buffer;
    })
  }

  request.send();
  return function make(a?:number):TrigSample {
    if (!buff) { console.warn("Attempted to create a sample before buffer is ready"); return (a:any) => {}   }

    const bufferSource:any = ctx.createBufferSource();  
    bufferSource.buffer = buff
    bufferSource.gain = ctx.createGain()
    bufferSource.connect(bufferSource.gain)
    bufferSource.gain.connect(mix)

    return function shoot(now:number, when:number = 0, amp?:number) {
      bufferSource.gain.gain.setValueAtTime(amp ?? a, now + when)
      let timeoutId:any = setTimeout(() => {
        bufferSource.start()
      }, when * 1000)
      return timeoutId
    }
  }
}

function createOsc(ctx:AudioContext, mix:GainNode, type:OscType):Osc {
  const gain = ctx.createGain()
  //@ts-ignore
  if (type == "saw") { type = "sawtooth"}
  //@ts-ignore
  if (type == "pulse") { type = "square"}
  const osc = new OscillatorNode(ctx, {type}) as Osc

  // minimal controls on the synth. Give it amplitude control.
  osc.gain = gain
  osc.connect(osc.gain)
  osc.gain.connect(mix)

  return osc
}

function numNodes(motes:Mote[]):number {
  return motes.reduce((n:number, m:Mote) => {
    return (Array.isArray(m[1]) && m[1].length > n) ? m[1].length :n
  }, 1)
}

function getDuration(cps:number, motes:Mote[]):Duration {
  return motes.reduce((d:Duration, m:Mote) => {
    return d + (m[0]/cps)
  }, 0)
}

/** In place of a final silence note event, this uses a timeout to turn off the synth when the audio is done. */
function applyEndpoint(oscs:Osc[], duration:Duration) {
  oscs.forEach((osc:Osc) => {  
    setTimeout(() => { try { osc.stop(); } catch {} } , duration * 1000)
  })
}

/** Given a playback rate, number of oscillators, a melody and when to start, returns a list of timestamps and amplitudes to apply for a software synth player. */
function createSynthEvents(cps:number, nNodes:number, startTime:number, motes:Mote[]):SynthEvent[][] {
  return motes.reduce(function scheduleMotes(events:SynthEvent[][], mote:Mote, i:number) {
    const dur:Duration = (i == 0)
      ? 0
      : motes[i-1][0]/cps

    const when = (i == 0) 
      ? startTime 
      : (events[i - 1][0][0]) + dur


    let stack:SynthEvent[] = []
    if (Array.isArray(mote[1])) {
      const ampMod = (2/3) ** mote[1].length
      mote[1].forEach((freq:Freq) => {
        stack.push([ when, freq, mote[2] as Amp * ampMod ])
      })  
    } else {
      // silence the nodes that are not playing chord tones at the moment
      stack = _.range(nNodes).map((i:number):SynthEvent => {
        if (i == 0) {
          // @ts-ignore we know this is a number
          return [ when, mote[1], mote[2] ]
        } else {
          return [ when, 0, 0 ]
        }
      })
    }

    return [...events, stack]
  }, [] as SynthEvent[][])
}


function createSamplerEvents(cps:number, motes:Mote[]):SynthEvent[] {
  const startTime:number = 0
  return motes.reduce((events:SynthEvent[], mote:Mote, i:number) => {
    const dur:Duration = (i == 0)
      ? 0
      : motes[i - 1][0]/cps

    const when = (i == 0) 
      ? startTime 
      : (events[i - 1][0]) + dur

    // @ts-ignore
    let next:SynthEvent = [ when, mote[1], mote[2] ]
    return [...events, next]
  }, [] as SynthEvent[])
}


/** Given a playback rate and object of playback data, start playing the provided data. */
function playMotes(cps:Cps, part:SoftwareSynthPart, when:number) {
  let duration:Duration = getDuration(cps, part.motes)        

  // software synths
  let oscs = part.out as Osc[]
  const events = createSynthEvents(cps, oscs.length, when, part.motes)

  events.forEach((es:SynthEvent[]) => {
    es.forEach((event:SynthEvent, i) => {
       const osc = oscs[i]
       osc.frequency.setValueAtTime(event[1], event[0])
       osc.gain.gain.setValueAtTime(event[2] / 12, event[0])
    })
  })
  applyEndpoint(oscs, duration)
  oscs.forEach((osc:Osc) => { osc.start() })
  return duration
}



/** Interface for sending note events to a software synthesizer */
export function createSynthPlayer(ctx:AudioContext, mix:GainNode):SynthPlayer {
  let parts:{[k:string]:SoftwareSynthPart} = {}
  let cps:number = 1
  let timeOuts:any[] = []
  let restore:RestorePart = function restoreParts() {
     restores.forEach(r => r())
  }
  let onHalt:null|Function;
  // capture the part adder for replacing parts on stop
  let restores:Array<RestorePart> = []
  let synthPlayer = { 
    ctx,
    add:function addSynthPart(label:string, type:OscType, motes:Mote[]) {
      let add_:RestorePart = function restorePart() {
        let part:SoftwareSynthPart

        // Parts with polyphony, like chords, require an oscillator for each phon.
        let out:Osc[] = _.range(numNodes(motes)).map(i => createOsc(ctx, mix, type))
        part = { label, motes, type, out }

        parts[label] = part
      }
      restores.push(add_)
      add_()
    },
    play(onInterrupt:HookInterrupt, onFinishRun:HookFinishRun) {
      const now = ctx.currentTime
      onHalt = onInterrupt
      let duration:number = 0
      Object.values(parts).forEach((part:SoftwareSynthPart) => {
        duration = playMotes(cps, part, now)
      })

      timeOuts.push(setTimeout(() => onFinishRun(0), 1000*duration))
      return duration
    },
    loop(numRuns:number, onInterrupt:HookInterrupt, onFinishRun:HookFinishRun, onFinishLoops:HookFinishLoops) {       
      let n = numRuns
      let duration:number
      let interrupted = false
      onHalt = () => {
        interrupted = true 
        onInterrupt();
      }

      function handleLoop(dur:number) {
        if (interrupted) return 
        n -= 1

        if (n > 0) {
          restore()
          loop()        
          onFinishRun(n)
        } else {
          onFinishRun(0)
          onFinishLoops()
        }
      }

      function loop() {
        duration = synthPlayer.play(onInterrupt, () => Promise.resolve())
        timeOuts.push(setTimeout(() => handleLoop(duration), duration * 1000))
      }
      loop()
    },
    stop() {
      if (typeof onHalt == 'function') {
        onHalt()
      }
      timeOuts.forEach((id) => {
        try { clearTimeout(id) } catch { /* ok */ }
      })
      Object.values(parts).forEach((part:SoftwareSynthPart) => {
        let oscs:Osc[] = part.out
        oscs.forEach((o:Osc) => { 
          try { o.stop() } catch {/* ok */  } 
        })

      })
      onHalt = null
      timeOuts = []
      restore()
    },
    clear:() => {
      parts = {}
      restores = []
    }, 
    updateCps:(newCps:number) => { cps = newCps } 
  }

  return synthPlayer
}


/** Interface for sending note events to software synths playing arbitrary waveforms in the browser */
export function createSamplePlayer(ctx:AudioContext, mix:GainNode, sampleSources:string[]):Sampler {
  let timeOuts:any[] = []
  let onHalt:null|Function;

  // load the reference samples once; make copies for each instance
  let makes:{[k:string]:PrepSample} = {}
  let parts:{[k:string]:SamplerPart} = {}
  let upcomingEvents:any[]  =  []

  let restore:RestorePart = function restoreParts() {
     restores.forEach(r => r())
  }

  // capture the part adder for replacing parts on stop
  let restores:Array<RestorePart> = []
  let cps:Cps = 1

  function trig(src:string, when:number = 0, amp = 1) {
      const now = ctx.currentTime
      let shoot:TrigSample = makes[src]()
      let eventId:any = shoot(now, when, amp)
      upcomingEvents.push(eventId)
  }

  function queue(src:string, motes:Mote[]) {
    const events:SynthEvent[] = createSamplerEvents(cps, motes)
    events.forEach((event:SynthEvent) => {
      let [ when, freq, amp ] = event
      trig(src, when, amp)
    })

    let finalDur:number = _.last(motes)![0]/cps
    let duration:number = finalDur + _.last(events)![0]
    return duration 
  }

  function load(src:string) {
    makes[src] = loadSample(ctx, mix, src)
  }

  sampleSources.forEach((s:string) => { load(s) })

  let sampler:any = { 
    ctx, 
    add: (label:string, src:string, motes:any[]) => {
      let add_ = () => {
        let part:SamplerPart = { label, src, motes }
        parts[label] = part
      }
      restores.push(add_)
      add_()
    },
    trig,
    queue,
    play(onInterrupt:HookInterrupt, onFinishRun:HookFinishRun) {
      onHalt = onInterrupt;
      const now = ctx.currentTime
      let duration:number = 0
      Object.values(parts).forEach((part:SamplerPart) => {
        duration = queue(part.src, part.motes)
      })  
      timeOuts.push(setTimeout(() => onFinishRun(0), 1000*duration))
      return duration
    },
    loop(numRuns:number, onInterrupt:HookInterrupt, onFinishRun:HookFinishRun, onFinishLoops:HookFinishLoops) {       
      let n = numRuns
      let duration:number
      let interrupted = false 
      onHalt = () => {
        interrupted = true 
        onInterrupt();
      }

      function handleLoop(dur:number) {
        if (interrupted) return 
        n -= 1

        if (n > 0) {
          restore()
          loop()        
          onFinishRun(n)
        } else {
          onFinishRun(0)
          onFinishLoops()
        }
      }

      function loop() {
        duration = sampler.play(onInterrupt, () => Promise.resolve())
        setTimeout(() => handleLoop(duration), duration * 1000)
      }
      loop()
    }, 
    stop() {
      if (typeof onHalt == 'function') {
        onHalt()
      }
      timeOuts.forEach((id) => {
        try { clearTimeout(id) } catch { /* ok */ }
      })
      upcomingEvents.forEach((eventId:any) => {
        try { clearTimeout(eventId) } catch (e){ /* ok */ }
      })
      onHalt = null
      timeOuts = []
      restore()
    },
    clear: () => {
      parts = {}
      restores = []
      upcomingEvents = []
    }, 
    updateCps: (newCps:number) => { cps = newCps }
  }

  return sampler
}

type PlayState = "playing" | "loading" | "stopped"
export type ChangeData = {
  cps: number
  prevState: PlayState
  currState: PlayState
}
export function createDaw(onStateChange:(changeData:ChangeData)=>void, sampleSources:string[]):Daw {
  let cps:number = 1
  let ctx = new AudioContext()
  let state:PlayState = "loading"
  const submixSynth = new GainNode(ctx)
  const submixSample = new GainNode(ctx)

  const synths = createSynthPlayer(ctx, submixSynth)
  const samples = createSamplePlayer(ctx, submixSample, sampleSources)  
  let analyser = new AnalyserNode(ctx, {
      fftSize: Math.pow(2,11),
      maxDecibels: 0,
      minDecibels: -90,
      smoothingTimeConstant: 0.5,
  })
  const reverb = createReverbNode(ctx)

  const gain = new GainNode(ctx)
  submixSynth.connect(gain)
  submixSample.connect(gain)
  
  gain.connect(ctx.destination)
  gain.connect(analyser)

  const knobs:{[label:string]: GainNode} = {
    gain, 
    reverb: new GainNode(ctx)
  }

  knobs.gain.gain.value = 0.5
  knobs.reverb.gain.value = 0.25

  knobs.gain.connect(reverb)
  reverb.connect(knobs.reverb)

  for (let k in knobs) {
      knobs[k].connect(ctx.destination)
  }

  let daw = { 
    ctx,
    analyser,
    knobs,
    //@ts-ignore
    add: () => { return [ this.addSample, this.addSynth ] },
    trig: samples.trig,
    queue: samples.queue,
    addSample(label:string, src:string, motes:any[]) {
      samples.add(label, src, motes)
    },
    addSynth(label:string, type:OscType, motes:Mote[]) {
      synths.add(label, type, motes)
    },
    play(onInterrupt:HookInterrupt, onFinishRun:HookFinishRun, onFinishLoops?:HookFinishLoops) {
      let prev = state;
      synths.play(onInterrupt, onFinishRun, onFinishLoops)
      samples.play(onInterrupt, onFinishRun, onFinishLoops)
      state = "playing"
      onStateChange({cps, prevState: prev, currState: state})
    },
    loop(numRuns:number, onInterrupt:HookInterrupt, onFinishRun:HookFinishRun, onFinishLoops:HookFinishLoops) {       
      synths.loop(numRuns, onInterrupt, onFinishRun, onFinishLoops)
      samples.loop(numRuns, onInterrupt, onFinishRun, onFinishLoops)
    }, 
    stop() {
      synths.stop()
      samples.stop()
    },
    clear() {
      synths.clear()
      samples.clear()
    }, 
    updateCps(c:number) { 
      if (c < 0.1) return;

      cps = c
      synths.updateCps(cps)
      samples.updateCps(cps)
    }
  }
  return daw
}


