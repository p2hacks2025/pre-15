<template>
  <div class="hero-container">
    <div class="fixed-background"></div>
    <div class="page-container">
      <header class="main-header">
        <div class="header-top">
          <NuxtLink to="/setting" class="hanbargarbar">
            <img src="/images/hanbargarbar-icon.png" alt="メニュー" />
          </NuxtLink>
        </div>

        <nav class="tab-menu">
          <NuxtLink to="/timeline" class="tab-item" active-class="active">
            ホーム
          </NuxtLink>
          <NuxtLink to="/favorites" class="tab-item" active-class="active">
            お気に入り
          </NuxtLink>
        </nav>

        <div class="header-bottom">
          <NuxtLink to="/favorites" class="reload" @click.prevent="fetchFavoritePosts()">
            <img src="/images/reload.png" alt="更新" class="reload-icon-img" />
          </NuxtLink>
        </div>
      </header>

      <div v-if="!isAuthReady" class="loading">
        <p>認証情報を読み込み中です...</p>
      </div>

      <div v-else-if="!isLoggedIn" class="loading">
        <p>いいね一覧を見るにはログインが必要です。</p>
        <NuxtLink to="/auth">ログイン / 新規登録</NuxtLink>
      </div>

      <div v-else-if="pending" class="loading">
        <img :src="loadImg" alt="読み込み中" class="loading-image" />
        <p>データを読み込み中です...</p>
      </div>

      <p v-else-if="error">エラーが発生しました: {{ error.message }}</p>

      <div v-else-if="favoritePosts.length > 0" class="post-list">
        <div v-for="post in favoritePosts" :key="post.id" class="post-wrapper">
          <div class="post-item" :style="getPostStyle(post)">
            <p class="post-body">{{ post.body }}</p>
          </div>
          <div class="side-action">
            <button class="favorite-btn-img">
              <img src="/images/favorite.png" alt="いいね" class="fav-icon-size" />
            </button>
          </div>
        </div>
      </div>

      <p v-else class="loading">まだお気に入りにした投稿はありません。</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'; // watch を追加
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
const { $firestore } = useNuxtApp();

const favoritePosts = ref([]);
const pending = ref(true);
const error = ref(null);

const loadImg = '/images/load.webp';

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

const fetchFavoritePosts = async () => {
  if (!isLoggedIn.value || !uid.value) {
    pending.value = false;
    return;
  }

  pending.value = true;
  try {
    const favoritesCollection = collection($firestore, 'favorites');
    const favoritesQuery = query(
      favoritesCollection,
      where('userId', '==', uid.value),
      orderBy('createdAt', 'desc')
    );
    const favoritesSnapshot = await getDocs(favoritesQuery);

    if (favoritesSnapshot.empty) {
      favoritePosts.value = [];
      return;
    }

    const postIds = favoritesSnapshot.docs.map(d => d.data().postId);
    const postsPromises = postIds.map(async postId => {
      const postDocRef = doc($firestore, 'posts', postId);
      const postDoc = await getDoc(postDocRef);
      return postDoc.exists() ? { id: postDoc.id, ...postDoc.data() } : null;
    });

    const results = await Promise.all(postsPromises);
    favoritePosts.value = results.filter(post => post !== null);
  } catch (e) {
    console.error("いいね投稿の取得エラー:", e);
    error.value = e;
  } finally {
    pending.value = false;
  }
};

onMounted(() => {
  if (isAuthReady.value && isLoggedIn.value) {
    fetchFavoritePosts();
  }
});

watch([isAuthReady, uid], () => {
  if (isAuthReady.value && isLoggedIn.value) {
    fetchFavoritePosts();
  }
}, { immediate: true });
</script>

<style scoped>
.fixed-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background-image: url('/images/background-1.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  pointer-events: none;
}

.hero-container {
  width: 100%;
  min-height: 100vh;
}

.page-container {
  width: 100vw;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}

.tab-menu {
  display: flex;
  justify-content: center;
  background-color: rgba(255, 248, 230, 0.9);
  width: 85%;
  max-width: 400px;
  border-radius: 15px;
  overflow: hidden;
  border: 1px solid #B4EBE6;
  margin: 0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  text-decoration: none;
  color: #666;
  font-weight: bold;
  font-size: 14px;
}

.tab-item:hover {
  background-color: rgba(180, 235, 230, 0.3);
}

.tab-item.active {
  background-color: #B4EBE6;
  color: #2f1000;
  border-bottom: 3px solid #FFB433;
}

/* 3段目：更新ボタン */
.header-bottom {
  display: flex;
  justify-content: center;
  width: 100%;
}

.main-header {
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 1100;
  padding: 15px 0 10px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  background-color: rgba(255, 250, 240, 0.7);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.header-center-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.header-top {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  padding-left: 20px;
}

.hanbargarbar {
  position: absolute;
  left: 20px;
  top: 15px;
}

.hanbargarbar img {
  width: 50px;
  height: 50px;
  object-fit: contain;
}

.reload {
  display: flex;
  justify-content: center;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
}

.reload-icon-img {
  width: 35px;
  height: 35px;
  object-fit: contain;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.reload-icon-img:active {
  transform: rotate(180deg);
}

/* 元のコードにあった不要なスタイル（top/left固定値）は削除または上書き */
.hanbargarbar,
.reload {
  top: auto;
  left: auto;
  position: static;
  /* 絶対配置を解除 */
}

/* 新規作成 */
.floating-button {
  position: fixed;
  bottom: 40px;
  right: 40px;
  z-index: 1000;
  transition: transform 0.2s;
}

.floating-button img {
  width: 80px;
  height: 80px;
  cursor: pointer;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.floating-button:hover {
  transform: scale(1.1);
}

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

.post-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 50px;
}

/* 投稿とボタンを横に並べる */
.post-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  width: 100%;
}

/* 投稿のデザイン */
.post-item {
  /*border: 0.3px solid #2f1000;*/
  border: none;
  flex: 1;
  padding: 25px;
  border-radius: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  min-height: 120px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s;
}

/* お気に入り */
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

.nav-icon-img {
  width: 60px;
  height: 60px;
  object-fit: contain;
}

.post-body {
  white-space: pre-wrap;
  font-size: 16px;
}
</style>