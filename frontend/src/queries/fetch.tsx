
import axios, { AxiosResponse } from 'axios'

const development = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'

const devURL = process.env.REACT_APP_BACKEND_URL_DEV
const prodURL = process.env.REACT_APP_BACKEND_URL_PROD

const getPath = (p: string) => ( development ? devURL : prodURL ) + p

export async function asyncPost<T>(path: string, obj: object ): Promise<AxiosResponse<T, any>>
{
    return axios.get<T>( getPath(path), {
        params: obj,
        paramsSerializer: params => Object.keys(params)
            .map( (key: any) => new URLSearchParams(`${key}=${params[key]}`) )
            .join("&")
    } )
}

export function get<T>(path: string, callback: (data: T) => void): void 
{
    fetch(getPath(path))
        .then(res => res.json())
        .then(data => callback(data));
}

export function post<T>(path: string, obj: object, callback: (data: T) => void): void
{
    asyncPost<T>(path, obj).then(res => callback(res.data));
}

export const put = ( path: string, obj: object ): void => {
    axios.put( getPath(path), obj  )
}

export const deleteReq = ( path: string ): void => {
    axios.delete( getPath(path) )
}