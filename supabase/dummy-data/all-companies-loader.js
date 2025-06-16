// 따스한놈들 그룹 전체 데이터 로더
const SUPABASE_URL = 'https://ooqexropurnslqmcbjqk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vcWV4cm9wdXJuc2xxbWNiamxxayIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzQ3NDc0MjA1LCJleHAiOjIwNjMwNTAyMDV9.yXVabxtZwX3QFF6xnjmj5VI2Lrp_7fZ3HvS5dCalbA';

// 따스한놈들 데이터
const warmguysData = [
  {date: '2025-05-01', coupang_rocket: 1450000, smart_store: 950000, coupang_wing: 550000, other_online: 250000, wholesale: 2500000, export: 1200000, total_sales: 6900000, refund_amount: 120000, order_count: 138, notes: '월초 할인 이벤트'},
  {date: '2025-05-02', coupang_rocket: 1320000, smart_store: 1100000, coupang_wing: 480000, other_online: 310000, wholesale: 2100000, export: 1500000, total_sales: 6810000, refund_amount: 95000, order_count: 136, notes: ''},
  {date: '2025-05-03', coupang_rocket: 1550000, smart_store: 1020000, coupang_wing: 620000, other_online: 350000, wholesale: 1900000, export: 1700000, total_sales: 7140000, refund_amount: 110000, order_count: 143, notes: '주말 매출 증가'},
  {date: '2025-05-04', coupang_rocket: 1600000, smart_store: 1080000, coupang_wing: 580000, other_online: 390000, wholesale: 1800000, export: 1800000, total_sales: 7250000, refund_amount: 105000, order_count: 145, notes: '주말 매출 호조'},
  {date: '2025-05-05', coupang_rocket: 1300000, smart_store: 920000, coupang_wing: 470000, other_online: 280000, wholesale: 2300000, export: 1100000, total_sales: 6370000, refund_amount: 130000, order_count: 127, notes: '어린이날 특별 할인'},
  {date: '2025-05-06', coupang_rocket: 1480000, smart_store: 990000, coupang_wing: 510000, other_online: 320000, wholesale: 2000000, export: 1400000, total_sales: 6700000, refund_amount: 115000, order_count: 134, notes: ''},
  {date: '2025-05-07', coupang_rocket: 1530000, smart_store: 1010000, coupang_wing: 590000, other_online: 330000, wholesale: 2200000, export: 1600000, total_sales: 7260000, refund_amount: 100000, order_count: 145, notes: ''},
  {date: '2025-05-08', coupang_rocket: 1390000, smart_store: 970000, coupang_wing: 530000, other_online: 300000, wholesale: 2400000, export: 1300000, total_sales: 6890000, refund_amount: 125000, order_count: 138, notes: ''},
  {date: '2025-05-09', coupang_rocket: 1420000, smart_store: 1050000, coupang_wing: 560000, other_online: 340000, wholesale: 2150000, export: 1450000, total_sales: 6970000, refund_amount: 110000, order_count: 139, notes: ''},
  {date: '2025-05-10', coupang_rocket: 1580000, smart_store: 1120000, coupang_wing: 600000, other_online: 380000, wholesale: 1950000, export: 1650000, total_sales: 7280000, refund_amount: 105000, order_count: 146, notes: '주말 매출 증가'},
  {date: '2025-05-11', coupang_rocket: 1620000, smart_store: 1160000, coupang_wing: 620000, other_online: 400000, wholesale: 1850000, export: 1750000, total_sales: 7400000, refund_amount: 90000, order_count: 148, notes: '주말 매출 호조'},
  {date: '2025-05-12', coupang_rocket: 1350000, smart_store: 940000, coupang_wing: 490000, other_online: 290000, wholesale: 2250000, export: 1200000, total_sales: 6520000, refund_amount: 120000, order_count: 130, notes: ''},
  {date: '2025-05-13', coupang_rocket: 1460000, smart_store: 980000, coupang_wing: 520000, other_online: 310000, wholesale: 2050000, export: 1350000, total_sales: 6670000, refund_amount: 130000, order_count: 133, notes: ''},
  {date: '2025-05-14', coupang_rocket: 1510000, smart_store: 1030000, coupang_wing: 570000, other_online: 330000, wholesale: 2180000, export: 1550000, total_sales: 7170000, refund_amount: 115000, order_count: 143, notes: ''},
  {date: '2025-05-15', coupang_rocket: 1680000, smart_store: 1200000, coupang_wing: 640000, other_online: 420000, wholesale: 2300000, export: 1900000, total_sales: 8140000, refund_amount: 95000, order_count: 163, notes: '중순 급상승'},
  {date: '2025-05-16', coupang_rocket: 1700000, smart_store: 1250000, coupang_wing: 680000, other_online: 450000, wholesale: 2400000, export: 2000000, total_sales: 8480000, refund_amount: 85000, order_count: 170, notes: '프로모션 효과'},
  {date: '2025-05-17', coupang_rocket: 1750000, smart_store: 1300000, coupang_wing: 700000, other_online: 470000, wholesale: 2350000, export: 2100000, total_sales: 8670000, refund_amount: 80000, order_count: 173, notes: '주말 최고 매출'},
  {date: '2025-05-18', coupang_rocket: 1720000, smart_store: 1280000, coupang_wing: 690000, other_online: 460000, wholesale: 2250000, export: 2050000, total_sales: 8450000, refund_amount: 90000, order_count: 169, notes: '주말 호조세 지속'},
  {date: '2025-05-19', coupang_rocket: 1430000, smart_store: 1050000, coupang_wing: 550000, other_online: 320000, wholesale: 2100000, export: 1400000, total_sales: 6850000, refund_amount: 110000, order_count: 137, notes: '주초 안정화'},
  {date: '2025-05-20', coupang_rocket: 1490000, smart_store: 1100000, coupang_wing: 580000, other_online: 340000, wholesale: 2150000, export: 1500000, total_sales: 7160000, refund_amount: 100000, order_count: 143, notes: '오늘'}
];

