export interface User {
  id: string
  provider: string
  provider_id: string
  email: string | null
  name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}
