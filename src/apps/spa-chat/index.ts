import type { Message } from './types'
import m from 'mithril'
import _ from 'lodash'

import moment from 'moment';

function formatDate(createdAt:string) {
  let date:Date = new Date(createdAt)
  const now = moment();
  const target = moment(date);

  if (now.isSame(target, 'day')) {
    return target.format("[Today at] h:mm a");
  } else if (now.subtract(1, 'days').isSame(target, 'day')) {
    return target.format("[Yesterday at] h:mm a");
  } else {
    return target.format("ddd, MMM Do [at] h:mm a");
  }
}


const chatStyles1:any = {
  chatBox: {
    backgroundColor: '#f2f2f2',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '10px',
    maxWidth: "720px",
    margin: "0 auto"
  },
  chatLog: {
    margin: '0',
    padding: '0',
    listStyle: 'none',
  },
  message: {
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '12px',
    marginBottom: '10px',
  },
  author: {
    fontSize: '22px',
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  text: {
    fontSize: "22px",
    marginBottom: '5px',
  },
  timestamp: {
    fontSize: '18px',
    color: '#999',
  },
  chatDraft: {
    marginTop: '10px',
  },
  input: {
    padding: '5px',
    marginRight: '5px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  submitButton: {
    padding: '5px 10px',
    borderRadius: '4px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
  },
};

const chatStyles2:any = {
  chatBox: {
    backgroundColor: '#f2f2f2',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '10px',
    overflowY: 'scroll',
    maxHeight: '100%',
  },
  chatLog: {
    margin: '0',
    padding: '0',
    listStyle: 'none',
  },
  message: {
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '10px',
    marginBottom: '10px',
    position: 'relative',
  },
  author: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  text: {
    fontSize: '20px',
    marginBottom: '5px',
  },
  timestamp: {
    fontSize: '12px',
    color: '#999',
  },
  messageMobile: {
    padding: '15px',
  },
  timestampMobile: {
    display: 'block',
    marginTop: '5px',
  },
};

function convertToPlainText(html:string) {
  // Create a new div element
  const tempDiv = document.createElement('div');
  // Set the HTML content of the div
  tempDiv.innerHTML = html;
  // Extract the text content from the div
  const plainText = tempDiv.textContent || tempDiv.innerText || '';
  // Remove leading/trailing whitespace and trim the result
  return plainText.trim();
}

function howChatWorks() {
  return m(".box.content",
    m("b.is-size-3.mb-3", "hello! this is good news"),
    m("br.mb-3"),
    m("p.is-size-4", "You are here, and this is an invite-only space."),
    m("b.is-size-3.has-background-danger", "This is an unmoderated, unflitered chat"),
    m("br.mb-3"),
    m("p.is-size-4", "because moderation and filtering is a lot of time/coding/bots"),
    m("b.is-size-3.has-background-success", "So please share your thoughts, opinions, excitement, or angers while using Ten Pen."),
    m("br.mb-3"),
    m("p.is-size-4", "This chatlog is visible to everybody. So let's talk music!") 
  )
}

function handleChatInfo(accept:Function) {
  return m("div.has-text-centered", 
    howChatWorks(),
    m("button.button.is-rounded.is-success", {onclick:accept}, "Got it")
  )
}
type ChatAct = {
  messages: Message[], 
  write:Function, 
  oneoff:(oneoffName:string) => void, 
  did:(oneoffName:string) => boolean
}

function Chat():m.Component<ChatAct> {
  const announcementKey = "showChatInfo"
  let placeholder = "write me!"
  let draft:string = placeholder

  function oninput(e:Event) {
    //@ts-ignore
    draft =  e.target.innerHTML;
  }

  const isMobile = window.innerWidth <= 768;
  const chatStyles = isMobile ? chatStyles2 : chatStyles1;

  return {
    oninit(attrs) {

    },
    view: ({attrs}) => {
        const { messages } = attrs
        function onsubmit(e:Event) {
          e.preventDefault();

          let value = convertToPlainText(draft)
          attrs.write(value).then(() => {draft = ""})
        }
        const draftingArea = m('div#chat-draft', [
          m('form', {onsubmit}, [
              m('div.expandable-textarea.box', {oninput, role: "textbox", contenteditable: true, type: "submit"}, m.trust(draft)),
              m('input', {type: "submit", value: "Send"}),
            ]
          )
        ])
        const messageArea = m('ul', { style: chatStyles.chatLog }, [
          messages.map((message) =>
            m('li', { style: chatStyles.message }, [
              m('div', { style: {...chatStyles.author, ...{display: "flex", justifyContent: "space-between", alignItems: "center"}}}, 
                m("div", message.author),
                m('div.has-text-right', { style: chatStyles.timestamp }, formatDate(message.createdAt))
              ),
              m('div', { style: chatStyles.text }, message.message),
            ])
          )
        ])

        let children;
        if (attrs.did(announcementKey)) {
            children = [ 
              draftingArea,
              messageArea
            ]
        } else {
            children = handleChatInfo(() => attrs.oneoff(announcementKey))
        }

            return m('div#chat-box',
                m('div', { style: chatStyles.chatBox }, children)
            )
        }
    }
}

export default {
  Chat
}