// 엠알에스 데이터 
const mrsData = [
  {date: '2025-05-01', coupang_rocket: 1450000, smart_store: 950000, coupang_wing: 550000, other_online: 250000, wholesale: 0, export: 0, total_sales: 3200000, refund_amount: 120000, order_count: 64, notes: '월초 할인 이벤트'},
  {date: '2025-05-02', coupang_rocket: 1320000, smart_store: 1100000, coupang_wing: 480000, other_online: 310000, wholesale: 0, export: 0, total_sales: 3210000, refund_amount: 95000, order_count: 64, notes: ''},
  {date: '2025-05-03', coupang_rocket: 1550000, smart_store: 1020000, coupang_wing: 620000, other_online: 350000, wholesale: 0, export: 0, total_sales: 3540000, refund_amount: 110000, order_count: 71, notes: '주말 매출 증가'},
  {date: '2025-05-04', coupang_rocket: 1600000, smart_store: 1080000, coupang_wing: 580000, other_online: 390000, wholesale: 0, export: 0, total_sales: 3650000, refund_amount: 105000, order_count: 73, notes: '주말 매출 호조'},
  {date: '2025-05-05', coupang_rocket: 1300000, smart_store: 920000, coupang_wing: 470000, other_online: 280000, wholesale: 0, export: 0, total_sales: 2970000, refund_amount: 130000, order_count: 59, notes: '어린이날 특별 할인'},
  {date: '2025-05-06', coupang_rocket: 1480000, smart_store: 990000, coupang_wing: 510000, other_online: 320000, wholesale: 0, export: 0, total_sales: 3300000, refund_amount: 115000, order_count: 66, notes: ''},
  {date: '2025-05-07', coupang_rocket: 1530000, smart_store: 1010000, coupang_wing: 590000, other_online: 330000, wholesale: 0, export: 0, total_sales: 3460000, refund_amount: 100000, order_count: 69, notes: ''},
  {date: '2025-05-08', coupang_rocket: 1390000, smart_store: 970000, coupang_wing: 530000, other_online: 300000, wholesale: 0, export: 0, total_sales: 3190000, refund_amount: 125000, order_count: 64, notes: ''},
  {date: '2025-05-09', coupang_rocket: 1420000, smart_store: 1050000, coupang_wing: 560000, other_online: 340000, wholesale: 0, export: 0, total_sales: 3370000, refund_amount: 110000, order_count: 67, notes: ''},
  {date: '2025-05-10', coupang_rocket: 1580000, smart_store: 1120000, coupang_wing: 600000, other_online: 380000, wholesale: 0, export: 0, total_sales: 3680000, refund_amount: 105000, order_count: 74, notes: '주말 매출 증가'},
  {date: '2025-05-11', coupang_rocket: 1620000, smart_store: 1160000, coupang_wing: 620000, other_online: 400000, wholesale: 0, export: 0, total_sales: 3800000, refund_amount: 90000, order_count: 76, notes: '주말 매출 호조'},
  {date: '2025-05-12', coupang_rocket: 1350000, smart_store: 940000, coupang_wing: 490000, other_online: 290000, wholesale: 0, export: 0, total_sales: 3070000, refund_amount: 120000, order_count: 61, notes: ''},
  {date: '2025-05-13', coupang_rocket: 1460000, smart_store: 980000, coupang_wing: 520000, other_online: 310000, wholesale: 0, export: 0, total_sales: 3270000, refund_amount: 130000, order_count: 65, notes: ''},
  {date: '2025-05-14', coupang_rocket: 1510000, smart_store: 1030000, coupang_wing: 570000, other_online: 330000, wholesale: 0, export: 0, total_sales: 3440000, refund_amount: 115000, order_count: 69, notes: ''},
  {date: '2025-05-15', coupang_rocket: 1680000, smart_store: 1200000, coupang_wing: 640000, other_online: 420000, wholesale: 0, export: 0, total_sales: 3940000, refund_amount: 95000, order_count: 79, notes: '중순 급상승'},
  {date: '2025-05-16', coupang_rocket: 1700000, smart_store: 1250000, coupang_wing: 680000, other_online: 450000, wholesale: 0, export: 0, total_sales: 4080000, refund_amount: 85000, order_count: 82, notes: '프로모션 효과'},
  {date: '2025-05-17', coupang_rocket: 1750000, smart_store: 1300000, coupang_wing: 700000, other_online: 470000, wholesale: 0, export: 0, total_sales: 4220000, refund_amount: 80000, order_count: 84, notes: '주말 최고 매출'},
  {date: '2025-05-18', coupang_rocket: 1720000, smart_store: 1280000, coupang_wing: 690000, other_online: 460000, wholesale: 0, export: 0, total_sales: 4150000, refund_amount: 90000, order_count: 83, notes: '주말 호조세 지속'},
  {date: '2025-05-19', coupang_rocket: 1430000, smart_store: 1050000, coupang_wing: 550000, other_online: 320000, wholesale: 0, export: 0, total_sales: 3350000, refund_amount: 110000, order_count: 67, notes: '주초 안정화'},
  {date: '2025-05-20', coupang_rocket: 1490000, smart_store: 1100000, coupang_wing: 580000, other_online: 340000, wholesale: 0, export: 0, total_sales: 3510000, refund_amount: 100000, order_count: 70, notes: '오늘'}
];

