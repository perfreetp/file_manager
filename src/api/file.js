import { initialFiles, childFiles } from '../mock/data.js'
import { generateId, getFileExtension, getFileTypeByExtension } from '../utils/index.js'

let filesData = JSON.parse(JSON.stringify(initialFiles))
let loadedChildren = {}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

function findFileById(files, id) {
  for (const file of files) {
    if (file.id === id) return file
    if (file.children && file.children.length > 0) {
      const found = findFileById(file.children, id)
      if (found) return found
    }
  }
  return null
}

function findParentFiles(files, parentId) {
  if (parentId === null) return files
  for (const file of files) {
    if (file.id === parentId) return file.children
    if (file.children && file.children.length > 0) {
      const found = findParentFiles(file.children, parentId)
      if (found) return found
    }
  }
  return null
}

function cloneFile(file) {
  return JSON.parse(JSON.stringify(file))
}

export async function getRootFiles() {
  await delay(200)
  return {
    success: true,
    data: filesData.map(cloneFile)
  }
}

export async function getChildren(parentId) {
  await delay(300)
  
  if (loadedChildren[parentId]) {
    return {
      success: true,
      data: loadedChildren[parentId].map(cloneFile)
    }
  }
  
  if (childFiles[parentId]) {
    loadedChildren[parentId] = childFiles[parentId].map(cloneFile)
    return {
      success: true,
      data: loadedChildren[parentId].map(cloneFile)
    }
  }
  
  return {
    success: true,
    data: []
  }
}

export async function renameFile(fileId, newName) {
  await delay(200)
  
  const file = findFileById(filesData, fileId)
  
  if (!file) {
    return {
      success: false,
      message: '文件不存在'
    }
  }
  
  file.name = newName
  file.updatedAt = new Date().toLocaleString('zh-CN')
  
  return {
    success: true,
    data: cloneFile(file)
  }
}

export async function deleteFile(fileId) {
  await delay(200)
  
  function removeFromArray(arr, id) {
    const index = arr.findIndex(f => f.id === id)
    if (index > -1) {
      arr.splice(index, 1)
      return true
    }
    for (const file of arr) {
      if (file.children && file.children.length > 0) {
        if (removeFromArray(file.children, id)) {
          return true
        }
      }
    }
    return false
  }
  
  const deleted = removeFromArray(filesData, fileId)
  
  if (!deleted) {
    for (const pid in loadedChildren) {
      const index = loadedChildren[pid].findIndex(f => f.id === fileId)
      if (index > -1) {
        loadedChildren[pid].splice(index, 1)
        return { success: true }
      }
    }
  }
  
  return { success: true }
}

export async function uploadFile(parentId, file) {
  await delay(500)
  
  const extension = getFileExtension(file.name)
  const fileType = getFileTypeByExtension(extension)
  
  const newFile = {
    id: generateId(),
    name: file.name,
    type: 'file',
    fileType: fileType,
    parentId: parentId,
    hasChildren: false,
    loaded: true,
    children: [],
    createdAt: new Date().toLocaleString('zh-CN'),
    updatedAt: new Date().toLocaleString('zh-CN'),
    size: file.size,
    previewUrl: fileType === 'image' ? URL.createObjectURL(file) : null
  }
  
  if (parentId === null) {
    filesData.push(newFile)
  } else if (loadedChildren[parentId]) {
    loadedChildren[parentId].push(newFile)
  } else {
    if (!loadedChildren[parentId]) {
      loadedChildren[parentId] = []
    }
    loadedChildren[parentId].push(newFile)
  }
  
  return {
    success: true,
    data: cloneFile(newFile)
  }
}

export async function createFolder(parentId, name) {
  await delay(200)
  
  const newFolder = {
    id: generateId(),
    name: name,
    type: 'folder',
    parentId: parentId,
    hasChildren: false,
    loaded: true,
    children: [],
    createdAt: new Date().toLocaleString('zh-CN'),
    updatedAt: new Date().toLocaleString('zh-CN'),
    size: 0
  }
  
  if (parentId === null) {
    filesData.push(newFolder)
  } else if (loadedChildren[parentId]) {
    loadedChildren[parentId].push(newFolder)
    const parent = findFileById(filesData, parentId)
    if (parent) {
      parent.hasChildren = true
    }
  }
  
  return {
    success: true,
    data: cloneFile(newFolder)
  }
}

