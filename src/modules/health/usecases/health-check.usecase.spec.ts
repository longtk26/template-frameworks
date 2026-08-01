import { HealthCheckUsecase } from './health-check.usecase';

describe('HealthCheckUsecase', () => {
  it('reports healthy', async () => {
    const usecase = new HealthCheckUsecase();
    await expect(usecase.execute()).resolves.toEqual({ status: 'healthy' });
  });
});
