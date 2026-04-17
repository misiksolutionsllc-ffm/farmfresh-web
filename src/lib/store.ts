// Web localStorage adapter

// Configuration
export const CONFIG = {
  TAX_RATE: 0.07,
  PLATFORM_FEE: 0.10,
  DELIVERY_BASE: 4.99,
  POINTS_RATE: 10,
  POINT_VALUE: 0.01
};

// Types
export type UserRole = 'customer' | 'driver' | 'farmer' | 'owner';

export interface Document {
  type: string;
  name?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  date: string;
  uri?: string;
  uploadedAt?: string;
  expirationDate?: string;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reuploadFeedback?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: 'document_approved' | 'document_rejected' | 'document_reupload' | 'expiration_warning' | 'order_update' | 'general';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: {
    documentType?: string;
    reason?: string;
    feedback?: string;
    orderId?: string;
    expirationDate?: string;
  };
}

export interface User {
  id: string; // Unique user ID (immutable)
  name: string; // Full name
  preferredName?: string; // Display name / nickname
  role: UserRole;
  email: string; // Unique email
  emailVerified?: boolean; // Email verification status
  phone?: string; // Phone number
  phoneVerified?: boolean; // Phone verification status
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country?: string;
    label?: string; // e.g., "Home", "Work"
  };
  savedAddresses?: Array<{
    id: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country?: string;
    label: 'Home' | 'Work' | 'Other';
    isDefault: boolean;
    createdAt: string;
  }>;
  profilePhoto?: string; // URL or emoji
  createdAt?: string; // Account creation timestamp
  lastLogin?: string; // Last login timestamp
  status: 'active' | 'banned';
  verified: boolean;
  favorites?: string[];
  points?: number;
  wallet?: number;
  credits?: number; // Referral credits
  referralCode?: string; // Unique referral code
  referredBy?: string; // User ID who referred this user
  referralCount?: number; // Number of successful referrals
  // Business info (for merchants)
  businessName?: string;
  businessDescription?: string;
  businessHours?: string;
  businessLicense?: string;
  taxId?: string;
  // Driver info
  driverLicense?: string;
  vehicleInfo?: {
    make: string;
    model: string;
    year: number;
    plate: string;
    color: string;
  };
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    expirationDate: string;
  };
  backgroundCheckStatus?: 'pending' | 'approved' | 'rejected';
  documents?: Document[];
  rating?: number;
  trips?: number;
  earnings?: number;
  online?: boolean;
  acceptanceRate?: number;
  bankLast4?: string;
  cardLast4?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  vehiclePlate?: string;
  revenue?: number;
  description?: string;
  totalSpent?: number; // Total amount spent for loyalty tier
  loyaltyTier?: 'Bronze' | 'Silver' | 'Gold'; // Current loyalty tier
  subscription?: {
    tier: 'free' | 'basic' | 'premium' | 'enterprise';
    status: 'active' | 'trial' | 'expired' | 'cancelled' | 'past_due';
    startDate: string;
    nextBillingDate: string;
    trialEndsAt?: string;
    amount: number;
    billingCycle: 'monthly' | 'yearly';
    autoRenew: boolean;
    cancelledAt?: string;
    cancelReason?: string;
  };
  paymentMethods?: Array<{
    id: string;
    type: 'card';
    last4: string;
    brand: string;
    isDefault: boolean;
  }>;
  preferences?: {
    notifications: boolean;
    emailUpdates: boolean;
    smsAlerts: boolean;
    dietaryRestrictions: string[];
  };
}

export interface Product {
  id: string;
  farmerId: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  category: string;
  stock: number;
  status: 'active' | 'inactive';
  sales: number;
  rating: number;
  reviews: number;
  description?: string;
  organic?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
}

export interface LoyaltyTier {
  id: string;
  name: 'Bronze' | 'Silver' | 'Gold';
  minSpent: number;
  discountPercent: number;
  benefits: string[];
}

export interface Conversation {
  id: string;
  orderId: string;
  customerId: string;
  driverId: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  image: string;
}

export interface OrderFees {
  subtotal: number;
  delivery: number;
  platform: number;
  tax: number;
  tip: number;
  discount: number;
}

export interface Order {
  id: string;
  customerId: string;
  merchantId: string; // Farmer/merchant who fulfills this order
  items: OrderItem[];
  total: number;
  status: 'Pending' | 'Processing' | 'Ready' | 'Shipped' | 'Picked Up' | 'Delivered' | 'Cancelled';
  date: string;
  scheduledFor?: string; // ISO date string for scheduled delivery
  driverId: string | null;
  fees: OrderFees;
  instructions?: string;
  rejectionReason?: string;
  trackingNumber?: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  driverId: string | null;
  pickup: string;
  dropoff: string;
  pay: number;
  status: 'Pending' | 'Accepted' | 'Picked Up' | 'Delivered';
  distance: string;
}

// Driver trip history entry
export interface DriverTrip {
  id: string;
  driverId: string;
  orderId: string;
  customerId: string;
  customerName: string;
  pickup: {
    address: string;
    time: string; // ISO timestamp
  };
  dropoff: {
    address: string;
    time: string; // ISO timestamp
  };
  distance: number; // in miles
  duration: number; // in minutes
  status: 'completed' | 'cancelled' | 'issue';
  earnings: {
    basePay: number;
    tip: number;
    bonus: number;
    total: number;
  };
  rating?: number; // Customer rating for this trip
  feedback?: string; // Customer feedback
  onTime: boolean;
  qualityIssue: boolean;
  date: string; // ISO date
}

// Driver earnings record
export interface DriverEarningsRecord {
  id: string;
 visibleId: string;
  driverId: string;
  period: 'daily' | 'weekly' | 'monthly';
  date: string; // ISO date
  basePay: number;
  tips: number;
  bonuses: number;
  deductions: number;
  total: number;
  tripsCount: number;
  hoursWorked: number;
  status: 'pending' | 'paid' | 'processing';
  paidAt?: string;
}

// Driver performance metrics
export interface DriverPerformance {
  driverId: string;
  totalTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  acceptanceRate: number; // percentage
  completionRate: number; // percentage
  onTimeRate: number; // percentage
  qualityRate: number; // percentage (no issues)
  customerRating: number; // average 1-5
  totalRatings: number;
  avgDeliveryTime: number; // minutes
  avgTripsPerHour: number;
  peakHours: string[]; // e.g., ["11:00", "12:00", "18:00"]
  totalDistance: number; // miles
  lifetimeEarnings: number;
  currentWeekEarnings: number;
  currentMonthEarnings: number;
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: string;
  status: string;
  method: string;
}

export interface ChatMessage {
  text: string;
  senderId: string;
  time: string;
}

export interface Chat {
  id: string;
  messages: ChatMessage[];
}

export interface Review {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  merchantResponse?: string;
  merchantResponseDate?: string;
  merchantId?: string;
  merchantName?: string;
}

export interface PromoCode {
  code: string;
  discount: number;
  type: 'percent' | 'flat' | 'free_delivery';
  label: string;
  minOrder?: number;
  maxUses?: number;
  usedCount: number;
  active: boolean;
  expiresAt?: string;
}

export interface DriverLocation {
  driverId: string;
  latitude: number;
  longitude: number;
  heading: number;
  updatedAt: string;
}

export interface Referral {
  id: string;
  referrerId: string; // User who made the referral
  referredId: string; // User who was referred
  code: string; // Referral code used
  status: 'pending' | 'completed'; // Completed when referred user makes first order
  creditAwarded: number; // Credits given to referrer
  date: string;
}

