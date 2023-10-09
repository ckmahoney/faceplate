import _ from 'lodash';

/**
Primitive generators. 

Would like them to be seedable. 
*/


export function int(min: number, max:number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function coin(): boolean {
  return pick([true, false]) as boolean
}

export function sign(): number {
  return pick([1, -1]) as number
}

export function shuffle(array: Array<any>): Array<any> {
  return _.shuffle(array)
}

export function pick<V>(array: Array<V>): V {
  return _.sample(array) as V
}

export default { 
  coin,
  int, 
  sign,
  shuffle,
  pick
}