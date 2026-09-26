import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = '/Users/sunzy/Downloads/riehl_synthetic_lectures_source';
const out = path.join(root, 'trees/math/topology/synthetic/categories');
const chapters = {15:'15_simplicial_spaces',16:'16_segal',17:'17_covariant',18:'18_arrow_yoneda',19:'19_representability'};
const refs = {RiehlICM:'0211',RiehlContext:'0212',Hatcher:'0213',Friedman:'0214',Quillen:'0215',GoerssJardine:'0216',HoTT:'0217',Rijke:'0218',AwodeyWarren:'0219',RiehlSemantics:'021A',RiehlCatHomotopy:'021B',Rezk:'021C',RiehlShulman:'021D',YonedaFormal:'021E',RiehlVerity:'021F',GratzerWeinbergerBuchholtz:'021G',CavalloRiehlSattler:'021H',LurieHTT:'021I',ShulmanUniverses:'021J'};
const bibliography = fs.readFileSync(path.join(source,'references.tex'),'utf8');
for (const key of bibliography.matchAll(/\\bibitem\{([^}]+)\}/g)) if (!refs[key[1]]) throw Error(`Unmapped reference ${key[1]}`);
const texts = Object.fromEntries(Object.entries(chapters).map(([n,name])=>[n,fs.readFileSync(path.join(source,'chapters',name+'.tex'),'utf8').split('\n')]));
const notes = [];
if(!process.argv.includes('--regenerate-categories')) {
  throw new Error('This integration is frozen. Pass --regenerate-categories only after reviewing any subsequent manual refinements.');
}
function add(id,ch,ranges,title,prereqs,context='',extra='') {
  if (typeof ranges === 'string') ranges=ranges.split(',').map(s=>s.split('-').map(Number));
  notes.push({id,ch,ranges,title,prereqs:prereqs.split(' ').filter(Boolean),context,extra});
}

// Ranges and local contexts are editorial decisions, not inferred atomicity.
add('0600',15,'3-12','单纯空间的内外两个方向','01FX 00I1',String.raw`这里的空间指同伦类型，可用 Kan 单纯集合表示；外方向仍是单纯索引，而不是路径方向。`);
add('0601',15,'13-18','将单纯集合视为离散外形状','0600 01FR',String.raw`设 $K$ 是单纯集合。标准单形 $Delta^n$ 是可表单纯集合 $[r]\mapsto\operatorname{Hom}_\Delta([r],[n])$；边界是全部真面的并，角 $\Lambda_k^n$ 是除第 $k$ 个面外各面的并。脊柱 $I[n]$ 只保留连续边及其顶点。`);
add('0602',15,'19-21','对象路径与有向箭头不是同一种数据','0600',String.raw`设 $C$ 是单纯空间，$x,y$ 是其对象空间 $C_0$ 的点。路径 $x=y$ 表示同一性类型，路径的反向与拼接属于同伦方向；它不是模型论中一组公式的类型。`);
add('0603',15,'24-26','单纯空间的匹配对象','0600',String.raw`极限在这里具体指相容面数据的空间：对所有真面指定元素，并要求沿面包含的限制相符；退化映射不属于此匹配图表。`);
add('0604',15,'27-34','零一二次匹配对象的计算','0603',String.raw`设 $C$ 是单纯空间，$M_nC$ 是匹配对象，$\mathbf 1$ 是单点空间。`);
add('0605',15,'35-45','Reedy 纤维对象与相对匹配映射','0603 0601',String.raw`Kan 纤维化指对所有角包含 $\Lambda_k^m\hookrightarrow\Delta^m$ 有右提升性质的单纯集合映射；Kan 复形指到单点的映射为 Kan 纤维化。这里提升测试在内同伦方向进行。`);
add('0606',15,'46-55','Reedy 端点纤维计算同伦映射空间','0605 0604',String.raw`设 $C$ 是 Reedy 纤维单纯空间，$x,y\in C_0$。严格端点纤维由 $d_1(f)=x,d_0(f)=y$ 指定。使用 Kan 纤维化的拉回仍为纤维化、其严格纤维计算同伦纤维这一基础性质。`);
add('0607',15,'56-58','逐层离散单纯空间是 Reedy 纤维的','0605 0601',String.raw`离散单纯集合指一个集合在所有内次数上取相同值、全部结构映射为恒等的常值单纯集合。`);
add('0608',15,'59-61','外方向常值的 Kan 复形未必 Reedy 纤维','0605 0604',String.raw`设 $K$ 为 Kan 复形，令单纯空间 $C_n=K$ 且所有外结构映射为恒等。不要把这里的常值空间与逐层离散的外形状混淆。`);
add('0609',15,'64-69','单纯空间的 Reedy 模型结构：外部输入','0605',String.raw`模型结构指定弱等价、纤维化与余纤维化三类映射，满足两出三、收缩、提升及两种分解公理。平凡纤维化或平凡余纤维化指同时为弱等价者；纤维对象的终映射为纤维化。本页是引用的语义基础定理，并不提供一般模型结构的完整证明。`);
add('060A',15,'70-76','单纯空间的外形状指数对象','0600 0601',String.raw`记 $\mathbf{sSp}$ 为单纯空间范畴。内富集映射空间 $\operatorname{Map}_{\mathbf{sSp}}(A,C)$ 的 $m$-单形是双单纯映射 $A\times\Delta^m_{\mathrm{in}}\to C$，其中 $\Delta^m_{\mathrm{in}}$ 只在内方向变化。`);
add('060B',15,'77-82','指数伴随保留形状图表的参数','060A',String.raw`设 $K$ 为有限外形状，$C,\Gamma$ 为单纯空间，$C^K$ 为外形状指数。这里的等价在集合层是自然双射，在内富集层是映射空间同构。`);
add('060C',15,'83-88','外形状限制映射的 Reedy 纤维性','0609 060A 060B',String.raw`使用 Reedy 模型的笛卡尔推积相容性：映射 $i:A\to B$ 与 $j:U\to V$ 的推积是 $(B\times U)\cup_{A\times U}(A\times V)\to B\times V$；余纤维化的推积仍为余纤维化，一因子平凡时推积平凡。这是本证明的外部模型范畴输入，不仅是一个未带参数的映射空间断言。`);
add('060D',15,'91-100','有向同态类型','060A 060C 0602',String.raw`本页在有向内部语言中工作，$C$ 由 Reedy 纤维单纯空间解释，点和函数允许任意参数。$\operatorname{ev}_i$ 是端点求值；$\operatorname{fib}_p(b)=\sum_a(p(a)=b)$ 是同伦纤维，纤维化模型允许严格固定边界。同一性类型 $x=y$ 的元素是路径，依赖和 $\sum$ 保留对象及其数据，依赖积 $\prod$ 表示相容的依赖函数。`);
add('060E',15,'101-103','常值外形状给出恒等箭头','060D',String.raw`设 $C$ 为有向类型，$x:C$。符号 $\operatorname{id}_x$ 表示源靶都为 $x$ 的有向箭头，不是额外选择的复合单位数据。`);
add('060F',15,'104-116','路径归纳产生有向箭头','060D 060E',String.raw`设 $C$ 为有向类型，$x,y:C$。使用同一性类型的路径归纳：关于 $(x,y,p:x=y)$ 的依赖构造，只需给出 $y=x,p=\mathsf{refl}_x$ 时的数据。`);
add('060G',15,'119-124','普通范畴的离散神经与对象同构','00I0 00I1 0601',String.raw`令 $[n]$ 为对象 $0,\ldots,n$、且 $i\le j$ 时有唯一箭头 $i\to j$ 的普通范畴。神经的外结构映射由预复合给出。`);
add('060H',15,'125-132','普通范畴的分类图表','060G 00I5',String.raw`群胚指所有箭头可逆的普通范畴。群胚的神经是 Kan 复形，因此以下内层是空间；$[n]$ 是有限线序范畴。`);
add('060I',15,'133-145','分类图表中的路径是可逆交换方形','060H 00I2',String.raw`固定普通范畴 $\mathcal C$，记其分类图表为 $\mathsf R\mathcal C$；$f:x\to y$ 与 $f':x'\to y'$ 是态射，$u,v$ 为所示对象同构。`);
add('060J',15,'148-154','单纯形的脊柱','0601',String.raw`设 $n\ge 1$，$\Delta^n$ 为标准外单纯形。`);
add('060K',15,'155-162','外部 Segal 空间','0605 060J 0606',String.raw`空间等价指弱同伦等价；对于 Kan 模型，它保留连通分支与全部带基点同伦群。这里的 $C_n$ 是外次数固定后的内空间。`);
add('060L',15,'163-165','普通范畴神经的 Segal 映射为双射','060G 060K 0607',String.raw`设 $\mathcal C$ 为普通范畴，把其神经逐层视为离散空间。`);
add('060M',15,'166-178','外部二次 Segal 条件不能推出三次条件','060K 0607 060G',String.raw`这里检验的只是固定外次数的空间等价；不是指数对象在全部参数语境中的等价。`);
add('060N',15,'181-188','有向区间中的单纯形坐标','0601',String.raw`形状层的有向区间 $\mathbb I$ 表示外形状 $\Delta^1$，有端点 $0,1$ 和交并运算。它与同伦方向的路径区间不同。`);
add('060O',15,'189-201','有向二维单纯形的内角与长边','060N 060D',String.raw`设 $x,y,z:C$ 是有向类型中的点，$f:x\to y$、$g:y\to z$、$h:x\to z$ 是箭头。下图是 $\Delta^2\to C$ 的边界与一个二维单形 $\sigma$。`);
add('060P',15,'202-209','固定边界的形状延拓类型','060D 060C',String.raw`设 $C$ 为有向类型，形状包含 $K\hookrightarrow L$ 为单射。下式的 $\operatorname{fib}$ 是同伦纤维；在所用纤维模型中可用严格边界条件表示。`);

