class AdManager {
  constructor() {
    this.isInitialized = false;
  }

  async initialize(provider) {
    this.isInitialized = true;
    return true;
  }

  async showRewardedAd() {
    // No-op; return false to let fallback run
    return false;
  }
}

window.AdManager = AdManager;

