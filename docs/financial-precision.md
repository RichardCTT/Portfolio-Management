# 💰 金融精度处理指南

## 🎯 问题背景

JavaScript 的浮点数运算存在精度问题，这在金融系统中是不可接受的。例如：

```javascript
// ❌ 问题示例
0.1 + 0.2 // 结果：0.30000000000000004 (而非 0.3)
0.3 - 0.1 // 结果：0.19999999999999998 (而非 0.2)
450.33 * 3.7 // 结果：1666.2210000000003 (而非 1666.22)
```

## 🛠️ 解决方案

我们创建了 `utils/financial.js` 工具库来统一处理金融计算的精度问题。

### 📋 核心函数

#### 1. 格式化函数
```javascript
formatCurrency(amount)    // 货币：保留2位小数
formatQuantity(quantity)  // 数量：保留6位小数
formatPrice(price)        // 价格：保留4位小数
```

#### 2. 计算函数
```javascript
calculateTotal(price, quantity)  // 计算总额
addCurrency(a, b)               // 货币加法
subtractCurrency(a, b)          // 货币减法
addQuantity(a, b)               // 数量加法
subtractQuantity(a, b)          // 数量减法
```

#### 3. 验证函数
```javascript
isValidCurrency(amount)           // 验证货币有效性
isValidQuantity(quantity)         // 验证数量有效性
hasSufficientFunds(available, required) // 检查资金充足性
```

## 📖 使用示例

### 买入资产计算
```javascript
import { calculateTotal, subtractCurrency, hasSufficientFunds } from '../utils/financial.js';

const price = 450.33;      // 股价
const quantity = 10.5;     // 购买数量
const cashBalance = 5000.00; // 现金余额

// ✅ 安全计算
const totalCost = calculateTotal(price, quantity);  // 4728.47
const canAfford = hasSufficientFunds(cashBalance, totalCost); // true
const newBalance = subtractCurrency(cashBalance, totalCost); // 271.53
```

### 卖出资产计算
```javascript
import { calculateTotal, addCurrency } from '../utils/financial.js';

const sellPrice = 460.75;
const sellQuantity = 5.2;
const currentCash = 1000.50;

// ✅ 安全计算
const totalReceived = calculateTotal(sellPrice, sellQuantity); // 2395.90
const newCashBalance = addCurrency(currentCash, totalReceived); // 3396.40
```

## 🔧 项目中的应用

### 交易接口中的使用

#### 买入接口 (`/api/transactions/buy`)
```javascript
// 计算总成本
const totalCost = calculateTotal(unitPrice, quantity);

// 检查资金充足性
if (!hasSufficientFunds(cashAccount.quantity, totalCost)) {
  throw new Error(`Insufficient funds`);
}

// 更新余额
const newCashBalance = subtractCurrency(cashAccount.quantity, totalCost);
const newHolding = addQuantity(asset.quantity, quantity);
```

#### 卖出接口 (`/api/transactions/sell`)
```javascript
// 计算总收入
const totalReceived = calculateTotal(unitPrice, quantity);

// 更新余额
const newCashBalance = addCurrency(cashAccount.quantity, totalReceived);
const newHolding = subtractQuantity(asset.quantity, quantity);
```

## 📊 精度策略

| 数据类型 | 小数位数 | 说明 |
|----------|----------|------|
| 现金金额 | 2位 | 符合货币标准 |
| 资产数量 | 6位 | 支持小额股份 |
| 价格 | 4位 | 支持精确定价 |
| 百分比 | 2位 | 用于收益率等 |

## ⚠️ 注意事项

### 1. 始终使用工具函数
```javascript
// ❌ 错误做法
const total = price * quantity;
const newBalance = balance - cost;

// ✅ 正确做法
const total = calculateTotal(price, quantity);
const newBalance = subtractCurrency(balance, cost);
```

### 2. 数据库存储
- 确保数据库字段精度足够（DECIMAL 或 DOUBLE）
- 存储前进行格式化
- 读取后进行验证

### 3. API 响应
```javascript
// 确保返回的数值已格式化
res.json({
  data: {
    total_cost: formatCurrency(totalCost),
    remaining_cash: formatCurrency(newCashBalance),
    new_holding: formatQuantity(newHolding)
  }
});
```

## 🧪 测试

运行精度测试：
```bash
node test/financial-precision-test.js
```

该测试验证：
- 基本算术运算精度
- 累积误差控制
- 边界条件处理

## 🎯 最佳实践

1. **统一性**：项目中所有金融计算都使用工具函数
2. **验证**：输入数据验证，输出数据格式化
3. **测试**：对关键计算路径进行精度测试
4. **文档**：清楚标注每个字段的精度要求

通过这套工具函数，我们确保了系统在处理金融数据时的准确性和一致性。