add('0610',16,'3-9','二元合成是内角延拓数据','060P 060O',String.raw`设 $C$ 为有向类型，$x,y,z:C$。此处尚不假设合成存在或唯一。`);
add('0611',16,'10-19','内部二次 Segal 条件','0610',String.raw`内部等价指在所有参数中等价，等价性可按同伦纤维可缩刻画。类型 $T$ 可缩的意思是有 $t_0:T$ 及 $\prod_{t:T}(t_0=t)$；它不是仅有一个连通分支。`);
add('0612',16,'20-27','合成预范畴的参数化脊柱条件','060J 060P 0611',String.raw`设 $C$ 为有向类型。这里每个限制映射均要求为内部等价，而不仅是外次数零处的等价；用“预范畴”避免预先加入对象的 Rezk 完备性。`);
add('0613',16,'28-33','内部二次条件与全部脊柱条件的比较','0611 0612 060M',String.raw`这是 Riehl--Shulman 单纯类型论的外部基础定理。群胚性在这里指路径到有向箭头的典范函数是等价；本页只保留源讲义提供的证明机制说明，不把它升级为完整证明。`);
add('0614',16,'36-42','合成预范畴中选定复合的构造','0612 0610',String.raw`设 $C$ 为合成预范畴，$f:x\to_C y$、$g:y\to_C z$。可缩结构本身提供中心，故以下选取是内部依赖函数，而不是外部任意选择。`);
add('0615',16,'43-52','合成预范畴的单位路径','0614 060E',String.raw`设 $C$ 为合成预范畴，复合由合成延拓类型的中心给出。等号指映射类型中的路径。`);
add('0616',16,'53-73','四面体给出复合的结合路径','0614',String.raw`设 $C$ 为合成预范畴，$x,y,z,w:C$。以下比较都发生在同一映射类型中，图中的面表示相容单形而非预设的严格交换。`);
add('0617',16,'75-83','固定脊柱后的高阶合成数据可缩','0612 060P',String.raw`设 $C$ 为合成预范畴，固定 $n\ge2$ 及箭头链 $x_0\to x_1\to\cdots\to x_n$。使用基础事实：可缩类型中的任意两点的路径类型仍可缩。`);
add('0618',16,'84-92','合成预范畴的同伦范畴','0615 0616 00I0 00G2',String.raw`这里 $\pi_0 T$ 是把类型 $T$ 的点按路径相连关系取商所得集合；语义上取对象的点及映射空间的连通分支。`);
add('0619',16,'95-97','合成预范畴之间的内部函子','0612 060D 00I1',String.raw`这是普通函子的有向内部对应物；“函数”指含全部单纯参数相容性的内部函数，不是任意对象集合映射。`);
add('061A',16,'98-112','内部函子自动保持相容合成','0619 0614 060E',String.raw`设 $C,D$ 为合成预范畴，$F:C\to D$ 为内部函子，$f:x\to y$、$g:y\to z$ 为 $C$ 中可合成箭头。`);
add('061B',16,'113-119','内部自然变换是有向形状同伦','0619 060D 00I2',String.raw`设 $C,D$ 为合成预范畴。本页定义的是内部自然变换，包含全部高阶相容；普通自然变换仅在普通范畴的特例中恢复。`);
add('061C',16,'120-132','平方三角剖分给出自然性路径','061B 0614',String.raw`设 $F,G:C\to D$ 为内部函子，$\alpha:C\times\Delta^1\to D$ 是两端为 $F,G$ 的自然变换，$f:x\to_C y$。`);
add('061D',16,'135-145','通过后复合等价定义可逆箭头','0614 0611',String.raw`设 $C$ 为合成预范畴，$x,y:C$。$\mathsf{isEquiv}(q)$ 指 $q$ 的每个同伦纤维可缩；它是一项命题，即任意两个证明相等。`);
add('061E',16,'146-151','可逆性是命题且两侧逆蕴含可逆','061D 0615 0616',String.raw`设 $f:x\to_C y$ 是合成预范畴中的箭头。使用 HoTT 中等价性为命题、命题的依赖积仍为命题及拟逆判据；拟逆是带两侧逆同伦的函数，而不是要求两侧复合定义相等。`);
add('061F',16,'152-165','由可逆性提取两侧逆箭头','061D 0615 0616',String.raw`设 $C$ 为合成预范畴，$f:x\to_C y$。等价检测路径是指其在任意两点间诱导的路径函数仍为等价。`);
add('061G',16,'168-176','路径到可逆箭头的典范比较','060F 061D 0615',String.raw`设 $C$ 为合成预范畴，$x,y:C$。下面的提升保留路径归纳在常路径处给出的恒等箭头。`);
add('061H',16,'177-183','Rezk 完备性与合成范畴','0612 061G',String.raw`本页的“类型”是有向同伦类型，不是模型论类型；完备性要求对象的同一性恰好捕捉可逆箭头。`);
add('061I',16,'184-186','偏序集神经满足 Rezk 完备性','060G 061H',String.raw`偏序关系是自反、传递且反对称的关系；把偏序集视为 $x\le y$ 时恰有一个箭头 $x\to y$ 的普通范畴。`);
add('061J',16,'187-191','非平凡群的离散神经不完备','060G 061H 060H 0001',String.raw`设 $G$ 为非平凡群，将其看作只有一个对象、箭头为群元素且复合为乘法的范畴。$BG$ 表示其分类空间，即群胚神经的同伦类型。`);
add('061K',16,'194-200,207-209','群胚类型与有向离散性','060F 0611',String.raw`设 $A$ 为有向类型，要求以下条件对每个 $a,b:A$ 在全部参数语境中成立。零截断指所有路径类型均为命题；它不是下面的有向离散性。`);
add('061L',16,'201-206','完备范畴的群胚性等价于所有箭头可逆','061K 061H 061E',String.raw`设 $C$ 为合成范畴。完备性是反向推论必不可少的假设，不能对任意离散群神经作此推论。`);
add('061M',16,'210-221','内部函数类型保持预范畴性与完备性','0612 061H 061B 060B',String.raw`设 $X$ 为有向类型，$D^X$ 为内部函数类型；当 $X$ 是预范畴时可看作内部函子类型。使用函数外延性：依赖函数之间的路径等价于逐点路径。`);

