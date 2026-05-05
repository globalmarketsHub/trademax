# TradeMax 最终一次性版本设置

## 后台密码
当前后台密码已设置为：

980907

可在 `crm-config.js` 里修改 `ADMIN_PASSWORD`。

## 必须配置 Supabase，否则 CRM 不会保存数据
1. 打开 Supabase 创建项目
2. 进入 SQL Editor
3. 复制 `supabase_schema.sql` 全部内容运行
4. 打开 `crm-config.js`
5. 填入：
   - SUPABASE_URL
   - SUPABASE_ANON_KEY

## 可选邮件提醒
如果你希望客户提交后同步发邮件给你，配置 EmailJS：
- EMAILJS_PUBLIC_KEY
- EMAILJS_SERVICE_ID
- EMAILJS_TEMPLATE_ID

不配置 EmailJS 也没关系，CRM后台仍然会保存客户。

## 上线地址
客户登记：
https://globalmarketshub.github.io/trademax/lead-form.html

客户CRM：
https://globalmarketshub.github.io/trademax/crm-leads.html

浏览统计：
https://globalmarketshub.github.io/trademax/crm-analytics.html

## 本版功能
- 不再强制跳 WhatsApp
- 客户提交后保存后台
- 在线客服提交保存后台
- 在线客服问题写入 chat_logs
- IP + 国家识别
- 中国大陆客户标红加权
- 澳洲IP降权到后面
- 按客户意向评分排序
- CRM表格居中清晰展示


行情说明：本版本右侧行情没有任何模拟价格或假K线。中国大陆用户加载新浪财经伦敦金XAU真实第三方页面；海外用户加载TradingView。测试国内行情可在网址后加 `?chart=cn`。



行情API说明：
- 本版本国内右侧行情不再使用新浪网页 iframe，因此没有网页广告。
- 国内行情使用 GoldAPI.io 的真实 XAU/USD API 自绘干净图表。
- 你需要在 `crm-config.js` 里填写 `GOLD_API_KEY`。
- 未填写 API Key 时，不显示假价格，只提示需要配置API。
- 测试API行情可在网址后加 `?chart=api`。
