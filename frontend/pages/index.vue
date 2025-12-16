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
// 認証関連のインポート/ロジックをすべて削除し、シンプルなFirestoreクエリのみに戻す
import { collection, getDocs, orderBy, query } from 'firebase/firestore'; 

const { $firestore } = useNuxtApp();

const { data: posts, pending, error, refresh } = useAsyncData(
  'posts', 
  async () => {
    const postsCollection = collection($firestore, 'posts');
    const q = query(postsCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      return { id: doc.id, ...doc.data() };
    });
  }
);

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '不明';
  if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleString('ja-JP', { 
          year: 'numeric', month: '2-digit', day: '2-digit', 
          hour: '2-digit', minute: '2-digit' 
      });
  }
  return '日付取得エラー';
};

defineExpose({ refresh });
</script>

<style scoped>
/* スタイルは省略 */
</style>