add('0620',17,'3-9','有向族的依赖箭头','060D',String.raw`本页的 $E:B\to\mathsf{Type}$ 是内部依赖类型族，总空间投影 $(x,u)\mapsto x$ 保留全部参数；$\mathsf{Type}$ 这里只表示类型层，不假设一个可任意操作的普通对象集合。`);
add('0621',17,'10-19','固定源的依赖箭头提升类型','0620',String.raw`设 $E:B\to\mathsf{Type}$ 为有向类型族，$f:x\to_B y$，$u:E(x)$。求值 $\operatorname{ev}_0$ 取依赖形状函数在源端点的值。`);
add('0622',17,'20-25','协变族的全参数提升条件','0621 0611',String.raw`设 $E:B\to\mathsf{Type}$ 为有向类型族。可缩的是允许终点变化的完整提升类型，且条件是内部条件；单纯空间语义中对应左纤维化。`);
add('0623',17,'26-32','集合值函子的元素范畴给出协变族','00I1 0622 060G',String.raw`元素范畴 $\int F$ 的对象是 $(x,u)$，态射 $(x,u)\to(y,v)$ 是满足 $F(f)(u)=v$ 的底箭头 $f:x\to y$；恒等和复合继承自底范畴。`);
add('0624',17,'35-41','协变族沿箭头的作用','0622',String.raw`设 $E:B\to\mathsf{Type}$ 协变，$f:x\to_B y$、$u:E(x)$。所取中心及提升必须作为内部依赖函数随所有数据变化。`);
add('0625',17,'42-47','协变作用的恒等律','0624 060E',String.raw`设 $E:B\to\mathsf{Type}$ 为协变族，$x:B$、$u:E(x)$。`);
add('0626',17,'48-61','可缩依赖和的纤维等价于端点路径','0611',String.raw`设 $V$ 为同伦类型，$P:V\to\mathsf{Type}$ 为依赖族。$\mathsf{tr}_P(q)$ 指沿路径 $q$ 的依赖传输，由路径归纳定义。本证明使用基点路径总空间可缩及保底映射的逐纤维等价判据。`);
add('0627',17,'62-74','协变依赖箭头的端点路径公式','0624 0626',String.raw`设 $E:B\to\mathsf{Type}$ 协变，$f:x\to_B y$，$u:E(x)$、$v:E(y)$。两边保留完整的同伦类型，不仅是存在性或连通分支。`);
add('0628',17,'77-92','协变族的纤维是群胚类型','0622 0626 061K 060E',String.raw`设 $E:B\to\mathsf{Type}$ 是协变族，固定 $x:B$ 与 $u,v:E(x)$。纤维类型中的箭头投影到底中的恒等箭头。`);
add('0629',17,'93-98','一点上的协变族恰好是群胚类型','0628',String.raw`设底为单位类型 $\mathbf1$，族的唯一纤维为有向类型 $A$。反向使用基点路径总空间 $\sum_b(a=b)$ 可缩：若路径与箭头等价，则固定源的提升总空间可缩。`);
add('062A',17,'101-107','协变族之间的内部纤维映射','0622',String.raw`内部依赖积同时编码分量及其单纯参数相容性。以下定义也记作 $\operatorname{Nat}_B(E,F)$；不要替换为在外部对象集合上任意选择分量的乘积。`);
add('062B',17,'108-117,125-127','纤维映射的自动自然性','062A 0624',String.raw`设 $E,F:B\to\mathsf{Type}$ 协变，$\alpha:\prod_{x:B}(E(x)\to F(x))$ 为内部纤维映射；上标 $E,F$ 区分两族的协变作用。`);
add('062C',17,'118-124','内部截面沿箭头自动自然','062B 0625',String.raw`设 $F:B\to\mathsf{Type}$ 协变，$s:\prod_{x:B}F(x)$ 为内部截面，$f:x\to_B y$。常值单位族是每个纤维为 $\mathbf1$ 的协变族。`);
add('062D',17,'130-136','基点固定的有向收缩','060N 060D',String.raw`这里的收缩参数是外形状 $\Delta^1$，并非同一性类型的可逆路径。`);
add('062E',17,'137-149','有向收缩底上的截面由基点决定','062D 0624 0625 062C',String.raw`设 $K$ 具有以 $k_0$ 为基点的有向收缩 $H$，记 $a_k:k_0\to k$ 为对应箭头，且 $a_{k_0}=\operatorname{id}_{k_0}$。使用依赖函数外延性将逐点路径组装成截面路径。`);
add('062F',17,'150-157','单纯形从初始顶点的显式有向收缩','060N 062D 062E',String.raw`设 $n\ge0$，$\wedge$ 表示形状区间中的交，等价于坐标的较小值；参数 $r$ 也属于有向区间。`);
add('062G',17,'160-172','三角形控制协变传输的复合','062F 062I 062C',String.raw`设 $E:B\to\mathsf{Type}$ 为协变族，$\sigma:\Delta^2\to B$ 为所给形状图表，$u:E(x)$。这里不要求底 $B$ 已有全局合成。`);
add('062H',17,'173-183','预范畴上的协变作用满足函子律','062G 0625 0614 062F',String.raw`设 $B$ 为合成预范畴，$E:B\to\mathsf{Type}$ 协变，$f:x\to y$、$g:y\to z$，$u:E(x)$。`);
add('062I',17,'186-191','协变族对拉回稳定','0622',String.raw`设 $k:A\to B$ 为内部函数；拉回族定义为 $(k^*E)(a)=E(k(a))$。`);
add('062J',17,'192-216','协变族的总空间继承预范畴性与完备性','062F 062I 0627 062H 0628 061H 061A',String.raw`设 $E:B\to\mathsf{Type}$ 协变，$\widetilde E=\sum_{x:B}E(x)$。使用依赖和路径公式 $(x,u)=(y,v)\simeq\sum_{p:x=y}(\mathsf{tr}_E(p)(u)=v)$；普通路径传输由路径归纳定义。`);
add('062K',17,'219-224','固定长边的三角形类型','0610 0614',String.raw`设 $C$ 为合成预范畴，$f:x\to y$、$g:y\to z$、$h:x\to z$。本页同时固定三条边，而合成类型只固定相邻两边。`);
add('062L',17,'225-234','固定边界三角形等价于复合路径','062K 0626 0615',String.raw`设 $C$ 为合成预范畴，$f:x\to y$、$g:y\to z$、$h:x\to z$；第二式中 $h,k:c\to y$。`);
add('062M',17,'244-268','可表族的协变性及后复合作用','062N 062L 0622 060N',String.raw`设 $C$ 为合成预范畴，固定 $c:C$，记 $R_c(x)=\operatorname{Hom}_C(c,x)$。证明用平方的两个三角形拼合，完整保留共同对角线和边界条件。`);
add('062N',17,'237-243','协变可表族','0612 060D',String.raw`“可表”在本页指此具体族的形式；其协变性是另一个结论，而不作为循环的定义前提。`);
add('062O',17,'269-278','余切片中的固定终点平方公式','062L 062M',String.raw`设 $C$ 为合成预范畴，固定 $c,x,y:C$。平方的左边为 $\operatorname{id}_c$，下边为 $f:c\to x$，上边为 $h:c\to y$，右边为 $g:x\to y$。`);

