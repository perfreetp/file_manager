export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getFileIcon(type, fileType) {
  if (type === 'folder') {
    return '📁'
  }
  
  const icons = {
    pdf: '📄',
    word: '📝',
    excel: '📊',
    image: '🖼️',
    markdown: '📋',
    default: '📄'
  }
  
  return icons[fileType] || icons.default
}

export function getFileExtension(filename) {
  const ext = filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase()
  return ext
}

export function getFileTypeByExtension(ext) {
  const typeMap = {
    pdf: 'pdf',
    doc: 'word',
    docx: 'word',
    xls: 'excel',
    xlsx: 'excel',
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    gif: 'image',
    webp: 'image',
    md: 'markdown'
  }
  return typeMap[ext.toLowerCase()] || 'default'
}

export function debounce(fn, delay) {
  let timer = null
  return function(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}
