<template>
  <div>
    <h1>掲示板 投稿一覧</h1>
    <p>
      <NuxtLink to="/new">新しい投稿をする</NuxtLink>
    </p>

    <p v-if="pending">データを読み込み中です...</p>

    <p v-if="error">投稿データの読み込み中にエラーが発生しました: {{ error.message }}</p>

    <div v-else-if="posts.length > 0" class="post-list">
      <div v-for="post in posts" :key="post.id" class="post-item">
        <h3>{{ post.title }}</h3>
        <p>{{ post.body }}</p>
        <small>投稿日時: {{ formatTimestamp(post.createdAt) }}</small>
      </div>
    </div>
    
    <p v-else>まだ投稿がありません。</p>

  </div>
</template>

<script setup>
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

// NuxtAppのインスタンスから$firestoreを呼び出す
const { $firestore } = useNuxtApp();

// データを読み込み、管理するためのリアクティブな変数
// useAsyncDataは、サーバーサイドでも動作し、データの取得状態（pending, error, data）を管理します。
const { data: posts, pending, error, refresh } = useAsyncData(
  'posts', // データのキャッシュキー
  async () => {
    // 投稿データを取得
    const postsCollection = collection($firestore, 'posts');
    
    // createdAtの降順（新しい順）でデータを取得するクエリ
    const q = query(postsCollection, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    
    // 取得したデータを整形して、posts変数に格納
    return querySnapshot.docs.map(doc => {
      // ドキュメントIDとデータ本体を結合
      return { id: doc.id, ...doc.data() };
    });
  }
);

// Firebase Timestampオブジェクトを整形するヘルパー関数
const formatTimestamp = (timestamp) => {
  if (!timestamp) return '不明';
  // FirebaseのTimestampオブジェクトからJavaScriptの日付オブジェクトに変換
  return timestamp.toDate().toLocaleString('ja-JP', { 
    year: 'numeric', month: '2-digit', day: '2-digit', 
    hour: '2-digit', minute: '2-digit' 
  });
};

// 投稿後に画面を更新するためのリフレッシュ機能（後のステップで使います）
defineExpose({ refresh });
</script>

<style scoped>
/* スタイルは前回のものと同じです */
.post-list {
  margin-top: 20px;
  border-top: 1px solid #ccc;
  padding-top: 10px;
}
.post-item {
  border: 1px solid #eee;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 5px;
}
h3 {
  margin-top: 0;
  color: #333;
}
small {
  color: #888;
  display: block;
  margin-top: 10px;
}
</style>