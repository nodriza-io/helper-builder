import { Server } from './src/server'
import { IServer } from './src/types'

export class Builder extends Server {
  
  constructor (config:IServer) {
    super(config) 
  }

}
 
