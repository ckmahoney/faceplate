import type { LoginResponse, LogoutResponse, GetSelfResponse } from './types'
import type { Client } from '../view/types'
import type { AppUser } from '../components/account/types'
import { testAppUser } from '../components/account/testData'

import m from 'mithril'

import { ApiUrls } from './conf'


/** Opening and closing a user session. */

function attemptLogin(alias:string, password:string): Promise<LoginResponse> {
  return  m.request({
       url: ApiUrls.login,
       method: 'POST',
       body: {alias,password}
     })
}

function attemptCreate(token:string, pendingUser:any): Promise<AppUser> {
  return  m.request({
       url: ApiUrls.getSelf,
       method: 'POST',
       body: pendingUser
     })
}


function logout(alias:string): Promise<LogoutResponse> {
  return m.request({
         url: ApiUrls.logout,
         method: 'POST',
         body: {alias}

     })
}

function getSelf(accessToken:string, refreshToken: string): Promise<GetSelfResponse> {
  return m.request({
          url: ApiUrls.getSelf,
          method: 'GET',
          headers: {Authorization: `Bearer ${accessToken}`}
      })
}


export default {
  logout,
  attemptLogin,
  attemptCreate,
  getSelf
}