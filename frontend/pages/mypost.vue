<template>
  <div class="mypost-container">
    <h1>自分の投稿一覧</h1>
    <p>
      <NuxtLink to="/timeline">← 投稿一覧に戻る</NuxtLink>
    </p>

    <div v-if="!isUserAuthReady()">
      <p>認証情報を読み込み中です...</p>
    </div>
    <div v-else-if="!isUserLoggedIn()">
      <p>自分の投稿を見るにはログインが必要です。</p>
      <p>
        <NuxtLink to="/auth">ログイン / 新規登録</NuxtLink>
      </p>
    </div>

    <div v-if="pending || !favoritesReady" class="loading">
      <img src="/images/load.webp" alt="読み込み中" class="loading-image" />
      <p>データを読み込み中です...</p>
    </div>
    <p v-else-if="error">データの読み込み中にエラーが発生しました: {{ error.message }}</p>

    <div v-else-if="myPosts.length > 0" class="post-list">
      <div v-for="post in myPosts" :key="post.id" class="post-item">
        <h3>{{ post.title }}</h3>
        <p>{{ post.body }}</p>
        <small>投稿日時: {{ formatTimestamp(post.createdAt) }}</small>
      </div>
    </div>

    <p v-else>まだ自分で投稿した記事はありません。</p>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useAuthUser } from '../composables/useAuthUser';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore';

// 認証情報の取得（SSRクラッシュ回避のため関数化）
const getAuth = () => useAuthUser();
const isUserLoggedIn = () => getAuth().isLoggedIn.value;
const isUserAuthReady = () => getAuth().isAuthReady.value;

const myPosts = ref([]);
const pending = ref(true);
const error = ref(null);

// 自分の投稿を取得する関数
const fetchMyPosts = async () => {
  const { uid, isLoggedIn } = getAuth();

  if (!isLoggedIn.value || !uid.value) {
    pending.value = false;
    return;
  }

  pending.value = true;
  error.value = null;

  try {
    const { $firestore } = useNuxtApp();
    const postsCollection = collection($firestore, 'posts');

    // ★★★ userId が 自分のUID と一致するものだけをクエリ ★★★
    const q = query(
      postsCollection,
      where('userId', '==', uid.value),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    myPosts.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

  } catch (e) {
    console.error("自分の投稿の取得エラー:", e);
    error.value = e;
  } finally {
    pending.value = false;
  }
};

// クライアント側で実行
onMounted(() => {
  if (isUserLoggedIn()) {
    fetchMyPosts();
  }
});

// ログイン状態が変わった時に再取得
watch([() => getAuth().isAuthReady.value, () => getAuth().uid.value], () => {
  if (getAuth().isAuthReady.value && getAuth().isLoggedIn.value) {
    fetchMyPosts();
  }
}, { immediate: true });

// 日時フォーマット
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
</script>

<style scoped>
.mypost-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

.post-item {
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 8px;
  background-color: #fff;
}

.post-item h3 {
  margin-top: 0;
  color: #333;
}
</style>