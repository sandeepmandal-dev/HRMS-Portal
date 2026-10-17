import { axiosClient } from './axiosClient'

export const departmentApi = {
  getAll: () => axiosClient.get('/departments').then((r) => r.data.data),
  getById: (id) => axiosClient.get(`/departments/${id}`).then((r) => r.data.data),
  create: (payload) => axiosClient.post('/departments', payload).then((r) => r.data.data),
  update: (id, payload) => axiosClient.put(`/departments/${id}`, payload).then((r) => r.data.data),
  remove: (id) => axiosClient.delete(`/departments/${id}`).then((r) => r.data),
}
