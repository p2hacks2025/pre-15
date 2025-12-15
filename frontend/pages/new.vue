<template>
  <div>
    <h1>新しい投稿をする</h1>
    <p>
      <NuxtLink to="/">← 投稿一覧に戻る</NuxtLink>
    </p>

    <form @submit.prevent="submitPost" class="post-form">
      <div class="form-group">
        <label for="title">タイトル</label>
        <input type="text" id="title" v-model="title" required>
      </div>

      <div class="form-group">
        <label for="body">本文</label>
        <textarea id="body" v-model="body" rows="6" required></textarea>
      </div>

      <button type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? '投稿中...' : '投稿する' }}
      </button>
    </form>
    
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
// Nuxt 3 のコンポーザブルをインポート（useNuxtAppは$firestoreを使うために必要）
const { $firestore } = useNuxtApp();

// Firestoreから必要な関数をインポート
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// フォームの入力値を保持するためのリアクティブな変数
const title = ref('');
const body = ref('');
const isSubmitting = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

// 投稿ボタンが押されたときに実行される関数
const submitPost = async () => {
  // すでに処理中の場合は何もしない
  if (isSubmitting.value) return;

  isSubmitting.value = true;
  successMessage.value = '';
  errorMessage.value = '';
  
  try {
    // 1. Firestoreの 'posts' コレクションへの参照を取得
    const postsCollection = collection($firestore, 'posts');

    // 2. ドキュメント（投稿データ）を追加
    await addDoc(postsCollection, {
      title: title.value,
      body: body.value,
      // サーバー側のタイムスタンプを追加
      createdAt: serverTimestamp(), 
    });

    // 成功メッセージを表示し、フォームをリセット
    successMessage.value = '投稿が完了しました！';
    title.value = '';
    body.value = '';

  } catch (error) {
    console.error("投稿エラー:", error);
    errorMessage.value = '投稿中にエラーが発生しました。コンソールを確認してください。';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* スタイル */
.post-form {
  max-width: 600px;
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
.form-group input[type="text"],
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box; /* paddingを含めて幅を100%にする */
}
button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}
button:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}
.success {
    color: green;
    font-weight: bold;
}
.error {
    color: red;
    font-weight: bold;
}
</style>