add('0630',18,'3-9','合成预范畴的余切片','062N 062M',String.raw`余切片记号 $c/C$ 表示依赖和，投影保留箭头的靶对象；它不是集合商。`);
add('0631',18,'10-29','余切片的映射类型与范畴结构','0630 062O 062J',String.raw`设 $C$ 为合成预范畴，$c:C$，$f:c\to x$、$h:c\to y$ 为余切片对象。下式中的 $g$ 及比较路径 $q$ 都是态射数据的一部分。`);
add('0632',18,'32-34,46-48','合成预范畴的初始对象','0612 0611',String.raw`可缩性指具有中心及到全部点的路径，并保留所有更高唯一性；它强于同伦范畴中的唯一态射。`);
add('0633',18,'35-45','恒等箭头是余切片的初始对象','0631 0632 0615',String.raw`设 $C$ 为合成预范畴，固定 $c:C$。使用固定终点路径总空间 $\sum_g(g=h)$ 可缩这一同一性类型事实。`);
add('0634',18,'51-74','余切片的截短箭头有向收缩','0630 062D 060N',String.raw`设 $C$ 为合成预范畴，固定 $c:C$。收缩的基点是余切片对象 $(c,\operatorname{id}_c)$。`);
add('0635',18,'77-103','协变族的依赖箭头归纳','0634 062E 062C',String.raw`设 $C$ 为合成预范畴，$c:C$；以下 $P$ 是余切片上的内部协变族，而非任意依赖族。`);
add('0636',18,'104-112','箭头归纳的延拓唯一到可缩选择','0635',String.raw`设 $C$ 为合成预范畴、$c:C$，$P:c/C\to\mathsf{Type}$ 协变，$u:P(c,\operatorname{id}_c)$。截面类型保留在基点处等于 $u$ 的路径数据。`);
add('0637',18,'115-128,134-136','路径归纳与箭头归纳的适用族不同','0634 0635 060F',String.raw`设 $A$ 为同伦类型、$a:A$，$C$ 为合成预范畴、$c:C$。比较同伦可缩与有向收缩时，必须同时说明允许传输的依赖族。`);
add('0638',18,'129-133','缺少协变性时初始点求值不等价','0622 0635 060G',String.raw`本例用普通范畴的离散神经表示有向类型；截面是投影函子的内部截面，即保底函子。`);
add('0639',18,'146-156','从可表族出发的纤维映射自然性','062A 062B 062M',String.raw`设 $C$ 为合成预范畴，固定 $c:C$，$F$ 为协变族。$\operatorname{Nat}_C(E,F)$ 记内部纤维映射类型 $\prod_{x:C}(E(x)\to F(x))$。`);
add('063A',18,'157-163','Yoneda 的恒等箭头求值函数','062A 062N 060E',String.raw`设 $C$ 为合成预范畴、$c:C$，$F:C\to\mathsf{Type}$ 协变，$R_c=\operatorname{Hom}_C(c,-)$，$\operatorname{Nat}_C$ 表示内部纤维映射类型。`);
add('063B',18,'166-207','协变合成 Yoneda 引理','063A 0635 062I 062B 062M 0625 0615',String.raw`设 $C$ 为合成预范畴，$R_c(x)=\operatorname{Hom}_C(c,x)$。下面保留两个互逆方向的计算；依赖函数外延性把逐点计算提升到整个自然变换类型。`);
add('063C',18,'210-223','Yoneda 等价关于协变族自然','063B 062B',String.raw`设 $C$ 为合成预范畴、$c:C$，$F,G$ 为协变族，$R_c=\operatorname{Hom}_C(c,-)$，$\mathsf{Yev}$ 为恒等箭头求值。`);
add('063D',18,'224-237','Yoneda 等价关于表示对象的变性','063B 062H',String.raw`设 $C$ 为合成预范畴，$F$ 协变，$c,c':C$；$R_c=\operatorname{Hom}_C(c,-)$。应区分可表族的反变性与最终元素作用的协变性。`);
add('063E',18,'240-253','协变可表族的反变全忠实形式','063B 062M',String.raw`设 $C$ 为合成预范畴，$c,d:C$，$\operatorname{Nat}_C$ 表示内部纤维映射类型。`);
add('063F',18,'256-258','反变族与固定靶的提升','0620 0621 0622',String.raw`设 $E:C\to\mathsf{Type}$ 为有向类型族。对 $f:x\to y$ 与 $v:E(y)$，要求 $\sum_{u:E(x)}\operatorname{Hom}_E^f(u,v)$ 在全部参数中可缩；作用取该中心的源分量。`);
add('063G',18,'259-274','反变合成 Yoneda 引理','063F 063B',String.raw`设 $C$ 为合成预范畴，$c:C$；此处 $\operatorname{Nat}_C(E,P)=\prod_x(E(x)\to P(x))$ 为反变族间的内部依赖函数类型。反变可表族 $\operatorname{Hom}_C(-,c)$ 沿箭头的作用为前复合。`);
add('063H',18,'277-283','单一箭头范畴上的 Yoneda 计算','063B 0623',String.raw`$[1]$ 是两个对象 $0,1$ 与唯一非恒等箭头 $0\to1$ 的普通范畴；$A,B$ 是集合，$F$ 由函数 $u:A\to B$ 给出。`);

add('0640',19,'3-10,20-22','协变族的普遍元素','0624 062N',String.raw`设 $C$ 为合成预范畴。等价性指每个同伦纤维可缩；普遍元素不是仅对连通分支满足一个集合层的唯一性。`);
add('0641',19,'11-19','普遍元素等价于可表族的自然等价','0640 063B',String.raw`设 $F:C\to\mathsf{Type}$ 是合成预范畴上的协变族，固定 $c:C$；自然变换指内部纤维映射，逐纤维等价指每个分量为类型等价。`);
add('0642',19,'25-35','普遍元素的总空间初始对象判据','0640 0632 0627 062J',String.raw`设 $C$ 为合成预范畴，$F:C\to\mathsf{Type}$ 协变，$c:C$、$u:F(c)$；$\psi_{u,x}(f)=f_*u$ 为普遍元素测试函数。`);
add('0643',19,'36-38','可表族的恒等箭头是普遍元素','0640 0633 062M',String.raw`设 $C$ 为合成预范畴，$c:C$。恒等作用由单位律给出，不需要先假设 $C$ 完备。`);
add('0644',19,'39-46','一个生成元的自由对象是普遍元素','0640 0642 00I1 0001 00BH',String.raw`这里使用普通集合值函子版本，类型等价退化为双射；“一个生成元上的自由对象”指所展示的表示性质。`);
add('0645',19,'49-54','逐纤维等价的逆自动组成自然变换','062A 062B',String.raw`设 $E,F$ 是同一有向底上的协变族。使用等价的可缩纤维中心选择逆像，以及依赖函数外延性；不使用外部逐对象任意选择。`);
add('0646',19,'55-66','协变族的表示对象唯一到可逆箭头','0641 0645 063E 061E',String.raw`设 $C$ 为合成预范畴，$F$ 协变，$R_c=\operatorname{Hom}_C(c,-)$。无需 Rezk 完备性即可得到可逆箭头，而非对象路径。`);
add('0647',19,'67-81','完备范畴中的表示数据是命题','0642 062J 061H 0632',String.raw`设 $C$ 为合成范畴，$F:C\to\mathsf{Type}$ 协变，$\psi_{u,x}(f)=f_*u$。命题指任意两点相等；有元素的命题可缩。`);
add('0648',19,'84-93','Yoneda 检测箭头及全部高阶路径','063G',String.raw`设 $C$ 为合成预范畴，$c,d:C$。后复合变换的分量把 $f:x\to c$ 送到 $a\circ f:x\to d$；自然变换相同指在其内部类型中有路径。`);
add('0649',19,'94-107','前复合与后复合都检测可逆性','061D 061E 061F 0616',String.raw`设 $C$ 为合成预范畴，$a:c\to_C d$。两类测试必须分别量化所有源对象或所有靶对象。`);
add('064A',19,'108-110','集合函数的全测试双射判据','0649',String.raw`设 $A,B$ 为集合，$f:A\to B$。这里 $\operatorname{Hom}(X,A)$ 是普通函数集合，双射条件针对每个集合 $X$。`);
add('064B',19,'113-119','高阶图表的锥类型','061M 061B',String.raw`设 $C$ 为合成预范畴，$K$ 为小索引范畴或合成预范畴，内部函数类型 $C^K$ 存在。$\Delta x$ 记取值恒为 $x:C$ 的图表，不是标准单纯形。`);
add('064C',19,'120-127,134-136','极限是锥族的表示','064B 063F',String.raw`固定图表 $D:K\to C$，其中 $C$ 为合成预范畴。$\operatorname{Cone}_D(x)$ 是顶点为 $x$ 的完整锥类型；下面的函数由指定普遍锥诱导。`);
add('064D',19,'128-133','完备范畴中极限数据唯一到可缩选择','064C 0647 063G',String.raw`设 $C$ 为合成范畴，固定小图表 $D:K\to C$；极限数据包含对象和普遍锥，而不只是极限对象。锥族对顶点由前复合成为反变族。`);
add('064E',19,'139-145','终对象是空图表的高阶极限','064C',String.raw`设 $C$ 为合成预范畴，$K$ 为空范畴。$\mathbf1$ 是单位类型，$1_C$ 则是待检验的对象，两者不是同一记号。`);
add('064F',19,'146-153','高阶二元乘积的映射类型判据','064C 00I4',String.raw`设 $A,B$ 为合成预范畴 $C$ 的对象，索引范畴为只有恒等箭头的两个点。此处的空间等价推广普通有限积的唯一配对性质。`);
add('064G',19,'154-164','高阶同伦拉回保留复合比较路径','064C',String.raw`设 $C$ 为合成预范畴，$f:A\to Z$、$g:B\to Z$。下式要求由所给投影与比较诱导的函数是自然等价，不能仅要求存在不相关的抽象等价。`);
add('064H',19,'165-174','空间中的同伦拉回依赖和公式','064G',String.raw`空间作为群胚类型理解，映射类型是函数类型；$f(a)=g(b)$ 是 $Z$ 中的路径。使用函数外延性与依赖和的分量表示。`);
add('064I',19,'177-183','伴随的自然映射空间等价','0619 061B',String.raw`设 $C,D$ 为合成预范畴。这里“在两变量中自然”指相容的内部自然等价，含高阶参数相容，而不是单独为每对对象挑选等价。`);
add('064J',19,'184-192','伴随的单位与余单位由恒等箭头转置','064I 060E',String.raw`设 $L:C\to D$、$R:D\to C$ 有伴随等价 $\Phi_{c,d}:\operatorname{Hom}_D(Lc,d)\simeq\operatorname{Hom}_C(c,Rd)$，其中 $c:C,d:D$。自然性使以下分量组成内部自然变换。`);
add('064K',19,'193-203','伴随转置的单位余单位公式','064J 061C',String.raw`设 $L\dashv R$，伴随等价为 $\Phi$、单位为 $\eta$、余单位为 $\varepsilon$，固定 $c:C,d:D$。`);
add('064L',19,'204-214','伴随单位与余单位满足三角比较','064K',String.raw`设 $L:C\to D$ 与 $R:D\to C$ 伴随，记 $\Phi,\eta,\varepsilon$ 为转置等价、单位、余单位；等号表示映射类型中的自然路径。`);
add('064M',19,'217-244','自然三角比较恢复伴随等价','064I 061C 061A 0616',String.raw`设 $L:C\to D$、$R:D\to C$ 为内部函子。假设三角路径 $\varepsilon_{Lc}\circ L(\eta_c)=\operatorname{id}_{Lc}$ 与 $R(\varepsilon_d)\circ\eta_{Rd}=\operatorname{id}_{Rd}$ 都作为自然的内部比较给出。使用拟逆判据把两侧逆同伦提升为等价。`);
add('064N',19,'245-251','空间中乘积与函数空间的伴随','064I 064J 064L',String.raw`固定空间 $A$，$B^A$ 为函数空间，$X,B$ 为可变空间。求值的输入 $u$ 为函数 $A\to B$。`);
add('064O',19,'254-268','由反变可表性构造右伴随','0647 063G 0645 064I',String.raw`设 $C,D$ 为合成预范畴且 $C$ 完备。命题截断 $\lVert T\rVert$ 只保留 $T$ 有元素的命题信息，允许消去到命题；表示数据的命题性使以下构造不需要额外全局选择。`);
add('064P',19,'271-287','右伴随保持高阶极限','064I 064C 064B',String.raw`设 $L:C\to D$ 与 $R:D\to C$ 伴随，且所用小图表及函数类型存在；保持极限指把普遍锥送到普遍锥。`);

