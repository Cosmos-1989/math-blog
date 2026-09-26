import fs from 'node:fs';
import path from 'node:path';

const root = '/Users/sunzy/claude_test/forester2';
const source = '/Users/sunzy/Downloads/riehl_synthetic_lectures_source';
const chapters = ['09_types','10_paths','11_equivalences','12_univalence','13_classifying','14_groups'];
const blocks = ['0500','0540','0580','05C0','05G0','05K0'];
const data = chapters.map((name, i) => {
  const tex = fs.readFileSync(path.join(source, 'chapters', name + '.tex'), 'utf8');
  const units = [];
  const re = /\\begin\{(definition|example|lemma|proposition|theorem|remark|proof)\}(?:\[([^\]]*)\])?([\s\S]*?)\\end\{\1\}/g;
  for (const match of tex.matchAll(re)) {
    const unit = {kind:match[1], title:match[2] || '', body:match[3].trim(), start:tex.slice(0,match.index).split('\n').length, end:tex.slice(0,match.index+match[0].length).split('\n').length};
    if (['proof','remark'].includes(unit.kind)) units.at(-1).parts.push(unit);
    else units.push({id:(parseInt(blocks[i],36)+units.length).toString(36).toUpperCase().padStart(4,'0'),parts:[unit]});
  }
  return {name, number:i+9, outline:'020'+(i+9).toString(36).toUpperCase(), title:tex.match(/\\chapter\{([^}]*)\}/)[1],tex,units};
});

if (process.argv.includes('--inventory')) {
  for (const ch of data) for (const u of ch.units) console.log(u.id, ch.name, u.parts[0].kind, u.parts[0].title, '['+u.parts[0].start+'-'+u.parts.at(-1).end+']',u.parts[0].body.replace(/\s+/g,' ').slice(0,90));
}

const references = {RiehlICM:'0211',RiehlContext:'0212',Hatcher:'0213',Friedman:'0214',Quillen:'0215',GoerssJardine:'0216',HoTT:'0217',Rijke:'0218',AwodeyWarren:'0219',RiehlSemantics:'021A',RiehlCatHomotopy:'021B',Rezk:'021C',RiehlShulman:'021D',YonedaFormal:'021E',RiehlVerity:'021F',GratzerWeinbergerBuchholtz:'021G',CavalloRiehlSattler:'021H',LurieHTT:'021I',ShulmanUniverses:'021J'};
const all = Object.fromEntries(data.flatMap(ch=>ch.units.map(u=>[u.id,u])));
const specs = {};
function spec(id,title,deps,context='',note='') { specs[id]={title,deps:deps.split(' ').filter(Boolean),context,note}; }
// These contexts and prerequisite edges are editorial decisions, not inferred from word matching.
spec(String.raw`0500`,String.raw`依赖类型的语境与判断`,String.raw``,String.raw`这里的类型是同伦类型论的语法对象，并非模型论中公式组成的类型。变量声明 $x:A$ 表示项属于类型；语境中后面的类型只能依赖前面声明的变量。`);
spec(String.raw`0501`,String.raw`语境中变化的维数与自反路径类型`,String.raw`0500 050D 050G 05C0`,String.raw`以下两个判断展示类型对参数的依赖；$\mathbb R^n$ 指通常的实数坐标空间。`);
spec(String.raw`0502`,String.raw`依赖类型的代入规则`,String.raw`0500`,String.raw`设 $\Gamma$ 是语境，$A$ 是其中的类型。此处的代入首先是语法操作；不同纤维之间的路径传输不是无条件的类型转换。`);
spec(String.raw`0503`,String.raw`定义相等与路径相等的区别`,String.raw`0500`,String.raw`设 $A$ 是类型，$a,b:A$ 是项。`);
spec(String.raw`0504`,String.raw`函数计算不等于路径结合律的定义化简`,String.raw`0503 0505 0542`,String.raw`设 $a:A$，$t$ 是依赖于 $x:A$ 的项；$t[a/x]$ 表示以 $a$ 替换 $x$。`);
spec(String.raw`0505`,String.raw`依赖积的引入、消去与计算规则`,String.raw`0500 0502 0503`);
spec(String.raw`0506`,String.raw`依赖柯里化`,String.raw`0505 0507 050K`,String.raw`设 $A$ 是类型，$B$ 是 $A$ 上的类型族，$C(x,y)$ 是在 $x:A,y:B(x)$ 语境中的类型族。此处互逆指带两侧同伦的互逆函数。`);
spec(String.raw`0507`,String.raw`依赖和的引入、投影与消去规则`,String.raw`0500 0502 0503`,String.raw`依赖和的元素把参数与对应纤维中的元素一起保存；常值族的依赖和记为积 $A\times B$。`);
spec(String.raw`0508`,String.raw`依赖和编码结构的对象`,String.raw`0507 05C0`);
spec(String.raw`0509`,String.raw`依赖和的映出泛性质`,String.raw`0505 0507 050K`,String.raw`设 $A$ 是类型，$B(x)$ 是其上的类型族，$C$ 是固定类型；$z$ 表示总空间中的元素。这里的等价由下述两个函数及两侧逆同伦给出。`);
spec(String.raw`050A`,String.raw`依赖选择公式保留显式见证`,String.raw`0505 0507 050K`,String.raw`设 $A$ 是类型，$B(x)$ 是类型族，$C(x,y)$ 是在 $x:A,y:B(x)$ 语境中的类型族。等价在此以两侧逆同伦表达。`);
spec(String.raw`050B`,String.raw`空类型及其消去规则`,String.raw`0500`);
spec(String.raw`050C`,String.raw`否定类型是到空类型的函数`,String.raw`050B 0505`,String.raw`设 $A$ 是类型；否定记录一个构造，而不是额外选取一个布尔真值。`);
spec(String.raw`050D`,String.raw`自然数类型的依赖归纳规则`,String.raw`0505`,String.raw`记 $\mathcal U$ 为容纳所讨论类型的宇宙；$P(n)$ 是随自然数变化的类型。`);
spec(String.raw`050E`,String.raw`自然数加法的递归方向`,String.raw`050D 0503`,String.raw`取 $m,n:\mathbb N$。`);
spec(String.raw`050F`,String.raw`递归加法的左单位需要归纳`,String.raw`050E 050G 0544`,String.raw`这里加法对右变量递归，$n:\mathbb N$。`);
spec(String.raw`050G`,String.raw`同一性类型及路径归纳`,String.raw`0500 0503 0505`,String.raw`设 $A$ 是类型；$\mathcal U$ 表示容纳动机 $P$ 的宇宙。等式 $x=y$ 是类型，其元素称路径，不是定义相等判断。`);
spec(String.raw`050H`,String.raw`固定起点的路径归纳`,String.raw`050G`);
spec(String.raw`050I`,String.raw`两种路径归纳规则的转换`,String.raw`050G 050H`,String.raw`比较全变量 $J$ 规则与固定起点 $J_a$ 规则；动机允许附加依赖参数。`);
spec(String.raw`050J`,String.raw`依赖函数的逐点同伦`,String.raw`0505 050G`,String.raw`设 $A$ 是类型，$B(x)$ 是其上的类型族。`);
spec(String.raw`050K`,String.raw`函数外延性是路径层面的原则`,String.raw`050J`,String.raw`设 $f,g:\prod_{x:A}B(x)$。函数外延性断言 $\mathsf{happly}$ 具有逆及两侧逆同伦；不是把逐点相等提升为定义相等。`);
spec(String.raw`050L`,String.raw`依赖函数的命题 eta 规则`,String.raw`050K 0503`,String.raw`设 $A$ 是类型，$B(x)$ 是类型族。`);
spec(String.raw`050M`,String.raw`逐纤维拟逆诱导依赖积的拟逆`,String.raw`050K 050J`,String.raw`设 $B,C$ 是同一类型 $A$ 上的类型族，$x:A$。`);
spec(String.raw`050N`,String.raw`依赖类型规则的纤维化解释`,String.raw`0502 0505 0507 050G 00I0`,String.raw`此为依赖类型规则的语义说明，不是严格模型存在性的独立证明。纤维化是所选同伦模型中的展示映射，截面是投影 $p:E\to\Gamma$ 的右逆 $s$，满足 $ps=\operatorname{id}_\Gamma$；拉回是沿底映射换底。`,String.raw`依赖外部纤维化语义、相对路径分解、Beck--Chevalley 换底及严格化；证明范围是解释而非模型存在性。`);

