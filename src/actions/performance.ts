import type { PerformanceActions } from './types'

/** Given composition and performance IDs available actions on those IDs. */
const all:PerformanceActions = {
  remix: (cId, pId) => {
    return new Promise((resolve, reject) => {
    console.log("remixing composition and performance", cId, pId)
    })
  },
  repaint: (cId, pId) => {
    return new Promise((resolve, reject) => {
    console.log("repainting composition and performance", cId, pId)
    })
  },
  reroll: (cId, pId) => {
    return new Promise((resolve, reject) => {
    console.log("reroll composition and performance", cId, pId)
    })
  },
  speedUp: (cId, pId) => {
    return new Promise((resolve, reject) => {
    console.log("speedup composition and performance", cId, pId)
    })
  },
  slowDown: (cId, pId) => {
    return new Promise((resolve, reject) => {
    console.log("slowdown composition and performance", cId, pId)
    })
  }
}

export default all