const byId = new Map(notes.map(n=>[n.id,n]));
const crossPrerequisites = {
 '0600':'0422', '0601':'0415 0418 0419 041B 040D', '0602':'050G',
 '0605':'0421 0422', '0606':'0423', '0609':'0429 042A', '060A':'0434',
 '060B':'0434', '060D':'058E 0500 0505 0507', '060F':'050G',
 '060G':'041G', '060H':'041J', '060J':'041B', '060K':'040D',
 '0611':'0580 05Z3', '0614':'0582', '0617':'0582',
 '061C':'0911', '061D':'05Z3', '061E':'058F 0587 058I',
 '061F':'058G 058K', '061G':'050G', '061M':'050K',
 '0620':'0507', '0626':'0548 054J 058M 058I', '0629':'054J',
 '062E':'050K 058I', '062J':'054H 050G 058M', '062M':'0911 091C 054J',
 '0633':'054J', '0635':'050K', '0636':'05Z3', '0637':'054J',
 '063B':'050K 058I', '0641':'058F', '0645':'058G 050K',
 '0647':'0587 058N', '0648':'058K', '064H':'050K 0507',
 '064M':'058I', '064O':'058B'
};
Object.assign(crossPrerequisites,{'060H':'041J 0312','060A':'0434 032G 0344','060B':'0434 0344','061J':'05G8','0623':'0349 034A','063G':'0318','063B':'050K 058I 0506'});
for(const [id,deps] of Object.entries(crossPrerequisites))byId.get(id).prereqs.push(...deps.split(' '));
byId.get('060D').prereqs=byId.get('060D').prereqs.filter(x=>x!=='0602');
byId.get('0610').prereqs=byId.get('0610').prereqs.filter(x=>x!=='060O');
byId.get('0610').prereqs.push('060N','0419');
byId.get('0612').prereqs=byId.get('0612').prereqs.filter(x=>x!=='0611').concat('05Z3');
byId.get('0613').prereqs=byId.get('0613').prereqs.filter(x=>x!=='060M');
byId.get('061K').prereqs=byId.get('061K').prereqs.filter(x=>x!=='0611').concat('05Z3');
byId.get('0626').prereqs=byId.get('0626').prereqs.filter(x=>x!=='0611').concat('0580');
byId.get('0632').prereqs=byId.get('0632').prereqs.filter(x=>x!=='0611').concat('0580');
byId.get('0622').prereqs=byId.get('0622').prereqs.filter(x=>x!=='0611').concat('0580','05Z3');
byId.get('061G').prereqs.push('058I');
const revisedContexts={
 '0601':String.raw`设 $K$ 是单纯集合，使用标准单形 $\Delta^n$、边界 $\partial\Delta^n$、角 $\Lambda_k^n$ 与脊柱 $I[n]$ 的规范定义；此处将它们从集合层提升为离散空间层。`,
 '0605':String.raw`设 $C,D$ 为单纯空间，$p:C\to D$ 为映射。Kan 提升测试在内同伦方向进行；外方向的边界相容性由匹配对象记录。`,
 '0609':String.raw`采用单纯集合的 Quillen 模型结构。“余纤维化”与“上纤维化”指同一个模型范畴类，平凡表示同时为弱等价。此处把一般 Reedy 模型结构定理作为外部输入。`,
 '060D':String.raw`在有向内部语言中，$C$ 由 Reedy 纤维单纯空间解释，点和函数允许任意参数。$\operatorname{ev}_i$ 是端点求值，$\operatorname{fib}$ 采用同伦纤维定义；纤维化模型允许严格固定边界。`,
 '060A':String.raw`记 $\mathbf{sSp}$ 为单纯空间范畴。对单纯空间 $A,C$，内富集映射空间 $\operatorname{Map}_{\mathbf{sSp}}(A,C)$ 的 $m$-单形是双单纯映射 $A\times\Delta^m_{\mathrm{in}}\to C$，其中 $\Delta^m_{\mathrm{in}}$ 只在内方向变化。`,
 '060F':String.raw`设 $C$ 为有向类型，$x,y:C$。应用同一性类型的路径归纳，不对 $C$ 预设箭头复合。`,
 '060H':String.raw`设 $\mathcal C$ 为小普通范畴，$[n]$ 为有限线序范畴。群胚的神经是 Kan 复形，因此所定义图表的内层是空间。`,
 '060J':String.raw`设 $n\ge1$，$C$ 为单纯空间；将规范脊柱 $\operatorname{Sp}^n\subseteq\Delta^n$ 记为 $I[n]$。一个映射 $I[n]\to C$ 指定连续箭头及共同端点；在一般参数 $\Gamma$ 中改用 $\Gamma\times I[n]\to C$。`,
 '0611':String.raw`设 $C$ 为有向类型，$f:x\to_C y$、$g:y\to_C z$ 为可合成箭头。“内部等价”要求在所有参数中等价，等价性按同伦纤维可缩刻画，而非仅有一个连通分支。`,
 '0613':String.raw`此处把 Riehl--Shulman 单纯类型论的形状比较作为外部基础定理引用。群胚性指路径到有向箭头的典范函数是等价。`,
 '061D':String.raw`设 $C$ 为合成预范畴，$x,y:C$。$\mathsf{isEquiv}$ 使用函数等价性的可缩纤维定义；这里定义的是箭头的性质而不是任选逆箭头的数据。`,
 '061E':String.raw`设 $C$ 为合成预范畴，$f:x\to_C y$。使用等价性为命题、命题的依赖积封闭性与拟逆判据。`,
 '061F':String.raw`设 $C$ 为合成预范畴，$f:x\to_C y$。消去后复合时使用等价在路径类型上仍为等价这一性质。`,
 '061M':String.raw`设 $X$ 为有向类型，$D^X$ 为内部函数类型；当 $X$ 是预范畴时可看作内部函子类型。使用函数外延性把分量路径组装为函数路径。`,
 '061I':String.raw`设 $P$ 为偏序集，即带自反、传递、反对称关系的集合。将它视为 $x\le y$ 时有唯一箭头 $x\to y$ 的普通范畴，再取逐层离散的神经；这一普通构造见[偏序范畴](0310)。`,
 '0623':String.raw`设 $F:\mathcal C\to\mathbf{Set}$ 为小范畴上的函子，$\int F\to\mathcal C$ 取规范的元素范畴投影。将其神经逐层看作离散空间。`,
 '0626':String.raw`设 $V$ 为同伦类型，$P:V\to\mathsf{Type}$ 为依赖族；$\mathsf{tr}_P$ 表示沿路径的依赖传输。`,
 '062J':String.raw`设 $E:B\to\mathsf{Type}$ 协变，$\widetilde E=\sum_{x:B}E(x)$。完备性部分使用依赖和路径公式，将底路径和纤维内的传输比较共同识别为总空间路径。`,
 '063B':String.raw`设 $C$ 为合成预范畴，$c:C$，$R_c(x)=\operatorname{Hom}_C(c,x)$。依赖函数外延性把逐点逆计算提升到整个自然变换类型。`,
 '0630':String.raw`余切片记号 $c/C$ 表示依赖和，投影保留箭头的靶对象；它不是集合商。普通范畴的特例采用[余切片范畴](031K)，一般情形还保留三角比较的高阶路径。`,
 '064O':String.raw`设 $C,D$ 为合成预范畴且 $C$ 完备。“对每个对象可表”是内部相容的条件；若存在性用命题截断表达，表示数据的命题性允许消去该截断。`
};
for(const [id,context] of Object.entries(revisedContexts))byId.get(id).context=context;
byId.get('063B').extra=String.raw`当 $C$ 和族都来自普通范畴与集合值函子时，这个求值等价退化为[普通协变 Yoneda 双射](0341)。一般情况下等价还保留全部高阶路径。`;
byId.get('060C').extra=String.raw`[单纯模型相容性的指数形式](042C)给出内同伦方向的对应背景；这里使用的是含外形状参数的笛卡尔推积相容，二者不可不加区分地替换。`;
byId.get('064I').extra=String.raw`对于离散映射空间，恢复[普通伴随的自然双射](032K)；在空间值情形，双射被完整映射类型的等价取代。`;
byId.get('064B').extra=String.raw`[普通锥](0328)的交换条件在这里提升为相容的箭头与高阶比较；不能只在同伦范畴中指定一个锥。`;
byId.get('064C').extra=String.raw`[普通极限](0329)是离散映射空间的特例。`;
byId.get('064G').extra=String.raw`[普通范畴的拉回](0326)在离散映射空间情形恢复；一般情形必须保留式中的路径类型。`;
byId.get('060J').title='脊柱形图表只记录连续箭头';
byId.get('062J').extra=String.raw`令 $\pi:\widetilde E\to B$ 为总空间投影，$r_{\widetilde E},r_B$ 为图中水平限制，$\pi^K$ 表示逐点后复合 $\pi$。交换条件为 $\pi^{I[n]}\circ r_{\widetilde E}=r_B\circ\pi^{\Delta^n}$；它表示先限制再投影与先投影再限制相同。`;
const labels={};
for(const n of notes) {
  n.raw=n.ranges.map(([a,b])=>texts[n.ch].slice(a-1,b).join('\n')).join('\n');
  if(n.id==='060J')n.raw=String.raw`\begin{definition}
一个 $I[n]$ 形图表只指定 $n$ 条连续可合成箭头
\[
0\to1\to\cdots\to n
\]
的像，不指定长边与较高单形。脊柱本身的定义采用[标准单形的脊](041B)。
\end{definition}`;
  for(const m of n.raw.matchAll(/\\label\{([^}]+)\}/g)) labels[m[1]]=n.id;
}
const macros = {};
for (const m of fs.readFileSync(path.join(source,'main.tex'),'utf8').matchAll(/^\\newcommand\{\\(\w+)\}\{(.+)\}$/gm)) macros[m[1]]=m[2];
delete macros.source;
function expand(s) {
  return s.replace(/\\([A-Za-z]+)/g,(all,key)=>macros[key]??all).replace(/\\!/g,'');
}
const existingTitles={};
function walk(dir) {
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
}
for(const f of walk(path.join(root,'trees')).filter(f=>f.endsWith('.tree'))) {
  existingTitles[path.basename(f,'.tree')]=fs.readFileSync(f,'utf8').match(/\\title\{([^}]+)\}/)?.[1];
}
function title(id) {return byId.get(id)?.title??existingTitles[id]??id;}
const editorialReplacements = [
 ['在本讲义的内部发展中，将满足全部参数化脊柱条件','满足全部参数化脊柱条件'],
 ['后文用','分别用'],
 ['本页的','这里的'],
 ['本页定义的是','这里定义的是'],
 ['本页同时固定','此时同时固定'],
 ['“可表”在本页指','“可表”在此指'],
 ['这与前半部用单价性把结构自同构表示为宇宙环路是一致的。','这与[单价性](05C6)把结构自同构表示为宇宙环路是一致的。'],
 ['分别用 $p:x=y$ 与 $f:x\\to_Cy$ 分别表示它们。','记为 $p:x=y$ 与 $f:x\\to_Cy$。'],
 ['即使类型以后满足范畴公理','即使类型满足[Rezk 完备性](061H)'],
 ['群胚条件则会进一步识别全部箭头与路径。','[群胚条件](061K)则进一步识别全部箭头与路径。'],
 ['为了使用已建立的模型，可将每个空间再表示为单纯集合','用单纯集合表示每个空间'],
 ['后文 Riehl--Shulman 的内部二次条件','[内部二次 Segal 条件](0611)'],
 ['等价地，上述 $\\ev_0$ 是内部等价。','等价地，[固定源求值](0621) $\\ev_0$ 是内部等价。'],
 ['上述平方类型','所指定的平方类型'],
 ['若 $K$ 有上述收缩','若 $K$ 有基点固定的有向收缩'],
 ['给定上述伴随','给定伴随 $L\\dashv R$'],
 ['具有上述映射性质。','具有[同伦拉回的映射性质](064G)。'],
 ['则上述对偶可在其语义中进行','则对偶可在其语义中进行'],
 ['二者的区别正是随后完备性条件要处理的内容所列参考文献。','二者的区别由[Rezk 完备性](061H)精确表达。'],
 ['完整证明见所列参考文献。','完整证明作为所引 Riehl--Shulman 形状比较定理的外部输入。'],
 ['定理的引用只负责这两个定义的比较，以下合成、可逆性、协变族和 Yoneda 的推导都明确列出其使用条件。','这一外部输入比较两种 Segal 定义；合成、可逆性、协变族与 Yoneda 的推导均在参数化脊柱假设下进行。'],
 ['完整的一般定理见所列参考文献。','此处把一般 Reedy 模型结构定理作为外部输入。'],
 ['下一定理把这个条件与报告采用的二次定义相联系。','[内部形状比较](0613)把这个条件与二次定义相联系。'],
 ['上一章的外部 $n=2$ 条件','[外部二次条件](060M)'],
 ['上一章关于拟逆数据与等价性质的区别','同伦类型论中拟逆数据与等价性质的区别'],
 ['上一章的总空间定理','[协变族总空间定理](062J)'],
 ['上一节的收缩定理','[单纯形收缩与截面定理](062F)'],
 ['上一节初始性中的标准三角形','[恒等箭头初始性](0633)中的标准三角形'],
 ['这恢复了前一章的初始性结论。','这恢复了[恒等箭头的初始性](0633)。'],
 ['前半部用单价性把结构自同构表示为宇宙环路','单价性把结构自同构表示为宇宙环路'],
 ['本章以后','后续合成范畴论'],
 ['上节的匹配映射条件','[匹配映射条件](0605)'],
 ['这里将全部脊柱条件直接列入内部发展的假设','这里采用的[合成预范畴](0612)将全部脊柱条件直接列入假设'],
 ['后一例的完备模型','此例的完备模型'],
 ['上一证明表明','[纤维群胚性证明](0628)表明'],
 ['单位已证明。','单位律见[协变作用的恒等律](0625)。'],
 ['应用上一命题。','应用[三角形中的复合传输](062G)。']
];
function convert(raw) {
  let s=raw.replace(/\\label\{[^}]+\}/g,'').replace(/\\cite(?:\[[^\]]*\])?\{[^}]+\}/g,'所列参考文献');
  s=s.replace(/\\ref\{([^}]+)\}/g,(_,label)=>{if(!labels[label]) throw Error(`Unknown ref ${label}`);return `[${title(labels[label])}](${labels[label]})`;});
  for(const [a,b] of editorialReplacements)s=s.replaceAll(a,b);
  s=s.replace(/\\begin\{(definition|proposition|theorem|lemma|example|remark|proof)\}(?:\[[^\]]*\])?/g,(_,kind)=>'\n\n'+(kind==='proof'?'\\strong{证明。}':kind==='remark'?'\\strong{说明。}':kind==='example'?'\\strong{例。}':''));
  s=s.replace(/\\end\{(?:definition|proposition|theorem|lemma|example|remark|proof)\}/g,'\n\n');
  s=expand(s);
  const blocks=[];
  function save(block){blocks.push(block);return `\n\n@@BLOCK${blocks.length-1}@@\n\n`;}
  s=s.replace(/\\\[\s*(\\begin\{tikz(?:cd|picture)\}[\s\S]*?\\end\{tikz(?:cd|picture)\})\s*\\\]/g,(_,body)=>save(`\\figure{\\tex{\\usepackage{amsmath,amssymb}\n\\usepackage{tikz-cd}}{\n${body.replaceAll('\\ar[','\\arrow[').replace(/\\begin\{tikzcd\}(?!\[)/g,'\\begin{tikzcd}[column sep=large,row sep=large]')}\n}}`));
  s=s.replace(/\\begin\{align\*\}([\s\S]*?)\\end\{align\*\}/g,(_,body)=>save(`##{\\begin{aligned}${body}\\end{aligned}}`));
  s=s.replace(/\\\[([\s\S]*?)\\\]/g,(_,body)=>save(`##{${body.trim()}}`));
  s=s.replace(/\$([^$]+)\$/g,(_,body)=>`#{${body}}`);
  return s.split(/\n\s*\n/).map(p=>p.trim()).filter(Boolean).map(p=>{
    const m=p.match(/^@@BLOCK(\d+)@@$/);return m?blocks[Number(m[1])]:`\\p{${p}}`;
  }).join('\n\n');
}
const defaultRefs={15:['RiehlShulman','RiehlICM'],16:['RiehlShulman','Rezk','RiehlICM'],17:['RiehlICM','RiehlShulman'],18:['RiehlShulman','YonedaFormal','RiehlICM'],19:['RiehlContext','RiehlVerity']};
function header(n,taxon) {
 const cites=new Set(defaultRefs[n.ch]);
 for(const m of (n.raw??'').matchAll(/\\cite(?:\[[^\]]*\])?\{([^}]+)\}/g)) for(const key of m[1].split(',')) cites.add(key);
 return `\\title{${n.title}}\n\\date{2026-09-25}\n\\taxon{${taxon}}\n\\author{author}\n\\meta{source}{[系统讲义](0210)，第 ${n.ch} 章；${[...cites].map(k=>`[${k}](${refs[k]})`).join('，')}}\n\n`;
}
const taxons={definition:'Definition',proposition:'Theorem',theorem:'Theorem',lemma:'Theorem',example:'Example',remark:'Remark'};
const audit={group:'categories',date:'2026-09-25',sourceRoot:source,assignedChapters:Object.values(chapters).map(x=>x+'.tex'),reading:{status:'full-text-read',scope:'15--19 全部原文及 references.tex；语义审查由编辑阅读完成，非转换脚本认证。'},reviews:{},prerequisites:{},sourceCoverage:[],labels,concepts:{},crossrefs:[],corrections:[],deferred:[],existingAugmentations:[],citationKeys:refs,changedFiles:[]};
fs.mkdirSync(out,{recursive:true});
for(const n of notes) {
 const first=n.raw.match(/\\begin\{(definition|proposition|theorem|lemma|example|remark)\}/)?.[1]??'example';
 n.taxon=({'060G':'Construction','0607':'Theorem','0623':'Construction','062C':'Theorem','062F':'Construction','0604':'Construction','060J':'Construction'})[n.id]??taxons[first];
 const deps=n.prereqs.length?`\\p{所需前置：${n.prereqs.map(id=>`[${title(id)}](${id})`).join('、')}。}\n\n`:'';
 const body=header(n,n.taxon)+deps+(n.context?convert(n.context)+'\n\n':'')+convert(n.raw)+(n.extra?'\n\n'+convert(n.extra):'')+'\n';
 fs.writeFileSync(path.join(out,n.id+'.tree'),body);
 audit.reviews[n.id]={title:n.title,action:'integrated-atomic',reason:`独立问题：${n.title}。按给定原文范围保留数学数据及论证，补充局部对象与必要前置。`,scope:'指定原文数学单元；逐项阅读后人工确定拆分、条件与证明状态，未审查其外部文献证明。'};
 audit.prerequisites[n.id]=n.prereqs;
 audit.concepts[n.title]=n.id;
 for(const [a,b] of n.ranges)audit.sourceCoverage.push({file:chapters[n.ch]+'.tex',sourceLines:[a,b],ids:[n.id],notes:'保留此范围的陈述、论证、公式及解释；格式转换和局部语境补充见助手中的显式编辑表。'});
 audit.changedFiles.push(`trees/math/topology/synthetic/categories/${n.id}.tree`);
}

