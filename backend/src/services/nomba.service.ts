import axios, { AxiosInstance } from "axios";
import env from "../config/env";
import logger from "../config/logger";

class NombaService {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.NOMBA_BASE_URL;
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        "Content-Type": "application/json",
        "x-nomba-integration-id": env.NOMBA_INTEGRATION_ID,
        "x-nomba-integration-secret": env.NOMBA_INTEGRATION_SECRET,
        "x-nomba-public-key": env.NOMBA_PUBLIC_KEY,
        "x-nomba-secret-key": env.NOMBA_SECRET_KEY,
      },
      timeout: 30000,
    });

    // Response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        logger.info(`Nomba API Response: ${response.config.url}`, {
          status: response.status,
          method: response.config.method,
        });
        return response;
      },
      (error) => {
        logger.error(`Nomba API Error: ${error.config?.url}`, {
          error: error.message,
          status: error.response?.status,
        });
        return Promise.reject(error);
      }
    );
  }

  // Create a payment link (Checkout)
  async createPaymentLink(payload: {
    amount: number;
    currency: string;
    customer: { email: string; name: string; phone?: string };
    description: string;
    metadata?: Record<string, any>;
    redirectUrl?: string;
    callbackUrl?: string;
  }): Promise<any> {
    try {
      const response = await this.client.post("/payments", {
        ...payload,
        callbackUrl: payload.callbackUrl || env.WEBHOOK_URL,
      });
      return response.data;
    } catch (error) {
      logger.error("Failed to create payment link:", error);
      throw error;
    }
  }

  // Create a charge (Tokenized Card)
  async createCharge(payload: {
    amount: number;
    currency: string;
    card: { token: string };
    customer: { id: string; email: string };
    description: string;
    metadata?: Record<string, any>;
    subscriptionId?: string;
  }): Promise<any> {
    try {
      const response = await this.client.post("/charges", {
        ...payload,
        customer: {
          id: payload.customer.id,
          email: payload.customer.email,
        },
      });
      return response.data;
    } catch (error) {
      logger.error("Failed to create charge:", error);
      throw error;
    }
  }

  // Verify a charge
  async verifyCharge(chargeId: string): Promise<any> {
    try {
      const response = await this.client.get(`/charges/${chargeId}`);
      return response.data;
    } catch (error) {
      logger.error("Failed to verify charge:", error);
      throw error;
    }
  }

  // Refund a charge
  async refundCharge(chargeId: string, amount?: number): Promise<any> {
    try {
      const response = await this.client.post(`/charges/${chargeId}/refund`, {
        amount,
      });
      return response.data;
    } catch (error) {
      logger.error("Failed to refund charge:", error);
      throw error;
    }
  }

  // Create a customer
  async createCustomer(payload: {
    email: string;
    name: string;
    phone?: string;
  }): Promise<any> {
    try {
      const response = await this.client.post("/customers", payload);
      return response.data;
    } catch (error) {
      logger.error("Failed to create customer:", error);
      throw error;
    }
  }

  // Get customer by ID
  async getCustomer(customerId: string): Promise<any> {
    try {
      const response = await this.client.get(`/customers/${customerId}`);
      return response.data;
    } catch (error) {
      logger.error("Failed to get customer:", error);
      throw error;
    }
  }

  // Create a tokenized card
  async createTokenizedCard(payload: {
    customer: string;
    card: {
      number: string;
      expiryMonth: number;
      expiryYear: number;
      cvv: string;
      name: string;
      billingAddress?: {
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state: string;
        country: string;
        zipCode: string;
      };
    };
  }): Promise<any> {
    try {
      const response = await this.client.post("/cards", payload);
      return response.data;
    } catch (error) {
      logger.error("Failed to create tokenized card:", error);
      throw error;
    }
  }

  // List customer cards
  async listCustomerCards(customerId: string): Promise<any> {
    try {
      const response = await this.client.get(`/customers/${customerId}/cards`);
      return response.data;
    } catch (error) {
      logger.error("Failed to list customer cards:", error);
      throw error;
    }
  }

  // Delete a card
  async deleteCard(cardId: string): Promise<any> {
    try {
      const response = await this.client.delete(`/cards/${cardId}`);
      return response.data;
    } catch (error) {
      logger.error("Failed to delete card:", error);
      throw error;
    }
  }

  // Create a subscription
  async createSubscription(payload: {
    customer: string;
    card: string;
    amount: number;
    currency: string;
    frequency: string;
    startDate: string;
    endDate?: string;
    description: string;
    metadata?: Record<string, any>;
  }): Promise<any> {
    try {
      const response = await this.client.post("/subscriptions", payload);
      return response.data;
    } catch (error) {
      logger.error("Failed to create subscription:", error);
      throw error;
    }
  }

  // Get subscription
  async getSubscription(subscriptionId: string): Promise<any> {
    try {
      const response = await this.client.get(`/subscriptions/${subscriptionId}`);
      return response.data;
    } catch (error) {
      logger.error("Failed to get subscription:", error);
      throw error;
    }
  }

  // Pause subscription
  async pauseSubscription(subscriptionId: string): Promise<any> {
    try {
      const response = await this.client.patch(`/subscriptions/${subscriptionId}/pause`);
      return response.data;
    } catch (error) {
      logger.error("Failed to pause subscription:", error);
      throw error;
    }
  }

  // Resume subscription
  async resumeSubscription(subscriptionId: string): Promise<any> {
    try {
      const response = await this.client.patch(`/subscriptions/${subscriptionId}/resume`);
      return response.data;
    } catch (error) {
      logger.error("Failed to resume subscription:", error);
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string): Promise<any> {
    try {
      const response = await this.client.patch(`/subscriptions/${subscriptionId}/cancel`);
      return response.data;
    } catch (error) {
      logger.error("Failed to cancel subscription:", error);
      throw error;
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(payload: any, signature: string): boolean {
    const crypto = require("crypto");
    const expectedSignature = crypto
      .createHmac("sha256", env.WEBHOOK_SECRET)
      .update(JSON.stringify(payload))
      .digest("hex");
    return signature === `v1=${expectedSignature}`;
  }

  // Get webhook events
  async getWebhookEvents(
    from?: string,
    to?: string,
    limit: number = 100
  ): Promise<any> {
    try {
      const params: Record<string, any> = { limit };
      if (from) params.from = from;
      if (to) params.to = to;
      
      const response = await this.client.get("/webhooks/events", { params });
      return response.data;
    } catch (error) {
      logger.error("Failed to get webhook events:", error);
      throw error;
    }
  }
}

export default new NombaService();
