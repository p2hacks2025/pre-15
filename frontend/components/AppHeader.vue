<template>
  <header class="app-header">
    <div class="header-content">
      <NuxtLink to="/" class="logo">
        掲示板アプリ
      </NuxtLink>
      
      <nav class="auth-nav">
        <template v-if="isAuthReady">
          
          <div v-if="isLoggedIn" class="user-status">
            <span class="user-info">
              ログイン中: {{ user?.email }}
            </span>
            <button @click="handleLogout" class="btn-logout">
              ログアウト
            </button>
          </div>
          
          <NuxtLink v-else to="/auth" class="btn-login">
            ログイン / 新規登録
          </NuxtLink>

        </template>
        <span v-else>
          認証情報を読み込み中...
        </span>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { useAuthUser } from '../composables/useAuthUser';
import { signOut } from 'firebase/auth'; 

// 認証状態を取得
const { user, isLoggedIn, isAuthReady } = useAuthUser();
const router = useRouter();
const { $auth } = useNuxtApp();

// ログアウト処理
const handleLogout = async () => {
  try {
    await signOut($auth);
    router.push('/');
    alert('ログアウトしました。');
  } catch (e) {
    console.error('ログアウトエラー:', e);
    alert('ログアウト中にエラーが発生しました。');
  }
};
</script>

<style scoped>
.app-header {
  background-color: #333;
  color: white;
  padding: 10px 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.header-content {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.logo {
  color: white;
  text-decoration: none;
  font-size: 1.5em;
  font-weight: bold;
}
.auth-nav {
  display: flex;
  align-items: center;
}
.user-status {
  display: flex;
  align-items: center;
  gap: 15px;
}
.user-info {
  font-size: 0.9em;
  margin-right: 10px;
}
.btn-logout, .btn-login {
  padding: 8px 15px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  font-size: 0.9em;
}
.btn-login {
  background-color: #007bff;
}
</style>