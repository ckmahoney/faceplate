
type Ft = (t:number) => number
type Ctx2D = CanvasRenderingContext2D
const pi = Math.PI
import _ from 'lodash'


export function drawSamples(ctx:Ctx2D, index:number, samples:number[]) {
    const w = ctx.canvas.width
    const h = ctx.canvas.height
    const dw = w / samples.length
  
    ctx.strokeStyle = "black"
  
  
    for (let x = 0; x < samples.length; x++) {
      // scale the wave to fit the canvas window 
      // round to int for HTMLCanvas performance
      // divide by 2 to center the waveforom with the canvas
  
      let ind = (index + x) % samples.length
      let y = Math.floor(samples[ind] * h)/2
  
      drawPoint(ctx, x * dw, y + h/2)
    }
  }

  export function drawColoredSamples(ctx:Ctx2D, index:number, samples:number[], color:string) {
    const w = ctx.canvas.width
    const h = ctx.canvas.height
    const dw = w / samples.length
  
    ctx.strokeStyle = color
   
   
    for (let x = 0; x < samples.length; x++) {
      // scale the wave to fit the canvas window 
      // round to int for HTMLCanvas performance
      // divide by 2 to center the waveforom with the canvas
  
      let ind = (index + x) % samples.length
      let y = Math.floor(samples[ind] * h)/2
  
      colorPoint(ctx, x * dw, y + h/2, color)
    }
  }


  export function drawFrame(ctx:Ctx2D, wx:number, wy:number, index:number, samples:number[], color:string) {
    const w = ctx.canvas.width
    const h = ctx.canvas.height
    const dw = w / samples.length
  
    ctx.strokeStyle = color
    let xsA = _.range(wx)
    let xsB = xsA.map((x:number) => ctx.canvas.width - x)
    let ysA = _.range(wy)
    let ysB = ysA.map((y:number) => ctx.canvas.width - y)
    let xs = [...xsA, ...xsB]
    let ys = [...ysA, ...ysB]
    xs.map((x:number) => {
      // scale the wave to fit the canvas window 
      // round to int for HTMLCanvas performance
      // divide by 2 to center the waveforom with the canvas
  
      let ind = (index + x) % samples.length
      let y = Math.floor(samples[ind] * h)/2
  
      colorPoint(ctx, x * dw, y + h/2, color)
    })
  }

export function getRectDimensions() {
    let w = window.innerWidth
    let h = window.innerHeight
    return { w, h }
}
  
export function getSquareDimensions() {
  let w = window.innerWidth
  let h = window.innerHeight
  if (w > h ) { 
      return h
  } else { return w } 
}

export function hslString(hsl: Array<number|string>): string {
    let s = typeof hsl[1] == "string" ? hsl[1] : hsl[1].toString() + "%"
    let l = typeof hsl[2] == "string" ? hsl[2] : hsl[2].toString() + "%"
    if (hsl.length === 3) {
      return `hsl(${hsl[0]}, ${s}, ${l})`
    } else if (hsl.length === 4) {
      return `hsl(${hsl[0]}, ${s}, ${l}, ${hsl[3]})`
    }
    return ''
  }
  
export function waveformSamples(nSamples:number, ft:Ft, slice: number = 1):Array<number> {
    if (slice <= 0 || slice > 1) { throw new Error("slice, as a percent of 2pi, must be greater than 0 and less than or equal to 1.") }
  
    let d:number = slice * 2*pi/nSamples
    return _.range(nSamples).map((i:number) => {
      return ft(i * d)
    })
  }

export function drawPoint(ctx:Ctx2D, x:number, y:number) {
  ctx.strokeStyle = "darkred"
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x, y+3)
  ctx.stroke()
  
}

export function colorPoint(ctx:Ctx2D, x:number, y:number, color:string) {
  ctx.strokeStyle = color
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x, y+1)
  ctx.stroke()
  
}


export function drawGrid(ctx: Ctx2D, w:number,h:number, start:number, stop:number) {
    ctx.strokeStyle = "black"
    ctx.beginPath()
    ctx.moveTo(0, h/2)
    ctx.lineTo(w, h/2)
    ctx.stroke()          
  
    let markHeight = 10
    
    ctx.moveTo(0, (h/2) - (markHeight/2))
    ctx.lineTo(0, (h/2) + (markHeight/2))
    ctx.stroke()
    ctx.font = "16px sans-serif"
    ctx.fillText("0", 4, (h/2) + markHeight + 8)
  
    ctx.moveTo(w/2, (h/2) - (markHeight/2))
    ctx.lineTo(w/2, (h/2) + (markHeight/2))
    ctx.stroke()
    ctx.font = "16px sans-serif"
    ctx.fillText("π", (w/2)-4, (h/2) + markHeight + 8)
  
  
    ctx.moveTo(w, (h/2) - (markHeight/2))
    ctx.lineTo(w, (h/2) + (markHeight/2))
    ctx.stroke()
    ctx.font = "16px sans-serif"
    ctx.fillText("2π", (w)-28, (h/2) + markHeight + 8)
  }

type ArrayIndex = number
  
  type SelectSample = (canvasWidth:number, canvasHeight:number, samples:number[]) => ArrayIndex[]

/*
function renderWaveTable(ctx:Ctx2D, waveTable:number[][], filters:Array<SelectSample>) {
  const renderedPhases = waveTable.map((period:number[]) => {
      const phases = _.range(Math.floor(ctx.canvas.width/period.length))
      return phases.map((phaseIndex:number) => {
      
      let phasedPeriod = [...period.slice(phaseIndex, period.length), ...period.slice(0, phaseIndex)]
      return filters.reduce((indexes:number[], f:SelectSample) => {
        return [...indexes, ...f(ctx.canvas.width, ctx.canvas.height, phasedPeriod)]
      }, [])
    })
  })

  return _.zip(renderedPhases)
}
function applyFilters(ctx:Ctx2D, period:number[], filters:Array<SelectSample[]>):ArrayIndex[] {
  let macro = filters.map((filterGroup:SelectSample[]) => {
    return filterGroup.reduce((indexes:number[], f:SelectSample) => {
      return [...indexes, ...f(ctx.canvas.width, ctx.canvas.height, period)]
    }, [])
  })
  console.log("macro, list of 2 showing x and y selections")
  console.log(macro)
  return _.uniq(_.concat(macro))
}
*/