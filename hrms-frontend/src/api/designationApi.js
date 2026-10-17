import { axiosClient } from './axiosClient'

export const designationApi = {
  getAll: () => axiosClient.get('/designations').then((r) => r.data.data),
  getById: (id) => axiosClient.get(`/designations/${id}`).then((r) => r.data.data),
  create: (payload) => axiosClient.post('/designations', payload).then((r) => r.data.data),
  update: (id, payload) => axiosClient.put(`/designations/${id}`, payload).then((r) => r.data.data),
  remove: (id) => axiosClient.delete(`/designations/${id}`).then((r) => r.data),
}
