import { LimitsStorage } from "@/utils/storage";

export default defineBackground(() => {
  console.log("Chess Limiter background script started", {
    id: browser.runtime.id,
  });

  // Listen for declarativeNetRequest to intercept "play" requests
  browser.declarativeNetRequest.onRuleMatchedDebug?.addListener((details) => {
    console.log("Rule matched:", details);
  });

  // Set up dynamic rules to block chess game requests when limits are exceeded
  async function updateBlockingRules() {
    // First check if stats should be auto-reset
    const wasReset = await LimitsStorage.checkAndResetIfExpired();
    if (wasReset) {
      console.log("Stats auto-reset after 12 hours");
    }

    const { exceeded, reasons } = await LimitsStorage.checkLimitsExceeded();

    if (exceeded) {
      // Set the limitExceededAt timestamp if not already set
      const stats = await LimitsStorage.getStats();
      if (!stats.limitExceededAt) {
        await LimitsStorage.updateStats({
          limitExceededAt: Date.now(),
        });
      }
      // Enable blocking rules
      await browser.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [1, 2], // Remove any existing rules
        addRules: [
          {
            id: 1,
            priority: 1,
            action: {
              type: "redirect" as chrome.declarativeNetRequest.RuleActionType,
              redirect: {
                url: browser.runtime.getURL("blocked.html"),
              },
            },
            condition: {
              urlFilter: "*://www.chess.com/service/matcher/seeks/chess",
              resourceTypes: [
                "main_frame" as chrome.declarativeNetRequest.ResourceType,
              ],
            },
          },
          {
            id: 2,
            priority: 1,
            action: {
              type: "redirect" as chrome.declarativeNetRequest.RuleActionType,
              redirect: {
                url: browser.runtime.getURL("blocked.html"),
              },
            },
            condition: {
              urlFilter: "*://lichess.org/*",
              resourceTypes: [
                "main_frame" as chrome.declarativeNetRequest.ResourceType,
              ],
            },
          },
        ],
      });

      console.log("Blocking enabled. Reasons:", reasons);
    } else {
      // Remove blocking rules
      await browser.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [1, 2],
      });

      console.log("Blocking disabled");
    }
  }

  // Check limits on startup
  updateBlockingRules();

  // Watch for changes to limits and stats
  LimitsStorage.watchLimits(() => {
    console.log("Limits updated");
    updateBlockingRules();
  });

  LimitsStorage.watchStats(() => {
    console.log("Stats updated");
    updateBlockingRules();
  });

  // Initialize session tracking
  async function initializeSession() {
    const stats = await LimitsStorage.getStats();
    if (!stats.sessionStartTime) {
      await LimitsStorage.updateStats({
        sessionStartTime: Date.now(),
      });
    }
  }

  initializeSession();

  // Listen for messages from content scripts (for game result tracking)
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "gameResult") {
      handleGameResult(message.result);
      sendResponse({ success: true });
    }
    return true;
  });

  async function handleGameResult(result: "win" | "loss" | "draw") {
    const stats = await LimitsStorage.getStats();

    stats.currentPlayStreak += 1;
    stats.lastGamePlayedAt = Date.now(); // Update last game played timestamp

    if (result === "win") {
      stats.currentWinStreak += 1;
      stats.currentLoseStreak = 0;
    } else if (result === "loss") {
      stats.currentLoseStreak += 1;
      stats.currentWinStreak = 0;
    } else {
      // Draw doesn't break streaks but counts as a game played
      stats.currentWinStreak = 0;
      stats.currentLoseStreak = 0;
    }

    stats.lastGameResult = result;

    await LimitsStorage.setStats(stats);

    // Check if limits are now exceeded
    updateBlockingRules();
  }
});
