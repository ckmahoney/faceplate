import { xdescribe, describe, expect, it } from '@jest/globals'
import fs from 'fs'
import path from 'path'
import * as check from '../src/checks'

export const baseUrl = 'http://localhost:3000'

export const ApiUrls = {
  autoDj: `${baseUrl}/auto-dj/`,
  genComposition: `${baseUrl}/auto-dj/gen`,
  makeComposition: `${baseUrl}/auto-dj/make`,
  getCompositions: `${baseUrl}/collection/`,
  friend: `${baseUrl}/friend/`,
  chat: `${baseUrl}/chat/`,
  login: `${baseUrl}/login`,
  logout: `${baseUrl}/logout`,
  getSelf: `${baseUrl}/user`,
}
import _ from "lodash"
function runSome(test, n = 20) {
  _.range(n).forEach(i => test(i))
}
 function runFew(test, num = 5) {
  _.range(num).forEach(i => test(i))
}
describe("API responses are supported", () => {
  const N_RUNS = 1
  const RUNTIME_SECONDS = 30
  runSome(() => {
    it("Gets a composition from the gen midi endpoint", async () => {
        return fetch(ApiUrls.genComposition, {
              method: 'POST',
              headers: {
                  "Authorization": `Bearer: tttestt`,
                  "Content-Type": "application/json"
              },
            })
            .then(function parseBody(resp) { return resp.json() })
            .then(function verify(response) {
              if (!response) {
                console.log(response)
                throw new Error("Big problem on repsonse")
              }
              if (!check.is.conf(response.conf)) {
                console.log("Expected to get a conf, but got this instead")
                console.log(JSON.stringify(response))
                throw new Error("BadResponseValue")
              }
              expect(check.is.conf(response.conf)).toBe(true)

              if (!check.is.composition(response.composition)) {
                console.log("Expected to get a composition, but got this instead")
                console.log(JSON.stringify(response))
                throw new Error("BadResponseValue")
              }
              expect(check.is.composition(response.composition)).toBe(true)
try {
              fs.writeFileSync(path.resolve("./test-compositions/all/" + Math.random().toString())+".json", JSON.stringify(response))
            } catch (e) {
              console.log("error saving content")
              console.log(e)
            }
              return response
          })
    }, RUNTIME_SECONDS * 1000)
  }, N_RUNS)

  runSome(() => {

    it("Gets a composition from the make midi endpoint", async () => {
      return fetch(ApiUrls.makeComposition, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer: tttestt`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
              quality: "A minor",
              dimensions: {size: 4, cpc: 4, base: 3},
              complexity: "standard",
              nEnharmonic: 3,
              nMelodic: 3
            })
          })
          .then(function parseBody(resp) { return resp.json() })
          .then(function verify(response) {
            if (!response) {
              console.log(response)
              throw new Error("Big problem on repsonse")
            }
            if (!check.is.conf(response.conf)) {
              console.log("Expected to get a composition, but got this instead")
              console.log(JSON.stringify(response))
              throw new Error("BadResponseValue")
            }
            expect(check.is.conf(response.conf)).toBe(true)
            if (!check.is.composition(response.composition)) {
              console.log("Expected to get a composition, but got this instead")
              console.log(JSON.stringify(response))
              throw new Error("BadResponseValue")
            }
            expect(check.is.composition(response.composition)).toBe(true)
            return response
        })
      }, RUNTIME_SECONDS * 1000)
  }, N_RUNS)
})  