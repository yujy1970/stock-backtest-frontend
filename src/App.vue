<template>
  <div id="app">
    <header class="app-header">
      <h1>股票回溯策略分析系统</h1>
      <p>多市场股票指数与资金曲线展示平台</p>
    </header>
    
    <nav class="app-nav">
      <router-link to="/cn" class="nav-link">中国A股市场</router-link>
      <router-link to="/us" class="nav-link">美国股票市场</router-link>
      <router-link to="/hk" class="nav-link">香港股票市场</router-link>
    </nav>
    
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  background-color: #f5f5f5;
}

#app {
  min-height: 100vh;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 30px 20px;
}

.app-header h1 {
  margin-bottom: 10px;
  font-size: 2rem;
}

.app-header p {
  opacity: 0.9;
}

.app-nav {
  background: white;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
}

.nav-link {
  padding: 15px 25px;
  text-decoration: none;
  color: #333;
  font-weight: 500;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
}

.nav-link:hover {
  background: #f8f9fa;
}

.nav-link.router-link-active {
  color: #667eea;
  border-bottom-color: #667eea;
  background: #f8f9fa;
}

.app-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>