// 압구정곱창 데이터
const apgujeongData = [
  {date: '2025-05-01', day_of_week: '수', card_sales: 1250000, cash_sales: 450000, delivery_sales: 350000, account_transfer: 100000, card_discount: 0, cash_discount: 0, total_sales: 2150000, customer_count: 105, table_turnover: 5.5, special_notes: '목살 할인행사', cash_deposit: 400000, cash_held: 50000, cash_expense: 30000, expense_reason: '재료 구매', material_order: 650000, table_count: 19},
  {date: '2025-05-02', day_of_week: '목', card_sales: 1340000, cash_sales: 490000, delivery_sales: 320000, account_transfer: 120000, card_discount: 0, cash_discount: 0, total_sales: 2270000, customer_count: 113, table_turnover: 5.9, special_notes: '', cash_deposit: 450000, cash_held: 40000, cash_expense: 25000, expense_reason: '일상 비용', material_order: 720000, table_count: 19},
  {date: '2025-05-03', day_of_week: '금', card_sales: 1580000, cash_sales: 620000, delivery_sales: 380000, account_transfer: 150000, card_discount: 0, cash_discount: 0, total_sales: 2730000, customer_count: 136, table_turnover: 7.2, special_notes: '금요일 저녁 만석', cash_deposit: 600000, cash_held: 20000, cash_expense: 35000, expense_reason: '청소용품', material_order: 750000, table_count: 19},
  {date: '2025-05-04', day_of_week: '토', card_sales: 1680000, cash_sales: 680000, delivery_sales: 370000, account_transfer: 180000, card_discount: 0, cash_discount: 0, total_sales: 2910000, customer_count: 145, table_turnover: 7.6, special_notes: '주말 만석', cash_deposit: 650000, cash_held: 30000, cash_expense: 40000, expense_reason: '수리비', material_order: 800000, table_count: 19},
  {date: '2025-05-05', day_of_week: '일', card_sales: 1720000, cash_sales: 660000, delivery_sales: 390000, account_transfer: 170000, card_discount: 0, cash_discount: 0, total_sales: 2940000, customer_count: 147, table_turnover: 7.7, special_notes: '어린이날 특별 메뉴', cash_deposit: 630000, cash_held: 30000, cash_expense: 40000, expense_reason: '일상 비용', material_order: 780000, table_count: 19},
  {date: '2025-05-06', day_of_week: '월', card_sales: 1080000, cash_sales: 350000, delivery_sales: 320000, account_transfer: 90000, card_discount: 0, cash_discount: 0, total_sales: 1840000, customer_count: 92, table_turnover: 4.8, special_notes: '평일 시작', cash_deposit: 320000, cash_held: 30000, cash_expense: 20000, expense_reason: '재료 구매', material_order: 560000, table_count: 19},
  {date: '2025-05-07', day_of_week: '화', card_sales: 1150000, cash_sales: 370000, delivery_sales: 340000, account_transfer: 100000, card_discount: 0, cash_discount: 0, total_sales: 1960000, customer_count: 98, table_turnover: 5.2, special_notes: '', cash_deposit: 350000, cash_held: 20000, cash_expense: 25000, expense_reason: '일상 비용', material_order: 590000, table_count: 19},
  {date: '2025-05-08', day_of_week: '수', card_sales: 1210000, cash_sales: 410000, delivery_sales: 330000, account_transfer: 110000, card_discount: 0, cash_discount: 0, total_sales: 2060000, customer_count: 103, table_turnover: 5.4, special_notes: '', cash_deposit: 390000, cash_held: 20000, cash_expense: 30000, expense_reason: '재료 구매', material_order: 610000, table_count: 19},
  {date: '2025-05-09', day_of_week: '목', card_sales: 1330000, cash_sales: 450000, delivery_sales: 350000, account_transfer: 120000, card_discount: 0, cash_discount: 0, total_sales: 2250000, customer_count: 112, table_turnover: 5.9, special_notes: '', cash_deposit: 430000, cash_held: 20000, cash_expense: 25000, expense_reason: '일상 비용', material_order: 630000, table_count: 19},
  {date: '2025-05-10', day_of_week: '금', card_sales: 1600000, cash_sales: 640000, delivery_sales: 370000, account_transfer: 160000, card_discount: 0, cash_discount: 0, total_sales: 2770000, customer_count: 138, table_turnover: 7.3, special_notes: '금요일 저녁 만석', cash_deposit: 620000, cash_held: 20000, cash_expense: 40000, expense_reason: '청소용품', material_order: 720000, table_count: 19},
  {date: '2025-05-11', day_of_week: '토', card_sales: 1695000, cash_sales: 695000, delivery_sales: 385000, account_transfer: 175000, card_discount: 0, cash_discount: 0, total_sales: 2950000, customer_count: 147, table_turnover: 7.7, special_notes: '주말 만석', cash_deposit: 670000, cash_held: 25000, cash_expense: 45000, expense_reason: '수리비', material_order: 780000, table_count: 19},
  {date: '2025-05-12', day_of_week: '일', card_sales: 1650000, cash_sales: 650000, delivery_sales: 380000, account_transfer: 170000, card_discount: 0, cash_discount: 0, total_sales: 2850000, customer_count: 142, table_turnover: 7.5, special_notes: '일요일 특선메뉴', cash_deposit: 630000, cash_held: 20000, cash_expense: 35000, expense_reason: '일상 비용', material_order: 750000, table_count: 19},
  {date: '2025-05-13', day_of_week: '월', card_sales: 1100000, cash_sales: 380000, delivery_sales: 330000, account_transfer: 100000, card_discount: 0, cash_discount: 0, total_sales: 1910000, customer_count: 95, table_turnover: 5.0, special_notes: '평일 시작', cash_deposit: 360000, cash_held: 20000, cash_expense: 25000, expense_reason: '재료 구매', material_order: 580000, table_count: 19},
  {date: '2025-05-14', day_of_week: '화', card_sales: 1180000, cash_sales: 400000, delivery_sales: 350000, account_transfer: 110000, card_discount: 0, cash_discount: 0, total_sales: 2040000, customer_count: 102, table_turnover: 5.4, special_notes: '', cash_deposit: 380000, cash_held: 20000, cash_expense: 30000, expense_reason: '일상 비용', material_order: 600000, table_count: 19},
  {date: '2025-05-15', day_of_week: '수', card_sales: 1240000, cash_sales: 430000, delivery_sales: 340000, account_transfer: 120000, card_discount: 0, cash_discount: 0, total_sales: 2130000, customer_count: 106, table_turnover: 5.6, special_notes: '', cash_deposit: 410000, cash_held: 20000, cash_expense: 35000, expense_reason: '재료 구매', material_order: 620000, table_count: 19},
  {date: '2025-05-16', day_of_week: '목', card_sales: 1350000, cash_sales: 470000, delivery_sales: 360000, account_transfer: 130000, card_discount: 0, cash_discount: 0, total_sales: 2310000, customer_count: 115, table_turnover: 6.1, special_notes: '', cash_deposit: 450000, cash_held: 20000, cash_expense: 30000, expense_reason: '일상 비용', material_order: 650000, table_count: 19},
  {date: '2025-05-17', day_of_week: '금', card_sales: 1620000, cash_sales: 650000, delivery_sales: 380000, account_transfer: 170000, card_discount: 0, cash_discount: 0, total_sales: 2820000, customer_count: 141, table_turnover: 7.4, special_notes: '금요일 저녁 만석', cash_deposit: 630000, cash_held: 20000, cash_expense: 40000, expense_reason: '청소용품', material_order: 740000, table_count: 19},
  {date: '2025-05-18', day_of_week: '토', card_sales: 1710000, cash_sales: 710000, delivery_sales: 390000, account_transfer: 180000, card_discount: 0, cash_discount: 0, total_sales: 2990000, customer_count: 149, table_turnover: 7.8, special_notes: '주말 만석 기록', cash_deposit: 690000, cash_held: 20000, cash_expense: 45000, expense_reason: '수리비', material_order: 790000, table_count: 19},
  {date: '2025-05-19', day_of_week: '일', card_sales: 1670000, cash_sales: 670000, delivery_sales: 385000, account_transfer: 175000, card_discount: 0, cash_discount: 0, total_sales: 2900000, customer_count: 145, table_turnover: 7.6, special_notes: '일요일 특선메뉴', cash_deposit: 650000, cash_held: 20000, cash_expense: 40000, expense_reason: '일상 비용', material_order: 770000, table_count: 19},
  {date: '2025-05-20', day_of_week: '월', card_sales: 1130000, cash_sales: 400000, delivery_sales: 340000, account_transfer: 110000, card_discount: 0, cash_discount: 0, total_sales: 1980000, customer_count: 99, table_turnover: 5.2, special_notes: '평일 시작', cash_deposit: 380000, cash_held: 20000, cash_expense: 30000, expense_reason: '재료 구매', material_order: 600000, table_count: 19}
];

