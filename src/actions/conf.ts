import { address } from '../conf' 

export const ApiUrls:any = {
  baseUrl: address.friends,
  autoDj: `${address.friends}/auto-dj/`,
  genComposition: `${address.friends}/auto-dj/gen`,
  makeComposition: `${address.friends}/auto-dj/make`,
  getCompositions: `${address.friends}/collection/`,
  toggleFavoriteCapture: `${address.friends}/collection/favorite`,
  getCollection: `${address.friends}/collection`,
  getFriendUsage: `${address.friends}/friend/usage`,
  acknowledge: `${address.friends}/friend/acknowledge`,
  postChatMessage: `${address.friends}/chat/message`,
  getChatMessage: `${address.friends}/chat/message`,
  login: `${address.friends}/auth/login`,
  updateCapture: `${address.friends}/capture`
}

export const apiUrls = ApiUrls