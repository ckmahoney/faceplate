import { address } from './conf' 
import m from 'mithril'

const urls:any = {
    login: `${address.friends}/auth/login`,
    getSelf: `${address.friends}/auth/self`,
    getFriend: `${address.friends}/friend/self`, 
}
  
function replaceToken(next:string|null):boolean {
    if (typeof next !== 'string' && next !== null) {
        throw new Error("Unable to replace the token with this value: " + JSON.stringify(null))
    }
    localStorage.setItem("accessToken", next)
    return true
}

export function getToken() {
    let val = localStorage.getItem("accessToken")
    if (!val) {
      return false
    }
    return val
  }
  
export async function isLoggedIn():Promise<boolean> {
    let token = getToken()
    if (!token) {
      return false
    }
    return fetch(urls.getSelf, {
      method:"POST",
      headers: {
          "Accept": "application/json",
          "Authorization":"Bearer " + token
      } 
    })
    .then(async function selfResponse(response) {
      let id =  await response.json()
      if (false === id) {
        return false
      } 
      let val = parseInt(id)
      if (isNaN(val)) {
        throw new Error("Unexpected user id response from self check")
      }
      return true
    })
}

export async function login(name:string, password:string):Promise<boolean> {
    return fetch(urls.login, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          "Content-Type": "application/json"
        },
        body: JSON.stringify({name, password})
    })
    .then(async function selfResponse(response) {
      let token = await response.json()
      if (typeof token == 'string') {
        replaceToken(token)
        return true
      }
      else return false
    })
    .catch((e:any) => false)
}

export function isPublicPage(url:string):boolean {
  let route = url.split("#!")[1]
    if (!route || route.length < 2) { return false }

    let publics = [
      "/",
      "/welcome",
      "/invite"
    ]
    let val = publics.find(path => route.slice(0, path.length) == path)
    return !!val
}

export async function verifyOrRedirect():Promise<boolean> {
  if (isPublicPage(window.location.toString())) return true; 

  try {
      let loggedIn = await isLoggedIn()
      if (loggedIn) return true;
  } catch (e) {
    console.log("Unexpeced login check error")
    console.log(e)
    return false
  }
  m.route.set("/welcome", {returnTo: m.route.get()})
  m.redraw()
  return false
}

export async function loadUser():Promise<any> {
    return fetch(urls.getFriend, {
      headers: {
        'Authorization': 'Bearer ' + getToken()
      }
    })
    .then(async function gotResponse(response) {
      if (response.status < 200 || response.status > 500) {
        throw new Error("Bad response from get self call")
      }
      return await response.json()
    })
}