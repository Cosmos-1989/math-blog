# 网站域名

正式地址为 `https://opetope.cc/`，GitHub 仓库仍为
`Cosmos-1989/math-blog`。站名、作者和词条编号不变。

## 发布配置

- `forest.toml` 定义正式地址。Forester 在 `output/` 根目录生成网站，
  词条路径为 `/009E/` 等，不再带 `/math-blog/` 前缀。
- GitHub 仓库的 Settings > Pages > Custom domain 设为 `opetope.cc`。
  本站通过 Actions 发布，仅提交 `CNAME` 文件不会修改 GitHub 的域名绑定。
- `.github/workflows/deploy.yml` 发布 `output/` 的内容，并生成首页跳转文件。
- `scripts/site-config.mjs` 从正式地址推导检查脚本使用的生成目录和预览路径。
- `node scripts/check-site-domain.mjs` 检查所有页面的正式地址、站内路径和搜索索引。

## GoDaddy 解析

根域名使用以下四条 A 记录，替换 GoDaddy 默认的停放记录。

| 类型 | 名称 | 值 |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | cosmos-1989.github.io |

保留现有的 NS、SOA、邮件及所有权验证记录。不要添加通配符解析。
`www` 的 CNAME 不含仓库路径；GitHub Pages 将其重定向到根域名。

DNS 生效、GitHub 完成证书签发后，在 Pages 设置中启用 Enforce HTTPS。
域名所有权还可在 GitHub 个人设置的 Pages 页面通过 TXT 记录验证。

## 本地预览

```sh
node scripts/apply-theme.mjs
forester build forest.toml
node scripts/check-site-domain.mjs
node scripts/check-reading-ui.mjs
python3 -m http.server 8083 --bind 127.0.0.1 --directory output
```

访问 `http://localhost:8083/index/`。旧构建目录不会影响新路径的本地预览；
正式发布由 GitHub Actions 的全新工作目录生成，避免混入本地历史产物。

配置依据为 [GitHub Pages 自定义域名文档](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)。
