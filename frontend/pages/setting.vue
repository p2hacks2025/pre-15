<template>
    <div class="page-container">
        <header class="main-header">
            <a href="#" class="hanbargarbar" @click.prevent="goBack">
                <img src="/images/hanbargarbar-icon.png" alt="メニュー閉じる" />
            </a>
            <NuxtLink to="/mypost">>> 自分の投稿を管理する</NuxtLink>
        </header>
    </div>
</template>

<script setup>
import { useAuthUser } from '../composables/useAuthUser';

// 認証情報の取得
const getAuth = () => useAuthUser();

const router = useRouter();

// 前のページに戻る関数
const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
        router.back();
    } else {
        router.push('/timeline'); // 履歴がなければタイムラインへ
    }
};

// ログイン状態の判定
const isUserLoggedIn = () => getAuth().isLoggedIn.value;
const isUserAuthReady = () => getAuth().isAuthReady.value;
</script>

<style scoped>
.page-container {
    background-image: url('/images/background-2.png');
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
    /*background: #B4EBE6;*/
    position: sticky;
    /* スクロールしても上部に残る */
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
</style>