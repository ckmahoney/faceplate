import type { Capture, Performance, JSONParsesTo, Cache, PlayControl, Editor } from '../types'

import m from 'mithril'
import moment from 'moment'
import _ from 'lodash'
import axios from 'axios'

import ActTinPan from '../actions/tin-pan'
import * as lib from './lib'

import {apiUrls} from '../actions/conf'

let local:any = {
    sent: {},
    editing: {}
}
type Index = number
type Action = {
    name:string
    selection:null|Index
}

let action:Action = {
    name: "",
    selection: null
}


type TempoSegment = {
    name: string;
    description: string;
    bpmRange: { min: number; max: number };
};

let textFilter = ""
let selections:FilterOpt[] = [] 
let doSearch:any; 
let filteredCollection:Array<Capture> = []

type FilterOpt = "performances" | "favorites"
function CollectionFilters():m.Component<{collection:Array<Capture>, setResults: (cs:Capture[]) => any}> {
    function search(collection:Capture[], setResults:any) { 
        let filter = textFilter.toString().toLowerCase()
        let matches = collection.filter((capture) => {
            let textMatch = (
                capture.title.toLowerCase().includes(filter) 
                || (`Song ${capture.captureId}`).includes(filter)
                || capture.notes.toLowerCase().includes(filter) 
            )

            let selectorsMatch = (
                (!selections.includes("favorites")? true : capture.favorite)
                && (!selections.includes("performances")? true : capture.performances.length > 0)
            )

            if (filter == "") return selectorsMatch
            if (selections.length == 0) return textMatch 
            return textMatch && selectorsMatch
        })
        filteredCollection = matches
        setResults(matches)
    }
    
    return {
        oninit({attrs}) {
            filteredCollection = attrs.collection
            attrs.setResults(filteredCollection)
        },
        onupdate({attrs}) {
            if (!textFilter && selections.length == 0) {
                if (attrs.collection.length != filteredCollection.length) {
                    filteredCollection = attrs.collection
                    m.redraw()
                }
            }
        },
        view({attrs}) {
            function oninput(e:any) {
                textFilter = e.target.value
                clearTimeout(doSearch)
        
                doSearch = setTimeout(() => search(attrs.collection, attrs.setResults), 50)
            }
        
            let filterSetting:lib.CheckboxSetting<FilterOpt> = {
                label: "",
                type: "checkbox",
                name: "filters",
                apply: (selection:FilterOpt) => {
                    let ind = selections.indexOf(selection)
                    if (ind !== -1) {
                        selections.splice(ind, 1)
                    } else {
                        selections.push(selection)
                    }
                    search(attrs.collection, attrs.setResults)
                    m.redraw()
                    return Promise.resolve(selections)
                },
                opts: [
                    {label: "Favorite", value: "favorites", info: "Play the selected track twice through."},
                    {label: "Has Performance", value: "performances", info: "Play the selected track once through."},
                ]
            }
            return m("",
                m("input.input", {oninput, type:"text", placeholder: "Search songs", name:"nameFilter", value: textFilter}),
                lib.checkboxSetting(filterSetting, selections)
            )
        }
    }
} 

function col(size:string|number, v:m.Vnode<any>) { 
    return m(`.p-0.column.is-${size}.is-size-4`, v)
}

function teaser(capture:Capture) {

    if (lib.isMobile()) {
        return m(".p-3.my-5.columns.is-mobile.is-align-items-center",
            m(".column.is-10", m("b", capture.title || `Song ${capture.captureId}`)),
            m(".column.is-2", m(".has-text-centered", capture.favorite ? "❤️" : "" )),
        )
    }
    
    return m(".p-3.my-5.columns.is-align-items-center",
        col(2,  m(".has-text-centered", capture.favorite ? "❤️" : "" )),
        col(4, m("b", capture.title || `Song ${capture.captureId}`)),
        col(6, m("i", capture.notes.slice(0, 100))),
        // col(2, m("b", moment(capture.createdAt).format('h:mm a')))
    )
}

