<template>
  <Teleport to="body">
    <div 
      v-if="visible && menuItems.length > 0"
      class="context-menu-mask"
      @click="handleMaskClick"
    >
      <div 
        class="context-menu"
        :style="menuStyle"
        ref="menuRef"
        @click.stop
      >
        <div 
          v-for="(item, index) in menuItems"
          :key="index"
          class="menu-item"
          :class="{ 
            'is-danger': item.danger,
            'is-disabled': item.disabled,
            'has-divider': item.divider
          }"
          @click="handleItemClick(item)"
        >
          <span class="menu-icon" v-if="item.icon">{{ item.icon }}</span>
          <span class="menu-label">{{ item.label }}</span>
          <span class="menu-shortcut" v-if="item.shortcut">{{ item.shortcut }}</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  },
  menuItems: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'action'])

const menuRef = ref(null)
const adjustedPosition = ref({ x: 0, y: 0 })

const MENU_WIDTH = 180
const MENU_PADDING = 8

const menuStyle = computed(() => ({
  left: `${adjustedPosition.value.x}px`,
  top: `${adjustedPosition.value.y}px`
}))

function adjustPosition() {
  let x = props.position.x
  let y = props.position.y
  
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  
  if (x + MENU_WIDTH > windowWidth - MENU_PADDING) {
    x = windowWidth - MENU_WIDTH - MENU_PADDING
  }
  
  if (x < MENU_PADDING) {
    x = MENU_PADDING
  }
  
  if (menuRef.value) {
    const menuHeight = menuRef.value.offsetHeight
    if (y + menuHeight > windowHeight - MENU_PADDING) {
      y = windowHeight - menuHeight - MENU_PADDING
    }
  }
  
  if (y < MENU_PADDING) {
    y = MENU_PADDING
  }
  
  adjustedPosition.value = { x, y }
}

function handleMaskClick() {
  emit('close')
}

function handleItemClick(item) {
  if (item.disabled) return
  emit('action', item.action)
  emit('close')
}

function handleKeyDown(e) {
  if (e.key === 'Escape' && props.visible) {
    emit('close')
  }
}

watch(() => props.visible, (newVal) => {
  if (newVal) {
    adjustPosition()
  }
})

watch(() => props.position, () => {
  if (props.visible) {
    adjustPosition()
  }
}, { deep: true })

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.context-menu-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
}

.context-menu {
  position: fixed;
  min-width: 160px;
  max-width: 280px;
  background-color: var(--bg-color, #ffffff);
  border-radius: var(--radius-sm, 4px);
  box-shadow: 
    0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
  padding: 4px 0;
  z-index: 10000;
  border: 1px solid var(--border-color, #d9d9d9);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  font-size: 14px;
  color: var(--text-primary, #000000d9);
  cursor: pointer;
  transition: var(--transition, all 0.2s ease);
  line-height: 1.5;
}

.menu-item:hover:not(.is-disabled) {
  background-color: var(--bg-hover, #f5f5f5);
}

.menu-item.has-divider {
  margin-top: 4px;
  border-top: 1px solid var(--border-color, #f0f0f0);
  padding-top: 8px;
}

.menu-item.is-danger {
  color: var(--danger-color, #ff4d4f);
}

.menu-item.is-danger:hover:not(.is-disabled) {
  background-color: #fff1f0;
}

.menu-item.is-disabled {
  color: var(--text-disabled, #00000040);
  cursor: not-allowed;
}

.menu-icon {
  width: 18px;
  margin-right: 8px;
  text-align: center;
  font-size: 14px;
}

.menu-label {
  flex: 1;
}

.menu-shortcut {
  margin-left: 20px;
  font-size: 12px;
  color: var(--text-secondary, #00000073);
}
</style>
