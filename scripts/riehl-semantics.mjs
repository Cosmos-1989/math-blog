import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

if (!process.argv.includes('--regenerate-drafts')) {
  throw new Error('One-off import bootstrap is locked. Published trees include subsequent reviewed edits; do not regenerate them to build the site.');
}

// Retain the supplied source units while recording the editorial split explicitly.
const sourceRoot = 'research/sources/riehl-synthetic-lectures';
const out = 'trees/math/topology/synthetic/semantics';
fs.mkdirSync(out, { recursive: true });
const refs = ['RiehlICM','RiehlContext','Hatcher','Friedman','Quillen','GoerssJardine','HoTT','Rijke','AwodeyWarren','RiehlSemantics','RiehlCatHomotopy','Rezk','RiehlShulman','YonedaFormal','RiehlVerity','GratzerWeinbergerBuchholtz','CavalloRiehlSattler','LurieHTT','ShulmanUniverses'];
const refID = Object.fromEntries(refs.map((key,i)=>[key,(parseInt('0211',36)+i).toString(36).toUpperCase().padStart(4,'0')]));
const macros = {Set:'\\mathbf{Set}',Top:'\\mathbf{Top}',Cat:'\\mathbf{Cat}',sSet:'\\mathbf{sSet}',sSp:'\\mathbf{sSp}',Sp:'\\mathcal{S}',U:'\\mathcal{U}',op:'\\mathrm{op}',one:'\\mathbf{1}',zero:'\\mathbf{0}',Int:'\\mathbb{I}',N:'\\mathbb{N}',Z:'\\mathbb{Z}',R:'\\mathbb{R}'};
for (const x of ['id','Hom','Map','Nat','Fun','Ob','ev','Aut','Eq']) macros[x]=`\\operatorname{${x}}`;
for (const x of ['refl','ap','apd','tr','isContr','isProp','isSet','isEquiv','isIso','fib','happly','funext','ua','idtoequiv','idtoiso','Seg','Cov','LFib','Ext','Comp','Fin','Magma','Mon','Grp','Tors']) macros[x]=`\\mathsf{${x}}`;
function expand(s) { return s.replace(/\\([A-Za-z]+)/g,(m,k)=>macros[k]??m).replaceAll('\\!',''); }
function prose(s) {
  return expand(s).replace(/\\cite(?:\[([^\]]+)\])?\{([^}]+)\}/g,(_,where,keys)=>keys.split(',').map(k=>`[${k}${where?'，'+where:''}](${refID[k]})`).join('、'))
    .replace(/\\(?:emph|textit)\{([^{}]+)\}/g,'\\em{$1}').replace(/\\textbf\{([^{}]+)\}/g,'\\strong{$1}')
    .replace(/\$([^$]+)\$/g,'#{$1}').trim();
}
function body(s) {
  const pieces=[];
  let pos=0;
  for(const m of s.matchAll(/\\\[([\s\S]*?)\\\]/g)) {
    const before=s.slice(pos,m.index).trim();
    if(before) pieces.push(...before.split(/\n\s*\n/).map(p=>`\\p{${prose(p)}}`));
    if(m[1].includes('\\begin{tikzcd}')) pieces.push(`\\figure{\\tex{\\usepackage{amsmath,amssymb,tikz-cd}}{${expand(m[1]).trim()}}}`);
    else pieces.push(`##{${expand(m[1]).trim()}}`);
    pos=m.index+m[0].length;
  }
  const last=s.slice(pos).trim();
  if(last) pieces.push(...last.split(/\n\s*\n/).map(p=>`\\p{${prose(p)}}`));
  return pieces.join('\n');
}
const src=fs.readFileSync(`${sourceRoot}/chapters/22_semantics.tex`,'utf8');
const units=[...src.matchAll(/\\begin\{(definition|example|lemma|proposition|theorem|remark)\}(?:\[([^\]]+)\])?([\s\S]*?)\\end\{\1\}/g)].map(m=>{
  const after=src.slice(m.index+m[0].length);
  const proof=after.match(/^\s*\\begin\{proof\}([\s\S]*?)\\end\{proof\}/);
  return {type:m[1],title:m[2],body:m[3],proof:proof?.[1],start:src.slice(0,m.index).split('\n').length,end:src.slice(0,m.index+m[0].length+(proof?.[0].length??0)).split('\n').length};
});
const S=String.raw;
const specs=[
 ['0800','类型论模型的解释数据',[0],'Definition',S`本页讨论形式类型论的外部解释：\strong{语境}是变量及其类型的列表；依赖类型可随这些变量变化。`],
 ['0801','集合族模型只产生离散同一性',[1],'Example',S`在[类型论模型](0800)中，以集合上的集合族解释依赖类型。所谓纤维乘积是按参数逐纤维取所有选择的集合，不是两个映射的拉回。`],
 ['0802','内部推导与外部语义验证',[2,3],'Definition',S`给定一种形式类型论及其[模型](0800)，必须区别规则中的可构造性与规则的外部可实现性。`],
 ['0803','显示映射解释依赖类型',[4],'Definition',S`设一个[范畴](00I0)具有终对象与所需拉回。终对象指每个对象到它恰有一个态射；拉回使两条复合相等的映射对得到唯一中介。`],
 ['0804','拉回替换的复合相容性',[5],'Proposition',S`设[显示映射](0803)为 \(p:A\to\Gamma\)，且 \(f:\Delta\to\Gamma\)、\(g:\Theta\to\Delta\) 可复合。记 \(f^*A\) 为拉回总空间。`],
 ['0805','自然相容不等于严格替换',[6],'Remark',S`[拉回替换的复合](0804)给出典范同构，而[类型论模型](0800)还需解释语法中的判断相等。判断相等是计算规则直接允许的替换，不是额外构造的同构或路径。`],
 ['0806','由提升性质实现路径归纳',[7],'Proposition',S`在一个模型范畴中，平凡余纤维化指同时为余纤维化和弱等价的映射；它对所有纤维化有左提升性质。设 \(A\to\Gamma\) 是[显示映射](0803)，\(P_\Gamma A\) 是相对路径对象，\(r\) 将点送到常路径。`],
 ['0807','Frobenius 性质保证依赖语境中的路径归纳',[8,9],'Proposition',S`保留[提升形式路径归纳](0806)的记号 \(r:A\to P_\Gamma A\)。Frobenius 性质是平凡余纤维化对沿纤维化拉回的稳定性。`],
 ['0808','预层范畴作为拓扑斯的基本实例',[10,11],'Example',S`这里以[范畴](00I0)、反变[函子](00I1)及[自然变换](00I2)组成的[函子范畴](00I5)为背景。单纯集合的定义复用[单纯集合](01FX)。`],
 ['0809','层粘合的均衡子表达',[12],'Proposition',S`使用既有的[层与截面](0110)定义。两箭头 \(a,b:P\rightrightarrows Q\) 的均衡子是满足 \(a(x)=b(x)\) 的子对象；以下在集合范畴中逐元素理解。`],
 ['080A','空间值预层的下降需要高阶相容',[13],'Remark',S`对[层粘合](0809)作同伦推广时，取值不再是集合而是空间。下降要求局部数据及各阶交叠上的相容同伦共同给出全局数据。`],
 ['080B','高阶拓扑斯的反射局部化描述',[14,15],'Definition',S`设 \(\mathcal C\) 是小高阶范畴，考虑空间值预层。有限同伦极限是以映射空间而非映射集合刻画普遍性质的有限极限。下面的定义说明外部模型的范围，不作为内部路径演算的额外前提。`],
 ['080C','纤维化的指定结构与替换',[16,17],'Definition',S`在[依赖类型的显示映射解释](0803)中，一个映射的提升\em{存在}与选择相容的提升\em{数据}是不同要求。群胚是所有态射都可逆的[范畴](00I0)。`],
 ['080D','高阶拓扑斯具有严格单价宇宙',[18,19],'Theorem',S`本页记录外部语义存在定理，不给出其一般模型论证明。适用对象为[高阶拓扑斯](080B)，结论是具有严格替换相容性的[类型论模型](0800)，不是任意裸纤维化族已经具有该结构。`],
 ['080E','分类映射的路径对应纤维等价',[20],'Proposition',S`设一个[严格单价普遍族](080D)为 \(\widetilde{\mathcal U}\to\mathcal U\)，两条分类映射 \(a,b:\Gamma\to\mathcal U\) 分别拉回得到族 \(A,B\to\Gamma\)。纤维等价指每个参数处的等价，并随参数相容。`],
 ['080F','二部关系给出 Reedy 族而不必给出函数',[21],'Example',S`设 \(A,B,R\) 为集合，\(s:R\to A\)、\(t:R\to B\) 为函数。把普通[范畴](00I0)的神经看作逐层离散的单纯空间；离散单纯集合之间任意映射都是 Kan 纤维化，故相应匹配映射也如此。`],
 ['080G','二部关系的左纤维化条件等价于唯一提升',[22,23],'Proposition',S`取[二部关系范畴](080F) \(E_R\to[1]\)，其中源映射为 \(s:R\to A\)，靶映射为 \(t:R\to B\)。左纤维化要求给定底箭头和其源上的点时，提升空间可缩；离散空间可缩即恰有一个元素。`],
 ['080H','集合权的带权极限',[24],'Definition',S`使用[范畴](00I0)、[函子](00I1)与[自然变换](00I2)。集合指数 \(Y^S\) 指由集合 \(S\) 索引的 \(Y\) 的乘积，即 \(\operatorname{Hom}(X,Y^S)\cong\operatorname{Set}(S,\operatorname{Hom}(X,Y))\)。`],
 ['080I','带权极限的均衡子公式',[25],'Proposition',S`令 \(W:\mathcal C\to\mathbf{Set}\)、\(F:\mathcal C\to\mathcal V\) 满足[带权极限](080H)的大小及存在条件。两条态射的均衡子是使它们相等的普遍子对象。`],
 ['080J','常值单位权恢复普通极限',[],'Example',S`在[带权极限](080H)中取 \(W(c)=1\)，每个分量 \(1\to\operatorname{Hom}(X,F(c))\) 选择一条 \(X\to F(c)\)。自然性恰好是锥的相容条件。因此 \(\{1,F\}\cong\lim F\)。`],
 ['080K','可表权的带权极限就是求值',[],'Example',S`设 \(\mathcal C\) 小，\(c_0\in\mathcal C\)，\(W=\operatorname{Hom}_{\mathcal C}(c_0,-)\)。由普通 Yoneda 引理，\(\operatorname{Nat}(W,\operatorname{Hom}(X,F(-)))\cong\operatorname{Hom}(X,F(c_0))\)。结合[带权极限](080H)的刻画，对每个 \(X\) 自然得到 \(\{W,F\}\cong F(c_0)\)。`],
 ['080L','单纯权与同伦带权极限',[27],'Definition',S`将[集合权的带权极限](080H)富集到[单纯集合](01FX)：态射集合改为单纯映射对象，幂改为相应余张量。选择余纤维权和纤维图表是同伦不变性的条件，而不是无条件地对普通极限改名。`],
 ['080M','余纤维权到纤维图表的映射对象是 Kan 复形',[28,29],'Proposition',S`设 \(\mathcal C\) 是普通小范畴，图表范畴 \(\mathbf{sSet}^{\mathcal C}\) 带项目模型结构。其弱等价和纤维化逐对象检测，余纤维化由左提升性质决定。\(\operatorname{Nat}(W,F)\) 表示[单纯权](080L)与图表间的富集自然变换对象。`],
 ['080N','切片范畴的神经组成协变权',[30],'Construction',S`设 \(\mathcal C\) 为普通小[范畴](00I0)。切片 \(\mathcal C/c\) 的对象是箭头 \(x\to c\)，态射是与到 \(c\) 的箭头相容的三角形。\(N\) 表示由可复合箭头链组成的神经。`],
 ['080O','切片神经是单位权的项目余纤维替换',[31],'Proposition',S`对[切片神经权](080N) \(W(c)=N(\mathcal C/c)\)，在[项目模型结构](080M)中考虑唯一映射 \(W\to1\)。余纤维替换指源余纤维、且该映射为弱等价。`],
 ['080P','单箭头图表的同伦极限等价于源',[32],'Example',S`将[切片神经权](080N)用于 \(\mathcal C=[1]\)，并令 \(F(0)=A,F(1)=B,F(0\to1)=f\)，其中 \(A,B\) 为 Kan 复形。以下带权极限为 \(\{W,F\}\)。`],
 ['080Q','参数化左纤维化与函子图表的语义比较',[33,34],'Theorem',S`以下为引用的外部语义定理，不是仅靠普通 Yoneda 引理即可推出的结论。它在[类型论模型](0800)中比较左纤维化；左纤维化要求每个给定源的底箭头具有可缩的提升空间。`],
 ['080R','对所有参数自然的族比较给出分类对象等价',[35,36],'Proposition',S`设两个空间或高阶范畴中的对象 \(X,Y\) 分类两种参数化族。假设对\em{每个}测试语境 \(\Gamma\)，两种族之间有自然等价；这里 \(\operatorname{Map}(\Gamma,X)\) 是映射空间，\(\simeq\) 为同伦等价。`],
 ['080S','合成高阶结构的证明依赖路线',[37,38,40],'Outline',S`以下区分内部推导与外部语义输入，按照[内部推导和模型验证](0802)的分工组织证明。`],
 ['080T','合成高阶结构与报告结果的对照',[39],'Outline',S`本页是[原报告](0211)与[系统讲义](0210)的结果索引，而非另一个数学定理。`],
];
const audit={reviews:{},prerequisites:{},sourceCoverage:[],labels:{},concepts:{},corrections:[],deferred:[],existingAugmentations:[]};
function foresterInline(s) { return s.replace(/\\\(([\s\S]*?)\\\)/g,'#{$1}'); }
function write(id,title,taxon,content,source='第22章') {
  fs.writeFileSync(`${out}/${id}.tree`,`\\title{${title}}\n\\date{2026-09-25}\n\\taxon{${taxon}}\n\\author{author}\n\\meta{source}{[从同伦类型到合成高阶范畴](0210)，${source}}\n\n${content}\n`);
  audit.reviews[id]={title,action:'integrate',reason:'按独立问题拆分；保留源陈述、证明及引用层次，补足局部假设。',scope:'用户系统讲义第22章：语义解释、带权极限、外部存在输入'};
}
for(const [id,title,indices,taxon,preface] of specs) {
  let text=`\\p{${foresterInline(preface)}}\n`;
  for(const i of indices) {
    const u=units[i]; text+=body(u.body)+'\n';
    if(u.proof) text+=`\\subtree{\\taxon{Proof}\n${body(u.proof)}\n}\n`;
    audit.sourceCoverage.push({file:'22_semantics.tex',sourceLines:[u.start,u.end],unit:i,ids:[id]});
  }
  write(id,title,taxon,text);
  audit.concepts[title]=id;
  if(taxon!=='Outline') audit.prerequisites[id]=[...new Set([...text.matchAll(/\]\((0[0-9A-Z]{3})\)/g)].map(m=>m[1]).filter(x=>!x.startsWith('021')))];
}
audit.sourceCoverage.push({file:'22_semantics.tex',sourceLines:[units[26].start,units[26].end],unit:26,ids:['080J','080K'],notes:'普通极限与可表权求值拆为两个独立例子，并补出论证。'});
audit.corrections.push({id:'0801',detail:'依赖积的纤维乘积明确为按参数的选择集合，避免与拉回混淆。'});
const sections=[['形式解释与替换',0,8],['层、宇宙与模型边界',8,17],['带权极限与语义比较',17,30],['证明路线与来源对照',30,specs.length]];
write('020M','语义基础与模型中的实现','Outline','\\p{内部推导的可用规则需要外部模型支撑；本页组织两者的接口，而不把外部模型存在定理冒充为内部证明。}\n'+sections.map(([t,a,b])=>`\\strong{${t}}\n\\ul{\n${specs.slice(a,b).map(([id,title])=>`\\li{[${title}](${id})}`).join('\n')}\n}`).join('\n'));
fs.writeFileSync('research/riehl-semantics.json',JSON.stringify(audit,null,2)+'\n');

