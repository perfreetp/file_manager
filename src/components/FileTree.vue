<template>
  <div class="file-tree">
    <div class="tree-header">
      <h3>文件目录</h3>
      <div class="header-actions">
        <button 
          class="action-btn"
          @click="handleCreateFolder"
          title="新建文件夹"
        >
          📁 +
        </button>
        <button 
          class="action-btn"
          @click="handleUploadRoot"
          title="上传文件"
        >
          📤
        </button>
        <button 
          class="action-btn"
          @click="handleRefresh"
          title="刷新"
          :disabled="loading"
        >
          🔄
        </button>
      </div>
    </div>
    
    <div 
      class="tree-content" 
      v-if="!loading"
      :class="{ 'is-dragover': isRootDragOver }"
      @dragover="handleRootDragOver"
      @dragleave="handleRootDragLeave"
      @drop="handleRootDrop"
    >
      <div v-if="isDragging && files.length > 0" class="drop-hint">
        📁 拖动到此处移至根目录
      </div>
      
      <div v-if="files.length === 0" class="empty-state">
        暂无文件，点击上传按钮添加文件
      </div>
      
      <TreeNode
        v-for="file in files"
        :key="file.id"
        :node="file"
        :selected="selectedFile?.id === file.id"
        :selected-file="selectedFile"
        @select="handleSelect"
        @expand="handleExpand"
        @rename="handleRename"
        @delete="handleDelete"
        @upload="handleUpload"
        @move="handleMove"
        @drag-start="handleDragStart"
        @drag-end="handleDragEnd"
        @context-menu="handleContextMenu"
      />
    </div>
    
    <div v-else class="loading-state">
      加载中...
    </div>
    
    <ContextMenu
      :visible="contextMenuVisible"
      :position="contextMenuPosition"
      :menu-items="contextMenuItems"
      @close="closeContextMenu"
      @action="handleContextMenuAction"
    />
    
    <input 
      ref="fileInput"
      type="file"
      multiple
      style="display: none"
      @change="handleFileSelect"
    />
    
    <div 
      v-if="showCreateFolder"
      class="create-folder-dialog"
      @click.self="cancelCreateFolder"
    >
      <div class="dialog-content">
        <h4>新建文件夹</h4>
        <input 
          v-model="newFolderName"
          class="folder-name-input"
          placeholder="请输入文件夹名称"
          @keyup.enter="confirmCreateFolder"
        />
        <div class="dialog-actions">
          <button class="btn btn-cancel" @click="cancelCreateFolder">取消</button>
          <button class="btn btn-primary" @click="confirmCreateFolder">确定</button>
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
        <p>确定要删除 <strong>{{ fileToDelete?.name }}</strong> 吗？</p>
        <p v-if="fileToDelete?.type === 'folder'" class="warning-text">
          ⚠️ 删除文件夹将同时删除其中的所有文件
        </p>
        <div class="dialog-actions">
          <button class="btn btn-cancel" @click="cancelDelete">取消</button>
          <button class="btn btn-danger" @click="confirmDelete">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import TreeNode from './TreeNode.vue'
import ContextMenu from './ContextMenu.vue'
import { getRootFiles, renameFile, deleteFile, uploadFile, createFolder, moveFile } from '../api/file.js'

const emit = defineEmits(['select', 'preview', 'files-changed'])

const files = ref([])
const selectedFile = ref(null)
const loading = ref(false)
const fileInput = ref(null)
const pendingUploadParentId = ref(null)
const showCreateFolder = ref(false)
const newFolderName = ref('')
const showDeleteConfirm = ref(false)
const fileToDelete = ref(null)
const isDragging = ref(false)
const isRootDragOver = ref(false)
const draggedItem = ref(null)

const contextMenuVisible = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const contextMenuFile = ref(null)

const contextMenuItems = computed(() => {
  if (!contextMenuFile.value) return []
  
  const items = [
    {
      icon: '✏️',
      label: '重命名',
      action: 'rename',
      shortcut: 'F2'
    },
    {
      icon: '🗑️',
      label: '删除',
      action: 'delete',
      danger: true,
      divider: true
    }
  ]
  
  if (contextMenuFile.value.type === 'folder') {
    items.unshift({
      icon: '📤',
      label: '上传文件到此',
      action: 'upload'
    })
    items.unshift({
      icon: '📁',
      label: '新建文件夹',
      action: 'newFolder'
    })
  }
  
  return items
})

