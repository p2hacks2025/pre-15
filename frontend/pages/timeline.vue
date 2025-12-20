<template>
  <div class="page-container">
    <header class="main-header">
      <NuxtLink to="/" class="hanbargarbar">
        <img src="/images/hanbargarbar-icon.png" alt="はんばーがーば" />
      </NuxtLink>
      <NuxtLink to="/mypost">>> 自分の投稿を管理する</NuxtLink>
    </header>
    <NuxtLink to="/new" class="floating-button">
      <img src="/images/newpost-icon.png" alt="新規投稿" />
    </NuxtLink>

    <p v-if="isUserLoggedIn()">
      <NuxtLink to="/favorites">>> 自分がいいねした投稿を見る</NuxtLink>
    </p>

    <div v-if="pending || !favoritesReady" class="loading">
      <img src="/images/load.webp" alt="読み込み中" class="loading-image" />
      <p>データを読み込み中です...</p>
    </div>
    <p v-else-if="error">投稿データの読み込み中にエラーが発生しました: {{ error?.message || String(error) }}</p>

    <div v-else-if="posts && posts.length > 0" class="post-list">
      <div v-for="post in posts" :key="post.id" class="post-item">
        <p class="post-sentence">{{ post.body }}</p><button @click="toggleFavorite(post.id)"
          :disabled="!isUserLoggedIn()" class="favorite-button">
          {{ favorites[post.id] ? '❤️' : '🤍' }}
        </button>


      </div>
    </div>
    <p v-else>トキメキはまだ届いていません</p>
    <footer class="main-footer"></footer>

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


// 1. 投稿データの取得 (onMountedでクライアント側で実行) 
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

// 2. いいね情報の取得
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

// クライアントサイドでの実行を保証
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


// 3. いいねのトグル処理 
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
.page-container {
  /* 背景画像の設定 */
  background-image: url('/images/background-2.png');
  /* 画像のパス */
  background-size: cover;
  /* 画面全体を覆う */
  background-position: center;
  /* 中央合わせ */
  background-attachment: fixed;
  /* スクロールしても背景は動かない */
  background-repeat: no-repeat;
  /* 繰り返し禁止 */

  width: 100vw;
  /* 画面の横幅いっぱいに固定 */
  min-height: 100vh;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.main-header {
  /*background: #B4EBE6;*/
  position: sticky;
  /* スクロールしても上部に残る */
  top: 0;
  width: 100%;
  z-index: 100;
  /*border-bottom: 80px solid #B4EBE6;*/
  margin-bottom: 20px;
}

.hanbargarbar {
  width: 80px;
  /* お好みのサイズに調整してください */
  height: 80px;
  top: 160px;
  left: 60px;
}

/*新規作成ぼたん*/
.floating-button {
  position: fixed;
  /* 画面に対して固定位置にする */
  bottom: 40px;
  /* 下からpx */
  right: 40px;
  /* 右からpx */
  z-index: 1000;
  /* 他の要素より上に表示する */
  transition: transform 0.2s;
  /* ホバー時のアニメーション用 */
}

/* 投稿ボタン */
.floating-button img {
  width: 80px;
  /* お好みのサイズに調整してください */
  height: 80px;
  cursor: pointer;
  /* 画像の影 */
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

/* マウスを乗せた時（タップしたとき）に少し大きくする演出 */
.floating-button:hover {
  transform: scale(1.1);
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
  width: 160px;
  height: auto;
  object-fit: contain;
  margin-bottom: 16px;
}

/* 全体 */
.post-list {
  /*max-width: 600px;    /* 投稿の最大横幅を制限 */
  margin: 0 auto;
  /* 上下0、左右を自動計算（これで中央に寄る） */
  padding: 50px;
  /* 端に少し余白を作る */
}

/* 2. 各投稿カードのスタイル */
.post-item {
  white-space: pre-wrap;
  background-color: #B4EBE680;
  /* 透けさせる */
  /*background-color: #FBF8EF;*/
  border: 1px solid #FFB433;
  border-radius: 20px;
  /* 角を丸く */
  padding: 25px;
  margin-bottom: 20px;
  /* 投稿ごとの間隔 */
  text-align: left;
  /* 文章自体は左揃えにする（読みやすさのため） */
  /*box-shadow: 0 2px 4px rgba(0,0,0,0.3); /* 軽い影をつけて浮かせる */
}

.post-sentence {
  font-size: 20px;
}

/* 3. タイトルなどの装飾 */
h3 {
  margin-top: 0;
  color: #333;
}

/* 4. いいねボタンの見た目 */
.favorite-button {
  background: white;
  border: 1px solid #ff4d4f;
  color: #ff4d4f;
  padding: 5px 15px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.favorite-button:hover {
  background: #fff1f0;
}

.favorite-button:disabled {
  border-color: #ccc;
  color: #ccc;
  cursor: not-allowed;
}
</style>