const bib=fs.readFileSync(`${sourceRoot}/references.tex`,'utf8');
const refTitles=['Synthetic Perspectives on Spaces and Categories','Category Theory in Context','Algebraic Topology','An elementary illustrated introduction to simplicial sets','Homotopical Algebra','Simplicial Homotopy Theory','Homotopy Type Theory: Univalent Foundations of Mathematics','Introduction to Homotopy Type Theory','Homotopy theoretic models of identity types','On the ∞-topos semantics of homotopy type theory','Categorical Homotopy Theory','A model for the homotopy theory of homotopy theory','A type theory for synthetic ∞-categories','Formalizing the ∞-Categorical Yoneda Lemma','Elements of ∞-Category Theory','Directed univalence in simplicial homotopy type theory','Directed univalence for simplicial objects in an ∞-topos','Higher Topos Theory','All (∞,1)-toposes have strict univalent universes'];
for(const m of bib.matchAll(/\\bibitem\{([^}]+)\}([\s\S]*?)(?=\\bibitem|\\end\{thebibliography\})/g)) {
  const key=m[1], id=refID[key];
  const text=m[2].trim().replace(/\\url\{([^}]+)\}/g,'[原文]($1)').replaceAll('~',' ').replaceAll('Birkh\\"auser','Birkhäuser');
  write(id,refTitles[refs.indexOf(key)],'Reference',`\\p{${prose(text)}}`,'参考文献');
}
write('0210','从同伦类型到合成高阶范畴：系统讲义来源','Reference',S`\p{题名：\em{从同伦类型到合成高阶范畴}；副题：\em{空间、路径归纳、Yoneda 引理与有向单价性}。这是博客作者提供的系统讲义，共22章、2篇附录，围绕 Emily Riehl 的[报告与论文](0211)展开；讲义作者与被讨论报告的作者应予区分。}
\p{编辑后的知识条目从[专题入口](0200)进入。原始多文件源与单文件版本完整保存在项目的研究档案中；单文件版本是同一内容的汇编，不作为第二份独立来源。数学结论的内部证明、证明纲要和引用的模型存在定理分别标明。}
\p{所用文献：`+refs.map(k=>`[${k}](${refID[k]})`).join('；')+'。}');
// Re-write after bibliography entries so every generated record is represented.
fs.writeFileSync('research/riehl-semantics.json',JSON.stringify(audit,null,2)+'\n');
const files=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())walk(f);else files.push({file:path.relative(sourceRoot,f),bytes:fs.statSync(f).size,sha256:crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')});}}
walk(sourceRoot);
fs.writeFileSync('research/riehl-source-manifest.json',JSON.stringify({title:'从同伦类型到合成高阶范畴',kind:'user-authored-systematic-lectures',reportTitle:'Synthetic Perspectives on Higher Structures',proceedingsTitle:'Synthetic Perspectives on Spaces and Categories',originalDirectory:'/Users/sunzy/Downloads/riehl_synthetic_lectures_source',importDate:'2026-09-25',entry:'0200',sourceRecord:'0210',duplicateCompilation:'standalone.tex',files},null,2)+'\n');
