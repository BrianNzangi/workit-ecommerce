import { Injectable } from '@nestjs/common';
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
    scheduledAt?: string; // ISO 8601 format
}

@Injectable()
export class BrevoService {
    private readonly apiKey: string;
    private readonly apiUrl = 'https://api.brevo.com/v3';

    constructor(private configService: ConfigService) {
        this.apiKey = this.configService.get<string>('BREVO_API_KEY') || '';
    }

    private async makeRequest(
        endpoint: string,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
        body?: any
    ) {
        const url = `${this.apiUrl}${endpoint}`;
        const headers = {
            'api-key': this.apiKey,
            'Content-Type': 'application/json',
        };

        const options: RequestInit = {
            method,
            headers,
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Brevo API Error: ${JSON.stringify(error)}`);
        }

        return await response.json();
    }

    // Contact Management
    async createOrUpdateContact(contact: BrevoContact) {
        return await this.makeRequest('/contacts', 'POST', contact);
    }

    async getContact(email: string) {
        return await this.makeRequest(`/contacts/${encodeURIComponent(email)}`);
    }

    async deleteContact(email: string) {
        return await this.makeRequest(`/contacts/${encodeURIComponent(email)}`, 'DELETE');
    }

    // List Management
    async getLists() {
        return await this.makeRequest('/contacts/lists');
    }

    async createList(name: string, folderId?: number) {
        return await this.makeRequest('/contacts/lists', 'POST', {
            name,
            folderId,
        });
    }

    // Email Campaign Management
    async createEmailCampaign(campaign: BrevoEmailCampaign) {
        return await this.makeRequest('/emailCampaigns', 'POST', campaign);
    }

    async getEmailCampaign(campaignId: number) {
        return await this.makeRequest(`/emailCampaigns/${campaignId}`);
    }

    async updateEmailCampaign(campaignId: number, updates: Partial<BrevoEmailCampaign>) {
        return await this.makeRequest(`/emailCampaigns/${campaignId}`, 'PUT', updates);
    }

    async sendEmailCampaign(campaignId: number) {
        return await this.makeRequest(`/emailCampaigns/${campaignId}/sendNow`, 'POST');
    }

    async sendTestEmail(campaignId: number, emailTo: string[]) {
        return await this.makeRequest(`/emailCampaigns/${campaignId}/sendTest`, 'POST', {
            emailTo,
        });
    }

    // Campaign Statistics
    async getCampaignStatistics(campaignId: number) {
        return await this.makeRequest(`/emailCampaigns/${campaignId}`);
    }

    // Automation/Workflow Management
    async getAutomations() {
        return await this.makeRequest('/automation/workflows');
    }

    async getAutomationDetails(workflowId: number) {
        return await this.makeRequest(`/automation/workflows/${workflowId}`);
    }

    // Transactional Email
    async sendTransactionalEmail(data: {
        sender: { name: string; email: string };
        to: Array<{ email: string; name?: string }>;
        subject: string;
        htmlContent: string;
        params?: Record<string, any>;
    }) {
        return await this.makeRequest('/smtp/email', 'POST', data);
    }

    // Webhooks
    async createWebhook(url: string, events: string[]) {
        return await this.makeRequest('/webhooks', 'POST', {
            url,
            events,
        });
    }

    async getWebhooks() {
        return await this.makeRequest('/webhooks');
    }
}