export interface DeliveryTimeSlot {
  id: string;
  label: string; // e.g., "9:00 AM - 11:00 AM"
  startHour: number;
  endHour: number;
  available: boolean;
}

export interface Settings {
  platformFeePercent: number;
  deliveryBaseFee: number;
  taxRate: number;
  membershipPrice: number;
  maintenanceMode: boolean;
}

export interface PendingAdjustment {
  id: string;
  driverIds: string[]; // Support bulk adjustments
  amount: number;
  type: 'bonus' | 'penalty' | 'correction' | 'refund';
  reason: string;
  proposedBy: string; // Admin ID who proposed
  proposedByName: string;
  proposedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string; // Admin ID who approved/rejected
  reviewedByName?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  isBulk: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'free' | 'basic' | 'premium' | 'enterprise';
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  limits: {
    products?: number;
    orders?: number;
    storage?: string;
    support?: string;
  };
  popular?: boolean;
}

export interface OnboardingProgress {
  userId: string;
  completed: boolean;
  currentStep: number;
  steps: {
    welcome: boolean;
    profile: boolean;
    business: boolean;
    documents: boolean;
    subscription: boolean;
    payment: boolean;
  };
  startedAt: string;
  completedAt?: string;
}

export interface AuditLog {
  id: string;
  action: 'document_uploaded' | 'document_approved' | 'document_rejected' | 'document_reupload_requested' | 'user_verified' | 'user_banned';
  adminId?: string;
  adminName?: string;
  userId: string;
  userName: string;
  documentType?: string;
  reason?: string;
  feedback?: string;
  timestamp: string;
  metadata?: Record<string, string>;
}

export interface Database {
  settings: Settings;
  users: User[];
  products: Product[];
  orders: Order[];
  deliveries: Delivery[];
  transactions: Transaction[];
  chats: Chat[];
  promos: PromoCode[];
  reviews: Review[];
  driverLocations: DriverLocation[];
  referrals: Referral[];
  timeSlots: DeliveryTimeSlot[];
  loyaltyTiers: LoyaltyTier[];
  conversations: Conversation[];
  notifications: AppNotification[];
  pendingAdjustments: PendingAdjustment[];
  subscriptionPlans: SubscriptionPlan[];
  onboardingProgress: OnboardingProgress[];
  auditLogs: AuditLog[];
  logs: string[];
}

// Initial Database
export const INITIAL_DB: Database = {
  settings: {
    platformFeePercent: 10,
    deliveryBaseFee: 4.99,
    taxRate: 0.07,
    membershipPrice: 9.99,
    maintenanceMode: false
  },
  users: [
    { id: 'u1', name: 'New Customer', role: 'customer', email: 'customer@edemfarm.app', phone: '', status: 'active', verified: false, favorites: [], points: 0, wallet: 0, credits: 0, referralCode: 'EDEM10', referralCount: 0, totalSpent: 0, loyaltyTier: 'Bronze' },
    { id: 'u2', name: 'New Driver', role: 'driver', email: 'driver@edemfarm.app', phone: '', status: 'active', verified: false, rating: 0, trips: 0, earnings: 0, online: false, acceptanceRate: 0 },
    { id: 'u3', name: 'New Farmer', role: 'farmer', email: 'farmer@edemfarm.app', phone: '', status: 'active', verified: false, rating: 0, revenue: 0 },
    { id: 'u4', name: 'Platform Admin', role: 'owner', email: 'misiksolutionsllc@gmail.com', status: 'active', verified: true }
  ],
  products: [],
  orders: [],
  deliveries: [],
  transactions: [],
  promos: [
    { code: 'EDEM20', discount: 0.20, type: 'percent', label: '20% Off', usedCount: 0, active: true, minOrder: 20 },
    { code: 'WELCOME5', discount: 5.00, type: 'flat', label: '$5 Off', usedCount: 0, active: true },
    { code: 'FREEDELIVERY', discount: 0, type: 'free_delivery', label: 'Free Delivery', usedCount: 0, active: true, minOrder: 25 },
  ],
  reviews: [],
  driverLocations: [],
  referrals: [],
  timeSlots: [
    { id: 'ts1', label: '9:00 AM - 11:00 AM', startHour: 9, endHour: 11, available: true },
    { id: 'ts2', label: '11:00 AM - 1:00 PM', startHour: 11, endHour: 13, available: true },
    { id: 'ts3', label: '1:00 PM - 3:00 PM', startHour: 13, endHour: 15, available: true },
    { id: 'ts4', label: '3:00 PM - 5:00 PM', startHour: 15, endHour: 17, available: true },
    { id: 'ts5', label: '5:00 PM - 7:00 PM', startHour: 17, endHour: 19, available: true },
    { id: 'ts6', label: '7:00 PM - 9:00 PM', startHour: 19, endHour: 21, available: false },
  ],
  chats: [],
  loyaltyTiers: [
    { id: 'tier1', name: 'Bronze', minSpent: 0, discountPercent: 0, benefits: ['Free delivery on orders over $50', 'Early access to sales'] },
    { id: 'tier2', name: 'Silver', minSpent: 300, discountPercent: 5, benefits: ['5% off all orders', 'Free delivery on orders over $30', 'Priority customer support'] },
    { id: 'tier3', name: 'Gold', minSpent: 1000, discountPercent: 10, benefits: ['10% off all orders', 'Free delivery on all orders', 'VIP customer support', 'Exclusive product access'] }
  ],
  conversations: [],
  notifications: [],
  pendingAdjustments: [],
  subscriptionPlans: [
    { id: 'plan-free', name: 'Starter', tier: 'free', monthlyPrice: 0, yearlyPrice: 0, features: ['Up to 10 products', 'Basic storefront', 'Standard listing', 'Email support', 'Basic analytics'], limits: { products: 10, orders: 50, storage: '1GB', support: 'Email only' } },
    { id: 'plan-growth', name: 'Growth', tier: 'premium', monthlyPrice: 300, yearlyPrice: 2880, features: ['Unlimited products', 'Featured storefront badge', 'Priority listing', 'AI product descriptions', 'Advanced analytics', 'Promotional tools', 'Priority support', 'Custom farm page'], limits: { products: 999999, orders: 999999, storage: '100GB', support: '24/7 phone' }, popular: true },
    { id: 'plan-enterprise', name: 'Enterprise', tier: 'enterprise', monthlyPrice: 799, yearlyPrice: 7670, features: ['Everything in Growth', 'Dedicated account manager', 'White-label delivery', 'API access', 'Multi-location support', 'Custom integrations', 'Bulk upload tools'], limits: { products: 999999, orders: 999999, storage: 'Unlimited', support: 'Dedicated team' } },
  ],
  onboardingProgress: [],
  auditLogs: [],
  logs: []
};

// Storage key + version (increment to force reset)
const STORAGE_KEY = 'farmfresh_db';
const DB_VERSION_KEY = 'farmfresh_db_version';
const DB_VERSION = 14; // v2 = clean launch, no seed data

