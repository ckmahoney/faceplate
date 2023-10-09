export type CheckboxSetting<EnumVals> = {
    label: string
    type?: "checkbox"
    name: string
    apply: (v:EnumVals) => Promise<any>
    opts: Array<
        { label: string|m.Vnode<any>, value: EnumVals, info?: string|m.Vnode<any> }
    >
}

export type RadioSetting<EnumVals> = {
    label: string
    type?: "radio"
    name: string
    apply: (v:EnumVals) => Promise<any>
    opts: Array<
        { label: string|m.Vnode<any>, value: EnumVals, info?: string|m.Vnode<any> }
    >
}

export type SelectSetting<EnumVals> = {
    label: string
    name: string
    apply: (v:EnumVals) => Promise<any>
    opts: Array<
        { label: string|m.Vnode<any>, value: EnumVals, info?: string|m.Vnode<any> }
    >
}

export type IntegerSetting = {
    label: string
    valueLabel?: (v:number) => string
    name: string
    apply: (v:number) => Promise<any>
    min: number 
    max: number
}

import m from 'mithril'

const moduleHsl = [300, 0.5, 0.5]

export const breakpoints = {
    mobile: 756,
    tablet: 1280
}

export function isMobile() { return window.innerWidth <= breakpoints.mobile }
export function isDesktop() { return window.innerWidth > breakpoints.tablet }

export function color(modSat = 1, modLight = 1, hsl_?:any) {
    const HSL = hsl_ ?? moduleHsl
    return `hsl(${HSL[0]}, ${100 * modSat * HSL[1]}%, ${100 * modLight * HSL[2]}%)`
}

export function subheading(title:string, ...more:Array<string|m.Vnode>):m.Vnode {
    
    let def = m("header", { style: {minHeight: "70px"}},
        m(".is-flex.is-justify-content-space-between.is-align-items-center.has-text-centered", 
            ([
                m("h2.subtitle.m-0", title), 
                ...more
            ]).map((el,i, arr) => {
                let minHeight = "50px"
                let flexBasis = (1/arr.length).toString()+"%"
                let flexGrow = i == 0 
                    ? 1
                    : 1
                let flexShrink = i == 0 
                    ? 0
                    : 2
                return m("div", {style:{ minHeight  }}, el)
            })
        )
    )

    let mobile = () => {
        return m("header", { style: {minHeight: "70px"}},
            m("h2.subtitle.m-0.has-text-centered", title), 
            ...more
        )
    }

    let tablet = mobile

    let bigger =  () => {
        return m("header.mt-5", { style: {minHeight: "70px"}},
            m(".is-flex.is-justify-content-space-between.is-align-items-center.has-text-centered",
                m("h2.subtitle.m-0.is-size-2.is-inline-block", title), 
                ...more
            )
        )
    }

    return useBreakpoints(mobile, tablet, bigger)
}

export function sectionHeading(title:string):m.Vnode<any> {
    if (isMobile()) {
        return m("h1.mb-5.has-text-white.is-size-3", title)
    }
    return m("h1.has-text-white.is-size-1", {style: {marginBottom: "4vh"}}, title)
}

export function section(...children:Array<m.Vnode<any>>) {
    return m(".p-3", {style: {
            boxShadow: color(1, 0.25) + " 0 0 5px",
            background: "rgba(0,0,0,0.4)"
        }},
        m("section.section.has-text-white", {style: {
            boxShadow: color() + " 0 0 5px"
        }}, children)
    )
}

export function Carousel():m.Component<{useColors?:boolean, pages:Array<m.Vnode<any>>}> {
    let index = 0
    
    return {
        view({attrs}) {
            const { pages } = attrs
            let useColors = attrs.useColors ?? true

            function prev(e:any) {
                index--
                
                if (index < 0) {
                    index = pages.length -1
                }
            }

            function next(e:any) {
                index++
                if (index > (pages.length - 1)) {
                    index = 0
                }
            }
            let item = pages[index]
            const hsl = [Math.floor(index *360/pages.length), 0.5, 0.5]
            let button 
            if (isMobile()) {
                button = "button.py-3.mt-3.column.is-half.is-outlined.background-none.is-size-5.syn-button.has-text-black"
            } else {
                button = "button.py-3.column.is-half.is-info.is-outlined.is-size-4"
            }
            return m(".", 
                m(".py-5.is-flex.is-justify-content-center.is-align-items-center", {style: {
                        backgroundColor: color(1, Math.pow(2, 5/6), hsl),
                        lineHeight: "4vh",
                        minHeight: "30vh"
                    }
                }, item),
                m(".columns.is-mobile.is-justify-content-space-around.is-align-items-center", {style: {minHeight: "3vh"}},
                    m(button, {onclick:prev},  "Previous"),
                    m(button, {onclick:next}, "Next"),
                )
            )
        }
    }
}

