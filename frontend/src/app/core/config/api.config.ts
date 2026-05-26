import { environment } from '../../../environments/environment';

export const API_CONFIG = {
  BASE_URL: environment.apiUrl,
  AUTH: `${environment.apiUrl}/auth`,
  ADMIN: `${environment.apiUrl}/admin`,
  TEACHER: `${environment.apiUrl}/teacher`,
  PARENT: `${environment.apiUrl}/parent`
};

