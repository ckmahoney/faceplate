import type { RequestError } from './types'
import type { Client } from './view/types'
import type {  LoginCreds } from './components/account/types'

import axios from 'axios'
import m from 'mithril'
import _ from 'lodash'
import View, { SAMPLES}  from './view'
import * as local from './apps/local'
import * as login from './apps/login'
import * as controls from './apps/radio/controls'
import * as AppDaw from './apps/daw'
import type { Daw } from './apps/daw/types'
import * as check  from './checks'
import * as configuration  from './conf'
import * as auth from './auth'
import * as header  from './view/header'

const sessionTimestamp = "sessionStamp"
const sessionStateKey = "sessionState"

function handleSession(refreshHours:number=6) {
    const milliseconds = 1000 * 60 * 60 * refreshHours

    let now = new Date()

    function resetSession() {
      localStorage.setItem(sessionTimestamp, now.toString())
      localStorage.setItem(sessionStateKey, JSON.stringify({}))
    }

    let sessionLastRefreshed = localStorage.getItem(sessionTimestamp)

    if (!sessionLastRefreshed) {
      resetSession()
    } else {
      let then = new Date(sessionLastRefreshed)
      then.setHours(then.getHours() + refreshHours)
      if (then < now) {
        resetSession()
      }
    }
}


function getSession() {
    let val = localStorage.getItem(sessionStateKey)
    return val 
      ? JSON.parse(val)
      : {}
}

function did(name:string):boolean {
  let session = getSession()
  return session[name] == true
}

function oneoff(name:string):void {
  let session:any = getSession()
  session[name]=true
  localStorage.setItem(sessionStateKey, JSON.stringify(session))
}

function invitation():m.Component<{inviteName:string}> {
  let inviteStatus:any; 
  let asyncMsg:any
  let user:{alias:string, email:string} = {alias:"",email:""}
  let local:{alias:string, email:string} = {...user}
  let sendResults = ""

  let updateTimeout:any;

  function update(field:string) { 
    return function (e:any) {
      //@ts-ignore
      local[field]=e.target.value
      clearTimeout(updateTimeout)
      updateTimeout = setTimeout(() => {
      //@ts-ignore
        user[field] = local[field]
      }, 100)
    }
  }

  async function submit(data:any, inviteName:string) {
    sendResults = "Sending. . . "
    m.redraw()

    axios.post(configuration.address.friends + "/friend/invitation/" + inviteName, data, {
      headers: {"Accept": "application/json", "Content-Type":"application/json"}
    })
    .then(function gotResponse(response) {
      sendResults = response.data.message
    })
    .catch(function errResponse({response}) {
      if (!response.data?.error) {
        console.log("Unexpected response from server")
        return
      }
      sendResults = response.data.error
    }).finally(m.redraw)

  }

  function available(inviteName:string) {
    return m("div",
      m(".mb-5.has-text-centered", 
        m("h1.title.is-italic", "C'mon in, the music is fine!"),
        m("p.is-size-3", "Welcome to Ten Pens"),
        m("p.is-size-4", "Where the music flows like fountains"),
      ), 
      m(".container", 
        m("p.my-5.is-size-4", "Add your email and your stagename to create an account."),
        m(".mb-3", 
          m("label.label.is-size-4", "Email"),
          m("input.input.is-size-4", {type:"text", name:"email", value: local.email, oninput: update("email")})
        ), 
        m(".mb-3", 
          m("label.label.is-size-4", "Stagename"),
          m("input.input.is-size-4", {type:"text", name:"alias", value: local.alias, oninput: update("alias")} )
        ),
        m("div", 
          m("input.input.is-size-4.p-0.has-background-success", {type:"submit", onclick:(e:any)=>submit(user, inviteName) ,value:"Send Activation Email"}),
          m("p.is-size-3.is-size-4", sendResults)
        )
      )
    )
  }

  function closed() {
    return m("div",
      m("h1.title", "We're all full at the moment"),
      m("p", "It's cool you found this link, but we can't take any more from it right now.")
    )
  }

  function view(inviteStatus:any) {
    let inner; 
    if (!inviteStatus) {
      inner = null
    }
    else if (inviteStatus.available) {
      inner = available(inviteStatus.name)
    } else {
      inner = closed()
    }

    return inner
  }

  return {
    async oninit({attrs}) {
      console.log("init instance")
      asyncMsg = "Howdy, checking on that invitation for you"
      m.redraw()

      let val = await axios.get(configuration.address.friends + "/invitation/" + attrs.inviteName)
      .then(function gotResponse(response) {
        inviteStatus = response.data 
        asyncMsg = ""
      })
      .catch(function gotError({response}) {
        if (response.status < 500) {
          asyncMsg = "That doesn't look like an invitation to us."
        } else {
          asyncMsg = "Looks like the server up there has gone down or something."
        }
      })
      .finally(m.redraw)
    },
    view({attrs}) {
      return m("main.p-5.m-5",
        m(".box",
          m("p", asyncMsg),
          view(inviteStatus)
        )
      )
    }
  }
}


  function welcome():m.Component<any> {
    let creds:LoginCreds = {
      email:"",
      name:"",
      password: ""
    }

    let loginError:string|null;
    let resetError:string|null;
    let loggingIn = true 
    function up(k:"name"|"password"|"email") {
      return (e:any) => creds[k] = e.target.value
    }

    let main:any;
    type PendingUser = {
      firstName: string 
      lastName: string 
      email: string 
      alias: string
      password: string
    }

    async function doLogin(e:any) {
      try { 
        let res = await handleLogin(creds)
        if (check.is.error(res)) {
          //@ts-ignore
          loginError = res.error
          m.redraw()
        } else {
          window.location.replace(configuration.address.faceplate + "/#!/")
          render(window.location.href)
        }
      } catch (err:any) {
          loginError = err.error;
          m.redraw()
      }

      return true
    }

    async function requestPassword(e:any) {
      try {
        fetch(configuration.address.friends + "/account/password-reset/", {
        method:"POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({email:creds.email}) 
      })
      .catch(function requestError(err:any) {
        console.log("Error while sending fetch request")
        console.log(err)
        return {error: "Error while sending fetch request"}
      })
      .then(async function okResponse(response:any) {
        if (response.status < 200 || response.status > 500) {
          return {error: "Network response was not OK"}
        }
        return await response.json()
      })
      .catch(function parseError(err:any) {
        console.log("error while awaiting json")
        console.log(err)
        return { error: "Client error while reading response"}
      })
      .then(async function emailSent(payload:any) {
        if (typeof payload == 'object') {
          if (payload.error) {
          resetError = payload.error
          } else {
            resetError = payload.message
          }
        } else {
          throw new Error("Failed to get OK response")
        }
      })
      .finally(m.redraw)
      } catch(err:any) {
        console.log("Uncaught error during password")
      }
    }

    return {
      async oninit() {
        // await doLogin(null)
        // m.redraw()
      },
      view() {
        let btn = loggingIn
          ? m("button.has-text-underlined.m-3", {onclick: ($:any) => { loggingIn = false; loginError = "" } }, "I forgot my password")
          : m("button.has-text-underlined.m-3", {onclick: ($:any) => { loggingIn = true; resetError = "" } }, "I have my password")

        if (loggingIn) {
          main = login.loginPanel(creds.name, creds.password, up("name"), up("password"), doLogin, loginError)
        } else {
          main = login.passwordReset(creds.email, up("email"), requestPassword, resetError)
        }

        return m("section",
          m(header.header()),
          main, 
            m(".is-flex.is-justify-content-space-around", 
            btn
          )
        )
      }
    }
}

