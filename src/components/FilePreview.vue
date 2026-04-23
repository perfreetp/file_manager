<template>
  <div class="file-preview" v-if="file">
    <div class="preview-header">
      <div class="file-info">
        <span class="file-icon">{{ fileIcon }}</span>
        <div class="file-details">
          <h3 class="file-name">{{ file.name }}</h3>
          <p class="file-meta">
            <span>{{ fileSize }}</span>
            <span class="separator">|</span>
            <span>{{ file.updatedAt }}</span>
          </p>
        </div>
      </div>
      <div class="preview-actions">
        <button 
          class="action-btn"
          @click="handleRename"
          title="重命名"
        >
          ✏️ 重命名
        </button>
        <button 
          class="action-btn action-delete"
          @click="handleDelete"
          title="删除"
        >
          🗑️ 删除
        </button>
      </div>
    </div>
    
    <div class="preview-content">
      <template v-if="file.type === 'folder'">
        <div class="folder-preview">
          <div class="folder-icon-large">📁</div>
          <h4>文件夹</h4>
          <p class="folder-info">
            创建时间: {{ file.createdAt }}
          </p>
          <p class="folder-info" v-if="file.hasChildren">
            包含子文件/文件夹 (点击左侧树形结构展开查看)
          </p>
          <p class="folder-info" v-else>
            空文件夹
          </p>
          <div class="folder-actions">
            <button class="btn btn-primary" @click="$emit('upload', file.id)">
              📤 上传文件到此文件夹
            </button>
          </div>
        </div>
      </template>
      
      <template v-else-if="file.fileType === 'image'">
        <div class="image-preview">
          <img 
            v-if="file.previewUrl" 
            :src="file.previewUrl" 
            :alt="file.name"
            class="preview-image"
          />
          <div v-else class="no-preview">
            <span class="no-preview-icon">🖼️</span>
            <p>暂无预览</p>
          </div>
        </div>
      </template>
      
      <template v-else-if="file.fileType === 'pdf'">
        <div class="document-preview">
          <div class="document-icon-large">📄</div>
          <h4>PDF 文档</h4>
          <p class="document-info">文件大小: {{ fileSize }}</p>
          <p class="document-info">更新时间: {{ file.updatedAt }}</p>
          <div class="document-actions">
            <button class="btn btn-primary" @click="handleDownload">
              📥 下载文件
            </button>
          </div>
        </div>
      </template>
      
      <template v-else-if="file.fileType === 'word'">
        <div class="document-preview">
          <div class="document-icon-large">📝</div>
          <h4>Word 文档</h4>
          <p class="document-info">文件大小: {{ fileSize }}</p>
          <p class="document-info">更新时间: {{ file.updatedAt }}</p>
          <div class="document-actions">
            <button class="btn btn-primary" @click="handleDownload">
              📥 下载文件
            </button>
          </div>
        </div>
      </template>
      
      <template v-else-if="file.fileType === 'excel'">
        <div class="document-preview">
          <div class="document-icon-large">📊</div>
          <h4>Excel 表格</h4>
          <p class="document-info">文件大小: {{ fileSize }}</p>
          <p class="document-info">更新时间: {{ file.updatedAt }}</p>
          <div class="document-actions">
            <button class="btn btn-primary" @click="handleDownload">
              📥 下载文件
            </button>
          </div>
        </div>
      </template>
      
      <template v-else-if="file.fileType === 'markdown'">
        <div class="markdown-preview">
          <div class="document-icon-large">📋</div>
          <h4>Markdown 文档</h4>
          <p class="document-info">文件大小: {{ fileSize }}</p>
          <p class="document-info">更新时间: {{ file.updatedAt }}</p>
          <div class="markdown-content">
            <pre>{{ sampleMarkdown }}</pre>
          </div>
        </div>
      </template>
      
      <template v-else>
        <div class="unknown-file-preview">
          <div class="unknown-icon-large">📄</div>
          <h4>{{ file.name }}</h4>
          <p class="unknown-info">文件类型: 未知</p>
          <p class="unknown-info">文件大小: {{ fileSize }}</p>
          <p class="unknown-info">更新时间: {{ file.updatedAt }}</p>
          <div class="unknown-actions">
            <button class="btn btn-primary" @click="handleDownload">
              📥 下载文件
            </button>
          </div>
        </div>
      </template>
    </div>
    
    <input 
      ref="fileInput"
      type="file"
      multiple
      style="display: none"
      @change="handleFileSelect"
    />
    
    <div 
      v-if="showRenameDialog"
      class="rename-dialog"
      @click.self="cancelRename"
    >
      <div class="dialog-content">
        <h4>重命名</h4>
        <input 
          v-model="newName"
          class="rename-input"
          @keyup.enter="confirmRename"
        />
        <div class="dialog-actions">
          <button class="btn btn-cancel" @click="cancelRename">取消</button>
          <button class="btn btn-primary" @click="confirmRename">确定</button>
        </div>
      </div>
    </div>
    
    <div 
      v-if="showDeleteConfirm"
      class="delete-confirm-dialog"
      @click.self="cancelDelete"
    >
      <div class="dialog-content">
        <h4>确认删除</h4>
        <p>确定要删除 <strong>{{ file?.name }}</strong> 吗？</p>
        <p v-if="file?.type === 'folder'" class="warning-text">
          ⚠️ 删除文件夹将同时删除其中的所有文件
        </p>
        <div class="dialog-actions">
          <button class="btn btn-cancel" @click="cancelDelete">取消</button>
          <button class="btn btn-danger" @click="confirmDelete">删除</button>
        </div>
      </div>
    </div>
  </div>
  
  <div v-else class="empty-preview">
    <div class="empty-icon">📁</div>
    <h3>选择文件查看预览</h3>
    <p>点击左侧文件列表中的文件或文件夹查看详情</p>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getFileIcon, formatFileSize } from '../utils/index.js'
