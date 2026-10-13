# 静态 HTML 网站

网页在构建时完成排版，浏览器直接读取 HTML。XSLT 仅用于本地和 Actions
构建，不发布 XSL 文件，也不要求浏览器支持 XSLT。

## 构建与预览

需要 Node.js、opam 中的 Forester 和 `xsltproc`。在项目根目录运行

```sh
node scripts/build-site.mjs
python3 -m http.server 8083 --bind 127.0.0.1 --directory build/site
```

访问 `http://localhost:8083/`。`output/` 是 Forester 的中间产物，
用于数学公式、来源及依赖检查；`build/site/` 才是预览与发布目录。
不要直接发布 `output/`，也不要将两个目录混合。

构建依次应用 `theme-overrides/`、运行 Forester、转换全部词条并检查 HTML。
`scripts/static-html.xsl` 复用现有主题，将 XHTML 节点序列化为正确的 HTML，
避免脚本和自定义元素被错误地写成自闭合标签。原有正文、分节、锚点、
目录、反向链接、相关页面、配色和字体保持不变。公式与搜索仍由现有脚本增强，
SVG 交换图直接显示。

## 地址兼容

| 地址 | 内容 |
| --- | --- |
| `/` | 完整静态首页 |
| `/003B/`、`/003B/index.html` | 完整静态词条 |
| `/003B/index.xml` | 无 XSLT 的 XHTML 兼容入口，转向 `/003B/` |
| `/math-blog/003B/`、`/math-blog/003B/index.xml` | 兼容旧仓库前缀，转向 `/003B/` |

所有词条都生成兼容入口。脚本用 `location.replace` 保留查询参数与片段标识，
不在浏览历史中增加中转页。禁用 JavaScript 时使用刷新指令，并保留可点击的
词条链接。XML 扩展名在 GitHub Pages 上仍以 XML 类型提供，因此兼容入口
使用良构 XHTML；不能将普通 HTML 直接改名为 `index.xml`。

正式词条的 canonical 地址仍为 `/编号/`。`forest.json` 的搜索记录和词条编号
不变。直接访问含锚点的地址时会展开对应的折叠章节。

## 检查与发布

`node scripts/check-static-html.mjs` 检查全部 HTML、站内链接、页内锚点、
资源、旧地址以及主题和搜索索引的一致性。原有数学内容检查继续读取中间 XML。

安装 Playwright 后可指定模块位置，运行浏览器回归测试

```sh
export PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs
# 若使用已安装的 Chrome，可同时设置 BROWSER_EXECUTABLE。
node scripts/check-reading-ui.mjs
node tests/static-html-browser.test.mjs
node tests/number-theory-render.test.mjs
```

浏览器测试禁用 XSLT，检查桌面、手机、搜索、公式、交换图、折叠目录和旧链接，
并单独检查禁用 JavaScript 时的阅读与跳转。可用 `PREVIEW_URL` 更换测试地址。
迁移前后对照可运行 `tests/static-html-parity.test.mjs`，另外设置 `BASELINE_URL`
指向中间 XML 的预览服务器。它对比 23 个代表页的正文、公式、标题、链接、
图片和章节 ID；此项需要仍然支持 XSLT 的浏览器，只用于版本对照。

GitHub Actions 从全新的检出目录构建，验证后只上传 `build/site/`，其中包含
`CNAME` 和 `.nojekyll`。发布后应再核查线上 HTML 响应和旧 XML 书签的实际跳转。
