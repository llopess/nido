import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia

export * from './auth'
export * from './fund'
export * from './transaction'
export * from '../types/funds'
