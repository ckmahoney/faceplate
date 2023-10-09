import type {
  ChromaVal,
  Dimensions,
  Quality,
} from '../../types'

import type { 
  PitchName, 
} from './types'
import type { AutoDjTrack} from '../../apps/auto-dj/types'

import m from 'mithril'
import _ from 'lodash'
import moment from 'moment'
import * as lib from '../../view/lib'
import type { Progression } from '../../types'


export const pitchNames: PitchName[] = [
  [ 1, "C#", "Db" ],
  [ 8, "G#", "Ab" ],
  [ 3, "D#", "Eb"],
  [ 10, "A#", "Bb" ],
  [ 5, "F", "F" ],
  [ 0, "C", "C"], 
  [ 7, "G", "G" ],
  [ 2, "D", "D" ],
  [ 9, "A", "A" ],
  [ 4, "E", "E" ],
  [ 11, "B", "B" ],
  [ 6, "F#", "Gb" ]
]

/** Given composition dimensions and a rate of playback, provides the duration in seconds. */
function getDuration(dimensions:Dimensions, cps:number): number { 
  let nCycles = dimensions.base ** dimensions.size * dimensions.cpc
  return nCycles/cps
} 

/** Unit conversion from seconds to minutes. */
function toBpm(cps:number): number { 
  let bpm = cps * 60
  return parseFloat(bpm.toPrecision(2))
} 

/** A list of PitchClasses ordered by 12-ET ascending. Toggle for sharp or flat note names. */
function chromas(selection:ChromaVal, useSharps:boolean=false): m.Vnode {
  const notSelectedStyle:any = {   filter: "invert(50%)" }
  const selectedStyle:any = { transform: "scale(120%)" }

  return m(".m-0.columns.ribbon", 
    ...pitchNames.map((pn:PitchName) => {
      let selectedClasses = (pn[0] == selection)
        ? ".has-background-success.has-text-bold"
        : ""

        let style = (pn[0] == selection)
         ? selectedStyle
         : notSelectedStyle

      return m(".column.has-text-centered" + selectedClasses, {style}, useSharps ? pn[1] : pn[2])
    })
  )
}

/** The two most popular conventional chord qualities in Western 12-ET music. */
function qualities(selection:string) {
  const flex:any = {display: "flex", "align-items": "center", "justify-content": "center"}
  const s:any = { maxWidth: "100px" }
  const notSelectedStyle:any = {  transform: "scale(66%)", filter: "invert(50%)" }
  const selectedStyle:any = { color: "white" }
  const block:any = { style: {display:"block" }}

  let oStyle = selection.toLowerCase() == "major" ? selectedStyle : notSelectedStyle
  let uStyle = selection.toLowerCase() == "minor" ? selectedStyle : notSelectedStyle

  return m(".m-0.columns.ribbon.has-text-centered", 
    m(".column.is-half", {style:oStyle},
      m("p.is-uppercase.has-text-light", "major")
    ),
    m(".column.is-half", {style:uStyle},
      m("p.is-uppercase.has-text-light", "minor"),
    )
  )



  return m(".m-0.columns.ribbon", 
      m(".column", {style: flex},
        m(".", {style: {...s, ...oStyle}}, m("img", {...block, src: "assets/svg/overtone.svg"}))),
      m(".column", {style: {...flex, transform: "rotate(180deg)"}},
        m(".", {style: {...s, ...uStyle}}, m("img", {...block, src: "assets/svg/undertone.svg"}))
      )
    )
  
}


/** Metadata about the music currently being played. */
function details(isPlaying:boolean, quality:Quality, duration:number, bpm:number, captureButton:m.Vnode, playButton:m.Vnode) {
  const centered = { style: { display: "flex", alignItems: "center", justifyContent: "center" } }

  let mids = 
    ([ quality
    , `${bpm} BPM`
    , moment(new Date(duration * 1000)).format("mm:ss")
    ]).map((text:string|m.Vnode,i:number) => 
      m(".column.p-0", {key:i,...centered}, text))

  let first = m(".column.p-0.has-text-left", {key:"last"}, playButton)
  let last = m(".column.p-0.has-text-right", {key:"last"}, captureButton)
  
  return m("div", 
      m(".m-0.columns.is-size-3.p-0", 
      [
        first, 
        ...mids.concat([last])
      ]
      )
  )
}
/** Metadata about the music currently being played. */
function detailsCompact(quality:Quality, duration:number, bpm:number, captureButton:m.Vnode, playButton:m.Vnode) {
  const centered = { style: { display: "flex", alignItems: "center", justifyContent: "center" } }

  return m(".m-0.is-flex-vertical", 
      ([ captureButton
      , m("h4.is-size-4", quality)
      , m("h4.is-size-4", `${bpm} BPM`)
      , m("h4.is-size-4", moment(new Date(duration * 1000)).format("mm:ss"))
      , playButton
      ]).map((text:string|m.Vnode) => 
        m(".column.my-5", centered, text))
  )
}

