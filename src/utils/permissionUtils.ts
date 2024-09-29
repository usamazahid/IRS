export const hasPermission = (userPermissions: string[], requiredPermission: string) => {
    return userPermissions.includes(requiredPermission);
  };
  


  export const hasRequiredPermissions = (permissions:string[], requiredPermissions:string[]) => {
    if (!permissions || permissions.length === 0) return false;
    return requiredPermissions.every((perm) => permissions.includes(perm));
  };