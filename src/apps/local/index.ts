type StorageKey 
  = "toggle-description-debut-bee"
  | "accessToken"
  | "ui-use-frame"
  | "use-sharps"
  | "user-use-gen-params"
  | "user-gen-params"

export const keys:StorageKey[] = [
    "accessToken",
    "toggle-description-debut-bee",
    "ui-use-frame",
    "use-sharps",
    "user-use-gen-params",
    "user-gen-params",
]

export function getJson(name:StorageKey, default_?:any):any {
    let val:any = localStorage.getItem(name)
    try {
        return JSON.parse(val)
    } catch (e) {
        return default_
    }
}

export function getPojo<T>(name:StorageKey, default_?:T):T {
    let val:any = localStorage.getItem(name)
    if (val == null) return default_;
    try {
        return JSON.parse(val)
    } catch (e) {
        return default_
    }
}

export function getBool(name:StorageKey, default_?:boolean):any {
    let val:any = localStorage.getItem(name)
    if (val == null) { return default_ }
    
    try {
        val = JSON.parse(val)
        return val
    } catch (e) {
        if (default_ == null) {
            throw e
        }
        return default_
    }
}

export function setPojo(name:StorageKey, val:any):void {
    localStorage.setItem(name, JSON.stringify(val))
}


export function setBool(name:StorageKey, val:boolean):void {
    localStorage.setItem(name, JSON.stringify(val))
}

export function setString(name:StorageKey, val:string):void {
    localStorage.setItem(name, val)
}