import m from 'mithril'
import * as lib from './lib'

function Header(): m.Component<any> {
    return {
        view: () => {
            return m("footer.pt-5.has-text-centered.has-text-white", 
                m("code.py-3.px-5.is-size-4.has-background-black", {style:{color:lib.color(1, 0.75)}}, "let us = make music"),
            )
        }
    } 
}

export default Header