export type AuthResult = {
  success: boolean,
  user: {
    id: string,
    username: string,
    role: string
  } | null
}
