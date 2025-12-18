<template>
  <div class="hero-container" @click="goExplain" role="button" tabindex="0" @keyup.enter="goExplain"
    aria-label="説明ページへ移動">
    <div class="logo-wrapper">
      <img v-if="logoUrl" :src="logoUrl" alt="App Logo" class="logo-image" />
      <h1 v-else class="fallback-logo">APP LOGO</h1>
    </div>
  </div>
</template>

<script setup>
const router = useRouter();
const logoUrl = "images/logo.png";

const goExplain = () => {
  router.push('/explain');
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