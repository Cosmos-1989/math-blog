import fs from 'node:fs';

// Deliberately scoped, reviewed terminology links for the semantic branch.
// Never rewrite formulas, headings, or another editor's branch.
const additions={
  '0800':[['语境','0500'],['替换','0502']],
  '0801':[['依赖和','0304'],['依赖积','030A']],
  '0803':[['终对象','00I3'],['拉回','0326']],
  '0804':[['拉回','0326']],
  '0805':[['判断相等','0503']],
  '0806':[['模型范畴','0429'],['相对路径对象','042I'],['左提升性质','0420']],
  '0807':[['Frobenius 性质','042D'],['相对路径对象','042I']],
  '0808':[['预层范畴','0344']],
  '0809':[['均衡子','032C']],
  '080C':[['群胚','0312'],['提升','0420']],
  '080D':[['单价宇宙','05C6']],
  '080E':[['函数外延性','050K'],['纤维等价','058M']],
  '080F':[['神经','041G'],['单纯空间','0600'],['Kan 纤维化','0421']],
  '080G':[['左纤维化','0622']],
  '080I':[['均衡子','032C']],
  '080J':[['锥','0328']],
  '080K':[['普通 Yoneda 引理','0341']],
  '080L':[['单纯映射对象','042B']],
  '080M':[['Kan 复形','0422'],['角填充','0419'],['模型结构','0429']],
  '080N':[['切片','031J'],['神经','041G']],
  '080O':[['终对象','00I3'],['表示函子','0319'],['余纤维替换','0429']],
  '080P':[['Kan 复形','0422']],
  '080Q':[['左纤维化','0622'],['类型论模型拓扑斯','080B']],
  '080R':[['映射空间','060D'],['Yoneda 检测原理','0648']],
  '080U':[['模型结构','0429'],['单纯集合','01FX']],
  '0810':[['左伴随','064I']],
};
const file='research/riehl-integration.json';
const audit=JSON.parse(fs.readFileSync(file,'utf8'));
const base=JSON.parse(fs.readFileSync('research/riehl-semantics.json','utf8'));
for(const [id,pairs] of Object.entries(additions)) {
  const p=`trees/math/topology/synthetic/semantics/${id}.tree`;
  const text=fs.readFileSync(p,'utf8');
  const start=text.indexOf('\n\n');
  let body=text.slice(start+2);
  const deps=new Set(audit.prerequisites[id]??base.prerequisites[id]??[]);
  for(const [label,target] of pairs) {
    if(body.includes(`](${target})`)){deps.add(target);continue;}
    const i=body.indexOf(label);
    if(i<0)continue;
    if(body[i-1]==='[')throw new Error(`${id}: ${label} is already linked to another target`);
    body=body.slice(0,i)+`[${label}](${target})`+body.slice(i+label.length);
    deps.add(target);
  }
  fs.writeFileSync(p,text.slice(0,start+2)+body);
  audit.prerequisites[id]=[...deps];
}
fs.writeFileSync(file,JSON.stringify(audit,null,2)+'\n');
