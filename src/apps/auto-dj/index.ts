import type { PlayControl, Mote, Range, DepthValues } from '../../types'
import type { AutoDjTrack,  AutoDj } from './types'
import type { MakeArcParams  } from '../../actions/types'

import m from 'mithril'
import _ from 'lodash'

import * as local from '../../apps/local'
import * as lib from '../../view/lib'
import * as window from '../../view/window'
import * as controls from '../../apps/radio/controls'
import * as playView from '../../components/playview'

enum DesignOptions {
  algo = "algo",
  designer = "designer"
}

enum QualityOptions {
  major = "major",
  minor = "minor",
  dominant = "dominant",
  halfdim = "halfdim"
}
export type AutoDjAttrs = {
  analyser:AnalyserNode
  gain: Range
  updateGain: (val:Range) =>any
  play: () => void,
  stop: () => void, 
  isPlaying:boolean
  tracks: AutoDjTrack[];
  captureButton: m.Vnode
  createTrack: (body?: any) => Promise<void|AutoDjTrack>
  select:(i:number)=>boolean
  selection:number
  playControls: controls.Props
  useGenParams:boolean
  toggleGenParams:()=>boolean
  genParams:MakeArcParams
  upGenParams: (p:MakeArcParams) => any
}

type KeyPick = string | "showMajor" | "showMinor" 
let keyPick:KeyPick = "showMajor"

function rotate(source:any[], offset:number) {
  let arr = _.cloneDeep(source)
  const len = arr.length
  arr.push(...arr.splice(0, (-offset % len + len) % len))
  return arr
}

function info(msg:string):m.Vnode<any> {
  return m("p.is-size-3", msg)
}

function createOscilloscope(canvas:HTMLCanvasElement, analyser:AnalyserNode) {
  const canvasContext = canvas.getContext('2d');
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  let playing = false
  // Function to draw the oscilloscope
  function frame(t:number) {
    //   if (Math.floor(t % 10) != 0 ) {
    //     return 
    // }
      analyser.getByteTimeDomainData(dataArray);

      canvasContext.clearRect(0, 0, canvas.width, canvas.height);
      canvasContext.lineWidth = 2;
      canvasContext.strokeStyle = 'cyan';
      canvasContext.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * canvas.height) / 2;

          if (i === 0) {
              canvasContext.moveTo(x, y);
          } else {
              canvasContext.lineTo(x, y);
          }

          x += sliceWidth;
      }

      canvasContext.lineTo(canvas.width, canvas.height / 2);
      canvasContext.stroke();
  }

  function stop() {
    playing = false
  }

  function start() {
    playing = true 
    loop(0)
  }

  // Start drawing the oscilloscope
  function loop(t:number) {
      frame(t);

      if (playing)
        requestAnimationFrame(loop);
  }

  return {stop, start, loop};
}

function btnStyle(hue:number):any {
  return {
    background: "black",
    borderColor: lib.color(1.25, 1.25, [hue, 0.5, 0.5]),
    color: lib.color(1.5, 1.15, [hue, 0.5, 0.5]),
    borderWidth: "5px"
  }
}

let nextBtnStyle = btnStyle(280)
let createBtnStyle = btnStyle(220)
let captureBtnStyle = btnStyle(60)
let stopBtnStyle = {
  backgroundColor: lib.color(1.5, 1.15, [320, 0.5, 0.5]),
  color: "white",
  fontWeight: "bold"
}
let playBtnStyle = {
  backgroundColor: lib.color(1.5, 1.15, [120, 0.5, 0.5]),
  color: "black",
  fontWeight: "bold"
}

let descriptionClosed = local.getBool("toggle-description-debut-bee", false)
function toggleDescription(e:any) {
  descriptionClosed = !descriptionClosed
  local.setBool("toggle-description-debut-bee", descriptionClosed)
}


let sectionStyle =  {style: {
    margin: "30px 20px", 
    border: "5px #222", boxShadow: "0 0 8px 5px #111"
  }
};



