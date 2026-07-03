export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  status: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  _id: string;
  fuelType: "petrol" | "diesel" | "lpg";
  planType: "weekly" | "biweekly" | "monthly" | "quarterly" | "custom";
  amount: number;
  quantity: number;
  frequency: number;
  unit: "liters" | "kg" | "cylinders";
  status: "active" | "paused" | "cancelled" | "expired" | "suspended";
  startDate: string;
  nextDeliveryDate: string;
  endDate: string;
  autoRenew: boolean;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  amount: number;
  currency: string;
  status: "pending" | "processing" | "success" | "failed" | "cancelled" | "refunded";
  method: "card" | "bank_transfer" | "payment_link";
  description: string;
  nombaChargeId?: string;
  nombaTransactionId?: string;
  nombaPaymentLink?: string;
  retryCount: number;
  maxRetries: number;
  nextRetryAt?: string;
  failureReason?: string;
  failureCode?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Card {
  _id: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  status: "active" | "expired" | "declined" | "suspended" | "revoked";
  isDefault: boolean;
  displayName: string;
  expiryDate: string;
}

export interface Delivery {
  _id: string;
  fuelType: "petrol" | "diesel" | "lpg";
  quantity: number;
  unit: string;
  status: "pending" | "assigned" | "en_route" | "at_customer" | "delivered" | "failed" | "cancelled";
  scheduledTime: string;
  actualDeliveryTime?: string;
  cost: number;
  driver?: User;
  vendor?: any;
  customer: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  _id: string;
  businessName: string;
  status: "active" | "inactive" | "suspended" | "pending_verification";
  rating: number;
  totalDeliveries: number;
  totalRevenue: number;
  fuelTypes: ("petrol" | "diesel" | "lpg")[];
  contactPerson: {
    name: string;
    phone: string;
    email: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  _id: string;
  licenseNumber: string;
  licenseExpiry: string;
  vehicle: {
    type: string;
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    color: string;
    capacity: number;
  };
  status: "active" | "inactive" | "suspended" | "off_duty" | "on_delivery";
  rating: number;
  totalDeliveries: number;
  totalDistance: number;
  currentLocation: {
    latitude: number;
    longitude: number;
    updatedAt: string;
  };
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Analytics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalCustomers: number;
  totalDeliveries: number;
  successRate: number;
  failedPayments: number;
  churnRate: number;
  fuelConsumption: {
    petrol: number;
    diesel: number;
    lpg: number;
  };
  revenueByMonth: Array<{
    month: string;
    revenue: number;
  }>;
  subscriptionsByStatus: {
    active: number;
    paused: number;
    cancelled: number;
  };
}

export interface WebhookEvent {
  event: string;
  data: any;
  timestamp: string;
}

export interface Notification {
  _id: string;
  userId: string;
  type: "payment_success" | "payment_failed" | "delivery_update" | "subscription_change" | "card_expiration";
  title: string;
  message: string;
  read: boolean;
  channel: ("email" | "sms" | "whatsapp" | "push")[];
  metadata?: Record<string, any>;
  createdAt: string;
}

export type Role = "customer" | "vendor" | "driver" | "admin" | "support" | "accountant" | "manager" | "owner";
