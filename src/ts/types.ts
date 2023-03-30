//
//  types.ts
//
//  Generated by Poll Castillo on 26/02/2023.
//
export type Endpoint = Promise<any>
export type TokenGenerator = Promise<void>
export type InterfaceElement = HTMLElement | any
export type InterfaceElementCollection = HTMLCollectionOf<Element> | any
export type Data = [] | {} | any

export type HttpStatus = {
    code: number
    phrase: string
}

export type Response = {
    status: HttpStatus
    body?: any
    headers?: Record<string, string>
}

export type Request = {
    url: string
    method: string
}

export type ErrorHandler = (error: any) => Response | Promise<Response>

export type Logger = (request: Request, response: Response) => void