// Load database from storage
export function loadDatabase(): Database {
  try {
    // Force reset if version mismatch
    const savedVersion = parseInt(localStorage.getItem(DB_VERSION_KEY) || '0');
    if (savedVersion < DB_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(DB_VERSION_KEY, DB_VERSION.toString());
      return INITIAL_DB;
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...INITIAL_DB,
        ...parsed,
        users: parsed.users || INITIAL_DB.users,
        products: parsed.products || INITIAL_DB.products,
        orders: parsed.orders || INITIAL_DB.orders,
        deliveries: parsed.deliveries || INITIAL_DB.deliveries,
        chats: parsed.chats || INITIAL_DB.chats,
        promos: parsed.promos || INITIAL_DB.promos,
        reviews: parsed.reviews || INITIAL_DB.reviews,
        driverLocations: parsed.driverLocations || INITIAL_DB.driverLocations,
        referrals: parsed.referrals || INITIAL_DB.referrals,
        timeSlots: parsed.timeSlots || INITIAL_DB.timeSlots,
        auditLogs: parsed.auditLogs || INITIAL_DB.auditLogs,
        logs: parsed.logs || INITIAL_DB.logs,
        settings: { ...INITIAL_DB.settings, ...parsed.settings },
      };
    }
  } catch (e) {
    console.error('Failed to load database:', e);
  }
  localStorage.setItem(DB_VERSION_KEY, DB_VERSION.toString());
  return INITIAL_DB;
}

// Save database to storage
export function saveDatabase(db: Database): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Failed to save database:', e);
  }
}

// Utility functions
export const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0.00';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return 'Invalid Date';
  }
};

