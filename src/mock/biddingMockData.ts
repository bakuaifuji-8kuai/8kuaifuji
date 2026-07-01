import type { Bidding, SupplierQuote, BiddingItem, SupplierQuoteDetail } from '@/types';

// 当前日期（用于测试数据时间戳）
const now = new Date();
const y = now.getFullYear();
const m = String(now.getMonth() + 1).padStart(2, '0');
const d = String(now.getDate()).padStart(2, '0');
const ds = `${y}-${m}-${d}`;

// 工具函数：创建工单明细
const mkItems = (
  rows: Array<[string, string, string, string, number, number, number, number]>
): BiddingItem[] =>
  rows.map((r) => ({
    productCode: r[0],
    productName: r[1],
    specification: r[2],
    unit: r[3],
    quantity: r[4],
    demandUnitPriceIncludingTax: r[5],
    costAuditUnitPriceIncludingTax: r[6],
    singlePriceLimit: r[7],
  }));

// 工具函数：创建报价单明细
const mkDetail = (
  item: { productCode: string; productName: string; specification?: string; unit: string; quantity: number },
  unitPrice: number,
  taxRate: number
): SupplierQuoteDetail => {
  const amount = Math.round(unitPrice * item.quantity * 100) / 100;
  const taxAmount = taxRate > 0 ? Math.round((amount / (1 + taxRate)) * taxRate * 100) / 100 : 0;
  return {
    productCode: item.productCode,
    productName: item.productName,
    specification: item.specification,
    unit: item.unit,
    quantity: item.quantity,
    unitPrice: unitPrice,
    taxRate: taxRate,
    amount: amount,
    taxAmount: taxAmount,
    deliveryDate: ds,
  };
};

