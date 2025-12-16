<template>
  <div class="auth-container">
    <h1>{{ isLogin ? 'ログイン' : '新規登録' }}</h1>
    
    <div class="form-wrapper">
      <form @submit.prevent="authenticate">
        <div class="form-group">
          <label for="email">メールアドレス</label>
          <input type="email" id="email" v-model="email" required>
        </div>
        
        <div class="form-group">
          <label for="password">パスワード</label>
          <input type="password" id="password" v-model="password" required>
        </div>
        
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? '処理中...' : (isLogin ? 'ログイン' : '登録') }}
        </button>
      </form>
      
      <p class="toggle-mode">
        {{ isLogin ? 'アカウントをお持ちでない方へ' : 'すでにアカウントをお持ちの方へ' }}
        <a href="#" @click.prevent="isLogin = !isLogin">
          {{ isLogin ? '新規登録' : 'ログイン' }}はこちら
        </a>
      </p>

      <p v-if="message" :class="{ 'error': isError, 'success': !isError }" class="auth-message">
        {{ message }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,     
} from 'firebase/auth';

const { $auth } = useNuxtApp();
const router = useRouter();

const isLogin = ref(true); 
const email = ref('');
const password = ref('');
const isLoading = ref(false);
const message = ref('');
const isError = ref(false);

const authenticate = async () => {
  isLoading.value = true;
  message.value = '';
  isError.value = false;

  try {
    if (isLogin.value) {
      await signInWithEmailAndPassword($auth, email.value, password.value);
    } else {
      await createUserWithEmailAndPassword($auth, email.value, password.value);
    }

    message.value = isLogin.value ? 'ログインに成功しました！' : '新規登録に成功しました！';
    router.push('/timeline');

  } catch (err) {
    isError.value = true;
    let errorMessage = '認証中にエラーが発生しました。';
    
    switch (err.code) {
      case 'auth/invalid-email':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/email-already-in-use':
      case 'auth/weak-password':
        errorMessage = '認証情報をご確認ください。';
        break;
      default:
        console.error("認証エラー詳細:", err);
        errorMessage = '予期せぬエラーが発生しました。';
    }
    message.value = errorMessage;

  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* スタイルは省略 */
/* ... */
</style>