// Action types
export type Action =
  | { type: 'CREATE_ORDER'; payload: { customerId: string; merchantId: string; items: OrderItem[]; fees: OrderFees; total: number; instructions?: string; promoCode?: string; scheduledFor?: string; creditsUsed?: number } }
  | { type: 'UPDATE_ORDER'; payload: { id: string; status?: Order['status']; trackingNumber?: string; rejectionReason?: string } }
  | { type: 'MARK_READY'; id: string }
  | { type: 'ACCEPT_JOB'; id: string; driverId: string }
  | { type: 'PICKUP_JOB'; id: string }
  | { type: 'COMPLETE_JOB'; id: string }
  | { type: 'DRIVER_PAYOUT'; amount: number; method: 'card' | 'bank'; driverId: string }
  | { type: 'ADD_PRODUCT'; payload: Partial<Product> & { farmerId: string } }
  | { type: 'UPDATE_PRODUCT'; payload: Partial<Product> & { id: string } }
  | { type: 'DELETE_PRODUCT'; id: string }
  | { type: 'SEND_MSG'; chatId: string; text: string; sender: string }
  | { type: 'UPDATE_USER_STATUS'; userId: string; status: 'active' | 'banned' }
  | { type: 'VERIFY_DOC'; userId: string; docIndex: number; status: 'approved' | 'rejected' }
  | { type: 'UPDATE_SETTING'; key: keyof Settings; value: number | boolean }
  | { type: 'ADD_REVIEW'; payload: { productId: string; customerId: string; customerName: string; rating: number; comment: string } }
  | { type: 'MODERATE_REVIEW'; reviewId: string; status: 'approved' | 'rejected' }
  | { type: 'RESPOND_TO_REVIEW'; reviewId: string; response: string; merchantId: string; merchantName: string }
  | { type: 'DELETE_REVIEW_RESPONSE'; reviewId: string }
  | { type: 'UPDATE_DRIVER_LOCATION'; driverId: string; latitude: number; longitude: number; heading: number }
  | { type: 'USE_PROMO'; code: string }
  | { type: 'ADD_PROMO'; payload: Omit<PromoCode, 'usedCount'> }
  | { type: 'UPDATE_PROMO'; code: string; updates: Partial<PromoCode> }
  | { type: 'NUKE_DATA' }
  | { type: 'SET_DB'; db: Database }
  | { type: 'TOGGLE_FAVORITE'; userId: string; productId: string }
  | { type: 'USE_CREDITS'; userId: string; amount: number }
  | { type: 'ADD_CREDITS'; userId: string; amount: number }
  | { type: 'CREATE_REFERRAL'; referrerId: string; referredId: string; code: string }
  | { type: 'COMPLETE_REFERRAL'; referralId: string }
  | { type: 'GENERATE_REFERRAL_CODE'; userId: string }
  | { type: 'UPDATE_LOYALTY_TIER'; userId: string; tier: 'Bronze' | 'Silver' | 'Gold' }
  | { type: 'CREATE_CONVERSATION'; orderId: string; customerId: string; driverId: string }
  | { type: 'ADD_MESSAGE'; conversationId: string; senderId: string; text: string }
  | { type: 'SUBMIT_QUALITY_RATING'; payload: { orderId: string; productQuality: number; freshness: number; packaging: number; deliveryService: number; overallRating: number; comment: string; issues: string[] } }
  | { type: 'UPDATE_SUBSCRIPTION'; userId: string; tier: 'basic' | 'premium' | 'family' }
  | { type: 'PAUSE_SUBSCRIPTION'; userId: string }
  | { type: 'RESUME_SUBSCRIPTION'; userId: string }
  | { type: 'UPDATE_USER_PROFILE'; userId: string; updates: Partial<User> }
  | { type: 'ADD_SAVED_ADDRESS'; userId: string; address: { street: string; city: string; state: string; zip: string; country?: string; label: 'Home' | 'Work' | 'Other' } }
  | { type: 'UPDATE_SAVED_ADDRESS'; userId: string; addressId: string; updates: Partial<{ street: string; city: string; state: string; zip: string; country?: string; label: 'Home' | 'Work' | 'Other' }> }
  | { type: 'DELETE_SAVED_ADDRESS'; userId: string; addressId: string }
  | { type: 'SET_DEFAULT_ADDRESS'; userId: string; addressId: string }
  | { type: 'REJECT_DOC_WITH_REASON'; userId: string; docIndex: number; reason: string }
  | { type: 'REQUEST_DOC_REUPLOAD'; userId: string; docIndex: number; feedback: string }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<AppNotification, 'id' | 'createdAt'> }
  | { type: 'MARK_NOTIFICATION_READ'; notificationId: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ'; userId: string }
  | { type: 'CLEAR_ALL_NOTIFICATIONS'; userId: string }
  | { type: 'UPDATE_DRIVER_EARNINGS'; driverId: string; amount: number }
  | { type: 'ADD_EARNINGS_ADJUSTMENT'; payload: { driverId: string; amount: number; type: string; reason: string; adminId: string; adminName: string } }
  | { type: 'PROPOSE_ADJUSTMENT'; payload: Omit<PendingAdjustment, 'id' | 'status' | 'proposedAt'> }
  | { type: 'START_ONBOARDING'; userId: string; role: UserRole }
  | { type: 'UPDATE_ONBOARDING_STEP'; userId: string; step: keyof OnboardingProgress['steps'] }
  | { type: 'COMPLETE_ONBOARDING'; userId: string; data: Partial<User> }
  | { type: 'UPGRADE_SUBSCRIPTION'; userId: string; tier: 'free' | 'basic' | 'premium' | 'enterprise'; billingCycle: 'monthly' | 'yearly' }
  | { type: 'CANCEL_SUBSCRIPTION'; userId: string; reason?: string }
  | { type: 'APPROVE_ADJUSTMENT'; adjustmentId: string; adminId: string; adminName: string }
  | { type: 'REJECT_ADJUSTMENT'; adjustmentId: string; adminId: string; adminName: string; reason: string }
  | { type: 'BULK_UPDATE_DRIVER_EARNINGS'; updates: Array<{ driverId: string; amount: number }> }
  | { type: 'UPLOAD_DOCUMENT'; userId: string; document: Omit<Document, 'status'> & { status?: Document['status'] } }
  | { type: 'ADD_AUDIT_LOG'; payload: Omit<AuditLog, 'id' | 'timestamp'> }
  | { type: 'CHECK_DOCUMENT_EXPIRATIONS' }
  | { type: 'CANCEL_ORDER'; orderId: string; customerId: string; reason: string };

// Reducer function
export function dbReducer(state: Database, action: Action): Database {
  const newState = { ...state };

  switch (action.type) {
    case 'CREATE_ORDER': {
      newState.orders = [{
        id: `ord-${Date.now()}`,
        customerId: action.payload.customerId,
        merchantId: action.payload.merchantId,
        items: action.payload.items,
        total: action.payload.total,
        fees: action.payload.fees,
        instructions: action.payload.instructions,
        scheduledFor: action.payload.scheduledFor,
        status: 'Pending',
        date: new Date().toISOString(),
        driverId: null
      }, ...newState.orders];
      // Update user's total spent and deduct credits if used
      const uIdx = newState.users.findIndex(u => u.id === action.payload.customerId);
      if (uIdx > -1) {
        newState.users = [...newState.users];
        newState.users[uIdx] = {
          ...newState.users[uIdx],
          totalSpent: (newState.users[uIdx].totalSpent || 0) + action.payload.total,
          credits: (newState.users[uIdx].credits || 0) - (action.payload.creditsUsed || 0)
        };
      }
      break;
    }

    case 'UPDATE_ORDER': {
      const orderIdx = newState.orders.findIndex(o => o.id === action.payload.id);
      if (orderIdx > -1) {
        newState.orders = [...newState.orders];
        newState.orders[orderIdx] = {
          ...newState.orders[orderIdx],
          ...(action.payload.status !== undefined && { status: action.payload.status }),
          ...(action.payload.trackingNumber !== undefined && { trackingNumber: action.payload.trackingNumber }),
          ...(action.payload.rejectionReason !== undefined && { rejectionReason: action.payload.rejectionReason })
        };
      }
      break;
    }

    case 'MARK_READY': {
      const oIdx = newState.orders.findIndex(o => o.id === action.id);
      if (oIdx > -1) {
        newState.orders = [...newState.orders];
        newState.orders[oIdx] = { ...newState.orders[oIdx], status: 'Ready' };
        const order = newState.orders[oIdx];
        const driverPay = (order.fees?.delivery || CONFIG.DELIVERY_BASE) + (order.fees?.tip || 0);
        // Use actual merchant address for pickup
        const merchant = newState.users.find(u => u.id === order.merchantId);
        const pickupAddress = merchant?.address
          ? `${merchant.address.street || ''}, ${merchant.address.city || ''}, ${merchant.address.state || ''}`.replace(/^,\s*|,\s*$|,\s*,/g, '').trim()
          : (merchant?.name || 'Merchant Location');
        // Use customer address for dropoff
        const customer = newState.users.find(u => u.id === order.customerId);
        const dropoffAddress = customer?.address
          ? `${customer.address.street || ''}, ${customer.address.city || ''}, ${customer.address.state || ''}`.replace(/^,\s*|,\s*$|,\s*,/g, '').trim()
          : (customer?.name ? `${customer.name}'s address` : 'Customer Location');
        newState.deliveries = [...newState.deliveries, {
          id: `del-${Date.now()}`,
          orderId: action.id,
          driverId: null,
          pickup: pickupAddress || 'Merchant Location',
          dropoff: dropoffAddress || 'Customer Location',
          pay: driverPay,
          status: 'Pending' as const,
          distance: '3.2 mi'
        }];
      }
      break;
    }

    case 'ACCEPT_JOB': {
      const dIdx = newState.deliveries.findIndex(d => d.id === action.id);
      if (dIdx > -1) {
        newState.deliveries = [...newState.deliveries];
        newState.deliveries[dIdx] = { ...newState.deliveries[dIdx], driverId: action.driverId, status: 'Accepted' };
      }
      break;
    }

    case 'PICKUP_JOB': {
      const dIdx = newState.deliveries.findIndex(d => d.id === action.id);
      if (dIdx > -1) {
        newState.deliveries = [...newState.deliveries];
        newState.deliveries[dIdx] = { ...newState.deliveries[dIdx], status: 'Picked Up' };
        const oIdx = newState.orders.findIndex(o => o.id === newState.deliveries[dIdx].orderId);
        if (oIdx > -1) {
          newState.orders = [...newState.orders];
          newState.orders[oIdx] = { ...newState.orders[oIdx], status: 'Picked Up' };
        }
      }
      break;
    }

    case 'COMPLETE_JOB': {
      const dIdx = newState.deliveries.findIndex(d => d.id === action.id);
      if (dIdx > -1) {
        const delivery = newState.deliveries[dIdx];
        newState.deliveries = [...newState.deliveries];
        newState.deliveries[dIdx] = { ...delivery, status: 'Delivered' };
        const oIdx = newState.orders.findIndex(o => o.id === delivery.orderId);
        if (oIdx > -1) {
          newState.orders = [...newState.orders];
          newState.orders[oIdx] = { ...newState.orders[oIdx], status: 'Delivered' };
        }
        // Use the actual driverId from the delivery, not a hardcoded value
        const actualDriverId = delivery.driverId;
        if (actualDriverId) {
          const uIdx = newState.users.findIndex(u => u.id === actualDriverId);
          if (uIdx > -1) {
            newState.users = [...newState.users];
            newState.users[uIdx] = { 
              ...newState.users[uIdx], 
              earnings: (newState.users[uIdx].earnings || 0) + delivery.pay,
              trips: (newState.users[uIdx].trips || 0) + 1
            };
          }
        }
      }
      break;
    }

    case 'DRIVER_PAYOUT': {
      const uIdx = newState.users.findIndex(u => u.id === action.driverId);
      if (uIdx > -1) {
        newState.users = [...newState.users];
        newState.users[uIdx] = { 
          ...newState.users[uIdx], 
          earnings: (newState.users[uIdx].earnings || 0) - action.amount 
        };
        newState.transactions = [{
          id: `tx-${Date.now()}`,
          type: 'Payout',
          amount: -action.amount,
          date: new Date().toISOString(),
          status: 'Processing',
          method: action.method === 'card' ? 'Instant Transfer' : 'Bank Transfer'
        }, ...newState.transactions];
      }
      break;
    }

    case 'ADD_PRODUCT': {
      newState.products = [...newState.products, {
        id: `p-${Date.now()}`,
        farmerId: action.payload.farmerId,
        name: action.payload.name || 'New Product',
        price: Number(action.payload.price) || 0,
        unit: action.payload.unit || 'each',
        image: '🥬',
        category: action.payload.category || 'Vegetables',
        stock: Number(action.payload.stock) || 50,
        status: 'active',
        sales: 0,
        rating: 0,
        reviews: 0,
        description: action.payload.description
      }];
      break;
    }

    case 'UPDATE_PRODUCT': {
      const pIdx = newState.products.findIndex(p => p.id === action.payload.id);
      if (pIdx > -1) {
        newState.products = [...newState.products];
        newState.products[pIdx] = { 
          ...newState.products[pIdx], 
          ...action.payload,
          price: action.payload.price !== undefined ? Number(action.payload.price) : newState.products[pIdx].price,
          stock: action.payload.stock !== undefined ? Number(action.payload.stock) : newState.products[pIdx].stock
        };
      }
      break;
    }

    case 'DELETE_PRODUCT': {
      newState.products = newState.products.filter(p => p.id !== action.id);
      break;
    }

    case 'SEND_MSG': {
      const cIdx = newState.chats.findIndex(c => c.id === action.chatId);
      const msg: ChatMessage = { text: action.text, senderId: action.sender, time: new Date().toISOString() };
      if (cIdx > -1) {
        newState.chats = [...newState.chats];
        newState.chats[cIdx] = { ...newState.chats[cIdx], messages: [...newState.chats[cIdx].messages, msg] };
      } else {
        newState.chats = [...newState.chats, { id: action.chatId, messages: [msg] }];
      }
      break;
    }

    case 'UPDATE_USER_STATUS': {
      const uIdx = newState.users.findIndex(u => u.id === action.userId);
      if (uIdx > -1) {
        newState.users = [...newState.users];
        newState.users[uIdx] = { ...newState.users[uIdx], status: action.status };
      }
      break;
    }

    case 'VERIFY_DOC': {
      const uIdx = newState.users.findIndex(u => u.id === action.userId);
      if (uIdx > -1 && newState.users[uIdx].documents) {
        newState.users = [...newState.users];
        const docs = [...newState.users[uIdx].documents!];
        const docType = docs[action.docIndex]?.type || 'Document';
        docs[action.docIndex] = {
          ...docs[action.docIndex],
          status: action.status,
          reviewedBy: 'Admin',
          reviewedAt: new Date().toISOString(),
        };
        const allApproved = docs.every(d => d.status === 'approved');
        newState.users[uIdx] = { ...newState.users[uIdx], documents: docs, verified: allApproved };
        const user = newState.users[uIdx];
        // Add audit log
        newState.auditLogs = [{
          id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          action: action.status === 'approved' ? 'document_approved' : 'document_rejected',
          adminId: 'admin',
          adminName: 'Admin',
          userId: action.userId,
          userName: user.name,
          documentType: docType,
          timestamp: new Date().toISOString(),
        }, ...(newState.auditLogs || [])];
        // Add notification to user
        newState.notifications = [{
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId: action.userId,
          type: action.status === 'approved' ? 'document_approved' : 'document_rejected',
          title: action.status === 'approved' ? '✅ Document Approved' : '❌ Document Rejected',
          message: action.status === 'approved'
            ? `Your ${docType} has been approved. Your account is now verified!`
            : `Your ${docType} was rejected. Please upload a new document.`,
          read: false,
          createdAt: new Date().toISOString(),
          metadata: { documentType: docType },
        }, ...newState.notifications];
      }
      break;
    }

    case 'UPDATE_SETTING': {
      newState.settings = { ...newState.settings, [action.key]: action.value };
      break;
    }

    case 'ADD_REVIEW': {
      const newReview: Review = {
        id: `rev-${Date.now()}`,
        productId: action.payload.productId,
        customerId: action.payload.customerId,
        customerName: action.payload.customerName,
        rating: action.payload.rating,
        comment: action.payload.comment,
        date: new Date().toISOString(),
        status: 'pending'
      };
      newState.reviews = [newReview, ...newState.reviews];
      // Update product rating
      const pIdx = newState.products.findIndex(p => p.id === action.payload.productId);
      if (pIdx > -1) {
        const productReviews = newState.reviews.filter(r => r.productId === action.payload.productId && r.status === 'approved');
        const avgRating = productReviews.length > 0 
          ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length 
          : action.payload.rating;
        newState.products = [...newState.products];
        newState.products[pIdx] = { 
          ...newState.products[pIdx], 
          rating: Math.round(avgRating * 10) / 10,
          reviews: newState.products[pIdx].reviews + 1
        };
      }
      break;
    }

    case 'MODERATE_REVIEW': {
      const rIdx = newState.reviews.findIndex(r => r.id === action.reviewId);
      if (rIdx > -1) {
        newState.reviews = [...newState.reviews];
        newState.reviews[rIdx] = { ...newState.reviews[rIdx], status: action.status };
        // Recalculate product rating if approved
        if (action.status === 'approved') {
          const review = newState.reviews[rIdx];
          const pIdx = newState.products.findIndex(p => p.id === review.productId);
          if (pIdx > -1) {
            const approvedReviews = newState.reviews.filter(r => r.productId === review.productId && r.status === 'approved');
            const avgRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length;
            newState.products = [...newState.products];
            newState.products[pIdx] = { ...newState.products[pIdx], rating: Math.round(avgRating * 10) / 10 };
          }
        }
      }
      break;
    }

    case 'RESPOND_TO_REVIEW': {
      const respIdx = newState.reviews.findIndex(r => r.id === action.reviewId);
      if (respIdx > -1) {
        newState.reviews = [...newState.reviews];
        newState.reviews[respIdx] = {
          ...newState.reviews[respIdx],
          merchantResponse: action.response,
          merchantResponseDate: new Date().toISOString(),
          merchantId: action.merchantId,
          merchantName: action.merchantName
        };
      }
      break;
    }

    case 'DELETE_REVIEW_RESPONSE': {
      const delRespIdx = newState.reviews.findIndex(r => r.id === action.reviewId);
      if (delRespIdx > -1) {
        newState.reviews = [...newState.reviews];
        const { merchantResponse, merchantResponseDate, merchantId, merchantName, ...rest } = newState.reviews[delRespIdx];
        newState.reviews[delRespIdx] = rest as Review;
      }
      break;
    }

    case 'UPDATE_DRIVER_LOCATION': {
      const locIdx = newState.driverLocations.findIndex(l => l.driverId === action.driverId);
      const newLocation: DriverLocation = {
        driverId: action.driverId,
        latitude: action.latitude,
        longitude: action.longitude,
        heading: action.heading,
        updatedAt: new Date().toISOString()
      };
      if (locIdx > -1) {
        newState.driverLocations = [...newState.driverLocations];
        newState.driverLocations[locIdx] = newLocation;
      } else {
        newState.driverLocations = [...newState.driverLocations, newLocation];
      }
      break;
    }

    case 'USE_PROMO': {
      const promoIdx = newState.promos.findIndex(p => p.code === action.code);
      if (promoIdx > -1) {
        newState.promos = [...newState.promos];
        newState.promos[promoIdx] = { 
          ...newState.promos[promoIdx], 
          usedCount: newState.promos[promoIdx].usedCount + 1 
        };
      }
      break;
    }

    case 'ADD_PROMO': {
      newState.promos = [...newState.promos, { ...action.payload, usedCount: 0 }];
      break;
    }

    case 'UPDATE_PROMO': {
      const promoIdx = newState.promos.findIndex(p => p.code === action.code);
      if (promoIdx > -1) {
        newState.promos = [...newState.promos];
        newState.promos[promoIdx] = { ...newState.promos[promoIdx], ...action.updates };
      }
      break;
    }

    case 'NUKE_DATA': {
      newState.orders = [];
      newState.deliveries = [];
      newState.transactions = [];
      newState.reviews = [];
      newState.logs = [];
      break;
    }

    case 'SET_DB': {
      return action.db;
    }

    case 'TOGGLE_FAVORITE': {
      const uIdx = newState.users.findIndex(u => u.id === action.userId);
      if (uIdx > -1) {
        newState.users = [...newState.users];
        const user = newState.users[uIdx];
        const favorites = user.favorites || [];
        const isFavorite = favorites.includes(action.productId);
        newState.users[uIdx] = {
          ...user,
          favorites: isFavorite 
            ? favorites.filter(id => id !== action.productId)
            : [...favorites, action.productId]
        };
      }
      break;
    }

    case 'USE_CREDITS': {
      const uIdx = newState.users.findIndex(u => u.id === action.userId);
      if (uIdx > -1) {
        newState.users = [...newState.users];
        newState.users[uIdx] = {
          ...newState.users[uIdx],
          credits: Math.max(0, (newState.users[uIdx].credits || 0) - action.amount)
        };
      }
      break;
    }

    case 'ADD_CREDITS': {
      const uIdx = newState.users.findIndex(u => u.id === action.userId);
      if (uIdx > -1) {
        newState.users = [...newState.users];
        newState.users[uIdx] = {
          ...newState.users[uIdx],
          credits: (newState.users[uIdx].credits || 0) + action.amount
        };
      }
      break;
    }

    case 'CREATE_REFERRAL': {
      newState.referrals = [...newState.referrals, {
        id: `ref-${Date.now()}`,
        referrerId: action.referrerId,
        referredId: action.referredId,
        code: action.code,
        status: 'pending',
        creditAwarded: 0,
        date: new Date().toISOString()
      }];
      break;
    }

    case 'COMPLETE_REFERRAL': {
      const refIdx = newState.referrals.findIndex(r => r.id === action.referralId);
      if (refIdx > -1 && newState.referrals[refIdx].status === 'pending') {
        const referral = newState.referrals[refIdx];
        const creditAmount = 5.00; // $5 credit for successful referral
        
        // Update referral status
        newState.referrals = [...newState.referrals];
        newState.referrals[refIdx] = {
          ...referral,
          status: 'completed',
          creditAwarded: creditAmount
        };
        
        // Add credits to referrer
        const referrerIdx = newState.users.findIndex(u => u.id === referral.referrerId);
        if (referrerIdx > -1) {
          newState.users = [...newState.users];
          newState.users[referrerIdx] = {
            ...newState.users[referrerIdx],
            credits: (newState.users[referrerIdx].credits || 0) + creditAmount,
            referralCount: (newState.users[referrerIdx].referralCount || 0) + 1
          };
        }
      }
      break;
    }

    case 'GENERATE_REFERRAL_CODE': {
      const uIdx = newState.users.findIndex(u => u.id === action.userId);
      if (uIdx > -1 && !newState.users[uIdx].referralCode) {
        newState.users = [...newState.users];
        const name = newState.users[uIdx].name.split(' ')[0].toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        newState.users[uIdx] = {
          ...newState.users[uIdx],
          referralCode: `${name}${random}`,
          referralCount: 0,
          credits: newState.users[uIdx].credits || 0
        };
      }
      break;
    }

    case 'UPDATE_LOYALTY_TIER': {
      const uIdx = newState.users.findIndex(u => u.id === action.userId);
      if (uIdx > -1) {
        newState.users = [...newState.users];
        newState.users[uIdx] = {
          ...newState.users[uIdx],
          loyaltyTier: action.tier
        };
      }
      break;
    }

    case 'CREATE_CONVERSATION': {
      const newConversation: Conversation = {
        id: `conv-${Date.now()}`,
        orderId: action.orderId,
        customerId: action.customerId,
        driverId: action.driverId,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      newState.conversations = [...newState.conversations, newConversation];
      break;
    }

    case 'ADD_MESSAGE': {
      const convIdx = newState.conversations.findIndex(c => c.id === action.conversationId);
      if (convIdx > -1) {
        newState.conversations = [...newState.conversations];
        const newMessage: ChatMessage = {
          text: action.text,
          senderId: action.senderId,
          time: new Date().toISOString()
        };
        newState.conversations[convIdx] = {
          ...newState.conversations[convIdx],
          messages: [...newState.conversations[convIdx].messages, newMessage],
          updatedAt: new Date().toISOString()
        };
      }
      break;
    }

    case 'SUBMIT_QUALITY_RATING': {
      // Store quality rating as a review for the order
      const order = newState.orders.find(o => o.id === action.payload.orderId);
      if (order) {
        // Create a review entry for quality tracking
        newState.reviews = [...newState.reviews, {
          id: `qr-${Date.now()}`,
          productId: action.payload.orderId, // Using orderId as productId for order-level reviews
          customerId: order.customerId,
          customerName: newState.users.find(u => u.id === order.customerId)?.name || 'Customer',
          rating: action.payload.overallRating,
          comment: action.payload.comment,
          date: new Date().toISOString(),
          status: 'approved'
        }];
      }
      break;
    }

    case 'UPDATE_SUBSCRIPTION': {
      const uIdx = newState.users.findIndex(u => u.id === action.userId);
      if (uIdx > -1) {
        newState.users = [...newState.users];
        const tierPrices: Record<string, number> = { 
          free: 0, 
          basic: 29.99, 
          premium: 79.99, 
          enterprise: 199.99 
        };
        const nextBillingDate = new Date();
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        
        newState.users[uIdx] = {
          ...newState.users[uIdx],
          subscription: {
            tier: action.tier as 'free' | 'basic' | 'premium' | 'enterprise',
            status: 'active',
            startDate: new Date().toISOString(),
            nextBillingDate: nextBillingDate.toISOString(),
            amount: tierPrices[action.tier] || 0,
            billingCycle: 'monthly',
            autoRenew: true,
          }
        };
      }
      break;
    }

    case 'PAUSE_SUBSCRIPTION': {
      const uIdx = newState.users.findIndex(u => u.id === action.userId);
      if (uIdx > -1 && newState.users[uIdx].subscription) {
        newState.users = [...newState.users];
        newState.users[uIdx] = {
          ...newState.users[uIdx],
          subscription: {
            ...newState.users[uIdx].subscription!,
            status: 'cancelled'
          }
        };
      }
      break;
    }

    case 'RESUME_SUBSCRIPTION': {
      const uIdx = newState.users.findIndex(u => u.id === action.userId);
      if (uIdx > -1 && newState.users[uIdx].subscription) {
        newState.users = [...newState.users];
        newState.users[uIdx] = {
          ...newState.users[uIdx],
          subscription: {
            ...newState.users[uIdx].subscription!,
            status: 'active'
          }
        };
      }
      break;
    }

    case 'UPDATE_USER_PROFILE': {
      const uIdx = newState.users.findIndex(u => u.id === action.userId);
      if (uIdx > -1) {
        newState.users = [...newState.users];
        newState.users[uIdx] = {
          ...newState.users[uIdx],
          ...action.updates
        };
      }
      break;
    }

    case 'REJECT_DOC_WITH_REASON': {
      const uIdx = newState.users.findIndex(u => u.id === action.userId);
      if (uIdx > -1 && newState.users[uIdx].documents?.[action.docIndex]) {
        newState.users = [...newState.users];
        const docs = [...(newState.users[uIdx].documents || [])];
        const docType = docs[action.docIndex]?.type || 'Document';
        docs[action.docIndex] = {
          ...docs[action.docIndex],
          status: 'rejected',
          rejectionReason: action.reason,
          reviewedBy: 'Admin',
          reviewedAt: new Date().toISOString()
        };
        newState.users[uIdx] = {
          ...newState.users[uIdx],
          documents: docs,
          verified: false
        };
        const user = newState.users[uIdx];
        // Audit log
        newState.auditLogs = [{
          id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          action: 'document_rejected',
          adminId: 'admin',
          adminName: 'Admin',
          userId: action.userId,
          userName: user.name,
          documentType: docType,
          reason: action.reason,
          timestamp: new Date().toISOString(),
        }, ...(newState.auditLogs || [])];
        // Notification
        newState.notifications = [{
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId: action.userId,
          type: 'document_rejected',
          title: '❌ Document Rejected',
          message: `Your ${docType} was rejected: ${action.reason}`,
          read: false,
          createdAt: new Date().toISOString(),
          metadata: { documentType: docType, reason: action.reason },
        }, ...newState.notifications];
      }
      break;
    }

    case 'REQUEST_DOC_REUPLOAD': {
      const uIdx = newState.users.findIndex(u => u.id === action.userId);
      if (uIdx > -1 && newState.users[uIdx].documents?.[action.docIndex]) {
        newState.users = [...newState.users];
        const docs = [...(newState.users[uIdx].documents || [])];
        const docType = docs[action.docIndex]?.type || 'Document';
        docs[action.docIndex] = {
          ...docs[action.docIndex],
          status: 'pending',
          reuploadFeedback: action.feedback,
          reviewedBy: 'Admin',
          reviewedAt: new Date().toISOString()
        };
        newState.users[uIdx] = {
          ...newState.users[uIdx],
          documents: docs
        };
        const user = newState.users[uIdx];
        // Audit log
        newState.auditLogs = [{
          id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          action: 'document_reupload_requested',
          adminId: 'admin',
          adminName: 'Admin',
          userId: action.userId,
          userName: user.name,
          documentType: docType,
          feedback: action.feedback,
          timestamp: new Date().toISOString(),
        }, ...(newState.auditLogs || [])];
        // Notification
        newState.notifications = [{
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId: action.userId,
          type: 'document_reupload',
          title: '🔄 Re-upload Required',
          message: `Please re-upload your ${docType}: ${action.feedback}`,
          read: false,
          createdAt: new Date().toISOString(),
          metadata: { documentType: docType, feedback: action.feedback },
        }, ...newState.notifications];
      }
      break;
    }

    case 'ADD_NOTIFICATION': {
      const newNotification: AppNotification = {
        ...action.payload,
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString()
      };
      newState.notifications = [newNotification, ...newState.notifications];
      break;
    }

    case 'MARK_NOTIFICATION_READ': {
      const nIdx = newState.notifications.findIndex(n => n.id === action.notificationId);
      if (nIdx > -1) {
        newState.notifications = [...newState.notifications];
        newState.notifications[nIdx] = {
          ...newState.notifications[nIdx],
          read: true
        };
      }
      break;
    }

    case 'MARK_ALL_NOTIFICATIONS_READ': {
      newState.notifications = newState.notifications.map(n =>
        n.userId === action.userId ? { ...n, read: true } : n
      );
      break;
    }

    case 'CLEAR_ALL_NOTIFICATIONS': {
      newState.notifications = newState.notifications.filter(n => n.userId !== action.userId);
      break;
    }

    case 'UPDATE_DRIVER_EARNINGS': {
      const driverIndex = newState.users.findIndex(u => u.id === action.driverId);
      if (driverIndex !== -1) {
        newState.users[driverIndex] = {
          ...newState.users[driverIndex],
          earnings: action.amount,
        };
      }
      break;
    }

    case 'ADD_EARNINGS_ADJUSTMENT': {
      // Log the adjustment in the logs array
      const logEntry = `EARNINGS_ADJUSTMENT: ${JSON.stringify({
        ...action.payload,
        timestamp: new Date().toISOString(),
      })}`;
      newState.logs = [...newState.logs, logEntry];
      break;
    }

    case 'PROPOSE_ADJUSTMENT': {
      const newAdjustment: PendingAdjustment = {
        ...action.payload,
        id: `adj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'pending',
        proposedAt: new Date().toISOString(),
      };
      newState.pendingAdjustments = [...newState.pendingAdjustments, newAdjustment];
      break;
    }

    case 'APPROVE_ADJUSTMENT': {
      const adjustmentIndex = newState.pendingAdjustments.findIndex(a => a.id === action.adjustmentId);
      if (adjustmentIndex !== -1) {
        const adjustment = newState.pendingAdjustments[adjustmentIndex];
        
        // Update adjustment status
        newState.pendingAdjustments[adjustmentIndex] = {
          ...adjustment,
          status: 'approved',
          reviewedBy: action.adminId,
          reviewedByName: action.adminName,
          reviewedAt: new Date().toISOString(),
        };

        // Apply the adjustment to driver(s)
        adjustment.driverIds.forEach(driverId => {
          const driverIndex = newState.users.findIndex(u => u.id === driverId);
          if (driverIndex !== -1) {
            const currentEarnings = newState.users[driverIndex].earnings || 0;
            newState.users[driverIndex] = {
              ...newState.users[driverIndex],
              earnings: currentEarnings + adjustment.amount,
            };
          }
        });

        // Log the approved adjustment
        const logEntry = `EARNINGS_ADJUSTMENT_APPROVED: ${JSON.stringify({
          adjustmentId: adjustment.id,
          driverIds: adjustment.driverIds,
          amount: adjustment.amount,
          type: adjustment.type,
          reason: adjustment.reason,
          proposedBy: adjustment.proposedByName,
          approvedBy: action.adminName,
          timestamp: new Date().toISOString(),
        })}`;
        newState.logs = [...newState.logs, logEntry];
      }
      break;
    }

    case 'REJECT_ADJUSTMENT': {
      const adjustmentIndex = newState.pendingAdjustments.findIndex(a => a.id === action.adjustmentId);
      if (adjustmentIndex !== -1) {
        newState.pendingAdjustments[adjustmentIndex] = {
          ...newState.pendingAdjustments[adjustmentIndex],
          status: 'rejected',
          reviewedBy: action.adminId,
          reviewedByName: action.adminName,
          reviewedAt: new Date().toISOString(),
          rejectionReason: action.reason,
        };

        // Log the rejection
        const logEntry = `EARNINGS_ADJUSTMENT_REJECTED: ${JSON.stringify({
          adjustmentId: action.adjustmentId,
          rejectedBy: action.adminName,
          reason: action.reason,
          timestamp: new Date().toISOString(),
        })}`;
        newState.logs = [...newState.logs, logEntry];
      }
      break;
    }

    case 'BULK_UPDATE_DRIVER_EARNINGS': {
      action.updates.forEach(({ driverId, amount }) => {
        const driverIndex = newState.users.findIndex(u => u.id === driverId);
        if (driverIndex !== -1) {
          newState.users[driverIndex] = {
            ...newState.users[driverIndex],
            earnings: amount,
          };
        }
      });
      break;
    }

    case 'START_ONBOARDING': {
      const existing = newState.onboardingProgress.find(p => p.userId === action.userId);
      if (!existing) {
        newState.onboardingProgress = [...newState.onboardingProgress, {
          userId: action.userId,
          completed: false,
          currentStep: 0,
          steps: {
            welcome: false,
            profile: false,
            business: false,
            documents: false,
            subscription: false,
            payment: false,
          },
          startedAt: new Date().toISOString(),
        }];
      }
      break;
    }

    case 'UPDATE_ONBOARDING_STEP': {
      const progressIndex = newState.onboardingProgress.findIndex(p => p.userId === action.userId);
      if (progressIndex !== -1) {
        newState.onboardingProgress = [...newState.onboardingProgress];
        newState.onboardingProgress[progressIndex] = {
          ...newState.onboardingProgress[progressIndex],
          steps: {
            ...newState.onboardingProgress[progressIndex].steps,
            [action.step]: true,
          },
          currentStep: newState.onboardingProgress[progressIndex].currentStep + 1,
        };
      }
      break;
    }

    case 'COMPLETE_ONBOARDING': {
      const progressIndex = newState.onboardingProgress.findIndex(p => p.userId === action.userId);
      if (progressIndex !== -1) {
        newState.onboardingProgress = [...newState.onboardingProgress];
        newState.onboardingProgress[progressIndex] = {
          ...newState.onboardingProgress[progressIndex],
          completed: true,
          completedAt: new Date().toISOString(),
        };
      }

      const userIndex = newState.users.findIndex(u => u.id === action.userId);
      if (userIndex !== -1) {
        newState.users = [...newState.users];
        newState.users[userIndex] = {
          ...newState.users[userIndex],
          ...action.data,
        };
      }
      break;
    }

    case 'UPGRADE_SUBSCRIPTION': {
      const userIndex = newState.users.findIndex(u => u.id === action.userId);
      if (userIndex !== -1) {
        const plan = newState.subscriptionPlans.find(p => p.tier === action.tier);
        if (plan) {
          const amount = action.billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
          const nextBillingDate = new Date();
          if (action.billingCycle === 'monthly') {
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
          } else {
            nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
          }

          newState.users = [...newState.users];
          newState.users[userIndex] = {
            ...newState.users[userIndex],
            subscription: {
              tier: action.tier,
              status: 'active',
              startDate: new Date().toISOString(),
              nextBillingDate: nextBillingDate.toISOString(),
              amount,
              billingCycle: action.billingCycle,
              autoRenew: true,
            },
          };
        }
      }
      break;
    }

    case 'CANCEL_SUBSCRIPTION': {
      const userIndex = newState.users.findIndex(u => u.id === action.userId);
      if (userIndex !== -1 && newState.users[userIndex].subscription) {
        newState.users = [...newState.users];
        newState.users[userIndex] = {
          ...newState.users[userIndex],
          subscription: {
            ...newState.users[userIndex].subscription!,
            status: 'cancelled',
            autoRenew: false,
            cancelledAt: new Date().toISOString(),
            cancelReason: action.reason,
          },
        };
      }
      break;
    }

    case 'UPLOAD_DOCUMENT': {
      const uIdx = newState.users.findIndex(u => u.id === action.userId);
      if (uIdx > -1) {
        newState.users = [...newState.users];
        const existingDocs = newState.users[uIdx].documents || [];
        // Replace if same type exists, otherwise add
        const existingIdx = existingDocs.findIndex(d => d.type === action.document.type);
        const newDoc: Document = {
          ...action.document,
          status: 'pending',
          uploadedAt: new Date().toISOString(),
        };
        let updatedDocs: Document[];
        if (existingIdx > -1) {
          updatedDocs = [...existingDocs];
          updatedDocs[existingIdx] = newDoc;
        } else {
          updatedDocs = [...existingDocs, newDoc];
        }
        newState.users[uIdx] = {
          ...newState.users[uIdx],
          documents: updatedDocs,
          verified: false, // Reset verification when new doc uploaded
        };
        // Add audit log
        const user = newState.users[uIdx];
        newState.auditLogs = [{
          id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          action: 'document_uploaded',
          userId: action.userId,
          userName: user.name,
          documentType: action.document.type,
          timestamp: new Date().toISOString(),
        }, ...(newState.auditLogs || [])];
      }
      break;
    }

    case 'ADD_AUDIT_LOG': {
      const newLog: AuditLog = {
        ...action.payload,
        id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
      };
      newState.auditLogs = [newLog, ...(newState.auditLogs || [])];
      break;
    }

    case 'CHECK_DOCUMENT_EXPIRATIONS': {
      const now = new Date();
      const notifications: AppNotification[] = [];
      newState.users.forEach(user => {
        if (!user.documents) return;
        user.documents.forEach(doc => {
          if (!doc.expirationDate || doc.status !== 'approved') return;
          const expDate = new Date(doc.expirationDate);
          const daysUntilExpiry = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          let warningDays: number | null = null;
          if (daysUntilExpiry <= 0) warningDays = 0;
          else if (daysUntilExpiry <= 7) warningDays = 7;
          else if (daysUntilExpiry <= 15) warningDays = 15;
          else if (daysUntilExpiry <= 30) warningDays = 30;
          if (warningDays !== null) {
            // Check if we already sent this notification recently
            const alreadyNotified = newState.notifications.some(
              n => n.userId === user.id &&
                n.type === 'expiration_warning' &&
                n.metadata?.documentType === doc.type &&
                new Date(n.createdAt) > new Date(now.getTime() - 24 * 60 * 60 * 1000)
            );
            if (!alreadyNotified) {
              notifications.push({
                id: `notif-exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                userId: user.id,
                type: 'expiration_warning',
                title: warningDays === 0 ? `⚠️ Document Expired` : `⏰ Document Expiring Soon`,
                message: warningDays === 0
                  ? `Your ${doc.type} has expired. Please upload a new one immediately.`
                  : `Your ${doc.type} expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}. Please renew it soon.`,
                read: false,
                createdAt: now.toISOString(),
                metadata: {
                  documentType: doc.type,
                  expirationDate: doc.expirationDate,
                },
              });
            }
          }
        });
      });
      if (notifications.length > 0) {
        newState.notifications = [...notifications, ...newState.notifications];
      }
      break;
    }

    case 'CANCEL_ORDER': {
      const orderIdx = newState.orders.findIndex(o => o.id === action.orderId);
      if (orderIdx === -1) break;
      const order = newState.orders[orderIdx];
      // Only allow cancellation of Pending or Processing orders
      if (order.status !== 'Pending' && order.status !== 'Processing') break;

      // Calculate refund amount (full refund for Pending, partial for Processing)
      const refundAmount = order.status === 'Pending' ? order.total : order.total * 0.9;

      newState.orders = newState.orders.map(o =>
        o.id === action.orderId
          ? { ...o, status: 'Cancelled' as const, rejectionReason: action.reason }
          : o
      );

      // Credit refund to customer account
      newState.users = newState.users.map(u =>
        u.id === action.customerId
          ? { ...u, credits: (u.credits || 0) + refundAmount }
          : u
      );

      // Add notification to customer
      const cancelNotification: AppNotification = {
        id: `notif-cancel-${Date.now()}`,
        userId: action.customerId,
        type: 'order_update',
        title: 'Order Cancelled',
        message: `Your order #${action.orderId.slice(-6)} has been cancelled. ${formatCurrency(refundAmount)} credit added to your account.`,
        read: false,
        createdAt: new Date().toISOString(),
        metadata: { orderId: action.orderId },
      };
      newState.notifications = [...(newState.notifications || []), cancelNotification];
      break;
    }
  }

  return newState;
}

