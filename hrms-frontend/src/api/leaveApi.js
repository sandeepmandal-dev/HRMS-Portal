import { axiosClient } from './axiosClient'

export const leaveApi = {
  apply: (payload) => axiosClient.post('/leaves', payload).then((r) => r.data.data),
  decide: (id, payload) => axiosClient.patch(`/leaves/${id}/decision`, payload).then((r) => r.data.data),
  cancel: (id) => axiosClient.patch(`/leaves/${id}/cancel`).then((r) => r.data.data),
  getMine: (params) => axiosClient.get('/leaves/me', { params }).then((r) => r.data.data),
  getPendingApprovals: (params) =>
    axiosClient.get('/leaves/pending-approvals', { params }).then((r) => r.data.data),
  getMyBalance: (year) =>
    axiosClient.get('/leaves/balance', { params: { year } }).then((r) => r.data.data),
}
