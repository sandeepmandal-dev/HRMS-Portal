import { axiosClient } from './axiosClient'

export const authApi = {
  login: (payload) => axiosClient.post('/auth/login', payload).then((r) => r.data.data),
  refresh: (refreshToken) =>
    axiosClient.post('/auth/refresh', { refreshToken }).then((r) => r.data.data),
  logout: (refreshToken) => axiosClient.post('/auth/logout', { refreshToken }).then((r) => r.data),
}