// 工单测试数据
export const MOCK_BIDDINGS: Bidding[] = (() => {
  const data: Array<[string, string, string, string, Array<[string, string, string, string, number, number, number, number]>, number]> = [
    // ======== 基础 15 条工单 ========
    [
      'BID001', '展会物资采购工单', 'XQ20260618001', '2026春季国际会展',
      [
        ['P10001', '展板', '200×100cm', '块', 50, 200, 200, 210],
        ['P10002', '展架', '标准型', '套', 30, 520, 520, 550],
      ],
      27000,
    ],
    [
      'BID002', '办公设备采购工单', 'XQ20260618002', '新办公楼装修项目',
      [
        ['P20001', '投影仪', '高清1080P', '台', 5, 1700, 1700, 1800],
        ['P20002', '音响设备', '会议型', '套', 4, 1650, 1650, 1700],
      ],
      16000,
    ],
    [
      'BID003', '搭建材料采购工单', 'XQ20260618003', '2026春季国际会展',
      [
        ['P30001', '铝合金支架', '3米高度', '根', 100, 170, 170, 180],
        ['P30002', '连接件套装', '通用型', '套', 200, 65, 65, 70],
      ],
      33000,
    ],
    [
      'BID004', '照明设备采购工单', 'XQ20260618004', '展厅改造项目',
      [
        ['P40001', 'LED射灯', '50W', '盏', 80, 175, 175, 185],
        ['P40002', '灯轨', '1米铝合金', '根', 40, 200, 200, 210],
      ],
      23500,
    ],
    [
      'BID005', '办公家具采购工单', 'XQ20260618005', '新办公楼装修项目',
      [
        ['P50001', '办公桌', '140×70cm', '张', 20, 900, 900, 950],
        ['P50002', '办公椅', '人体工学', '把', 40, 650, 650, 680],
      ],
      46000,
    ],
    [
      'BID006', '会议系统采购工单', 'XQ20260618006', '会议室智能化升级',
      [
        ['P60001', '无线麦克风', 'UHF双麦', '套', 6, 1500, 1500, 1600],
        ['P60002', '会议系统主机', '4进2出', '台', 2, 3200, 3200, 3400],
      ],
      17000,
    ],
    [
      'BID007', '展会装饰采购工单', 'XQ20260618007', '2026春季国际会展',
      [
        ['P70001', '挂旗', '120×80cm', '面', 60, 85, 85, 90],
        ['P70002', '地贴', '100×100cm', '张', 40, 120, 120, 128],
      ],
      10500,
    ],
    [
      'BID008', 'LED展示屏采购工单', 'XQ20260618008', '展厅改造项目',
      [
        ['P80001', 'LED屏', 'P2.5全彩', '㎡', 12, 3500, 3500, 3700],
        ['P80002', '安装支架', '定制钢架', '套', 1, 2500, 2500, 2700],
      ],
      48000,
    ],
    [
      'BID009', '印刷品采购工单', 'XQ20260618009', '2026春季国际会展',
      [
        ['P90001', '宣传册', 'A4/彩色', '本', 500, 8, 8, 9],
        ['P90002', '海报', 'A0/铜版纸', '张', 100, 35, 35, 38],
      ],
      8500,
    ],
    [
      'BID010', '接待区域家具采购工单', 'XQ20260618010', '新办公楼装修项目',
      [
        ['P11001', '沙发组', '3+1+1', '组', 3, 5800, 5800, 6200],
        ['P11002', '茶几', '120×60cm', '张', 6, 850, 850, 900],
      ],
      24000,
    ],
    [
      'BID011', '【演示】会议室设备采购', 'XQ20260620001', '新会议室建设项目',
      [
        ['P11002', '会议条形桌', '180×45cm', '张', 10, 2400, 2400, 2600],
        ['P11003', '会议椅', '带写字板', '把', 30, 1200, 1200, 1300],
      ],
      60000,
    ],
    [
      'BID012', '【演示】展会标牌制作', 'XQ20260620002', '2026夏季博览会',
      [
        ['P12001', '展位指示牌', '立式/含画面', '套', 20, 900, 900, 1000],
        ['P12002', '背景板', '3×6m/桁架结构', '㎡', 18, 1000, 1000, 1100],
      ],
      36000,
    ],
    [
      'BID013', '【演示】办公区隔断采购', 'XQ20260620003', '总部办公区改造',
      [
        ['P13001', '玻璃隔断', '双玻百叶/平米', '㎡', 80, 680, 680, 750],
        ['P13002', '隔断门', '单开门/含锁', '套', 10, 5440, 5440, 6000],
      ],
      108000,
    ],
    [
      'BID014', '【演示】接待台定制采购', 'XQ20260620004', '展厅前台升级',
      [
        ['P14001', '前台接待台', 'L型/3米', '套', 2, 19000, 19000, 21000],
        ['P14002', '接待台配套椅', '高脚升降椅', '把', 4, 9500, 9500, 10500],
      ],
      76000,
    ],
    [
      'BID015', '【演示】库房货架采购', 'XQ20260620005', '新库房配套设施',
      [
        ['P15001', '中型货架', '200×60×200cm/3层', '组', 15, 1200, 1200, 1350],
        ['P15002', '货架标签框', 'A4横装', '个', 150, 120, 120, 135],
      ],
      40500,
    ],
    // ======== 联动测试 10 条工单 ========
    [
      'BIDT01', '【测试1】多供应商标准比价', 'XQ-TEST-01', '联动测试场景-标准比价',
      [
        ['P-T001', '笔记本电脑', '14寸/16G/512G', '台', 10, 5500, 5500, 6000],
        ['P-T002', '显示器', '27寸/4K', '台', 10, 2400, 2400, 2500],
      ],
      85000,
    ],
    [
      'BIDT02', '【测试2】服务器采购比价', 'XQ-TEST-02', '联动测试场景-单品上限',
      [
        ['P-T003', '机架式服务器', '双路至强/128G', '台', 5, 33000, 33000, 35000],
        ['P-T004', '存储设备', 'SSD全闪/10TB', '台', 2, 48000, 48000, 50000],
      ],
      270000,
    ],
    [
      'BIDT03', '【测试3】打印机采购比价', 'XQ-TEST-03', '联动测试场景-部分合格',
      [
        ['P-T005', '激光打印机', 'A4黑白/网络打印', '台', 8, 2600, 2600, 2800],
        ['P-T006', '原装墨盒', '大容量', '个', 50, 160, 160, 180],
      ],
      31400,
    ],
    [
      'BIDT04', '【测试4】会议系统采购', 'XQ-TEST-04', '联动测试场景-中标采纳',
      [
        ['P-T007', '会议系统主机', '4进2出', '套', 2, 28000, 28000, 30000],
        ['P-T008', '投影幕', '100寸电动', '个', 4, 750, 750, 800],
      ],
      63200,
    ],
    [
      'BIDT05', '【测试5】打印耗材采购', 'XQ-TEST-05', '联动测试场景-全驳回',
      [
        ['P-T009', '打印耗材包', '墨盒+硒鼓+纸张', '套', 20, 320, 320, 350],
      ],
      7000,
    ],
    [
      'BIDT06', '【测试6】办公桌椅采购', 'XQ-TEST-06', '联动测试场景-抽签比价',
      [
        ['P-T010', '办公桌椅套装', '1.4m桌+人体工学椅', '套', 10, 4800, 4800, 5000],
      ],
      50000,
    ],
    [
      'BIDT07', '【测试7】机房空调采购', 'XQ-TEST-07', '联动测试场景-单一来源',
      [
        ['P-T011', '机房专用空调', '5匹/精密型', '台', 2, 26000, 26000, 28000],
      ],
      56000,
    ],
    [
      'BIDT08', '【测试8】LED大屏采购', 'XQ-TEST-08', '联动测试场景-大金额',
      [
        ['P-T012', 'LED全彩屏', 'P2.5全彩', '㎡', 50, 3500, 3500, 3800],
        ['P-T013', 'LED控制主机', '四路4K/拼接', '台', 3, 7200, 7200, 8000],
      ],
      214000,
    ],
    [
      'BIDT09', '【测试9】图书资料采购', 'XQ-TEST-09', '联动测试场景-税率差异',
      [
        ['P-T014', '资料印刷品', '彩色/铜版纸', '份', 500, 11, 11, 12],
      ],
      6000,
    ],
    [
      'BIDT10', '【测试10】展会物料采购', 'XQ-TEST-10', '联动测试场景-已评审',
      [
        ['P-T015', '展会综合物料包', '含展位物料+宣传品', '套', 100, 260, 260, 280],
      ],
      28000,
    ],
    // ======== 4条【相同报价】测试数据 ========
    [
      'BID-SAME01', '【测试-相同报价01】办公电脑采购', 'XQ-SAME-01', '联动测试-相同报价',
      [
        ['P-SAME01', '台式电脑', 'i5/8G/512G', '台', 10, 4500, 4500, 4800],
        ['P-SAME02', '电脑显示器', '24寸/HDMI', '台', 10, 1200, 1200, 1300],
      ],
      60000,
    ],
    [
      'BID-SAME02', '【测试-相同报价02】会议设备采购', 'XQ-SAME-02', '联动测试-相同报价',
      [
        ['P-SAME03', '视频会议终端', '1080P/云平台', '套', 5, 8800, 8800, 9500],
        ['P-SAME04', '会议平板', '65寸/4K', '台', 3, 12500, 12500, 13500],
      ],
      83500,
    ],
    [
      'BID-SAME03', '【测试-相同报价03】办公桌椅采购', 'XQ-SAME-03', '联动测试-相同报价',
      [
        ['P-SAME05', '员工办公桌', '1.4m/带侧柜', '张', 20, 1800, 1800, 1950],
        ['P-SAME06', '员工办公椅', '人体工学/网布', '把', 20, 850, 850, 920],
      ],
      54500,
    ],
    [
      'BID-SAME04', '【测试-相同报价04】打印设备采购', 'XQ-SAME-04', '联动测试-相同报价',
      [
        ['P-SAME07', '激光打印机', '黑白/双面', '台', 8, 2100, 2100, 2300],
        ['P-SAME08', '打印复印一体机', '彩色/网络', '台', 5, 3800, 3800, 4100],
      ],
      36100,
    ],
    // ======== 4条【不相同报价】测试数据 ========
    [
      'BID-DIFF01', '【测试-不相同报价01】网络设备采购', 'XQ-DIFF-01', '联动测试-不相同报价',
      [
        ['P-DIFF01', '企业路由器', '千兆/双WAN', '台', 3, 2800, 2800, 3000],
        ['P-DIFF02', '网络交换机', '24口/POE', '台', 4, 3200, 3200, 3500],
      ],
      23600,
    ],
    [
      'BID-DIFF02', '【测试-不相同报价02】监控设备采购', 'XQ-DIFF-02', '联动测试-不相同报价',
      [
        ['P-DIFF03', '网络摄像机', '400万像素/夜视', '台', 16, 680, 680, 750],
        ['P-DIFF04', '硬盘录像机', '32路/NVR', '台', 2, 2800, 2800, 3100],
      ],
      17280,
    ],
    [
      'BID-DIFF03', '【测试-不相同报价03】消防设备采购', 'XQ-DIFF-03', '联动测试-不相同报价',
      [
        ['P-DIFF05', '灭火器', '4kg/干粉', '具', 50, 85, 85, 95],
        ['P-DIFF06', '烟雾探测器', '独立式/电池', '个', 30, 120, 120, 135],
      ],
      7850,
    ],
    [
      'BID-DIFF04', '【测试-不相同报价04】清洁设备采购', 'XQ-DIFF-04', '联动测试-不相同报价',
      [
        ['P-DIFF07', '工业吸尘器', '干湿两用/大功率', '台', 4, 2200, 2200, 2450],
        ['P-DIFF08', '洗地机', '电瓶式/驾驶型', '台', 2, 8500, 8500, 9200],
      ],
      26800,
    ],
  ];

  // 测试数据自定义状态
  const statusOverride: Record<string, 'draft' | 'published' | 'bidding' | 'evaluated' | 'completed' | 'cancelled'> = {
    BIDT04: 'evaluated',
    BIDT05: 'cancelled',
    BIDT06: 'bidding',
    BIDT10: 'evaluated',
    'BID-SAME01': 'bidding',
    'BID-SAME02': 'bidding',
    'BID-SAME03': 'bidding',
    'BID-SAME04': 'bidding',
    'BID-DIFF01': 'evaluated',
    'BID-DIFF02': 'evaluated',
    'BID-DIFF03': 'evaluated',
    'BID-DIFF04': 'evaluated',
  };

  return data.map((row, idx) => {
    const bid: Bidding = {
      id: row[0],
      biddingNo: row[0],
      biddingName: row[1],
      biddingType: 'market' as const,
      demandId: '',
      demandNo: row[2],
      projectName: row[3],
      items: mkItems(row[4]),
      totalPriceLimit: row[5],
      status: statusOverride[row[0]] || 'published',
      creator: '采购部',
      createTime: `${ds} ${String(8 + idx).padStart(2, '0')}:${String(idx * 7).padStart(2, '0')}:00`,
      quotes: [] as any[],
    };
    return bid;
  });
})();

