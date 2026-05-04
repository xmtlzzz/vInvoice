import pptxgen from "pptxgenjs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ═══ Color Palette (light tones) ═══
const C = {
  white: "FFFFFF",
  bg: "F8FAFC",           // slate-50
  bgBlue: "F0F9FF",       // sky-50
  bgWarm: "FFFBEB",       // amber-50
  primary: "0EA5E9",      // sky-500
  primaryDark: "0284C7",  // sky-600
  accent: "6366F1",       // indigo-500
  success: "10B981",      // emerald-500
  warm: "F59E0B",         // amber-500
  text: "1E293B",         // slate-800
  textMuted: "64748B",    // slate-500
  textLight: "94A3B8",    // slate-400
  border: "E2E8F0",       // slate-200
  borderLight: "F1F5F9",  // slate-100
};

// ═══ Helper: create fresh shadow object each time ═══
const cardShadow = () => ({ type: "outer", color: "0F172A", blur: 8, offset: 2, angle: 135, opacity: 0.08 });
const softShadow = () => ({ type: "outer", color: "0F172A", blur: 4, offset: 1, angle: 135, opacity: 0.05 });

const TOTAL = 9;

async function main() {
  const pres = new pptxgen();

  // ═══ Closure helpers (access pres.shapes directly) ═══
  function addCard(slide, x, y, w, h, fill = C.white) {
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w, h,
      fill: { color: fill },
      rectRadius: 0.12,
      shadow: cardShadow(),
    });
  }
  function addPageNum(slide, num, total) {
    slide.addText(`${num} / ${total}`, {
      x: 8.5, y: 5.2, w: 1.2, h: 0.3,
      fontSize: 9, color: C.textLight, align: "right", fontFace: "Calibri",
    });
  }
  function addSectionTitle(slide, title, subtitle) {
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.7, y: 0.55, w: 0.06, h: 0.45,
      fill: { color: C.primary },
    });
    slide.addText(title, {
      x: 0.95, y: 0.45, w: 8, h: 0.5,
      fontSize: 22, fontFace: "Calibri", bold: true, color: C.text,
      margin: 0,
    });
    if (subtitle) {
      slide.addText(subtitle, {
        x: 0.95, y: 0.9, w: 8, h: 0.3,
        fontSize: 11, fontFace: "Calibri", color: C.textMuted, margin: 0,
      });
    }
  }
  pres.layout = "LAYOUT_16x9";
  pres.author = "vInvoice Team";
  pres.title = "vInvoice 项目介绍";

  const makeTransition = () => ({ type: "push", dir: "d", duration: 0.6 });

  // ═══════════════════════════════════════════
  // SLIDE 1: Cover
  // ═══════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.white };
    s.transition = makeTransition();

    // Large decorative circle top-right
    s.addShape(pres.shapes.OVAL, {
      x: 7.2, y: -1.0, w: 4.5, h: 4.5,
      fill: { color: C.primary, transparency: 8 },
    });
    // Smaller circle
    s.addShape(pres.shapes.OVAL, {
      x: 8.3, y: 2.8, w: 2.5, h: 2.5,
      fill: { color: C.primary, transparency: 12 },
    });

    // App icon placeholder (rounded square)
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 1.1, w: 0.9, h: 0.9,
      fill: { color: C.primary },
      rectRadius: 0.18,
      shadow: cardShadow(),
    });
    s.addText("V", {
      x: 0.8, y: 1.1, w: 0.9, h: 0.9,
      fontSize: 36, fontFace: "Calibri", bold: true, color: C.white,
      align: "center", valign: "middle", margin: 0,
    });

    s.addText("vInvoice", {
      x: 0.8, y: 2.2, w: 7, h: 0.8,
      fontSize: 42, fontFace: "Calibri", bold: true, color: C.text, margin: 0,
    });
    s.addText("出差费用管理工具", {
      x: 0.8, y: 2.95, w: 7, h: 0.45,
      fontSize: 18, fontFace: "Calibri", color: C.textMuted, margin: 0,
    });

    // Divider line
    s.addShape(pres.shapes.LINE, {
      x: 0.8, y: 3.6, w: 2.5, h: 0,
      line: { color: C.primary, width: 2.5 },
    });

    // Feature tags
    const tags = ["多用户协作", "费用追踪", "数据导出", "Vercel 部署"];
    tags.forEach((t, i) => {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: 0.8 + i * 2.15, y: 3.95, w: 1.95, h: 0.38,
        fill: { color: C.bgBlue },
        rectRadius: 0.2,
      });
      s.addText(t, {
        x: 0.8 + i * 2.15, y: 3.95, w: 1.95, h: 0.38,
        fontSize: 10, fontFace: "Calibri", color: C.primaryDark,
        align: "center", valign: "middle", margin: 0,
      });
    });
  }

  // ═══════════════════════════════════════════
  // SLIDE 2: Project Overview
  // ═══════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    s.transition = makeTransition();
    addSectionTitle(s, "项目概述", "PROJECT OVERVIEW");
    addPageNum(s, 2, TOTAL);

    // Two-column layout
    // Left: description card
    addCard(s, 0.7, 1.45, 4.1, 3.6);
    s.addText("关于 vInvoice", {
      x: 0.95, y: 1.6, w: 3.6, h: 0.35,
      fontSize: 14, fontFace: "Calibri", bold: true, color: C.text, margin: 0,
    });
    s.addText([
      { text: "vInvoice 是一款出差费用管理工具，帮助团队高效追踪和管理差旅支出。", options: { breakLine: true, fontSize: 11, color: C.textMuted } },
      { text: "", options: { breakLine: true, fontSize: 6 } },
      { text: "支持多用户、多项目、多费用类型的统一化管理，提供统计分析和数据导入导出功能。", options: { fontSize: 11, color: C.textMuted } },
    ], {
      x: 0.95, y: 2.05, w: 3.6, h: 2.8,
      fontFace: "Calibri", valign: "top", margin: 0,
      paraSpaceAfter: 4,
    });

    // Right: key numbers
    const stats = [
      { num: "6", label: "数据表", color: C.primary },
      { num: "17", label: "API 端点", color: C.accent },
      { num: "4", label: "前端页面", color: C.success },
      { num: "5+", label: "费用类型", color: C.warm },
    ];
    stats.forEach((st, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = 5.1 + col * 2.2;
      const cy = 1.45 + row * 1.8;
      addCard(s, cx, cy, 2.0, 1.6);
      s.addText(st.num, {
        x: cx, y: cy + 0.2, w: 2.0, h: 0.6,
        fontSize: 32, fontFace: "Calibri", bold: true, color: st.color,
        align: "center", valign: "middle", margin: 0,
      });
      s.addText(st.label, {
        x: cx, y: cy + 0.9, w: 2.0, h: 0.4,
        fontSize: 11, fontFace: "Calibri", color: C.textMuted,
        align: "center", valign: "middle", margin: 0,
      });
    });
  }

  // ═══════════════════════════════════════════
  // SLIDE 3: Tech Stack
  // ═══════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    s.transition = makeTransition();
    addSectionTitle(s, "技术架构", "TECH STACK");
    addPageNum(s, 3, TOTAL);

    // 4-layer stack
    const layers = [
      { title: "前端 Frontend", items: ["React 18", "React Router v6", "Vite 5", "Tailwind CSS 3.4", "Lucide Icons"], color: C.primary },
      { title: "后端 Backend", items: ["Express 4", "bcryptjs", "CORS", "RESTful API"], color: C.accent },
      { title: "数据库 Database", items: ["Neon PostgreSQL", "Serverless Driver", "6 张数据表", "外键约束 & 索引"], color: C.success },
      { title: "部署 Deploy", items: ["Vercel Serverless", "静态托管", "Fluid Compute", "自动扩容"], color: C.warm },
    ];

    layers.forEach((ly, i) => {
      const y = 1.4 + i * 1.0;
      // Accent bar
      s.addShape(pres.shapes.RECTANGLE, {
        x: 0.7, y, w: 0.06, h: 0.8,
        fill: { color: ly.color },
      });
      // Title
      s.addText(ly.title, {
        x: 0.95, y: y - 0.02, w: 2.5, h: 0.35,
        fontSize: 13, fontFace: "Calibri", bold: true, color: C.text, margin: 0,
      });
      // Items
      s.addText(ly.items.join("  ·  "), {
        x: 0.95, y: y + 0.35, w: 8.5, h: 0.3,
        fontSize: 10, fontFace: "Calibri", color: C.textMuted, margin: 0,
      });
      // Separator line
      if (i < 3) {
        s.addShape(pres.shapes.LINE, {
          x: 0.95, y: y + 0.85, w: 8.5, h: 0,
          line: { color: C.border, width: 0.5 },
        });
      }
    });
  }

  // ═══════════════════════════════════════════
  // SLIDE 4: Database Schema
  // ═══════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    s.transition = makeTransition();
    addSectionTitle(s, "数据库设计", "DATABASE SCHEMA");
    addPageNum(s, 4, TOTAL);

    const tables = [
      { name: "users", cols: "id, username, password, namespace_id", desc: "用户表 — bcrypt 加密存储" },
      { name: "namespaces", cols: "id, name, created_at", desc: "命名空间 — 多租户数据隔离" },
      { name: "namespace_custom_types", cols: "namespace_id, key, label, icon", desc: "自定义费用类型" },
      { name: "projects", cols: "id, namespace_id, name, desc, created_at, submitted_at", desc: "项目表" },
      { name: "expenses", cols: "id, project_id, type, amount, date, desc, reimbursed, pdf", desc: "费用记录表" },
      { name: "invite_codes", cols: "code, used", desc: "邀请码表 — 注册准入控制" },
    ];

    tables.forEach((t, i) => {
      const y = 1.35 + i * 0.63;
      // Table name badge
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: 0.7, y, w: 1.8, h: 0.38,
        fill: { color: i < 3 ? C.bgBlue : C.bgWarm },
        rectRadius: 0.08,
      });
      s.addText(t.name, {
        x: 0.7, y, w: 1.8, h: 0.38,
        fontSize: 9, fontFace: "Consolas", bold: true, color: C.text,
        align: "center", valign: "middle", margin: 0,
      });
      // Columns
      s.addText(t.cols, {
        x: 2.65, y: y - 0.02, w: 6.5, h: 0.22,
        fontSize: 9, fontFace: "Consolas", color: C.textMuted, margin: 0,
      });
      // Description
      s.addText(t.desc, {
        x: 2.65, y: y + 0.2, w: 6.5, h: 0.18,
        fontSize: 9, fontFace: "Calibri", color: C.textLight, margin: 0,
      });
    });

    // Relation hint
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.7, y: 5.05, w: 8.6, h: 0.32,
      fill: { color: C.white },
      rectRadius: 0.06,
    });
    s.addText([
      { text: "关系: ", options: { bold: true, fontSize: 9, color: C.text } },
      { text: "users.namespace_id → namespaces.id  |  projects.namespace_id → namespaces.id  |  expenses.project_id → projects.id", options: { fontSize: 9, color: C.textMuted } },
    ], {
      x: 0.85, y: 5.05, w: 8.3, h: 0.32,
      fontFace: "Calibri", valign: "middle", margin: 0,
    });
  }

  // ═══════════════════════════════════════════
  // SLIDE 5: API Endpoints
  // ═══════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    s.transition = makeTransition();
    addSectionTitle(s, "API 端点设计", "RESTFUL API");
    addPageNum(s, 5, TOTAL);

    const endpoints = [
      ["POST /api/login", "用户登录，bcrypt 密码校验"],
      ["POST /api/register", "用户注册，邀请码验证 + 自动创建命名空间"],
      ["GET /api", "获取当前命名空间下的所有项目与费用数据"],
      ["POST /api/projects", "创建新项目"],
      ["DELETE /api/projects/:id", "删除指定项目"],
      ["PUT /api/projects/:id/submit", "提交项目（锁定费用编辑）"],
      ["PUT /api/projects/:id/revoke", "撤销项目提交"],
      ["POST /api/projects/:id/expenses", "添加费用记录"],
      ["PUT /api/projects/:id/expenses/:eid", "更新费用信息"],
      ["PUT /api/projects/:id/expenses/:eid/toggle", "切换报销状态"],
      ["DELETE /api/projects/:id/expenses/:eid", "删除费用记录"],
      ["POST /api/custom-types", "添加自定义费用类型"],
      ["DELETE /api/custom-types/:key", "删除自定义类型"],
      ["GET /api/export", "导出命名空间数据（JSON）"],
      ["POST /api/import", "导入数据到当前命名空间"],
      ["GET /api/health", "数据库连接健康检查"],
    ];

    endpoints.forEach((ep, i) => {
      const y = 1.35 + i * 0.245;
      const method = ep[0].split(" ")[0];
      const methodColors = {
        "GET": { bg: "DCFCE7", text: "166534" },
        "POST": { bg: "DBEAFE", text: "1E40AF" },
        "PUT": { bg: "FEF3C7", text: "92400E" },
        "DELETE": { bg: "FEE2E2", text: "991B1B" },
      };
      const mc = methodColors[method] || { bg: "F1F5F9", text: "475569" };

      // Method badge
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: 0.7, y, w: 0.58, h: 0.2,
        fill: { color: mc.bg },
        rectRadius: 0.04,
      });
      s.addText(method, {
        x: 0.7, y, w: 0.58, h: 0.2,
        fontSize: 7, fontFace: "Consolas", bold: true, color: mc.text,
        align: "center", valign: "middle", margin: 0,
      });
      // Path
      s.addText(ep[0].split(" ")[1], {
        x: 1.4, y, w: 3.5, h: 0.2,
        fontSize: 8, fontFace: "Consolas", color: C.text, margin: 0, valign: "middle",
      });
      // Description
      s.addText(ep[1], {
        x: 5.0, y, w: 4.5, h: 0.2,
        fontSize: 8, fontFace: "Calibri", color: C.textMuted, margin: 0, valign: "middle",
      });
    });
  }

  // ═══════════════════════════════════════════
  // SLIDE 6: Frontend Architecture
  // ═══════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    s.transition = makeTransition();
    addSectionTitle(s, "前端架构", "FRONTEND ARCHITECTURE");
    addPageNum(s, 6, TOTAL);

    // Component tree using nested cards
    // Root: App.jsx
    addCard(s, 2.8, 1.5, 4.4, 0.55);
    s.addText("App.jsx — 路由配置 / 认证守卫", {
      x: 2.8, y: 1.5, w: 4.4, h: 0.55,
      fontSize: 11, fontFace: "Calibri", bold: true, color: C.white,
      align: "center", valign: "middle", margin: 0,
    });
    // Override fill for root
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 2.8, y: 1.5, w: 4.4, h: 0.55,
      fill: { color: C.primaryDark },
      rectRadius: 0.1,
      shadow: cardShadow(),
    });
    s.addText("App.jsx — 路由配置 / 认证守卫", {
      x: 2.8, y: 1.5, w: 4.4, h: 0.55,
      fontSize: 11, fontFace: "Calibri", bold: true, color: C.white,
      align: "center", valign: "middle", margin: 0,
    });

    // Connector lines
    s.addShape(pres.shapes.LINE, {
      x: 4.3, y: 2.05, w: 0, h: 0.2,
      line: { color: C.border, width: 1.5 },
    });
    s.addShape(pres.shapes.LINE, {
      x: 5.7, y: 2.05, w: 0, h: 0.2,
      line: { color: C.border, width: 1.5 },
    });

    // Level 1: Context + Layout
    const l1cards = [
      { title: "ExpenseContext", desc: "全局状态管理\n用户、数据、API 方法", x: 0.9, w: 3.3 },
      { title: "Layout.jsx", desc: "顶部导航 + 底部 Tab\n用户下拉菜单", x: 5.8, w: 3.3 },
    ];
    l1cards.forEach((c) => {
      addCard(s, c.x, 2.35, c.w, 1.0);
      s.addText(c.title, {
        x: c.x + 0.15, y: 2.42, w: c.w - 0.3, h: 0.3,
        fontSize: 11, fontFace: "Calibri", bold: true, color: C.text, margin: 0,
      });
      s.addText(c.desc, {
        x: c.x + 0.15, y: 2.72, w: c.w - 0.3, h: 0.5,
        fontSize: 9, fontFace: "Calibri", color: C.textMuted, margin: 0,
      });
    });

    // Connector
    s.addShape(pres.shapes.LINE, {
      x: 3.5, y: 3.35, w: 0, h: 0.15,
      line: { color: C.border, width: 1.5 },
    });
    s.addShape(pres.shapes.LINE, {
      x: 6.5, y: 3.35, w: 0, h: 0.15,
      line: { color: C.border, width: 1.5 },
    });

    // Level 2: Pages + Modals
    const l2cards = [
      { title: "Home.jsx", desc: "项目列表 + 导出导入", x: 0.4, w: 2.1 },
      { title: "ProjectDetail", desc: "费用列表 + 筛选器", x: 2.65, w: 2.1 },
      { title: "Statistics.jsx", desc: "月度统计 + 类型分布", x: 4.9, w: 2.1 },
      { title: "Login.jsx", desc: "登录 / 注册表单", x: 7.15, w: 2.1 },
    ];
    l2cards.forEach((c) => {
      addCard(s, c.x, 3.6, c.w, 0.85);
      s.addText(c.title, {
        x: c.x + 0.1, y: 3.67, w: c.w - 0.2, h: 0.25,
        fontSize: 10, fontFace: "Calibri", bold: true, color: C.primaryDark, margin: 0,
      });
      s.addText(c.desc, {
        x: c.x + 0.1, y: 3.92, w: c.w - 0.2, h: 0.4,
        fontSize: 8, fontFace: "Calibri", color: C.textMuted, margin: 0,
      });
    });

    // Level 3: Modals
    addCard(s, 1.8, 4.7, 2.8, 0.5);
    s.addText("ProjectModal — 新建项目弹窗", {
      x: 1.95, y: 4.7, w: 2.5, h: 0.5,
      fontSize: 9, fontFace: "Calibri", color: C.textMuted,
      align: "center", valign: "middle", margin: 0,
    });
    addCard(s, 5.4, 4.7, 2.8, 0.5);
    s.addText("ExpenseModal — 费用编辑弹窗", {
      x: 5.55, y: 4.7, w: 2.5, h: 0.5,
      fontSize: 9, fontFace: "Calibri", color: C.textMuted,
      align: "center", valign: "middle", margin: 0,
    });
  }

  // ═══════════════════════════════════════════
  // SLIDE 7: Core Features
  // ═══════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    s.transition = makeTransition();
    addSectionTitle(s, "核心功能", "CORE FEATURES");
    addPageNum(s, 7, TOTAL);

    const features = [
      { icon: "1", title: "多用户隔离", desc: "注册自动创建命名空间，x-user-namespace 请求头实现数据隔离，每个用户的数据完全独立", color: C.primary },
      { icon: "2", title: "邀请码机制", desc: "注册需验证邀请码（VIP2026 / ADMIN2026），已使用邀请码不可复用，确保注册准入可控", color: C.accent },
      { icon: "3", title: "项目管理", desc: "创建项目 → 添加费用 → 提交锁定 → 撤销修改，完整闭环，项目状态实时追踪", color: C.success },
      { icon: "4", title: "统计面板", desc: "月度费用汇总 + 费用类型分布图，可视化了解差旅支出结构与变化趋势", color: C.warm },
      { icon: "5", title: "自定义类型", desc: "支持 SUBWAY/TAXI/HOTEL/TRAIN/BUS 五种默认类型，可自定义扩展，实时同步", color: "EC4899" },
      { icon: "6", title: "数据导入导出", desc: "一键导出命名空间全部数据为 JSON 文件，支持导入恢复到任意命名空间", color: "8B5CF6" },
    ];

    features.forEach((f, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const cx = 0.7 + col * 3.05;
      const cy = 1.4 + row * 2.0;

      addCard(s, cx, cy, 2.85, 1.8);
      // Number circle
      s.addShape(pres.shapes.OVAL, {
        x: cx + 0.15, y: cy + 0.15, w: 0.45, h: 0.45,
        fill: { color: f.color, transparency: 15 },
      });
      s.addText(f.icon, {
        x: cx + 0.15, y: cy + 0.15, w: 0.45, h: 0.45,
        fontSize: 16, fontFace: "Calibri", bold: true, color: f.color,
        align: "center", valign: "middle", margin: 0,
      });
      s.addText(f.title, {
        x: cx + 0.75, y: cy + 0.15, w: 1.9, h: 0.45,
        fontSize: 14, fontFace: "Calibri", bold: true, color: C.text,
        valign: "middle", margin: 0,
      });
      s.addText(f.desc, {
        x: cx + 0.15, y: cy + 0.75, w: 2.55, h: 0.9,
        fontSize: 10, fontFace: "Calibri", color: C.textMuted,
        valign: "top", margin: 0,
        paraSpaceAfter: 2,
      });
    });
  }

  // ═══════════════════════════════════════════
  // SLIDE 8: Data Flow
  // ═══════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    s.transition = makeTransition();
    addSectionTitle(s, "数据流程", "DATA FLOW");
    addPageNum(s, 8, TOTAL);

    // Flow: Browser → Vite → Express → Neon → Response
    const steps = [
      { title: "Browser", desc: "用户操作界面\nReact SPA", color: C.primary },
      { title: "API Proxy", desc: "Vite 开发代理\n/api → :3001", color: C.accent },
      { title: "Express", desc: "路由处理\n认证 & 校验", color: C.success },
      { title: "Neon PG", desc: "Serverless DB\n参数化查询", color: C.warm },
      { title: "Response", desc: "JSON 响应\n更新 UI", color: "EC4899" },
    ];

    steps.forEach((st, i) => {
      const cx = 0.5 + i * 1.9;
      const cy = 1.8;
      // Step circle
      s.addShape(pres.shapes.OVAL, {
        x: cx + 0.45, y: cy, w: 1.0, h: 1.0,
        fill: { color: st.color, transparency: 12 },
        shadow: softShadow(),
      });
      s.addText(st.title, {
        x: cx + 0.45, y: cy + 0.15, w: 1.0, h: 0.55,
        fontSize: 11, fontFace: "Calibri", bold: true, color: C.text,
        align: "center", valign: "middle", margin: 0,
      });
      s.addText(st.desc, {
        x: cx + 0.1, y: cy + 1.15, w: 1.7, h: 0.6,
        fontSize: 9, fontFace: "Calibri", color: C.textMuted,
        align: "center", valign: "top", margin: 0,
      });
      // Arrow
      if (i < 4) {
        s.addText("→", {
          x: cx + 1.55, y: cy + 0.15, w: 0.3, h: 0.7,
          fontSize: 18, fontFace: "Calibri", color: C.textLight,
          align: "center", valign: "middle", margin: 0,
        });
      }
    });

    // Detail section: request lifecycle
    addCard(s, 0.7, 3.5, 8.6, 1.85);
    s.addText("请求生命周期示例（添加费用）", {
      x: 0.9, y: 3.6, w: 5, h: 0.3,
      fontSize: 12, fontFace: "Calibri", bold: true, color: C.text, margin: 0,
    });

    const flowItems = [
      { step: "1", text: "用户在 ProjectDetail 页面填写费用表单，点击提交" },
      { step: "2", text: "ExpenseContext 调用 POST /api/projects/:id/expenses，携带 x-user-namespace 请求头" },
      { step: "3", text: "Express routes.js 校验：项目存在、未提交、费用类型有效、金额合理、日期格式正确" },
      { step: "4", text: "db.js addExpense() 执行参数化 INSERT，Neon PostgreSQL 返回新行" },
      { step: "5", text: "Response 201 + JSON 费用对象 → Context 更新状态 → React 重新渲染费用列表" },
    ];

    flowItems.forEach((fi, i) => {
      const fy = 4.0 + i * 0.25;
      s.addShape(pres.shapes.OVAL, {
        x: 0.95, y: fy + 0.02, w: 0.18, h: 0.18,
        fill: { color: C.primary },
      });
      s.addText(fi.step, {
        x: 0.95, y: fy + 0.02, w: 0.18, h: 0.18,
        fontSize: 8, fontFace: "Calibri", bold: true, color: C.white,
        align: "center", valign: "middle", margin: 0,
      });
      s.addText(fi.text, {
        x: 1.25, y: fy, w: 7.8, h: 0.22,
        fontSize: 9, fontFace: "Calibri", color: C.textMuted,
        valign: "middle", margin: 0,
      });
    });
  }

  // ═══════════════════════════════════════════
  // SLIDE 9: Summary
  // ═══════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.white };
    s.transition = makeTransition();

    // Decorative elements
    s.addShape(pres.shapes.OVAL, {
      x: -1.0, y: 3.5, w: 3.5, h: 3.5,
      fill: { color: C.primary, transparency: 8 },
    });
    s.addShape(pres.shapes.OVAL, {
      x: 8.5, y: -0.8, w: 2.8, h: 2.8,
      fill: { color: C.accent, transparency: 10 },
    });

    s.addText("Thank You", {
      x: 0.8, y: 1.0, w: 8.4, h: 0.6,
      fontSize: 36, fontFace: "Calibri", bold: true, color: C.text,
      align: "center", margin: 0,
    });
    s.addText("vInvoice — 简洁高效的出差费用管理", {
      x: 0.8, y: 1.65, w: 8.4, h: 0.4,
      fontSize: 15, fontFace: "Calibri", color: C.textMuted,
      align: "center", margin: 0,
    });

    s.addShape(pres.shapes.LINE, {
      x: 4.0, y: 2.2, w: 2.0, h: 0,
      line: { color: C.primary, width: 2 },
    });

    // Summary cards
    const summaries = [
      { title: "技术栈", items: "React · Express · Neon PG · Vercel" },
      { title: "多租户", items: "命名空间隔离 · 邀请码准入" },
      { title: "17 个端点", items: "RESTful API · 完整 CRUD" },
    ];
    summaries.forEach((sm, i) => {
      const sx = 1.2 + i * 2.8;
      addCard(s, sx, 2.6, 2.5, 1.4);
      s.addText(sm.title, {
        x: sx + 0.15, y: 2.7, w: 2.2, h: 0.35,
        fontSize: 13, fontFace: "Calibri", bold: true, color: C.primaryDark,
        align: "center", margin: 0,
      });
      s.addText(sm.items, {
        x: sx + 0.15, y: 3.1, w: 2.2, h: 0.7,
        fontSize: 10, fontFace: "Calibri", color: C.textMuted,
        align: "center", valign: "middle", margin: 0,
      });
    });

    s.addText("github.com/xmtlzzz/vInvoice", {
      x: 0.8, y: 4.65, w: 8.4, h: 0.35,
      fontSize: 12, fontFace: "Calibri", color: C.textLight,
      align: "center", valign: "middle", margin: 0,
    });
  }

  // ═══ Write file ═══
  const outPath = path.resolve(__dirname, "..", "vInvoice-intro.pptx");
  await pres.writeFile({ fileName: outPath });
  console.log("PPTX saved to:", outPath);
}

main().catch((e) => {
  console.error("Failed to generate PPTX:", e);
  process.exit(1);
});
