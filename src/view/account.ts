import m from 'mithril'
export type Message = {
    author: string
    message: string
    createdAt: string
}
const moduleHsl = [200, 0.5, 0.5]

function color(modSat = 1, modLight = 1) {
    const HSL = moduleHsl
    return `hsl(${HSL[0]}, ${100 * modSat * HSL[1]}%, ${100 * modLight * HSL[2]}%)`
}

function moduleTitle(title:string) {
    return m("heading", 
        m("label.is-size-3", {style: {fontWeight:"bold",textDecoration: "underline",color: color(2, 1)}}, title)
    )
}

export type AccountDetailsProps = {
    account: {
        firstName: string
        lastName: string
        alias: string 
        email: string
        createdAt: Date
    }
    usage?: {
        compositions: number
        performances: number
        // storage: string
    }
    subscription?: SubscriptionProps
    credits?: CreditsProps
}

type CreditsProps = {
    used: number 
    holding: number 
    staked: number
}
type SubscriptionProps ={
    name: string
    transactionId: string
    expiry: Date
}

const previewButtonAttrs = {
    onclick: (e:any) => {
        window.alert("Super cool! I'm glad you want to do that. Right now please just use as much as you want, so I can measure disk and network usage :)")
    },
    style: {
        maxWidth: "none",
        background: "white",
        color: "black",
        boxShadow: "0 4px 3px #333"
    }
}

function pair(k:string, v:string) {
    return m("p", m("b", k), m("p", v))
}
function pairFields(title: string, fields:null|{[name:string]:number|string|Date}):m.Vnode {
    let style = {
        backgroundColor: color(1, 1/10),
        boxShadow: "HSL(200, 80%, 30%) 0px 8px 12px",
        color: "#fff"
    }
    let content = fields == null 
      ? m("p", "Nothing to see here")
      : Object.keys(fields).map((k) => pair(k, fields[k].toString()))

    return m(".p-5.m-5", {style},
        moduleTitle(title),
        content
    )

}

function creditsPanel(credits?:CreditsProps) {
    let buttons = m(".columns", [
        m("button.button", previewButtonAttrs, "Buy 10 Credits"),
        ].map(vnode => m(".column", vnode))
    )

    let content

    let style = {
        backgroundColor: color(1, Math.pow(2, 4/5)),
        boxShadow: color(1, Math.pow(2, 1/5)) + " 0px 8px 12px",
        color: "#333"
    }

    if (credits) {
    content = m(".", 
    //@ts-ignore
        Object.keys(credits).map((k) => pair(k, credits[k].toString())),
        buttons
    )
    } else {
        content = m(".", 
            m("p", "No credit history here."),
            buttons
        )
    }
    
    return m(".p-5.m-5", {style},
        moduleTitle("Credits"),
        content
    )
}

function subscriptionPane(subscription?:SubscriptionProps) {
    let buttons = m(".columns", [
            m("button.button", previewButtonAttrs, "Buy Premium Subscription"),
        ].map(vnode => m(".column", vnode))
    )

    let content

    let style = {
        backgroundColor: color(1, Math.pow(2, 4/5)),
        boxShadow: color(1, Math.pow(2, 1/5)) + " 0px 8px 12px",
        color: "#333"
    }
    if (subscription) {
      content = m(".", 
      //@ts-ignore
        Object.keys(subscription).map((k) => pair(k, subscription[k].toString())),
        buttons
      )
    } else {
        content = m(".", 
            m("p", "No active subscription."),
            buttons
        )
    }
      
    return m(".p-5.m-5", {style},
        moduleTitle("Subscription"),
        content
    )
}

  
export function render(token:string, props:AccountDetailsProps) {
    const { account, usage, subscription, credits } = props 
    const sectionStyle = {
        backgroundColor: color(1, 1/24),
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        borderRadius: "8px",
        color: "#eee",
        display:"flex",
        flexWrap:"wrap",
    }

    let name = account.alias ?? ((account.firstName + account.lastName) ?? "")
    return m("section.m-0.has-text-light",
        m("header.header.py-5.has-text-centered", {style: {color:"#efe", background:"HSL(200, 80%, 50%)"}}, 
            (name == "") 
                ?  m("h1.my-3.title.has-text-light.is.size-1", "Your Account")
                : m(".", 
                    m("h2.my-2.subtitle.has-text-light.is.size-2", "Your Account"),
                    m("h1.my-3.title.has-text-white.is.size-1", name)
                )
        ),
    
        m(".is-flex", {style: sectionStyle},
        [
            pairFields("Myself", account),
            subscriptionPane(subscription),
            creditsPanel(credits),
            // pairFields("Usage", usage)
        ].map(vnode => m(".column", vnode))
        )
    )
}