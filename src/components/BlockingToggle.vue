<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { LimitsStorage } from '@/utils/storage';
import type { GameStats } from '@/types/limits';

const stats = ref<GameStats | null>(null);
const limitsExceeded = ref(false);

const blockingEnabled = computed(() => stats.value?.blockingEnabled ?? false);
const toggleDisabled = computed(() => limitsExceeded.value);

onMounted(async () => {
  stats.value = await LimitsStorage.getStats();
  const { exceeded } = await LimitsStorage.checkLimitsExceeded();
  limitsExceeded.value = exceeded;
});

async function toggleBlocking() {
  if (!stats.value || toggleDisabled.value) return;

  const newValue = !stats.value.blockingEnabled;
  stats.value.blockingEnabled = newValue;
  await LimitsStorage.updateStats({ blockingEnabled: newValue });
}
</script>

<template>
  <div v-if="stats" class="blocking-toggle">
    <div class="toggle-content">
      <div class="toggle-text">
        <span class="toggle-label">Block Chess Sites</span>
        <span v-if="limitsExceeded" class="toggle-hint">Limits exceeded - blocking enforced</span>
        <span v-else class="toggle-hint">Manually block access to chess sites</span>
      </div>
      <button
        class="toggle-switch"
        :class="{ active: blockingEnabled, disabled: toggleDisabled }"
        :disabled="toggleDisabled"
        @click="toggleBlocking"
        :aria-pressed="blockingEnabled"
      >
        <span class="toggle-slider"></span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.blocking-toggle {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.toggle-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toggle-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toggle-label {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.toggle-hint {
  font-size: 12px;
  color: #666;
}

.toggle-switch {
  position: relative;
  width: 48px;
  height: 26px;
  background: #ccc;
  border: none;
  border-radius: 13px;
  cursor: pointer;
  transition: background-color 0.2s;
  padding: 0;
}

.toggle-switch:hover:not(.disabled) {
  background: #bbb;
}

.toggle-switch.active {
  background: #dc3545;
}

.toggle-switch.active:hover:not(.disabled) {
  background: #c82333;
}

.toggle-switch.disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.toggle-slider {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle-switch.active .toggle-slider {
  transform: translateX(22px);
}
</style>
