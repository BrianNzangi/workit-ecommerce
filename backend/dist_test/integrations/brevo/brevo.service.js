"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrevoService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let BrevoService = class BrevoService {
    configService;
    apiKey;
    apiUrl = 'https://api.brevo.com/v3';
    constructor(configService) {
        this.configService = configService;
        this.apiKey = this.configService.get('BREVO_API_KEY') || '';
    }
    async makeRequest(endpoint, method = 'GET', body) {
        const url = `${this.apiUrl}${endpoint}`;
        const headers = {
            'api-key': this.apiKey,
            'Content-Type': 'application/json',
        };
        const options = {
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
    async createOrUpdateContact(contact) {
        return await this.makeRequest('/contacts', 'POST', contact);
    }
    async getContact(email) {
        return await this.makeRequest(`/contacts/${encodeURIComponent(email)}`);
    }
    async deleteContact(email) {
        return await this.makeRequest(`/contacts/${encodeURIComponent(email)}`, 'DELETE');
    }
    async getLists() {
        return await this.makeRequest('/contacts/lists');
    }
    async createList(name, folderId) {
        return await this.makeRequest('/contacts/lists', 'POST', {
            name,
            folderId,
        });
    }
    async createEmailCampaign(campaign) {
        return await this.makeRequest('/emailCampaigns', 'POST', campaign);
    }
    async getEmailCampaign(campaignId) {
        return await this.makeRequest(`/emailCampaigns/${campaignId}`);
    }
    async updateEmailCampaign(campaignId, updates) {
        return await this.makeRequest(`/emailCampaigns/${campaignId}`, 'PUT', updates);
    }
    async sendEmailCampaign(campaignId) {
        return await this.makeRequest(`/emailCampaigns/${campaignId}/sendNow`, 'POST');
    }
    async sendTestEmail(campaignId, emailTo) {
        return await this.makeRequest(`/emailCampaigns/${campaignId}/sendTest`, 'POST', {
            emailTo,
        });
    }
    async getCampaignStatistics(campaignId) {
        return await this.makeRequest(`/emailCampaigns/${campaignId}`);
    }
    async getAutomations() {
        return await this.makeRequest('/automation/workflows');
    }
    async getAutomationDetails(workflowId) {
        return await this.makeRequest(`/automation/workflows/${workflowId}`);
    }
    async sendTransactionalEmail(data) {
        return await this.makeRequest('/smtp/email', 'POST', data);
    }
    async createWebhook(url, events) {
        return await this.makeRequest('/webhooks', 'POST', {
            url,
            events,
        });
    }
    async getWebhooks() {
        return await this.makeRequest('/webhooks');
    }
};
exports.BrevoService = BrevoService;
exports.BrevoService = BrevoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], BrevoService);
//# sourceMappingURL=brevo.service.js.map