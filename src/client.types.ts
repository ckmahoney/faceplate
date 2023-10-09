export type OscType
  = "sine" 
  | "square" 
  | "sawtooth" 
  | "triangle"

export type Register = 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 

export type Spec = {
  role: string  
  register: Register
  fill: string
  type?: OscType
  src?: string
}
