<template>
  <div class="login-view">
    <el-form ref="form" :model="userForm" id="loginForm">
      <el-form-item>
        <el-tooltip effect="light" content="打开页面上的 [设定] -> [API/应用程序接口] 即可看到" placement="top-start" :show-after="1000">
          <el-input v-model="userForm.user" maxlength="36" show-word-limit placeholder="用户ID" />
        </el-tooltip>
      </el-form-item>
      <el-form-item>
        <el-tooltip effect="light" content="信息会加密保存在你自己的账号数据里，可随时删除" placement="bottom-start" :show-after="1000">
          <el-input v-model="userForm.key" maxlength="36" show-word-limit placeholder="API令牌" />
        </el-tooltip>
      </el-form-item>
      <el-form-item>
        <el-row>
          <el-col :span="11">
            <el-button class="full-width" @click="onRegistered">注 册</el-button>
          </el-col>
          <el-col :span="2">&nbsp;</el-col>
          <el-col :span="11">
            <el-button type="primary" class="full-width" @click="onLogin">登 录</el-button>
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { inject } from 'vue'

const user = inject('user')
const userForm = user.userForm

function onRegistered() {
  window.utools ? window.utools.shellOpenExternal('https://habitica.com/register') : window.open('https://habitica.com/register')
}

function onLogin() {
  user.login().catch(() => {})
}
</script>

<style scoped>
.login-view {
  background: #271B3D url('/img/stars.png') top repeat-x;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
#loginForm {
  width: 320px;
  padding: 24px;
  background: var(--bg-card);
  border-radius: 8px;
}
.full-width {
  width: 100%;
}
</style>
