import type { Message } from './types'

import m from 'mithril'
import { ApiUrls } from '../../actions/conf'


function loadMoreMessages(token:string, page:number = 1, offset:number = 0): Promise<Array<Message>> {
    return m.request({
      method: 'GET',
      url: ApiUrls.chat + `messages`,
      params: { page, offset },
      headers: {Authorization: `Bearer ${token}`}
    })
  }

  function load(token:string, page:number = 1, offset:number = 0): Promise<Array<Message>> {
    return m.request({
      method: 'GET',
      url: ApiUrls.chat + "messages",
      headers: {Authorization: `Bearer ${token}`}
    })
  }  

function write(token:string, message:string): Promise<any> {
  return m.request({
    method: 'POST',
    url: ApiUrls.chat + "message",
    body: { message },
    headers: {Authorization: `Bearer ${token}`}
  })
}


export default {
    load,
    write
}