<template>
  <div>
    <h1>掲示板 投稿一覧</h1>
    <p>
      <NuxtLink to="/new">新しい投稿をする</NuxtLink>
    </p>

    <div class="post-list">
      <div class="post-item">
        <h3>初めての投稿です！</h3>
        <p>
          開発お疲れ様です。これが記念すべき最初の投稿になります。
          早くデータ保存機能を作って、本当に書き込めるようにしたいですね！
        </p>
        <small>投稿日時: 2025-12-14 16:35</small>
      </div>

      <div class="post-item">
        <h3>進捗報告</h3>
        <p>フロントエンドの環境構築が完了しました。次はバックエンドの選定とAPI連携に入ります。</p>
        <small>投稿日時: 2025-12-14 16:30</small>
      </div>

    </div>
  </div>
</template>

<style scoped>
.post-list {
  margin-top: 20px;
  border-top: 1px solid #ccc;
  padding-top: 10px;
}
.post-item {
  border: 1px solid #eee;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 5px;
}
h3 {
  margin-top: 0;
  color: #333;
}
small {
  color: #888;
  display: block;
  margin-top: 10px;
}
</style>