/** 
 * View for a password reset email link. Email must provide a URL including these parameters:
 * 
 * email
 * alias
 * userId
 * passwordResetToken
 * 
 * */
function passwordReset() {
  let ps:any, up:any, password:any, send:any, errorMessage:any;
  
  return {
    oninit() {
      console.log("init pass reset")
      let url = window.location.toString()
      ps  = {email: null, alias:null, userId:null, passwordResetToken:null }
      let queryIndex = url.indexOf("?")
      if (queryIndex < 0) {
        m.route.set("/welcome")
        m.redraw()
        return
      }
    
      let qps =  url.slice(queryIndex)
      let params = new URLSearchParams(qps)
      
      // verify required env variables are avaiable
      Object.keys(ps).reduce((go:boolean, field:string) => {
        if (!go) { return false } 
        let val = params.get(field)
        if (!val) {
          console.log("Failed to find required query parameter " + field)
          // throw new Error("Parameter required but not found: " + field)
          m.route.set("/welcome")
          m.redraw()
          return false 
        }
        if (field == "passwordResetToken") {
          // jwt may contain slashes, so keep it URI encoded and pass it in the path param
          ps[field] = val
        } else {
          ps[field] = decodeURIComponent(val)
        }
        return true 
      }, true )
    
      let password:string = ""
      
      up = (e:any) => {
        password = e.target.value
      }
    
      send = async () => {
        return fetch(configuration.address.friends + "/friend/password-reset/" + ps.passwordResetToken, {
          method:"POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({userId: ps.userId, password}) 
        })
        .catch(function requestError(err:any) {
          console.log("Error while sending fetch request")
          console.log(err)
          return {error: "Error while sending fetch request"}
        })
        .then(async function okResponse(response:any) {
          if (response.status < 200 || response.status > 500) {
            return {error: "Network response was not OK"}
          }
          return await response.json()
        })
        .catch(function parseError(err:any) {
          console.log("error while awaiting json")
          console.log(err)
          return { error: "JSON parse error"}
        })
        .then(async function passwordCreated(payload:any) {
          if (check.is.error(payload)) {
            errorMessage = payload.error
          } else {
            console.log("Created password")
            m.route.set("/welcome")
          }
        })
        .finally(m.redraw)
      }
    },
    view() {
      return m("section",
          m(header.header()),
          m("h2.is-size-3.has-text-centered", {style:{width:"100%"}}, "Password Reset"),
          login.createPassword(ps.email, ps.alias, password, up, send, errorMessage), 
           
          )

    }
  }
}


