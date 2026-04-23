export const initialFiles = [
  {
    id: '1',
    name: '文档',
    type: 'folder',
    parentId: null,
    hasChildren: true,
    loaded: false,
    children: null,
    createdAt: '2024-01-15 10:30:00',
    updatedAt: '2024-03-20 14:45:00',
    size: 0
  },
  {
    id: '2',
    name: '图片',
    type: 'folder',
    parentId: null,
    hasChildren: true,
    loaded: false,
    children: null,
    createdAt: '2024-02-01 09:00:00',
    updatedAt: '2024-03-18 16:20:00',
    size: 0
  },
  {
    id: '3',
    name: '项目报告.pdf',
    type: 'file',
    fileType: 'pdf',
    parentId: null,
    hasChildren: false,
    loaded: true,
    children: [],
    createdAt: '2024-03-10 11:20:00',
    updatedAt: '2024-03-10 11:20:00',
    size: 2560000,
    previewUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=PDF%20document%20preview%20icon%20with%20red%20accent&image_size=square'
  },
  {
    id: '4',
    name: 'README.md',
    type: 'file',
    fileType: 'markdown',
    parentId: null,
    hasChildren: false,
    loaded: true,
    children: [],
    createdAt: '2024-03-05 08:15:00',
    updatedAt: '2024-03-15 10:30:00',
    size: 12500,
    previewUrl: null
  }
]

export const childFiles = {
  '1': [
    {
      id: '1-1',
      name: '工作文档',
      type: 'folder',
      parentId: '1',
      hasChildren: true,
      loaded: false,
      children: null,
      createdAt: '2024-01-20 14:00:00',
      updatedAt: '2024-03-12 09:30:00',
      size: 0
    },
    {
      id: '1-2',
      name: '个人文档',
      type: 'folder',
      parentId: '1',
      hasChildren: false,
      loaded: true,
      children: [],
      createdAt: '2024-02-10 16:45:00',
      updatedAt: '2024-02-10 16:45:00',
      size: 0
    },
    {
      id: '1-3',
      name: '会议记录.docx',
      type: 'file',
      fileType: 'word',
      parentId: '1',
      hasChildren: false,
      loaded: true,
      children: [],
      createdAt: '2024-03-08 10:00:00',
      updatedAt: '2024-03-09 15:20:00',
      size: 512000,
      previewUrl: null
    },
    {
      id: '1-4',
      name: '财务报表.xlsx',
      type: 'file',
      fileType: 'excel',
      parentId: '1',
      hasChildren: false,
      loaded: true,
      children: [],
      createdAt: '2024-03-15 11:30:00',
      updatedAt: '2024-03-15 11:30:00',
      size: 1024000,
      previewUrl: null
    }
  ],
  '2': [
    {
      id: '2-1',
      name: '风景照片',
      type: 'folder',
      parentId: '2',
      hasChildren: false,
      loaded: true,
      children: [],
      createdAt: '2024-02-05 10:00:00',
      updatedAt: '2024-03-10 14:20:00',
      size: 0
    },
    {
      id: '2-2',
      name: '团队合影.jpg',
      type: 'file',
      fileType: 'image',
      parentId: '2',
      hasChildren: false,
      loaded: true,
      children: [],
      createdAt: '2024-03-01 09:00:00',
      updatedAt: '2024-03-01 09:00:00',
      size: 3584000,
      previewUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Professional%20team%20photo%20in%20office%20environment%20happy%20employees&image_size=landscape_16_9'
    },
    {
      id: '2-3',
      name: '产品展示.png',
      type: 'file',
      fileType: 'image',
      parentId: '2',
      hasChildren: false,
      loaded: true,
      children: [],
      createdAt: '2024-03-12 16:30:00',
      updatedAt: '2024-03-12 16:30:00',
      size: 2048000,
      previewUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Modern%20product%20showcase%20with%20clean%20minimal%20design%20tech%20gadget&image_size=landscape_16_9'
    }
  ],
  '1-1': [
    {
      id: '1-1-1',
      name: '需求文档.pdf',
      type: 'file',
      fileType: 'pdf',
      parentId: '1-1',
      hasChildren: false,
      loaded: true,
      children: [],
      createdAt: '2024-02-20 10:30:00',
      updatedAt: '2024-03-10 14:00:00',
      size: 1536000,
      previewUrl: null
    },
    {
      id: '1-1-2',
      name: '技术方案.docx',
      type: 'file',
      fileType: 'word',
      parentId: '1-1',
      hasChildren: false,
      loaded: true,
      children: [],
      createdAt: '2024-03-05 09:15:00',
      updatedAt: '2024-03-12 11:45:00',
      size: 768000,
      previewUrl: null
    }
  ]
}