// Helper function to validate and apply promo code
export function validatePromoCode(
  code: string, 
  promos: PromoCode[], 
  subtotal: number
): { valid: boolean; promo?: PromoCode; error?: string } {
  const promo = promos.find(p => p.code.toUpperCase() === code.toUpperCase());
  
  if (!promo) {
    return { valid: false, error: 'Invalid promo code' };
  }
  
  if (!promo.active) {
    return { valid: false, error: 'This promo code is no longer active' };
  }
  
  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
    return { valid: false, error: 'This promo code has expired' };
  }
  
  if (promo.maxUses && promo.usedCount >= promo.maxUses) {
    return { valid: false, error: 'This promo code has reached its usage limit' };
  }
  
  if (promo.minOrder && subtotal < promo.minOrder) {
    return { valid: false, error: `Minimum order of $${promo.minOrder.toFixed(2)} required` };
  }
  
  return { valid: true, promo };
}

// Calculate discount from promo code
export function calculatePromoDiscount(
  promo: PromoCode, 
  subtotal: number, 
  deliveryFee: number
): { discount: number; newDeliveryFee: number } {
  switch (promo.type) {
    case 'percent':
      return { discount: subtotal * promo.discount, newDeliveryFee: deliveryFee };
    case 'flat':
      return { discount: Math.min(promo.discount, subtotal), newDeliveryFee: deliveryFee };
    case 'free_delivery':
      return { discount: 0, newDeliveryFee: 0 };
    default:
      return { discount: 0, newDeliveryFee: deliveryFee };
  }
}
