const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 10001;
const DIST_DIR = path.join(__dirname, 'dist', 'h5');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  
  if (reqPath === '/') {
    reqPath = '/index.html';
  }
  
  const filePath = path.join(DIST_DIR, reqPath);
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

  if (!fs.existsSync(DIST_DIR)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>殡葬一条龙服务 - 小程序</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #F7F8FA 0%, #EEF1F5 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            padding: 40px 20px;
          }
          .card {
            background: white;
            border-radius: 20px;
            padding: 48px;
            max-width: 640px;
            width: 100%;
            box-shadow: 0 10px 40px rgba(44, 62, 80, 0.1);
          }
          h1 {
            color: #2C3E50;
            font-size: 32px;
            margin: 0 0 16px;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .emoji { font-size: 40px; }
          .desc {
            color: #4E5969;
            line-height: 1.8;
            font-size: 15px;
            margin: 0 0 32px;
          }
          .section-title {
            color: #2C3E50;
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 16px;
            padding-left: 12px;
            border-left: 4px solid #D4A574;
          }
          .pages {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-bottom: 32px;
          }
          .page-item {
            padding: 16px;
            background: #F5F7FA;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
            transition: all 0.2s;
            cursor: default;
          }
          .page-item:hover {
            background: #E8EEF5;
            transform: translateY(-2px);
          }
          .icon { font-size: 28px; }
          .page-name { color: #1D2129; font-weight: 600; font-size: 14px; margin-bottom: 2px; }
          .page-desc { color: #86909C; font-size: 12px; }
          .tip {
            background: linear-gradient(135deg, #FDF6EE 0%, #FBF0DF 100%);
            border-radius: 12px;
            padding: 20px 24px;
            border-left: 4px solid #D4A574;
          }
          .tip-title {
            color: #8B6F47;
            font-weight: 600;
            font-size: 15px;
            margin: 0 0 8px;
          }
          .tip-text {
            color: #8B6F47;
            font-size: 13px;
            line-height: 1.7;
            margin: 0;
          }
          code {
            background: rgba(212, 165, 116, 0.15);
            padding: 2px 8px;
            border-radius: 4px;
            font-family: 'SF Mono', Menlo, monospace;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1><span class="emoji">🕊️</span>殡葬一条龙服务小程序</h1>
          <p class="desc">
            专为殡葬服务公司设计的接单、派工、服务跟踪一体化管理小程序。
            涵盖订单管理、人员调度、物资调配、费用结算等全流程功能。
          </p>
          
          <h3 class="section-title">📱 小程序页面 (10个)</h3>
          <div class="pages">
            <div class="page-item">
              <span class="icon">🏠</span>
              <div>
                <div class="page-name">首页</div>
                <div class="page-desc">统计/快捷入口/套餐</div>
              </div>
            </div>
            <div class="page-item">
              <span class="icon">📋</span>
              <div>
                <div class="page-name">订单管理</div>
                <div class="page-desc">搜索/状态/订单列表</div>
              </div>
            </div>
            <div class="page-item">
              <span class="icon">📦</span>
              <div>
                <div class="page-name">物资中心</div>
                <div class="page-desc">寿衣/骨灰盒/库存</div>
              </div>
            </div>
            <div class="page-item">
              <span class="icon">👤</span>
              <div>
                <div class="page-name">个人中心</div>
                <div class="page-desc">统计/评价/回访</div>
              </div>
            </div>
            <div class="page-item">
              <span class="icon">🎁</span>
              <div>
                <div class="page-name">套餐详情</div>
                <div class="page-desc">4种套餐/服务明细</div>
              </div>
            </div>
            <div class="page-item">
              <span class="icon">➕</span>
              <div>
                <div class="page-name">新建订单</div>
                <div class="page-desc">24H接单/加急</div>
              </div>
            </div>
            <div class="page-item">
              <span class="icon">🔍</span>
              <div>
                <div class="page-name">订单详情</div>
                <div class="page-desc">逝者/家属/流程</div>
              </div>
            </div>
            <div class="page-item">
              <span class="icon">👷</span>
              <div>
                <div class="page-name">人员派工</div>
                <div class="page-desc">司仪/化妆师派工</div>
              </div>
            </div>
            <div class="page-item">
              <span class="icon">💰</span>
              <div>
                <div class="page-name">费用结算</div>
                <div class="page-desc">明细/报价单/支付</div>
              </div>
            </div>
            <div class="page-item">
              <span class="icon">⭐</span>
              <div>
                <div class="page-name">服务评价</div>
                <div class="page-desc">评分/回访关怀</div>
              </div>
            </div>
          </div>

          <div class="tip">
            <h4 class="tip-title">💡 H5 构建说明</h4>
            <p class="tip-text">
              此页面为静态预览页。如需查看完整的小程序，
              请先执行 <code>npm run build:h5</code> 完成构建后刷新本页。<br/>
              或运行 <code>npm run dev:weapp</code> 在微信开发者工具中打开 <code>dist/weapp</code> 目录预览小程序。
            </p>
          </div>
        </div>
      </body>
      </html>
    `);
    return;
  }

  if (!fs.existsSync(filePath)) {
    const fallbackFile = path.join(DIST_DIR, 'index.html');
    if (fs.existsSync(fallbackFile) && ext === '') {
      const content = fs.readFileSync(fallbackFile);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(content);
      return;
    }
    res.writeHead(404);
    res.end('404 Not Found');
    return;
  }

  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(content);
  } catch (err) {
    res.writeHead(500);
    res.end('500 Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`\n🚀 殡葬一条龙服务小程序预览服务器已启动`);
  console.log(`📡 本地访问地址: http://localhost:${PORT}`);
  console.log(`📂 静态文件目录: ${DIST_DIR}\n`);
});