// The source repeats the same internal fiber-map definition in chapter 18.
audit.sourceCoverage.push({file:'18_arrow_yoneda.tex',sourceLines:[139,145],ids:['062A'],notes:'与第17章纤维映射是同一定义，复用062A；该页已引入Nat记号，自动自然性见062B。'});
audit.sourceCoverage.push({file:'18_arrow_yoneda.tex',sourceLines:[284,291],ids:['0342'],notes:'正则幺半群作用的同一计算已完整收入基础组0342，含求值公式、逆构造及等变性证明；直接复用，撤掉未定稿重复页063I。'});
audit.sourceCoverage.push({file:'19_representability.tex',sourceLines:[288,290],ids:['020J'],notes:'章末统一表示原理的叙述归入短提纲，不附着于保持极限定理。'});
audit.sourceCoverage.push({file:'15_simplicial_spaces.tex',sourceLines:[210,211],ids:['020F'],notes:'源说明的完整行范围；引用已进入来源元数据。'});
audit.sourceCoverage.push({file:'15_simplicial_spaces.tex',sourceLines:[148,154],ids:['041B','060J'],notes:'脊柱的规范定义复用041B；060J只陈述外形状图表的参数意义，不重复建立定义。'});
const outlines=[
 ['020F',15,'单纯空间与有向类型：阅读线索','先区分内同伦方向与外形状，再用 Reedy 纤维性解释带参数的映射与固定边界。最后比较普通范畴的两种神经，以及外部 Segal 条件与内部形状语言。', ['0600 0601 0602','0603 0604 0605 0606 0607 0608 0609','060A 060B 060C 060D 060E 060F','060G 060H 060I','060J 060K 060L 060M','060N 060O 060P']],
 ['020G',16,'合成范畴与相容合成：阅读线索','从可缩的内角延拓得到复合，借助高维脊柱控制相容性。内部函数自然保留这些结构；可逆性与 Rezk 完备性则区分预范畴、范畴和群胚。',['0610 0611 0612 0613','0614 0615 0616 0617 0618','0619 061A 061B 061C','061D 061E 061F 061G','061H 061I 061J','061K 061L 061M']],
 ['020H',17,'协变族与可表族：阅读线索','协变性的核心是固定源之后的完整提升可缩。由此推导群胚纤维与自动自然性，再用有向收缩证明协变传输的相容性，最终得到可表族的协变性。',['0620 0621 0622 0623','0624 0625 0626 0627','0628 0629','062A 062B 062C','062D 062E 062F','062G 062H 062I 062J','062K 062L 062N 062M 062O']],
 ['020I',18,'箭头归纳与合成 Yoneda：阅读线索','余切片的恒等箭头既初始又带显式有向收缩。对协变族，收缩给出箭头归纳和唯一性；柯里化将这一依赖原理转化为保留全部同伦信息的 Yoneda 等价。',['0630 0631 0632 0633 0634','0635 0636 0637 0638','062A 0639 063A 063B','063C 063D 063E','063F 063G','063H 0342']],
 ['020J',19,'可表性、极限与伴随：阅读线索','把普遍元素识别为总空间的初始对象，可同时解释表示的存在性和唯一性。再把锥族与伴随映射空间看作可表性问题，得到极限、伴随及右伴随保持极限。',['0640 0641 0642 0643 0644','0645 0646 0647','0648 0649 064A','064B 064C 064D','064E 064F 064G 064H','064I 064J 064K 064L 064M 064N','064O 064P']]
];
for(const [id,ch,t,intro,groups] of outlines) {
 const n={id,ch,title:t};
 let body=header(n,'Outline')+`\\p{${intro}}\n\n\\ol{\n`+groups.map(g=>`\\li{${g.split(' ').map(k=>`[${title(k)}](${k})`).join('；')}。}`).join('\n')+'\n}\n';
 if(ch===18)body+='\n\\p{箭头归纳与协变 Yoneda 对应所引 Riehl 报告的命题 6.6 与 6.7。}\n';
 fs.writeFileSync(path.join(out,id+'.tree'),body);
 audit.reviews[id]={title:t,action:'outline',reason:'短叙述组织独立原子，不作为数学前置。',scope:`第${ch}章导航及源文献说明。`};
 audit.changedFiles.push(`trees/math/topology/synthetic/categories/${id}.tree`);
 const lines=texts[ch];
 for(let i=0;i<lines.length;i++) if(/^\\(?:chapter|section|source)\{/.test(lines[i]))audit.sourceCoverage.push({file:chapters[ch]+'.tex',sourceLines:[i+1,i+1],ids:[id],notes:'章节导航或文献来源说明；数学内容按各原子条目单独覆盖。'});
}
audit.externalInputs=[{id:'0609',status:'cited-foundation',notes:'一般 Reedy 模型结构仅给出递归证明机制，完整证明未收入原文。'},{id:'060C',status:'model-compatibility-input',notes:'提升论证依赖笛卡尔推积公理；区别于仅有内方向单纯富集。'},{id:'0613',status:'cited-foundation',notes:'内部形状比较仅引用 Riehl--Shulman 第5节，不宣称完整证明。'}];
audit.crossrefs=[
 {from:'0605',concept:'Kan纤维化',sourceFile:'07_kan.tex',status:'parent-resolve-canonical',localContext:'本页给出内方向全部角的右提升条件。'},
 {from:'0609',sourceLabel:'thm:quillen',status:'parent-resolve-canonical'},
 {from:'060C',sourceLabel:'prop:SM7',status:'background-only',notes:'本页使用更强的笛卡尔推积相容，不把SM7误当成全部证明。'},
 {from:'0626',sourceLabel:'prop:based-contractible',status:'parent-resolve-canonical'},
 {from:'0626',sourceLabel:'thm:fiberwise',status:'parent-resolve-canonical'},
 {from:'062J',sourceLabel:'thm:sigma-path',status:'parent-resolve-canonical'},
 {from:'061E',sourceLabel:'thm:equiv-qinv',status:'parent-resolve-canonical'},
 {from:'064M',sourceLabel:'thm:equiv-qinv',status:'parent-resolve-canonical'},
 {from:'061J',sourceLabel:'def:univalence',status:'related-comparison-only'},
 {from:'061M',concept:'依赖函数外延性',sourceFile:'10_paths.tex',status:'parent-resolve-canonical'},
 {from:'064O',concept:'命题截断',sourceFile:'12_univalence.tex',status:'parent-resolve-canonical'}
];
audit.corrections=[
 {id:'061F',sourceLines:[164,164],reason:'源文称上一章关于拟逆，但第15章不是等价理论；改为同伦类型论中的拟逆与等价性质，不产生错误章节指向。'},
 {id:'060C',sourceLines:[86,87],reason:'明确限制指数的纤维性使用笛卡尔模型推积相容，不能仅凭内富集SM7替代。'},
 {id:'061I',reason:'原第16章同一example中的偏序与非平凡群是不同数学例子，拆为061I与061J。'},
 {id:'062A',reason:'第18章Nat定义复用第17章纤维映射，不创建同义定义。'},
 {id:'064G',reason:'显式写出映射空间等价必须由投影和锥比较诱导，排除仅有抽象等价的误读。'}
];
audit.corrections.push({removedDraft:'063I',canonical:'0342',reason:'跨组核对发现同一普通幺半群 Yoneda 计算已被完整处理，撤掉本组尚未定稿重复页，源覆盖与提纲改指0342。'});
for(const edge of audit.crossrefs) {
 const target=({'Kan纤维化':'0421','依赖函数外延性':'050K','命题截断':'058B'})[edge.concept]??({'thm:quillen':'042A','prop:based-contractible':'054J','thm:fiberwise':'058M','thm:sigma-path':'054H','thm:equiv-qinv':'058I'})[edge.sourceLabel];
 if(target){edge.target=target;edge.status='resolved-canonical';}
 if(edge.sourceLabel==='prop:SM7'){edge.target='042C';edge.status='resolved-background-not-prerequisite';}
 if(edge.sourceLabel==='def:univalence'){edge.target='05C6';edge.status='resolved-related-not-prerequisite';}
}
audit.related={
 '060C':['042C'],'061I':['0310'],'061J':['05C6'],'0630':['031K'],'063B':['0341'],'064B':['0328'],'064C':['0329'],'064G':['0326'],'064I':['032K']
};
audit.existingAugmentations=[];
audit.canonicalReuse={ordinaryCategory:'00I0',functor:'00I1',naturalTransformation:'00I2',finiteProducts:'00I4',functorCategory:'00I5',simplicialSet:'01FX',geometricRealization:'01FR',ordinaryNerve:'041G',spine:'041B',KanFibration:'0421',KanComplex:'0422',identityType:'050G',functionExtensionality:'050K',contractibility:'0580',equivalence:'05Z3'};
audit.inspectedCanonicalNotApplicable=[{id:'01FS',reason:'光滑概形上的单纯预层是专门概念，不把它误标为一般普通预层。'},{ids:['003J','00IH','012G','012U','00E0','00E2','00E3','00F8'],reason:'已阅读；本组无须复述内部群、幺半范畴、普通局部化或拓扑基础定义。'}];
audit.deferred=[{scope:'full-forest-build-and-global-audit',reason:'由主任务专属负责；本组不构建全森林、不修改全局审计或导航。外部基础定理的完整证明保持外部输入状态，不计为遗漏的原文证明。'}];
audit.changedFiles.push('scripts/riehl-categories.mjs','research/riehl-categories.json');
fs.writeFileSync(path.join(root,'research/riehl-categories.json'),JSON.stringify(audit,null,2)+'\n');
console.log(JSON.stringify({atoms:notes.length,outlines:outlines.length,labels,files:audit.changedFiles.length},null,2));
