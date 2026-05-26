<template>
  <div class="skill-panel">
    <el-row :gutter="10" justify="space-around">
      <!-- Level 11 skills -->
      <el-col :xs="5" :sm="5" :md="4" :lg="3" :xl="2" v-if="profile.level >= 11">
        <el-tooltip
          v-if="profile.userClass === 'warrior'"
          content="对Boss造成额外伤害"
          placement="bottom"
        >
          <el-card shadow="hover" class="clickable" @click="castSkill('smash','致命一击')">
            <div class="skill-icon-placeholder">致命一击</div>
            <div class="skill-text"><span>10 MP</span></div>
          </el-card>
        </el-tooltip>
        <el-tooltip
          v-if="profile.userClass === 'wizard'"
          content="获得经验值并对Boss造成伤害"
          placement="bottom"
        >
          <el-card shadow="hover" class="clickable" @click="showSkillTask('fireball','火焰爆轰')">
            <div class="skill-icon-placeholder">火焰爆轰</div>
            <div class="skill-text"><span>10 MP</span></div>
          </el-card>
        </el-tooltip>
        <el-tooltip
          v-if="profile.userClass === 'rogue'"
          content="获得金币"
          placement="bottom"
        >
          <el-card shadow="hover" class="clickable" @click="showSkillTask('pickPocket','飞龙探云手')">
            <div class="skill-icon-placeholder">飞龙探云手</div>
            <div class="skill-text"><span>10 MP</span></div>
          </el-card>
        </el-tooltip>
        <el-tooltip
          v-if="profile.userClass === 'healer'"
          content="恢复自身生命值"
          placement="bottom"
        >
          <el-card shadow="hover" class="clickable" @click="castSkill('heal','治愈之光')">
            <div class="skill-icon-placeholder">治愈之光</div>
            <div class="skill-text"><span>15 MP</span></div>
          </el-card>
        </el-tooltip>
      </el-col>

      <!-- Level 12 skills -->
      <el-col :xs="5" :sm="5" :md="4" :lg="3" :xl="2" v-if="profile.level >= 12">
        <el-tooltip
          v-if="profile.userClass === 'warrior'"
          content="获得体质增益魔法"
          placement="bottom"
        >
          <el-card shadow="hover" class="clickable" @click="castSkill('defensiveStance','防御姿态')">
            <div class="skill-icon-placeholder">防御姿态</div>
            <div class="skill-text"><span>25 MP</span></div>
          </el-card>
        </el-tooltip>
        <el-tooltip
          v-if="profile.userClass === 'wizard'"
          content="为其它队员恢复魔法值"
          placement="bottom"
        >
          <el-card shadow="hover" class="clickable" @click="castSkill('mpheal','澎湃灵泉')">
            <div class="skill-icon-placeholder">澎湃灵泉</div>
            <div class="skill-text"><span>30 MP</span></div>
          </el-card>
        </el-tooltip>
        <el-tooltip
          v-if="profile.userClass === 'rogue'"
          content="获得金币和经验值"
          placement="bottom"
        >
          <el-card shadow="hover" class="clickable" @click="showSkillTask('backStab','背刺')">
            <div class="skill-icon-placeholder">背刺</div>
            <div class="skill-text"><span>15 MP</span></div>
          </el-card>
        </el-tooltip>
        <el-tooltip
          v-if="profile.userClass === 'healer'"
          content="使任务价值提高"
          placement="bottom"
        >
          <el-card shadow="hover" class="clickable" @click="castSkill('protectAura','目眩神迷')">
            <div class="skill-icon-placeholder">目眩神迷</div>
            <div class="skill-text"><span>15 MP</span></div>
          </el-card>
        </el-tooltip>
      </el-col>

      <!-- Level 13 skills -->
      <el-col :xs="5" :sm="5" :md="4" :lg="3" :xl="2" v-if="profile.level >= 13">
        <el-tooltip
          v-if="profile.userClass === 'warrior'"
          content="为队伍提供力量增益魔法"
          placement="bottom"
        >
          <el-card shadow="hover" class="clickable" @click="castSkill('valorousPresence','悍勇现身')">
            <div class="skill-icon-placeholder">悍勇现身</div>
            <div class="skill-text"><span>20 MP</span></div>
          </el-card>
        </el-tooltip>
        <el-tooltip
          v-if="profile.userClass === 'wizard'"
          content="为队伍提供智力增益魔法"
          placement="bottom"
        >
          <el-card shadow="hover" class="clickable" @click="castSkill('earth','地震')">
            <div class="skill-icon-placeholder">地震</div>
            <div class="skill-text"><span>35 MP</span></div>
          </el-card>
        </el-tooltip>
        <el-tooltip
          v-if="profile.userClass === 'rogue'"
          content="为队伍提供感知增益魔法"
          placement="bottom"
        >
          <el-card shadow="hover" class="clickable" @click="castSkill('toolsOfTrade','行业工具')">
            <div class="skill-icon-placeholder">行业工具</div>
            <div class="skill-text"><span>25 MP</span></div>
          </el-card>
        </el-tooltip>
        <el-tooltip
          v-if="profile.userClass === 'healer'"
          content="为队伍提供体质增益魔法"
          placement="bottom"
        >
          <el-card shadow="hover" class="clickable" @click="castSkill('brightness','灵光护佑')">
            <div class="skill-icon-placeholder">灵光护佑</div>
            <div class="skill-text"><span>30 MP</span></div>
          </el-card>
        </el-tooltip>
      </el-col>

      <!-- Level 14 skills -->
      <el-col :xs="5" :sm="5" :md="4" :lg="3" :xl="2" v-if="profile.level >= 14">
        <el-tooltip
          v-if="profile.userClass === 'warrior'"
          content="为队伍提供体质增益魔法"
          placement="bottom"
        >
          <el-card shadow="hover" class="clickable" @click="castSkill('intimidate','威慑凝视')">
            <div class="skill-icon-placeholder">威慑凝视</div>
            <div class="skill-text"><span>15 MP</span></div>
          </el-card>
        </el-tooltip>
        <el-tooltip
          v-if="profile.userClass === 'wizard'"
          content="当天未完成的每日任务的连击数不归零"
          placement="bottom"
        >
          <el-card shadow="hover" class="clickable" @click="castSkill('frost','极寒霜冻')">
            <div class="skill-icon-placeholder">极寒霜冻</div>
            <div class="skill-text"><span>40 MP</span></div>
          </el-card>
        </el-tooltip>
        <el-tooltip
          v-if="profile.userClass === 'rogue'"
          content="一些未完成的每日任务不造成伤害"
          placement="bottom"
        >
          <el-card shadow="hover" class="clickable" @click="castSkill('stealth','潜行')">
            <div class="skill-icon-placeholder">潜行</div>
            <div class="skill-text"><span>45 MP</span></div>
          </el-card>
        </el-tooltip>
        <el-tooltip
          v-if="profile.userClass === 'healer'"
          content="为队伍全体成员恢复生命值"
          placement="bottom"
        >
          <el-card shadow="hover" class="clickable" @click="castSkill('healAll','祝福')">
            <div class="skill-icon-placeholder">祝福</div>
            <div class="skill-text"><span>25 MP</span></div>
          </el-card>
        </el-tooltip>
      </el-col>
    </el-row>

    <el-divider content-position="center">其他</el-divider>
    <el-row :gutter="10" justify="space-around">
      <el-col :xs="5" :sm="5" :md="4" :lg="3" :xl="2">
        <el-tooltip content="恢复15点生命值" placement="bottom">
          <el-card shadow="hover" class="clickable" @click="buyHealth">
            <div class="skill-icon-placeholder">生命药水</div>
            <div class="skill-text">
              <span>25 GP</span>
            </div>
          </el-card>
        </el-tooltip>
      </el-col>

      <el-col :xs="5" :sm="5" :md="4" :lg="3" :xl="2" v-if="!profile.sleep">
        <el-tooltip content="暂停伤害" placement="bottom">
          <el-card shadow="hover" class="clickable" @click="toggleSleep">
            <div class="skill-icon-placeholder">在酒馆休息</div>
            <div class="skill-text"><span class="selected">在酒馆休息</span></div>
          </el-card>
        </el-tooltip>
      </el-col>

      <el-col :xs="5" :sm="5" :md="4" :lg="3" :xl="2" v-else>
        <el-tooltip content="解除暂停" placement="bottom">
          <el-card shadow="hover" class="clickable" @click="toggleSleep">
            <div class="skill-icon-placeholder">从酒馆离开</div>
            <div class="skill-text"><span class="selected">从酒馆离开</span></div>
          </el-card>
        </el-tooltip>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { inject } from 'vue'

const user = inject('user')
const party = inject('party')

const profile = user.profile

function castSkill(key, name) {
  party.castSkill(key, name)
}

function showSkillTask(key, name) {
  party.showSkillTask(key, name)
}

function buyHealth() {
  party.buyPotion()
}

function toggleSleep() {
  party.toggleSleep(!profile.sleep).then(() => {
    profile.sleep = !profile.sleep
  })
}
</script>

<style scoped>
.skill-panel {
  padding: 8px;
}
.clickable {
  cursor: pointer;
  text-align: center;
}
.skill-icon-placeholder {
  font-size: 12px;
  color: var(--text-primary);
  margin: 4px 0;
}
.skill-text {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}
.selected {
  color: var(--hb-primary);
}
</style>