export async function getFileDetail(fileId) {
  await delay(100)
  
  const file = findFileById(filesData, fileId)
  
  if (file) {
    return {
      success: true,
      data: cloneFile(file)
    }
  }
  
  for (const pid in loadedChildren) {
    const found = loadedChildren[pid].find(f => f.id === fileId)
    if (found) {
      return {
        success: true,
        data: cloneFile(found)
      }
    }
  }
  
  return {
    success: false,
    message: '文件不存在'
  }
}

function isDescendant(folderId, targetId, filesList) {
  if (folderId === targetId) return true
  
  for (const file of filesList) {
    if (file.id === folderId) {
      if (file.children && file.children.length > 0) {
        return checkIdInChildren(file.children, targetId)
      }
      return false
    }
    if (file.children && file.children.length > 0) {
      if (isDescendant(folderId, targetId, file.children)) {
        return true
      }
    }
  }
  
  for (const pid in loadedChildren) {
    if (isDescendantInLoadedChildren(folderId, targetId, loadedChildren[pid])) {
      return true
    }
  }
  
  return false
}

function checkIdInChildren(children, targetId) {
  for (const child of children) {
    if (child.id === targetId) return true
    if (child.children && child.children.length > 0) {
      if (checkIdInChildren(child.children, targetId)) {
        return true
      }
    }
  }
  return false
}

function isDescendantInLoadedChildren(folderId, targetId, filesList) {
  for (const file of filesList) {
    if (file.id === folderId) {
      if (file.children && file.children.length > 0) {
        return checkIdInChildren(file.children, targetId)
      }
      return false
    }
    if (file.children && file.children.length > 0) {
      if (isDescendantInLoadedChildren(folderId, targetId, file.children)) {
        return true
      }
    }
  }
  return false
}

function findAndRemoveFile(fileId) {
  function removeFromArray(arr) {
    const index = arr.findIndex(f => f.id === fileId)
    if (index > -1) {
      return arr.splice(index, 1)[0]
    }
    for (const file of arr) {
      if (file.children && file.children.length > 0) {
        const removed = removeFromArray(file.children)
        if (removed) return removed
      }
    }
    return null
  }
  
  let removed = removeFromArray(filesData)
  if (removed) return removed
  
  for (const pid in loadedChildren) {
    const index = loadedChildren[pid].findIndex(f => f.id === fileId)
    if (index > -1) {
      return loadedChildren[pid].splice(index, 1)[0]
    }
  }
  
  return null
}

function updateChildrenHasChildren(filesList, parentId) {
  for (const file of filesList) {
    if (file.id === parentId) {
      file.hasChildren = file.children && file.children.length > 0
      return
    }
    if (file.children && file.children.length > 0) {
      updateChildrenHasChildren(file.children, parentId)
    }
  }
}

export async function moveFile(sourceId, targetId) {
  await delay(200)
  
  if (sourceId === targetId) {
    return {
      success: false,
      message: '不能移动到自身'
    }
  }
  
  if (targetId !== null) {
    if (isDescendant(sourceId, targetId, filesData)) {
      return {
        success: false,
        message: '不能将文件夹移动到其子文件夹中'
      }
    }
  }
  
  const sourceFile = findAndRemoveFile(sourceId)
  
  if (!sourceFile) {
    return {
      success: false,
      message: '源文件不存在'
    }
  }
  
  const oldParentId = sourceFile.parentId
  
  sourceFile.parentId = targetId
  sourceFile.updatedAt = new Date().toLocaleString('zh-CN')
  
  if (targetId === null) {
    filesData.push(sourceFile)
  } else {
    const targetParent = findFileById(filesData, targetId)
    
    if (targetParent) {
      if (!targetParent.children) {
        targetParent.children = []
      }
      targetParent.children.push(sourceFile)
      targetParent.hasChildren = true
    } else {
      if (!loadedChildren[targetId]) {
        loadedChildren[targetId] = []
      }
      loadedChildren[targetId].push(sourceFile)
    }
  }
  
  if (oldParentId !== null) {
    const oldParent = findFileById(filesData, oldParentId)
    if (oldParent) {
      oldParent.hasChildren = oldParent.children && oldParent.children.length > 0
    }
    if (loadedChildren[oldParentId]) {
      updateChildrenHasChildren(loadedChildren[oldParentId], oldParentId)
    }
  }
  
  return {
    success: true,
    data: cloneFile(sourceFile)
  }
}
