<template>
  <div class="party-view">
    <template v-if="user.profile.partyId">
      <el-timeline>
        <el-timeline-item placement="top" v-if="party.partyQuest.key" timestamp="队伍副本">
          <el-card>
            <el-row id="questTitle">
              <el-col :span="4">
                <div>
                  <el-tag v-if="party.partyQuest.active" type="danger" size="small">进行中</el-tag>
                  <el-tag v-else type="success" size="small">邀请中</el-tag>
                </div>
              </el-col>
              <el-col :span="20"><h3>{{ party.partyQuest.key }}</h3></el-col>
            </el-row>
            <el-divider content-position="right">加入人数：{{ party.partyQuest.joinMembers }} / {{ party.partyMembers }}</el-divider>
            <div v-if="party.partyQuest.active">
              <p>{{ party.partyQuest.schedule }}</p>
              <p>{{ party.partyQuest.gain }}</p>
            </div>
            <div>
              <el-button size="small" type="primary" class="full-width" v-if="!party.partyQuest.active && !party.partyQuest.isAccept" @click="joinInQuest">加入副本</el-button>
              <el-button size="small" class="full-width" v-if="party.partyQuest.isAccept" @click="quitOutQuest">已加入</el-button>
              <el-button size="small" type="danger" class="full-width" id="startBtn" v-if="party.partyQuest.canStartQuest" @click="startQuest">开始副本</el-button>
            </div>
          </el-card>
        </el-timeline-item>
        <el-timeline-item
          v-for="item in tasks.showTaskList"
          :key="item.id"
          :timestamp="item.user + ' （' + item.timestamp + '）'"
          placement="top"
        >
          <el-card>
            <div class="task-title" :class="{ 'system-message': item.user === '系统' }" v-html="markedText(item.text)" />
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </template>
    <template v-else>
      <el-card>
        <h3>加入一个队伍来一起玩Habitica吧！</h3>
        <p>与朋友们一起或是只有你自己来享受惊人的副本。与怪物战斗，创造挑战，并帮助您通过队伍负起自己的责任。</p>
        <el-divider />
        <el-button size="small" type="primary" class="full-width" @click="joinInQuest">加入队伍</el-button>
      </el-card>
    </template>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import { markedText } from '../utils/helpers.js'

const user = inject('user')
const party = inject('party')
const tasks = inject('tasks')

function joinInQuest() {
  if (!user.profile.partyId) {
    window.utools ? window.utools.shellOpenExternal('https://habitica.com/party') : window.open('https://habitica.com/party')
    return
  }
  party.joinQuest(user.profile.partyId)
}

function quitOutQuest() {
  party.leaveQuest(user.profile.partyId)
}

function startQuest() {
  party.forceStartQuest(user.profile.partyId)
}
</script>

<style scoped>
.party-view {
  padding: 8px;
}
.full-width {
  width: 100%;
}
#questTitle {
  display: flex;
  align-items: center;
}
.task-title :deep(p) {
  margin: 0;
}
.system-message {
  color: var(--text-muted);
}
</style>
