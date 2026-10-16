import * as XLSX from 'xlsx';
import { WorkbookData, ExcelSheetData } from '@/types/converter';

export interface SampleDataset {
  id: string;
  name: string;
  description: string;
  fileName: string;
  iconName: string;
  sheets: Record<string, any[]>;
}

export const SAMPLE_DATASETS: SampleDataset[] = [
  {
    id: 'moodle_quiz',
    name: 'កម្រងសំណួរ Moodle Quiz (AI & Education)',
    description: 'សំណួរពហុជ្រើសរើស (Multiple Choice Questions with Khmer & English options for Moodle LMS)',
    fileName: 'moodle_quiz_questions.xlsx',
    iconName: 'GraduationCap',
    sheets: {
      Quiz: [
        {
          name: 'Question 1',
          questiontext: 'តើបច្ចេកវិទ្យា AI ណាដែលមានឥទ្ធិពលខ្លាំងបំផុតសម្រាប់អនាគតការអប់រំនៅកម្ពុជា?',
          option_a: 'Generative AI & Intelligent Tutors',
          option_b: 'Traditional Rule-based Systems',
          option_c: 'Static LMS Video Playlists',
          option_d: 'Paper-based Quizzes',
          correct_answer: 'A',
        },
        {
          name: 'Question 2',
          questiontext: 'What is the primary benefit of real-time polling during a live lecture?',
          option_a: 'Immediate understanding check & high audience retention',
          option_b: 'Grading formal midterm exams',
          option_c: 'Replacing all instructor explanations',
          option_d: 'Eliminating teacher preparation time',
          correct_answer: 'A',
        },
        {
          name: 'Question 3',
          questiontext: 'តើទម្រង់ XML ណាដែល Moodle LMS ប្រើប្រាស់សម្រាប់នាំចូលកម្រងសំណួរ?',
          option_a: 'Moodle XML format (<quiz><question>...</question></quiz>)',
          option_b: 'HTML Table format',
          option_c: 'SpreadsheetML 2003',
          option_d: 'CSV raw text',
          correct_answer: 'A',
        },
      ],
    },
  },
  {
    id: 'khmer_inventory',
    name: 'ទំនិញ និងស្តុក (Khmer Inventory)',
    description: 'តារាងទំនិញជាភាសាខ្មែរ (Khmer Unicode headers, currency, products, and staff directory)',
    fileName: 'khmer_products_catalog.xlsx',
    iconName: 'Package',
    sheets: {
      បញ្ជីទំនិញ: [
        {
          កូដទំនិញ: 'KHM-001',
          ឈ្មោះទំនិញ: 'កុំព្យូទ័រយួរដៃ Pro 16',
          ប្រភេទ: 'គ្រឿងអេឡិចត្រូនិច',
          ចំនួនស្តុក: 25,
          តម្លៃរាយ_ដុល្លារ: 1299.0,
          អ្នកផ្គត់ផ្គង់: 'ក្រុមហ៊ុន ខេមបូឌា តិចណូឡូជី',
          ទីតាំងឃ្លាំង: 'រាជធានីភ្នំពេញ',
          កាលបរិច្ឆេទ: '2026-03-20',
          ស្ថានភាព: 'មានក្នុងស្តុក',
        },
        {
          កូដទំនិញ: 'KHM-002',
          ឈ្មោះទំនិញ: 'ក្តារចុចមេកានិចឥតខ្សែ',
          ប្រភេទ: 'គ្រឿងបន្លាស់',
          ចំនួនស្តុក: 60,
          តម្លៃរាយ_ដុល្លារ: 89.5,
          អ្នកផ្គត់ផ្គង់: 'ហាងលក់សម្ភារៈកុំព្យូទ័រ',
          ទីតាំងឃ្លាំង: 'ខេត្តសៀមរាប',
          កាលបរិច្ឆេទ: '2026-03-22',
          ស្ថានភាព: 'មានក្នុងស្តុក',
        },
        {
          កូដទំនិញ: 'KHM-003',
          ឈ្មោះទំនិញ: 'ម៉ូនីទ័រ 27 អ៊ីញ 4K UHD',
          ប្រភេទ: 'គ្រឿងអេឡិចត្រូនិច',
          ចំនួនស្តុក: 14,
          តម្លៃរាយ_ដុល្លារ: 349.0,
          អ្នកផ្គត់ផ្គង់: 'ក្រុមហ៊ុន ខេមបូឌា តិចណូឡូជី',
          ទីតាំងឃ្លាំង: 'រាជធានីភ្នំពេញ',
          កាលបរិច្ឆេទ: '2026-03-25',
          ស្ថានភាព: 'មានក្នុងស្តុក',
        },
        {
          កូដទំនិញ: 'KHM-004',
          ឈ្មោះទំនិញ: 'កាសស្តាប់ត្រចៀកកាត់បន្ថយសំឡេង',
          ប្រភេទ: 'ឧបករណ៍សំឡេង',
          ចំនួនស្តុក: 42,
          តម្លៃរាយ_ដុល្លារ: 155.0,
          អ្នកផ្គត់ផ្គង់: 'សោន វើលដ៍ អាស៊ី',
          ទីតាំងឃ្លាំង: 'ខេត្តបាត់ដំបង',
          កាលបរិច្ឆេទ: '2026-03-28',
          ស្ថានភាព: 'មានក្នុងស្តុក',
        },
      ],
      បុគ្គលិក: [
        {
          អត្តលេខ: 'EMP-KH-01',
          គោត្តនាម_នាម: 'ចាន់ធី សុខា',
          តួនាទី: 'អ្នកគ្រប់គ្រងស្តុក',
          ការិយាល័យ: 'ភ្នំពេញ',
          លេខទូរស័ព្ទ: '012 345 678',
        },
        {
          អត្តលេខ: 'EMP-KH-02',
          គោត្តនាម_នាម: 'កែវ វណ្ណា',
          តួនាទី: 'គណនេយ្យករ',
          ការិយាល័យ: 'ភ្នំពេញ',
          លេខទូរស័ព្ទ: '098 765 432',
        },
      ],
    },
  },
  {
    id: 'inventory',
    name: 'Products & Inventory',
    description: 'Hardware, electronics, and accessories inventory catalog with prices and stock levels',
    fileName: 'products_inventory_2026.xlsx',
    iconName: 'Package',
    sheets: {
      Products: [
        {
          sku: 'PRD-1092',
          product_name: 'Studio Wireless Headphones',
          category: 'Audio',
          stock: 45,
          unit_price: 189.99,
          supplier: 'Acoustics Global Ltd',
          is_active: true,
          restock_date: '2026-04-15',
        },
        {
          sku: 'PRD-1093',
          product_name: 'Ultra-Wide Curved Monitor 34"',
          category: 'Displays',
          stock: 12,
          unit_price: 649.5,
          supplier: 'Nexus Display Corp',
          is_active: true,
          restock_date: '2026-05-01',
        },
        {
          sku: 'PRD-1094',
          product_name: 'Mechanical Keyboard (Hot-Swap)',
          category: 'Peripherals',
          stock: 88,
          unit_price: 119.0,
          supplier: 'KeyForge Works',
          is_active: true,
          restock_date: '2026-03-28',
        },
        {
          sku: 'PRD-1095',
          product_name: 'Precision Wireless Mouse',
          category: 'Peripherals',
          stock: 130,
          unit_price: 59.95,
          supplier: 'KeyForge Works',
          is_active: true,
          restock_date: '2026-04-10',
        },
        {
          sku: 'PRD-1096',
          product_name: 'USB-C Thunderbolt 4 Dock 12-in-1',
          category: 'Accessories',
          stock: 24,
          unit_price: 229.0,
          supplier: 'HubTech Silicon',
          is_active: true,
          restock_date: '2026-04-20',
        },
        {
          sku: 'PRD-1097',
          product_name: 'Noise-Cancelling Desk Mic',
          category: 'Audio',
          stock: 0,
          unit_price: 99.0,
          supplier: 'Acoustics Global Ltd',
          is_active: false,
          restock_date: '2026-06-12',
        },
      ],
      Warehouses: [
        {
          warehouse_id: 'WH-US-EAST',
          city: 'Newark',
          state: 'NJ',
          capacity_units: 50000,
          manager: 'Elena Rostova',
        },
        {
          warehouse_id: 'WH-US-WEST',
          city: 'Oakland',
          state: 'CA',
          capacity_units: 75000,
          manager: 'Marcus Vance',
        },
        {
          warehouse_id: 'WH-EU-CENTRAL',
          city: 'Rotterdam',
          state: 'NL',
          capacity_units: 90000,
          manager: 'Johan De Vries',
        },
      ],
    },
  },
  {
    id: 'orders',
    name: 'E-Commerce Orders',
    description: 'Transaction orders with customer records, tax rates, currencies, and tracking statuses',
    fileName: 'global_orders_export.xlsx',
    iconName: 'ShoppingCart',
    sheets: {
      Orders: [
        {
          order_id: 'ORD-88210',
          customer_name: 'Sophia Chen',
          email: 'sophia.chen@example.com',
          order_date: '2026-03-12',
          item_count: 3,
          subtotal: 345.0,
          tax: 27.6,
          total: 372.6,
          currency: 'USD',
          status: 'Fulfilled',
          shipping_country: 'USA',
        },
        {
          order_id: 'ORD-88211',
          customer_name: 'Liam O’Connor',
          email: 'liam.oc@dublintech.ie',
          order_date: '2026-03-13',
          item_count: 1,
          subtotal: 649.5,
          tax: 0.0,
          total: 649.5,
          currency: 'EUR',
          status: 'Processing',
          shipping_country: 'Ireland',
        },
        {
          order_id: 'ORD-88212',
          customer_name: 'Amina Al-Mansoor',
          email: 'amina.m@gulfmedia.ae',
          order_date: '2026-03-14',
          item_count: 5,
          subtotal: 1120.0,
          tax: 56.0,
          total: 1176.0,
          currency: 'AED',
          status: 'Shipped',
          shipping_country: 'UAE',
        },
        {
          order_id: 'ORD-88213',
          customer_name: 'Kenji Takahashi',
          email: 'kenji.t@tokyolabs.jp',
          order_date: '2026-03-14',
          item_count: 2,
          subtotal: 238.0,
          tax: 23.8,
          total: 261.8,
          currency: 'JPY',
          status: 'Delivered',
          shipping_country: 'Japan',
        },
      ],
    },
  },
  {
    id: 'employees',
    name: 'Organization & Staff',
    description: 'Team departments, compensation tiers, hire dates, and work locations',
    fileName: 'staff_directory_q1.xlsx',
    iconName: 'Users',
    sheets: {
      Staff: [
        {
          id: 'EMP-014',
          full_name: 'David K. Miller',
          department: 'Engineering',
          role: 'Principal Systems Architect',
          location: 'San Francisco, CA',
          hire_date: '2021-02-15',
          security_clearance: 'Level-3',
          active: true,
        },
        {
          id: 'EMP-029',
          full_name: 'Hannah Abbott',
          department: 'Data Platforms',
          role: 'Senior Analytics Lead',
          location: 'Chicago, IL',
          hire_date: '2022-08-01',
          security_clearance: 'Level-2',
          active: true,
        },
        {
          id: 'EMP-041',
          full_name: 'Mateo Morales',
          department: 'Security & DevOps',
          role: 'Infrastructure Engineer',
          location: 'Austin, TX',
          hire_date: '2023-11-20',
          security_clearance: 'Level-3',
          active: true,
        },
        {
          id: 'EMP-058',
          full_name: 'Clara Beaumont',
          department: 'Product Management',
          role: 'Product Director',
          location: 'New York, NY',
          hire_date: '2020-05-10',
          security_clearance: 'Level-1',
          active: true,
        },
      ],
    },
  },
];

/**
 * Transforms sample dataset into in-memory WorkbookData
 */
export function loadSampleDataset(sampleId: string): WorkbookData {
  const sample = SAMPLE_DATASETS.find((s) => s.id === sampleId) || SAMPLE_DATASETS[0];
  const sheetNames = Object.keys(sample.sheets);
  const sheets: Record<string, ExcelSheetData> = {};

  sheetNames.forEach((name) => {
    const rawRows = sample.sheets[name];
    const headers = rawRows.length > 0 ? Object.keys(rawRows[0]) : [];
    sheets[name] = {
      name,
      headers,
      rows: rawRows,
      totalRows: rawRows.length,
      totalCols: headers.length,
    };
  });

  return {
    fileName: sample.fileName,
    fileSize: 12450,
    sheetNames,
    activeSheetName: sheetNames[0],
    sheets,
  };
}

/**
 * Creates an actual .xlsx file as a Blob using SheetJS
 */
export function createSampleXlsxBlob(sampleId: string): Blob {
  const sample = SAMPLE_DATASETS.find((s) => s.id === sampleId) || SAMPLE_DATASETS[0];
  const wb = XLSX.utils.book_new();

  Object.entries(sample.sheets).forEach(([sheetName, data]) => {
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
