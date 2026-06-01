import responses from './dostLocalResponses.json';

// Simple hash function for cache keys
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString();
};

class DostLocalEngine {
  constructor() {
    this.patterns = [
      { intent: 'greeting', regex: /^\s*(hi|hello|hey|hey dost|good morning|good evening)\b/i },
      { intent: 'status', regex: /^\s*(how are you|hows it going|whats up|how are things)\b/i },
      { intent: 'capabilities', regex: /^\s*(what can you do|help me|what do you do|who are you)\b/i },
      { intent: 'acknowledgement', regex: /^\s*(thanks|thank you|thx|tysm|awesome thanks)\b/i },
      { intent: 'farewell', regex: /^\s*(bye|goodbye|see you|cya|night|goodnight)\b/i },
      { intent: 'comfort', regex: /\b(tired|sad|depressed|low|exhausted|burnout|overwhelmed|stressed)\b/i }
    ];
  }

  // Pick a random response from the array
  _getRandomResponse(intent) {
    const list = responses[intent];
    if (!list || list.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
  }

  // 1. Try to classify locally (No API needed)
  classifyLocal(message) {
    if (!message || message.trim().length === 0) return null;
    // Don't match if it's a long complex message
    if (message.length > 80) return null;

    const lowerMsg = message.toLowerCase().trim();

    for (const pattern of this.patterns) {
      if (pattern.regex.test(lowerMsg)) {
        const reply = this._getRandomResponse(pattern.intent);
        if (reply) {
          return {
            reply,
            action: null,
            actions: [],
            isLocal: true
          };
        }
      }
    }
    return null;
  }

  // 2. Cache management for backend responses
  getCacheKey(userId, message) {
    return `mithra-ai-cache-${userId}-${hashString(message.toLowerCase().trim())}`;
  }

  getCachedResponse(userId, message) {
    try {
      const key = this.getCacheKey(userId, message);
      const cached = localStorage.getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        const now = Date.now();
        // 4 hours TTL
        if (now - parsed.timestamp < 4 * 60 * 60 * 1000) {
          return parsed.data;
        } else {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.warn("Dost cache read error", e);
    }
    return null;
  }

  cacheResponse(userId, message, responseData) {
    try {
      // Don't cache action responses as they modify state
      if (responseData.action || (responseData.actions && responseData.actions.length > 0)) {
        return;
      }
      
      const key = this.getCacheKey(userId, message);
      localStorage.setItem(key, JSON.stringify({
        timestamp: Date.now(),
        data: responseData
      }));
      
      // Basic eviction if too many cache entries
      this._cleanupCache();
    } catch (e) {
      console.warn("Dost cache write error", e);
    }
  }

  _cleanupCache() {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('mithra-ai-cache-')) {
          keys.push(key);
        }
      }
      // If more than 50 cached items, clear them all to be safe
      if (keys.length > 50) {
        keys.forEach(k => localStorage.removeItem(k));
      }
    } catch (e) {
      // Ignore
    }
  }
}

export const localEngine = new DostLocalEngine();
