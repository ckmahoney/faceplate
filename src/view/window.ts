import m from 'mithril'

import * as lib from './lib'

export type Tab = {
    id: string
    label: string 
    target: string
}

export type Page = {
    id: string
    el: m.Vnode<any>
}

export function TopNav():m.Component<{tabs:Tab[], pages:Page[]}> {
    let selection:Tab 

    function select(tab:Tab) {
        selection = tab
    }

    return {
        oninit({attrs}) {
            selection = attrs.tabs[0]
        },
        view({attrs}) {
            const { tabs, pages } = attrs 
            let page:Page

            let menuItem = "button.buttn.max-width-none.has-text-centered"
            if (lib.isMobile()) {
                menuItem += ".is-size-4"
            } else {
                menuItem += ".is-size-3"
            }

            page = pages.find(p => p.id == selection.target) as Page
            
            return m("div", 
                m("nav.columns.mt-5.mb-3", tabs.map(tab => {
                    let btnStyle = 
                    tab.id == selection.id 
                        ? { color: lib.color(2, 0.5), backgroundColor: "white" }
                        : { color: lib.color(0.8, 2), backgroundColor: "black" }
                    return m(".column", 
                        m(menuItem, {onclick:() =>select(tab), style:btnStyle}, tab.label)
                    )
                })),
                m(".pane", page.el)
            )
        }
    }
}



export function LeftNav():m.Component<{tabs:Tab[], pages:Page[]}> {
    let selection:Tab 

    function select(tab:Tab) {
        selection = tab
    }

    return {
        oninit({attrs}) {
            selection = attrs.tabs[0]
        },
        view({attrs}) {
            let menuItem = "button.buttn.mb-5.max-width-none.has-text-centered"
            if (lib.isMobile()) {
                menuItem += ".is-size-4"
            } else {
                menuItem += ".is-size-3"
            }

            const { tabs, pages } = attrs 
            let page:Page
            page = pages.find(p => p.id == selection.target) as Page
            
            return m(".columns.pt-5", 
                m(".column.is-2", m("nav.tabs.is-flex.flex-vertical", tabs.map(tab => {
                    let btnStyle = 
                    tab.id == selection.id 
                        ? { color: lib.color(2, 0.5), backgroundColor: "white" }
                        : { color: lib.color(0.8, 2), backgroundColor: "black" }
                    return m(menuItem, {onclick:() =>select(tab), style:btnStyle}, tab.label)
                }))),
                m(".column.is-10", m(".pane", page.el))
            )
        }
    }
}