spec(String.raw`0540`,String.raw`路径的反向`,String.raw`050G`,String.raw`设 $A$ 是类型，$x,y:A$。`);
spec(String.raw`0541`,String.raw`路径连接及右单位计算`,String.raw`050H`,String.raw`设 $x,y,z:A$；$p\cdot q$ 的顺序是先行 $p$，再行 $q$。`);
spec(String.raw`0542`,String.raw`路径连接的群胚律`,String.raw`0540 0541`,String.raw`设 $p:x=y,q:y=z,r:z=w$ 是类型 $A$ 中依次可连接的路径。下列等式是路径之间的高阶路径。`);
spec(String.raw`0543`,String.raw`路径连接的左右消去`,String.raw`0542 0544`,String.raw`设所有路径位于同一类型 $A$，每个连接的端点匹配；比较的 $q,r$ 有相同的起点和终点。`);
spec(String.raw`0544`,String.raw`函数对路径的作用`,String.raw`050G`,String.raw`设 $A,B$ 是类型，$x,y:A$。`);
spec(String.raw`0545`,String.raw`函数路径作用保持单位、逆与连接`,String.raw`0544 0542 050K`,String.raw`设 $f:A\to B,g:B\to C$，$p:x=y,q:y=z$ 是 $A$ 中路径；$\operatorname{id}$ 为恒等函数。`);
spec(String.raw`0546`,String.raw`逐点同伦的自然性方块`,String.raw`050J 0542 0544`,String.raw`设 $f,g:A\to B$，$x,y:A$。`);
spec(String.raw`0547`,String.raw`恒等函数的自同伦受共轭相容性约束`,String.raw`0546`,String.raw`设 $H:\prod_{x:A}(x=x)$ 是恒等函数的自同伦，$p:x=y$。`);
spec(String.raw`0548`,String.raw`类型族沿路径的传输`,String.raw`050G 0505`,String.raw`设 $A$ 是类型，$\mathcal U$ 表示类型宇宙，$x,y:A$。`);
spec(String.raw`0549`,String.raw`传输保持连接并沿逆路径可逆`,String.raw`0548 0542 050K`,String.raw`设 $B:A\to\mathcal U$，$p:x=y,q:y=z$。复合传输的顺序与先后连接的顺序相反地书写。`);
spec(String.raw`054A`,String.raw`截面的依赖路径作用`,String.raw`0548`,String.raw`设 $B:A\to\mathcal U$，$x,y:A$，$p:x=y$。截面指依赖函数。`);
spec(String.raw`054B`,String.raw`拉回类型族的传输公式`,String.raw`0548 0544 050K`,String.raw`设 $x,y:A$，$p:x=y$；族的拉回在内部即复合 $D\circ f$。`);
spec(String.raw`054C`,String.raw`一个端点变化时的路径族传输`,String.raw`0548 0542`,String.raw`设 $x,y:A$。`);
spec(String.raw`054D`,String.raw`两个端点同时变化时的路径族传输`,String.raw`0548 0545 0542`,String.raw`设 $A,B$ 是类型，$x,y:A$。`);
spec(String.raw`054E`,String.raw`环路族的传输是共轭`,String.raw`054D`,String.raw`设 $A$ 是类型，$\Omega_xA=(x=_Ax)$；$q:x=x$ 是环路。`);
spec(String.raw`054F`,String.raw`函数类型族的共轭传输`,String.raw`0548 0549 050K`,String.raw`设 $x,y:A$；复合函数从右向左作用。`);
spec(String.raw`054G`,String.raw`积类型中的路径由分量路径决定`,String.raw`0507 050G 0544`,String.raw`设 $A,B$ 是类型；此处等价用互逆映射及两侧同伦给出。`);
spec(String.raw`054H`,String.raw`依赖和中的路径与传输比较`,String.raw`0507 050G 0548`,String.raw`设 $A$ 是类型；此处等价先构造互逆映射及两侧同伦，不以等价性质的证明无关性为前提。`);
spec(String.raw`054I`,String.raw`同伦纤维中两点之间的路径`,String.raw`058E 054H 054D`,String.raw`固定 $f:A\to B$ 与 $b:B$。`);
spec(String.raw`054J`,String.raw`固定起点的路径总空间可缩`,String.raw`050H 0507 0580`,String.raw`设 $A$ 是类型。可缩是指有中心及从中心到每个点的依赖路径。`);
spec(String.raw`054K`,String.raw`二阶路径的横向与竖向复合`,String.raw`0541 0544 054G`,String.raw`设 $x,y,z:A$；二阶路径是同一性类型中的路径。横向复合的两个输入均为边界匹配的二阶路径。`);
spec(String.raw`054L`,String.raw`二阶路径的互换律`,String.raw`054K 0545`,String.raw`取 $p,q,r:x=y$ 与 $p^\prime,q^\prime,r^\prime:y=z$，以及 $\alpha:p=q,\beta:q=r,\gamma:p^\prime=q^\prime,\delta:q^\prime=r^\prime$。写 $\circ_h$ 为横向复合，$\circ_v$ 为按先后顺序的竖向复合。`);
spec(String.raw`054M`,String.raw`二重环路的 Eckmann--Hilton 交换性`,String.raw`054K 054L 0542`,String.raw`设 $A$ 是类型，$a:A$。这里先在类型内构造交换同伦，再在连通分支集合上得到普通交换群；集合版互换引理见 [Eckmann--Hilton 引理](00IG)。`);
spec(String.raw`054N`,String.raw`路径结合子的五边形相容`,String.raw`0542 054K`,String.raw`设 $p:x=y,q:y=z,r:z=w,s:w=v$ 为 $A$ 中可连接路径，结合子取路径归纳构造的标准选择。`);

spec(String.raw`0580`,String.raw`可缩类型与收缩数据`,String.raw`0505 0507 050G`,String.raw`设 $A$ 是类型。`);
spec(String.raw`0581`,String.raw`单位、空类型与路径总空间的可缩性`,String.raw`0580 05Z0 050B 054J`,String.raw`以下例子比较总空间与纤维；$A$ 为类型，$a:A$。`);
spec(String.raw`0582`,String.raw`可缩类型的所有路径类型可缩`,String.raw`0580 0546 0542`,String.raw`设 $A$ 是类型。`);
spec(String.raw`0583`,String.raw`可缩纤维的依赖积可缩`,String.raw`0580 050K`,String.raw`设 $A$ 是类型，$B:A\to\mathcal U$ 是类型族。可缩性数据逐点给出，而非只给截断的存在。`);
spec(String.raw`0584`,String.raw`可缩底上可缩纤维的总空间可缩`,String.raw`0580 054H`,String.raw`设 $B:A\to\mathcal U$ 是类型族。`);
spec(String.raw`0585`,String.raw`同伦类型论中的命题`,String.raw`0505 050G`,String.raw`设 $A$ 是类型；命题在这里是路径层次的性质，不是模型论的类型或仅指一个句法公式。`);
spec(String.raw`0586`,String.raw`有点命题与可缩类型`,String.raw`0585 0580 0542`,String.raw`设 $A$ 是类型；“有元素”要求给出具体项 $a:A$。`);
spec(String.raw`0587`,String.raw`命题对依赖积与命题底依赖和封闭`,String.raw`0585 050K 054H`,String.raw`设 $B:A\to\mathcal U$ 是类型族。`);
spec(String.raw`0588`,String.raw`命题性、可缩性与集合性的证明无关性`,String.raw`0585 05Z2 0580 0582 0587`,String.raw`设 $A$ 是类型；比较的是同一性质的不同证明项。`);
spec(String.raw`0589`,String.raw`同一性类型的截断层次`,String.raw`0580 0585 05Z2 0582`,String.raw`截断阶数从整数 $-2$ 起递归；这里的截断性是性质，不是截断构造。`);
spec(String.raw`058A`,String.raw`普通群胚给出一截断同伦类型`,String.raw`0589 00I0`,String.raw`普通群胚是所有态射可逆的范畴。这里“对应的同伦类型”使用群胚的神经及其同伦解释，作为语义背景，不是本页给出的构造证明。`,String.raw`群胚同伦语义为外部背景；不声称已在本页证明神经的全部模型性质。`);
spec(String.raw`058B`,String.raw`命题截断的泛性质与依赖消去`,String.raw`0585 0505`,String.raw`设 $A$ 是类型；$\|A\|$ 只保留命题层面的可居留性。本页把命题截断及其消去作为基础规则。`);
spec(String.raw`058C`,String.raw`命题截断表达存在与析取`,String.raw`058B 0507 05Z1`,String.raw`设 $A$ 是类型，$B(x)$ 是依赖族；在析取公式中 $A,B$ 改为两个固定类型。`);
spec(String.raw`058D`,String.raw`命题的命题截断不改变其类型`,String.raw`058B 0585`,String.raw`设 $P$ 是命题，等价通过构造拟逆及两侧同伦证明。`);
spec(String.raw`058E`,String.raw`函数的同伦纤维`,String.raw`0507 050G`,String.raw`设 $A,B$ 是类型，$b:B$。纤维不仅记录原像，还保留原像到目标的比较路径。`);
spec(String.raw`058F`,String.raw`一个函数的等价性是命题`,String.raw`05Z3 0588 0587`,String.raw`设 $f:A\to B$。`);
spec(String.raw`058G`,String.raw`可缩同伦纤维给出拟逆`,String.raw`05Z3 050J 0544`,String.raw`设 $f:A\to B$；$gf$ 与 $fg$ 分别表示 $g\circ f$ 与 $f\circ g$。`);
spec(String.raw`058H`,String.raw`拟逆的余单位可修正为三角相容`,String.raw`050J 0546 0543 0545`,String.raw`写 $gf=g\circ f$、$fg=f\circ g$，路径连接采用先左后右的约定。`);
spec(String.raw`058I`,String.raw`等价的拟逆判据`,String.raw`05Z3 058G 058H 054H 054D`,String.raw`设 $f:A\to B$；“拟逆”是函数 $g:B\to A$ 连同 $gf\sim\operatorname{id}_A$、$fg\sim\operatorname{id}_B$。`);
spec(String.raw`058J`,String.raw`等价对逆、复合及二取三封闭`,String.raw`058I 0545`,String.raw`设 $A,B,C$ 是类型，所有逆均指带两侧同伦的拟逆。`);
spec(String.raw`058K`,String.raw`等价在路径类型上仍是等价`,String.raw`058I 058H 0545 0546`,String.raw`设 $x,y:A$；$g$ 是 $f$ 的拟逆。`);
spec(String.raw`058L`,String.raw`等价保持截断层次`,String.raw`058K 0589 058I`,String.raw`设 $A,B$ 是类型。`);
spec(String.raw`058M`,String.raw`同底总空间映射的逐纤维等价判据`,String.raw`05Z3 054H 058L`,String.raw`设 $B,C:A\to\mathcal U$ 是同一底类型上的类型族。`);
spec(String.raw`058N`,String.raw`命题子类型的路径由底路径决定`,String.raw`0585 0586 0582 054H 05Z3`,String.raw`设 $A$ 是类型。命题子类型指以命题族为纤维的依赖和。`);

