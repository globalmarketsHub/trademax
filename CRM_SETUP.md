CRM后台设置：
1. 创建 Supabase 项目
2. 在 SQL Editor 运行 supabase_schema.sql
3. 打开 crm-config.js，填入 SUPABASE_URL 和 SUPABASE_ANON_KEY，并修改 ADMIN_PASSWORD
4. 上传全部文件到 GitHub

后台地址：
客户CRM：https://globalmarketshub.github.io/trademax/crm-leads.html
浏览统计：https://globalmarketshub.github.io/trademax/crm-analytics.html
客户登记：https://globalmarketshub.github.io/trademax/lead-form.html

说明：
IP通过 api.ipify.org 获取；客户信息和浏览数据存入 Supabase。
静态网页后台密码只适合基础保护，正式运营建议使用 Supabase Auth + 严格RLS。
