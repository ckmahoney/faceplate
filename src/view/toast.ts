import type { Msg } from './types'

import m from 'mithril'
import * as lib from './lib'

export default function ToastBox():m.Component<{msg:Msg, status:{[k:string]: Msg}}> {
    let hidden = false
    let prev:Msg;
    let date:Date|null;
    
    function onclick(e:any) {
      hidden = true
    }
  
    const toastStyle:any = {
      onclick, 
      top: "5vh", 
      left: "5vh", 
      position :"fixed", 
      zIndex: 10, 
      borderRadius:"5px",
      maxWidth: "520px"
    }

    if (lib.isMobile()) {
        toastStyle.maxWidth = "none"
        toastStyle.width = "100vw"
        toastStyle.top = 0
        toastStyle.left = 0
    }
  
  
    return {
      onupdate({attrs}) {
        const {msg} = attrs
        if (prev != msg) {
          prev = msg 
          hidden = false
          date = new Date()
        }
      },
      view({attrs}) {
        const {msg, status} = attrs
        let fadeState = ".fade-fx.fade-in"
        fadeState = ""

        let toasts = Object.keys(status).reduce(function renderToast(ts:m.Vnode<any>[], id?:string) {
          if (!status[id]) return ts
      
          function onclick(e:any) {
            // fadeState = ".fade-fx.fade-out"
            delete status[id]
            m.redraw()
          }
          let button, statusMsg
          if (lib.isMobile()) {
            statusMsg = ".has-text-dark.mb-3.pb-3.is-size-5"
            button = "button.button.is-fullwidth.mb-3.is-size-5.is-info"
          } else {
            statusMsg = ".has-text-dark.mb-3.pb-3.is-size-4"
            button = "button.button.is-fullwidth.mb-3.is-size-5.is-info"
          }
          let toast = 
            m(".mb-5.px-3.content.box" + fadeState,
                m(statusMsg, status[id]),
                m(button, {onclick, style: {maxWidth:"none"}}, "ok"),
            )
          ts.push(toast)
          return ts
        }, [])

        if (toasts.length == 0) {
          return m("div", "")
        }
        return m(fadeState , {style:toastStyle},
          toasts
          )
      }
    }
  }