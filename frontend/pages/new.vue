<template>
  <div class="new-post-container">
    <form @submit.prevent="submitPost" :class="{ 'has-warning': !isLoggedIn && isAuthReady }">
      <button type="button" class="close-btn" @click="router.push('/timeline')" aria-label="投稿一覧に戻る">
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
          <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
        </svg>
      </button>

      <div v-if="!isLoggedIn && isAuthReady" class="warning-box">
        投稿するにはログインが必要です。
        <NuxtLink to="/auth">ログイン/登録はこちら</NuxtLink>
      </div>

      <!-- テキスト入力エリア -->
      <div class="body-wrapper">
        <div class="sticky-note" :style="currentBgStyle">
          <div class="tanka-inputs">
            <div v-for="(line, index) in lines" :key="index" class="input-line">
              <input v-model="lines[index]" :placeholder="placeholders[index]" :maxlength="maxChars[index]"
                :disabled="!isLoggedIn || isSubmitting" type="text" class="tanka-field" />
              <span class="char-counter">{{ lines[index].length }}/{{ maxChars[index] }}</span>
            </div>
          </div>
        </div>

        <!-- 共有ボタン -->
        <button type="button" class="share-btn" aria-label="共有" @click="onShareClick">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
            <path
              d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h120v80H240v400h480v-400H600v-80h120q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm200-240v-447l-64 64-56-57 160-160 160 160-56 57-64-64v447h-80Z" />
          </svg>
        </button>

        <!-- 背景選択 -->
        <div class="bg-controls" aria-hidden="false">
          <div class="bg-swipe-area" role="group" aria-label="背景をスワイプで切替" @pointerdown="onPointerDown"
            @pointerup="onPointerUp" @touchstart.prevent="onTouchStart" @touchend.prevent="onTouchEnd">
            <button type="button" class="bg-arrow left" @click="prevBg" aria-label="前の背景">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <div class="bg-thumbs" aria-hidden="false">
              <div class="bg-thumb thumb-small" :style="bgStyle(prev2Index)" @click="bgIndex = prev2Index"> </div>
              <div class="bg-thumb thumb-medium" :style="bgStyle(prev1Index)" @click="bgIndex = prev1Index"> </div>
              <div class="bg-thumb thumb-large current" :style="bgStyle(bgIndex)" @click="null"> </div>
              <div class="bg-thumb thumb-medium" :style="bgStyle(next1Index)" @click="bgIndex = next1Index"> </div>
              <div class="bg-thumb thumb-small" :style="bgStyle(next2Index)" @click="bgIndex = next2Index"> </div>
            </div>
            <button type="button" class="bg-arrow right" @click="nextBg" aria-label="次の背景">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="submit-wrapper">
        <button type="submit" class="submit-btn" :disabled="!isLoggedIn || isSubmitting">
          {{ isSubmitting ? '投稿中...' : '投稿' }}
        </button>
      </div>
    </form>

    <p v-if="successMessage" class="message success">{{ successMessage }}</p>
    <p v-if="errorMessage" class="message error">{{ errorMessage }}</p>
  </div>

  <div class="page-bg"><img src="/images/bg-n.png" alt="" /></div>
</template>

<script setup>
import { useAuthUser } from '../composables/useAuthUser';
import { ref, computed } from 'vue';

const router = useRouter();

// Firestore関連のインポート
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// 認証状態を取得
const { uid, isLoggedIn, isAuthReady } = useAuthUser();

const { $firestore } = useNuxtApp();

const title = ref('');
const body = ref('');
const isSubmitting = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

// 背景切替用の配列
const lines = ref(['', '', '', '', '']);
const maxChars = [9, 11, 9, 11, 11];
const placeholders = ['五', '七', '五', '七', '七'];

// 背景切替用の配列（色または将来の画像URLを格納します）
const text_backgrounds = [
  { id: 0, type: 'color', color: '#FFF8E6' },
  { id: 1, type: 'color', color: '#FBF8EF' },
  { id: 2, type: 'color', color: '#FFF0D9' },
  { id: 3, type: 'color', color: '#F5F5F5' }
  // { type: 'image', url: '/images/bg1.jpg' }
];

// 選択中の背景インデックス
const bgIndex = ref(0);

