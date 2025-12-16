<template>
  <div>
    <h1>掲示板 投稿一覧</h1>
    <p>
      <NuxtLink to="/new">新しい投稿をする</NuxtLink>
    </p>

    <p v-if="isLoggedIn">
      <NuxtLink to="/favorites">>> 自分がいいねした投稿を見る</NuxtLink>
    </p>
    
    <p v-if="pending || !favoritesReady">データを読み込み中です...</p>
    <p v-else-if="error">投稿データの読み込み中にエラーが発生しました: {{ error.message }}</p>

    <div v-else-if="posts && posts.length > 0" class="post-list">
      <div v-for="post in posts" :key="post.id" class="post-item">
        <h3>{{ post.title }}</h3>
        <p>{{ post.body }}</p>
        
        <button 
          @click="toggleFavorite(post.id)" 
          :disabled="!isLoggedIn"
          class="favorite-button"
        >
          {{ favorites[post.id] ? '❤️ いいね済み' : '🤍 いいねする' }}
        </button>
        
        <small>投稿日時: {{ formatTimestamp(post.createdAt) }}</small>
      </div>
    </div>
    
    <p v-else>まだ投稿がありません。</p>

  </div>
</template>

<script setup>
import { useAuthUser } from '../composables/useAuthUser';
import { onMounted, ref, watch } from 'vue'; // ★★★ Vueの機能を明示的にインポート ★★★
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

const { $firestore } = useNuxtApp();
const { uid, isLoggedIn, isAuthReady } = useAuthUser();

// 状態管理
const posts = ref([]);
const pending = ref(true);
const error = ref(null);
const favorites = ref({});
const favoritesReady = ref(false);


// ★★★ 1. 投稿データの取得 (onMountedでクライアント側で実行) ★★★
const fetchAllPosts = async () => {
  pending.value = true;
  error.value = null;
  try {
    // ★★★ useNuxtApp() の呼び出しを関数内に移動（SSRクラッシュ防止） ★★★
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

// ★★★ 2. いいね情報の取得 ★★★
const fetchFavorites = async () => {
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
    
  } catch(e) {
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
watch([isAuthReady, uid], () => {
    // 認証情報が準備完了になってから、いいね情報を取得する
    if (isAuthReady.value) {
        fetchFavorites();
    }
}, { immediate: true });


// ★★★ 3. いいねのトグル処理 ★★★
const toggleFavorite = async (postId) => {
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

const refresh = () => {
    fetchAllPosts();
    fetchFavorites();
}

defineExpose({ refresh });
</script>

<style scoped>
/* スタイルは省略。必要に応じて追加してください。 */
</style>