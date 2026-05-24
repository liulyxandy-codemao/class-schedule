import { ApiConfig } from "./api"

export interface Config {
    api: ApiConfig,
    ui: {
        fontSize: string,
        zoomLevel: number,
        disableBackgroundTransparency: boolean
    }
}

export const VERSION = '2.3.0'
export const VERSION_CODE = 6