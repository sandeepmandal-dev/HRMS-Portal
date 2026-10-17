import { axiosClient } from './axiosClient'

export const payrollApi = {
  generate: (payload) => axiosClient.post('/payroll/generate', payload).then((r) => r.data.data),
  markPaid: (id) => axiosClient.patch(`/payroll/${id}/mark-paid`).then((r) => r.data.data),
  getMine: (params) => axiosClient.get('/payroll/me', { params }).then((r) => r.data.data),
  getForEmployee: (employeeId, params) =>
    axiosClient.get(`/payroll/employee/${employeeId}`, { params }).then((r) => r.data.data),

  getAll: (params) => axiosClient.get('/payroll', { params }).then((r) => r.data.data),
}
