import m from 'mithril'
type UpText = (e:any) => void

function formFields(fields:Array<m.Vnode>):m.Vnode {
  return  m(".", {style: {
      width: "100%", 
      maxWidth: "720px", 
      margin: "0 auto", 
      display: "flex", 
      flexDirection: "column",
      minHeight: "360px"
    }},
    fields
  )
}

export function passwordReset(email:string, upEmail:(e:any)=>void, requestPassword:(e:any) => void, errorMessage?:string) {
  let msgBox:any = (!errorMessage)
    ? ""
    : m(".box.p-3", m("p.has-text-info", errorMessage))

  return m(".p-3", {style: {height: "100%", background: "white", borderRadius: "5px"}}, 
    formFields([
      m("label.label.has-text-dark.is-size-4", "Need a new password?"),
      m("p", "We can hook you up."),
      m("input.input", {type: "email", value: email, oninput: upEmail, placeholder: "email@address.com"}),
      m("button.has-background-success.is-large", {onclick: requestPassword}, "Send me a password Link"),
    ]),
    msgBox
  )
}

export function loginPanel(name:string, password:string, upName:UpText, upPassword:UpText, send:UpText, errorMessage?:string) {

  let msgBox:any = (!errorMessage)
    ? ""
    : m(".box.p-3", m("p.has-text-info", errorMessage))

  return m(".p-3", {style: {height: "100%", background: "white", borderRadius: "5px"}}, 
      formFields( [
        m(".", {style: {width: "100%"}}, 
          m("label.label.has-text-dark.is-size-4", "Alias or Email"),
          m("input.input.is-size-4", {type:"text", value:name, onchange:upName}), 
        ),
        m(".", {style: {width: "100%"}}, 
          m("label.label.has-text-dark.is-size-4", "Password"),
          m("input.input.is-size-4", {type:"password", value:password, onchange:upPassword}), 
        ),
        m(".has-text-centered.mt-5", {style: {width: "100%"}}, 
          m("button.button.is-primary.is-large", {onclick:send}, "Login")
        ),
        msgBox
      ])
    )
}

export function createPassword(email:string, alias:string, password:string, upPassword:UpText, send:(e:any) => void, errorMessage?:string) {

  let msgBox:any = (!errorMessage)
    ? ""
    : m(".box.p-3", m("p.has-text-info", errorMessage))
console.log("render error message", errorMessage, msgBox)
  return m(".p-3", {style: {height: "100%", background: "white", borderRadius: "5px"}}, 
      formFields( [
        m(".", {style: {width: "100%"}}, 
          m("label.label.has-text-dark.is-size-4", "Alias"),
          m("input.input.is-size-4", {type:"text", disabled:true, value:alias}), 
        ),
        m(".", {style: {width: "100%"}}, 
          m("label.label.has-text-dark.is-size-4", "Email"),
          m("input.input.is-size-4", {type:"text", disabled:true, value:email}), 
        ),
        m(".", {style: {width: "100%"}}, 
          m("label.label.has-text-dark.is-size-4", "Password"),
          m("input.input.is-size-4", {type:"password", value:password, onchange:upPassword}), 
        ),
        m(".has-text-centered.mt-5", {style: {width: "100%"}}, 
          m("button.button.is-primary.is-large", {onclick:send}, "Save New Password")
        ),
        msgBox
      ])
    )
}
type PendingUser = {
  firstName: string 
  lastName: string 
  email: string 
  alias: string
  password: string
}
export function createAccountPanel(pendingUser:PendingUser, attemptCreate:Function, err?:string) {
  let infoBox = typeof err == 'string' 
  ? m(".box.has-background.info",
      m("p", err ),
    )
  : m(".","") 

  return m(".p-3", {style: {height: "100%", background: "white", borderRadius: "5px"}}, 
      formFields( [
      m("div", 
          m("label.label", "First Name"),
          m("input.input", {type:"text", value: pendingUser.firstName})
      ),
      m("div", 
          m("label.label", "Last Name"),
          m("input.input", {type:"text", value: pendingUser.lastName})
      ),
      m("div", 
          m("label.label", "Alias"),
          m("input.input", {type:"text", value: pendingUser.alias})
      ),
      m("div", 
          m("label.label", "Password"),
          m("input.input", {type:"text", value: pendingUser.password})
      ),
      m("div", 
          m("label.label", "Email"),
          m("input.input", {type:"text", value: pendingUser.email})
      ),
      m("button.button", {onclick:()=>attemptCreate()}, "Create Account"),
      infoBox,
    ])
  )
}
