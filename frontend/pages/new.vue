<template>
  <div class="new-post-container">
    <h1>新しい投稿をする</h1>
    <p>
    <NuxtLink to="/timeline">← 投稿一覧に戻る</NuxtLink> 
</p>

    <form @submit.prevent="submitPost">
      
      <div v-if="!isLoggedIn && isAuthReady" class="warning-box">
        投稿するにはログインが必要です。
        <NuxtLink to="/auth">ログイン/登録はこちら</NuxtLink>
      </div>

      <div class="form-group">
        <label for="title">タイトル</label>
        <input type="text" id="title" v-model="title" required :disabled="!isLoggedIn || isSubmitting">
      </div>
      <div class="form-group">
        <label for="body">本文</label>
        <textarea id="body" v-model="body" rows="6" required :disabled="!isLoggedIn || isSubmitting"></textarea>
      </div>
      
      <button type="submit" :disabled="!isLoggedIn || isSubmitting">
        {{ isSubmitting ? '投稿中...' : '投稿する' }}
      </button>
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
    max-width: 600px;
    margin: 40px auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #333;
}

.form-group input[type="text"],
.form-group textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box; 
    font-size: 16px;
}

button[type="submit"] {
    padding: 10px 20px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
}

button[type="submit"]:hover:not(:disabled) {
    background-color: #45a049;
}

button[type="submit"]:disabled {
    background-color: #aaa;
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