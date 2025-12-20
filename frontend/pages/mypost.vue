<template>
  <div class="page-container">
    <header class="main-header">
      <div class="header-top">
        <button class="back-button" @click="goSetting">
          <img :src="backArrow" alt="戻る" class="back-icon-img" />
        </button>
        <h1 class="header-title">自分の投稿一覧</h1>
      </div>
    </header>

    <div v-if="!isUserAuthReady()" class="loading">
      <p>認証情報を読み込み中です...</p>
    </div>

    <div v-else-if="!isUserLoggedIn()">
      <p>自分の投稿を見るにはログインが必要です。</p>
      <p>
        <NuxtLink to="/auth">ログイン / 新規登録</NuxtLink>
      </p>
    </div>

    <div v-if="isUserLoggedIn() && pending" class="loading">
      <img :src="loadImg" alt="読み込み中" class="loading-image" />
      <p>データを読み込み中です...</p>
    </div>

    <p v-else-if="error">データの読み込み中にエラーが発生しました: {{ error.message }}</p>

    <div v-else-if="posts && posts.length > 0" class="post-list">
      <div v-for="post in posts" :key="post.id" class="post-wrapper">
        <div class="post-item" :style="getPostStyle(post)">
          <p class="post-body">{{ post.body }}</p>
        </div>
      </div>
    </div>

    <p v-else class="empty-message">まだ自分で投稿した記事はありません。</p>
  </div>
</template>

<script setup>
import { useAuthUser } from '../composables/useAuthUser';
import { onMounted, ref, watch } from 'vue';
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';

const getAuth = () => useAuthUser();
const isUserLoggedIn = () => getAuth().isLoggedIn.value;
const isUserAuthReady = () => getAuth().isAuthReady.value;

const posts = ref([]);
const pending = ref(true);
const error = ref(null);
const favorites = ref({});
const favoritesReady = ref(false);

const router = useRouter();

const loadImg = '/images/load.webp';
const backArrow = '/images/back-arrow.png';

const goSetting = () => {
  router.push('/setting');
};

// --- ホームと共通のスタイル取得関数 ---
const getPostStyle = (post) => {
  if (!post || !post.background) {
    return { backgroundColor: '#FFF8E6' };
  }
  const b = post.background;
  if (b.type === 'image' && b.url) {
    return {
      backgroundImage: `url(${b.url})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  }
  return { backgroundColor: b.color };
};

const fetchMyPosts = async () => {
  const { uid, isLoggedIn } = getAuth();
  if (!isLoggedIn.value || !uid.value) {
    pending.value = false;
    return;
  }

  pending.value = true;
  try {
    const { $firestore } = useNuxtApp();
    const q = query(
      collection($firestore, 'posts'),
      where('userId', '==', uid.value),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    posts.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error(e);
    error.value = e;
  } finally {
    pending.value = false;
  }
};

// いいね情報の取得（ホームと共通）
const fetchFavorites = async () => {
  const { uid, isLoggedIn } = getAuth();
  if (!isLoggedIn.value || !uid.value) return;
  try {
    const { $firestore } = useNuxtApp();
    const q = query(collection($firestore, 'favorites'), where('userId', '==', uid.value));
    const snapshot = await getDocs(q);
    const newFavorites = {};
    snapshot.docs.forEach(d => { newFavorites[d.data().postId] = d.id; });
    favorites.value = newFavorites;
  } finally {
    favoritesReady.value = true;
  }
};

onMounted(() => { if (isUserLoggedIn()) fetchMyPosts(); });

watch([() => getAuth().isAuthReady.value, () => getAuth().uid.value], () => {
  if (getAuth().isAuthReady.value && getAuth().isLoggedIn.value) {
    fetchMyPosts();
    fetchFavorites();
  }
}, { immediate: true });
</script>

<style scoped>
.page-container {
  background-image: url('/images/background-1.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  width: 100vw;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.main-header {
  position: sticky;
  top: 0;
  width: 100%;
  padding: 10px 0;
}

.header-top {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px 20px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  cursor: pointer;
  background: transparent;
  border: none;
  padding: 0;
}

.back-icon-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.header-title {
  font-size: 18px;
  margin: 0;
  padding: 6px 16px;
  border: 1.5px solid #FFB433;
  border-radius: 20px;
  color: #2f1000;
  background-color: transparent;
  display: inline-block;
  white-space: nowrap;
}

.mypost-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

/* --- 投稿リスト構造：ホームと統一 --- */
.post-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px 50px;
}

.post-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  width: 100%;
}

/* --- カードデザイン：ホームと統一 --- */
.post-item {
  border: 0.3px solid #2f1000;
  flex: 1;
  padding: 25px;
  border-radius: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  min-height: 120px;
  display: flex;
  flex-direction: column;
}

.post-body {
  white-space: pre-wrap;
  font-size: 16px;
}

/* --- いいねボタンデザイン --- */
.favorite-btn-img {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.fav-icon-size {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

/* 読み込み中・メッセージ系 */
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
}

.empty-message {
  text-align: center;
  margin-top: 50px;
  color: #666;
}
</style>