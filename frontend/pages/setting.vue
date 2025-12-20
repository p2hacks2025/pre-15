<template>
    <div class="page-container">
        <header class="main-header">
            <a href="#" class="hanbargarbar" @click.prevent="goTimeline">
                <svg xmlns="http://www.w3.org/2000/svg" height="45px" viewBox="0 -960 960 960" width="45px"
                    fill="#000000">
                    <path
                        d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                </svg>
            </a>
        </header>

        <div v-if="!isLoggedIn()" class="warning-box">
            設定を行うにはログインが必要です。
            <NuxtLink to="/auth">ログイン/登録はこちら</NuxtLink>
        </div>

        <div class="btns-container">
            <button class="btn" :disabled="!isLoggedIn()">
                メールアドレスの変更
            </button>
            <button class="btn" :disabled="!isLoggedIn()">
                パスワードの変更
            </button>
            <button class="btn" :disabled="!isLoggedIn()" @click.prevent="goMypost">
                自分の投稿を管理する
            </button>
            <button class="btn" @click.prevent="goTitle">
                タイトル画面へ
            </button>
        </div>

    </div>
</template>

<script setup>
import { useAuthUser } from '../composables/useAuthUser';

// 認証情報の取得
const getAuth = () => useAuthUser();

const router = useRouter();

const goTimeline = () => {
    router.push('/timeline');
};

const goMypost = () => {
    router.push('/mypost');
};

const goTitle = () => {
    router.push('/');
};

// ログイン状態の判定
const isLoggedIn = () => getAuth().isLoggedIn.value;
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
    z-index: 100;
    margin-bottom: 20px;
}

.hanbargarbar {
    width: 80px;
    height: 80px;
    top: 160px;
    left: 60px;
}

.btns-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    padding: 20px;
}

.btn {
    width: 300px;
    padding: 10px 22px;
    background: #FBF8EF;
    color: #000000;
    border: 5px solid #B4EBE6;
    border-radius: 6px;
    cursor: pointer;
    font-size: 20px;
    text-align: center;
}

.btn:disabled {
    background: #aaa;
    cursor: not-allowed;
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