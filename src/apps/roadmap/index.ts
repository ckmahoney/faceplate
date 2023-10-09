import roadmapList from './roadmap'
import m from 'mithril'

function heading(fields:string[]) {
    return m("thead", 
        m("tr", fields.map((f:string) => {
            return m("th.has-text-weight-bold.has-text-left.is-size-2", f)
        }))
    )
}

function body(fields:string[], rows:any[]) {
    
    return m("tbody",
        rows.map((r:any) => {
            return m("tr", fields.map((f:string) => {
                let classname = r[f] ? ".has-background-info-light" : ""

                return m("td.has-text-left.is-size-3" + classname, m("p", r[f]))
            }
            )    
            )
        }
        )
    )
}

function intro() {
    return m(".box.bordered", 
        m("heading", m("h1.title", "Roadmap")),
        m("p.subtitle.is-size-4", "Making a music generator is kinda hard."),
        m("i.subtitle.is-size-6", "i can't stop."),
    )
}

function info(onclick:Function) {
    return m(".box.bordered", 
        m("heading", m("h2.subtitle", "Feedback & Suggestions")),
        m("p", "Do you have suggestions or questions about how things are going?"),
        m(".columns", 
          m(".column", m("p", "If so, please use the chat and tell me!")),
          m(".column", m("button.button.is-success.is-rounded.is-outlined", {onclick}, "go chat"))
        )
    )
}


function panel(goChat:Function) {
    const fields:string[] = Object.keys(roadmapList[0])
    
  return m("section",
    m(".columns", m(".column", intro()), m(".column", info(goChat))),
    m("table.table", 
        heading(fields),
        body(fields, roadmapList)
    )
  )    
}

export default {
    panel
}