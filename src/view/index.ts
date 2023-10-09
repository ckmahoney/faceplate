import type { Capture, Conf, Composition, MidiLine, Mote, Midi, JSONParsesTo, Performance, PlayControl } from '../types'
import type { Msg, Client } from './types'
import type { AutoDjTrack }  from '../apps/auto-dj/types'
import type { AppStep } from './main-menu'
import type { AccountDetailsProps } from './account'
import type { MakeArcParams  } from '../actions/types'


type FriendSelfRespone =  {
  captureId: number;
  performances: Array<{
      id: number;
      createdAt: Date;
      updatedAt: Date;
      userId: number;
      compositionId: number;
      status: string
      url: string;
  }>
  id: number;
  userId: number;
  compositionId: number;
  createdAt: Date;
  title: string;
  notes: string;
}
type GetPerformanceResponse = {
id: number;
createdAt: Date;
updatedAt: Date;
userId: number;
compositionId: number;
status: string
url: string;
}

import m from 'mithril'
import moment from 'moment'
import _ from 'lodash'

import * as AppDaw from '../apps/daw'
import MainMenu from './main-menu'
import Header from './header'
import Footer from './footer'
import ToastBox from './toast'
import * as auth from '../auth'
import * as check from '../checks'
import * as local from '../apps/local'
import * as controls from '../apps/radio/controls'
import * as configuration from '../conf'
import * as account from './account'
import * as collection from './collection'
import * as friend from './friend'
import axios from 'axios' 
import * as autoDj from '../apps/auto-dj'
import * as friends from './friend'
import * as lib from './lib'
import { apiUrls }  from '../actions/conf'
import * as AppFrame from '../apps/frame'

let selection:number = -1

// Compositions ids captured this session
let captures:number[] = []

// A list of the compositions read by this session; and the current selected track.
let tracks:AutoDjTrack[] = []
let maxRetries = 3
    
let useGenParams = local.getBool("user-use-gen-params", false)


let pollPending = false
let pollQueued:boolean = false

let apiHandlerMsg:Msg
let createQueue:any[] = []

let statusMonitor:any = {}
function upAsyncStatus(msg:Msg, id?:string) {
  id = id ?? Math.random().toString()
  statusMonitor[id] = msg

  m.redraw()
  return id
}


export const SAMPLES = [
  "samples/kick.mp3",
  "samples/perc.mp3",
  "samples/hats.mp3",
]
function isBeat(role:string) { 
  return (["kick", "perc", "hats"]).includes(role)
}
function getAppDimensions() {
  const { innerWidth, innerHeight } = window
  let frameWidth:number, frameHeight:number, appPadWidth:number, appPadHeight:number;

  if (lib.isMobile()) {
    frameWidth = 20
    frameHeight = 10
    appPadWidth = 18
    appPadHeight = 6
  } else {
    frameWidth = 48 * 2
    frameHeight = 16 * 2
    appPadWidth = 18 * 2
    appPadHeight = 24 * 2
  }
  return { frameWidth, frameHeight, appPadWidth, appPadHeight }
}


