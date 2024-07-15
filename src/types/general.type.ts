export interface ApiResponse {
  code: number
  message: string
  result: any
}

export interface SocketMessage {
  from: number
  roomRef: string
  payload: {
    message: string
    encoded: boolean
  }
}