export type Props = {
    token:string, 
    collection:Array<Capture>, 
    getCollection:() => Promise<Array<Capture>>, 
    upCollection:(cs:Array<Capture>)=>Promise<any>, 
    playControl:PlayControl, 
    createPerformance:(captureid:number)=>Promise<any>
}
export function Module():m.Component<Props> {

    return {
        oninit({attrs}) {
            attrs.getCollection()
            .then(function gotCaptures(captures:Capture[]) {
                return attrs.upCollection(captures)
            })
            .catch((e) => {console.log("Error getting captures oninit"); console.log(e)})
            .finally(m.redraw)
        },
        oncreate({attrs}) {

        },
        view({attrs}) {
            const {token, playControl, createPerformance} = attrs
            return render(token, attrs.collection, playControl, createPerformance)
        },
        onbeforeupdate() {

        },
        onupdate({attrs}) {
        },
        onbeforeremove() {
            // stringify collection
        },
        onremove() {

        }
    }
}

const previewButtonAttrs = {
    onclick: (e:any) => {
        window.alert("Nice! I'm glad you want to do that. MIDI and Stems are the next two features I plan to provide. Are Performances enough for now?")
    },
    style: {
        maxWidth: "none",
    }
}


export function render(token:string, collection:Array<Capture>, playControl:PlayControl, createPerformance:(captureid:number)=>Promise<any>):m.Vnode {
    function toggleFavorite(captureId:number) {
        return axios.post(apiUrls.toggleFavoriteCapture + "/" + captureId, {}, {
            headers: {
            "Accept": "application/json",
            "Authorization": `Bearer: ${token}`,
            }
        })
        .then(function okResponse(response) {
            let doc = collection.find(cap => cap.captureId == captureId)
            doc.favorite = response.data.favorite
        })
        .catch(function or400500(errResponse) {
            if (errResponse.status >=400 && errResponse.status < 500) {
                console.error("Sent a bad request to toggle capture")
            } else {
                console.error("Unexpected error while making toggleCapture request")
            }
            console.log(errResponse.message)
        })
        .finally(m.redraw)
    }
    function viewPerformances(performances:Performance[], createPerformanceButton:m.Vnode<any>) {
        let status = (performances.length==0)
            ? m("p.my-5.is-size-4", "Create a performance to play & download recordings")
            : m("p.my-5.is-size-3.has-text-bold", {style:{textDecoration:"underline"}},performances.length + " recording" + (performances.length==1? "":"s"))
        
        let listings = m(".columns.is-multiline",
            performances.map((performance) => {
                let val:any;

                switch (performance.status) {
                    case "satisfied":
                        val = m("audio.audio", {src: performance.url, controls:true})
                        break;
                    case "pending":
                        val = m("p.ml-3.is-size-5", "recording in progress...")
                        break;

                    case "failed":
                        val = m("p.ml-3.is-size-5", "Recording error")
                        break;
                }
                return m(".columns.is-align-items-center",
                    col(4, val),
                    col(4, m("a.is-size-6", {href:performance.url, target:"_blank"}, performance.url)),
                    col(2, m("p.is-size-6", moment(performance.createdAt).format('MMM Do YYYY'))),
                    col(2, m("p.is-size-5", moment(performance.createdAt).format('h:mm a')))
                )
            })
        )

        return m(".box",
            lib.subheading("Performances"),
            m(".is-flex.is-justify-content-center.mb-3", createPerformanceButton),
            m(".columns.mb-3.is-hidden", 
                m("button.button.is-size-4.is-rounded.is-info", previewButtonAttrs, "Download Stems" ),
                m("button.button.is-size-4.is-rounded.is-info", previewButtonAttrs, "Download MIDI" )
            ),
            status,
            listings
        )
    }
    
    function viewCapture(capture:Capture, createPerformanceButton:m.Vnode<any>, close:()=>any, toggleFavorite:(id:number)=>Promise<any>,...buttons:m.Vnode[]) {
        console.log("Got capture", capture.generationParams)
        let name = capture.title || `Song ${capture.captureId}`
        let btnSize = lib.isMobile() ? ".is-size-4" : ".is-size-3"
        let favoriteButton = m("button.button.max-width-none" + btnSize + ((!capture.favorite) ? ".has-background-black" : ""), {
            onclick:(e:any) =>toggleFavorite(capture.captureId),
            style: {color: lib.color(1, 4/3)}
        }, capture.favorite ? "❤️" : m("code.has-background-black", {style: {width:"50px", height: "50px"}}, "< 3"))


        // col(2, m("b", moment(capture.createdAt).format('MMM Do YYYY'))),
        let closeButton
        if (lib.isMobile()) {
            closeButton = m("button.button.max-width-none.mb-5.is-size-5.is-fullwidth", {onclick:(e:any) =>close()}, "Close")
        } else {
            closeButton = m("button.button.is-size-4", {onclick:(e:any) =>close()}, "Close")
        }

        if (lib.isMobile()) {
            return m(".box", 
                closeButton,
                lib.subheading(name),
                m(".my-5.is-flex.is-justify-content-space-between.is-align-items-center", buttons),
                favoriteButton,
                m(".box.my-5", 
                    m("label.label.is-size-4", "Notes"),
                    capture.notes == ""
                    ? m("p.is-size-5", "No notes on this composition")
                    : m("p.is-size-5", capture.notes)
                ),
                viewPerformances(capture.performances, createPerformanceButton),
            ) 
        }
        buttons = [buttons[0], favoriteButton, buttons[1]]

        return m(".box", 
            lib.subheading(name, closeButton),
            m(".my-5.is-flex.is-justify-content-space-between.is-align-items-center", buttons),
            m(".box.my-5", 
                m("label.label.is-size-4", "Notes"),
                capture.notes == ""
                ? m("p.is-size-5", "No notes on this composition")
                : m("p.is-size-5", capture.notes)
            ),
            viewPerformances(capture.performances, createPerformanceButton),
        )   
    }

    function editCapture(capture:Capture, editor:Editor<Capture>) {
        function notesChange(e:any) {
            editor.curr.notes = e.target.value
            editor.update(editor.curr)
        }
        function titleChange(e:any) {
            let next = _.cloneDeep(editor.curr)
            next.title = e.target.value
            editor.update(next)
        }
        return m(".box", 
            lib.subheading("Update Capture Details"),
            m(".mb-5", 
                m("label.is-size-4", "Title"),
                m("input.is-size-4", {type:'text', oninput:titleChange, value:editor.curr.title}),
            ),
            m(".mb-5", 
                m("label.is-size-4", "Notes"),
                m("textarea.is-size-4", {oninput:notesChange}, editor.curr.notes)
            ),
            m(".is-flex.is-justify-content-space-around", 
                m("button.button.has-background-info.has-text-light", {onclick:(e:any) => editor.save()}, "Save"),
                m("button.button", {onclick:(e:any) => editor.cancel()}, "Cancel")
            )
        )
    }
    
    function collectionView(editing:boolean, selection: null|number, collection:Capture[], select:(index:number)=>any) {
        let rowStyle = { 
            margin: "5px 0", 
            cursor:"pointer" ,
            borderRadius:"5px",
            boxShadow: "0px 3px 3px " +lib.color(1, 0.5)
        }

        let setResults = (cs:Capture[]) => {
            filteredCollection = cs
            m.redraw()
        }

        return m(".box",
            m(".columns", 
                m(".column.is-half", lib.subheading("My Collection")),
                m(".column.is-half", m(CollectionFilters, {collection, setResults})),
            ),
            m(".columns.m-0.is-multiline.overflow-y-container",  {style:{maxHeight:"50vh", overflowY:"auto"}}, 
            filteredCollection.map((c, i) => {
                    let selected = selection == i
                    let border = selected ? ".p-0.bordered.has-background-light.has-text-dark" : ".has-text-white.has-background-dark"
                    return m(".column.is-full" + border, {style:rowStyle,onclick: () => select(i)}, teaser(c))
                })
            )
        )    
    }
    
    let select = (index:number) => {
        if (index == action.selection) {
            index = -1
        }
        action.selection = index
        local.stash = collection[action.selection]
        m.redraw()
    }
    
    function viewCollection(editing: boolean, edit:Function, editor:null|Editor<Capture>, selection: null|number, collection:Capture[], createPerformance:(captureId:number)=>Promise<any>, select:(index:number) =>any, playControl:PlayControl, toggleFavorite:(captureId:number)=>Promise<any>) {
        
        let playButton:m.Vnode;

        let listView = collectionView(editing, selection, collection, select)
        let children
        let cap:Capture = collection[selection]

        function onTrackComplete() {
            console.log("The track has stopped from the collection's pov")
        }

        if (editing) {
            children = editCapture(cap, editor)
        } else if (typeof selection == 'number' && selection > -1) {
            let btnSize = lib.isMobile() ? ".is-size-4" : ".is-size-3"
            if (playControl.playing == true) {
                playButton =  m("button.button.has-background-info.has-text-light.is-outlined.is-danger" + btnSize, {onclick:(e:any) => playControl.stop()}, "Stop") 
            } else if (playControl.fetching != null) {
                playButton =  m("button.button.has-background-info.has-text-light" + btnSize, {disabled:true}, "Loading") 
            } else {
                let btn;
                btn = "button.button.has-background-success.has-text-light.is-outlined" + btnSize
                playButton =  m(btn, {onclick:(e:any) => playControl.play(cap.compositionId, onTrackComplete)}, "Play") 
            }

            let editButton =  m("button.button" + btnSize, {onclick:(e:any) => edit()}, "Edit")
            let performButton =  m("button.button.has-background-primary.has-text-light.is-rounded.is-outlined.max-width-none" + btnSize, {onclick:(e:any) => createPerformance(cap.captureId)}, "Create Performance")
            let cap = collection[selection]
            let close = () => {
                action.selection = -1
                m.redraw() 
            }
            let feature = m(".bordered", viewCapture(cap, performButton, close, toggleFavorite, playButton, editButton))
            if (lib.isDesktop()) {
                children = m(".columns", m(".column", listView), m(".column", feature)) 
            } else {
                children = m(".columns", m(".column", feature)) 
            }
        } else {
            children = listView
        }

        return children
    }

    let editor:null|Editor<any>=null
    let editing = local.editing[action.name]
    let edit = () => {
        local.editing[action.name] = true
        m.redraw()
    }
    
    if (editing) {
        async function updateCapture(captureId:number, body:any):Promise<void|Capture> {
            return ActTinPan.patchCapture(token, captureId, body)
            .then(function goodPatch(cap:Capture) {
                console.log("mithirl response", cap)
                let index = collection.findIndex((c:Capture) => c.captureId == cap.captureId)
                collection[index] = cap
                m.redraw()
                return cap
            })
        }
        if (!local.stash) { local.stash = collection[action.selection] }
        editor = {
            from: collection[action.selection],
            curr: local.stash,
            async update(next:Capture) {
                local.stash = editor.curr = _.cloneDeep(next)
                m.redraw()
            }, 
            async save() {
                collection[action.selection] = _.cloneDeep(local.stash)
                local.editing[action.name] = false
                updateCapture(editor.from.captureId, local.stash)
                .then(function updated(cap) {
                delete local.stash
                m.redraw()
                })
                m.redraw()
            },
            async cancel() {
                local.editing[action.name] = false
                delete local.stash
                m.redraw()
            }
        } as Editor<Capture>
    }

    if (collection.length == 0) {
        return m("section", m("p.has-background-info", "Capture a composition to start your collection."))
    }
    
    return m("div",
        viewCollection(editing, edit, editor, action.selection, collection, createPerformance, select, playControl, toggleFavorite) 
    )
}