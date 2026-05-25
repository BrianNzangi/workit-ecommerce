import { describe, it, expect } from 'vitest';
import { CampaignNotEligibleError } from '../../../../src/domain/marketing/errors/CampaignNotEligibleError.js';
import { CampaignExpiredError } from '../../../../src/domain/marketing/errors/CampaignExpiredError.js';

describe('Marketing Domain Exceptions', () => {
  describe('CampaignNotEligibleError', () => {
    it('should create an error with custom message', () => {
      const message = 'Campaign usage limit exceeded';
      const error = new CampaignNotEligibleError(message);

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(message);
      expect(error.name).toBe('CampaignNotEligibleError');
    });

    it('should have correct error name', () => {
      const error = new CampaignNotEligibleError('Test error');

      expect(error.name).toBe('CampaignNotEligibleError');
    });

    it('should capture stack trace', () => {
      const error = new CampaignNotEligibleError('Test error');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('CampaignNotEligibleError');
    });

    it('should handle various eligibility failure reasons', () => {
      const reasons = [
        'Campaign has not started yet',
        'Campaign has expired',
        'Usage limit exceeded',
        'Per-customer usage limit exceeded',
        'Minimum purchase amount not met',
        'Campaign is inactive'
      ];

      reasons.forEach(reason => {
        const error = new CampaignNotEligibleError(reason);
        expect(error.message).toBe(reason);
      });
    });

    it('should be throwable and catchable', () => {
      expect(() => {
        throw new CampaignNotEligibleError('Campaign not eligible');
      }).toThrow(CampaignNotEligibleError);
    });

    it('should be catchable as Error', () => {
      expect(() => {
        throw new CampaignNotEligibleError('Campaign not eligible');
      }).toThrow(Error);
    });
  });

  describe('CampaignExpiredError', () => {
    const campaignId = 'campaign-123';

    it('should create an error with campaign ID', () => {
      const error = new CampaignExpiredError(campaignId);

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(`Campaign has expired: ${campaignId}`);
      expect(error.name).toBe('CampaignExpiredError');
    });

    it('should have correct error name', () => {
      const error = new CampaignExpiredError(campaignId);

      expect(error.name).toBe('CampaignExpiredError');
    });

    it('should include campaign ID in message', () => {
      const error = new CampaignExpiredError(campaignId);

      expect(error.message).toContain(campaignId);
    });

    it('should capture stack trace', () => {
      const error = new CampaignExpiredError(campaignId);

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('CampaignExpiredError');
    });

    it('should handle different campaign IDs', () => {
      const ids = ['campaign-1', 'campaign-abc-123', 'CAMPAIGN_XYZ'];

      ids.forEach(id => {
        const error = new CampaignExpiredError(id);
        expect(error.message).toContain(id);
      });
    });

    it('should be throwable and catchable', () => {
      expect(() => {
        throw new CampaignExpiredError(campaignId);
      }).toThrow(CampaignExpiredError);
    });

    it('should be catchable as Error', () => {
      expect(() => {
        throw new CampaignExpiredError(campaignId);
      }).toThrow(Error);
    });
  });

  describe('Error Distinction', () => {
    it('should distinguish between CampaignNotEligibleError and CampaignExpiredError', () => {
      const notEligibleError = new CampaignNotEligibleError('Not eligible');
      const expiredError = new CampaignExpiredError('campaign-1');

      expect(notEligibleError).not.toBeInstanceOf(CampaignExpiredError);
      expect(expiredError).not.toBeInstanceOf(CampaignNotEligibleError);
    });

    it('should catch specific error types', () => {
      const errors = [
        new CampaignNotEligibleError('Not eligible'),
        new CampaignExpiredError('campaign-1')
      ];

      errors.forEach(error => {
        if (error instanceof CampaignExpiredError) {
          expect(error.name).toBe('CampaignExpiredError');
        } else if (error instanceof CampaignNotEligibleError) {
          expect(error.name).toBe('CampaignNotEligibleError');
        }
      });
    });
  });

  describe('Error Handling Patterns', () => {
    it('should handle error in try-catch block', () => {
      let caughtError: Error | null = null;

      try {
        throw new CampaignNotEligibleError('Campaign not eligible');
      } catch (error) {
        caughtError = error as Error;
      }

      expect(caughtError).toBeInstanceOf(CampaignNotEligibleError);
      expect(caughtError?.message).toBe('Campaign not eligible');
    });

    it('should handle multiple error types in try-catch', () => {
      const testCases = [
        { error: new CampaignNotEligibleError('Not eligible'), type: 'CampaignNotEligibleError' },
        { error: new CampaignExpiredError('campaign-1'), type: 'CampaignExpiredError' }
      ];

      testCases.forEach(({ error, type }) => {
        let caughtError: Error | null = null;

        try {
          throw error;
        } catch (e) {
          caughtError = e as Error;
        }

        expect(caughtError?.name).toBe(type);
      });
    });

    it('should preserve error information through throw-catch cycle', () => {
      const originalMessage = 'Campaign usage limit exceeded';
      let caughtMessage = '';

      try {
        throw new CampaignNotEligibleError(originalMessage);
      } catch (error) {
        caughtMessage = (error as Error).message;
      }

      expect(caughtMessage).toBe(originalMessage);
    });
  });
});
