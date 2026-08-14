import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { getDefaultCloudApi } from '@/services/cloud'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export async function authorizeCloudRequest(config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> {
  const session = await (await getDefaultCloudApi()).auth.currentSession()
  if (session.ok && session.data?.accessToken) {
    config.headers.set('Authorization', `Bearer ${session.data.accessToken}`)
  } else {
    config.headers.delete('Authorization')
  }
  return config
}

// Request interceptor. Session persistence and refresh are owned by the cloud
// auth provider; application code never copies bearer tokens to localStorage.
api.interceptors.request.use(
  authorizeCloudRequest,
  (error) => {
    return Promise.reject(error)
  },
)

export const fetchAPI = api