function trackSummary(quality:Quality, duration:number, bpm:number) {
  const centered = { style: { display: "flex", alignItems: "center", justifyContent: "center" } }

  return m(".", {style:{minWidth:"204px"}}, 
      m(".m-0.px-5.is-flex-vertical", 
          ([ m("b.is-size-4", quality),
          , m("b.is-size-4",`${bpm} BPM`),
          , m("b.is-size-4", moment(new Date(duration * 1000)).format("mm:ss"))
          ]).map((text:string|m.Vnode) => 
            m(".column", centered, text))
      )
  )
}


/** Given a list of things non-scalar objects, returns the uniques of them. */
function unique(els:any[]): any[] {
  return els.map((el:any, i:number) => {
    const index = els.findIndex((y:any) => _.isEqual(el, y))
    if (index === i) {
      return el
    }
  })
  .filter((el:any, i:number) => el)
}
function getHues(n:number):number[] {
  let hueStops = _.times(n, (i:number) => {
    let hue = 360 * (i/n)
    return hue
  })
  return hueStops
}
function hsl(hue: string|number, saturation: string|number, lightness: string|number, alpha?: null|string|number): string {
  return typeof alpha != 'undefined'
    ? `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`
    : `hsl(${hue}, ${saturation}%, ${lightness}%)`
}
function weightcards(cpc:number, progression:Progression) {
  let duration = progression.reduce((acc, place) => acc + place[0], 0)
  let places = progression.map((place) => place[1])
  let durs = progression.reduce((acc:any, place) => {
    let k = place[1]
    if (!acc[k]) { acc[k] = 0 }
    acc[k] += place[0]
    return acc 
  }, {})
  let us = unique(places)
  let colors = getHues(us.length)
  return m(".content", 
    // lib.sectionHeading("Progression"),
    m(".columns.my-5.py-5.is-multiline.justify-content-space-around", 
    us.map((name, i) => {
      let hue = colors[i]
      const backgroundColor:string = hsl(hue, 75, 70)
      let percent:number|string = durs[us[i]] * 100 / duration
      if (percent % 1 != 0) {
        percent = (percent).toPrecision(2)
      }
      return m(".p-0.my-3", {style:{backgroundColor, flexBasis: "28%"}}, 
          m('.m-3.p-1.has-background-black.has-text-centered.has-text-white', name)
      )
    }))
  )
}


/** All of the components above in one place. */
export function watchPanel(isPlaying:boolean, autoDjTrack:AutoDjTrack,  createButton:m.Vnode, captureButton:m.Vnode, playButton:m.Vnode,  oscilloscope:m.Vnode<any>) {
  const { conf, composition } = autoDjTrack
  let pitchName = composition.quality.split(" ")[0]
  const chroma = pitchNames.find(([c, sharp, flat]) => {
    return pitchName == sharp || pitchName == flat
  })

  let headFlow
  if (lib.isMobile()) {
    headFlow = ".is-flex.flex-vertical.has-text-centered"
  } else {
    headFlow = ".is-flex.is-justify-content-space-between.mb-5"
  }

  // const heading = m(headFlow, 
      // lib.sectionHeading("Private Radio"), 
      // createButton
  // )

  if (window.innerWidth <= lib.breakpoints.mobile) {
    // mobile
    return lib.section(
      // heading,
      oscilloscope, 
      detailsCompact(composition.quality, composition.duration/conf.cps, toBpm(conf.cps), captureButton, playButton),
    )
  } else if (window.innerWidth > lib.breakpoints.tablet) {
    // desktop
      return lib.section(
        // heading,
        m(".my-5", oscilloscope),
        details(isPlaying, composition.quality, composition.duration/conf.cps, toBpm(conf.cps), captureButton, playButton ),
      )
  } else {
    // tablet
    return lib.section(
      // heading,
      oscilloscope, 
      detailsCompact(composition.quality, composition.duration/conf.cps, toBpm(conf.cps), captureButton, playButton),
    )
  }
}

export function trackDetails(track:AutoDjTrack) {
  const {conf , composition} = track
  const { quality } = composition 
  const duration = composition.duration/conf.cps
  const timestamp = moment(new Date(duration * 1000)).format("mm:ss")

  const centered = { style: { display: "flex", alignItems: "center", justifyContent: "center" } }

  let label = lib.isMobile() ? "b.is-size-5" : "b.is-size-4"

  if (lib.isMobile()) {
    return m(".p-3.columns.is-mobile",
      m(".column.is-half.columns", m(".column", m(label, quality)), m(".column", m(label, timestamp))),
      m(".column.is-half", m(".column", m(label,`${toBpm(conf.cps)} BPM`))),
    )
  }

  return m(".p-5",
    m(".columns", m(".column", m(label, quality)), m(".column.has-text-right", m(label, timestamp))),
    m(label,`${toBpm(conf.cps)} BPM`),
  )
}