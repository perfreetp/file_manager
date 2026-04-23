<template>
  <div class="tree-node">
    <div 
      class="tree-node-content"
      :class="{ 
        'is-selected': selected, 
        'is-dragover': isDragOver,
        'is-loading': loading,
        'is-dragging': isDragging
      }"
      draggable="true"
      @click="handleSelect"
      @contextmenu="handleContextMenu"
      @dragstart="handleDragStart"
      @dragend="handleDragEnd"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <span 
        v-if="node.type === 'folder'"
        class="expand-icon"
        @click.stop="toggleExpand"
      >
        <span v-if="loading" class="loading-icon">⏳</span>
        <span v-else-if="node.hasChildren">{{ expanded ? '▼' : '▶' }}</span>
        <span v-else class="empty-icon"></span>
      </span>
      <span v-else class="expand-placeholder"></span>
      
      <span class="file-icon">{{ fileIcon }}</span>
      
      <template v-if="isRenaming">
        <input 
          ref="renameInput"
          v-model="newName"
          class="rename-input"
          @click.stop
          @blur="finishRename"
          @keyup.enter="finishRename"
          @keyup.esc="cancelRename"
        />
      </template>
      <span v-else class="file-name">{{ node.name }}</span>
      
      <div v-if="showActions" class="node-actions">
        <button 
          v-if="node.type === 'folder'"
          class="action-btn"
          @click.stop="handleUpload"
          title="上传文件"
        >
          📤
        </button>
        <button 
          class="action-btn"
          @click.stop="handleRename"
          title="重命名"
        >
          ✏️
        </button>
        <button 
          class="action-btn action-delete"
          @click.stop="handleDelete"
          title="删除"
        >
          🗑️
        </button>
      </div>
    </div>
    
    <div 
      v-if="node.type === 'folder' && expanded && children.length > 0"
      class="tree-children"
    >
      <TreeNode
        v-for="child in children"
        :key="child.id"
        :node="child"
        :selected="selectedFile?.id === child.id"
        :selected-file="selectedFile"
        @select="$emit('select', $event)"
        @expand="$emit('expand', $event)"
        @rename="$emit('rename', $event)"
        @delete="$emit('delete', $event)"
        @upload="$emit('upload', { parentId: child.id, event: $event })"
      />
    </div>
    
    <div v-if="node.type === 'folder' && expanded && children.length === 0 && !loading" class="empty-folder">
      空文件夹
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { getFileIcon } from '../utils/index.js'
import { getChildren } from '../api/file.js'

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  },
  selectedFile: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['select', 'expand', 'rename', 'delete', 'upload', 'drag-start', 'drag-end', 'move'])

const expanded = ref(false)
const loading = ref(false)
const children = ref([])
const isRenaming = ref(false)
const newName = ref('')
const showActions = ref(false)
const isDragOver = ref(false)
const isDragging = ref(false)
const renameInput = ref(null)

const fileIcon = computed(() => getFileIcon(props.node.type, props.node.fileType))

watch(() => props.node.children, (newChildren) => {
  if (newChildren && newChildren.length > 0) {
    children.value = newChildren
  }
}, { immediate: true })

function handleSelect() {
  emit('select', props.node)
}

function handleContextMenu(e) {
  e.preventDefault()
  emit('select', props.node)
}

async function toggleExpand() {
  if (!props.node.hasChildren) return
  
  if (!expanded.value && !props.node.loaded) {
    loading.value = true
    const result = await getChildren(props.node.id)
    loading.value = false
    
    if (result.success) {
      children.value = result.data
      props.node.loaded = true
      props.node.children = result.data
    }
  }
  
  expanded.value = !expanded.value
  emit('expand', { node: props.node, expanded: expanded.value })
}

function handleRename() {
  newName.value = props.node.name
  isRenaming.value = true
  nextTick(() => {
    if (renameInput.value) {
      renameInput.value.focus()
      renameInput.value.select()
    }
  })
}

function finishRename() {
  if (newName.value.trim() && newName.value.trim() !== props.node.name) {
    emit('rename', { id: props.node.id, name: newName.value.trim() })
  }
  isRenaming.value = false
}

function cancelRename() {
  isRenaming.value = false
}

function handleDelete() {
  emit('delete', props.node)
}

function handleUpload() {
  emit('upload', props.node.id)
}

function handleDragStart(e) {
  isDragging.value = true
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', JSON.stringify({
    id: props.node.id,
    name: props.node.name,
    type: props.node.type,
    parentId: props.node.parentId
  }))
  emit('drag-start', props.node)
}

function handleDragEnd() {
  isDragging.value = false
  emit('drag-end', props.node)
}

function handleDragOver(e) {
  if (props.node.type === 'folder') {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    isDragOver.value = true
  }
}

function handleDragLeave() {
  isDragOver.value = false
}

function handleDrop(e) {
  e.preventDefault()
  e.stopPropagation()
  isDragOver.value = false
  
  const internalData = e.dataTransfer.getData('text/plain')
  
  if (internalData) {
    try {
      const sourceData = JSON.parse(internalData)
      if (sourceData.id && sourceData.id !== props.node.id) {
        if (props.node.type === 'folder') {
          emit('move', {
            sourceId: sourceData.id,
            targetId: props.node.id
          })
        }
      }
      return
    } catch (err) {
      // 不是内部文件，可能是外部文件
    }
  }
  
  if (props.node.type === 'folder' && e.dataTransfer.files.length > 0) {
    emit('upload', { parentId: props.node.id, files: e.dataTransfer.files })
  }
}
</script>

<style scoped>
.tree-node {
  user-select: none;
}

.tree-node-content {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition);
  position: relative;
}

.tree-node-content:hover {
  background-color: var(--bg-hover);
}

.tree-node-content:hover .node-actions {
  opacity: 1;
}

.tree-node-content.is-selected {
  background-color: var(--bg-selected);
}

.tree-node-content.is-dragover {
  background-color: var(--bg-selected);
  border: 1px dashed var(--primary-color);
}

.tree-node-content.is-loading {
  opacity: 0.7;
}

.tree-node-content.is-dragging {
  opacity: 0.4;
}

.expand-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: var(--text-secondary);
  margin-right: 4px;
  flex-shrink: 0;
}

.expand-icon:hover {
  color: var(--text-primary);
}

.empty-icon {
  width: 16px;
  display: inline-block;
}

.expand-placeholder {
  width: 20px;
  flex-shrink: 0;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.file-icon {
  font-size: 16px;
  margin-right: 6px;
  flex-shrink: 0;
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.rename-input {
  flex: 1;
  min-width: 0;
  padding: 2px 4px;
  border: 1px solid var(--primary-color);
  border-radius: var(--radius-sm);
  outline: none;
  font-size: inherit;
}

.node-actions {
  display: flex;
  gap: 4px;
  margin-left: 8px;
  opacity: 0;
  transition: var(--transition);
}

.action-btn {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  font-size: 12px;
  opacity: 0.7;
  transition: var(--transition);
}

.action-btn:hover {
  background-color: var(--bg-hover);
  opacity: 1;
}

.action-delete:hover {
  color: var(--danger-color);
}

.tree-children {
  margin-left: 24px;
  border-left: 1px solid var(--border-color);
  padding-left: 4px;
}

.empty-folder {
  margin-left: 24px;
  padding: 8px 16px;
  color: var(--text-secondary);
  font-size: 12px;
  font-style: italic;
}
</style>
