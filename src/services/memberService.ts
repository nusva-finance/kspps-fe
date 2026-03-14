import api from './api'

export interface Member {
  id?: number
  member_no: string
  full_name: string
  gender: string
  join_date: string
  birth_date?: string
  birth_place?: string
  nik: string
  address: string
  city?: string
  province?: string
  postal_code?: string
  phone_number: string
  email?: string
  is_active: boolean
}

export interface MemberResponse {
  data: Member[]
  total: number
  page: number
  limit: number
}

export const memberService = {
  // Get all members
  getMembers: async (page = 1, limit = 10, search = ''): Promise<MemberResponse> => {
    const response = await api.get('/members', {
      params: { page, limit, search },
    })
    return response.data
  },

  // Get member by ID
  getMemberById: async (id: number): Promise<Member> => {
    const response = await api.get(`/members/${id}`)
    return response.data
  },

  // Create member
  createMember: async (memberData: Member): Promise<Member> => {
    const response = await api.post('/members', memberData)
    return response.data
  },

  // Update member
  updateMember: async (id: number, memberData: Partial<Member>): Promise<Member> => {
    const response = await api.put(`/members/${id}`, memberData)
    return response.data
  },

  // Delete member
  deleteMember: async (id: number): Promise<void> => {
    await api.delete(`/members/${id}`)
  },
}

export default memberService