import { renameFile, deleteFile, uploadFile } from '../api/file.js'

const props = defineProps({
  file: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['files-changed', 'file-deleted', 'upload'])

const fileInput = ref(null)
const pendingUploadParentId = ref(null)
const showRenameDialog = ref(false)
const newName = ref('')
const showDeleteConfirm = ref(false)

const fileIcon = computed(() => {
  if (!props.file) return ''
  return getFileIcon(props.file.type, props.file.fileType)
})

const fileSize = computed(() => {
  if (!props.file) return ''
  return formatFileSize(props.file.size)
})

const sampleMarkdown = `# 示例 Markdown 文档

这是一个示例的 Markdown 文档内容。

## 标题 2

- 列表项 1
- 列表项 2
- 列表项 3

\`\`\`javascript
console.log('Hello World');
\`\`\`

> 这是一段引用文本

**粗体** 和 *斜体* 文本。

[链接示例](https://example.com)
`

watch(() => props.file, () => {
  showRenameDialog.value = false
  showDeleteConfirm.value = false
})

function handleRename() {
  if (!props.file) return
  newName.value = props.file.name
  showRenameDialog.value = true
}

async function confirmRename() {
  if (!props.file || !newName.value.trim()) return
  
  const result = await renameFile(props.file.id, newName.value.trim())
  if (result.success) {
    showRenameDialog.value = false
    emit('files-changed')
  }
}

function cancelRename() {
  showRenameDialog.value = false
}

function handleDelete() {
  if (!props.file) return
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  if (!props.file) return
  
  const result = await deleteFile(props.file.id)
  if (result.success) {
    showDeleteConfirm.value = false
    emit('file-deleted', props.file.id)
    emit('files-changed')
  }
}

function cancelDelete() {
  showDeleteConfirm.value = false
}

function handleUpload(parentId) {
  pendingUploadParentId.value = parentId
  fileInput.value?.click()
}

function handleFileSelect(e) {
  const files = e.target.files
  if (files.length > 0) {
    handleUploadFiles(pendingUploadParentId.value, files)
  }
  e.target.value = ''
}

async function handleUploadFiles(parentId, fileList) {
  for (const file of fileList) {
    const result = await uploadFile(parentId, file)
    if (result.success) {
      console.log('Uploaded:', result.data.name)
    }
  }
  emit('files-changed')
}

function handleDownload() {
  alert('下载功能 - 实际项目中可调用真实的下载 API')
}
</script>

<style scoped>
.file-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  background-color: #fafafa;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-icon {
  font-size: 32px;
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.file-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.file-meta {
  margin: 0;
  font-size: 12px;
  color: var(--text-secondary);
}

.separator {
  margin: 0 8px;
}

.preview-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background-color: var(--bg-color);
  font-size: 13px;
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition);
}

.action-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.action-delete:hover {
  border-color: var(--danger-color);
  color: var(--danger-color);
}

.preview-content {
  flex: 1;
  overflow-y: auto;
  padding: 40px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.folder-preview,
.document-preview,
.unknown-file-preview,
.markdown-preview {
  text-align: center;
  max-width: 500px;
}

.folder-icon-large,
.document-icon-large,
.unknown-icon-large {
  font-size: 80px;
  margin-bottom: 20px;
}

.folder-preview h4,
.document-preview h4,
.unknown-file-preview h4,
.markdown-preview h4 {
  margin: 0 0 16px 0;
  font-size: 20px;
  color: var(--text-primary);
}

.folder-info,
.document-info,
.unknown-info {
  margin: 8px 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.folder-actions,
.document-actions,
.unknown-actions {
  margin-top: 24px;
}

.image-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}

.no-preview {
  text-align: center;
  color: var(--text-secondary);
}

.no-preview-icon {
  font-size: 60px;
  display: block;
  margin-bottom: 16px;
}

.markdown-content {
  margin-top: 24px;
  text-align: left;
  background-color: #f5f5f5;
  border-radius: var(--radius-md);
  padding: 16px;
  overflow-x: auto;
}

.markdown-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: var(--mono, monospace);
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-primary);
}

.empty-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  background-color: #fafafa;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 24px;
  opacity: 0.5;
}

.empty-preview h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: var(--text-primary);
}

.empty-preview p {
  margin: 0;
  font-size: 14px;
}

.rename-dialog,
.delete-confirm-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background-color: var(--bg-color);
  border-radius: var(--radius-md);
  padding: 20px;
  min-width: 300px;
  box-shadow: var(--shadow-md);
}

.dialog-content h4 {
  margin: 0 0 16px 0;
  font-size: 15px;
  font-weight: 600;
}

.dialog-content p {
  margin: 0 0 12px 0;
  color: var(--text-secondary);
}

.warning-text {
  color: var(--warning-color) !important;
  font-size: 12px;
}

.rename-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 14px;
  outline: none;
  transition: var(--transition);
  margin-bottom: 16px;
}

.rename-input:focus {
  border-color: var(--primary-color);
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  cursor: pointer;
  transition: var(--transition);
}

.btn-cancel {
  border: 1px solid var(--border-color);
  background-color: var(--bg-color);
  color: var(--text-primary);
}

.btn-cancel:hover {
  border-color: var(--text-secondary);
}

.btn-primary {
  border: none;
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
}

.btn-danger {
  border: none;
  background-color: var(--danger-color);
  color: white;
}

.btn-danger:hover {
  opacity: 0.8;
}
</style>
