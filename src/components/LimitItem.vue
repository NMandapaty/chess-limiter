<script lang="ts" setup>
import { ref, watch } from 'vue';
import type { LimitConfig } from '@/types/limits';

const props = defineProps<{
  title: string;
  description: string;
  modelValue: LimitConfig;
  unit?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: LimitConfig];
}>();

const localEnabled = ref(props.modelValue.enabled);
const localValue = ref(props.modelValue.value);

watch([localEnabled, localValue], () => {
  // Ensure value is never negative
  const sanitizedValue = Math.max(0, localValue.value);

  // Only emit if the value actually changed
  if (
    localEnabled.value !== props.modelValue.enabled ||
    sanitizedValue !== props.modelValue.value
  ) {
    emit('update:modelValue', {
      enabled: localEnabled.value,
      value: sanitizedValue,
    });
  }

  // Update localValue if it was negative
  if (localValue.value < 0) {
    localValue.value = sanitizedValue;
  }
});
</script>

<template>
  <div class="limit-item">
    <div class="limit-header">
      <div class="limit-info">
        <h3>{{ title }}</h3>
        <p>{{ description }}</p>
      </div>
      <label class="toggle">
        <input type="checkbox" v-model="localEnabled" />
        <span class="toggle-slider"></span>
      </label>
    </div>
    <div v-if="localEnabled" class="limit-control">
      <input
        type="number"
        v-model.number="localValue"
        :step="1"
      />
      <span class="unit">{{ unit ?? 'games' }}</span>
    </div>
  </div>
</template>

<style scoped>
.limit-item {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.limit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.limit-info {
  flex: 1;
}

.limit-info h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.limit-info p {
  margin: 0;
  font-size: 13px;
  color: #666;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
  flex-shrink: 0;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle input:checked + .toggle-slider {
  background-color: #4CAF50;
}

.toggle input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

.limit-control {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.limit-control input[type="number"] {
  width: 80px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.limit-control .unit {
  font-size: 14px;
  color: #666;
}
</style>