spec(String.raw`05C0`,String.raw`类型宇宙与解码`,String.raw`0500`,String.raw`宇宙是类型的代码空间；本页不预设单价性，也不假定宇宙包含自己。`);
spec(String.raw`05C1`,String.raw`宇宙对类型构造的封闭性`,String.raw`05C0 0505 0507 050G 05Z1 050D 058B`);
spec(String.raw`05C2`,String.raw`宇宙的普遍解码族`,String.raw`05C0 0507 050G`,String.raw`设 $\Gamma$ 是类型。此处同伦拉回是带比较路径的拉回，其元素将于下文逐项写出。`);
spec(String.raw`05C3`,String.raw`宇宙路径诱导类型等价`,String.raw`05C0 0548 05Z3 05Z4 05Z5`);
spec(String.raw`05C4`,String.raw`同一性到等价的比较保持连接与逆`,String.raw`05C3 0549 058F 050K`,String.raw`设 $A,B,C:\mathcal U$；等价的复合按底层函数复合定义。`);
spec(String.raw`05C5`,String.raw`类型构造沿宇宙路径的传输`,String.raw`05C0 0548 054F 05C3`,String.raw`设 $A,B:\mathcal U$。传输不要求宇宙单价。`);
spec(String.raw`05C6`,String.raw`单价宇宙`,String.raw`05C3 05Z4`);
spec(String.raw`05C7`,String.raw`单价性的计算是路径等式`,String.raw`05C6 0544`,String.raw`设 $A,B:\mathcal U$，其中 $\mathcal U$ 为单价宇宙。`);
spec(String.raw`05C8`,String.raw`单价路径保持等价的复合与逆`,String.raw`05C6 05C7 05C4 058K`,String.raw`在单价宇宙 $\mathcal U$ 中取 $A,B,C$。`);
spec(String.raw`05C9`,String.raw`固定源类型的等价总空间可缩`,String.raw`05C6 058M 054J 058L`,String.raw`宇宙 $\mathcal U$ 假定单价。`);
spec(String.raw`05CA`,String.raw`单价性给出的等价归纳`,String.raw`05C6 05C7 050G 0548`,String.raw`宇宙 $\mathcal U$ 假定单价；目标可以依赖等价 $e$ 本身。`);
spec(String.raw`05CB`,String.raw`可定义类型构造保持等价`,String.raw`05C6 05C8 0545`,String.raw`设 $\mathcal U$ 是单价宇宙，$A,B:\mathcal U$。`);
spec(String.raw`05CC`,String.raw`自映射类型上的等价作用是共轭`,String.raw`05CB 05CA 054F`,String.raw`设 $A,B$ 属于单价宇宙，$u:A\to A$。`);
spec(String.raw`05CD`,String.raw`二元素类型的交换自等价`,String.raw`05Z0 05Z1 058I`);
spec(String.raw`05CE`,String.raw`二元素类型的两点不能由路径相连`,String.raw`05CD 0548 050B`,String.raw`令 $\mathbf 2=\mathbf 1+\mathbf 1$，两点为 $0,1$。`);
spec(String.raw`05CF`,String.raw`含二元素类型的单价宇宙不是集合`,String.raw`05CD 05CE 05C7 05Z2`,String.raw`设 $\mathcal U$ 是包含 $\mathbf2$ 的单价宇宙，$s$ 为交换自等价。`);
spec(String.raw`05CG`,String.raw`小带基点类型的结构类型`,String.raw`05C0 0507`,String.raw`设 $\mathcal U$ 为宇宙，$(A,a),(B,b)$ 是下述类型的元素。`);
spec(String.raw`05CH`,String.raw`带基点类型的结构同一性`,String.raw`05CG 054H 05C7`,String.raw`设 $\mathcal U$ 是单价宇宙，$A,B:\mathcal U$，$a:A,b:B$。`);
spec(String.raw`05CI`,String.raw`给二元素类型标点消除交换自等价`,String.raw`05CH 05CD 05CE`,String.raw`取单价宇宙中的带基点类型 $(\mathbf2,0)$。`);
spec(String.raw`05CJ`,String.raw`小类型上的二元运算结构`,String.raw`05C0 0505 0507`);
spec(String.raw`05CK`,String.raw`二元运算的共轭传输公式`,String.raw`05CJ 05C3 0548 050K`,String.raw`设 $A,B:\mathcal U$，$M(X)=X\times X\to X$，$\mu:M(A)$，$b_1,b_2:B$。`);
spec(String.raw`05CL`,String.raw`二元运算结构的同一性`,String.raw`05CJ 05CK 054H 05C7 050K`,String.raw`设 $\mathcal U$ 是单价宇宙，$\mu:A\times A\to A$，$\nu:B\times B\to B$。`);
spec(String.raw`05CM`,String.raw`小幺半群的类型论编码`,String.raw`00II 05Z2 05C0 0507`,String.raw`这里复用普通 [幺半群](00II) 的定义，只将结构打包到宇宙中的依赖和；以下显式写出其公理的类型，以区分结构与性质。`);
spec(String.raw`05CN`,String.raw`集合上幺半群公理是命题`,String.raw`05CM 0587`,String.raw`固定 $\mathcal U$ 中的集合 $A$、单位和乘法。`);
spec(String.raw`05CO`,String.raw`小幺半群的同一性等价于同构`,String.raw`05CM 05CN 05CL 05CH 058N`,String.raw`设 $M=(A,1_A,\mu)$、$N=(B,1_B,\nu)$ 是单价宇宙中的小幺半群；同构指保持单位和乘法的承载集合双射。`);

spec(String.raw`05G0`,String.raw`没有指定编号的有限类型`,String.raw`05C0 058B 05Z4 05Z0 050B 05Z1 050D`);
spec(String.raw`05G1`,String.raw`有限类型的承载类型是集合`,String.raw`05G0 05Z2 058L 0588`,String.raw`设 $n:\mathbb N$；记 $A:\mathsf{Fin}_n$ 时也用 $A$ 表示它的第一投影。`);
spec(String.raw`05G2`,String.raw`连通类型的截断路径判据`,String.raw`058B`,String.raw`设 $X$ 是类型。这里的连通性是同伦类型意义的路径连通分支唯一，不是任意点集拓扑空间的连通性。`);
spec(String.raw`05G3`,String.raw`有限类型的分类类型是连通一类型`,String.raw`05G0 05G1 05G2 058N 05C6 050K 058F 0589`,String.raw`固定 $n:\mathbb N$，宇宙 $\mathcal U$ 单价。`);
spec(String.raw`05G4`,String.raw`带基点类型的环路类型`,String.raw`050G 0542 0589`,String.raw`普通群采用 [群](0001) 的定义。若要与通常函数复合的乘法匹配，可取 $p*q=q\cdot p$；本文出现 $\cdot$ 时始终先左后右。`);
spec(String.raw`05G5`,String.raw`对称群`,String.raw`00DC`);
spec(String.raw`05G6`,String.raw`有限类型分类空间的环路是对称群`,String.raw`05G3 05G4 00DC 05C4`,String.raw`固定 $n:\mathbb N$，$\Sigma_n=\operatorname{Sym}(\mathbf n)$ 为 [对称群](00DC)。写 $\mathbf n$ 为分类类型的基点时，实际指 $(\mathbf n,|\operatorname{id}|)$。`);
spec(String.raw`05G7`,String.raw`零元与一元类型的分类空间可缩`,String.raw`05G3 05G6 0580`,String.raw`固定单价宇宙，$\mathsf{Fin}_n$ 表示无指定编号的 $n$ 元类型。`);
spec(String.raw`05G8`,String.raw`普通群的分类空间`,String.raw`0001 05G2 0589 05G4`,String.raw`环路群采用与指定群同构相容的乘法约定。`);
spec(String.raw`05G9`,String.raw`右群作用与等变映射的约定`,String.raw`00BI 0001`,String.raw`这里是 [群作用](00BI) 的右作用记法：由左作用可取 $x\cdot g=g^{-1}\cdot x$ 换算。此页保留右作用与等变性的专用约定。`);
spec(String.raw`05GA`,String.raw`右群挠子`,String.raw`05G9 058B 05Z3`,String.raw`固定普通群 $G$ 和宇宙 $\mathcal U$；$\mathsf{Tors}(G)$ 中的承载集合均为 $\mathcal U$-小，作用及其公理也属于结构。`);
spec(String.raw`05GB`,String.raw`挠子条件等价于自由传递性`,String.raw`05GA 058E 0580 00BL 00BM`,String.raw`固定群 $G$ 和右 $G$-集合 $T$，并假定 $\|T\|$；“后一条件”特指每个轨道映射 $q_t$ 为等价。`);
spec(String.raw`05GC`,String.raw`群在自身上右乘给出标准挠子`,String.raw`05GA 0001`,String.raw`固定普通群 $G$。`);
spec(String.raw`05GD`,String.raw`选点将挠子平凡化`,String.raw`05GA 05GC`,String.raw`设 $T$ 是右 $G$-挠子，$q_t(g)=t\cdot g$。`);
spec(String.raw`05GE`,String.raw`群作用与挠子的结构同一性`,String.raw`05GA 05C6 054F 058N 058F`,String.raw`固定普通群 $G$，宇宙单价；等变等价是承载类型的等价并满足右作用相容条件。`);
spec(String.raw`05GF`,String.raw`右群挠子类型是群的分类空间`,String.raw`05GE 05GD 05GC 05G2 0589 05G8`,String.raw`固定小普通群 $G$，宇宙单价。以下按先行 $p$ 再行 $q$ 解释路径连接；若使用通常群乘法，则取环路乘法 $p*q=q\cdot p$。`);
spec(String.raw`05GG`,String.raw`参数化的右群挠子族`,String.raw`05GA 0505 0507`,String.raw`固定群 $G$ 与类型 $X$。`);
spec(String.raw`05GH`,String.raw`挠子族的分类映射与逐纤维等价`,String.raw`05GG 05GE 050A 050K`,String.raw`固定普通群 $G$ 与类型 $X$，在单价宇宙中讨论小挠子族。`);
spec(String.raw`05GI`,String.raw`圆周双覆盖的交换单值变换`,String.raw`05G6 05Z7 00E0 00E2`,String.raw`令 $S^1=\{z\in\mathbb C:|z|=1\}$，取通常拓扑。覆盖指每点邻域的原像分解为分别同胚于该邻域的开集；本例可由平方根的两个局部分支直接检查。`,String.raw`普通拓扑模型的例子，不声称任意点集拓扑纤维族具有相同分类定理。`);
spec(String.raw`05GJ`,String.raw`带一个标记点的有限类型`,String.raw`05G0 0507`,String.raw`固定 $n\ge1$，对 $A:\mathsf{Fin}_n$，纤维记号 $A$ 指其承载类型。`);
spec(String.raw`05GK`,String.raw`带标记有限类型的环路群是稳定子`,String.raw`05GJ 05CH 05G3 00DC 00BK`,String.raw`取标准 $n$ 元类型中的指定点 $0$；宇宙单价，$n\ge1$。`);
spec(String.raw`05GL`,String.raw`带标记二元素类型的分类空间可缩`,String.raw`05GK 05G7 05Z7`,String.raw`设 $\mathcal U$ 为单价宇宙。`);

