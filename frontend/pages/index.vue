<template>
  <div class="welcome-container">
    <h1>掲示板へようこそ！ </h1>
    <p class="subtitle">ログインして、皆の投稿を見たり、自分の考えをシェアしましょう。</p>

    <div class="actions">
      <NuxtLink to="/timeline" class="button primary">
        投稿一覧を見る
      </NuxtLink>
      <NuxtLink to="/auth" class="button secondary">
        ログイン / 新規登録
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.welcome-container {
  max-width: 800px;
  margin: 100px auto;
  padding: 40px;
  text-align: center;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 2.5em;
  color: #333;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.2em;
  color: #666;
  margin-bottom: 40px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.button {
  display: inline-block;
  padding: 12px 25px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s ease;
}

.primary {
  background-color: #4CAF50;
  color: white;
}

.primary:hover {
  background-color: #45a049;
  transform: translateY(-2px);
}

.secondary {
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
}

.secondary:hover {
  background-color: #e0e0e0;
  transform: translateY(-2px);
}
</style>