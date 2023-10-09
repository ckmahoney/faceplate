import type { 
  Progression
} from '../types'

import m from 'mithril'
import _ from 'lodash'
import moment from 'moment'

const {MD5} = require('object-hash')

export type Ctx2D = CanvasRenderingContext2D
let sentenceHeight = 50

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
  return sentenceHeight
}

export function Prog(): m.Component<{progression:Progression, duration:number}> {
  let canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D;
  let width:number,height:number;
  let pattern:any

  let hueOffset = 0


  let ref:any, elWidth:number

  return {
    oninit: ({attrs}) => {
      canvas = document.createElement('canvas') 
    },
    oncreate: ({dom, attrs}) => { 
      let timestamp = 0, cue = 0;
      ref = dom

      //@ts-ignore
      width  = dom.getBoundingClientRect().width

      canvas.width=width
      canvas.height=canvasHeight()
      dom.appendChild(canvas);
      ctx = canvas.getContext('2d') as Ctx2D

      drawPattern(ctx, width, attrs.progression, timestamp, cue, attrs.duration)
    },
    onupdate() {
      width  = ref.parentNode.getBoundingClientRect().width
      canvas.width=width
    },

    view: ({attrs}) => {
      return m('.')
    }
  }
}


function drawWeightedSentence(ctx:Ctx2D,words:Array<[number,string]>,unitLength:number) {
  let items:any = _.uniq(words.map((x:any) => x[1]))

  let nColors = items.length

  let hueStops = _.times(nColors, (i:number) => {
    let hue = 360 * (i/nColors)
    return hue
  })


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

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  
  drawWeightedSentence(ctx,pattern,unitLength)
console.log("finished draw")
/*
  let h = pattern.length*cue*360

  // draw the playhead 
  let cueWidth = 8
  _.times(cueWidth, (i:number) => {
    let x = cue * width + i

    ctx.fillStyle = hsl(h+i, 90 + (2*i), 85 + (3*i), (i+1)/cueWidth )
    ctx.fillRect(x - cueWidth, 0, 1, sentenceHeight)
  })

  // timestamp
  ctx.fillStyle = hsl(h, 90, 15)
  ctx.font = "40px sans-serif"
  let ts:string = `${moment(cue*duration*1000).format('mm:ss')} : ${moment(duration*1000).format('mm:ss') }`
  ctx.fillText(ts, 0, sentenceHeight * 2)
*/
}


/** A visualization of chord progression as a pattern. */
function progression(progression:Progression, duration:number) {
  return m(Prog, {progression, duration})
}

export default {
  progression
}