// 背景スタイル（sticky-note）
const currentBgStyle = computed(() => {
  const b = text_backgrounds[bgIndex.value] || text_backgrounds[0];
  if (b.type === 'image' && b.url) {
    return {
      backgroundImage: `url(${b.url})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  }
  return { backgroundColor: b.color };
});

// 背景スタイル（下のサムネイル）
const bgStyle = (i) => {
  const idx = Number(i) % text_backgrounds.length;
  const b = text_backgrounds[idx] || text_backgrounds[0];
  if (b.type === 'image' && b.url) {
    return {
      backgroundImage: `url(${b.url})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  }
  return { backgroundColor: b.color };
};

// サムネイル用計算
const prev2Index = computed(() => (bgIndex.value - 2 + text_backgrounds.length) % text_backgrounds.length);
const prev1Index = computed(() => (bgIndex.value - 1 + text_backgrounds.length) % text_backgrounds.length);
const next1Index = computed(() => (bgIndex.value + 1) % text_backgrounds.length);
const next2Index = computed(() => (bgIndex.value + 2) % text_backgrounds.length);

// 左右矢印
const touchStartX = ref(null);
const onPointerDown = (e) => {
  touchStartX.value = e.clientX;
};
const onPointerUp = (e) => {
  if (touchStartX.value === null) return;
  const dx = e.clientX - touchStartX.value;
  handleSwipe(dx);
  touchStartX.value = null;
};
const onTouchStart = (e) => {
  touchStartX.value = e.touches ? e.touches[0].clientX : e.clientX;
};
const onTouchEnd = (e) => {
  if (touchStartX.value === null) return;
  const dx = e.changedTouches ? e.changedTouches[0].clientX - touchStartX.value : e.clientX - touchStartX.value;
  handleSwipe(dx);
  touchStartX.value = null;
};

const handleSwipe = (dx) => {
  const threshold = 40; // px
  if (Math.abs(dx) < threshold) return;
  if (dx < 0) {
    bgIndex.value = (bgIndex.value + 1) % text_backgrounds.length;
  } else {
    bgIndex.value = (bgIndex.value - 1 + text_backgrounds.length) % text_backgrounds.length;
  }
};

// 矢印用のハンドラ
const prevBg = () => {
  bgIndex.value = (bgIndex.value - 1 + text_backgrounds.length) % text_backgrounds.length;
};
const nextBg = () => {
  bgIndex.value = (bgIndex.value + 1) % text_backgrounds.length;
};

const onShareClick = async () => {
  console.log('共有ボタンが押されました');
  const currentBg = text_backgrounds[bgIndex.value];
  const bgDescription = currentBg.type === 'color' ? `背景色：${currentBg.color}` : '画像背景';
  const content = body.value || "（本文なし）";
  const shareText = `${content}%0A%0Aみんなも「てかマジ」で日々のキラキラを共有しよう！%0A#p2hacks  #てかマジ%0A`;
  const shareUrl = 'https://google.com';
  /* X専用リンク */
  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText.replace(/%0A/g, '\n'))}&url=${encodeURIComponent(shareUrl)}`;

  try {
    window.open(xUrl, '_blank');

  } catch (err) {
    console.error('共有エラー:', err);
  }
};

const submitPost = async () => {
  // 認証状態のチェック
  if (!isLoggedIn.value || !uid.value) {
    errorMessage.value = '投稿するにはログインが必要です。';
    router.push('/auth');
    return;
  }

  // 未入力の場合投稿不可
  if (lines.value.every(l => l.trim() === '')) {
    errorMessage.value = '内容を入力してください。';
    return;
  }

  const filledLines = lines.value.map(l => l.trim()).filter(l => l !== '');
  const lineCount = filledLines.length;

  // 3行（575）でもなく、5行（57577）でもない場合はエラー
  if (lineCount !== 3 && lineCount !== 5) {
    errorMessage.value = '「五・七・五」または「五・七・五・七・七」の形式で入力してください。';
    return;
  }

  // 最初の行から数えて lineCount 分がすべて埋まっているか確認
  for (let i = 0; i < lineCount; i++) {
    if (lines.value[i].trim() === '') {
      errorMessage.value = '上から順番に行を埋めてください。';
      return;
    }
  }

  if (isSubmitting.value) return;

  isSubmitting.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    // 改行をした1つの文にする
    const combinedBody = filledLines.join('\n');
    const { $firestore } = useNuxtApp();
    const postsCollection = collection($firestore, 'posts');
    await addDoc(postsCollection, {
      body: combinedBody, // 結合したテキストを保存
      userId: uid.value,
      createdAt: serverTimestamp(),
      background: text_backgrounds[bgIndex.value]
    });
    successMessage.value = '投稿が完了しました！';
    title.value = '';
    body.value = '';

    // 投稿一覧へリダイレクト
    router.push('/timeline');

  } catch (error) {
    console.error("投稿エラー:", error);
    errorMessage.value = '投稿エラー: ' + error.message;
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.new-post-container {
  position: relative;
  max-width: 420px;
  margin: 20px auto;
  padding: 18px 12px 20px;
  background-color: transparent;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 40px);
  box-sizing: border-box;
}

.form {
  margin-bottom: 15px;
}

.form input[type="text"],
.form textarea {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 16px;
}

.sticky-note {
  display: block;
  margin: 0 auto;
  width: min(80vw, 320px);
  aspect-ratio: 1 / 1;
  max-height: 60vh;
  background-color: #FBF8EF;
  border: 1px solid #FFB433;
  align-content: center;
  padding: 30px;
  border-radius: 6px;
  resize: none;
  font-size: 25px;
  line-height: 1.4;
  box-sizing: border-box;
  font-family: inherit;
  z-index: 10;
  overflow: auto;
  min-height: 120px;
}

.sticky-note:focus {
  outline: none;
  box-shadow: none;
}

.tanka-inputs {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 100%;
  width: 100%;
}

.input-line {
  display: flex;
  align-items: center;
  border-bottom: 1px dotted rgba(0, 0, 0, 0.1);
  /* ガイド線 */
  padding: 4px 0;
}

.tanka-field {
  flex: 1;
  background: transparent;
  border: none;
  font-size: 20px;
  font-family: inherit;
  outline: none;
  color: #2f1000;
}

.char-counter {
  font-size: 10px;
  color: #999;
  margin-left: 8px;
  min-width: 25px;
}

.body-wrapper {
  position: relative;
  padding-bottom: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.bg-controls {
  width: min(80vw, 320px);
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  flex-shrink: 0;
}

.bg-slider {
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  height: 8px;
  border-radius: 999px;
  background: linear-gradient(90deg, #eee 0%, #ddd 100%);
}

.bg-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ffb74d;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.bg-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ffb74d;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.bg-preview-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.bg-preview-label {
  font-size: 12px;
  color: #666;
}

.bg-thumb {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.04);
  background-size: cover;
  background-position: center;
}

.bg-thumbs {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
}

.bg-thumb.thumb-small {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  opacity: 0.9;
}

.bg-thumb.thumb-medium {
  width: 36px;
  height: 36px;
  border-radius: 8px;
}

.bg-thumb.thumb-large {
  width: 64px;
  height: 64px;
  border-radius: 10px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.bg-thumb.current {
  transform: translateY(-4px);
}

.bg-swipe-area {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 6px 0 0;
}

.bg-arrow {
  background: transparent;
  border: none;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
}

.bg-arrow svg {
  width: 18px;
  height: 18px;
  stroke: #666;
}

.bg-arrow:focus {
  outline: none;
}

.bg-arrow:focus-visible {
  outline: 3px solid rgba(0, 0, 0, 0.12);
  outline-offset: 3px;
  border-radius: 8px;
}

.close-btn {
  position: absolute;
  right: 18px;
  top: 18px;
  background: transparent;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  z-index: 60;
}

.new-post-container>form.has-warning .close-btn {
  position: relative;
  top: auto;
  right: 0;
  margin-left: auto;
  margin-bottom: 8px;
  align-self: flex-end;
  z-index: 80;
}

.new-post-container>form.has-warning .warning-box {
  margin-top: 0;
}

@media (max-height: 520px) {
  .new-post-container>form.has-warning .close-btn {
    margin-bottom: 6px;
  }

  .new-post-container>form.has-warning .warning-box {
    margin-top: 8px;
  }
}

.share-btn {
  background-color: transparent;
  border: none;
  position: absolute;
  right: 18px;
  bottom: 8px;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  z-index: 40;
}

.submit-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 18px;
}

.submit-btn {
  width: fit-content;
  padding: 10px 22px;
  background: #FBF8EF;
  color: #000000;
  border: 10px solid #B4EBE6;
  border-radius: 6px;
  cursor: pointer;
}

.submit-btn:disabled {
  background: #aaa;
  cursor: not-allowed;
}

.message.success {
  color: green;
  font-weight: bold;
  margin-top: 15px;
}

.message.error {
  color: red;
  font-weight: bold;
  margin-top: 15px;
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

.page-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.page-bg img {
  display: block;
  width: auto;
  max-width: 1200px;
  max-height: 100vh;
  height: auto;
  object-fit: contain;
}

@media (max-height: 720px) {
  .new-post-container {
    padding-top: 14px;
    padding-bottom: 14px;
  }

  .body-wrapper {
    gap: 8px;
  }

  .sticky-note {
    max-height: 50vh;
    width: min(74vw, 300px);
  }

  .bg-thumb.thumb-large {
    width: 56px;
    height: 56px;
  }
}

@media (max-height: 640px) {
  .sticky-note {
    max-height: 44vh;
    aspect-ratio: auto;
    width: min(72vw, 280px);
  }

  .bg-thumbs {
    gap: 8px;
  }

  .close-btn {
    top: 8px;
    right: 8px;
  }
}

@media (max-height: 520px) {
  .sticky-note {
    max-height: 38vh;
    aspect-ratio: auto;
    width: min(68vw, 260px);
    padding: 10px;
  }

  .new-post-container {
    padding-top: 12px;
    padding-bottom: calc(88px + env(safe-area-inset-bottom, 0px));
  }

  .bg-thumb {
    opacity: 0.95;
  }

  .submit-wrapper {
    bottom: calc(8px + env(safe-area-inset-bottom, 0px));
  }
}
</style>