spec(String.raw`05K0`,String.raw`高阶群由退悬类型给出`,String.raw`05G2 05G4 0542 054N`,String.raw`这里不复用严格 [内部群](003J) 的定义：退悬类型及其全部路径结构是数据的一部分。`);
spec(String.raw`05K1`,String.raw`普通群是具有一截断退悬的高阶群`,String.raw`05K0 0589 0001`);
spec(String.raw`05K2`,String.raw`高阶群同态是退悬的带基点映射`,String.raw`05K0 0544 0542`,String.raw`为区分基点，可写源基点 $*_G:BG$、目标基点 $*_H:BH$；公式中省略下标。`);
spec(String.raw`05K3`,String.raw`带基点映射诱导相容的环路同态`,String.raw`05K2 0545 0542`,String.raw`设 $(F,\epsilon)$ 是从 $(BG,*_G)$ 到 $(BH,*_H)$ 的带基点映射；$p,q:*_G=*_G$，诱导映射为 $p\mapsto\epsilon^{-1}\cdot\mathsf{ap}_F(p)\cdot\epsilon$。`);
spec(String.raw`05K4`,String.raw`基点路径族的投影与环路纤维`,String.raw`050G 0507 05G4 054J`,String.raw`设 $(X,x_0)$ 是带基点类型。`);
spec(String.raw`05K5`,String.raw`路径族总空间可缩`,String.raw`054J 05K4`);
spec(String.raw`05K6`,String.raw`挠子空间上的普遍挠子就是路径族`,String.raw`05K4 05GF 05GD 05GE 058M`,String.raw`固定小普通群 $G$，$T$ 为右 $G$-挠子；$G=T$ 表示挠子类型内的路径，不只是承载集合等式。`);
spec(String.raw`05K7`,String.raw`带点挠子的总空间可缩`,String.raw`05GA 05GE 05GD 054H 0580`,String.raw`固定普通群 $G$，宇宙单价。`);
spec(String.raw`05K8`,String.raw`高阶群作用是退悬上的类型族`,String.raw`05K0 05C0 0548 0549`,String.raw`设 $\mathcal U$ 为所用类型宇宙。`);
spec(String.raw`05K9`,String.raw`高阶群作用律来自传输`,String.raw`05K8 0549 054A`,String.raw`设 $A:BG\to\mathcal U$ 表示作用，$g,h:*=*$；$\rho_g=\mathsf{tr}_A(g)$。`);
spec(String.raw`05KA`,String.raw`高阶群的平凡作用`,String.raw`05K8 0505`,String.raw`固定高阶群 $(BG,*)$ 和类型 $X$。普通群作用的记法参见 [左作用](00BI) 与 [右作用](05G9)。`);
spec(String.raw`05KB`,String.raw`由普通群作用构造挠子关联集合`,String.raw`00BI 05GA 058N 050K`,String.raw`固定群 $G$；$X$ 是集合，带左 $G$-作用。以下是右挠子上的反等变函数集合。`);
spec(String.raw`05KC`,String.raw`挠子关联集合在选定点的求值等价`,String.raw`05KB 05GD 058I`,String.raw`固定左 $G$-集合 $X$、右 $G$-挠子 $T$。`);
spec(String.raw`05KD`,String.raw`挠子关联族的传输恢复原群作用`,String.raw`05KB 05KC 05GE 05CA 054F`,String.raw`固定左 $G$-集合 $X$，$T,U$ 为右 $G$-挠子，$A_X$ 是其关联集合族。`);
spec(String.raw`05KE`,String.raw`高阶群作用的同伦不动点`,String.raw`05K8 0505`,String.raw`固定高阶群 $(BG,*)$ 及其作用族 $A:BG\to\mathcal U$。`);
spec(String.raw`05KF`,String.raw`同伦不动点的环路相容条件`,String.raw`05KE 05K9 054A`,String.raw`固定作用族 $A:BG\to\mathcal U$，记 $\rho_g=\mathsf{tr}_A(g)$。`);
spec(String.raw`05KG`,String.raw`平凡作用的同伦轨道与不动点`,String.raw`05KA 05KE 05Z6`,String.raw`设 $(BG,*)$ 表示高阶群，$X$ 是类型。`);
spec(String.raw`05KH`,String.raw`一点作用的同伦轨道保留整个分类空间`,String.raw`05KG 05Z0`,String.raw`固定高阶群 $(BG,*)$。`);
spec(String.raw`05KI`,String.raw`带基点连通类型到集合的映射由基点值决定`,String.raw`05G2 05Z2 058B 050K 058I`,String.raw`设 $B,X$ 为类型；“连通”指截断的路径连通性。`);
spec(String.raw`05KJ`,String.raw`普通群作用的作用群胚`,String.raw`00BI 00I0`,String.raw`群胚是所有态射可逆的范畴；若 $g:x\to y$、$h:y\to z$，则复合标签为 $hg$。`);
spec(String.raw`05KK`,String.raw`作用群胚的连通分支就是轨道`,String.raw`05KJ 00BJ`,String.raw`设普通群 $G$ 左作用于集合 $X$；群胚的连通分支按对象之间的可逆箭头连通关系取商。`);
spec(String.raw`05KL`,String.raw`传递作用群胚与稳定子分类空间`,String.raw`05KJ 05ZA 00BM 00I1 05G8`,String.raw`设普通群 $G$ 左作用于非空集合 $X$。$BG_x$ 在范畴层面指唯一对象且自同构群为 $G_x$ 的群胚；说其同伦类型时才指神经所表示的空间。`,String.raw`普通群胚层面的全忠实且本质满是弱等价；选择显式拟逆需要选择同构。`);
spec(String.raw`05KM`,String.raw`相同普通轨道集合可以有不同同伦轨道`,String.raw`05KL 05Z6 05G8`,String.raw`设 $G$ 为普通群；对非平凡群，以下两个同伦轨道不等价。`,String.raw`作用群胚的神经表示作用族总空间是语义比较，不在此冒称已完整证明。`);
spec(String.raw`05KN`,String.raw`同伦商的映出泛性质`,String.raw`0509`);
spec(String.raw`05KO`,String.raw`同伦商映射在基点处的作用不变性`,String.raw`0509 05Z6 054F 054A 05K9`,String.raw`固定作用族 $A:BG\to\mathcal U$ 和目标类型 $Y$，记 $\rho_g=\mathsf{tr}_A(g)$。由 [依赖和的映出泛性质](0509)，同伦商上的函数等价于下述依赖函数族。`);
spec(String.raw`05KP`,String.raw`带单位的乘法空间`,String.raw`050J 0507`,String.raw`设 $(X,e)$ 为带基点类型。仅给以下低阶数据，尚不规定完整高阶群结构。`);
spec(String.raw`05KQ`,String.raw`环路空间比一般 H 空间包含更多相容性`,String.raw`05KP 05G4 054N`,String.raw`设 $B$ 是带基点类型，$\Omega B$ 为它的环路类型。`);
spec(String.raw`05KR`,String.raw`带单位乘法结构沿等价传输`,String.raw`05KP 05CK 058I`,String.raw`设 $X$ 的单位为 $e_X$、乘法为 $\mu_X$，并已给出两侧单位同伦。`);

