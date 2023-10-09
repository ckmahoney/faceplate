import { drawSamples,   getRectDimensions, getSquareDimensions, waveformSamples, hslString, drawPoint, colorPoint, drawGrid } from './tools'
import m from 'mithril'
import _ from 'lodash'

type ArrayIndex = number

type Ft = (t:number) => number
type Ctx2D = CanvasRenderingContext2D
const pi = Math.PI

type SelectSample = (canvasWidth:number, canvasHeight:number, samples:number[]) => ArrayIndex[]
type MapFunction<T> = (x:T, i:number, as?:Array<T>) => boolean

function findIndices<T>(arr:Array<T>, fn:MapFunction<T>) {
  return arr.map((x, i) => {
    if (fn(x, i, arr)) { return i }
  }).filter((x:number|null) => x)
}
type CFrameAttrs = {scaleTime:number, waveTable:number[][],  borderX:number, borderY:number}
export  function CanvasFrame(): m.Component<CFrameAttrs> {
  let hash:string = ""
  let canvas: HTMLCanvasElement
  let ctx:Ctx2D
  let dims = getRectDimensions()
  let width = dims, height = dims
  let animate:FrameRequestCallback
  let waveTable: number[][] = []
  let frames:Array<number[][]>

  window.onresize = reportWindowSize;
  function reportWindowSize() {
    dims = getRectDimensions()
    canvas.width = dims.w
    canvas.height = dims.h
  }
  let colors: string[];

  function getRender(attrs:CFrameAttrs, canvas:any) {
    ctx = canvas.getContext('2d')
    let dHue = 360/attrs.waveTable.length
    colors = attrs.waveTable.map((a:any, i:number) => {
      let hue = dHue * i
      let sat = 100
      let lum = 12
      return hslString([hue, sat, lum])
    })


    let filtersX:Array<SelectSample> = [
      function borderLeft(w:number, h:number, samples:number[]) {
        let dx = w/samples.length
        return findIndices(samples,(val:number, x:number) => {
          val = val / 2 + 0.5
          let xPos = x * dx
          return true
          // return (xPos < attrs.borderX)
        })
      },
      // function borderRight(w:number, h:number, samples:number[]) {
      //   let dx = w/samples.length
      //   return findIndices(samples, (val:number, x:number) => {
      //     val = val / 2 + 0.5
      //     let xPos = x * dx
      //     return true
      //     // return (xPos >= (w - attrs.borderX))
      //   })
      // }
    ]
    
    let filtersY:Array<SelectSample> = [
      function borderTop(w:number, h:number, samples:number[]) {
        return findIndices(samples,(val:number, x:number) => {
          val = val / 2 + 0.5
          let yPos = val * h
          return true
          // return (yPos < attrs.borderY)
        })
      },
      // function borderBottom(w:number, h:number, samples:number[]) {
      //   return findIndices(samples, (val:number, x:number) => {
      //     val = val / 2 + 0.5
      //     let yPos = val * h
      //     return true
      //     // return (yPos >= (h - attrs.borderY))
      //   })
      // }
    ]

    return function drawSineFrame(t:number=0) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      waveTable.forEach(function drawFilteredWaveform(period, waveNum:number) {
        let sign = attrs.scaleTime / Math.abs(attrs.scaleTime)

        let tNoise = Math.sin(Math.sin(t) + t/10)
        // let tNoise = 1;
        let phase = Math.floor(Math.abs(attrs.scaleTime) * (t + 5 * tNoise)) % period.length
        if (sign <0) {
          phase = period.length - phase
        }
        let rotation = [...period.slice(phase, period.length), ...period.slice(0, phase)]


        // X position 
        let selections = filtersX.reduce((indexes:number[], f:SelectSample) => {
          return [...indexes, ...f(ctx.canvas.width, ctx.canvas.height, rotation)]
        }, [])

        let dx = ctx.canvas.width/period.length
        let h = ctx.canvas.height 

        let modulators = [
          Math.atanh,
          Math.acosh,
          Math.asinh,
          // Math.sinh,
          // Math.cosh,
        ]

        let mod = _.sample(modulators)

        selections.forEach((sampleIndex:number) => {
          let sampleVal = rotation[sampleIndex]
          let val = (sampleVal / 2 + 0.5) * mod(t/10000)
          let x = dx * sampleIndex
          let y = h * (val)
          colorPoint(ctx, Math.floor(x), Math.floor(h - y), colors[waveNum] )
        })

        // Y position 
        selections = filtersY.reduce((indexes:number[], f:SelectSample) => {
          return [...indexes, ...f(ctx.canvas.width, ctx.canvas.height, rotation)]
        }, [])

        
        selections.forEach((sampleIndex:number) => {
          let sampleVal = rotation[sampleIndex]
          let val = sampleVal / 2 + 0.5
          let x = dx * sampleIndex
          let y = h * (val)
          colorPoint(ctx, Math.floor(x), Math.floor(h - y), colors[waveNum] )
          colorPoint(ctx, Math.floor(x) + 1, Math.floor(h - y), colors[waveNum] )
          colorPoint(ctx, Math.floor(x) + 2, Math.floor(h - y), colors[waveNum] )
        })
      })
      requestAnimationFrame(animate)
    }
  }
  
  return {
    oninit: ({attrs}) => {
      canvas = document.createElement("canvas")
      canvas.width = dims.w
      canvas.height = dims.h
      
      animate = getRender(attrs, canvas)
    },
    oncreate: ({dom, attrs}) => { 
      hash = JSON.stringify(attrs)
      dom.appendChild(canvas)
      waveTable = attrs.waveTable
       animate(performance.now())
    },
    onupdate: ({attrs}) => {
      if (JSON.stringify(attrs) != hash) {
        hash = JSON.stringify(attrs)
        animate = getRender(attrs, canvas)
      }
    },
    view: ({attrs}) => {
      return m('.canvas-dom')
    }
  }
}
