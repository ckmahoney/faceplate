import _ from 'lodash'

type Check = (x:any) => boolean
type CheckWith = (y:any) => (x: any) => boolean

export function posInt(x:any) { return  typeof x == 'number' && x % 1 == 0 && x > 0 }
export function posNum(x:any) { return  typeof x == 'number' && x > 0 }

export function int(x:any) { return typeof x == 'number' && x % 1 == 0 }
export function q(x:any) { return typeof x == 'number' && (x == 0 || x == 1)
}
function range(x:any) { return typeof x == "number" && x <= 1 || x >= 0 }
function num(x:any) { return typeof x == 'number' }
function string(x:any) { return typeof x == 'string' }
function any(x:any) { return true } 
function isArray(x:any) { return Array.isArray(x) }
function isObject(x:any) { return typeof x == 'object' &&!isArray(x) }
function isEven(x:any) { return int(x) && x % 2 == 0 }
function isOdd(x:any) { return int(x) && x % 2 == 1 }
function maybe(matcher:Check): (x:any) => boolean { return (x:any) => typeof x === "undefined" || matcher(x) }
export let posIntOr0: Check = x => posInt(x) || x == 0
export let oneOf: CheckWith = ys => x => ys.some((y:any) => _.isEqual(x, y))
export let intMoreThan:CheckWith = (y:number) => (x:any) => int(x) && x > y
function listOf(matcher: (y:any) => boolean): (x:any) => boolean {
    return function matchArray(x:any):boolean {
      return isArray(x) && x.every((y:any) => matcher(y))
      
    }
  }
function errorsOf(shape:string, x:any): string[] {
    let msgs:string[]  = []
    let matcher = shapes[shape]
    for (let field in matcher) {
      if (!matcher[field](x[field])) {
        if (typeof x == 'undefined') { x = "undefined" } 
        if (x == null) { x = "null" } 
        msgs.push(`Failed typecheck for field "${field}"  with <${typeof x[field]}>`, JSON.stringify(x[field]))
      }
    }
    return msgs
  }

function shapeOf(selector:string): (x:any) => boolean {
    let schema:any = shapes[selector]
    return function matchObject(x:any): boolean {
      if (typeof x !== "object") return false
      let result:boolean = Object.keys(schema).every((k:string) => {
        return schema[k](x[k])
      })
      if (result) return true
  
      const errs = errorsOf(selector, x).join(', ')
      console.error(`Error matching shape for selector '${selector}'`)
      throw new Error(errs)
    }
  }
  

export const is:any = {
  array(x:any) { return isArray(x) },
  conf(x:any) { return shapeOf('conf')(x) },
  composition(x:any) { return shapeOf('composition')(x) },
  duration(x:any) { return posNum(x) },
  error(x:any){ return shapeOf('error')(x) },
  midi(x:any) {
    return isArray(x)
    && x.length == 3
    && posNum(x[0]) 
    && is.midival(x[1])
    && is.signedByte(x[2])
  },
  label(x:any) { return typeof x == 'string' && x.length > 0 },
  line(x:any) {
    return is.array(x)
    && x.every((y:any) => is.midi(y))
  },
  melody(x:any) {
    if (!x.every((y:any) => is.line(y))) {
      console.log("bad melody")
      console.log(x)
      throw new Error("bad mel")
    }
    return is.array(x)
    && x.every((y:any) => is.line(y))
  },
  midival(x:any) {
    return posInt(x) && x < 122
  },
  noteEvent(x:any) {
    return is.array(x)
    && posNum(x[0])
    && is.array(x[1]) 
    && x[1].every(is.midival)
    && is.array(x[2])
    && x[2].every(range)
  },
  part(x:any){ 
    return is.array(x)
    && x.length ==2 
    && shapeOf('spec')(x[0])
    && is.melody(x[1])
  },
  place(x:any) {
    return is.array(x)
    && x.length == 2 
    && is.duration(x[0])
    && is.label(x[1])
  },
  root(x:any) {
    return num(x)
    && (x >= 1) 
    && (x < 2)
  },
  signedByte(x:any) { 
    return posIntOr0(x) && x <128
  },
  string(x:any) { return string(x) },
  track(x:any) {
    return is.array(x)
    && x.every(is.noteEvent)
  }
}
  
export const shapes:any = {
    composition: {
        quality: is.string,
        dimensions: (y:any) => shapeOf('dimensions')(y),
        progression: (y:any) => listOf(is.place)(y),
        parts: (y:any) => listOf(is.part)(y)
    },
    conf: {
      root: is.root,
      cps: posNum
    },
    dimensions: {
        size: num, 
        cpc: posInt,
        base: posInt
    },
    error: {
      error: is.string
    },
    spec: {
        role: string,
        register: posInt,
        fill: string,
        type: string
    }
}