import type { AppUser } from './types'

export let testAppUser: AppUser = {
  firstName: "Alice",
  lastName: "Coltrane",
  alias: "harpy-darpy",
  email: "jazzistheway@gmail.com",
  apiToken: "music-is-love",
  role: "friend",
  collection:[],
  createdAt: new Date("2024-04-1")
}

import type { 
  Conf, 
  Composition, 
  Progression,
} from '../../types'

import _ from 'lodash'


export let testConf:Conf = {
  duration: 80,
  origin: "C Major",
  cps: 1.27,
  title: "Song 1",
  transposition: 0
}


export const testProgression:Progression = [
  [ 4, "C Major" ],
  [ 4, "A Minor" ],
  [ 4, "D Minor" ],
  [ 4, "F Major" ],
]

export const testComposition:Composition = { 
  id: "bedfgbcdbedfgbcdbedfgbcdbedfgbcd",
  quality: "major",
  dimensions: {
    base: 2,
    size: 4,
    cpc: 4
  },
  duration: 40,
  progression: testProgression,
  parts: [
    [ {role: "lead", register: 8, fill: "focus", type: "sine" },
      [ [[2, 60, 1], 
       [2, 67, 0.5], 
       [4, 69, 1], 
       [1, 62, 1],
       [1, 62, 0.5], 
       [1, 65, 1], 
       [1, 69, 1], 
       [4, 65, 0.5] 
      ]
    ]
    ],
    [ {role: "bass", register: 8, fill: "focus", type: "sine" },
      [
        [[2, 40, 1], 
       [6, 47, 0.2], 
       [2, 42, 0.5],
       [2, 45, 0.7], 
       [4, 45, 1] 
      ]
    ]
    ]
  ]
}

export let testPerformance = {
  compositionId: _.fill(Array(16), "ac").join(), 
  confId: _.fill(Array(16), "bd").join(), 
  filepath: "music/naltroc/listen-to-this.mp3"
}

export let testCollection:any[] = [
  { songId: _.fill(Array(32), "a").join(), composition: testComposition,  performances: [testPerformance] },
  { songId: _.fill(Array(32), "b").join(), composition: testComposition,  performances: [testPerformance,testPerformance] },
  { songId: _.fill(Array(32), "c").join(), composition: testComposition,  performances: [] },
]
