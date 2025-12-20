<template>
  <div>
    <h1>自分がいいねした投稿一覧</h1>
    <p>
      <NuxtLink to="/timeline">← 投稿一覧に戻る</NuxtLink>
    </p>

    <div v-if="!isAuthReady">
      <p>認証情報を読み込み中です...</p>
    </div>
    <div v-else-if="!isLoggedIn">
      <p>いいね一覧を見るにはログインが必要です。</p>
      <p>
        <NuxtLink to="/auth">ログイン / 新規登録</NuxtLink>
      </p>
    </div>

    <div v-if="isUserLoggedIn() && pending" class="loading">
      <img :src="loadImg" alt="読み込み中" class="loading-image" />
      <p>データを読み込み中です...</p>
    </div>
    <p v-else-if="error">データの読み込み中にエラーが発生しました: {{ error.message }}</p>

    <div v-else-if="favoritePosts.length > 0" class="post-list">
      <div v-for="post in favoritePosts" :key="post.id" class="post-item">
        <h3>{{ post.title }}</h3>
        <p>{{ post.body }}</p>
        <small>投稿日時: {{ formatTimestamp(post.createdAt) }}</small>
      </div>
    </div>

    <p v-else>まだいいねした投稿はありません。</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthUser } from '../composables/useAuthUser';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  orderBy
} from 'firebase/firestore';

const { uid, isLoggedIn, isAuthReady } = useAuthUser();
const router = useRouter();
const { $firestore } = useNuxtApp();

const favoritePosts = ref([]);
const pending = ref(true);
const error = ref(null);
const loadImg = 'images/load.webp';

const getAuth = () => useAuthUser();
const isUserLoggedIn = () => getAuth().isLoggedIn.value;

const fetchFavoritePosts = async () => {
  if (!isLoggedIn.value || !uid.value) {
    // 未ログインの場合は処理を中断
    pending.value = false;
    return;
  }

  pending.value = true;
  error.value = null;

  try {
    // 1. ユーザーのUIDに紐づくいいね情報を取得
    const favoritesCollection = collection($firestore, 'favorites');
    const favoritesQuery = query(
      favoritesCollection,
      where('userId', '==', uid.value),
      orderBy('createdAt', 'desc') // 新しいいいねから表示
    );
    const favoritesSnapshot = await getDocs(favoritesQuery);

    if (favoritesSnapshot.empty) {
      favoritePosts.value = [];
      return;
    }

    // 2. いいね情報から投稿IDのリストを作成
    const postIds = favoritesSnapshot.docs.map(d => d.data().postId);

    // 3. 各投稿IDに対応する投稿データを取得
    const postsPromises = postIds.map(async postId => {
      const postDocRef = doc($firestore, 'posts', postId);
      const postDoc = await getDoc(postDocRef);

      if (postDoc.exists()) {
        return { id: postDoc.id, ...postDoc.data() };
      }
      return null;
    });

    const results = await Promise.all(postsPromises);
    // null (削除された投稿) を除外し、結果を格納
    favoritePosts.value = results.filter(post => post !== null);

  } catch (e) {
    console.error("いいね投稿の取得エラー:", e);
    error.value = e;
  } finally {
    pending.value = false;
  }
};

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

// ログイン状態が準備完了になり、ログインしている場合にデータを取得
onMounted(() => {
  // クライアントサイドでのみ実行
  if (!isLoggedIn.value) {
    // 未ログイン時は何もしないか、リダイレクトさせる
    return;
  }
  fetchFavoritePosts();
});

// ログイン状態が変化したときにもデータを再取得
watch([isAuthReady, uid], () => {
  if (isAuthReady.value && isLoggedIn.value) {
    fetchFavoritePosts();
  }
}, { immediate: true });


</script>

<style scoped>
.post-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-item {
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.post-item h3 {
  margin-top: 0;
}

/* 読み込み中の表示 */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.loading-image {
  width: 120px;
  height: auto;
  object-fit: contain;
  margin-bottom: 12px;
}
</style>