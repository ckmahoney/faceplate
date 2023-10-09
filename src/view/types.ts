import type { Conf, Composition, StubComposition, Capture } from '../types'
import type { Daw } from '../apps/daw/types'
import type { LoginCreds, AppUser } from '../components/account/types'

import type { AutoDj } from '../apps/auto-dj/types'
import * as controls from '../apps/radio/controls'
import type { Message } from '../apps/spa-chat/types'
import type { MakeArcParams  } from '../actions/types'
import m from 'mithril' 

export type Msg = null|string|m.Vnode<any>
export type Client = {
  chat: { messages: Message[]}
  daw: Daw
  tokens?: {
    access: string
    refresh: string
  }
  appUser: null | AppUser
  autoDj: AutoDj
  action: {
    name: string
    selection: any
  },
  playControls: controls.Props
  error: null | string
  genParams: MakeArcParams
  ui: {
    useFrame: boolean
  }
}

export type HigherOrderFx = void

