<template>
  <div class="hero-container">
    <div class="page-container">
      <header class="main-header">
        <NuxtLink to="/setting" class="hanbargarbar">
          <img src="/images/hanbargarbar-icon.png" alt="メニュー" />
        </NuxtLink>
        <nav class="tab-menu">
          <NuxtLink to="/timeline" class="tab-item" active-class="active">
            ホーム
          </NuxtLink>
          <NuxtLink to="/favorites" class="tab-item" active-class="active">
            お気に入り
          </NuxtLink>
        </nav>
      </header>

      <NuxtLink to="/new" class="floating-button">
        <img src="/images/newpost-icon.png" alt="新規投稿" class="nav-icon-img" />
      </NuxtLink>

      <div v-if="pending || !favoritesReady" class="loading">
        <img :src="loadImg" alt="読み込み中" class="loading-image" />
        <p>データを読み込み中です...</p>
      </div>
      <p v-else-if="error">投稿データの読み込み中にエラーが発生しました: {{ error?.message || String(error) }}</p>

      <div v-else-if="posts && posts.length > 0" class="post-list">
        <div v-for="post in posts" :key="post.id" class="post-wrapper">
          <div class="post-item" :style="getPostStyle(post)">
            <p class="post-body">{{ post.body }}</p>
          </div>
          <div class="side-action">
            <button @click="toggleFavorite(post.id)" :disabled="!isUserLoggedIn()" class="favorite-btn-img">
              <img :src="favorites[post.id] ? '/images/favorite.png' : '/images/nonFavorite.png'" alt="いいね"
                class="fav-icon-size" />
            </button>
          </div>

        </div>
      </div>
    </div>
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

// const { $firestore } = useNuxtApp();
// const authUser = useAuthUser();
// const { uid, isLoggedIn, isAuthReady } = authUser;
// const { uid, isLoggedIn, isAuthReady } = useAuthUser();
const getAuth = () => useAuthUser();

// 状態管理
const posts = ref([]);
const pending = ref(true);
const error = ref(null);
const favorites = ref({});
const favoritesReady = ref(false);

const loadImg = 'images/load.webp';

// 投稿データの取得 (onMountedでクライアント側で実行) 
const fetchAllPosts = async () => {
  pending.value = true;
  error.value = null;
  try {
    // useNuxtApp() の呼び出しを関数内に移動（SSRクラッシュ防止）
    const { $firestore } = useNuxtApp();

    const postsCollection = collection($firestore, 'posts');
    const q = query(postsCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    posts.value = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error("投稿一覧の取得エラー:", e);
    error.value = e;
  } finally {
    pending.value = false;
  }
};

// お気に入りの取得
const fetchFavorites = async () => {
  const { uid, isLoggedIn } = getAuth();
  if (!isLoggedIn.value || !uid.value) {
    favorites.value = {};
    favoritesReady.value = true;
    return;
  }

  try {
    const { $firestore } = useNuxtApp();
    const q = query(collection($firestore, 'favorites'), where('userId', '==', uid.value));
    const snapshot = await getDocs(q);

    const newFavorites = {};
    snapshot.docs.forEach(d => {
      newFavorites[d.data().postId] = d.id;
    });
    favorites.value = newFavorites;

  } catch (e) {
    console.error("いいね情報の取得エラー:", e);
  } finally {
    favoritesReady.value = true;
  }
}

const getPostStyle = (post) => {
  // backgroundデータがない場合はデフォルト色を返す
  if (!post || !post.background) {
    return { backgroundColor: '#FFF8E6' };
  }

  const b = post.background;

  // 画像タイプの場合
  if (b.type === 'image' && b.url) {
    return {
      backgroundImage: `url(${b.url})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  }

  // カラータイプの場合
  return { backgroundColor: b.color };
};

// クライアントサイドの実行保証
onMounted(() => {
  fetchAllPosts(); // 投稿一覧はログイン状態に関わらずロード
});

// ログイン状態の変化時にいいね情報を再取得
watch([() => getAuth().isAuthReady.value, () => getAuth().uid.value], () => {
  // 認証情報が準備完了になってから、いいね情報を取得する
  const { isAuthReady, isLoggedIn } = getAuth();
  if (isAuthReady.value) {
    fetchFavorites();
  }
}, { immediate: true });


// お気に入り 
const toggleFavorite = async (postId) => {
  const { uid, isLoggedIn } = getAuth();
  if (!isLoggedIn.value) {
    alert("いいねするにはログインが必要です。");
    return;
  }

  const favoriteDocId = favorites.value[postId];

  try {
    const { $firestore } = useNuxtApp();
    if (favoriteDocId) {
      await deleteDoc(doc($firestore, 'favorites', favoriteDocId));
      delete favorites.value[postId];
    } else {
      const newFavRef = doc(collection($firestore, 'favorites'));

      await setDoc(newFavRef, {
        userId: uid.value,
        postId: postId,
        createdAt: serverTimestamp()
      });

      favorites.value[postId] = newFavRef.id;
    }
  } catch (e) {
    console.error("いいね処理エラー:", e);
    alert('いいね処理中にエラーが発生しました。');
  }
};

const refresh = () => {
  fetchAllPosts();
  fetchFavorites();
}

defineExpose({ refresh });

const isUserLoggedIn = () => getAuth().isLoggedIn.value;
const isUserAuthReady = () => getAuth().isAuthReady.value;
</script>

<style scoped>
.hero-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-size: auto 100vh;
  background-position: center top;
  background-repeat: no-repeat;
}

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

.tab-menu {
  display: flex;
  justify-content: center;
  background-color: rgba(255, 248, 230, 0.8);
  margin: 0 50px;
  border-radius: 15px;
  overflow: hidden;
  border: 1px solid #B4EBE6;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  text-decoration: none;
  color: #666;
  font-weight: bold;
  transition: all 0.3s;
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

.main-header {
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 100;
  padding-bottom: 10px;
}

.hanbargarbar {
  width: 80px;
  height: 80px;
  top: 160px;
  left: 60px;
}

/* 新規作成 */
.floating-button {
  position: fixed;
  bottom: 40px;
  right: 40px;
  z-index: 1000;
  transition: transform 0.2s;
}

/* 投稿ボタン */
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

/* 投稿 */
.post-item {
  border: 0.3px solid #2f1000;
  flex: 1;
  padding: 25px;
  border-radius: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  min-height: 120px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s;
}

/* いいねボタン */
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

/* 投稿ボタン */
.floating-button {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 100;
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