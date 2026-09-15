import type { Employee } from '@kanan-baroda/shared';
import { apiClient } from '@/lib/apiClient';

export interface EmployeeWithDepartment extends Omit<Employee, 'department'> {
  department: { _id: string; name: string; code: string; colorToken: string } | string;
}

export async function listEmployees(params: {
  branchId?: string;
  department?: string;
  q?: string;
}): Promise<EmployeeWithDepartment[]> {
  const { data } = await apiClient.get<{ employees: EmployeeWithDepartment[] }>('/admin/employees', { params });
  return data.employees;
}