function nexus(client:Client, oneoff:(oneoffName:string) => void, did:(oneoffName:string) => boolean):m.Component<any> {
  function clear() {
    playControl.stop().then(m.redraw)
  }

  async function makeTrack(params:any) {
      let asyncId:null|string

      asyncId = upAsyncStatus(
          m("div", 
            m("p", "Creating song " + (tracks.length + createQueue.length + 1)),
            m("p", "Using your design.")
        ), asyncId
      )
      let retry = 0
      let val:any;
      let make = async () => {
          return friends.makeTrack(token, params)
          .then(function gotTrack(track:AutoDjTrack) {
              tracks = [...tracks, track]
              if (selection == -1) {
                  selection = tracks.length - 1
              }
              asyncId = upAsyncStatus(null, asyncId)
              return track
          })
      }

      let handle:any = async () => {
          if (retry == maxRetries) {
              asyncId = upAsyncStatus("We tried as many times as we could, but that one was too hard this time. Sorry.")
              createQueue.splice(createQueue.indexOf(asyncId), 1)
              return m.redraw()
          } else {
              try {
                  val = await make()
                  asyncId = upAsyncStatus(null, asyncId)
                  createQueue.splice(createQueue.indexOf(asyncId), 1)
                  m.redraw()
                  return val
              } catch (e) {
                  retry += 1
                  asyncId = upAsyncStatus("Hang on, trying again # " + retry + ".", asyncId)
                  return handle()
              }
          }
      }
      createQueue.push(asyncId)
      return await handle()
  }


  function select(i:number) {
    if (i > tracks.length) {
        return false
    } else {
        selection = i
        playControl.stop().then(m.redraw)
        return true
    }
  }


  async function genTrack() {
      let retry = 0
      let val:any;
      let createId = Math.random().toString()
      let asyncId:null|string
      let msg:Msg = m(".",
        m("p", "Generating a composition for you."),
        m("p", "This typically takes 5-25 seconds."),
        m("p", "Result goes in your Tracks.")
      )
      asyncId = upAsyncStatus(msg, asyncId)

      let make = async () => {
          return friends.genTrack(token)
          .then(function gotTrack(track:AutoDjTrack) {
              tracks = [...tracks, track]
              if (selection == -1) {
                  selection = tracks.length - 1
              }
              asyncId = upAsyncStatus(null, asyncId)
              return track
          })
      }

      let handle:any = async () => {
          if (retry == maxRetries) {
              asyncId =upAsyncStatus("We tried as many times as we could, but that one really gave it to us hard this time. Sorry.", asyncId)
              createQueue.splice(createQueue.indexOf(createId), 1)
              return m.redraw()
          } else {
              try {
                  

                  val = await make()
                  asyncId =upAsyncStatus(null, asyncId)
                  m.redraw()
                  return val
              } catch (e) {
                  retry += 1
                  asyncId = upAsyncStatus("Hang on, trying again # " + retry + ".", asyncId)
                  return handle()
              }
          }
      }
      createQueue.push(createId)
      return await handle()
  }

  function btnStyle(hue:number):any {
    return {
      background: "black",
      borderColor: lib.color(1.25, 1.25, [hue, 0.5, 0.5]),
      color: lib.color(1.5, 1.15, [hue + (hue/2), 0.5, 0.5]),
      borderWidth: "5px"
    }
  }


  function createTrack(params?:any):Promise<void|AutoDjTrack> {
      if (typeof params == 'object' && Object.keys(params).length > 1) {
          return makeTrack(params)
      }
      return genTrack()
  }

  async function doLogout() {
    client = { 
      chat: { messages: [] },
      daw: client.daw,
      appUser: null,
      autoDj: null,
      action: {
        name: "",
        selection: null
      },
      error: null,
      playControls: client.playControls,
      genParams: client.genParams,
      ui: {
        useFrame: true
      }
    }
    loaded = false
    local.keys.forEach((key:string) => localStorage.removeItem(key))
    await new Promise((res, rej) => {
      window.location.assign(configuration.address.faceplate + "/#!/welcome")
      setTimeout(res, 10000000) // don't let this resolve on the current page state. make it reload
    })
  }

  /**
   * Calls the DAW playback controls on the loaded track.
   * 
   * @param track 
   * @param playControl 
   * @param state 
   */
  async function doPlayback(trackComplete:(n:number)=>void, playControl:PlayControl, state:controls.State):Promise<void> {
    const { volume, queue, loop, loopN }  = state
    let createCalled = false
    let interrupted = false 

    async function onFinishLoops() {
      playControl.playing = false
      m.redraw()
    }

    async function onInterrupt() {
      interrupted = true 
    }

    async function onTrackComplete(runsRemaining:number=0) {
      if (interrupted) return ;
      
      function getAndPlayNextTrack() {
        let track
        if (useGenParams) {
          track = createTrack(client.genParams)
        } else {
          track = createTrack()
        }
        track.then(function gotAutoDjTrack(track:void|AutoDjTrack) {
          if (!track) {
            console.log("Failed to get a track in auto-next mode")
            console.log(track)
            
          } else {
            select(tracks.length-1)
            playControl.play(track.ids.composition, trackComplete)
          }
        })
      }

      if (!runsRemaining) {
          if (state.queue == "auto-next" && !createCalled) {
            trackComplete(0)
            createCalled=true
            getAndPlayNextTrack()
          }
      }
    }

    if (client.playControls.state.loop == "single") {
      playControl.daw.play(onInterrupt, async (rs) => { onTrackComplete(0); })
    } else if (client.playControls.state.loop == "double") {
      playControl.daw.loop(2, onInterrupt, onTrackComplete, onFinishLoops)
    } else if (client.playControls.state.loop == "n") {
      playControl.daw.loop(client.playControls.state.loopN, onInterrupt, onTrackComplete, onFinishLoops)
    } else  {
      playControl.daw.loop(Infinity, onInterrupt, onTrackComplete, onFinishLoops)
    }
    m.redraw()
  }


  let currStep:AppStep = "nexus"
  let dimensions = getAppDimensions() as Dimensions
  let playControl:PlayControl = {
    daw:client.daw, 
    playing:false,
    curr:null,
    fetching:null,
    cache: {},
    updateCps(cps:number) {
      playControl.daw.updateCps(cps)
      return playControl
    },
    async get(compositionId) {
      if (playControl.cache[compositionId]) {
        return JSON.parse(playControl.cache[compositionId])
      } else {
        if (playControl.fetching) {
          // ignore duplicate calls to play when waiting on current 
          console.log("Bug why is it sending a duplicate play call")
        } else {
          playControl.fetching = friend.getCompositionMidi(token, compositionId)
            .then(function gotComposition(str:JSONParsesTo<AutoDjTrack>) {
              let composition:AutoDjTrack;
              playControl.fetching = null
              try {
                composition = JSON.parse(str)
              } catch (parseError) {
                console.log("error parsing result of getCompositionMidi")
                console.log(parseError)
                return null 
              }

              playControl.cache[compositionId] = str
              return composition
            })
        }
        return playControl.fetching
      }
    },

    async play(compositionId:number, onTrackComplete) {
        async function start(track:AutoDjTrack):Promise<PlayControl> {
          const { conf, composition } = track

          return playControl.stop()
          .then(function afterStop(playControl) {
            playControl.load(composition)
            playControl.updateCps(conf.cps)

            doPlayback(onTrackComplete, playControl, client.playControls.state)
            playControl.playing = true   
            return playControl      
          })
          .catch(function playStartError(err) {
            console.log("Error while attempting to play a fresh composition")
            console.log({track})
            console.log(err)
            return playControl      
          })
        } 

        return playControl.get(compositionId)
          .then(function gotTrack(track) {
            start(track)
            playControl.curr = track
            return playControl
          })
          .catch(function playReadError(err) {
            console.log("Error while playing a composition. compositionId: " + compositionId)
            console.log(err)
            playControl.curr = null
            return playControl
          })
    },
    async loop(compositionId, onRoundEnd, onLoopEnd, n=Infinity) {
      let conf:Conf, composition:Composition; 

      if (compositionId && playControl.curr && playControl.curr.ids.composition == compositionId) {
        conf = playControl.curr.conf
        composition = playControl.curr.composition
      } else {
        let track = await playControl.get(compositionId)
        conf = track.conf
        composition = track.composition
      }
      
      let remaining = n
      function handleLoop() {
        if (playControl.playing == false) return 

        if (remaining == 0) {
          onLoopEnd()
        }
        remaining -= 1
        onRoundEnd(remaining)

        playControl.play(compositionId, handleLoop)
      }

      playControl.play(compositionId, handleLoop)
      return playControl 
    },
    async stop() {
      client.daw.stop()
      client.daw.clear()
      playControl.playing = false
      return playControl
    },
    load(composition:Composition) {
        if (!check.is.composition(composition)) {
          console.log("Attempted to load composition, but cannot because this is not a composition")
          console.log(composition)
          throw new Error("DawLoadSong bad composition")
        }
        let dawIds:string[] = composition.parts.reduce(function addPart(acc:string[], [spec, melody], i):string[] {
          const { role, register, fill } = spec
          const key = `reg${register}-${role}-${fill}-${i}`

          const moteMelodys:Array<Mote[]> = melody.map(function midiToMotes(line:MidiLine):Mote[] {
                return line.map((midi:Midi):Mote => {
                    let freq = AppDaw.midiToFreq(midi[1])
                    let amp = midi[2] / 127
                    return [ midi[0], freq, amp ] as Mote
                })
            })

            let voiceIds:string[] = moteMelodys.map(function addDawPart(moteLine:Array<Mote>, i):string {
                let label = key
                if (isBeat(role)) {
                  playControl.daw.addSample(label, spec.src, moteLine)
                } else {
                  playControl.daw.addSynth(label, spec.type, moteLine)
                }

              return label
            })

            return [...acc, ...voiceIds]
        }, [])
        return playControl
    }
  }

  let loaded = false
  let token:string = ""
  let genParams = client.genParams

  return {
    async oninit() {
        token = auth.getToken() as string 
        try {
          let appUser = await auth.loadUser()
          if (typeof appUser == 'object' && typeof appUser.error == 'string') {
            currStep = "error"
            client.error = appUser.error
          } else {
            client.appUser = appUser
          }
        } catch(e) {
          console.log("Error while loading client: ", e)
          client.error = "Error while loading user details"
          currStep = "error"
        }
        loaded = true; 
        m.redraw()
    },
    view: function showApp() {
      let content:m.Vnode<any>|m.Vnode<any>[];
      if (loaded == false) {
        return m("section", m(".content", m(".box", m("p","Fetching your songs and stuff"))))
      }

      if (currStep == "account") {
          let testProps:AccountDetailsProps = {
            account: client.appUser,
            usage: {
                compositions: 31,
                performances: 18,
                // storage: "uncounted Mb"
            },
            subscription: null,
            credits: {
                used: 7,
                holding: 1,
                staked: 1
            }
          }

          let props:AccountDetailsProps = {
            ...testProps,
            account: {...client.appUser},
          }

          //@ts-ignore
          delete props.account.collection

        content = account.render(token, props)
      }

      if (currStep == "nexus") {
        function goto(step:AppStep) {
          currStep = step
          m.redraw()
        }
        content = m("div",
          m("div", m(MainMenu, {role: client.appUser.role, name: client.appUser.alias, doLogout, goto, oneoff, did}))
        )
      }
      

      if (currStep == "collection") {

        async function poll(interval=1000) {
          if (pollPending) {
            return
          }
          pollPending = true
          pollQueued = true

         new Promise<void>(async (resolve, reject) => {
            let pendings:Capture[] = client.appUser.collection.map((capture:Capture) => {
              return {...capture, performances: capture.performances.filter((performance:Performance) => performance.status == "pending")}
            })
            
            let ps:Array<Promise<Array<GetPerformanceResponse|null>>> = pendings.map(async function getPerformances(capture):Promise<Array<GetPerformanceResponse|null>> {

                let performancePs = capture.performances.map(async function (performanceDoc):Promise<GetPerformanceResponse|null> {
                  return await axios.get<GetPerformanceResponse>(`${configuration.address.friends}/performance/${performanceDoc.id}`, {
                    headers: {"Authorization": `Bearer ${token}`}
                  })
                  .then(function gotResponse(response) {
                      if (response.data.status != performanceDoc.status) {
                        return response.data
                      }
                      return null
                  })
                  .catch(function(e:any) { console.log("error getting performance", e); return null })

                })

                return await Promise.all(performancePs)
            })

            let updatedCapturePendings:Array<GetPerformanceResponse[]> = (await Promise.all(ps)).map((x:Array<GetPerformanceResponse>) => _.filter(x))
            updatedCapturePendings.forEach((pendingPerformances:Performance[]) => {
              return pendingPerformances.forEach((performance:Performance) => {
                let cap = client.appUser.collection.find((capture:Capture) => {
                  return capture.performances.some((perf => perf.id == performance.id))
                })
                if (cap) {
                  let index = cap.performances.findIndex((perf) => perf.id == performance.id)
                  
                  if (index == -1) {
                    console.log("Unexpected error, intended to find this performance in current appUser", performance)
                    console.log("appuser",client.appUser)
                    throw new Error("Performance out of bounds")
                  }
                  cap.performances[index] = performance as unknown as Performance
                }
              })
            })
            
            pollPending = false
            pollQueued = false
            if (currStep == "collection" && (false == pollQueued)) {
              pollQueued = true
              setTimeout(poll, interval)
            }
            m.redraw()
            resolve()
          })
          m.redraw()
        } // end poll()

        if (!pollQueued) { poll() }
        
        function createPerformance(captureId:number) {
          return axios.post(`${configuration.address.friends}/friend/composition/perform/${captureId}`, {}, {
            headers: {"Authorization": `Bearer ${token}`}
          })
          .then(async function gotResponse(response) {
              let { id }:any = response.data.created
              let doc:Performance = await axios.get(configuration.address.friends + "/performance/" + id, {
                headers: {"Authorization": `Bearer ${token}`}
              })
              .then(function gotResponse(response) { return response.data } ) 
              let cap = client.appUser.collection.find((capture:{captureId:number}) => {
                return capture.captureId == captureId
              })
              cap.performances.push(doc)
              m.redraw()
          })     
        }

        let props:collection.Props = {
            token, 
            collection: client.appUser.collection, 
            playControl, 
            createPerformance,
            async getCollection():Promise<null|Capture[]> {
              return fetch(apiUrls.getCollection, {
                headers: {
                  "Authorization": "Bearer " + token
                }
              })
              .then(async function gotResponse(resp) {
                if (resp.status >= 400) {
                  console.log("Error getting collection")
                  console.log(resp.status, resp.statusText)
                  return null
                }
                let body = await resp.json()
                return body 
              })
              .catch(async function handleErr(err) {
                console.log("Encountered an error while getting collection")
                console.log(err)
                return null
              })
              .finally(m.redraw)
            },
            async upCollection(collection:Capture[]) {
              client.appUser.collection = collection
              props.collection = client.appUser.collection
              m.redraw()
            }
          }
       
        content = m(collection.Module, props)
      }

      function upGenParams(p:MakeArcParams) {
        client.genParams = {...p}
        local.setPojo("user-gen-params", client.genParams)
        m.redraw()
      }

      
      let hasCapture = (selection != -1) && captures.find((compositionId:number) => {
        return compositionId == tracks[selection].ids.composition
      })


      let captureButton:m.Vnode|""
      if (hasCapture) {
          captureButton = m("button.button.is-rounded.is-size-3", {style: {...btnStyle(120), cursor:"default"}}, "Captured!")
      } else if (tracks.length > 0) {
          let compositionId = tracks[selection].ids.composition
          captureButton = m("button.button.is-size-3.is-rounded.is-outlined.m-0", {
              style: btnStyle(40),
              onclick:(e:Event) => {
                  axios.post(`${configuration.address.friends}/friend/capture/${compositionId}`, {
                  }, {
                      headers: {
                          "Authorization": `Bearer ${token}`,
                          "Content-Type": "application/json",
                      }
                  })
                  .then(function gotResponse(response) {
                      if (response.data == false) {
                          console.log("Did not capture the track as expected")
                      } else if (response.data?.compositionId == compositionId) {
                          captures.push(compositionId)
                      }
                      m.redraw()
                  })
              }
          },
          "Capture"
          )
      } else {
          captureButton = m(".", "")
      }

      if (currStep == "privateRadio") {
        let attrs:autoDj.AutoDjAttrs = {
            analyser:client.daw.analyser,
            gain: client.daw.knobs.gain.gain.value,
            createTrack,
            updateGain: (val:number) => { client.daw.knobs.gain.gain.value = val },
            isPlaying:playControl.playing,
            play: () => {
              if (selection == -1) return;
              let selected = tracks[selection]
              let id = selected.composition.id ?? selected.ids.composition
              return playControl.play(id, function playPrivateRadioSelection(remaining:number) {
                if(remaining==0) {
                  playControl.playing = false
                  m.redraw()
                }
              })
            },
            stop: playControl.stop,
            tracks, 
            captureButton, 
            select,
            selection,
            playControls:client.playControls,
            useGenParams,
            toggleGenParams:() => {useGenParams = !useGenParams; local.setBool("user-use-gen-params", useGenParams); return useGenParams},
            genParams,
            upGenParams,
        }
    
        content = m(autoDj.AutoDj, attrs)
      }

      if (currStep == "error" || !content) {
        content = m("section", 
          m("b", "This is kind of weird"),
          m("p.has-text-info", "Somewhat unexpected application state."),
          client.error && m("p.has-text-warning", client.error),
          m("button.button", {onclick:()=>{doLogout()}}, "Clear session & Reload")
        )


      }

      content = m(".content", 
        m(Header, {goto: currStep == 'nexus' ? null : () => {currStep = "nexus"; clear();}}),
        m(".mb-5", content),
        m(Footer)
      )

      let cps = null;
      let quality = null;

      if (client.autoDj?.curr) {
        cps = client.autoDj?.curr?.conf.cps/30
        quality = client.autoDj?.curr?.composition.quality
      }

      return m("div",
          m(ToastBox, {msg:apiHandlerMsg, status:statusMonitor}),
          m("main.px-5", {style: {minHeight:"100vh", backgroundColor: "hsl(0, 0, 10)"}},
            client.ui.useFrame 
              ? m(AppFrame.Frame, {content, dimensions, quality, cps})
              : content
          )
        )
    }
  }
}


type Dimensions = {
  frameWidth: number;
  frameHeight: number;
  appPadWidth: number;
  appPadHeight: number;
}
export default  { nexus } 