function genParamsEditor(createButton:m.Vnode<any>, useGenParams:boolean, toggleUse:() => any, genParams:MakeArcParams, upGenParams:(p:MakeArcParams) =>any) {
  let designSetting:lib.RadioSetting<`${DesignOptions}`> = {
    label: "",
    type: "radio",
    name: "design",
    apply: toggleUse,
    opts: [
      {label: "Algo's Choice", value: "algo", info: "Let us roll the dice."},
      {label: "Designer", value: "designer", info: "Describe how you want it to sound."},
    ]
  }

  function depthEditor(genParams:MakeArcParams):m.Vnode<any> {
    let depthSetting:lib.SelectSetting<`${DepthValues}`> = {
      label: "Musical Depth",
      name: "complexity",
      apply: async (v:keyof typeof DepthValues) => {genParams.complexity = v; upGenParams(genParams)},
      opts: [
        {label: "Basic", value: "simple", info: "Compose with a reliable chord progression."},
        {label: "Standard", value: "standard", info: "Compose with a popular progression and a lil atypical."},
        {label: "Complex", value: "complex", info: "Compose with a heady set of harmonies."},
      ]
    }

    return lib.selectSetting(depthSetting, genParams.complexity)

  }


    let designSelection = lib.radioSetting(designSetting, useGenParams ? "designer" : "algo")
    function upQuality(r:string, q:string) {
      genParams.quality = r + " " + q
      upGenParams(genParams)
    }

    const sizeSetting:lib.IntegerSetting = {
      label: "Duration",
      valueLabel: (size) => {
        return Math.pow(2, genParams.dimensions.size).toString() + " bars"
      },
      name: "size",
      apply: async function upSize(size:number) { 
        genParams.dimensions.size = size 
        upGenParams(genParams)
      },
      min: 0, 
      max: 6
    }
    const cpcSetting:lib.IntegerSetting = {
      label: "Time Signature",
      valueLabel: (n) => `${n} / 4`,
      name: "cpc",
      apply: async function upCpc(cpc:number) { 
        genParams.dimensions.cpc = cpc 
        upGenParams(genParams)
      },
      min: 1, 
      max: 7
    }

    const orchBeat:lib.IntegerSetting = {
      label: "# Beat",
      name: "nEnharmonic",
      apply: async function upNumBeatVoices(num:number) { 
        genParams.nEnharmonic = num
        upGenParams(genParams)
      },
      min: 0, 
      max: 16
    }

    const orchInst:lib.IntegerSetting = {
      label: "# Inst",
      name: "nMelodic",
      apply: async function upNumBeatVoices(num:number) { 
        genParams.nMelodic = num
        upGenParams(genParams)
      },
      min: 0, 
      max: 16
    }

      const pitch = genParams.quality.split(" ")[0]
      const quality = genParams.quality.split(" ")[1]

      let  button = "button.button.my-3.column.border-none" + (lib.isMobile() ? ".is-size-5" : ".is-size-3")
      const highlighted = ".has-background-white.has-text-black"
      const dark = ".has-background-black.has-text-white"
      const up = (pitch:string, quality:string) => {
        return (e:any) => {
          upQuality(pitch, quality)
          upGenParams(genParams)
        }
      }

      if (lib.isDesktop()) {
        button += ".is-2"
      } 
      const majors = playView.pitchNames.map((pitchName) => {
        let style = dark
        if (quality == "major" && (pitch == pitchName[2] || pitch == pitchName[1])) {
          style = highlighted
        }
        return m(button + style, {onclick: up(pitchName[2], "major")}, pitchName[2] + " major")
      })

      const minors = rotate(playView.pitchNames, -3).map((pitchName) => {
        let style = dark
        if (quality == "minor" && (pitch == pitchName[2] || pitch == pitchName[1])) {
          style = highlighted
        }
        return m(button + style, {onclick: up(pitchName[2], "minor")}, pitchName[2] + " minor")
      })


      let pSettings:lib.SelectSetting<string> = {
        label: "Key",
        name: "p-signaure",
        apply: async (p:string) => {
          let q = genParams.quality.split(" ")[1]
          upQuality(p, q)
          upGenParams(genParams)
        },
        opts: playView.pitchNames.map(([chroma, sharp, flat]) => {
          if (local.getBool("use-sharps")) {
            return {label: sharp, value: sharp}
          }
          return {label: flat, value: flat}
        })
      }

      let qSettings:lib.SelectSetting<string> = {
        label: "Quality",
        name: "q-signaure",
        apply: async (q:string) => {
          let p = genParams.quality.split(" ")[0]
          upQuality(p, q)
          upGenParams(genParams)
        },
        opts: [
          {label: "Major", value: "major"},
          {label: "Minor", value: "minor"},
        ]
      }
      let pSelector = lib.selectSetting(pSettings, genParams.quality.split(" ")[0])
      let qSelector = lib.selectSetting(qSettings, genParams.quality.split(" ")[1])

    const mood  =  m("div", 
        m(".has-text-centered", lib.info("Music in the key of " + genParams.quality + ".")),
        m(".columns",
          m(".column.p-3", sectionStyle, pSelector),
          m(".column.p-3", sectionStyle, qSelector)
        )
    )

    const dimensions = m(".columns", 
      m(".column.is-half", sectionStyle,
        m(".p-5", lib.integerSetting(sizeSetting, genParams.dimensions.size, lib.info("The duration of the composition in measure of music.")))
      ),
      m(".column.is-half", sectionStyle,
        m(".p-5", lib.integerSetting(cpcSetting, genParams.dimensions.cpc, lib.info("The count of beats per measure.")))
      )
    )
        
    const orchestration = m(".", 
      m(".columns", 
          m(".column.p-3", sectionStyle, m(".px-3", depthEditor(genParams))),
          m(".column.p-3", sectionStyle, m(".px-3", lib.integerSetting(orchBeat, genParams.nEnharmonic, lib.info("How many percussive elements to include.")))),
          m(".column.p-3", sectionStyle, m(".px-3", lib.integerSetting(orchInst, genParams.nMelodic, lib.info("How many melodic instruments to include."))))
      )
    )

  const tabs:window.Tab[] = [
    {id: "dimensions", label: "Dimensions", target: "dimensions"},
    {id: "mood", label: "Key", target: "mood"},
    {id: "orchestration", label: "Orchestration", target: "orchestration"},
  ]

  const pages:window.Page[] = [
    {id: "mood", el: mood},
    {id: "dimensions", el: dimensions},
    {id: "orchestration", el: orchestration},
  ]

  let headFlow
  if (lib.isMobile()) {
    headFlow = ".is-flex.flex-vertical.has-text-centered"
  } else {
    headFlow = ".is-flex.is-justify-content-space-between"
  }

  return lib.section(
      m(headFlow, 
        // lib.sectionHeading("Designer"),
        createButton
      ),
      m(".p-5", lib.sectionStyle, designSelection),
      useGenParams && m(window.LeftNav, {tabs, pages})
  )
}


