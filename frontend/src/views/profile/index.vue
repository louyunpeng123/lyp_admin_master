<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore } from '../../stores/auth'
import { updateProfile, changePassword } from '../../api/auth'

const authStore = useAuthStore()
const activeTab = ref('profile')
const profileLoading = ref(false)
const passwordLoading = ref(false)

const profileFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()

const profileForm = reactive({
  nickname: '',
  email: '',
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const passwordRules: FormRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

const displayName = computed(() => authStore.user?.nickname || authStore.user?.username || '')
const roleName = computed(() => authStore.user?.role?.name || '-')
const lastLogin = computed(() => {
  const time = authStore.user?.lastLoginAt
  return time ? new Date(time).toLocaleString('zh-CN') : '首次登录'
})

onMounted(() => {
  if (authStore.user) {
    profileForm.nickname = authStore.user.nickname
    profileForm.email = authStore.user.email
  }
})

async function saveProfile() {
  profileLoading.value = true
  try {
    const res = await updateProfile({
      nickname: profileForm.nickname,
      email: profileForm.email,
    })
    authStore.user = res.data
    ElMessage.success('资料已保存')
  } finally {
    profileLoading.value = false
  }
}

async function savePassword() {
  const valid = await passwordFormRef.value?.validate().catch(() => false)
  if (!valid) return

  passwordLoading.value = true
  try {
    await changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
    })
    ElMessage.success('密码修改成功')
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } finally {
    passwordLoading.value = false
  }
}
</script>

<template>
  <div class="page">
    <el-row :gutter="20">
      <el-col :xs="24" :md="8">
        <el-card shadow="never">
          <div class="profile-card">
            <el-avatar :size="72">{{ displayName.charAt(0).toUpperCase() }}</el-avatar>
            <h2>{{ displayName }}</h2>
            <p>@{{ authStore.user?.username }}</p>
            <el-tag type="success">{{ roleName }}</el-tag>
            <div class="meta">
              <div><span>邮箱</span>{{ authStore.user?.email }}</div>
              <div><span>上次登录</span>{{ lastLogin }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="16">
        <el-card shadow="never">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本资料" name="profile">
              <el-form ref="profileFormRef" :model="profileForm" label-width="80px" style="max-width: 480px">
                <el-form-item label="昵称">
                  <el-input v-model="profileForm.nickname" />
                </el-form-item>
                <el-form-item label="邮箱">
                  <el-input v-model="profileForm.email" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" :loading="profileLoading" @click="saveProfile">
                    保存资料
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="修改密码" name="password">
              <el-form
                ref="passwordFormRef"
                :model="passwordForm"
                :rules="passwordRules"
                label-width="80px"
                style="max-width: 480px"
              >
                <el-form-item label="原密码" prop="oldPassword">
                  <el-input v-model="passwordForm.oldPassword" type="password" show-password />
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                  <el-input v-model="passwordForm.newPassword" type="password" show-password />
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" :loading="passwordLoading" @click="savePassword">
                    修改密码
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
  text-align: center;
}

.profile-card h2 {
  margin: 8px 0 0;
  font-size: 20px;
}

.profile-card p {
  margin: 0;
  color: #909399;
}

.meta {
  width: 100%;
  margin-top: 16px;
  text-align: left;
}

.meta div {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-top: 1px solid #f0f0f0;
  font-size: 14px;
}

.meta span {
  color: #909399;
}
</style>
