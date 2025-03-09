import { ApiConfig } from "./api"

export interface Config {
    api: ApiConfig,
    ui: {
        fontSize: string
    }
}

export const VERSION = '2.1.1'
export const VERSION_CODE = 3