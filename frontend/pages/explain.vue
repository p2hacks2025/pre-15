<template>
  <div class="hero-container" @click="goAuth" role="button" tabindex="0" @keyup.enter="goAuth">
    <Transition name="fade-fast" @after-leave="goAuth">
      <div v-if="showContent" class="explain-box">
        <h2 class="explain-text"><span>あなたのトキメキを</span><span>詩にしよう！</span></h2>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
const router = useRouter();

// 表示フラグ
const showContent = ref(false);

const goAuth = () => {
  router.push('/auth');
};

onMounted(() => {
  setTimeout(() => {
    showContent.value = true;
  }, 100);

  setTimeout(() => {
    showContent.value = false;
  }, 3100);
});
</script>

<style scoped>
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
  background-color: #fff;
}

.explain-box {
  text-align: center;
  padding: 20px;
}

.explain-box h2 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 20px;
  letter-spacing: 0.05em;
}

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