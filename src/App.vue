<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-left">
        <span class="logo">📁</span>
        <h1 class="title">文件管理器</h1>
      </div>
      <div class="header-right">
        <span class="path-display" v-if="selectedFile">
          📍 {{ selectedFile.name }}
        </span>
      </div>
    </header>
    
    <main class="app-main">
      <aside class="sidebar">
        <FileTree
          ref="fileTreeRef"
          @select="handleSelect"
          @files-changed="handleFilesChanged"
        />
      </aside>
      
      <section class="content">
        <FilePreview
          :file="selectedFile"
          @files-changed="handleFilesChanged"
          @file-deleted="handleFileDeleted"
          @upload="handleUpload"
        />
      </section>
    </main>
    
    <div 
      v-if="showToast"
      class="toast"
      :class="toastType"
    >
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import FileTree from './components/FileTree.vue'
import FilePreview from './components/FilePreview.vue'

const fileTreeRef = ref(null)
const selectedFile = ref(null)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

function handleSelect(file) {
  selectedFile.value = file
}

function handleFilesChanged() {
  if (fileTreeRef.value) {
    fileTreeRef.value.refresh()
  }
  showToastMessage('操作成功', 'success')
}

function handleFileDeleted(fileId) {
  if (selectedFile.value?.id === fileId) {
    selectedFile.value = null
  }
  showToastMessage('删除成功', 'success')
}

function handleUpload(parentId) {
  // 文件预览组件中的上传按钮被点击，这里可以传递给 FileTree 组件
  // 实际通过 FileTree 的上传逻辑处理
  showToastMessage('请选择要上传的文件', 'info')
}

function showToastMessage(message, type = 'success') {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}
</script>

<style scoped>
.app-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
}

.app-header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  font-size: 28px;
}

.title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.header-right {
  display: flex;
  align-items: center;
}

.path-display {
  font-size: 13px;
  color: var(--text-secondary);
  background-color: #f5f5f5;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
}

.app-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 320px;
  min-width: 280px;
  max-width: 400px;
  height: 100%;
  overflow: hidden;
  border-right: 1px solid var(--border-color);
  resize: horizontal;
}

.content {
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow: hidden;
}

.toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-size: 14px;
  color: white;
  z-index: 2000;
  animation: slideIn 0.3s ease;
}

.toast.success {
  background-color: var(--success-color);
}

.toast.error {
  background-color: var(--danger-color);
}

.toast.info {
  background-color: var(--primary-color);
}

.toast.warning {
  background-color: var(--warning-color);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