function body(id, text) { all[id].parts[0].body=text; }
function extra(chapter,id,title,kind,text,deps,context,sourceId) {
  const original=all[sourceId];
  const unit={id,parts:[{kind,title,body:text,start:original.parts[0].start,end:original.parts.at(-1).end}],derivedFrom:sourceId};
  data[chapter-9].units.push(unit); all[id]=unit; spec(id,title,deps,context);
}
const reused={'0508':['05CG','05CJ'],'05G5':['00DC'],'05K5':['054J','05K4'],'05KN':['0509','05KO']};
body('050B',String.raw`空类型 $\mathbf0$ 没有引入构造，并允许从 $z:\mathbf0$ 消去到任意类型。对依赖于 $z:\mathbf0$ 的目标族，也有无需分支的消去。`);
extra(9,'05Z0','单位类型及其消去规则','definition',String.raw`单位类型 $\mathbf1$ 有引入项 $*:\mathbf1$。给定 $P:\mathbf1\to\mathcal U$，定义 $\prod_{u:\mathbf1}P(u)$ 只需指定 $d:P(*)$；消去函数在 $*$ 处计算为 $d$。`,'0500 0505','', '050B');
extra(9,'05Z1','余和类型的分支与依赖消去','definition',String.raw`余和 $A+B$ 有引入项 $\mathsf{inl}(a)$、$\mathsf{inr}(b)$。对 $P:A+B\to\mathcal U$，给定两个分支 $\prod_{a:A}P(\mathsf{inl}(a))$ 和 $\prod_{b:B}P(\mathsf{inr}(b))$，就能定义 $\prod_{z:A+B}P(z)$，在各引入项处按对应分支计算。

$A+B$ 记录选择了左支或右支，因此比仅断言两者之一存在保留更多数据。`,'0500 0505','设 $A,B$ 为类型。','050B');
body('050C',String.raw`否定类型写为 $\neg A=(A\to\mathbf0)$。它记录从 $A$ 的任意元素导出矛盾的方法。`);
body('0506',all['0506'].parts[0].body.replace('函数复合可定义为 $(g\\circ f)(x)\\equiv g(f(x))$。',''));
extra(9,'05Z9','类型论中的函数复合','definition',String.raw`函数复合定义为 $(g\circ f)(x)\equiv g(f(x))$。计算方向由函数应用规则决定。`,'0505 0503',String.raw`设 $f:A\to B$、$g:B\to C$。`,'0506');
body('0585',String.raw`定义 $\mathsf{isProp}(A)=\prod_{x,y:A}(x=y)$。当此类型有元素时，称 $A$ 为命题。它不要求给出 $A$ 的元素；空类型也可能是命题。`);
extra(11,'05Z2','集合是零截断类型','definition',String.raw`定义 $\mathsf{isSet}(A)=\prod_{x,y:A}\mathsf{isProp}(x=y)$。满足这一条件的类型称为集合或零截断类型。这里集合性描述路径类型的层次，不规定元素的具体编码。`,'0585 0505','设 $A$ 是类型。','0585');
body('058E',String.raw`对 $f:A\to B$，定义 $\mathsf{fib}_f(b)=\sum_{a:A}(f(a)=b)$。一个元素是 $(a,p)$，其中 $a:A$，$p:f(a)=b$。`);
extra(11,'05Z3','函数等价性的可缩纤维定义','definition',String.raw`定义
\[\mathsf{isEquiv}(f)=\prod_{b:B}\mathsf{isContr}(\mathsf{fib}_f(b)).\]
一个函数称为等价，若给出了其所有同伦纤维的收缩数据。`,'058E 0580 0505',String.raw`设 $f:A\to B$。`,'058E');
extra(11,'05Z4','两个类型之间的等价类型','definition',String.raw`定义
\[A\simeq B=\sum_{f:A\to B}\mathsf{isEquiv}(f).\]
等价包含底层函数与纤维可缩性的见证。记 $e(a)$ 时使用等价的第一投影。`,'05Z3 0507','设 $A,B$ 是类型。','058E');
body('058F',String.raw`$\mathsf{isEquiv}(f)$ 是命题。`);
all['058F'].parts[1].body=String.raw`它是命题 $\mathsf{isContr}(\mathsf{fib}_f(b))$ 的依赖积，故由命题的依赖积封闭性得到结论。`;
extra(11,'05Z5','恒等函数的同伦纤维可缩','proposition',String.raw`恒等函数 $\operatorname{id}_A:A\to A$ 是等价。固定 $b:A$，其同伦纤维是 $\sum_{a:A}(a=b)$。取中心 $(b,\mathsf{refl}_b)$，对 $p:a=b$ 作反向的固定终点路径归纳，得到中心到 $(a,p)$ 的路径，故纤维可缩。`,'05Z3 050H','设 $A$ 是类型。','058F');
body('05KE',String.raw`同伦不动点类型定义为
\[A^{hG}=\prod_{z:BG}A(z).\]
它是作用族的截面类型，保存随所有路径与高阶路径变化的相容性。`);
extra(14,'05Z6','高阶群作用的同伦轨道','definition',String.raw`同伦轨道类型（亦称同伦商）定义为
\[A_{hG}=\sum_{z:BG}A(z).\]
它是作用族的总空间，而不是仅将点按轨道等价关系识别的 [商集合](00G2)。`,'05K8 0507 00G2',String.raw`固定高阶群 $(BG,*)$ 和作用族 $A:BG\to\mathcal U$。`,'05KE');
const low=all['05G7'].parts[0].body.split('\n\n');
body('05G7',low[0]);
extra(13,'05Z7','二元素类型分类空间的阶二环路','example',low[1],'05G6 05CD 05G3',String.raw`在单价宇宙中考虑 $\mathsf{Fin}_2$，以标准二元素类型为基点。`,'05G7');
const torsorExamples=all['05GC'].parts[0].body.split('\n\n');
body('05GC',torsorExamples[0]);
extra(13,'05Z8','无标记整数格点是整数群挠子','example',torsorExamples[1],'05GA','整数加法群的单位为 $0$；其作用写为平移，正负号不选定任何特殊格点。','05GC');
extra(14,'05ZA','作用群胚的自同构群是稳定子','proposition',String.raw`对象 $x:X$ 的自同构群为稳定子
\[G_x=\{g:G\mid g\cdot x=x\}.\]
证明：作用群胚中的 $x\to x$ 的箭头正是这样的群元素，箭头复合、单位与逆来自群运算，因而与稳定子的群结构一致。`,'05KJ 00BK','设普通群 $G$ 左作用于集合 $X$。','05KK');
body('05KK','两个对象在同一连通分支内，当且仅当它们位于同一轨道。');
all['05KK'].parts[1].body=all['05KK'].parts[1].body.replace('第一断言直接来自态射的定义。','');
all['05K4'].parts[0].body+=String.raw`

总空间的可缩性见 [固定起点的路径总空间可缩](054J)。投影的依赖纤维在 $x_0$ 处定义上为 $x_0=x_0=\Omega(X,x_0)$；若使用同伦纤维定义，则通过依赖和消去得到与该纤维的典范等价。因此可缩总空间可以具有非可缩纤维，底空间保存了单值变换。`;

all['050I'].parts[1].body=String.raw`由固定起点形式出发，对每个 $x$ 取起点 $a=x$，再作依赖函数抽象，即得全变量形式。

反向固定 $a:A$，定义辅助动机
\[
Q(x,y,p)=\prod_{R:\prod_{z:A}(x=z)\to\mathcal U}
\bigl(R(x,\mathsf{refl}_x)\to R(y,p)\bigr).
\]
必要时在更大宇宙中形成这个动机。在 $p=\mathsf{refl}_x$ 时取 $(R,d)\mapsto d$。全变量 $J$ 给出所有 $Q(x,y,p)$；再取 $x=a$、$R=P$ 并评价于 $d$，得到固定起点形式及其计算规则。若使用带附加依赖参数的 $J$ 规则，这也正是同一参数化构造。相对路径对象提供其语义解释，但内部规则的上述推导不把语义严格化定理作为本页已证结论。`;
all['054J'].parts[1].body+=String.raw`

独立于依赖和路径公式的直接证明是：对 $p:a=x$ 使用固定起点路径归纳；当 $x=a,p=\mathsf{refl}_a$ 时，所需的总空间路径取 $\mathsf{refl}_{(a,\mathsf{refl}_a)}$。这样也避免把本结果与后续等价判据循环依赖。`;
all['054H'].parts[1].body=all['054H'].parts[1].body.replace('故两者互为拟逆，进而是等价。','故两者互为拟逆。本页的等价符号首先表示这一明确的互逆数据；按可缩纤维定义的等价性由 [拟逆判据](058I) 进一步识别。');
all['054L'].parts[0].body+=String.raw`
\[(\alpha\circ_h\gamma)\circ_v(\beta\circ_h\delta)
=(\alpha\circ_v\beta)\circ_h(\gamma\circ_v\delta).\]`;
all['058J'].parts[0].body=all['058J'].parts[0].body.replace(String.raw`A\xrightarrow fB\xrightarrow gC`,String.raw`A\xrightarrow{f}B\xrightarrow{g}C`);
all['05C2'].parts[0].body+=String.raw`

图中上边为 $j(\gamma,b)=(B(\gamma),b)$，左边为第一投影 $\pi_1$，交换等式为 $\pi\circ j=B\circ\pi_1$。同伦拉回的额外比较路径通过路径归纳消去，给出所述总空间等价。`;
all['05CG'].parts[0].body=all['05CG'].parts[0].body.split('两个带基点类型之间')[0];
extra(12,'05ZB','带基点等价的数据','definition',String.raw`两个带基点类型之间的带基点等价数据为
\[\operatorname{Eq}_\bullet((A,a),(B,b))=\sum_{e:A\simeq B}(e(a)=b).\]
基点比较是路径数据；在一般类型中不能省略这一见证。`,'05CG 05Z4','设 $(A,a),(B,b)$ 为小带基点类型。','05CG');
specs['05CH'].deps.push('05ZB');
all['05CM'].parts[0].body+=String.raw`

若把上述三个公理类型的乘积记为 $\mathsf{MonAx}(A,u,\mu)$，则小幺半群的结构类型写成
\[
\mathsf{Mon}_{\mathcal U}=\sum_{A:\mathcal U}\sum_{s:\mathsf{isSet}(A)}\sum_{u:A}\sum_{\mu:A\times A\to A}\mathsf{MonAx}(A,u,\mu).
\]
这里 $s$ 记录集合性的证明，$u$ 与 $\mu$ 是结构数据；公理的证明无关性另行证明。`;
all['05GL'].parts[0].body+=String.raw`

可缩性的推导如下：带标记分类类型连通；其路径类型是集合，而且在命题目标中选取有限编号后，保标记双射唯一，所以这些路径类型实际是命题。将连通性给出的截断路径消去到该命题，得到从标准带标记对象到每个对象的实际路径，形成收缩。`;
all['05KL'].parts[1].body=all['05KL'].parts[1].body.replace('普通范畴的等价判据给出结论。','因此得到全忠实且本质满的群胚函子，也就是这里采用的群胚弱等价；它诱导所表示同伦类型的等价。这个最后的神经比较属于外部群胚语义。');
all['05KD'].parts[1].body=all['05KD'].parts[1].body.replace('可用等价归纳验证。','具体地，先对右作用结构中的路径作路径归纳，恒等路径时两边均为恒等；再用结构同一性把一般等变等价换成结构路径。这不要求将任意固定两端的等变自同构归纳为恒等。');