/** Render a UI for playing and capturing generated music. */
export function AutoDj(): m.Component<AutoDjAttrs> {
  let canvas:HTMLCanvasElement = document.createElement("canvas")
  let oscilloscope:{start:Function,stop:Function,loop:Function}

  let fOn = (x:Element) => {}

  return { 
    oncreate({dom, attrs}) {
      fOn = function onInsert(insertContainerEl:Element) {
        canvas.height = 50
        canvas.width = insertContainerEl.clientWidth
        oscilloscope = createOscilloscope(canvas, attrs.analyser)
        oscilloscope.start()
      }
    },
    view(mith) {
      const { attrs } = mith
      const { isPlaying, tracks, captureButton, useGenParams, toggleGenParams, genParams} = attrs
      
      const curr = attrs.selection == -1
        ? null
        : attrs.tracks[attrs.selection] 

      function description(isClosed:boolean, toggle:(e:any)=>void):m.Vnode {
        let index = 0;

        if (isClosed) { 
          let button = "button.button.my-5.has-background-black.has-text-light.is-block.is-outlined"  
          if (lib.isMobile()) {
            button += ".is-size-5"
            return m(button + ".max-width-none.is-fullwidth.mb-5", {onclick:toggle}, "Description") 
          }

          button += ".is-size-3"
          return m(".my-5", {style: {display:"flex", justifyContent:"right"}}, 
            m(button, {onclick:toggle}, "Description") 
          )
        }

        let playMessage = isPlaying
          ? m("p.is-size-4", "Use the ", m("button.button.is-outlined", {style:{cursor:"default", ...stopBtnStyle}}, "Stop"), " button to stop playback on the current composition.")
          : m("p.is-size-4", "Press the ", m("button.button.is-success.has-text-dark", {style:{cursor:"default", ...playBtnStyle}}, "Play"), " button to start a composition from the beginning.")

        let playingMessage = isPlaying
          ? m("p.is-size-4", "Skip the playing song by using ", m("button.button.is-rounded.is-link.is-outlined", {style:{cursor:"default", ...nextBtnStyle}}, "Next"), "")
          : m("p.is-size-4", "Use the ", m("button.button.is-rounded.is-link.is-outlined", {style:{cursor:"default", ...createBtnStyle}}, "Create"), " button to make a new composition.")
        
        let captureMessage = 
          m("p.is-size-4", "When you find a composition that you like, use the ", m("button.button.is-rounded.is-success", {style:{cursor:"default", ...captureBtnStyle}}, "Capture")," button to add it to your collection.")
        
          let items = [
            playingMessage,
            playMessage,
            captureMessage
        ]

        let detail;
         
        let closeButton, eyePop
        if (lib.isMobile()) {
          closeButton =m("button.button.is-size-4.mb-3.mx-auto.is-outlined.is-info.is-fullwidth", {onclick:toggle}, "Close")
        } else {
          detail = m("heading", 
              m("h2.subtitle.m-0.is-size-2", "Private Radio"),
              m("small.is-size-4", "Music Design & Discovery")
          );
          closeButton =m("button.button.is-size-4.mb-3.mx-auto.is-outlined.is-info", {style:{float:"right"},onclick:toggle}, "Close")
          eyePop = m(".mb-5.is-size-1.is-italic.has-text-grey-light", "Let's make some music!")
        }

        if (lib.isMobile)
        return m(".box.my-5", 
            closeButton,
            detail,
              m(".has-text-centered",
              eyePop,
              m("p.my-3.is-size-3", "Here's how to push my buttons."),
              m(lib.Carousel, {pages:items})
            )
          )
      }

      function playlist() {
        let listings = tracks.map((track, i) => {
          let selectedBg = ""
          if (i == attrs.selection) {
            selectedBg = ".has-background-white.has-text-black"
          }

          function onclick(e:any) {
            if (!attrs.select(i)) {
              console.log("Error during seletion")
              return
            }
            attrs.stop()
            m.redraw()
          }

          let icon = playView.trackDetails(track)
          return m(".bordered.my-3"+ selectedBg,  
              { onclick: onclick, style: {cursor:"pointer", minWidth:"204px"}},
              icon
            )
        })

        return lib.section(
            lib.sectionHeading("Tracks"),
            m(".p-3.my-3", { style: { 
                overflowY:"auto",
                maxHeight: "50vh",
                backgroundColor: lib.color(1, 0.2)
              }},
              ...listings
            ),
            m(".mt-5.is-flex.is-justify-content-center", createButton)
        )
      }

      async function handleCreate(e:any) {
        let track
        if (useGenParams) {
          track = await attrs.createTrack(genParams)
        } else {
          track = await attrs.createTrack()
        }

        if (!track) {
            console.log("unexpected error getting a track")
            return
        }

        m.redraw()
      }

      let btnSize = lib.isMobile() ? ".is-size-4" : ".is-size-3"
      let playStateButton

      if (isPlaying === true) {
        playStateButton = m("button.button.p-0" + btnSize, {style:{border:"none", ...stopBtnStyle}, onclick: () => { attrs.stop(); m.redraw() }}, "Stop")
      } else {
        playStateButton = m("button.button.p-0" + btnSize, {style:{border:"none", ...playBtnStyle}, onclick: () => { attrs.play(); m.redraw()}}, "Play")
      }
      
      let createButton = m("button.button.mb-5.is-rounded.is-outlined" + btnSize, {onclick:handleCreate, style:createBtnStyle}, "Create")

      let noTracksMessage = lib.section(
        // m(".columns.p-0.mb-5.is-justify-content-space-between", m("."), m(".column.p-0", {}, createButton)),
        m(lib.isMobile() ? "p.is-size-4" : "p.is-size-3", "Create a track to start the radio.")
      )

      if (attrs.tracks.length == 0) {
        return m("section.px-5",
          description(descriptionClosed, toggleDescription),
          noTracksMessage,
          genParamsEditor(createButton, useGenParams, toggleGenParams, genParams, attrs.upGenParams)

        )
      } 

      let helpText= m(".is-block", {style: {position: "absolute"}}, 
        m("p.is-size-1.hover-in.is-italic.has-text-white", {
          style: {
            boxShadow: "0 0 20px black",
            padding: "100px",
            background: "black",
            zIndex: 10,
            position: "relative"
          }
        }, "Stop playback to change settings"))
        
      let playbackSetting = !attrs.isPlaying
        ? m(".column.is-8", m(controls.playControls, attrs.playControls))
        : m(".column.is-8",
            helpText,
            m(".", {style: {
              filter: "brightness(33%)",
              pointerEvents: "none"
            }}, m(controls.playControls, attrs.playControls)
          ))
        
      let playViewPanel = m(".mb-5", 
        playView.watchPanel(isPlaying, curr, createButton, captureButton, playStateButton, m(Insert, {child:canvas, onInsert: fOn})),
        m(".columns", 
          m(".column.is-4", playlist()),
          playbackSetting,
        ),
      )

      
      const tabs:window.Tab[] = [
        {id: "radio", label: "Radio", target: "playview" },
        {id: "dials", label: "Designer", target: "genParamsEditor" }
      ]

      const pages:window.Page[] = [
        {id: "playview", el: playViewPanel},
        {id: "genParamsEditor", el: genParamsEditor(createButton, useGenParams, toggleGenParams, genParams, attrs.upGenParams)},
      ]


      return m("section" + (lib.isMobile() ? "" : ".px-5"),
          description(descriptionClosed, toggleDescription),
          m(".mt-5", 
            m(window.TopNav, {tabs, pages})
          )
      )
    }
  }
}

function Insert():m.Component<{child:Element, onInsert:(insertContainerEl:Element)=>any}> {
  return {
    oncreate({dom,attrs}) {
      dom.appendChild(attrs.child)
      attrs.onInsert(dom)
    },
    view() { 
      return m(".")
    }
  }
}
