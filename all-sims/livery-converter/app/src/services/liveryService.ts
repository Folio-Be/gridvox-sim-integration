import { apiClient } from './apiClient';
import type { GenerateRequest, GenerateResponse } from '../types/api.types';

export const requestLiveryGeneration = async (payload: GenerateRequest) => {
    const { data } = await apiClient.post<GenerateResponse>('/api/generate-livery', payload);
    return data;
};