export function Carousel2():m.Component<{useColors?:boolean, pages:Array<m.Vnode<any>>}> {
    let index = 0
    
    return {
        view({attrs}) {
            const { pages } = attrs
            let useColors = attrs.useColors ?? true

            function prev(e:any) {
                index--
                
                if (index < 0) {
                    index = pages.length -1
                }
            }

            function next(e:any) {
                index++
                if (index > (pages.length - 1)) {
                    index = 0
                }
            }
            let item = pages[index]
            const hsl = [Math.floor(index *360/pages.length), 0.5, 0.5]

            let btnStyle = {
                borderWidth: "3px", float:"right", minHeight: "64px",
                padding: "34px",
                margin: "0 auto"
            }

            return m(".", 
                m(".columns.is-mobile.is-justify-content-space-around.is-align-items-center", {style: {minHeight: "3vh"}},
                    m("button.button.p-0.column.is-half.is-info.is-outlined.is-size-4", {style:btnStyle,onclick:prev},  "Previous"),
                    m("button.button.p-0.column.is-half.is-info.is-outlined.is-size-4", {style:btnStyle,onclick:next}, "Next"),
                ),
                m(".py-5.is-flex.is-justify-content-center.is-align-items-center", {style: {
                        minHeight: "30vh"
                    }
                }, m("div", {style:{width:"100%"}}, item))
            )
        }
    }
}

export function quickCols(...items:Array<m.Vnode<any>>):m.Vnode {
    return m(".columns", items.map(vnode => m(".column", vnode)))
}

type GetVNode = () => m.Vnode<any>
export function useBreakpoints(mobile:GetVNode, tablet:GetVNode, bigger:GetVNode):m.Vnode {
    if (window.innerWidth <= breakpoints.mobile) {
        return mobile()
    }
    if (window.innerWidth <= breakpoints.tablet) {
        return tablet()
    }
    return bigger()
}

function optionLabel(text:null|string):m.Vnode<any> {
    if (!text) return null 

    if (isMobile()) {
        return m("h2.my-5.has-text-white.is-size-4.has-text-centered", text)
    }
    return m("h2.my-5.has-text-white.is-size-2.has-text-centered", text)
}

function optionSize():string {
    if (isMobile()) {
        return ".is-size-5"
    }
    return ".is-size-4"
}

export function selectSetting<E>(settings:SelectSetting<E>, current:E, extra?:""|m.Vnode<any>): m.Vnode<any> {
    let infoSource = settings.opts.find((option) => {
        if (!option.info) return false 
        if (option.value != current) return false
        return true
    }) 

    let optionsStyles = {
        style: {
          margin: "3vh 0",
          flexWrap:"wrap"
        }
      }
    
    let infoText : string|m.Vnode<any>= ""
    if (infoSource) {
        infoText = info(infoSource.info) 
    }
    return m(".field.is-grouped",
        m("div", 
            optionLabel(settings.label),
            m(".is-flex.is-justfy-content-flex-start.is-align-items-center", optionsStyles,
              m("select.mt-5.has-background-dark.has-text-white" + optionSize(), {
                value: current, 
                oninput:(e:any) => { 
                  settings.apply(e.target.value)
                }
              },
                settings.opts.map((option) => {
                    return m("option", {name: settings.name, value: option.value}, option.label)
                })
              )
            ),
            extra,
            infoText
        ),
    )
}

export function info(text:string|null|m.Vnode<any>):m.Vnode<any> {
    if (!info) return null;
    if (isMobile()) {
        return m("p.has-text-white.mb-5.is-size-5", text) 
    }
    return m("p.has-text-white.mb-5.is-size-3", text) 
}


