<template>
  <div class="new-post-container">
    <form @submit.prevent="submitPost">
      <button type="button" class="close-btn" @click="router.push('/timeline')" aria-label="投稿一覧に戻る">
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
          <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
        </svg>
      </button>

      <div v-if="!isLoggedIn && isAuthReady" class="warning-box">
        投稿するにはログインが必要です。
        <NuxtLink to="/auth">ログイン/登録はこちら</NuxtLink>
      </div>

      <!-- テキスト入力エリア -->
      <div class="body-wrapper" style="position: relative;">
        <textarea id="body" class="sticky-note" v-model="body" required
          :disabled="!isLoggedIn || isSubmitting"></textarea>

        <!-- 共有ボタン（現状は機能なし） -->
        <button type="button" class="share-btn" aria-label="共有" @click="onShareClick">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
            <path
              d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h120v80H240v400h480v-400H600v-80h120q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm200-240v-447l-64 64-56-57 160-160 160 160-56 57-64-64v447h-80Z" />
          </svg>
        </button>
      </div>

      <div class="submit-wrapper">
        <button type="submit" class="submit-btn" :disabled="!isLoggedIn || isSubmitting">
          {{ isSubmitting ? '投稿中...' : '投稿' }}
        </button>
      </div>
    </form>

    <p v-if="successMessage" class="message success">{{ successMessage }}</p>
    <p v-if="errorMessage" class="message error">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
// Step 53 で修正した <script setup> の中身を全て貼り付けます。
import { useAuthUser } from '../composables/useAuthUser';
import { ref } from 'vue'; // refのインポートを明記

const router = useRouter();

// Firestore関連のインポート
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// 認証状態を取得
const { uid, isLoggedIn, isAuthReady } = useAuthUser();

const { $firestore } = useNuxtApp();

const title = ref('');
const body = ref('');
const isSubmitting = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const onShareClick = () => {
  console.log('共有ボタンが押されました');
};

const submitPost = async () => {
  // 認証状態のチェック
  if (!isLoggedIn.value || !uid.value) {
    errorMessage.value = '投稿するにはログインが必要です。';
    router.push('/auth');
    return;
  }

  if (isSubmitting.value) return;

  isSubmitting.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    const postsCollection = collection($firestore, 'posts');

    await addDoc(postsCollection, {
      title: title.value,
      body: body.value,
      // ログインユーザーのUIDを保存
      userId: uid.value,
      createdAt: serverTimestamp(),
    });

    successMessage.value = '投稿が完了しました！';
    title.value = '';
    body.value = '';
    // 投稿一覧へリダイレクト（任意）
    // router.push('/');

  } catch (error) {
    console.error("投稿エラー:", error);
    errorMessage.value = '投稿エラー: ' + error.message;
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* 投稿フォームのコンテナ */
.new-post-container {
  position: relative;
  max-width: 420px;
  margin: 40px auto;
  padding: 56px 0 20px;
  background-color: transparent;
  /* コンテナは透明 */
}

.form {
  margin-bottom: 15px;
}

.form input[type="text"],
.form textarea {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 16px;
}

.sticky-note {
  display: block;
  margin: 0 auto;
  /* 中央に配置 */
  width: min(80vw, 300px);
  /* 画面幅に応じて最大300px */
  aspect-ratio: 1 / 1;
  /* 正方形を保つ */
  background-color: #FBF8EF;
  border: 1px solid #FFB433;
  padding: 18px;
  border-radius: 6px;
  resize: none;
  font-size: 16px;
  line-height: 1.4;
  box-sizing: border-box;
  font-family: inherit;
  z-index: 10;
}

.sticky-note:focus {
  outline: none;
  box-shadow: none;
}

.body-wrapper {
  position: relative;
  padding-bottom: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* 横中央に揃える */
  gap: 12px;
}

.close-btn {
  position: absolute;
  right: 18px;
  top: 18px;
  background: transparent;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  z-index: 60;
}

.share-btn {
  background-color: transparent;
  border: none;
  position: absolute;
  right: 18px;
  /* 右寄せ */
  bottom: 8px;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  z-index: 40;
}

.submit-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 18px;
}

.submit-btn {
  min-width: 120px;
  padding: 10px 22px;
  background: #FBF8EF;
  color: #000000;
  border: 10px solid #B4EBE6;
  border-radius: 6px;
  cursor: pointer;
}

.submit-btn:disabled {
  background: #aaa;
  cursor: not-allowed;
}

.message.success {
  color: green;
  font-weight: bold;
  margin-top: 15px;
}

.message.error {
  color: red;
  font-weight: bold;
  margin-top: 15px;
}

/* 警告ボックスのスタイル (Step 53で追加) */
.warning-box {
  padding: 10px;
  background-color: #ffe0b2;
  color: #e65100;
  border-radius: 4px;
  margin-bottom: 15px;
}

.warning-box a {
  color: #e65100;
  font-weight: bold;
  text-decoration: none;
}
</style>

<style>
/* ページ全体の背景色 */
html,
body,
#__nuxt,
#app {
  background-color: #FBF8EF;
  min-height: 100vh;
}
</style>