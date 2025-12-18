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
/* コンテナ全体のレイアウト */
.auth-container {
  /* 背景画像の設定 */
  background-image: url('/images/bgnostar.png'); /* 画像のパス */
  background-size: cover;           /* 画面全体を覆う */
  background-position: center;      /* 中央合わせ */
  background-attachment: fixed;     /* スクロールしても背景は動かない */
  background-repeat: no-repeat;     /* 繰り返し禁止 */

  width: 100%;          /* 画面の横幅いっぱいに固定 */
  min-height: 105vh;
  margin: 0;
  padding: 0;
  overflow-x: hidden;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

h1 {
  color: #2F1000;
  margin-bottom: 24px;
  font-size: 1.8rem;

  transform: translateY(-40px);
}


/* 入力グループの余白 */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  font-size: 1.3rem;
  color: #2F1000;
  text-align: center;
}

/* 入力フィールドの装飾 */
input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 12px;
  border: 1px solid #FFB433;
  border-radius: 6px;
  box-sizing: border-box; /* paddingを含めた幅計算 */
  font-size: 1rem;
  transition: border-color 0.3s;
  text-align: center;
  background-color: #FBF8EF;
}

input:focus {
  outline: none;
  background-color: #B4EBE600;
  border: 1px solid #42b883;
}

/* ボタンのスタイル */
button {
  width: 100%;
  padding: 12px;
  background-color: #80CBC4;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s, opacity 0.3s;
}

button:hover {
  background-color: #B4EBE6;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* 切り替えリンク（新規登録/ログイン） */
.toggle-mode {
  margin-top: 20px;
  text-align: center;
  font-size: 0.9rem;
  color: #666;
}

.toggle-mode a {
  color: #80CBC4;
  text-decoration: none;
  font-weight: bold;
}

.toggle-mode a:hover {
  text-decoration: underline;
}

/* メッセージ（成功・エラー） */
.auth-message {
  margin-top: 16px;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
  font-size: 0.85rem;
}

.auth-message.error {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

.auth-message.success {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}
</style>