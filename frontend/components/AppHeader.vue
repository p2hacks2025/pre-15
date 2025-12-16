<template>
  <header class="app-header">
    <div class="header-content">
      <NuxtLink to="/" class="logo">
        掲示板アプリ
      </NuxtLink>
      
      <nav class="auth-nav">
        <NuxtLink to="/new" class="btn-new">新規投稿</NuxtLink>
      </nav>
    </div>
  </header>
</template>

<script setup>
// ★★★ useAuthUser や signOut のインポートはすべて削除 ★★★
// <script setup> 内は空にします。

</script>

<style scoped>
.app-header {
  background-color: #333;
  color: white;
  padding: 10px 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.header-content {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.logo {
  color: white;
  text-decoration: none;
  font-size: 1.5em;
  font-weight: bold;
}
.auth-nav {
  display: flex;
  align-items: center;
}
.btn-new {
  padding: 8px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  font-size: 0.9em;
}
</style>