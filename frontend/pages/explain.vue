<template>
    <div class="hero-container">
        <div class="content">
            <div class="logo-wrapper">
                <img v-if="logoUrl" :src="logoUrl" alt="App Logo" class="logo-image" />
                <h1 v-else class="fallback-logo">APP LOGO</h1>
            </div>
        </div>
    </div>
</template>

<script setup>
// ロゴのパスを指定
const logoUrl = "images/logo.png";
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
}

.content {
    position: relative;
    z-index: 2;
    text-align: center;
    color: #ffffff;
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