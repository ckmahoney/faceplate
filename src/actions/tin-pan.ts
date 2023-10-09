import type { Midi, StubComposition, MidiLine, Melody , Capture } from '../types'
import type { MakeArcParams, MakeCompositionResponse, ClaimCompositionResponse } from './types'
import type { AutoDjTrack } from '../apps/auto-dj/types'

import { apiUrls } from './conf'
import m from 'mithril'
import _ from 'lodash'
import * as check from '../checks'

import axios from 'axios'
import MidiWriter from 'midi-writer-js'


function genComposition(token:string): Promise<MakeCompositionResponse> {
  return m.request({
    method: 'POST',
    url: apiUrls.genComposition,
    headers: {Authorization: `Bearer ${token}`},
  }).then(function verify(response:any):AutoDjTrack {
    if (!response) {
      console.log(response)
      throw new Error("Big problem on repsonse")
    }
    if (!check.is.conf(response.conf)) {
      console.log("Expected to get a composition, but got this instead")
      console.log(JSON.stringify(response))
      throw new Error("BadResponseValue")
    }
    if (!check.is.composition(response.composition)) {
      console.log("Expected to get a composition, but got this instead")
      console.log(JSON.stringify(response))
      throw new Error("BadResponseValue")
    }
    return response
  })
}


async function makeComposition(token:string, params:MakeArcParams): Promise<MakeCompositionResponse> {
  return m.request({
    method: 'POST',
    url: apiUrls.makeComposition,
    headers: {Authorization: `Bearer ${token}`},
    body: params
  }).then(function verify(response:any):AutoDjTrack {
    if (!response) {
      console.log(response)
      throw new Error("Big problem on repsonse")
    }
    if (!check.is.conf(response.conf)) {
      console.log("Expected to get a composition, but got this instead")
      console.log(JSON.stringify(response))
      throw new Error("BadResponseValue")
    }
    if (!check.is.composition(response.composition)) {
      console.log("Expected to get a composition, but got this instead")
      console.log(JSON.stringify(response))
      throw new Error("BadResponseValue")
    }
    return response
  })
}

export function capture(token: string, compositionId:number):Promise<Capture> {
  return new Promise<Capture>((res, rej) => {
    return m.request<Capture>({
      method: "POST",
      url: `${apiUrls.address.friends}/friend/capture/${compositionId}`,
      headers: {Authorization: `Bearer ${token}`}
    }).then(res)
  })
}


export function patchCapture(token: string, captureId:number, body:any):Promise<Capture> {
    return axios.patch(apiUrls.updateCapture + "/" + captureId, body, {
      headers: {
          "Authorization": `Bearer ${token}`, 
          "Content-Type": "application/json"
      }
    })
    .then((r:any) => {console.log(r); return r})
    .catch((r:any) => {console.error(r); return r})
}

function getUserCompositions(token:string): Promise<Array<Capture>> {
  return m.request<Array<Capture>>({
    method: 'GET',
    url: apiUrls.address.friends + "/friend/collection",
    headers: {Authorization: `Bearer ${token}`}
  })
  .catch((getErr) => {
    console.log("Error loading collection")
    console.log(getErr)
    return []
  })
}
type MidiNote = [dur: number, pitches:Array<number>, velocities:Array<number>]
type Spool = Array<MidiNote>

export function toSpool(melody:Melody):Spool {
  return melody.reduce(function createSpool(ms:Spool, line:MidiLine, v):Spool {
      if (v ==0) {
        return line.map(function convertFirstLine(midinote:Midi) {
          return [midinote[0], [ midinote[1] ], [ midinote[2] ] ]
        })
      } else {
        line.forEach((midinote:Midi, i) => {
            let prev = ms[i]
            prev[1].push(midinote[1])
            prev[2].push(midinote[2])
        })
      }
      
      return ms
  }, [])
}

export function toMidiTrack(melody:Melody):MidiWriter.Track {
  //@ts-ignore
  const tickDur = MidiWriter.Utils.getTickDuration("4")
  const spool =  toSpool(melody)
  let track = new MidiWriter.Track

  track = spool.reduce(function createTrack([cursor, tr]:[number, MidiWriter.Track], note:MidiNote):[number, MidiWriter.Track] {
      let pitch = _.uniq(note[1])
      const data:any = {
          pitch: pitch, 
          duration: 'T' + note[0] * tickDur,
          velocity: 100,
          wait: 'T' + cursor * tickDur
        }
        const event = new MidiWriter.NoteEvent({...data, sequential: false})
      tr.addEvent(event);
      return [cursor + note[0], tr]
  }, [0, track])[1]

  return track
}

export default { 
  capture,
  patchCapture,
  genComposition,
  makeComposition,
  getUserCompositions,
  toSpool,
  toMidiTrack
} 