import { DeviceTokenRepository } from '../repositories/deviceTokenRepository.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('device-token-cleanup');

/**
 * Service for cleaning up stale device tokens.
 * Should be run periodically (e.g., daily via cron job or scheduled task).
 */
export class DeviceTokenCleanupService {
  private repository: DeviceTokenRepository;

  constructor(repository?: DeviceTokenRepository) {
    this.repository = repository ?? new DeviceTokenRepository();
  }

  /**
   * Run the full cleanup process:
   * 1. Deactivate tokens inactive for 30+ days
   * 2. Delete tokens that have been inactive for 90+ days
   */
  async runCleanup(): Promise<{ deactivated: number; deleted: number }> {
    logger.info('Starting device token cleanup');

    const deactivated = await this.repository.deactivateStaleTokens(30);
    const deleted = await this.repository.deleteStaleTokens(90);

    logger.info({ deactivated, deleted }, 'Device token cleanup complete');

    return { deactivated, deleted };
  }
}
