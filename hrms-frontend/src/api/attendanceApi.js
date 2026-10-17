import { axiosClient } from './axiosClient'

export const attendanceApi = {
  checkIn: (remarks) => axiosClient.post('/attendance/check-in', { remarks }).then((r) => r.data.data),
  checkOut: (remarks) => axiosClient.post('/attendance/check-out', { remarks }).then((r) => r.data.data),
  getMine: (params) => axiosClient.get('/attendance/me', { params }).then((r) => r.data.data),
  getForEmployee: (employeeId, params) =>
    axiosClient.get(`/attendance/employee/${employeeId}`, { params }).then((r) => r.data.data),
}