const corrections=[
 {id:'050I',issue:'源文把全变量 J 到固定起点 J 的推导仅称为一般化。',resolution:'补出含额外族参数的明确动机 Q，保留宇宙提升条件。'},
 {id:'054H',issue:'路径公式中的拟逆先于可缩纤维判据，若全部作为必要前置会形成证明环。',resolution:'先以明确的两侧逆同伦陈述结果；后续判据作为结论识别而非本页必要前置。'},
 {id:'05K4',issue:'源文说投影的纤维定义上为环路，可能混淆依赖纤维与同伦纤维。',resolution:'明示依赖纤维的定义相等，以及同伦纤维只典范等价。'},
 {id:'058J',issue:'源公式 A\\xrightarrow fB 容易被误解析。',resolution:'为箭头标签 f,g 加花括号。'},
 {id:'05KL',issue:'构造性语境中全忠实本质满不无条件提供选定拟逆。',resolution:'明确弱等价／神经语义与选取显式拟逆的区别，未升级为无选择的构造。'},
 {id:'05KD',issue:'一般等价归纳不能在固定对象的自同构子类型内直接使用。',resolution:'改用结构路径归纳，再经结构同一性等价返回等变等价。'},
 {id:'05GL',issue:'原例直接声称带标记二元分类类型可缩。',resolution:'补出路径命题性及截断消去的收缩论证。'}
];


specs['0506'].title='依赖类型的柯里化';
function replaceIn(id,oldText,newText) {
  for(const p of all[id].parts) p.body=p.body.replaceAll(oldText,newText);
}
replaceIn('0501','后一个表达式的意义将在本章后面精确规定。','其中的等式按 [同一性类型](050G) 解释。');
replaceIn('0503','后文的','相对地，');
replaceIn('0506','本章后面列出的函数外延性','[函数外延性](050K)');
replaceIn('050F','路径上的函数作用将在下一章由同一性消去构造。','所用的 [函数路径作用](0544) 由同一性消去构造。');
replaceIn('050K','本讲义使用函数外延性：','函数外延性断言：');
replaceIn('050N','从本章起，除专门讨论语义的段落外，','在内部演算中，');
replaceIn('050N','其语义已由上一编的相对路径对象证明。','其语义由 [相对路径分解](042J) 解释。');
replaceIn('050N','把自然同构严格化为语法中的严格代入属于最后一章列出的语义基础定理。','把自然同构严格化为语法中的严格代入需要另行引用 [严格模型存在定理](080D)，不由这些泛性质本身推出。');
replaceIn('054E','这与第五章由拓扑方块得到的基点变化公式相符，只是此处使用了内部路径方向的统一约定。','此处连接按先左后右进行，因此基点变化用这一方向的共轭公式表示。');
replaceIn('054M','上一命题给出交换律。','[二阶路径互换律](054L) 给出所需比较。');
replaceIn('058I','一个方向已证明。','从等价得到拟逆的方向见 [可缩纤维给出拟逆](058G)。');
replaceIn('058I','上一引理明确修正这一问题。','[余单位修正引理](058H) 明确补足三角相容。');
replaceIn('058L','上一命题对路径类型的等价','[路径类型上的等价](058K)');
replaceIn('058A','此性质稍后由等价对路径空间的作用证明。','这一点由 [截断性的等价不变性](058L) 保证。');
replaceIn('05C0','本讲义每次在一个固定宇宙内进行构造，','可在一个固定宇宙内进行构造，');
replaceIn('05C5','后一公式将在本章具体计算。','共轭公式见 [函数类型族的传输](054F)。');
replaceIn('05C6','本讲义使用一个对所述类型构造封闭的单价宇宙。','需要依赖和、依赖积等构造时，另要求宇宙对相应 [类型构造封闭](05C1)。');
replaceIn('05C8','上一节的复合相容与单价计算式','[比较映射的复合相容](05C4) 与 [单价计算式](05C7)');
replaceIn('05CF','与上一引理矛盾','与 [二元素类型的两点不相等](05CE) 矛盾');
replaceIn('05CO','上一节的乘法相容','[二元运算的乘法相容条件](05CL)');
replaceIn('05CI','上述路径公式','[带基点结构同一性公式](05CH)');
replaceIn('05K3','上述环路映射','带基点映射诱导的环路映射');
replaceIn('05KI','上述命题通常不成立','基点求值通常不再是等价');
replaceIn('05C2','上述总空间','解码族的总空间');
replaceIn('05CM','上述三个公理类型','两条单位律与结合律的公理类型');
replaceIn('050I','内部规则的上述推导','内部规则的这一推导');
replaceIn('058N','该命题意味着','命题子类型路径公式表明');
replaceIn('058H','并代入前一等式','并代入 $\\mathsf{ap}_{fg}(\\mathsf{ap}_f\\eta_a)=\\mathsf{ap}_f\\eta_{gfa}$');
specs['05C2'].context=String.raw`设 $\Gamma$ 是类型。同伦拉回在此指带比较路径的依赖和，不是未经推导便等同于严格拉回。`;
specs['05CM'].context=String.raw`设 $\mathcal U$ 是宇宙。普通 [幺半群](00II) 的集合、单位和乘法可打包为依赖和；相应公理的类型用于区分结构数据与性质见证。`;
specs['050N'].deps.push('0421','042J','0438','043A','043B');
specs['050N'].context=String.raw`在单纯集合模型中，语境由底对象解释，展示类型由其上的 [Kan 纤维化](0421) 解释。截面是投影 $p:E\to\Gamma$ 的右逆 $s$，满足 $ps=\operatorname{id}_\Gamma$；换底使用拉回。下面解释规则的含义，不以此取代严格模型存在定理。`;
specs['058A'].deps.push('0312','041G','041J');
specs['058A'].context=String.raw`设 $C$ 是小 [群胚](0312)，用其 [神经](041G) 表示同伦类型；[群胚神经满足 Kan 条件](041J)。其一截断性在此作为群胚与同伦类型的标准语义对应使用。`;
specs['05KJ'].deps.push('0312');
specs['05KJ'].context=String.raw`使用 [群胚](0312) 的普通范畴定义。若 $g:x\to y$、$h:y\to z$，则复合标签为 $hg$。`;
specs['05KL'].deps.push('041G');
specs['05KM'].deps.push('041G');
specs['05KQ'].deps.push('05K0');
specs['05G4'].deps.push('0001');
// Examples used as constructions/results must not become navigation-style prerequisites.
const taxonOverrides={'050E':'Construction','05GC':'Construction','05Z7':'Theorem','05G7':'Theorem','05KA':'Definition','05C2':'Construction'};


