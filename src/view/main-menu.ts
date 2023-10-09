import m from 'mithril'
import * as lib from './lib'

export type AppStep
  = "authenticate"
  | "createAccount"
  | "nexus"
  | "chat"
  | "collection"
  | "privateRadio"
  | "account"
  | "error"

  function NexusTitle():m.Component<{name:string, did:Function, oneoff:Function}> {

    const fadeInDuration1 = 1.2
    const fadeInDuration2 = 3
    let nametag:string
    let subtitle:string

    let n:m.Vnode, s:m.Vnode;
    return {
        oninit: (vnode:any) => {
          const { name, did, oneoff } = vnode.attrs
          
          subtitle = `${name}`

          n = m("h3.is-size-3.m-0", nametag)
          s = m("h3.is-size-3.m-0", subtitle)
        },
        oncreate: (vnode:any) => {
            const { name, did, oneoff } = vnode.attrs

            //@ts-ignore
            n.dom.style.transition = "opacity 500ms"
            //@ts-ignore
            s.dom.style.transition = "opacity 500ms"

            if (!did("welcomeAnimation")) {
              //@ts-ignore
              n.dom.style.opacity = 0
              //@ts-ignore
              s.dom.style.opacity = 0
          
                setTimeout(() => {
                  //@ts-ignore
                  n.dom.style.opacity = 1
                }, fadeInDuration1 * 1000)

                setTimeout(() => {
                  //@ts-ignore
                  s.dom.style.opacity = 1
                  oneoff("welcomeAnimation")
                }, fadeInDuration2 * 1000)
                
            } else {
              //@ts-ignore
              n.dom.style.opacity = 1
              //@ts-ignore
              s.dom.style.opacity = 1
            }
           
        },
        view: () => {
            return m('.is-family-sans-serif.has-text-centered.mb-5',
              n, m('br'), s
            )
        }
    }
}

 export default function MainMenu(): m.Component<{role: any, name:string, doLogout:Function, goto:(step:AppStep) => void, oneoff:Function, did:Function}> {
    let isHovered: AppStep | null = null
  
    return {
      view: function ({attrs}) {
        function show(step: AppStep) {
          return function (e: any) {
            attrs.goto(step)
          }
        }
  
        function handleHover(step: AppStep) {
          return function () {
            isHovered = step
            m.redraw() // Trigger a redraw to apply the style changes
          }
        }
  
        function handleHoverExit() {
          isHovered = null
          m.redraw() // Trigger a redraw to remove the hover styles
        }

  
        function makeButton(step: AppStep, label: string, onclick?: null|Function) {
          onclick = onclick ?? show(step)

          let btn = lib.isMobile()
            ? "button.py-3.mb-3.main-menu-button.is-size-3"
            : "button.mb-5.py-5.main-menu-button.is-size-1"
  
          return m(".column.px-5.is-half.has-text-centered", 
            m(btn , {onclick}, label)
          )
        }

        let btns = [
          makeButton("privateRadio", "Private Radio"),
          makeButton("collection", "Collection"),
          makeButton("account", "Account"),
          makeButton("authenticate", "Logout", attrs.doLogout)
        ]

        let menu = "";
        if (lib.isMobile()) {
          menu = ".is-flex.flex-vertical.is-justify-content-space-between"
        } else {
          menu = ".columns.is-multiline.m-0"
        }
  
        return m("div", 
          m(NexusTitle, {name:attrs.name, oneoff:attrs.oneoff, did:attrs.did}),
          m(menu, btns)
        )
      }
    }
  }