import type { StubComposition, Progression } from '../../types'
import type { PerformanceActions } from '../../actions/types'

import m from 'mithril'
import _ from 'lodash'
import AppCanvas from '../../apps/canvas'


/** A thumbnail of a composition. */
function listing(id:string, progression:Progression):m.Vnode {
  return m("div.bordered", 
    m(".flex-vertical",
      m("pre", id)
    ),
    AppCanvas.progression(progression, 0)
  )
}

/** A vertical scrollable listing of compositions. */
function list(stubCompositions:StubComposition[]): m.Vnode {
  return m("section.section",
    m("h2.subtitle.has-text-light", "Collection"),
    m(".columns.is-multiline", stubCompositions.map((stub, i) => 
      m(".column.is-full", listing(stub.compositionId, stub.progression)))
    )
  )
}

/** Actions to take on a Performance */
function buttons(actions:PerformanceActions): m.Vnode {
  const infos:any = {
    remix: "When you remix a Composition, you are taking some of the parts out while adding new parts in. So the new Composition will have familiar elements, while also featuring new materials.",
    repaint: "Repainting a Performance will make it sound different... but the same. The same notes, parts, and pitches are used. New synth colors are chosen for the parts.",
    reroll: "Rerolling a Composition will produce an entirely new composition using just the Progression as the point of reference. New parts are generated, as well as new melodies and colors for each of those parts.",
    "speedUp": "Speed Up. Keep everything exactly the same, but faster.",
    "slowDown": "Slow Down. Keep everything exactly the same, but slower.",
  }

  let openState:any = Object.keys(infos).reduce((s:any, k:any) => {
    return {...s, [k]: false}
  }, {})


  function info(type:string):any {      
    let isOpen = openState[type]
    let msg:string = infos[type]
    let classname = isOpen ? ".info-open" : ".info-close"

    function onclick(e:any) {
      openState = {...openState, [type]: !isOpen}
    }
    
    return m("div", 
      m("p.has-text-white", "I"),
      isOpen && m("info" + classname, msg)
    )
  }


  return m("section",
    m("h2.subtitle", "Mix it Up"),
    m("div.columns.is-multiline", 
      m(".column.is-full", m("button.button.is-fullwidth", "Remix"), info("remix")),
      m(".column.is-full", m("button.button.is-fullwidth", "Repaint"), info("repaint")),
      m(".column.is-full", m("button.button.is-fullwidth", "Reroll"), info("reroll")),
      m(".column.is-half", m("button.button", "SpeedUp")),
      m(".column.is-half", m("button.button", "SlowDown"))
    )
  )
}


export default {
  list
}