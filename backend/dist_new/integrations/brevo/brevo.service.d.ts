import { ConfigService } from '@nestjs/config';
interface BrevoContact {
    email: string;
    attributes?: Record<string, any>;
    listIds?: number[];
    updateEnabled?: boolean;
}
interface BrevoEmailCampaign {
    name: string;
    subject: string;
    sender: {
        name: string;
        email: string;
    };
    htmlContent: string;
    recipients: {
        listIds: number[];
    };
    scheduledAt?: string;
}
export declare class BrevoService {
    private configService;
    private readonly apiKey;
    private readonly apiUrl;
    constructor(configService: ConfigService);
    private makeRequest;
    createOrUpdateContact(contact: BrevoContact): Promise<any>;
    getContact(email: string): Promise<any>;
    deleteContact(email: string): Promise<any>;
    getLists(): Promise<any>;
    createList(name: string, folderId?: number): Promise<any>;
    createEmailCampaign(campaign: BrevoEmailCampaign): Promise<any>;
    getEmailCampaign(campaignId: number): Promise<any>;
    updateEmailCampaign(campaignId: number, updates: Partial<BrevoEmailCampaign>): Promise<any>;
    sendEmailCampaign(campaignId: number): Promise<any>;
    sendTestEmail(campaignId: number, emailTo: string[]): Promise<any>;
    getCampaignStatistics(campaignId: number): Promise<any>;
    getAutomations(): Promise<any>;
    getAutomationDetails(workflowId: number): Promise<any>;
    sendTransactionalEmail(data: {
        sender: {
            name: string;
            email: string;
        };
        to: Array<{
            email: string;
            name?: string;
        }>;
        subject: string;
        htmlContent: string;
        params?: Record<string, any>;
    }): Promise<any>;
    createWebhook(url: string, events: string[]): Promise<any>;
    getWebhooks(): Promise<any>;
}
export {};
