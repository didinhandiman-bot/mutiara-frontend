import API from './api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UserProfile {
  id: number;
  nama: string;
  email: string;
  role: string;
}

export const loginApi = async (credentials: LoginPayload) => {
  const response = await API.post('/login', credentials);
  return response.data; // Menerima { success, message, data: { token, user } }
};

export const getMeApi = async (): Promise<{ success: boolean; data: UserProfile }> => {
  const response = await API.get('/me');
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};