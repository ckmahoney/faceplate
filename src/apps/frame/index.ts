import m from 'mithril'
import _ from 'lodash'

import { drawSamples, getSquareDimensions, drawColoredSamples, waveformSamples, hslString, drawPoint, colorPoint, drawGrid,  } from './tools'
import {CanvasFrame} from './canvas-frame'

type Dimensions = {
  frameWidth: number;
  frameHeight: number;
  appPadWidth: number;
  appPadHeight: number;
}
type Ft = (t:number) => number
type Ctx2D = CanvasRenderingContext2D

const pi = Math.PI

function makeWaves(nSamples:number) {
  let lows = [3, _.range(1, 8)]
  let mids = [2, _.range(12, 20)]
  let highs = [1, _.range(20, 40)]



  //@ts-ignore lodash empty on range
  return ([lows, mids, highs]).map(([max, rs]: [number, number[]], i:number) => {
    let r = _.sample(rs)
    if (window.innerWidth < 768) {
      r = Math.ceil(r/2)
    }
    const height = 0.95 + Math.random()/2
    return waveformSamples(r * nSamples, (t:number) => height * Math.sin(r * t))
  })
}

function makeQuality(type:string, nSamples:number) {
  let fs:any[] = [
    Math.sin, 
    Math.cos, 
    Math.tan,
    Math.sinh, 
    Math.tanh,
    // Math.atanh,
    // Math.asinh,
    // Math.acosh,
  ]
  let nFs = 3
  let selections = _.range(nFs).map(() => _.sample(fs))

 
  let f = (t:number) => {
    return selections.reduce((acc:number, f:any, i:number, arr:any[]) => {
      return acc + (f(t)/(arr.length+1))
    }, 0)
  }
  let freqs:number[] = []
  if (type == "major") {
    freqs = [ 1, 3, 5 ] 
  } else {
    freqs = [ 1, 1/3, 1/5 ]
  }
  //@ts-ignore lodash empty on range
  return freqs.map((r, i:number) => {
    const height = 0.95 + Math.random()/2
    return waveformSamples(r * nSamples, (t:number) => height * f(r * t))
  })
}


export function Frame(): m.Component<{content: m.Vnode|m.Vnode[], dimensions:Dimensions, quality?:string|null, cps?:number|null}> {
  let N_SAMPLES = (window.innerWidth < 768) 
    ? 550
    : 500

    let cheapHash = ""
  // let waveTable:Array<number[]> = makeWaves(N_SAMPLES)
  let waveTable:Array<number[]> = makeQuality("major", N_SAMPLES)
  let q:string|null=null
  let tempo = 0
  return { 
      oninit:({attrs}) => {
        tempo = attrs.cps || _.clamp(Math.random() / 8, 0.04)
      },
      onupdate: ({attrs}) => {
        let { cps, quality } = attrs
        let k = JSON.stringify({cps,quality})
        if (k == cheapHash) {
          return
        }
        cheapHash = k
        if (!attrs.quality) { quality = "major" } 
        else { quality = attrs.quality.split(" ")[1].toLowerCase() }

        N_SAMPLES = (window.innerWidth < 768) 
        ? 550
        : 500
        if (attrs.quality != q) {
          waveTable = makeQuality(quality, N_SAMPLES)
        }
      },
      view: ({attrs}) => {
        let scaleTime = attrs.cps ?? tempo
        let quality;
        if (!attrs.quality) { quality = "major" } 
        else { quality = attrs.quality.split(" ")[1].toLowerCase() }

        scaleTime *= quality == "major" ? 1 : -1

        const { dimensions } = attrs
        let offsetTop = (dimensions.frameHeight + dimensions.appPadHeight) /2
        let offsetLeft = (dimensions.frameWidth + dimensions.appPadWidth) /2
        let maxAppWidth = window.innerWidth - (offsetLeft*2)
        let maxAppHeight = window.innerHeight - (offsetLeft*2)
        let appStyle = {style : {
          position: "absolute",
          top: `${offsetTop}px`, 
          left: `${offsetLeft}px`,
          width: `${maxAppWidth}px`,
          maxWidth: `${maxAppWidth}px`,
          height: `${maxAppHeight}px`,
          maxHeight: `${maxAppHeight}px`,
          overflow: "scroll"
        }}

        return  m('section', 
        m(CanvasFrame, { waveTable, scaleTime, borderX: dimensions.frameWidth, borderY: dimensions.frameHeight } ),
        m("div", appStyle, attrs.content)
       )
      }
  }
}

export default {
  Frame
}