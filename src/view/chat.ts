import m from 'mithril'
export type Message = {
    author: string
    message: string
    createdAt: string
}

import { address } from '../conf'
import AppChat from '../apps/spa-chat'

export const urls:any = {
    acknowledge: `${address.friends}/friend/acknowledge`,
    postChatMessage: `${address.friends}/chat/message`,
    getChatMessage: `${address.friends}/chat/message`,
}

export function load(token:string, page:number = 1, offset:number = 0): Promise<Array<Message>> {
    return m.request({
        method: 'GET',
        url: urls.getChatMessage,
        params: { page, offset },
        headers: {Authorization: `Bearer ${token}`}
    })
}


export function write(token:string, message:string): Promise<Message> {
    return m.request({
        method: 'POST',
        url: urls.postChatMessage,
        body: { message },
        headers: {Authorization: `Bearer ${token}`}
    })
}


type ChatProps = {
    messages:Message[]
}

type Acknolwedgement = (name:string) => true | (() => Promise<boolean>)
type ChatActions = {
    acknowledge:Acknolwedgement
    send:(message:string) => Promise<any & {id:number}>
    read:() => Promise<Array<Message>>
}

export function render(token:string, actions:ChatActions, props:ChatProps):m.Vnode<any> {
    let errorMessage:string|null
    let lastLoadTime:any = 0
    const refreshRate = 2

    function oneoff (oneoffName:string) {
        console.log("oneoff")
    }
    function did(oneoffName:string) {
        console.log("did")
        return true
    }

    async function w(msg:string) { 
        return write(token, msg)
    }

    function read() {
        const currentTime = Date.now();
        const elapsedTime = currentTime - lastLoadTime;

        if (elapsedTime >= (refreshRate* 1000)) {
            lastLoadTime = currentTime;
            load(token)
        }
    }

    return m(AppChat.Chat, {messages: props.messages, write, oneoff, did})
}