// 극진이앤지 데이터
const geukjinData = [
  {date: '2025-05-01', gasoline_sales: 850000, diesel_sales: 720000, kerosene_sales: 180000, freight_sales: 350000, total_sales: 2100000, gasoline_cost: 680000, diesel_cost: 550000, kerosene_cost: 140000, freight_cost: 210000, total_cost: 1580000, gasoline_margin: 170000, diesel_margin: 170000, kerosene_margin: 40000, freight_margin: 140000, total_margin: 520000, growth_rate: 1.5, notes: '월초 공급량 증가'},
  {date: '2025-05-02', gasoline_sales: 830000, diesel_sales: 740000, kerosene_sales: 190000, freight_sales: 330000, total_sales: 2090000, gasoline_cost: 670000, diesel_cost: 570000, kerosene_cost: 150000, freight_cost: 200000, total_cost: 1590000, gasoline_margin: 160000, diesel_margin: 170000, kerosene_margin: 40000, freight_margin: 130000, total_margin: 500000, growth_rate: 1.3, notes: ''},
  {date: '2025-05-03', gasoline_sales: 890000, diesel_sales: 780000, kerosene_sales: 200000, freight_sales: 370000, total_sales: 2240000, gasoline_cost: 710000, diesel_cost: 600000, kerosene_cost: 160000, freight_cost: 220000, total_cost: 1690000, gasoline_margin: 180000, diesel_margin: 180000, kerosene_margin: 40000, freight_margin: 150000, total_margin: 550000, growth_rate: 2.1, notes: '주말 매출 증가'},
  {date: '2025-05-04', gasoline_sales: 910000, diesel_sales: 800000, kerosene_sales: 210000, freight_sales: 380000, total_sales: 2300000, gasoline_cost: 730000, diesel_cost: 610000, kerosene_cost: 165000, freight_cost: 230000, total_cost: 1735000, gasoline_margin: 180000, diesel_margin: 190000, kerosene_margin: 45000, freight_margin: 150000, total_margin: 565000, growth_rate: 2.4, notes: '주말 매출 호조'},
  {date: '2025-05-05', gasoline_sales: 800000, diesel_sales: 700000, kerosene_sales: 170000, freight_sales: 320000, total_sales: 1990000, gasoline_cost: 640000, diesel_cost: 530000, kerosene_cost: 135000, freight_cost: 190000, total_cost: 1495000, gasoline_margin: 160000, diesel_margin: 170000, kerosene_margin: 35000, freight_margin: 130000, total_margin: 495000, growth_rate: -0.5, notes: '어린이날 주유량 감소'},
  {date: '2025-05-06', gasoline_sales: 840000, diesel_sales: 730000, kerosene_sales: 185000, freight_sales: 340000, total_sales: 2095000, gasoline_cost: 670000, diesel_cost: 550000, kerosene_cost: 145000, freight_cost: 205000, total_cost: 1570000, gasoline_margin: 170000, diesel_margin: 180000, kerosene_margin: 40000, freight_margin: 135000, total_margin: 525000, growth_rate: 1.4, notes: ''},
  {date: '2025-05-07', gasoline_sales: 860000, diesel_sales: 750000, kerosene_sales: 190000, freight_sales: 350000, total_sales: 2150000, gasoline_cost: 690000, diesel_cost: 570000, kerosene_cost: 150000, freight_cost: 210000, total_cost: 1620000, gasoline_margin: 170000, diesel_margin: 180000, kerosene_margin: 40000, freight_margin: 140000, total_margin: 530000, growth_rate: 1.6, notes: ''},
  {date: '2025-05-08', gasoline_sales: 830000, diesel_sales: 720000, kerosene_sales: 185000, freight_sales: 330000, total_sales: 2065000, gasoline_cost: 660000, diesel_cost: 550000, kerosene_cost: 145000, freight_cost: 200000, total_cost: 1555000, gasoline_margin: 170000, diesel_margin: 170000, kerosene_margin: 40000, freight_margin: 130000, total_margin: 510000, growth_rate: 1.2, notes: ''},
  {date: '2025-05-09', gasoline_sales: 850000, diesel_sales: 740000, kerosene_sales: 195000, freight_sales: 340000, total_sales: 2125000, gasoline_cost: 680000, diesel_cost: 560000, kerosene_cost: 155000, freight_cost: 205000, total_cost: 1600000, gasoline_margin: 170000, diesel_margin: 180000, kerosene_margin: 40000, freight_margin: 135000, total_margin: 525000, growth_rate: 1.5, notes: ''},
  {date: '2025-05-10', gasoline_sales: 900000, diesel_sales: 790000, kerosene_sales: 205000, freight_sales: 375000, total_sales: 2270000, gasoline_cost: 720000, diesel_cost: 600000, kerosene_cost: 160000, freight_cost: 225000, total_cost: 1705000, gasoline_margin: 180000, diesel_margin: 190000, kerosene_margin: 45000, freight_margin: 150000, total_margin: 565000, growth_rate: 2.2, notes: '주말 매출 증가'},
  {date: '2025-05-11', gasoline_sales: 920000, diesel_sales: 810000, kerosene_sales: 210000, freight_sales: 385000, total_sales: 2325000, gasoline_cost: 740000, diesel_cost: 620000, kerosene_cost: 165000, freight_cost: 230000, total_cost: 1755000, gasoline_margin: 180000, diesel_margin: 190000, kerosene_margin: 45000, freight_margin: 155000, total_margin: 570000, growth_rate: 2.5, notes: '주말 매출 호조'},
  {date: '2025-05-12', gasoline_sales: 810000, diesel_sales: 710000, kerosene_sales: 175000, freight_sales: 325000, total_sales: 2020000, gasoline_cost: 650000, diesel_cost: 540000, kerosene_cost: 140000, freight_cost: 195000, total_cost: 1525000, gasoline_margin: 160000, diesel_margin: 170000, kerosene_margin: 35000, freight_margin: 130000, total_margin: 495000, growth_rate: 0.5, notes: ''},
  {date: '2025-05-13', gasoline_sales: 845000, diesel_sales: 735000, kerosene_sales: 190000, freight_sales: 345000, total_sales: 2115000, gasoline_cost: 675000, diesel_cost: 560000, kerosene_cost: 150000, freight_cost: 210000, total_cost: 1595000, gasoline_margin: 170000, diesel_margin: 175000, kerosene_margin: 40000, freight_margin: 135000, total_margin: 520000, growth_rate: 1.4, notes: ''},
  {date: '2025-05-14', gasoline_sales: 865000, diesel_sales: 755000, kerosene_sales: 195000, freight_sales: 355000, total_sales: 2170000, gasoline_cost: 695000, diesel_cost: 575000, kerosene_cost: 155000, freight_cost: 215000, total_cost: 1640000, gasoline_margin: 170000, diesel_margin: 180000, kerosene_margin: 40000, freight_margin: 140000, total_margin: 530000, growth_rate: 1.7, notes: ''},
  {date: '2025-05-15', gasoline_sales: 880000, diesel_sales: 770000, kerosene_sales: 200000, freight_sales: 365000, total_sales: 2215000, gasoline_cost: 705000, diesel_cost: 590000, kerosene_cost: 160000, freight_cost: 220000, total_cost: 1675000, gasoline_margin: 175000, diesel_margin: 180000, kerosene_margin: 40000, freight_margin: 145000, total_margin: 540000, growth_rate: 1.9, notes: ''},
  {date: '2025-05-16', gasoline_sales: 910000, diesel_sales: 790000, kerosene_sales: 205000, freight_sales: 375000, total_sales: 2280000, gasoline_cost: 730000, diesel_cost: 600000, kerosene_cost: 165000, freight_cost: 225000, total_cost: 1720000, gasoline_margin: 180000, diesel_margin: 190000, kerosene_margin: 40000, freight_margin: 150000, total_margin: 560000, growth_rate: 2.3, notes: '유가 인상 전 주유 증가'},
  {date: '2025-05-17', gasoline_sales: 970000, diesel_sales: 850000, kerosene_sales: 220000, freight_sales: 400000, total_sales: 2440000, gasoline_cost: 775000, diesel_cost: 650000, kerosene_cost: 175000, freight_cost: 240000, total_cost: 1840000, gasoline_margin: 195000, diesel_margin: 200000, kerosene_margin: 45000, freight_margin: 160000, total_margin: 600000, growth_rate: 3.5, notes: '주말 최고 매출'},
  {date: '2025-05-18', gasoline_sales: 960000, diesel_sales: 840000, kerosene_sales: 215000, freight_sales: 395000, total_sales: 2410000, gasoline_cost: 770000, diesel_cost: 640000, kerosene_cost: 170000, freight_cost: 235000, total_cost: 1815000, gasoline_margin: 190000, diesel_margin: 200000, kerosene_margin: 45000, freight_margin: 160000, total_margin: 595000, growth_rate: 3.2, notes: '주말 호조세 지속'},
  {date: '2025-05-19', gasoline_sales: 830000, diesel_sales: 725000, kerosene_sales: 185000, freight_sales: 335000, total_sales: 2075000, gasoline_cost: 665000, diesel_cost: 550000, kerosene_cost: 145000, freight_cost: 200000, total_cost: 1560000, gasoline_margin: 165000, diesel_margin: 175000, kerosene_margin: 40000, freight_margin: 135000, total_margin: 515000, growth_rate: 1.1, notes: '주초 안정화'},
  {date: '2025-05-20', gasoline_sales: 850000, diesel_sales: 740000, kerosene_sales: 190000, freight_sales: 350000, total_sales: 2130000, gasoline_cost: 680000, diesel_cost: 565000, kerosene_cost: 150000, freight_cost: 210000, total_cost: 1605000, gasoline_margin: 170000, diesel_margin: 175000, kerosene_margin: 40000, freight_margin: 140000, total_margin: 525000, growth_rate: 1.4, notes: '오늘'}
];

