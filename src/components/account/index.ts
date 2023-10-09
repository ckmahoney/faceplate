import type { 
  AppUser
} from './types'

import m from 'mithril'


function id(alias: string, nCompositions: number) {
  return m("div.bordered", 
    m("b", alias),
    m("p", `Discoverer of ${nCompositions} compositions`)
  )
}

export default { 
  id
}