async function loadFiles() {
  loading.value = true
  try {
    const result = await getRootFiles()
    if (result.success) {
      files.value = result.data
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadFiles()
})

function handleSelect(file) {
  selectedFile.value = file
  emit('select', file)
}

function handleExpand({ node, expanded }) {
  console.log('Node expanded:', node.name, expanded)
}

async function handleRename({ id, name }) {
  const result = await renameFile(id, name)
  if (result.success) {
    emit('files-changed')
    await loadFiles()
  }
}

function handleDelete(file) {
  fileToDelete.value = file
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  if (!fileToDelete.value) return
  
  const result = await deleteFile(fileToDelete.value.id)
  if (result.success) {
    if (selectedFile.value?.id === fileToDelete.value.id) {
      selectedFile.value = null
    }
    showDeleteConfirm.value = false
    fileToDelete.value = null
    emit('files-changed')
    await loadFiles()
  }
}

function cancelDelete() {
  showDeleteConfirm.value = false
  fileToDelete.value = null
}

function handleUpload(data) {
  if (data.files) {
    handleUploadFiles(data.parentId, data.files)
  } else {
    pendingUploadParentId.value = data
    fileInput.value?.click()
  }
}

function handleUploadRoot() {
  pendingUploadParentId.value = null
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
  await loadFiles()
}

function handleCreateFolder() {
  newFolderName.value = ''
  showCreateFolder.value = true
}

async function confirmCreateFolder() {
  if (!newFolderName.value.trim()) return
  
  const result = await createFolder(
    selectedFile.value?.type === 'folder' ? selectedFile.value.id : null,
    newFolderName.value.trim()
  )
  
  if (result.success) {
    showCreateFolder.value = false
    newFolderName.value = ''
    emit('files-changed')
    await loadFiles()
  }
}

function cancelCreateFolder() {
  showCreateFolder.value = false
  newFolderName.value = ''
}

function handleDragStart(item) {
  isDragging.value = true
  draggedItem.value = item
}

function handleDragEnd() {
  isDragging.value = false
  draggedItem.value = null
  isRootDragOver.value = false
}

async function handleMove({ sourceId, targetId }) {
  if (!sourceId || !targetId) return
  
  if (sourceId === targetId) return
  
  if (draggedItem.value) {
    let isDescendant = false
    try {
      isDescendant = await checkIsDescendant(targetId, sourceId)
    } catch (e) {
      console.error('Error checking descendant:', e)
    }
    if (isDescendant) {
      console.log('不能将文件夹移动到其子文件夹中')
      return
    }
  }
  
  const result = await moveFile(sourceId, targetId)
  if (result.success) {
    emit('files-changed')
    await loadFiles()
  }
}

function handleRootDragOver(e) {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
  isRootDragOver.value = true
}

function handleRootDragLeave(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const x = e.clientX
  const y = e.clientY
  
  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    isRootDragOver.value = false
  }
}

async function handleRootDrop(e) {
  e.preventDefault()
  isRootDragOver.value = false
  
  const internalData = e.dataTransfer.getData('text/plain')
  
  if (internalData) {
    try {
      const sourceData = JSON.parse(internalData)
      if (sourceData.id) {
        if (sourceData.parentId === null) {
          return
        }
        
        const result = await moveFile(sourceData.id, null)
        if (result.success) {
          emit('files-changed')
          await loadFiles()
        }
      }
      return
    } catch (err) {
      // 不是内部文件
    }
  }
  
  if (e.dataTransfer.files.length > 0) {
    handleUploadFiles(null, e.dataTransfer.files)
  }
}

async function checkIsDescendant(ancestorId, descendantId) {
  if (ancestorId === descendantId) return true
  
  const checkInFiles = (filesList) => {
    for (const file of filesList) {
      if (file.id === descendantId) {
        return file.parentId === ancestorId
      }
      if (file.children && file.children.length > 0) {
        if (checkInFiles(file.children)) {
          return true
        }
      }
    }
    return false
  }
  
  return checkInFiles(files.value)
}

function handleRefresh() {
  loadFiles()
}

function handleContextMenu(data) {
  contextMenuFile.value = data.file
  contextMenuPosition.value = data.position
  contextMenuVisible.value = true
}

function closeContextMenu() {
  contextMenuVisible.value = false
  contextMenuFile.value = null
}

function handleContextMenuAction(action) {
  if (!contextMenuFile.value) return
  
  switch (action) {
    case 'rename':
      selectedFile.value = contextMenuFile.value
      handleRename({ id: contextMenuFile.value.id, name: contextMenuFile.value.name })
      break
    case 'delete':
      selectedFile.value = contextMenuFile.value
      handleDelete(contextMenuFile.value)
      break
    case 'upload':
      if (contextMenuFile.value.type === 'folder') {
        pendingUploadParentId.value = contextMenuFile.value.id
        fileInput.value?.click()
      }
      break
    case 'newFolder':
      if (contextMenuFile.value.type === 'folder') {
        selectedFile.value = contextMenuFile.value
        handleCreateFolder()
      }
      break
  }
  
  closeContextMenu()
}

function expandToFile(fileId) {
  // 递归展开到指定文件
}

defineExpose({
  refresh: loadFiles,
  expandToFile
})
</script>

<style scoped>
.file-tree {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
  border-right: 1px solid var(--border-color);
}

.tree-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  background-color: #fafafa;
}

.tree-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background-color: var(--bg-color);
  font-size: 12px;
  cursor: pointer;
  transition: var(--transition);
}

.action-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tree-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  position: relative;
  transition: var(--transition);
}

.tree-content.is-dragover {
  background-color: var(--bg-selected);
}

.drop-hint {
  padding: 12px;
  margin-bottom: 8px;
  background-color: var(--bg-selected);
  border: 2px dashed var(--primary-color);
  border-radius: var(--radius-sm);
  text-align: center;
  color: var(--primary-color);
  font-size: 13px;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 13px;
}

.loading-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.create-folder-dialog,
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

.folder-name-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 14px;
  outline: none;
  transition: var(--transition);
  margin-bottom: 16px;
}

.folder-name-input:focus {
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
