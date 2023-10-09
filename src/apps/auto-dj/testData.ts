import type { AutoDjTrack } from './types'
import type { Conf, Composition } from '../../types'
import { maryHadALittleLamb } from '../daw/testData'

export function varyTestComposition(): AutoDjTrack {
  let conf = {
    cps: Math.random() * 4,
    origin: "C Major",
    transposition: Math.floor(Math.random() * 12),
    title: "Varied song " + Math.floor(Math.random()).toString()
  } as Conf

  let composition = {
    id: "somerandomcompo" + Math.random().toString(),
    quality: "major",
    dimensions: {size:2, cpc:4, base: 2},
    progression: [ [ 16, "C major" ] ],
    parts: [
      [ { role: "lead", register: 8, fill: "focus", type: "square" }
      , maryHadALittleLamb
      ]
    ]
  } as Composition 

  return { conf, composition }
}