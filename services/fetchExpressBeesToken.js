const axios = require("axios");

// Token cache for Xpressbees to avoid multiple API calls
let xpressbeesTokenCache = null;
let xpressbeesTokenExpiry = null;
const TOKEN_CACHE_DURATION = 50 * 60 * 1000; // 50 minutes in milliseconds

const fetchExpressBeesToken = async (retryCount = 0) => {
  try {
    // Check if we have a valid cached token
    const now = Date.now();
    if (xpressbeesTokenCache && xpressbeesTokenExpiry && now < xpressbeesTokenExpiry) {
      console.log("♻️ Using cached Xpressbees token (expires in", Math.round((xpressbeesTokenExpiry - now) / 60000), "minutes)");
      return xpressbeesTokenCache;
    }

    // Fetch new token if cache is expired or missing
    console.log(`🔄 [Attempt ${retryCount + 1}] Fetching new Xpressbees token (cache expired or missing)`);
    
    const response = await axios.post(process.env.EXPRESSBEES_API_URL, {
      email: process.env.EXPRESSBEES_EMAIL,
      password: process.env.EXPRESSBEES_PASSWORD
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Assuming the token is in response.data.data
    const token = response.data.data;
    
    if (token) {
      // Cache the token with expiry
      xpressbeesTokenCache = token;
      xpressbeesTokenExpiry = now + TOKEN_CACHE_DURATION;
      console.log("✅ New Xpressbees token cached, expires in 50 minutes");
    } else {
      console.log("⚠️ No token received from ExpressBees API");
    }
    
    return token;
  } catch (error) {
    console.error(`❌ Error fetching ExpressBees token (Attempt ${retryCount + 1}):`, error.message);
    
    // If it's an authentication error (401) and we haven't retried yet, try again
    if (error.response?.status === 401 && retryCount < 1) {
      console.log("🔐 Authentication failed (401), retrying in 2 seconds...");
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      return await fetchExpressBeesToken(retryCount + 1);
    }
    
    // If we have a cached token and it's not expired, try to use it even on error
    if (xpressbeesTokenCache && xpressbeesTokenExpiry && Date.now() < xpressbeesTokenExpiry) {
      console.log("🔄 API call failed, but using cached token as fallback");
      return xpressbeesTokenCache;
    }
    
    return null;
  }
};

// Function to get token with automatic refresh if cached token fails
const getValidToken = async () => {
  try {
    // First try to use cached token if available
    if (xpressbeesTokenCache && xpressbeesTokenExpiry && Date.now() < xpressbeesTokenExpiry) {
      console.log("♻️ Using cached token first...");
      return xpressbeesTokenCache;
    }
    
    // If no cached token, get fresh one
    console.log("🔄 No cached token, getting fresh token...");
    return await fetchExpressBeesToken();
    
  } catch (error) {
    console.log("❌ Error in getValidToken, getting fresh token...");
    return await fetchExpressBeesToken();
  }
};

// Function to refresh token when current one fails (like when changed in Postman)
const refreshTokenOnFailure = async (failedToken) => {
  try {
    console.log("🔄 Cached token failed, getting fresh token and updating cache...");
    
    // Clear the failed token from cache
    xpressbeesTokenCache = null;
    xpressbeesTokenExpiry = null;
    
    // Get fresh token
    const freshToken = await fetchExpressBeesToken();
    
    if (freshToken) {
      console.log("✅ Fresh token obtained and cache updated");
      return freshToken;
    } else {
      console.log("❌ Failed to get fresh token");
      return null;
    }
    
  } catch (error) {
    console.error("❌ Error refreshing token:", error.message);
    return null;
  }
};

// Function to manually clear the token cache if needed
function clearXpressbeesTokenCache() {
  xpressbeesTokenCache = null;
  xpressbeesTokenExpiry = null;
  console.log("🧹 Xpressbees token cache cleared manually");
}

// Function to get cache status for debugging
function getXpressbeesTokenCacheStatus() {
  if (!xpressbeesTokenCache) {
    return { hasToken: false, expiresIn: null };
  }
  
  const now = Date.now();
  const expiresIn = xpressbeesTokenExpiry ? Math.round((xpressbeesTokenExpiry - now) / 60000) : null;
  
  return {
    hasToken: true,
    expiresIn: expiresIn > 0 ? expiresIn : 'expired',
    tokenPreview: xpressbeesTokenCache.substring(0, 10) + '...'
  };
}

// Function to force refresh token (useful for testing or when you know token is invalid)
async function forceRefreshXpressbeesToken() {
  console.log("🔄 Force refreshing Xpressbees token...");
  xpressbeesTokenCache = null;
  xpressbeesTokenExpiry = null;
  return await fetchExpressBeesToken();
}

module.exports = fetchExpressBeesToken;
module.exports.getValidToken = getValidToken;
module.exports.refreshTokenOnFailure = refreshTokenOnFailure;
module.exports.clearXpressbeesTokenCache = clearXpressbeesTokenCache;
module.exports.getXpressbeesTokenCacheStatus = getXpressbeesTokenCacheStatus;
module.exports.forceRefreshXpressbeesToken = forceRefreshXpressbeesToken;