// API 요청 함수 (DELETE & POST)
async function apiRequest(url, method, data = null) {
  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Prefer': 'return=minimal'
  };
  
  const options = {
    method,
    headers
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`API 요청 실패 (${method}): ${response.statusText}`);
  }
  
  return response;
}

// 모든 데이터 로드
async function loadAllData() {
  try {
    // 1. 엠알에스 데이터
    await apiRequest(`${SUPABASE_URL}/rest/v1/mrs_sales?id=neq.0`, 'DELETE');
    await apiRequest(`${SUPABASE_URL}/rest/v1/mrs_sales`, 'POST', mrsData);
    console.log('✅ 엠알에스 데이터 삽입 완료');
    
    // 2. 압구정곱창 데이터
    await apiRequest(`${SUPABASE_URL}/rest/v1/apgujeong_sales?id=neq.0`, 'DELETE');
    await apiRequest(`${SUPABASE_URL}/rest/v1/apgujeong_sales`, 'POST', apgujeongData);
    console.log('✅ 압구정곱창 데이터 삽입 완료');
    
    // 3. 극진이앤지 데이터
    await apiRequest(`${SUPABASE_URL}/rest/v1/geukjin_sales?id=neq.0`, 'DELETE');
    await apiRequest(`${SUPABASE_URL}/rest/v1/geukjin_sales`, 'POST', geukjinData);
    console.log('✅ 극진이앤지 데이터 삽입 완료');
    
    // 4. 따스한놈들 데이터
    await apiRequest(`${SUPABASE_URL}/rest/v1/warmguys_sales?id=neq.0`, 'DELETE');
    await apiRequest(`${SUPABASE_URL}/rest/v1/warmguys_sales`, 'POST', warmguysData);
    console.log('✅ 따스한놈들 데이터 삽입 완료');
    
    return true;
  } catch (error) {
    console.error('데이터 로드 중 오류 발생:', error);
    return false;
  }
}

// 모든 테이블의 데이터 로드
window.loadAllTables = loadAllData;

document.addEventListener('DOMContentLoaded', function() {
  const loadButton = document.getElementById('load-all-data');
  
  if (loadButton) {
    loadButton.addEventListener('click', async function() {
      this.disabled = true;
      this.textContent = '데이터 로드 중...';
      
      const statusElement = document.getElementById('load-status');
      
      try {
        const result = await loadAllData();
        if (result) {
          this.textContent = '모든 데이터 로드 완료!';
          if (statusElement) {
            statusElement.className = 'status success';
            statusElement.textContent = '✅ 데이터 로드 성공!';
          }
        } else {
          throw new Error('데이터 로드 실패');
        }
      } catch (error) {
        this.textContent = '데이터 로드 실패';
        if (statusElement) {
          statusElement.className = 'status error';
          statusElement.textContent = '❌ 데이터 로드 실패: ' + error.message;
        }
        console.error('Error:', error);
      } finally {
        setTimeout(() => {
          this.textContent = '모든 더미 데이터 다시 로드';
          this.disabled = false;
        }, 3000);
      }
    });
  }
});