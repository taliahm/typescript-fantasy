import React from 'react';
import { Roles } from '../types/user';


interface RoleProps {
  userRole: Roles,
  role: Roles,
  children: JSX.Element,
}

function Role({userRole, role, children}: RoleProps): JSX.Element {
  return (
    <div>
      {userRole === role && children}
    </div>
  )
}

export default Role;