import type { ClientSpec, Spec, Melody } from '../types'
import m from 'mithril'
import axios from 'axios'
import { address } from '../conf'
import * as configuration from '../conf'
import type { AutoDjTrack } from '../apps/auto-dj/types'
export const urls:any = {
    getCompositionMidi: (id:string) => `${address.friends}/friend/composition/${id}/auto-dj`,
}
function assignSample(spec:ClientSpec) {
    const samplePath = `samples/${spec.role}.mp3`
    return {...spec, ...{src: samplePath}}
  }
  
function formFields(fields:Array<m.Vnode>):m.Vnode {
    return  m(".content", {style: {
        width: "100%", 
        maxWidth: "720px", 
        margin: "0 auto", 
        display: "flex", 
        flexDirection: "column",
        minHeight: "360px"
      }},
      fields
    )
}
  
export async function makeTrack(token:string, body:any={}):Promise<AutoDjTrack> {
    return await axios.post(configuration.address.friends + "/friend/composition/make", body, {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Accept":"application/json",
            "Content-Type":"application/json"
        }
    })
    .then(function gotResponse(response) {
        const { conf, composition } = response.data 
        composition.parts = composition.parts.map(function updateSpec([spec, events]:[Spec,Melody]) {
            spec = assignSample(spec)
            if (events.every(line => line.every(note => note[2] ==0))) {
                events.forEach(line => line.forEach(note => note[2] = 70))
            }
            return [spec, events]
        })
        return response.data
    })
}


export async function genTrack(token:string, body:any={}):Promise<AutoDjTrack> {
    return await axios.post(configuration.address.friends + "/friend/composition/gen", body, {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Accept":"application/json",
            "Content-Type":"application/json"
        }
    })
    .then(function gotResponse(response) {
        const { conf, composition } = response.data 
        composition.parts = composition.parts.map(function updateSpec([spec, events]:[Spec,Melody]) {
            spec = assignSample(spec)
            if (events.every(line => line.every(note => note[2] ==0))) {
                events.forEach(line => line.forEach(note => note[2] = 70))
            }
            return [spec, events]
        })
        return response.data
    })
}

export function getCompositionMidi(token:string, compositionId:number|string) {
    return axios.get(urls.getCompositionMidi(compositionId), {headers: {"Authorization": `Bearer ${token}`}})
    .then(function gotResponse(response) {
        const { conf, composition } = response.data 
        composition.parts = composition.parts.map(function updateSpec([spec, events]:[Spec,Melody]) {
            spec = assignSample(spec)
            if (events.every(line => line.every(note => note[2] ==0))) {
                events.forEach(line => line.forEach(note => note[2] = 70))
            }
            return [spec, events]
            })
        return JSON.stringify(response.data)
    })
}