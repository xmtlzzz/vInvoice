# vInvoice项目
## 项目背景
出差发票太多，想要通过统一化工具管理

## 部署使用
项目整体采用react实现，存储相对简单，存储到json，默认保存到server/data.json中，默认监听在3001端口
```bash
# 启动实例
npm run server
```

补充了dockerfile，也可以直接docker compose运行
```bash
docker compose build --no-cache
docker compose up -d
```
