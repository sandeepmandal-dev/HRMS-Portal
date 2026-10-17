import { axiosClient } from './axiosClient'

export const employeeApi = {
  create: (payload) => axiosClient.post('/employees', payload).then((r) => r.data.data),
  getMyProfile: () => axiosClient.get('/employees/me').then((r) => r.data.data),
  getById: (id) => axiosClient.get(`/employees/${id}`).then((r) => r.data.data),
  search: (params) => axiosClient.get('/employees', { params }).then((r) => r.data.data),
  update: (id, payload) => axiosClient.put(`/employees/${id}`, payload).then((r) => r.data.data),
  deactivate: (id) => axiosClient.patch(`/employees/${id}/deactivate`).then((r) => r.data),
  reactivate: (id) => axiosClient.patch(`/employees/${id}/reactivate`).then((r) => r.data),
  updateMyProfile: (payload) => axiosClient.put('/employees/me', payload).then((r) => r.data.data),
}
