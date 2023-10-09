import type { Progression } from '../../types'

import m from 'mithril'
import _ from 'lodash'
import moment from 'moment'
import * as lib from "../../view/lib"

const {MD5} = require('object-hash')

export type Ctx2D = CanvasRenderingContext2D

let sentenceHeight = 50
let timestampHeight = 30

export function hsl(hue: string|number, saturation: string|number, lightness: string|number, alpha?: null|string|number): string {
  return typeof alpha != 'undefined'
    ? `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`
    : `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

/** Given a list of things non-scalar objects, returns the uniques of them. */
function unique(els:any[]): any[] {
  return els.map((el:any, i:number) => {
    const index = els.findIndex((y:any) => _.isEqual(el, y))
    if (index === i) {
      return el
    }
  })
  .filter((el:any, i:number) => el)
}

function canvasWidth(pattern: any): number {
  let unitLength = 256
  return pattern.length * unitLength
}

function canvasHeight(): number {
  return sentenceHeight + timestampHeight
}

function weightcards(cpc:number, progression:Progression) {
  let duration = progression.reduce((acc, place) => acc + place[0], 0)
  let places = progression.map((place) => place[1])
  let durs = progression.reduce((acc:any, place) => {
    let k = place[1]
    if (!acc[k]) { acc[k] = 0 }
    acc[k] += place[0]
    return acc 
  }, {})
  let us = unique(places)
  let colors = getHues(us.length)
  return m(".content", 
    lib.sectionHeading("Progression"),
    m(".columns.my-5.py-5.is-multiline.justify-content-space-around", 
    us.map((name, i) => {
      let hue = colors[i]
      const backgroundColor:string = hsl(hue, 75, 70)
      let percent:number|string = durs[us[i]] * 100 / duration
      if (percent % 1 != 0) {
        percent = (percent).toPrecision(2)
      }
      return m(".p-0.my-3", {style:{backgroundColor, flexBasis: "28%"}}, 
          m('.m-3.p-1.has-background-black.has-text-centered.has-text-white', name)
      )
    }))
  )
}


export function Prog(): m.Component<{progression:Progression, duration:number, cpc:number}> {
  let canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D;
  let width:number,height:number;
  let timestamp = 0, cue = 0;


  let ref:any, elWidth:number
const id = Math.random().toString()

  return {
    oninit: ({attrs}) => {
      canvas = document.createElement('canvas') 
    },
    oncreate: ({dom, attrs}) => { 
      ref = dom

      width  = dom.clientWidth

      canvas.width=width
      canvas.height=canvasHeight()
      dom.appendChild(canvas);
      ctx = canvas.getContext('2d') as Ctx2D
      drawPattern(ctx, width, attrs.progression, timestamp, cue, attrs.duration)
    },
    onupdate(mith) {
      // width = ref.parentNode.clientWidth
      canvas.width=width
      drawPattern(ctx, width, mith.attrs.progression, timestamp, cue, mith.attrs.duration)
    },

    view: ({attrs}) => {
      return m('details.details',
        m("summary", weightcards(attrs.cpc, attrs.progression))
      )
    }
  }
}
function getHues(n:number):number[] {
  let hueStops = _.times(n, (i:number) => {
    let hue = 360 * (i/n)
    return hue
  })
  return hueStops
}
function drawWeightedSentence(ctx:Ctx2D,words:Array<[number,string]>,unitLength:number) {
  let items:any = unique(words.map((x:any) => x[1]))

  let hueStops = getHues(items.length)

  words.reduce((x:number, el:[number,string], i:number) => {

    let [duration, word] = el
    let pos = items.indexOf(word)

    let hue = hueStops[pos]
    let wordLength:number = unitLength * duration

    const color:string = hsl(hue, 75, 70)
    ctx.fillStyle = color

    ctx.fillRect(x, 0, wordLength, sentenceHeight)
    return x + wordLength
  },0)
}

function drawPattern(ctx: CanvasRenderingContext2D, width: number, pattern: Array<[number, string]>, timestamp:number = 0, cue:number=0, duration:number) {
  let totalSize:number = pattern.reduce((sum:number, [dur, symbol]:[number,string]) => dur+sum,0)

  let unitLength = width / totalSize
  let ids:string[] = _.uniq(pattern.map((x:any) => MD5(x)))
  let progress:number = cue/duration

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  drawWeightedSentence(ctx,pattern,unitLength)
}


function watchPattern(ctx: CanvasRenderingContext2D, width: number, pattern: Array<[number, string]>, timestamp:number = 0, cue:number=0, duration:number) {
  let totalSize:number = pattern.reduce((sum:number, [dur, symbol]:[number,string]) => dur+sum,0)

  let unitLength = width / totalSize
  let ids:string[] = _.uniq(pattern.map((x:any) => MD5(x)))
  let progress:number = cue/duration

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  
  drawWeightedSentence(ctx,pattern,unitLength)

  // draw the playhead 
  let cueWidth = 8
  let cuePos = Math.floor(width * progress)
  _.range(cueWidth).forEach((i:number) => {
    // with shading over a region
    let x = cuePos - i
    ctx.fillStyle = hsl(0, 90 + (2*i), 100 - 2*i, (i+1)/cueWidth)
    ctx.fillRect(x - cueWidth, 0, 1, sentenceHeight)
  })

  // timestamp
  ctx.fillStyle = hsl(0, 0, 0)
  ctx.font = "40px sans-serif"
  let ts:string = `${moment(progress*1000).format('mm:ss')} : ${moment(duration*1000).format('mm:ss') }`
  ctx.fillText(ts, 0, sentenceHeight + 15)
}



/** A visualization of chord progression as a pattern. */
function progression(progression:Progression, duration:number, cpc:number=4) {
  return m(Prog, {progression, duration, cpc})
}


export default {
  progression
}