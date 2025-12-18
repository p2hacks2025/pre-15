<template>
    <div class="hero-container" @click="goTimeline" role="button" tabindex="0" @keyup.enter="goTimeline"
        aria-label="タイムラインへ移動">
        <div class="content">
            <h2 class="explain-text"><span>あなたのトキメキを</span><span>詩にしよう！</span></h2>
        </div>
    </div>
</template>

<script setup>
const router = useRouter();
const goTimeline = () => {
    router.push('/timeline');
};
</script>

<style scoped>
.hero-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background-image: url('/images/bg-n.png');
    background-size: auto 100vh;
    background-position: center top;
    background-repeat: no-repeat;
    cursor: pointer;
}

.content {
    position: relative;
    z-index: 2;
    text-align: center;
    color: #000000;
}

.explain-text {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
    padding: 0 1rem;
    line-height: 1.25;
}

.explain-text span {
    display: block;
}

.explain-text span+span {
    margin-top: 0.25rem;
    /* small gap between lines */
}

.logo-wrapper {
    margin-bottom: 2rem;
}

.logo-image {
    max-width: 300px;
    height: auto;
}

.fallback-logo {
    font-size: 4rem;
    font-weight: bold;
    letter-spacing: 0.1em;
}
</style>