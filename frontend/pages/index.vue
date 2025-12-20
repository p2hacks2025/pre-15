<template>
  <div class="hero-container" @click="goExplain" role="button" tabindex="0" @keyup.enter="goExplain">
    <div class="logo-wrapper">
      <Transition name="fade-fast" @after-leave="goExplain">
        <img v-if="showLogo && logoUrl" :src="logoUrl" alt="App Logo" class="logo-image" />
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
const router = useRouter();
const logoUrl = "images/title-icon.png";

const showLogo = ref(false);

const goExplain = () => {
  router.push('/explain');
};

onMounted(() => {
  setTimeout(() => {
    showLogo.value = true;
  }, 1000);

  setTimeout(() => {
    showLogo.value = false;
  }, 3100);
});
</script>

<style scoped>
/* アニメーション */
.fade-fast-enter-active {
  transition: opacity 0.8s ease-out;
}

.fade-fast-leave-active {
  transition: opacity 1.2s ease-in;
}

.fade-fast-enter-from,
.fade-fast-leave-to {
  opacity: 0;
}

.hero-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-image: url('/images/bg-kira7.png');
  background-size: auto 100vh;
  background-position: center top;
  background-repeat: no-repeat;
  cursor: pointer;
}

.logo-wrapper {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
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