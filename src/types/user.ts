import { Team } from './team';

export enum Roles {
  admin = 'ADMIN',
  user = 'USER',
  superadmin = 'SUPERADMIN'
}

export interface User {
  _id: string
  teams: Team[]
  role: Roles
  profilePic: string
  firstName: string
  lastName: string
  email: string
}

