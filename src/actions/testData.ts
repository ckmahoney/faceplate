import type { Spec, Progression } from '../types'
import type { AutoDjTrack } from '../apps/auto-dj/types'
import { testConf, testComposition } from '../components/account/testData'


function makeTestProg(): Progression {
  const p1:Progression = [
    [ 4, "C Major" ],
    [ 4, "A Minor" ],
    [ 4, "D Minor" ],
    [ 4, "F Major" ],
  ]

  const p2:Progression = [
    [ 8, "F Major" ],
    [ 4, "C Minor" ],
    [ 4, "G Major" ],
  ]

  const p3:Progression = [
    [ 2, "G minor" ],
    [ 4, "A minor" ],
    [ 2, "C Minor" ],
    [ 8, "F Major" ],
  ]

  const p4:Progression = [
    [ 8, "C Major" ],
    [ 4, "A Minor" ],
    [ 2, "D Minor" ],
    [ 2, "F Major" ],
  ]

  let ps =  [p1,p2,p3,p4]
  let p = ps[Math.floor(Math.random() * ps.length)]
  return [...p]
}

function makeTestSpecs(): Spec[] {
  const s1:Spec = {
    role: "any",
    register: 8,
    fill: "focus",
    type: "square"
  }

  const s2:Spec = {
    role: "any",
    register: 6,
    fill: "fill",
    src: "perc.mp3"
  }

  const s3:Spec = {
    role: "any",
    register: 9,
    fill: "frame",
    src: "hats.mp3"
  }

  const s4:Spec = {
    role: "any",
    register: 12,
    fill: "frame",
    type: "sine"
  }

  let ss =  [s1,s2,s3,s4]
  return ss.slice(0, Math.floor(Math.random() * ss.length))
}

export const testAutoDjTrack:AutoDjTrack = {
  conf: testConf,
  composition: testComposition
}


export function testGetCompositionResponse() {
  return ([1,2,3]).map(() => {
    return { compositionId: Math.random().toString(), progression: makeTestProg(), specs: makeTestSpecs() }
  })
}