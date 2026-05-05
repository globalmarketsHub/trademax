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


本次版本说明：右侧行情图表保留原位置；页面中间不新增图表。海外用户加载 TradingView，中国大陆用户右侧自动切换为可访问的黄金行情展示模块。
