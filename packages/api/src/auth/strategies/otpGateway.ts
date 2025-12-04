import { createLogger } from '../../utils/logger.js';

const logger = createLogger('auth:otp');

export class OtpGateway {
  async sendOtp(phoneNumber: string): Promise<void> {
    logger.info({ phoneNumber }, 'Sending OTP (stubbed)');
  }

  async verifyOtp(phoneNumber: string, code: string): Promise<boolean> {
    logger.info({ phoneNumber, code }, 'Verifying OTP (stubbed)');
    return true;
  }
}

