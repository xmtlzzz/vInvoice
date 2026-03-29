import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, 'data.json');

const initialData = {
  namespaces: [
    { id: 'default', name: '默认空间', createdAt: new Date().toISOString() }
  ],
  projects: [
    {
      id: '1',
      namespaceId: 'default',
      name: '北京出差项目',
      description: '2024年Q4季度客户拜访与合同签署',
      createdAt: '2024-10-01',
      submittedAt: null,
      expenses: [
        { id: 'e1', amount: 45.50, type: 'SUBWAY', date: '2024-10-15', description: '地铁10号线望京站至北京南站', reimbursed: true, pdf: null },
        { id: 'e2', amount: 128.00, type: 'TAXI', date: '2024-10-15', description: '北京南站至甲方公司', reimbursed: false, pdf: null },
        { id: 'e3', amount: 450.00, type: 'HOTEL', date: '2024-10-15', description: '住宿一晚 - 北京国际饭店', reimbursed: true, pdf: null },
        { id: 'e4', amount: 553.00, type: 'TRAIN', date: '2024-10-14', description: 'G7 高铁往返票', reimbursed: false, pdf: null },
      ]
    },
    {
      id: '2',
      namespaceId: 'default',
      name: '上海产品发布会',
      description: '新产品V2.0发布会及媒体接待',
      createdAt: '2024-11-05',
      submittedAt: null,
      expenses: [
        { id: 'e5', amount: 650.00, type: 'TRAIN', date: '2024-11-10', description: '高铁商务座', reimbursed: false, pdf: null },
      ]
    }
  ]
};

function loadData() {
  try {
    if (existsSync(DATA_FILE)) {
      return JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to read data file, using defaults:', e.message);
  }
  const data = initialData;
  saveData(data); // Create the file with initial data
  return data;
}

function saveData(data) {
  try {
    writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write data file:', e.message);
    throw e;
  }
}

export { loadData, saveData };
