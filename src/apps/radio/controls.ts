import m from 'mithril'
import * as lib from '../../view/lib'

enum QueueOptions {
    single = "single",
    autoNext = "auto-next"
}

type LoopOptions = "single" | "double" | "n" | number
type LoopQuantity = number 


export type State = {
    volume: number
    queue: `${QueueOptions}`
    loop: LoopOptions
    loopN: LoopQuantity
}

type Enum<T extends {[key: number]: string | number}> = T

export type Actions = {
    updateVolume: (vol:number) => Promise<any>
    updateQueue: (q:Enum<`${QueueOptions}`>) => Promise<any>
    updateLoop: (l:LoopOptions) => Promise<any>
    updateLoopN: (n:number) => Promise<any>
}

export type Props = {
    state: State,
    actions: Actions
}

let debounceNumberTimeout:any = null
let debounceRangeTimeout:any = null
let localRangeVal:number = 0
let localNumVal:number = 1

export function playControls():m.Component<{state: State, actions: Actions}> {
    return {
        oninit({attrs}) {
            localRangeVal = attrs.state.volume
            localNumVal = attrs.state.loopN
        },
        view({attrs}) {
            const { state, actions } = attrs
            let queueSetting:lib.RadioSetting<`${QueueOptions}`> = {
                label: "",
                type: "radio",
                name: "queue",
                apply: async (q) => actions.updateQueue(q).then(m.redraw),
                opts: [
                    {label: "Single Track", value: "single", info: "Play the currently selected track."},
                    {label: "Auto Next", value: "auto-next", info: "When track is done, create and play a new track."},
                ]
            }
            let loopSetting:lib.RadioSetting<LoopOptions> = {
                label: "",
                type: "radio",
                name: "loop",
                apply: async (q) => actions.updateLoop(q).then(m.redraw),
                opts: [
                    {label: "Single Play", value: "single", info: "Play the selected track once through."},
                    {label: "Double Play", value: "double", info: "Play the selected track twice through."},
                    {label: m(".", m("i", "n"), " Play"), value: "n", info: `Play the selected track ${state.loopN} time${state.loopN==1?"":"s."}`},
                    {label: "InfiniPlay", value: Infinity, info: "∞ Please don't stop the music ∞"},
                ]
            }

            let onRangeInput = (e:any) => {
                clearTimeout(debounceRangeTimeout)
                let v = parseFloat(e.target.value)
                if (isNaN(v)) return;

                localRangeVal = v
                debounceRangeTimeout = setTimeout(() => {
                    console.log("completed await volume")
                    actions.updateVolume(localRangeVal).then(m.redraw)
                }, 50)
            }

            let volumeControls = m(".field", 
                m(".column.control",
                    m("h4.has-text-light", "Volume"),
                    m("input", {type:"range", min:0, max:1, step:0.01, value: localRangeVal, oninput:onRangeInput})
                )
            )

            let loopExtra: ""|m.Vnode<any> = ""
            if (state.loop === "n") {
                async function onChangeN(v:number) {
                    clearTimeout(debounceNumberTimeout)
                   
                    localNumVal = v;
                    debounceNumberTimeout = setTimeout(() => {
                        actions.updateLoopN(localNumVal).then(m.redraw)
                    }, 50)
                    
                }
                const nSetting:lib.IntegerSetting = {
                    label: "Set number of repeats",
                    valueLabel: (n) => {
                        return n == 1 
                        ? "Single play"
                        : n + " Repeats"
                    },
                    name: "size",
                    apply: onChangeN,
                    min: 1, 
                    max: 999999999
                  }
                  
                loopExtra = lib.integerSetting(nSetting, state.loopN)
            }
            return lib.section(
                lib.sectionHeading("Play Mode"),
                m(".columns.is-multiline",
                    // m(".column.is-full.mb-5.bordered", volumeControls),
                    m(".column.px-5.my-5", {style: lib.sectionStyle}, lib.radioSetting(queueSetting, state.queue)),
                    m(".column.px-5.mt-5", {style: lib.sectionStyle}, lib.radioSetting(loopSetting, state.loop, loopExtra))
                )
            )   
        }
    }
}