// 报价单测试数据
export const MOCK_SUPPLIER_QUOTES: SupplierQuote[] = (() => {
  const getBidding = (id: string) => MOCK_BIDDINGS.find((b) => b.id === id);

  // 生成报价单
  const mkQuote = (
    sid: string,
    bidId: string,
    supplier: { id: string; name: string; contact: string; phone: string },
    taxRate: number,
    prices: number[],
    status: 'submitted' | 'accepted' | 'rejected'
  ): SupplierQuote => {
    const bidding = getBidding(bidId)!;
    const items = bidding.items || [];
    const details: SupplierQuoteDetail[] = items.map((it, i) => mkDetail(it, prices[i] || 0, taxRate));
    const totalAmount = Math.round(details.reduce((s, d) => s + (d.amount || 0), 0) * 100) / 100;
    const totalTax = Math.round(details.reduce((s, d) => s + (d.taxAmount || 0), 0) * 100) / 100;
    return {
      id: sid,
      quoteNo: sid,
      biddingId: bidId,
      biddingNo: bidding.biddingNo,
      biddingName: bidding.biddingName,
      supplierId: supplier.id,
      supplierName: supplier.name,
      contactPerson: supplier.contact,
      contactPhone: supplier.phone,
      totalAmount: totalAmount,
      taxRate: taxRate,
      taxAmount: totalTax,
      quoteDate: ds,
      submittedAt: `${ds} 10:30:00`,
      status: status,
      details: details,
    };
  };

  const result: SupplierQuote[] = [];

  // ======== 基础 15 条工单对应的报价单（30条） ========
  // 简化处理：每条工单配 2 家供应商
  const basePairs: Array<{
    bidId: string;
    supA: [string, string, string, string, number, number, number];
    supB: [string, string, string, string, number, number, number];
  }> = [
    { bidId: 'BID001', supA: ['SUP001', '华东钢材有限公司', '张经理', '13800001001', 0.13, 220, 540], supB: ['SUP002', '华北铝业集团', '李总', '13900002002', 0.09, 205, 530] },
    { bidId: 'BID002', supA: ['SUP003', '南方建材公司', '王经理', '13700003003', 0.13, 1780, 1680], supB: ['SUP004', '西部材料科技', '赵工', '13600004004', 0.06, 1750, 1660] },
    { bidId: 'BID003', supA: ['SUP002', '华北铝业集团', '李总', '13900002002', 0.09, 178, 72], supB: ['SUP005', '东方供应集团', '陈经理', '13500005005', 0.13, 170, 70] },
    { bidId: 'BID004', supA: ['SUP001', '华东钢材有限公司', '张经理', '13800001001', 0.13, 185, 208], supB: ['SUP004', '西部材料科技', '赵工', '13600004004', 0.06, 180, 205] },
    { bidId: 'BID005', supA: ['SUP003', '南方建材公司', '王经理', '13700003003', 0.13, 940, 670], supB: ['SUP005', '东方供应集团', '陈经理', '13500005005', 0.09, 920, 660] },
    { bidId: 'BID006', supA: ['SUP004', '西部材料科技', '赵工', '13600004004', 0.06, 1580, 3380], supB: ['SUP002', '华北铝业集团', '李总', '13900002002', 0.09, 1550, 3300] },
    { bidId: 'BID007', supA: ['SUP003', '南方建材公司', '王经理', '13700003003', 0.13, 90, 125], supB: ['SUP001', '华东钢材有限公司', '张经理', '13800001001', 0.09, 86, 122] },
    { bidId: 'BID008', supA: ['SUP004', '西部材料科技', '赵工', '13600004004', 0.06, 3650, 2650], supB: ['SUP005', '东方供应集团', '陈经理', '13500005005', 0.13, 3600, 2600] },
    { bidId: 'BID009', supA: ['SUP001', '华东钢材有限公司', '张经理', '13800001001', 0.09, 8.5, 36], supB: ['SUP003', '南方建材公司', '王经理', '13700003003', 0.13, 8.8, 37] },
    { bidId: 'BID010', supA: ['SUP002', '华北铝业集团', '李总', '13900002002', 0.09, 6100, 890], supB: ['SUP005', '东方供应集团', '陈经理', '13500005005', 0.13, 6000, 870] },
  ];

  let seq = 1;
  const acceptedSeqs = [2, 6, 10, 14, 18];
  basePairs.forEach((pair) => {
    const bidding = MOCK_BIDDINGS.find((b) => b.id === pair.bidId)!;
    const items = bidding.items || [];
    [pair.supA, pair.supB].forEach((sup) => {
      const [supId, supName, contact, phone, taxRate, price1, price2] = sup;
      const amt1 = Math.round(price1 * (items[0]?.quantity || 0) * 100) / 100;
      const amt2 = Math.round(price2 * (items[1]?.quantity || 0) * 100) / 100;
      const taxAmt1 = taxRate > 0 ? Math.round((amt1 / (1 + taxRate)) * taxRate * 100) / 100 : 0;
      const taxAmt2 = taxRate > 0 ? Math.round((amt2 / (1 + taxRate)) * taxRate * 100) / 100 : 0;
      const details: SupplierQuoteDetail[] = items.map((it, i) => ({
        productCode: it.productCode,
        productName: it.productName,
        specification: it.specification,
        unit: it.unit,
        quantity: it.quantity,
        unitPrice: i === 0 ? price1 : price2,
        taxRate: taxRate,
        amount: i === 0 ? amt1 : amt2,
        taxAmount: i === 0 ? taxAmt1 : taxAmt2,
        deliveryDate: ds,
      }));
      const isAccepted = acceptedSeqs.includes(seq);
      result.push({
        id: 'SQ' + String(seq).padStart(3, '0'),
        quoteNo: `BJS${y}${m}${d}${String(seq).padStart(3, '0')}`,
        biddingId: pair.bidId,
        biddingNo: bidding.biddingNo,
        biddingName: bidding.biddingName,
        supplierId: supId,
        supplierName: supName,
        contactPerson: contact,
        contactPhone: phone,
        totalAmount: Math.round((amt1 + amt2) * 100) / 100,
        taxRate: taxRate,
        taxAmount: Math.round((taxAmt1 + taxAmt2) * 100) / 100,
        quoteDate: ds,
        submittedAt: `${ds} ${String(8 + Math.floor((seq - 1) / 2)).padStart(2, '0')}:${String(((seq - 1) * 7) % 60).padStart(2, '0')}:00`,
        status: isAccepted ? 'accepted' : 'submitted',
        details: details,
      });
      seq++;
    });
  });

  // ======== 5 条演示抽签的测试数据 ========
  const drawPairs: Array<{ bidId: string; supA: [string, string, string, string, number, number, number]; supB: [string, string, string, string, number, number, number]; supC: [string, string, string, string, number, number, number] }> = [
    { bidId: 'BID011', supA: ['SUP101', '德邦装饰工程', '孙经理', '18800001001', 0.09, 2400, 1200], supB: ['SUP102', '恒盛展览服务', '周经理', '18900001002', 0.06, 2400, 1200], supC: ['SUP103', '万达五金批发', '吴经理', '18700001003', 0.13, 2500, 1250] },
    { bidId: 'BID012', supA: ['SUP102', '恒盛展览服务', '周经理', '18900001002', 0.06, 900, 1000], supB: ['SUP103', '万达五金批发', '吴经理', '18700001003', 0.13, 900, 1000], supC: ['SUP101', '德邦装饰工程', '孙经理', '18800001001', 0.09, 950, 1050] },
    { bidId: 'BID013', supA: ['SUP103', '万达五金批发', '吴经理', '18700001003', 0.13, 680, 5440], supB: ['SUP104', '中天建筑材料', '郑经理', '18600001004', 0.09, 680, 5440], supC: ['SUP102', '恒盛展览服务', '周经理', '18900001002', 0.06, 720, 5600] },
    { bidId: 'BID014', supA: ['SUP104', '中天建筑材料', '郑经理', '18600001004', 0.09, 19000, 9500], supB: ['SUP105', '龙腾办公家具', '冯经理', '18500001005', 0.13, 19000, 9500], supC: ['SUP103', '万达五金批发', '吴经理', '18700001003', 0.06, 20000, 10000] },
    { bidId: 'BID015', supA: ['SUP105', '龙腾办公家具', '冯经理', '18500001005', 0.13, 1200, 120], supB: ['SUP101', '德邦装饰工程', '孙经理', '18800001001', 0.09, 1200, 120], supC: ['SUP104', '中天建筑材料', '郑经理', '18600001004', 0.06, 1280, 128] },
  ];

  drawPairs.forEach((pair) => {
    [pair.supA, pair.supB, pair.supC].forEach((sup) => {
      const [supId, supName, contact, phone, taxRate, price1, price2] = sup;
      result.push(mkQuote('SQ' + String(seq).padStart(3, '0'), pair.bidId, { id: supId, name: supName, contact, phone }, taxRate, [price1, price2], 'submitted'));
      seq++;
    });
  });

  // ======== 联动测试 10 条工单对应的报价单 ========
  // 【测试1】BIDT01: 3家供应商，正常比价
  result.push(mkQuote('SQT001', 'BIDT01', { id: 'SUP-T01', name: '【测试1】华星电脑供应商', contact: '李经理', phone: '13900000001' }, 0.13, [5800, 2350], 'submitted'));
  result.push(mkQuote('SQT002', 'BIDT01', { id: 'SUP-T02', name: '【测试1】明昊科技供应商', contact: '王经理', phone: '13900000002' }, 0.13, [5600, 2450], 'submitted'));
  result.push(mkQuote('SQT003', 'BIDT01', { id: 'SUP-T03', name: '【测试1】联创电子供应商', contact: '陈经理', phone: '13900000003' }, 0.13, [5900, 2400], 'submitted'));

  // 【测试2】BIDT02: 服务器采购
  result.push(mkQuote('SQT004', 'BIDT02', { id: 'SUP-T04', name: '【测试2】鑫达服务器供应商', contact: '赵工', phone: '13900000004' }, 0.13, [36500, 48000], 'submitted'));
  result.push(mkQuote('SQT005', 'BIDT02', { id: 'SUP-T05', name: '【测试2】存储科技供应商', contact: '刘工', phone: '13900000005' }, 0.13, [34500, 52000], 'submitted'));

  // 【测试3】BIDT03: 打印机采购
  result.push(mkQuote('SQT006', 'BIDT03', { id: 'SUP-T06', name: '【测试3】通用耗材供应商', contact: '周经理', phone: '13900000006' }, 0.13, [2900, 165], 'submitted'));
  result.push(mkQuote('SQT007', 'BIDT03', { id: 'SUP-T07', name: '【测试3】办公设备供应商', contact: '孙经理', phone: '13900000007' }, 0.13, [2700, 190], 'submitted'));
  result.push(mkQuote('SQT008', 'BIDT03', { id: 'SUP-T08', name: '【测试3】爱普耗材供应商', contact: '钱经理', phone: '13900000008' }, 0.13, [2650, 175], 'submitted'));

  // 【测试4】BIDT04: 会议系统采购，T-9已采纳
  result.push(mkQuote('SQT009', 'BIDT04', { id: 'SUP-T09', name: '【测试4】视界视听供应商（中标）', contact: '吴经理', phone: '13900000009' }, 0.13, [28500, 760], 'accepted'));
  result.push(mkQuote('SQT010', 'BIDT04', { id: 'SUP-T10', name: '【测试4】声扬电子供应商', contact: '郑经理', phone: '13900000010' }, 0.13, [29200, 790], 'submitted'));
  result.push(mkQuote('SQT011', 'BIDT04', { id: 'SUP-T11', name: '【测试4】创视科技供应商', contact: '冯经理', phone: '13900000011' }, 0.13, [29800, 785], 'submitted'));

  // 【测试5】BIDT05: 全部驳回
  result.push(mkQuote('SQT012', 'BIDT05', { id: 'SUP-T12', name: '【测试5】绿点耗材供应商', contact: '许经理', phone: '13900000012' }, 0.13, [380], 'rejected'));
  result.push(mkQuote('SQT013', 'BIDT05', { id: 'SUP-T13', name: '【测试5】蓝彩耗材供应商', contact: '韩经理', phone: '13900000013' }, 0.13, [375], 'rejected'));

  // 【测试6】BIDT06: 3家相同报价
  result.push(mkQuote('SQT014', 'BIDT06', { id: 'SUP-T14', name: '【测试6】精工家具供应商', contact: '杨经理', phone: '13900000014' }, 0.13, [4800], 'submitted'));
  result.push(mkQuote('SQT015', 'BIDT06', { id: 'SUP-T15', name: '【测试6】明轩家具供应商', contact: '朱经理', phone: '13900000015' }, 0.13, [4800], 'submitted'));
  result.push(mkQuote('SQT016', 'BIDT06', { id: 'SUP-T16', name: '【测试6】恒达家具供应商', contact: '秦经理', phone: '13900000016' }, 0.13, [4800], 'submitted'));

  // 【测试7】BIDT07: 单一来源
  result.push(mkQuote('SQT017', 'BIDT07', { id: 'SUP-T17', name: '【测试7】维科空调供应商（独家）', contact: '尤经理', phone: '13900000017' }, 0.09, [26500], 'submitted'));

  // 【测试8】BIDT08: LED大屏
  result.push(mkQuote('SQT018', 'BIDT08', { id: 'SUP-T18', name: '【测试8】星光显示供应商', contact: '许经理', phone: '13900000018' }, 0.13, [3600, 7600], 'submitted'));
  result.push(mkQuote('SQT019', 'BIDT08', { id: 'SUP-T19', name: '【测试8】华彩光电供应商', contact: '何经理', phone: '13900000019' }, 0.13, [3750, 7200], 'submitted'));
  result.push(mkQuote('SQT020', 'BIDT08', { id: 'SUP-T20', name: '【测试8】光科显示供应商', contact: '吕经理', phone: '13900000020' }, 0.13, [3680, 7450], 'submitted'));

  // 【测试9】BIDT09: 税率差异
  result.push(mkQuote('SQT021', 'BIDT09', { id: 'SUP-T21', name: '【测试9】图文印刷供应商（9%税率）', contact: '施经理', phone: '13900000021' }, 0.09, [10.0], 'submitted'));
  result.push(mkQuote('SQT022', 'BIDT09', { id: 'SUP-T22', name: '【测试9】新彩印刷供应商（6%税率）', contact: '张经理', phone: '13900000022' }, 0.06, [10.2], 'submitted'));
  result.push(mkQuote('SQT023', 'BIDT09', { id: 'SUP-T23', name: '【测试9】金印传媒供应商（13%税率）', contact: '孔经理', phone: '13900000023' }, 0.13, [9.8], 'submitted'));

  // 【测试10】BIDT10: 已评审
  result.push(mkQuote('SQT024', 'BIDT10', { id: 'SUP-T24', name: '【测试10】展鸿物料供应商（中标）', contact: '曹经理', phone: '13900000024' }, 0.13, [265], 'accepted'));
  result.push(mkQuote('SQT025', 'BIDT10', { id: 'SUP-T25', name: '【测试10】博展物料供应商', contact: '严经理', phone: '13900000025' }, 0.13, [258], 'submitted'));
  result.push(mkQuote('SQT026', 'BIDT10', { id: 'SUP-T26', name: '【测试10】汇展物料供应商', contact: '华经理', phone: '13900000026' }, 0.13, [272], 'submitted'));

  // ======== 4条【相同报价】测试数据 ========
  result.push(mkQuote('SQ-SAME01A', 'BID-SAME01', { id: 'SUP-SAME01A', name: '【相同报价01】联想商用供应商A', contact: '张经理', phone: '13800010001' }, 0.13, [4500, 1200], 'submitted'));
  result.push(mkQuote('SQ-SAME01B', 'BID-SAME01', { id: 'SUP-SAME01B', name: '【相同报价01】戴尔商用供应商B', contact: '李经理', phone: '13800010002' }, 0.13, [4500, 1200], 'submitted'));
  result.push(mkQuote('SQ-SAME01C', 'BID-SAME01', { id: 'SUP-SAME01C', name: '【相同报价01】惠普商用供应商C', contact: '王经理', phone: '13800010003' }, 0.13, [4500, 1200], 'submitted'));

  result.push(mkQuote('SQ-SAME02A', 'BID-SAME02', { id: 'SUP-SAME02A', name: '【相同报价02】华为会议供应商A', contact: '赵经理', phone: '13800020001' }, 0.09, [8800, 12500], 'submitted'));
  result.push(mkQuote('SQ-SAME02B', 'BID-SAME02', { id: 'SUP-SAME02B', name: '【相同报价02】思科会议供应商B', contact: '钱经理', phone: '13800020002' }, 0.09, [8800, 12500], 'submitted'));
  result.push(mkQuote('SQ-SAME02C', 'BID-SAME02', { id: 'SUP-SAME02C', name: '【相同报价02】亿联会议供应商C', contact: '孙经理', phone: '13800020003' }, 0.09, [8800, 12500], 'submitted'));

  result.push(mkQuote('SQ-SAME03A', 'BID-SAME03', { id: 'SUP-SAME03A', name: '【相同报价03】震旦家具供应商A', contact: '周经理', phone: '13800030001' }, 0.13, [1800, 850], 'submitted'));
  result.push(mkQuote('SQ-SAME03B', 'BID-SAME03', { id: 'SUP-SAME03B', name: '【相同报价03】海沃氏家具供应商B', contact: '吴经理', phone: '13800030002' }, 0.13, [1800, 850], 'submitted'));
  result.push(mkQuote('SQ-SAME03C', 'BID-SAME03', { id: 'SUP-SAME03C', name: '【相同报价03】圣奥家具供应商C', contact: '郑经理', phone: '13800030003' }, 0.13, [1800, 850], 'submitted'));

  result.push(mkQuote('SQ-SAME04A', 'BID-SAME04', { id: 'SUP-SAME04A', name: '【相同报价04】兄弟打印供应商A', contact: '冯经理', phone: '13800040001' }, 0.06, [2100, 3800], 'submitted'));
  result.push(mkQuote('SQ-SAME04B', 'BID-SAME04', { id: 'SUP-SAME04B', name: '【相同报价04】佳能打印供应商B', contact: '陈经理', phone: '13800040002' }, 0.06, [2100, 3800], 'submitted'));
  result.push(mkQuote('SQ-SAME04C', 'BID-SAME04', { id: 'SUP-SAME04C', name: '【相同报价04】富士打印供应商C', contact: '褚经理', phone: '13800040003' }, 0.06, [2100, 3800], 'submitted'));

  // ======== 4条【不相同报价】测试数据 ========
  result.push(mkQuote('SQ-DIFF01A', 'BID-DIFF01', { id: 'SUP-DIFF01A', name: '【不相同报价01】华为网络供应商', contact: '卫经理', phone: '13900010001' }, 0.13, [2850, 3380], 'submitted'));
  result.push(mkQuote('SQ-DIFF01B', 'BID-DIFF01', { id: 'SUP-DIFF01B', name: '【不相同报价01】H3C网络供应商', contact: '蒋经理', phone: '13900010002' }, 0.09, [2750, 3180], 'submitted'));
  result.push(mkQuote('SQ-DIFF01C', 'BID-DIFF01', { id: 'SUP-DIFF01C', name: '【不相同报价01】锐捷网络供应商', contact: '沈经理', phone: '13900010003' }, 0.06, [2900, 3250], 'submitted'));

  result.push(mkQuote('SQ-DIFF02A', 'BID-DIFF02', { id: 'SUP-DIFF02A', name: '【不相同报价02】海康监控供应商', contact: '韩经理', phone: '13900020001' }, 0.13, [720, 2950], 'submitted'));
  result.push(mkQuote('SQ-DIFF02B', 'BID-DIFF02', { id: 'SUP-DIFF02B', name: '【不相同报价02】大华监控供应商', contact: '杨经理', phone: '13900020002' }, 0.09, [680, 2750], 'submitted'));
  result.push(mkQuote('SQ-DIFF02C', 'BID-DIFF02', { id: 'SUP-DIFF02C', name: '【不相同报价02】宇视监控供应商', contact: '朱经理', phone: '13900020003' }, 0.06, [750, 2850], 'submitted'));

  result.push(mkQuote('SQ-DIFF03A', 'BID-DIFF03', { id: 'SUP-DIFF03A', name: '【不相同报价03】安达消防供应商', contact: '秦经理', phone: '13900030001' }, 0.13, [92, 135], 'submitted'));
  result.push(mkQuote('SQ-DIFF03B', 'BID-DIFF03', { id: 'SUP-DIFF03B', name: '【不相同报价03】国安消防供应商', contact: '尤经理', phone: '13900030002' }, 0.09, [88, 128], 'submitted'));
  result.push(mkQuote('SQ-DIFF03C', 'BID-DIFF03', { id: 'SUP-DIFF03C', name: '【不相同报价03】宏发消防供应商', contact: '许经理', phone: '13900030003' }, 0.06, [95, 140], 'submitted'));

  result.push(mkQuote('SQ-DIFF04A', 'BID-DIFF04', { id: 'SUP-DIFF04A', name: '【不相同报价04】坦洁清洁供应商', contact: '何经理', phone: '13900040001' }, 0.13, [2350, 8800], 'submitted'));
  result.push(mkQuote('SQ-DIFF04B', 'BID-DIFF04', { id: 'SUP-DIFF04B', name: '【不相同报价04】德威清洁供应商', contact: '吕经理', phone: '13900040002' }, 0.09, [2180, 8500], 'submitted'));
  result.push(mkQuote('SQ-DIFF04C', 'BID-DIFF04', { id: 'SUP-DIFF04C', name: '【不相同报价04】力奇清洁供应商', contact: '施经理', phone: '13900040003' }, 0.06, [2420, 9100], 'submitted'));

  return result;
})();
