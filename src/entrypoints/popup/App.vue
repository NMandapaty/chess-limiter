<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import LimitItem from '@/components/LimitItem.vue';
import BlockingToggle from '@/components/BlockingToggle.vue';
import { LimitsStorage } from '@/utils/storage';
import type { LimitsState } from '@/types/limits';

const limits = ref<LimitsState | null>(null);

onMounted(async () => {
  limits.value = await LimitsStorage.getLimits();
});

async function updateLimit(key: keyof LimitsState, value: LimitsState[keyof LimitsState]) {
  if (!limits.value) return;

  limits.value[key] = value;
  await LimitsStorage.updateLimit(key, value);
}
</script>

<template>
  <div class="app">
    <header>
      <h1>Chess Limiter</h1>
      <p>Set limits to maintain healthy chess playing habits</p>
    </header>

    <BlockingToggle />

    <div v-if="limits" class="limits-container">
      <LimitItem
        title="Games Won in a Row"
        description="Stop playing after winning this many games consecutively"
        :model-value="limits.gamesWonInARow"
        @update:model-value="updateLimit('gamesWonInARow', $event)"
        unit="wins"
      />

      <LimitItem
        title="Games Lost in a Row"
        description="Stop playing after losing this many games consecutively"
        :model-value="limits.gamesLostInARow"
        @update:model-value="updateLimit('gamesLostInARow', $event)"
        unit="losses"
      />

      <LimitItem
        title="Games Played in a Row"
        description="Stop playing after this many games regardless of outcome"
        :model-value="limits.gamesPlayedInARow"
        @update:model-value="updateLimit('gamesPlayedInARow', $event)"
        unit="games"
      />

      <LimitItem
        title="Time Spent Playing"
        description="Stop playing after spending this much time in a session"
        :model-value="limits.minutesSpentPlaying"
        @update:model-value="updateLimit('minutesSpentPlaying', $event)"
        unit="minutes"
      />
    </div>

    <div v-else class="loading">
      Loading...
    </div>
  </div>
</template>

<style scoped>
.app {
  width: 400px;
  min-height: 500px;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

header {
  margin-bottom: 24px;
}

header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #333;
}

header p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.limits-container {
  display: flex;
  flex-direction: column;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style>