export function radioSetting<E>(settings:RadioSetting<E>, current:E, extra?:""|m.Vnode<any>): m.Vnode<any> {
    let infoSource = settings.opts.find((option) => {
        if (!option.info) return false 
        if (option.value != current) return false
        return true
    }) 

    let optionsStyles = {
        style: {
          margin: "3vh 0",
          flexWrap:"wrap"
        }
      }
    
    let infoText : string|m.Vnode<any>= ""
    if (infoSource) {
        if (typeof infoSource.info == 'string')
            infoText = info(infoSource.info)
        else infoText = infoSource.info
    }

    const optSize = optionSize()
    return m(".field.is-grouped",
        m("div", 
            optionLabel(settings.label),
            m(".is-flex.is-justfy-content-flex-start.is-align-items-center", optionsStyles,
                settings.opts.map((option) => {
                    function onchange(e:any) {
                        settings.apply(option.value)
                    }
                    let checked = current == option.value
                    let style = checked ? {color: "#333"}: {}
                    return m(".is-align-items-center.is-flex", 
                        m("input", {onchange, checked, style, type:"radio", name: settings.name, value: option.value}),
                        m("label.radio.m-3" + optSize, {onclick:onchange}, option.label)
                    )
                })
            ),
            extra,
            infoText
        ),
    )
}

export function checkboxSetting<E>(settings:CheckboxSetting<E>, currents:Array<E>, extra?:""|m.Vnode<any>): m.Vnode<any> {
    const optSize = optionSize()
    return m(".",
            optionLabel(settings.label),
            m(".columns.is-justify-content-flex-end.is-align-items-center", {style:{flexWrap:"wrap"}},
                m(".column.is-4"),
                settings.opts.map((option) => {
                    function onchange(e:any) {
                        settings.apply(option.value)
                    }
                    let checked = currents.includes(option.value)
                    // let style = checked ? {color: color(1, 1, [150, 0.5, 0.5])}: {}
                    return m(".column.is-block", 
                        m("input", {onchange, checked, type:"checkbox", name: settings.name, value: option.value}),
                        m("label.radio.m-3" + optSize, { onclick:onchange}, option.label)
                    )
                })
            ),
            extra,
    )
}


export function integerSetting<E>(settings:IntegerSetting, current:number, extra?:""|m.Vnode<any>): m.Vnode<any> {
    function inc(e:any) {
        current += 1
        if (current > settings.max) current = settings.max
        settings.apply(current)
    }
    function dec(e:any) {
        current -= 1
        if (current < settings.min) current = settings.min
        settings.apply(current)
    }
    let style = {
        fontSize: "60px",
        fontWeight: "bold",
        textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
    }
    
    let val
    if (typeof settings.valueLabel == 'function') {
        val = settings.valueLabel(current)
    } else {
        val = current.toString()
    }

    let picker
    if (isDesktop()) {
        let btnStyle = {
            borderWidth: "3px", float:"right", minHeight: "64px",
            padding: "34px",
            margin: "0 auto"
        }
        let box = ".column.columns.is-justify-content-center.mb-5.is-half.p-0.is-outlined"
        let button = ".column.button.is-flex.mx-5.has-background-black.has-text-white"

        picker = m(".columns.p-0.my-5.is-multiline.is-justify-content-space-around",
            m(box, m(button, {onclick:dec, style: btnStyle}, m("span", {style}, "⇓"))),
            m(box, m(button, {onclick:inc, style: btnStyle}, m("span", {style}, "⇑") ))
        )
    } else {
        let btnStyle = {
            borderWidth: "3px", float:"right", minHeight: "64px",
            // padding: "34px",
            margin: "0 auto"
        }
        let box = "."
        let button = ".is-flex.has-background-black.has-text-white"

        picker = m(".is-flex.my-5.is-justify-content-space-between",
            m(box, m(button, {onclick:dec, style: btnStyle}, m("span", {style}, "⇓"))),
            m(box, m(button, {onclick:inc, style: btnStyle}, m("span", {style}, "⇑") ))
        )
    }

    return m(".",
            optionLabel(settings.label),
            m(".columns.p-0.is-multiline",
                m(".column.is-full.p-0.my-5", m("p.has-text-white.is-size-3.has-text-centered", val)),
            ),
            picker,
            extra
    )
}

export const sectionStyle =  {style: {border: "5px #222", boxShadow: "0 0 13px 5px #111", background: "rgba(0,0,0,0.5)"}};

