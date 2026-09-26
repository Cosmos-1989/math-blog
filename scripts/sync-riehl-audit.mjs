import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const audit=read('research/site-evergreen-audit.json');
const groups=['foundations','homotopy','types','categories','directed','calculations','semantics','integration'];
// These unpublished draft IDs were deduplicated before the first publication.
for(const id of ['0300','0301','041F','063I']) {
  delete audit.reviews[id];
  delete audit.prerequisites[id];
}
for(const group of groups) {
  const record=read(`research/riehl-${group}.json`);
  for(const id of Object.keys(record.reviews??{})) {
    if(/^0[2-9][0-9A-Z]{2}$/.test(id)&&!Object.hasOwn(record.prerequisites??{},id)) delete audit.prerequisites[id];
  }
  Object.assign(audit.reviews,record.reviews);
  Object.assign(audit.prerequisites,record.prerequisites);
  if(record.splits)Object.assign(audit.splits,record.splits);
  if(record.terminology_targets)Object.assign(audit.terminology_targets,record.terminology_targets);
}
for(const [id,title] of [['0200','空间与高阶范畴的合成视角'],['020P','合成高阶结构的完整学习路线'],['0066','拓扑'],['001F','范畴论入口']]) {
  audit.reviews[id]={...(audit.reviews[id]??{}),title,action:'integrate-navigation',reason:'专题直接进入研究主题，完整基础路线与前置原子分开；不重复定义。',scope:'2026-09-25 合成高阶结构讲义导航整合'};
}
audit.date='2026-09-25';
audit.riehl_integration={sourceManifest:'research/riehl-source-manifest.json',reviewGroups:groups.map(g=>`research/riehl-${g}.json`),entry:'0200',scope:'源讲义逐单元映射与分组编辑复核；外部语义定理保留引用，不宣称提供其全部一般证明。'};
fs.writeFileSync(path.join(root,'research/site-evergreen-audit.json'),JSON.stringify(audit,null,2)+'\n');
console.log('Merged lecture review records without replacing previous discipline scopes.');
await import('./sync-note-polish.mjs');