specs['0507'].deps.push('0505');
specs['0507'].context=String.raw`设 $A$ 是类型，$B(x)$ 是其上的类型族。依赖和把参数与对应纤维中的元素一起保存；常值族的依赖和记为积 $A\times B$。依赖消去中的 $D(z)$ 是在总空间上给定的任意类型族。`;
specs['050H'].context=String.raw`设 $A$ 是类型，$\mathcal U$ 为动机所在的宇宙。`;
specs['050I'].context=String.raw`设 $A$ 是类型，$a:A$；固定起点形式的动机为 $P:\prod_{x:A}(a=x)\to\mathcal U$，并给定 $d:P(a,\mathsf{refl}_a)$。比较全变量 $J$ 与固定起点 $J_a$ 规则时，动机均允许附加依赖参数。`;
specs['050K'].context=String.raw`设 $A$ 是类型，$B:A\to\mathcal U$ 是类型族，$f,g:\prod_{x:A}B(x)$。函数外延性断言 $\mathsf{happly}$ 具有逆及两侧逆同伦；不是把逐点相等提升为定义相等。`;
for(const id of ['050D','050G','050H','05Z0','05Z1'])specs[id].deps.push('05C0');
replaceIn('0502','例如 $b:B(a)$','例如对于 $a,a\\prime:A$ 与 $B:A\\to\\mathcal U$，$b:B(a)$');
replaceIn('0502','a\\prime','a^\\prime');
replaceIn('0504','两条任意路径的复合结合律','三条可复合路径的结合律');
all['050D'].parts[0].body+=String.raw`
\[
\mathsf{ind}(z,s)(0)\equiv z,\qquad
\mathsf{ind}(z,s)(\mathsf{succ}(n))\equiv s(n)(\mathsf{ind}(z,s)(n)).
\]`;
replaceIn('054J','这样也避免把本结果与后续等价判据循环依赖。','');
replaceIn('054H','本页的等价符号首先表示这一明确的互逆数据；按可缩纤维定义的等价性由 [拟逆判据](058I) 进一步识别。','按可缩纤维定义的等价性由 [拟逆判据](058I) 识别；路径公式本身的两侧逆同伦已经由归纳给出。');
all['05CG'].parts[0].body+='表达式本身不要求宇宙单价；把结构路径解释为带基点等价则另需单价性。';
all['05CJ'].parts[0].body+='这个依赖和不要求单价性；其路径与保运算等价之间的关系需要另行证明。';
corrections.push({id:'0504',issue:'源例称两条路径的复合结合律。',resolution:'改为三条可复合路径，保持区分定义计算与命题路径的原意。'},{id:'05C2',issue:'扩展宇宙宏后，宽波浪的参数必须成组。',resolution:'将宏应用展开为带花括号的标准 TeX，KaTeX 与独立 LaTeX 均验证。'});


specs['0581'].title='单位类型可缩';
specs['0581'].deps=['0580','05Z0'];
specs['0581'].context='';
body('0581',String.raw`单位类型 $\mathbf1$ 可缩，中心为 $*$。单位类型的消去规则由在 $*$ 处的自反路径给出 $\prod_{u:\mathbf1}(*=u)$，这就是收缩。`);
extra(11,'05ZC','空类型不能可缩','proposition',String.raw`空类型 $\mathbf0$ 不可能可缩：若 $c:\mathsf{isContr}(\mathbf0)$，其第一投影便是空类型的元素。因此取第一投影给出 $\mathsf{isContr}(\mathbf0)\to\mathbf0$。`,'0580 050B 050C','','0581');
specs['058C'].title='命题截断表达无指定见证的存在';
specs['058C'].deps=['058B','0507'];
specs['058C'].context=String.raw`设 $A$ 是类型，$B:A\to\mathcal U$ 是依赖族。`;
body('058C',String.raw`$\left\|\sum_{x:A}B(x)\right\|$ 表示存在某个 $x$ 及其见证，但不记录具体是哪一个。与依赖和不同，该类型的消去只允许命题目标，不能无条件取出见证。`);
extra(11,'05ZD','命题析取是余和的命题截断','definition',String.raw`定义 $A\lor B=\|A+B\|$。析取结果是命题，不保留具体选了哪一支；未经截断的 $A+B$ 则仍保存左支或右支及相应的项。`,'058B 05Z1','设 $A,B$ 是类型。','058C');
taxonOverrides['050C']='Definition';
taxonOverrides['0581']='Theorem';
taxonOverrides['058C']='Definition';
specs['05K0'].context=String.raw`与严格 [内部群](003J) 的定义不同，退悬类型及其全部路径结构在这里是数据的一部分。`;
specs['05K1'].context=String.raw`设 $(BG,*)$ 是带基点连通类型，$G=\Omega(BG,*)$。`;
replaceIn('05K7','类型 $\\sum_{T:\\Tors(G)}T$ 的中心可取 $(G,1)$。','类型 $\\sum_{T:\\Tors(G)}T$ 可缩，中心可取 $(G,1)$。');
replaceIn('05K4','$x_0=x_0=\\Omega(X,x_0)$','$\\Omega(X,x_0)\\equiv(x_0=_Xx_0)$');
all['05KB'].parts[0].body+='这里相容等式对所有 $t:T$ 与 $g:G$ 要求成立。';
specs['05KA'].context=String.raw`固定高阶群 $(BG,*)$ 和类型 $X$，记 $\rho_g=\mathsf{tr}_A(g)$。普通群作用的记法参见 [左作用](00BI) 与 [右作用](05G9)。`;
specs['05GA'].context=String.raw`固定宇宙 $\mathcal U$ 和一个 $\mathcal U$-小普通群 $G$；$\mathsf{Tors}(G)$ 中的承载集合均为 $\mathcal U$-小，作用及其公理也属于结构。`;
replaceIn('05CJ','本节只研究这样的对象之间的路径，尚未定义一般的非可逆同态箭头。','这个对象类型的路径不同于一般的非可逆同态箭头。');
replaceIn('05GB','后一条件等价于','所有轨道映射 $q_t:G\\to T$ 为等价的条件等价于');
specs['05GB'].context=String.raw`固定群 $G$ 和右 $G$-集合 $T$，并假定 $\|T\|$；对 $t:T$，记 $q_t(g)=t\cdot g$。`;
replaceIn('05KM','在群胚或单纯集合语义中，','对一般左作用 $G\\curvearrowright X$，记对应的作用族为 $A:BG\\to\\mathcal U$。在群胚或单纯集合语义中，');
replaceIn('05KH','群的自同构信息在 $BG$ 中完整保留。','退悬基点的自同构（即环路）信息在 $BG$ 中完整保留。');
specs['050N'].deps.push('0326');
specs['05GI'].deps.push('00E3');
replaceIn('050N','换底使用拉回。','换底使用 [拉回](0326)。');
replaceIn('05GI','分别同胚于','分别 [同胚](00E3) 于');
replaceIn('054J','使用依赖和路径公式','使用 [依赖和路径公式](054H)');
replaceIn('054J','由端点传输公式','由 [端点传输公式](054C)');
replaceIn('05G3','那么得到的是可缩类型。','那么由 [等价总空间可缩](05C9) 得到可缩类型。');
replaceIn('05K0','普通群的挠子构造表明','[普通群的挠子构造](05GF) 表明');

const macroMap={};
const main=fs.readFileSync(path.join(source,'main.tex'),'utf8');
for (const m of main.matchAll(/\\newcommand\{\\([A-Za-z]+)\}\{([^\n]*)\}/g)) macroMap[m[1]]=m[2];
function balanced(text,start) {
  let depth=0;
  for(let i=start;i<text.length;i++) {
    if(text[i]==='{' && text[i-1]!=='\\') depth++;
    if(text[i]==='}' && text[i-1]!=='\\' && --depth===0) return i;
  }
  throw new Error('Unbalanced source argument: '+text.slice(start,start+100));
}
function expand(text) {
  text=text.replace(/\\!/g,'');
  text=text.replace(/\\widetilde\\U(?![A-Za-z])/g, '\\widetilde{\\mathcal U}');
  for (;;) {
    const m=/\\trunc(?![A-Za-z])\s*/.exec(text); if(!m) break;
    const a=m.index+m[0].length;
    let end,content;
    if(text[a]==='{') {end=balanced(text,a)+1;content=text.slice(a+1,end-1);}
    else if(text[a]==='\\') {const token=/^\\[A-Za-z]+/.exec(text.slice(a))[0];end=a+token.length;content=token;}
    else {end=a+1;content=text[a];}
    text=text.slice(0,m.index)+'\\left\\|'+content+'\\right\\|'+text.slice(end);
  }
  return text.replace(/\\([A-Za-z]+)/g,(whole,name)=>macroMap[name] || whole);
}
const labels={};
for(const ch of data) for(const u of ch.units) for(const p of u.parts) for(const m of p.body.matchAll(/\\label\{([^}]+)\}/g)) labels[m[1]]=u.id;
const titles=Object.fromEntries(Object.entries(specs).map(([id,s])=>[id,s.title]));
const existingTitles={'00DC':'对称群','00II':'幺半群','00BI':'群作用','0001':'群','00G2':'等价关系与商集合','00IG':'Eckmann--Hilton 引理','00BL':'自由群作用','00BM':'传递群作用','00BK':'稳定子','00BJ':'轨道','00I0':'范畴','00I1':'函子','00E0':'拓扑空间','00E2':'连续映射','0312':'群胚','041G':'普通范畴的神经','041J':'群胚神经的 Kan 条件','0421':'Kan 纤维化','042J':'相对路径分解','0438':'Beck--Chevalley 基变换公式','043A':'依赖和保持纤维性','043B':'依赖积保持纤维性'};
const crossrefs=[];
existingTitles['0326']='拉回';
existingTitles['00E3']='同胚';
function convert(text,id) {
  text=expand(text.replace(/\\label\{[^}]+\}/g,''));
  text=text.replace(/\\ref\{([^}]+)\}/g,(_,label)=>{
    if(labels[label]) {crossrefs.push({id,sourceLabel:label,target:labels[label],status:'resolved-local'});return '['+titles[labels[label]]+']('+labels[label]+')';}
    crossrefs.push({id,sourceLabel:label,status:'parent-resolution'}); return '源讲义所引结果';
  });
  text=text.replace(/\\cite\{([^}]+)\}/g,(_,keys)=>keys.split(',').map(k=>'[引用]('+references[k]+')').join('、'));
  const displays=[];
  function save(x) {displays.push(x);return '\n\n@@DISPLAY'+(displays.length-1)+'@@\n\n';}
  text=text.replace(/\\\[([\s\S]*?)\\\]/g,(_,math)=>{
    if(math.includes('\\begin{tikzcd}')) return save('\\figure{\\tex{\\usepackage{amsmath,amssymb}\n\\usepackage{tikz-cd}}{\n'+math.trim().replace('\\begin{tikzcd}','\\begin{tikzcd}[column sep=large,row sep=large]')+'\n}}');
    return save('##{'+math.trim()+'}');
  });
  text=text.replace(/\\begin\{(align\*|gather\*)\}([\s\S]*?)\\end\{\1\}/g,(_,env,math)=>save('##{\\begin{'+(env==='align*'?'aligned':'gathered')+'}\n'+math.trim()+'\n\\end{'+(env==='align*'?'aligned':'gathered')+'}}'));
  text=text.replace(/\$([^$]+)\$/g,(_,math)=>'#{'+math+'}');
  return text.trim().split(/\n\s*\n/).filter(Boolean).map(p=>{
    const m=/^@@DISPLAY(\d+)@@$/.exec(p.trim());
    return m?displays[Number(m[1])]:'\\p{'+p.trim().replace(/\n/g,' ')+'}';
  }).join('\n\n');
}
const refsByChapter={9:['HoTT','Rijke','AwodeyWarren','RiehlSemantics'],10:[],11:[],12:['HoTT','Rijke','RiehlICM'],13:['RiehlICM','HoTT'],14:['RiehlICM','HoTT']};
const tags={definition:'Definition',example:'Example',lemma:'Theorem',proposition:'Theorem',theorem:'Theorem'};
const narratives={9:'依赖类型用语境组织参数，用依赖积与依赖和表达函数和见证。阅读的关键是把计算规则与路径见证区分开，再以路径归纳和函数外延性展开内部演算。',10:'路径归纳先给出连接、反向与函数作用，再解释不同纤维之间的传输。依赖和路径公式把总空间路径分解成底路径和纤维比较，高阶互换与五边形则展示这些运算的相容性。',11:'从可缩性出发，可以区分命题、集合与更高截断类型。可缩同伦纤维定义等价，三角相容的余单位修正则把这一性质与拟逆数据联系起来。',12:'宇宙把小类型组织为一个类型；单价性进一步把宇宙路径识别为等价。沿等价归纳和结构传输可逐项计算带基点对象、二元运算和幺半群的同一性。',13:'不选编号的有限类型仍保留置换对称性，其环路由对称群描述。挠子把这一现象推广到任意普通群，分类映射记录族的单值变换，标记点则把对称群限制到稳定子。',14:'退悬类型同时组织高阶群的运算与相容性，退悬上的依赖族就是作用。依赖积与依赖和分别给出同伦不动点和同伦轨道；挠子及作用群胚将这些内部公式与普通群作用联系起来。'};
function header(id,title,taxon,ch) {
  return '\\title{'+title+'}\n\\date{2026-09-25}\n\\taxon{'+taxon+'}\n\\author{author}\n\\meta{source}{[系统讲义](0210)，第 '+ch+' 章'+refsByChapter[ch].map(k=>'；[引用]('+references[k]+')').join('')+'}\n\n';
}

