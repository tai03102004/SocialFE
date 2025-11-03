import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Cache configuration
const CACHE_DURATION = 10000; // 10 seconds
const cache = new Map<string, { data: any; timestamp: number }>();

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Cache helper
const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.message);
    return Promise.reject(error);
  }
);

// ==================== HEALTH & SYSTEM ====================
export const healthApi = {
  check: async () => {
    const cached = getCachedData("health");
    if (cached) return cached;

    const response = await api.get("/health");
    setCachedData("health", response.data);
    return response.data;
  },
};

export const systemApi = {
  getStatus: async () => {
    const cached = getCachedData("system-status");
    if (cached) return cached;

    const response = await api.get("/system/status");
    setCachedData("system-status", response.data);
    return response.data;
  },
};

// ==================== MARKET APIs ====================
export const marketApi = {
  getStatus: async () => {
    const cached = getCachedData("market-status");
    if (cached) return cached;

    const response = await api.get("/market/status");
    setCachedData("market-status", response.data);
    return response.data;
  },

  getSignals: async () => {
    const cached = getCachedData("market-signals");
    if (cached) return cached;

    const response = await api.get("/market/signals");
    setCachedData("market-signals", response.data);
    return response.data;
  },

  getPrices: async (coins: string[] = ["bitcoin", "ethereum"]) => {
    const cacheKey = `prices-${coins.join(",")}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    const response = await api.get("/market/prices", {
      params: { coins: coins.join(",") },
    });
    setCachedData(cacheKey, response.data);
    return response.data;
  },

  getDetailedData: async (coin: string) => {
    const cacheKey = `detailed-${coin}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    const response = await api.get(`/market/detailed/${coin}`);
    setCachedData(cacheKey, response.data);
    return response.data;
  },
};

// ==================== TRADING APIs ====================
export const tradingApi = {
  getPortfolio: async () => {
    const cached = getCachedData("portfolio");
    if (cached) return cached;

    const response = await api.get("/trading/portfolio");
    setCachedData("portfolio", response.data);
    return response.data;
  },

  getHistory: async (params?: {
    limit?: number;
    symbol?: string;
    side?: string;
    status?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.symbol) queryParams.append("symbol", params.symbol);
    if (params?.side) queryParams.append("side", params.side);
    if (params?.status) queryParams.append("status", params.status);

    const cacheKey = `history-${queryParams.toString()}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    const response = await api.get(
      `/trading/history?${queryParams.toString()}`
    );
    setCachedData(cacheKey, response.data);
    return response.data;
  },

  getBalance: async () => {
    const cached = getCachedData("balance");
    if (cached) return cached;

    const response = await api.get("/trading/balance");
    setCachedData("balance", response.data);
    return response.data;
  },

  getTrade: async (orderId: string) => {
    const cacheKey = `trade-${orderId}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    const response = await api.get(`/trading/trade/${orderId}`);
    setCachedData(cacheKey, response.data);
    return response.data;
  },

  getStats: async () => {
    const cached = getCachedData("trading-stats");
    if (cached) return cached;

    const response = await api.get("/trading/stats");
    setCachedData("trading-stats", response.data);
    return response.data;
  },
};

// ==================== ANALYSIS APIs ====================
export const analysisApi = {
  trigger: async (coin: string) => {
    const response = await api.post("/analysis/trigger", { coin });
    return response.data;
  },
};

// ==================== BLOCKCHAIN APIs ====================
export const blockchainApi = {
  getStatus: async () => {
    const response = await api.get("/blockchain/status");
    return response.data;
  },

  getInfo: async () => {
    const cached = getCachedData("blockchain-info");
    if (cached) return cached;

    const response = await api.get("/blockchain/info");
    setCachedData("blockchain-info", response.data);
    return response.data;
  },

  getAnalytics: async () => {
    const response = await api.get("/blockchain/analytics");
    return response.data;
  },

  retryCache: async () => {
    const response = await api.post("/blockchain/retry-cache");
    return response.data;
  },

  submitSignal: async (signal: {
    coin: string;
    action: string;
    confidence: number;
    entryPoint: number;
    stopLoss: number;
    takeProfit: number;
    reasoning?: string;
  }) => {
    const response = await api.post("/blockchain/submit-signal", signal);
    return response.data;
  },

  getSignals: async (limit: number = 10) => {
    const response = await api.get(`/blockchain/signals?limit=${limit}`);
    return response.data;
  },

  getMySignals: async () => {
    const response = await api.get("/blockchain/my-signals");
    return response.data;
  },

  getSignalById: async (id: string) => {
    const response = await api.get(`/blockchain/signal/${id}`);
    return response.data;
  },

  executeTrade: async (trade: {
    symbol: string;
    side: string;
    amount: number;
    price?: number;
  }) => {
    const response = await api.post("/blockchain/execute-trade", trade);
    return response.data;
  },

  getTrades: async (address?: string) => {
    const url = address
      ? `/blockchain/trades?address=${address}`
      : "/blockchain/trades";
    const response = await api.get(url);
    return response.data;
  },

  getTradeById: async (id: string) => {
    const response = await api.get(`/blockchain/trade/${id}`);
    return response.data;
  },

  getUserVolume: async (address?: string) => {
    const url = address
      ? `/blockchain/volume/${address}`
      : "/blockchain/volume";
    const response = await api.get(url);
    return response.data;
  },
};

// ==================== DAO APIs ====================
export const daoApi = {
  createProposal: async (signalId: string, description: string) => {
    const response = await api.post("/dao/proposal", {
      signalId,
      description,
    });
    return response.data;
  },

  getProposal: async (proposalId: string) => {
    const response = await api.get(`/dao/proposal/${proposalId}`);
    return response.data;
  },

  vote: async (proposalId: string, support: boolean) => {
    const response = await api.post("/dao/vote", {
      proposalId,
      support,
    });
    return response.data;
  },

  getVotingPower: async (address?: string) => {
    const url = address ? `/dao/voting-power/${address}` : "/dao/voting-power";
    const response = await api.get(url);
    return response.data;
  },
};

// ==================== REWARDS APIs ====================
export const rewardsApi = {
  distribute: async (userAddress: string, amount: number, reason?: string) => {
    const response = await api.post("/rewards/distribute", {
      userAddress,
      amount,
      reason,
    });
    return response.data;
  },

  bulkDistribute: async (
    recipients: Array<{ address: string; amount: number; reason?: string }>
  ) => {
    const response = await api.post("/rewards/bulk-distribute", {
      recipients,
    });
    return response.data;
  },

  getBalance: async (address?: string) => {
    const url = address ? `/rewards/balance/${address}` : "/rewards/balance";
    const response = await api.get(url);
    return response.data;
  },
};

// Clear cache function
export const clearCache = () => {
  cache.clear();
};

export default api;
