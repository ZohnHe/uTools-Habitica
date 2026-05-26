<template>
  <div class="status-bar">
    <el-progress :text-inside="true" :stroke-width="20" :percentage="hpPercent" status="exception" :format="() => `${Math.floor(profile.HP)} HP`" />
    <el-progress :text-inside="true" :stroke-width="20" :percentage="expPercent" status="warning" :format="() => `${Math.floor(profile.EXP)} EXP`" />
    <el-progress :text-inside="true" :stroke-width="20" :percentage="mpPercent" :format="() => `${Math.floor(profile.MP)} MP`" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ profile: { type: Object, required: true } })
const hpPercent = computed(() => props.profile.HP <= 0 ? 0 : Math.min((props.profile.HP / 50) * 100, 100))
const expPercent = computed(() => props.profile.maxEXP <= 0 ? 0 : Math.min((props.profile.EXP / props.profile.maxEXP) * 100, 100))
const mpPercent = computed(() => props.profile.maxMP <= 0 ? 0 : Math.min((props.profile.MP / props.profile.maxMP) * 100, 100))
</script>

<style scoped>
.status-bar {
  display: flex;
  gap: 8px;
  padding: 8px 16px;
  background-color: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
}
.status-bar .el-progress {
  flex: 1;
}
</style>
