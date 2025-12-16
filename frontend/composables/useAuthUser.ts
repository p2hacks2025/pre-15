// frontend/composables/useAuthUser.ts

import { onAuthStateChanged, type User } from 'firebase/auth';

/**
 * ログインユーザーの情報をリアクティブに管理するコンポーザブル
 */
export const useAuthUser = () => {
    const user = useState<User | null>('firebase-user', () => null);
    const isAuthReady = useState<boolean>('firebase-auth-ready', () => false);

    const init = () => {
        // 既に初期化済みの場合はスキップ
        if (isAuthReady.value) {
            return;
        }

        // ★★★ 修正箇所: ここから変更 ★★★

        // Nuxtのサーバーサイドレンダリング(SSR)時にFirebase Authコードを実行するのを防ぐ
        if (process.client) {
            const { $auth } = useNuxtApp();

            // onAuthStateChanged: ログイン状態が変化したときに呼び出される
            onAuthStateChanged($auth, (currentUser) => {
                user.value = currentUser;
                isAuthReady.value = true; // 初回コールで初期化完了
                console.log('認証状態が変化しました:', currentUser ? `UID: ${currentUser.uid}` : 'ログアウト');
            });
        } else {
            // サーバーサイドでは、とりあえず準備完了フラグを立てて、レンダリングを続行させる
            isAuthReady.value = true;
        }
    };

    init();

    return {
        user,
        isLoggedIn: computed(() => !!user.value),
        uid: computed(() => user.value?.uid || null),
        isAuthReady,
    };
};