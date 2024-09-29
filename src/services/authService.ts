import axios from "axios";

// const apiURL = 'http://10.0.2.2:3000';
const apiURL="https://raw.githubusercontent.com/farman20ali/dataaccess_irs/refs/heads/main/src/main/resources/samples/"

export const fetchUserByMobile = async (mobile: string) => {
  try {
    console.log('Fetching user by mobile number...');
    // const path=`${apiURL}/irs/user`
     const path=`${apiURL}/users.json`
    // const response = await axios.get(path, {
    //   fileName: 'mobile',
    //   params:  mobile,  // Ensure this key matches your backend requirements
    // }, {
    //   headers: {
    //     'Accept': 'application/json',
    //     'Content-Type': 'application/json',
    //   },
    // });

    const response = await axios.get(path );

    const data = await response.data;
    
    // Check if data is valid
    if (!data || data.length === 0) {
      throw new Error('Invalid Login Credentials');
    }

    // Filter user by mobile number
    const filteredUser = data.find((user:any) => user.data.some((item:any) => item.mobile_number === mobile));

    if (!filteredUser) {
      throw new Error('User not found');
    }
    // Extract the first matching user's data
    const userData = filteredUser.data.find((item:any) => item.mobile_number === mobile);
 
    return userData; 
  } catch (error: any) {
    if (error.response) {
      console.error('Response Error:', error.response.data);
      console.error('Status Code:', error.response.status);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('Request Error:', error.request);
    } else {
      console.error('Error:', error.message);
    }

    throw error;
  }
};
export const fetchRolesPermissions = async (userId: number) => {
  try {
    console.log('Fetching roles and permissions for user...');
 // const path=`${apiURL}/irs/user`
     const path=`${apiURL}/user_permissions.json`
    // const response = await axios.post(path, {
    //   fileName: 'roles',
    //   params:   `${userId},${userId}`   // Pass userId properly formatted as per backend needs
    // }, {
    //   headers: {
    //     'Accept': 'application/json',
    //     'Content-Type': 'application/json',
    //   },
    // });
    const response = await axios.get(path)
    const data =await response.data;
 

   
    // Check if data is valid
    if (!data || data.length === 0) {
      throw new Error('No roles or permissions found');
    }

    // Filter roles and permissions by userId
    const userPermissions = data.find((item: any) => item.id === userId);

    if (!userPermissions || !userPermissions.data || userPermissions.data.length === 0) {
      throw new Error('No roles or permissions found for this user');
    }

    // Extract the first valid role
    const firstRole = userPermissions.data.find((item: any) => item.role_name !== null);

    if (!firstRole) {
      throw new Error('No valid role found');
    }

    return {
      role: firstRole.role_name || null,  // Assuming a single role like "admin"
      permissions: userPermissions.data.map((item: any) => item.permission_name)  // Return all permissions
    };
  } catch (error: any) {
    if (error.response) {
      console.error('Response Error:', error.response.data);
      console.error('Status Code:', error.response.status);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('Request Error:', error.request);
    } else {
      console.error('Error:', error.message);
    }

    console.error('Config:', error.config);
    throw error;
  }
};