async function handleLogin(creds:LoginCreds):Promise<true|{error:string}> {
  return auth.login(creds.name, creds.password)
    .then(function loginResult(isLoggedIn) {
      if (isLoggedIn) {
        return true
      } else {
        console.log("err else")
        return {error: "Couldn't log in with those words"}
      }
    })
    .catch(function loginError(err:RequestError) {
      console.log("error handle login should propogate this message")
      console.log(err)
      return err 
  })
}

async function doTestUserLogin() {
  let creds:any|LoginCreds = {}
  creds.email = ""
  creds.alias = "testUser"
  creds.password = "super-secret-pw"
  return handleLogin(creds)
}


function onDawStateChange(changeData:AppDaw.ChangeData):void {
  console.log("Daw is changing")
}


function app():m.Component<any> {
  let daw:Daw = AppDaw.createDaw(onDawStateChange, SAMPLES) 

  const client:Client = {
    chat: { messages: [] },
    daw,
    tokens: {access: "", refresh: ""},
    appUser: null,
    autoDj: {curr:null, next:null, tracks:[]},
    action: {
      name: "",
      selection: null,
    },
    error: null,
    genParams:  local.getPojo("user-gen-params", {
      quality: "Eb major",
      dimensions: {
        size: 2,
        cpc: 4,
        base: 2
      }, 
      complexity: "simple",
      nEnharmonic: 3,
      nMelodic: 3
    }),
    playControls: {
      state: {
        volume: daw.knobs.gain.gain.value,
        queue: "auto-next",
        loop: "n",
        loopN: 3
      },
      actions: {
        updateVolume: (vol:number) => new Promise((res, rej) => {
            daw.knobs.gain.gain.value = vol
            res(true)
        }),
        updateQueue: (q:controls.State["queue"]) => new Promise((res, rej) => {
            client.playControls.state.queue = q
            res(true)
        }),
        updateLoop: (l:controls.State["loop"]) => new Promise((res, rej) => {
            client.playControls.state.loop = l
            res(true)
        }),
        updateLoopN: (n:number) => new Promise((res, rej) => {
            client.playControls.state.loopN = n
            res(true)
        })
      }
    },
    ui: {
      useFrame: local.getBool("ui-use-frame", true)
    }
  }
  handleSession();

 return View.nexus(client, oneoff, did)
}

function unfound() {
  return {
    view() {
      return m(".content", 
      m("header", m("h1.title", "Unfound"),
      m(".content", m("p", "This isn't a thing we have an explanation for"))))
    }
  }
}

function tokenRedirect():m.Component<any> {
  return {
    oninit() {
      let search = "?" + window.location.href.split("?")[1]
      const urlParams = new URLSearchParams(search);
      let token:string = urlParams.get('token');
      if (token) {
        local.setString("accessToken", token)
        window.location.href = configuration.address.faceplate
      }
    },
    view({attrs}){ 
      return m(".is-flex", m(".box.my-5", "That token may have been used already. Try going to this link! ", m("a", {href: configuration.address.faceplate}, configuration.address.faceplate)))
    }
  }
}

export function isWelcome(url:string):boolean {
  let match = "/welcome"
  let route = url.split("#!")[1]
  return route && route.slice(0, match.length) == match
}

export function isInvite(url:string):boolean {
  let match = "/invite"
  let route = url.split("#!")[1]
  return route && route.slice(0, match.length) == match
}

export function isUseToken(url:string):boolean {
  let match = "/useToken"
  let route = url.split("#!")[1]
  return route && route.slice(0, match.length) == match
}

export function isPage(page:string, url:string): boolean {
  let match = "/" + page
  let route = url.split("#!")[1]
  return route && route.slice(0, match.length) == match
}

export function InviteFromHref(url:string):m.Component<any> {
  let int = invitation()
  let inviteName = url.split("/invite/")[1] || ""
  return {view() { return m(int, {inviteName})}}
}

async function render(url:string) {
  let resizeListener:any;
  window.addEventListener('resize', function() {
    let delay = 100;
    clearTimeout(resizeListener);
    resizeListener = setTimeout(m.redraw, delay);
  })
  const root = document.querySelector("#root") as Element
  m.mount(root,null)

  let loggedIn = await auth.isLoggedIn()

  if (isPage("password-reset", url)) {
    return m.mount(root, passwordReset())
  }

  if (auth.isPublicPage(url)) {
    if (isWelcome(url)) {
      return m.mount(root, welcome())
    }
    if (isInvite(url)) {
      return m.mount(root, InviteFromHref(url))
    }
  }

  if (isUseToken(url)) {
    return m.mount(root, tokenRedirect())
  }

  if (!loggedIn) {
    return m.mount(root, welcome())
  }

  
  const routes:any = {
    "/finderr": unfound(), 
    "/": app()
  }
  m.route.prefix = '#!'
  m.route(root, "/", routes)
}

addEventListener("hashchange", (event) => {
  if (event.oldURL != event.newURL) {
    console.log("diffing", event.newURL)
    window.location.replace(event.newURL)
    render(event.newURL)
  }
});

render(window.location.href)