function writeAll() {
  const dir=path.join(root,'trees/math/topology/synthetic/types'); fs.mkdirSync(dir,{recursive:true});
  const audit={group:'types',date:'2026-09-25',sourceDirectory:path.join(source,'chapters'),chapters:chapters.map(x=>x+'.tex'),reviewStatus:'Source read completely; editorial contexts, split decisions and proof corrections reviewed individually; rendering validation recorded separately.',reviews:{},prerequisites:{},sourceCoverage:[],labels,concepts:{},crossrefs,corrections,deferred:[],existingAugmentations:[],referenceKeys:references,reused,validation:{fullForestBuild:'Not run: parent responsibility'},files:[]};
  for(const ch of data) {
    for(const u of ch.units) {
      const s=specs[u.id]; if(!s) throw new Error('Missing editorial spec '+u.id);
      if(!u.derivedFrom) for(const part of u.parts) audit.sourceCoverage.push({file:ch.name+'.tex',sourceLines:[part.start,part.end],ids:[...(reused[u.id]||[u.id]),...ch.units.filter(x=>x.derivedFrom===u.id).map(x=>x.id),...(u.id==='050C'?['05Z1']:[]),...(u.id==='0581'?['054J']:[])],notes:part.kind+'; '+(reused[u.id]?'reused canonical content; source repeated unit mapped without duplicate page':'statement/proof/remark retained; independently split components also mapped')});
      if(reused[u.id]) continue;
      let result=header(u.id,s.title,taxonOverrides[u.id]||tags[u.parts[0].kind],ch.number);
      if(s.context) result+=convert(s.context,u.id)+'\n\n';
      if(s.deps.length) result+='\\p{前置：'+s.deps.map(d=>'['+(titles[d]||existingTitles[d]||d)+']('+d+')').join('、')+'。}\n\n';
      result+=u.parts.map(part=>(part.kind==='proof'?'\\p{\\strong{证明。}}\n\n':part.kind==='remark'?'\\p{\\strong{注记。}}\n\n':'')+convert(part.body,u.id)).join('\n\n')+'\n';
      fs.writeFileSync(path.join(dir,u.id+'.tree'),result);
      audit.files.push('trees/math/topology/synthetic/types/'+u.id+'.tree');
      audit.reviews[u.id]={title:s.title,action:u.derivedFrom?'split':'integrate',reason:u.derivedFrom?'独立概念从源单位拆出，保留源范围和映射。':'保留一个源论证单位，补充局部参数和实际必要前置。',scope:s.note||'逐页审阅语境、陈述、证明步骤及所附注记；不以转换或语法检查替代数学审阅。'};
      audit.prerequisites[u.id]=s.deps;
      audit.concepts[s.title]=u.id;
    }
    const sections=[...ch.tex.matchAll(/\\section\{([^}]+)\}/g)];
    let outline=header(ch.outline,ch.title,'Outline',ch.number)+'\\p{'+narratives[ch.number]+'}\n\n';
    for(let j=0;j<sections.length;j++) {
      const start=ch.tex.slice(0,sections[j].index).split('\n').length;
      const end=j+1<sections.length?ch.tex.slice(0,sections[j+1].index).split('\n').length:Infinity;
      const ids=[...new Set(ch.units.filter(u=>u.parts[0].start>=start&&u.parts[0].start<end).sort((a,b)=>a.parts[0].start-b.parts[0].start).flatMap(u=>reused[u.id]||[u.id]))];
      outline+='\\p{'+sections[j][1]+'：'+ids.map(id=>'['+(titles[id]||existingTitles[id])+']('+id+')').join('；')+'。}\n\n';
    }
    fs.writeFileSync(path.join(dir,ch.outline+'.tree'),outline);
    audit.files.push('trees/math/topology/synthetic/types/'+ch.outline+'.tree');
    audit.reviews[ch.outline]={title:ch.title,action:'outline',reason:'仅组织原子笔记的短链接叙事，不转录章节正文。',scope:'导航顺序与源节范围逐项对应。'};
    for(const m of ch.tex.matchAll(/\\source\{[^\n]+/g))audit.sourceCoverage.push({file:ch.name+'.tex',sourceLines:[ch.tex.slice(0,m.index).split('\n').length,ch.tex.slice(0,m.index+m[0].length).split('\n').length],ids:[ch.outline],notes:'Source citation commentary preserved as source metadata with exact bibliography keys; mathematical scope retained in corresponding atoms.'});
  }
  audit.concepts['同伦等价']='05Z4'; audit.concepts['单价性']='05C6'; audit.concepts['命题']='0585';audit.concepts['集合（HoTT）']='05Z2';
  audit.existingAugmentations=[{id:'00BI',needed:'父代理可在群作用规范页添加右作用约定 x·g=g^{-1}·x 及等变映射条件；本组仅在05G9作专用右作用记法说明，未编辑规范文件。',reason:'现页只定义左作用，而挠子源文使用右作用。'}];
  const otherAudits=fs.readdirSync(path.join(root,'research')).filter(f=>/^riehl-.+\.json$/.test(f)&&f!=='riehl-types.json').map(f=>JSON.parse(fs.readFileSync(path.join(root,'research',f),'utf8')));
  const reverseLabels=Object.fromEntries(otherAudits.flatMap(a=>Object.entries(a.labels||{}).map(([label,id])=>[id,label])));
  for(const [id,deps] of Object.entries(audit.prerequisites))for(const target of deps)if(!specs[target])audit.crossrefs.push({id,target,sourceLabel:reverseLabels[target]||null,status:'resolved-canonical',kind:'necessary-prerequisite'});
  audit.crossrefs.push({id:'050N',sourceLabel:'strict-universe-existence',target:'080D',status:'resolved-canonical',kind:'external-proof-boundary',note:'严格化是外部语义输入；基础语法规则不依赖本语义说明。'});
  audit.readingEvidence={fullFilesRead:chapters.map(name=>name+'.tex'),formalSourceUnits:256,proofUnitsPreserved:true,generatedNotesReadIndividually:true,semanticCorrections:corrections.map(c=>c.id),limits:['未检验外部文献定理的原始证明；保留外部输入边界。','未执行全站构建或修改父代理全局审计。']};
  audit.files.push('research/riehl-types.json','scripts/riehl-types.mjs','scripts/riehl-types.check.mjs');
  fs.mkdirSync(path.join(root,'research'),{recursive:true});
  fs.writeFileSync(path.join(root,'research/riehl-types.json'),JSON.stringify(audit,null,2)+'\n');
  console.log(JSON.stringify({atoms:Object.keys(audit.reviews).length-6,files:audit.files.length,labels,sourceUnits:audit.sourceCoverage.length}));
}
if(process.argv.includes('--write')) writeAll();
