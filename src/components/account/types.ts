import type {  Capture } from '../../types'
export type AppUser = {
  firstName: string
  lastName: string
  alias: string
  email: string
  apiToken: string
  role: string
  createdAt: Date
  collection: Array<Capture>
}

export type LoginCreds = {
  email?:string
  name: string
  password: string
}