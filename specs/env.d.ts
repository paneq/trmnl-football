import { Bindings } from '../src/bindings'

declare module 'cloudflare:test' {
    interface ProvidedEnv extends Bindings{
    }
}
