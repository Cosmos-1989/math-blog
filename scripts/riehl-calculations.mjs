import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';

const root = '/Users/sunzy/claude_test/forester2';
const source = '/Users/sunzy/Downloads/riehl_synthetic_lectures_source/chapters';
const out = path.join(root, 'trees/math/topology/synthetic/calculations');
const auditFile = path.join(root, 'research/riehl-calculations.json');
const raw = Object.fromEntries(['a_calculations.tex','b_glossary.tex'].map(f => [f,fs.readFileSync(path.join(source,f),'utf8').split('\n')]));
const R = String.raw;
const labels = {'chap:calculations':'020N','chap:glossary':'020O','thm:circle-encode':'090G','prop:composite-fiber':'090R'};
const refs = {'thm:equiv-qinv':['058I','同伦逆判据'],'prop:based-contractible':['054J','基点路径总空间可缩性']};
const names = {
  '0500':'类型论语境','0502':'代入','0503':'定义相等','0505':'依赖积','0507':'依赖和','050G':'同一性类型','050H':'基点路径归纳','050K':'函数外延性',
  '0542':'路径的单位、逆与结合律','0544':'路径作用','0545':'路径作用的函子律','0548':'传输','0549':'传输的复合与逆','054A':'依赖路径作用','054B':'拉回族传输','054C':'端点传输','054D':'双端点传输','054F':'函数族传输','054G':'乘积路径公式','054H':'依赖和路径公式','054J':'基点路径总空间可缩性',
  '0580':'可缩类型','0582':'可缩类型的路径','0585':'命题与集合类型','0586':'有元素命题可缩','0587':'命题族的封闭性','0588':'截断性质的证明无关性','0589':'截断层次','058B':'命题截断','058E':'同伦纤维与等价','058I':'同伦逆判据','058L':'截断性的等价不变性','058M':'逐纤维等价','058N':'命题子类型的路径',
  '05C0':'类型宇宙','05C3':'同一性到等价的比较','05C6':'单价性','05C7':'单价性计算规则','05CA':'等价归纳','05CD':'二元素类型','05G0':'有限类型','05G2':'连通类型','05G4':'基点环路','05G6':'有限类型的环路','05G8':'群的分类空间','05GA':'群挠子','05GF':'挠子分类空间','05K0':'高阶群','05K8':'高阶群作用','05KE':'同伦不动点与同伦轨道',
  '00D3':'向量空间','00GM':'有限维数','00I0':'范畴','00I1':'函子','00I2':'自然变换','01FX':'单纯集合','080H':'加权极限'
};
Object.assign(names, {'00DE':'偏序集','00GC':'线性映射','00GK':'线性映射的矩阵表示','0600':'单纯空间','0605':'Reedy 纤维性','0609':'Reedy 模型结构','060A':'外形状指数对象','060C':'外形状限制的纤维性','060D':'有向同态类型','060P':'扩张类型','0612':'参数化 Segal 条件','061H':'Rezk 完备性','061K':'群胚类型','0622':'协变族','062N':'可表族','0627':'依赖箭头的端点公式','062M':'可表族的协变性','0630':'余切片','0635':'箭头归纳','063B':'合成 Yoneda 引理','0704':'有向单价性','070Q':'空间范畴','0711':'带基点空间的映射类型','071D':'函子代数的结构同态公式'});
Object.assign(names, {'0585':'命题类型','058E':'同伦纤维','05KE':'同伦不动点','05Z2':'集合类型','05Z3':'函数等价性','05Z4':'类型间的等价','05Z6':'同伦轨道','0415':'标准单形','0419':'角','041G':'范畴的神经','0421':'Kan 纤维化','0422':'Kan 复形','0429':'模型范畴','042B':'单纯集合指数对象'});
const notes = [];
function add(id,title,taxon,start,end,deps,context='',changes=[],tail='') {
  names[id]=title;
  notes.push({id,title,taxon,ranges:[[start,end]],deps,context,changes,tail,file:'a_calculations.tex'});
}

add('0900','圆周的高阶归纳规则','Definition',8,22,['050G','0505','0548','054A','05C0'],R`这里的类型是同伦类型论中的类型，不是模型论中的完备类型。设 \(\mathcal U\) 为含所需小类型的宇宙。圆周作为新的高阶归纳类型加入；其空间模型解释是外部输入，而不是下述规则自行证明的模型存在性。`);
add('0901','圆周递归把环路指定为函数数据','Theorem',24,32,['0900','050H','0544'],R`设 \(S^1\) 的生成点为 \(b\)，生成环路为 \(\ell\)，\(X\) 是任意类型。`);
add('0902','命题值族上的圆周归纳','Theorem',34,39,['0900','0585','050K'],R`设 \(P:S^1\to\mathcal U\)，\(b:S^1\) 为生成点，\(\ell:b=b\) 为生成环路。命题意为任意两元素间有路径；本结论还说明所得截面唯一到路径。`);
add('0903','圆周连通但不选择逐点路径','Theorem',41,50,['0902','058B','05G2'],R`对高阶归纳圆周 \((S^1,b,\ell)\)，记 \(\lVert A\rVert\) 为类型 \(A\) 的命题截断。`,[],R`非可缩性可进一步由[不同环路整数幂可区分](090D)看出；这个后续结论不参与本页连通性的证明。`);
add('0904','环路的整数幂','Definition',54,60,['0542','05G4'],R`设 \(A\) 为类型、\(a:A\)。路径复合 \(p\cdot q\) 表示先行 \(p\) 后行 \(q\)；\(\operatorname{refl}_a\) 表示恒等路径。`);
add('0905','环路整数幂的加法与反演公式','Theorem',62,85,['0904'],R`固定类型 \(A\) 中的点 \(a\) 与环路 \(p:a=a\)。下列等式均是同一性类型中的路径，不是一般的定义相等。`,[],R`自然数交换归纳的步骤可显式写为 \(p\cdot p^{r+1}=(p\cdot p^r)\cdot p=(p^r\cdot p)\cdot p=p^{r+1}\cdot p\)。若 \(p\cdot u=u\cdot p\)，在两边适当乘 \(u^{-1}\) 得 \(p\cdot u^{-1}=u^{-1}\cdot p\)，故上述交换也适用于负幂。负向加法归纳为 \(p^{m+n-1}=p^{m+n}\cdot p^{-1}=p^m\cdot(p^n\cdot p^{-1})=p^m\cdot p^{n-1}\)。`);
add('0908','变动定义域时函数传输是前复合','Example',99,105,['054F','05C3'],R`设 \(\mathcal U\) 为类型宇宙，\(Z\) 为固定类型。函数族公式中用 \(D(T)=T\)、\(E(T)=Z\) 表示定义域族与值域族，以免与下面作为宇宙元素的 \(A,B\) 混淆。`,[[R`取 $X=\U$，$A$ 为恒等族，$B$ 为常值类型 $Z$。`,R`取 $X=\U$，定义域族为恒等族 $D$，值域族为常值族 $E$。`]]);
add('0909','圆周上的整数编码族','Construction',109,119,['0901','05C6'],R`设圆周的生成元为 \(b:S^1\)、\(\ell:b=b\)。记 \(\operatorname{ua}\) 为单价比较 \(\operatorname{idtoequiv}:(A=B)\to(A\simeq B)\) 的逆。宇宙层级取到足以容纳 \(\mathbb Z\) 与这条宇宙路径。`);
add('090A','整数编码族沿环路的传输','Theorem',121,140,['0909','0905','0549','054B','05C7'],R`令 \(\mathsf{Code}:S^1\to\mathcal U\) 为纤维 \(\mathsf{Code}(b)=\mathbb Z\)、生成环路对应后继等价的整数编码族；\(\operatorname{tr}\) 表示该族的传输。`);
add('090B','圆周编码族的纤维都是集合','Theorem',142,147,['0909','0902','0588'],R`固定整数编码族 \(\mathsf{Code}:S^1\to\mathcal U\)。\(\operatorname{isSet}(A)\) 意为 \(A\) 任意两点的路径类型为命题，整数使用其通常集合类型结构。`);
add('090C','圆周路径的编码','Construction',149,156,['0909','0548'],R`设 \(\mathsf{Code}\) 为圆周上的整数编码族，\(b\) 为圆周生成点，\(\mathsf{Code}(b)=\mathbb Z\)，故 \(0\) 是基点纤维中的元素。`);
add('090D','圆周的不同环路整数幂可区分','Example',158,160,['090C','090A'],R`设 \(b:S^1\)、\(\ell:b=b\) 为高阶归纳圆周的生成元。整数幂按[环路幂运算](0905)解释。`,[],R`特别地 \(\ell\ne\operatorname{refl}_b\)，因为二者的编码分别为 \(1\) 与 \(0\)。因此 \(S^1\) 不可缩：可缩类型的任意两点之间的路径类型可缩，便会迫使这两条环路相等。此处用到[可缩类型的路径可缩](0582)。`);
add('090E','圆周解码函数的相容性计算','Construction',164,188,['0900','0909','0905','090A','054F','054C','050K'],R`设 \(b,\ell\) 为圆周的生成元，\(\mathsf{Code}\) 为整数编码族。依赖消去需要的不只是基点函数，还需要它绕生成环路传输后保持不变。`);
add('090F','先编码后解码恢复圆周路径','Theorem',190,204,['090C','090E','050H'],R`固定圆周生成点 \(b\) 及[编码](090C)、[解码](090E)。这里归纳时终点 \(x\) 必须与 \(q:b=x\) 一起变化；不能只对固定端点的任意环路套用基点路径归纳。`);
add('090H','先解码后编码恢复整数编码','Theorem',206,224,['090C','090E','090A','090B','0902','0587'],R`设 \(\mathsf{Code}:S^1\to\mathcal U\) 为整数编码族，\(\mathsf{encode}\) 和 \(\mathsf{decode}\) 为相应编码与解码函数。`);
add('090G','圆周的编码解码等价','Theorem',226,245,['090F','090H','0905','058I'],R`设 \(b:S^1\)、\(\ell:b=b\) 为圆周生成元，\(\mathsf{Code}\) 为整数编码族。环路空间记为 \(\Omega(S^1,b)=(b=b)\)。`);
add('090I','圆周是一型且高阶环路可缩','Theorem',247,258,['090G','090B','0903','0589','058L','0586'],R`对高阶归纳圆周 \((S^1,b,\ell)\)，一型意为所有路径类型都是集合。二重环路的基点为一次环路空间中的恒等环路。`);
add('090J','整数编码族的总空间可缩','Theorem',260,275,['090G','058M','054J','058L'],R`令 \(\mathsf{Code}:S^1\to\mathcal U\) 为圆周整数编码族，\(b\) 为圆周生成点。这里的可缩性针对总空间，不是逐纤维的可缩性。`);
add('090K','圆周映射由一个点与一条环路分类','Theorem',279,295,['0901','0900','054D','050K','058I'],R`固定高阶归纳圆周的生成元 \(b:S^1\)、\(\ell:b=b\)。设 \(X\) 为任意类型。右侧依赖和记录一个点及以它为基点的环路，不把这些环路作连通分支截断。`);
add('090M','带基点圆周映射等价于环路','Theorem',305,318,['090K','054H','054D','058E'],R`设 \(b:S^1\)、\(\ell:b=b\) 为圆周生成元，\((X,x)\) 为带基点类型。带基点映射的数据记为 \(\operatorname{Map}_*((A,a),(X,x))=\sum_{f:A\to X}(f(a)=x)\)；第二分量是指定路径而不只是命题性的保基点条件。`);
add('090N','带基点圆周映射的次数','Definition',320,322,['090M','090G'],R`设 \((f,q)\) 为圆周 \((S^1,b)\) 的带基点自映射，其中 \(q:f(b)=b\)。它在生成环路 \(\ell\) 上诱导 \(q^{-1}\cdot\operatorname{ap}_f(\ell)\cdot q\)。`,[],R`因而次数的显式公式是 \(\deg(f,q)=\mathsf{encode}_b(q^{-1}\cdot\operatorname{ap}_f(\ell)\cdot q)\in\mathbb Z\)。`);
add('090O','圆周映射次数的乘法公式','Theorem',324,340,['090N','090M','0905','0545'],R`设 \((f,q),(g,r):(S^1,b)\to(S^1,b)\) 为带基点映射，复合的基点路径为 \(\operatorname{ap}_g(q)\cdot r:g(f(b))=b\)。记 \(f_*(p)=q^{-1}\cdot\operatorname{ap}_f(p)\cdot q\)，\(g_*\) 同理。公式 \(\deg(g\circ f)\) 略去但保留这条指定的基点路径。`,[],R`这使 \((g\circ f)_*=g_*\circ f_*\)：展开两边并用路径作用保持复合，再消去相邻的逆路径即可。幂的幂公式 \((\ell^n)^m=\ell^{nm}\) 在 \(m=0\) 成立；正向一步用[整数幂加法公式](0905)，负向一步用反演公式，故适用于全部整数而不只正整数。`);
add('090P','二维环面的环路群计算','Example',342,350,['090G','054G'],R`设 \((S^1,b,\ell)\) 为高阶归纳圆周。记 \(\Omega(X,x)=(x=x)\)，并以路径复合作为环路运算。`);
add('090Q','圆周上的空间族由自等价分类','Example',352,358,['090K','05C6','05CD'],R`令 \(\mathcal U\) 为单价宇宙，\(S^1\) 为高阶归纳圆周。宇宙作为目标时，在更大宇宙中应用映射空间定理；右侧只分类 \(\mathcal U\)-小纤维。`,[],R`这里的“二重覆盖”是具有二元素纤维且生成环路交换两点的类型族；把它解释成具体拓扑覆盖还须使用相应空间模型，不凭族的符号单独推出任意拓扑空间上的局部平凡性。`);
add('090S','依赖和投影的同伦纤维','Theorem',362,376,['0507','0548','050H','058E','058I'],R`给定类型 \(B\)、类型族 \(E:B\to\mathcal U\) 及点 \(b:B\)。\(\operatorname{fib}_p(b)=\sum_{z:\sum_xE(x)}(p(z)=b)\) 记录总空间点及到指定底点的路径。`);
add('090R','复合映射的同伦纤维分解','Theorem',378,397,['058E','0544','054H','050H','058I'],R`给定类型 \(A,B,C\)、函数 \(f:A\to B\)、\(g:B\to C\)。同伦纤维记为 \(\operatorname{fib}_h(y)=\sum_x(h(x)=y)\)，路径乘积按先左后右的顺序复合。`);
add('090T','后复合等价只重定位同伦纤维','Example',399,401,['090R','0580','058E','0588'],R`设 \(f:A\to B\)、\(g:B\simeq C\)，并固定 \(c:C\)。令 \(((b_0,q_0),H)\) 为 \(\operatorname{fib}_g(c)\) 的收缩数据。`,[],R`一般地，可缩类型 \(T\) 的中心为 \(t_0\)，收缩为 \(h_t:t_0=t\) 时，\(\sum_{t:T}E(t)\simeq E(t_0)\) 的正向映射为 \((t,u)\mapsto\operatorname{tr}^E_{h_t^{-1}}(u)\)，反向为 \(v\mapsto(t_0,v)\)。收缩空间的路径可缩，故这两个复合由传输律和收缩的相容路径化为恒等。此处取 \(E(b,q)=\operatorname{fib}_f(b)\)。`);
add('090U','同伦拉回粘合的路径计算','Theorem',403,427,['0507','0544','050H','058I'],R`设 \(A,B,C,D\) 为类型，\(f:A\to C\)、\(g:B\to C\)、\(k:D\to B\)。同伦拉回以“两个点加一条像之间的路径”的依赖和表示，而非省去路径数据的集合纤维积。`);
add('090V','同伦嵌入由命题纤维定义','Definition',431,433,['058E','0585'],R`设 \(A,B\) 为同伦类型论中的类型。\(\operatorname{fib}_f(b)=\sum_{a:A}(f(a)=b)\) 为同伦纤维，命题意为任意两元素间有路径，可为空。`);
add('090W','路径作用的纤维是纤维中的路径','Theorem',435,449,['054H','054D','058E','0542'],R`设 \(f:A\to B\) 为函数。记 \(\operatorname{ap}_f\) 为它在同一性类型上的作用，\(\operatorname{fib}_f(b)=\sum_{a:A}(f(a)=b)\)。以下等价保留高阶路径，不只是两边同时有元素。`);
add('090X','同伦嵌入的路径等价判据','Theorem',451,472,['090V','090W','0582','0586','054H'],R`设 \(f:A\to B\) 为类型间函数，\(\operatorname{ap}_f\) 是路径作用；等价采用“每个同伦纤维可缩”的定义。`);
add('090Y','忘记命题性质是同伦嵌入','Example',474,480,['090S','090X','058N'],R`设 \(A\) 为类型，\(P:A\to\mathcal U\) 为命题值族，\(a,b:A\)，\(u:P(a)\)、\(v:P(b)\)。这里应用已有的命题子类型路径定理，并用同伦嵌入统一解释。`);
add('090Z','沿等价重标记依赖和','Theorem',482,491,['0507','05CA'],R`设 \(A,B\) 为同一单价宇宙中的类型，\(e:A\simeq B\) 为等价。本页使用单价性导出的等价归纳，族 \(P\) 也随底类型一起变化。`);
add('0910','单形乘积中的格路径','Definition',495,497,[],R`设 \(p,q\) 为非负整数，\([p]=\{0,1,\ldots,p\}\) 按通常大小排序。积偏序规定 \((i,j)\le(k,l)\) 当且仅当 \(i\le k\) 且 \(j\le l\)；链是其中任意两点可比较的有序顶点列。`);
add('0911','单形乘积的格路径三角剖分','Theorem',499,519,['0910','01FX'],R`设 \(p,q\ge0\)。标准单形 \(\Delta^n\) 的 \(r\)-单形是保序映射 \([r]\to[n]\)。偏序集 \(P\) 的神经 \(N(P)\) 的 \(r\)-单形是弱递增链 \(x_0\le\cdots\le x_r\)，非退化单形则为严格链。积中两坐标的链恰好组成积偏序的链，所以神经在此保持乘积。`);
add('0912','单纯正方形的两个三角形','Example',521,536,['0911'],R`在单纯集合中考虑 \(\Delta^1\times\Delta^1\)。\(C\) 表示作为映射目标的单纯集合；若使用有向类型语言，则它表示相应的形状目标。`,[],R`图中的两条边复合均由相应三角形与共同对角边比较。在普通范畴神经的特例，等价的文字等式为 \(h_{(1,0),(1,1)}\circ h_{(0,0),(1,0)}=h_{(0,1),(1,1)}\circ h_{(0,0),(0,1)}=h_{(0,0),(1,1)}\)。一般单纯或 Segal 目标保留三角形相容数据，不能把这些数据直接当作严格等式。`);
add('0913','单纯三角柱的三个四面体','Example',538,553,['0911'],R`考虑 \(\Delta^2\times\Delta^1\)。顶点 \((i,j)\) 位于偏序集 \([2]\times[1]\)；方括号列出的严格链确定非退化单形。最后关于结合律的解释适用于具有 Segal 合成的目标。`);
add('0914','映出形状的并等于相容映射的拉回','Theorem',555,566,['01FX'],R`设 \(K_1,K_2\) 为单纯集合 \(K\) 的子对象，\(L=K_1\cap K_2\)。对单纯集合 \(C\)，指数记为 \((C^J)_n=\operatorname{Hom}(\Delta^n\times J,C)\)；右侧拉回要求两个限制到 \(L\) 的映射严格一致。`,[[R`若 $C$ Reedy 纤维且上述包含为单射，对所得到的映射空间取纤维时，右侧的普通拉回也计算相应同伦拉回。`,''],[R`纤维性使沿单射的限制映射成为纤维化。沿纤维化的拉回具有同伦拉回的正确同伦类型，因而这里可以用严格一致的映射计算同伦相容的映射。若缺少这个纤维性条件，不能直接作后一解释。`,R`同一个逐参数论证适用于单纯空间的外形状映射对象。何时这个严格拉回也具有同伦拉回的意义，另见[Reedy 纤维目标中的形状粘合](091C)。`]]);
add('091C','Reedy 纤维目标中的形状粘合','Theorem',560,565,['0914'],R`本页区分模型假设。设 \(C\) 是 Reedy 纤维的单纯空间，\(K=K_1\cup_LK_2\) 为单纯集合的子对象并；把 \(K_i,L\) 当作离散外形状。记 \(\operatorname{Map}(J,C)\) 为参数单纯方向上的映射空间。假设使用标准 Reedy 模型结构及沿形状单射的限制纤维化定理。`,[],R`此处用到的模型论事实是外部输入：Reedy 纤维目标沿单射的限制是 Kan 纤维化，相关映射空间为 Kan 复形；Kan 复形间沿纤维化的普通拉回计算同伦拉回。它们的完整模型结构证明不在本计算中重证。`);
add('0915','自然线性算子族由一个矩阵恢复','Example',570,594,['00D3','00GM','00I2'],R`固定域 \(k\)，所有向量空间与线性映射均在 \(k\) 上。\(\operatorname{Hom}(V,X)\) 表示线性映射集合，并有逐点线性空间结构；\(\operatorname{Nat}\) 表示集合值函子间的自然变换。`,[],R`反向地，任意线性映射 \(M:W\to V\) 给出 \(\alpha_X(A)=A\circ M\)，因为结合律保证 \(T\circ(A\circ M)=(T\circ A)\circ M\)。在 \(\operatorname{id}_V\) 处评价又恢复 \(M\)，从而所列对应确为双射。自动线性也可逐项检查：\(\alpha_X(aA+bB)=(aA+bB)M=aAM+bBM\)。`);

// These edits record the mathematical reading of each source unit.
const edits = {
  '0903':[['应用上一引理。','应用[命题值族上的圆周归纳](0902)。'],['下面的环路计算表明这不成立。','[环路整数幂的区分](090D)表明这不成立。']],
  '0905':[['正文的路径归纳','[路径归纳](050H)']],
  '090G':[['两个引理说明','[先编码后解码](090F)和[先解码后编码](090H)说明']],
  '090E':[['存在依赖函数','对每个 $x:S^1$，存在相容的依赖函数']],
  '090I':[['定理说明','[编码解码等价](090G)说明']],
  '090M':[['上一映射空间等价','[圆周映射空间等价](090K)']],
  '090O':[['由映射空间等价，','由[带基点映射与环路的等价](090M)，']],
  '090Q':[['上面的编码族','[整数编码族](0909)']],
  '090S':[['向量 $((x,u),q)$','元素 $((x,u),q)$']],
  '090T':[['上式表明','[复合纤维分解](090R)表明']],
  '090X':[['上一引理因而说明','[路径作用的纤维公式](090W)因而说明']]
};
for(const n of notes) n.changes.push(...(edits[n.id]||[]));
const note=id=>notes.find(n=>n.id===id);
note('0905').deps.push('050H');
note('090D').deps.push('0905','0582');
note('090I').deps.push('0582','0588');
note('090B').deps.push('05Z2');
note('090T').deps.push('0582','0549','054H','05Z4');
note('090X').deps.push('05Z3');
note('0910').deps.push('00DE');
note('0911').deps.push('0415','041G');
note('0914').deps.push('042B');
note('0915').deps.push('00GC','00GK');
note('091C').deps.push('0605','0609','060A','060C');
note('090M').tail=R`这个依赖和也是[带基点空间范畴中的映射类型](0711)的公式；这里的圆周计算仅使用它的依赖类型数据，不需要有向范畴语义。`;
note('0912').tail=note('0912').tail.replace('等价的文字等式为',R`记图中从顶点 \(u\) 到 \(v\) 的箭头像为 \(h_{u,v}\)，则文字等式为`);
note('0913').tail=R`非相邻四面体的交具体为 \(T_0\cap T_2=[(0,0),(2,1)]\)。`;

function balancedReplace(text, macro, fn) {
  const needle='\\'+macro;
  let cursor=0;
  while ((cursor=text.indexOf(needle,cursor))>=0) {
    const s=cursor+needle.length;
    if (/[A-Za-z]/.test(text[s]||'')) {cursor=s;continue;}
    let begin=s; while (/\s/.test(text[begin]||'')) begin++;
    if (text[begin]!=='{') throw new Error('Expected grouped argument: '+text.slice(cursor,cursor+60));
    let end=begin+1, depth=1;
    while (depth && end<text.length) {if(text[end]==='{')depth++;if(text[end]==='}')depth--;end++;}
    const replacement=fn(text.slice(begin+1,end-1));
    text=text.slice(0,cursor)+replacement+text.slice(end); cursor+=replacement.length;
  }
  return text;
}
function convert(text) {
  text=text.replace(/\\label\{[^}]+\}/g,'');
  text=text.replace(/(?:定理|命题)?~?\\ref\{([^}]+)\}/g,(_,k)=>{if(!refs[k])throw Error('Unresolved '+k);return `[${refs[k][1]}](${refs[k][0]})`;});
  text=text.replace(/\\cite\{HoTT,Rijke\}/g,'[《同伦类型论》](0217)与 [Rijke 的同伦类型论导论](0218)');
  text=balancedReplace(text,'trunc',s=>R`\lVert ${s}\rVert`);
  const macro={U:R`\mathcal U`,Z:R`\mathbb Z`,N:R`\mathbb N`,tr:R`\operatorname{tr}`,ap:R`\operatorname{ap}`,refl:R`\operatorname{refl}`,idtoequiv:R`\operatorname{idtoequiv}`,ua:R`\operatorname{ua}`,isSet:R`\operatorname{isSet}`,fib:R`\operatorname{fib}`,Map:R`\operatorname{Map}`,Hom:R`\operatorname{Hom}`,Nat:R`\operatorname{Nat}`,id:R`\operatorname{id}`,Pi:R`\prod`,Sigma:R`\sum`};
  text=text.replace(/\\([A-Za-z]+)/g,(s,k)=>macro[k]||s);
  text=text.replace(/\\begin\{(?:definition|theorem|proposition|lemma|example)\}(?:\[[^\]]*\])?/g,'');
  text=text.replace(/\\end\{(?:definition|theorem|proposition|lemma|example|proof|remark)\}/g,'\n\n');
  text=text.replace(/\\begin\{proof\}/g,'\n\n证明。');
  text=text.replace(/\\begin\{remark\}(?:\[[^\]]*\])?/g,'\n\n说明。');
  const chunks=[];
  const stash=s=>{chunks.push(s);return `\n\n@@BLOCK${chunks.length-1}@@\n\n`;};
  text=text.replace(/\\\[\s*(\\begin\{tikzcd\}[\s\S]*?\\end\{tikzcd\})\s*\\\]/g,(_,s)=>stash('\\figure{\\tex{\\usepackage{tikz-cd}}{\n'+s+'\n}}'));
  text=text.replace(/\\begin\{align\*\}([\s\S]*?)\\end\{align\*\}/g,(_,s)=>stash('##{\\begin{aligned}\n'+s.trim()+'\n\\end{aligned}}'));
  text=text.replace(/\\\[([\s\S]*?)\\\]/g,(_,s)=>stash('##{'+s.trim()+'}'));
  text=text.replace(/\$([^$]*?)\$/g,(_,s)=>'#{'+s+'}').replace(/\\\(([\s\S]*?)\\\)/g,(_,s)=>'#{'+s+'}');
  return text.split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean).map(s=>{
    const match=s.match(/^@@BLOCK(\d+)@@$/);return match?chunks[Number(match[1])]:'\\p{'+s.replace(/\n/g,' ')+'}';
  }).join('\n\n');
}
function header(n,appendix='A') {
  return R`\title{${n.title}}
\date{2026-09-25}
\taxon{${n.taxon}}
\author{author}
\meta{source}{[系统讲义](0210)，附录 ${appendix}${n.id==='0900'?'；[HoTT](0217)，[Rijke](0218)':''}}

`;
}
function link(id,label=names[id]){return `[${label||id}](${id})`;}
const guides=[];
function guide(id,title,ranges,body){names[id]=title;guides.push({id,title,taxon:'Outline',ranges,body,file:'b_glossary.tex'});}
guide('0916','五类关系与路径复合方向',[[6,29]],R`\p{设 \(A,B\) 为类型，\(C\) 为范畴。路径记号中的 \(a,b\) 属于 \(A\)；箭头记号中的 \(a,b\) 则是 \(C\) 的对象。相同字母在不同条目中并不共用语境。}
\ul{
\li{${link('0503')}：\(a\equiv b\) 是展开和计算后的判断相等，不是等待构造元素的类型。}
\li{${link('050G')}：\(p:a=_A b\) 是路径，可反演、合成、传输并使用${link('050H')}。}
\li{有向箭头 \(f:a\to_C b\) 通常不可逆；其归纳需要协变族等条件，不能直接套用路径归纳。}
\li{${link('058E')}：\(e:A\simeq B\) 含函数及纤维可缩的证明；${link('05C6')}把它对应到宇宙路径。}
\li{普通${link('00I0')}中的同构 \(x\cong y\) 表示可逆箭头；在 Rezk 类型中，可逆箭头与对象路径等价。}
}
\p{路径 \(p\cdot q\) 先行 \(p\) 后行 \(q\)，函数 \(g\circ f\) 先行 \(f\) 后行 \(g\)。因此${link('0549')}满足 \(\operatorname{tr}_{p\cdot q}=\operatorname{tr}_q\circ\operatorname{tr}_p\)。把环路 \(p:x=x\) 的两端沿 \(r:x=y\) 移动，${link('054D')}给出 \(r^{-1}\cdot p\cdot r:y=y\)。}
`);
guide('0917','同伦类型论术语定位',[[31,60]],R`\p{本指南中的“类型”是同伦类型论的类型，不是模型论的完备类型。下列短释用于定位既有定义。}
\ul{
\li{${link('0500','语境（context）')}是按依赖顺序排列的变量声明，语义中是参数空间；${link('0502','代入（substitution）')}将参数函数代入依赖表达式，语义中对应拉回。}
\li{${link('0507','依赖和（dependent sum）')} \(\sum_{x:A}B(x)\) 是总空间，元素为 \((x,b)\)、\(b:B(x)\)；${link('0505','依赖积（dependent product）')} \(\prod_{x:A}B(x)\) 是相容截面的空间。}
\li{${link('050G','同一性类型（identity type）')} \(x=_Ay\) 不预设为命题，具有 \(\operatorname{refl}_x\) 与${link('050H','路径归纳（path induction）')}；基点形式要求终点和路径共同变化。}
\li{${link('0548','传输（transport）')}沿 \(p:x=y\) 给出 \(B(x)\simeq B(y)\)；${link('050K','函数外延性（function extensionality）')}将函数路径与逐点路径的依赖积比较为等价。}
\li{${link('0580','可缩类型（contractible type）')}有中心及到每点的路径：\(\sum_{a:A}\prod_{x:A}(a=x)\)。${link('0585','命题（proposition）')}中任意两点相等，可以为空；有元素则可缩。}
\li{${link('0585','集合类型（set, 0-type）')}的路径类型都是命题，不要求自身只有一个点；${link('0589','n 型（n-type）')}递归地要求路径类型为上一截断层次。}
\li{${link('058B','命题截断（propositional truncation）')} \(\lVert A\rVert\) 保留存在性，不选择元素，只能无条件消去到命题目标。}
\li{${link('058E','同伦纤维（homotopy fiber）')} \(\operatorname{fib}_f(b)=\sum_{a:A}(f(a)=b)\) 保留像的比较路径；${link('058E','等价（equivalence）')}要求全部纤维可缩，具有同伦逆且等价性是命题。}
\li{${link('05C6','单价性（univalence）')}要求 \((A=B)\to(A\simeq B)\) 为等价；${link('05C0','宇宙（universe）')}按尺度分类小类型与小空间族，大小问题需要宇宙层级。}
\li{${link('05G8','分类空间（classifying space）')} \(BG\) 是满足 \(\Omega BG\simeq G\) 的带基点连通一型；${link('05GA','挠子（torsor）')}为截断非空且自由传递的群作用集合，不选基点。}
\li{${link('05K0','高阶群（higher group）')}由带基点连通类型 \(BG\) 表示，底层类型是 \(\Omega BG\)；${link('0900','高阶归纳类型（higher inductive type）的圆周实例')}允许点与更高路径层次的构造元。}
}
`);
guide('0918','单纯对象与合成范畴术语定位',[[63,92]],R`\p{以下 \(C\) 为相应的范畴或合成预范畴，\(c:C\)，\(F\) 为 \(C\) 上的协变族；\(\mathcal S\) 表示空间分类对象，\(A,B\) 是其中的小空间。标准单形的维数为 \(n\)，角索引满足 \(0\le k\le n\)。空间中的路径与范畴中的有向箭头不可混同。}
\ul{
\li{${link('01FX','单纯集合（simplicial set）')}是 \(\Delta^{\mathrm{op}}\to\operatorname{Set}\) 的函子，具有面与退化映射。单纯空间（simplicial space）是 \(\Delta^{\mathrm{op}}\to\mathbf{Spaces}\) 的函子，此处以双单纯集合建模，两方向角色不同。}
\li{角（horn）\(\Lambda^n_k\) 是标准单形所有余维一面中除第 \(k\) 面以外的面的并，编码部分数据。Kan 复形（Kan complex）填充所有角；Kan 纤维化（Kan fibration）对角包含满足右提升性质，提升底单形上已给的部分数据。}
\li{模型范畴（model category）有弱等价、余纤维化、纤维化及分解和提升公理。Reedy 纤维性（Reedy fibrancy）要求逐维到匹配对象的映射为纤维化。}
\li{扩张类型（extension type）为固定边界取值的形状映射类型，是限制映射的纤维。Segal 条件（Segal condition）要求到可复合脊线的限制为等价，因而复合填充数据可缩。}
\li{Rezk 完备性（Rezk completeness）把对象路径比较到可逆箭头的映射规定为等价。群胚型（groupoidal type）要求路径到一般箭头为等价；仍可具有任意高阶同伦，并不等于集合。}
\li{协变族（covariant family）要求给定底箭头和起点纤维元素后的提升空间可缩。左纤维化（left fibration）是其外部模型，每个底单形的提升由初始顶点的纤维数据决定到可缩选择。}
\li{可表族（representable family）是 \(x\mapsto\operatorname{Hom}_C(c,x)\) 或逆变对偶。余切片范畴（coslice category）\(c/C=\sum_x\operatorname{Hom}_C(c,x)\) 的初始对象为 \(\operatorname{id}_c\)。}
\li{箭头归纳（arrow induction）说 \(c/C\) 上协变族的截面由恒等箭头处的值决定到可缩选择。Yoneda 引理（Yoneda lemma）通过恒等箭头处求值，将从可表族到协变族 \(F\) 的自然变换空间等价于 \(F(c)\)。}
\li{有向单价性（directed univalence）比较空间分类对象中的箭头与函数：\(\operatorname{Hom}_{\mathcal S}(A,B)\simeq(A\to B)\)。}
\li{结构同一性原理（structure identity principle）用保持结构的等价描述结构对象间路径，依赖普通单价性。结构同态原理（structure homomorphism principle）用保持结构的一般函数描述箭头，需要相关结构构造的协变性。}
\li{${link('080H','加权极限（weighted limit）')}用权重指定锥的参数化方式，单纯权重还记录高阶相容性。}
}
`);
guide('0919','空间部分的公式定位',[[96,110]],R`\p{给定类型 \(A,B\)、类型族 \(E:A\to\mathcal U\)、\((x,u),(y,v):\sum_aE(a)\) 及函数 \(f:A\to B\)，首先查阅${link('054H')}、${link('058E')}及${link('058I')}：}
##{((x,u)=(y,v))\simeq\sum_{p:x=y}(\operatorname{tr}^{E}_p(u)=v),\qquad \operatorname{fib}_f(b)=\sum_{a:A}(f(a)=b).}
##{\operatorname{isEquiv}(f)=\prod_{b:B}\operatorname{isContr}(\operatorname{fib}_f(b)),\qquad (A=_{\mathcal U}B)\simeq(A\simeq B).}
\p{第二式需要${link('05C6')}。对自然数 \(n\)，\(\operatorname{Fin}_n\) 是 \(n\) 元类型的分类类型，\(\Sigma_n\) 在此是对称群而非依赖和；${link('05G6')}给出 \(\Omega(\operatorname{Fin}_n,\mathbf n)\simeq\Sigma_n\)。对普通群 \(G\)，${link('05GF')}给出 \(\Omega BG\simeq G\)；另见${link('090G')}的 \(\Omega(S^1,b)\simeq\mathbb Z\)。群运算方向须采用各结果声明的约定。}
\p{对由带基点连通类型 \(BG\) 表示的${link('05K0')}及${link('05K8')} \(X:BG\to\mathcal U\)，${link('05KE')}是}
##{X^{hG}=\prod_{z:BG}X(z),\qquad X_{hG}=\sum_{z:BG}X(z).}
`);
guide('091A','合成范畴部分的公式定位',[[112,123]],R`\p{设 \(C\) 为 Segal 类型或满足全部 Segal 条件的相应单纯空间，\(n\ge2\)，\(\operatorname{Sp}^n\subseteq\Delta^n\) 是相邻边组成的脊线。形状限制公式为}
##{C^{\Delta^n}\simeq C^{\operatorname{Sp}^n}.}
\p{设 \(E:C\to\mathcal U\) 为协变族，\(f:x\to_C y\)，\(u:E(x)\)、\(v:E(y)\)。沿箭头的作用记为 \(f_*u\)。纤维箭头公式是}
##{(f_*u=v)\simeq\{\text{位于 }f\text{ 上方且从 }u\text{ 到 }v\text{ 的依赖箭头}\}.}
\p{固定 \(c:C\)，令 \(c/C=\sum_{x:C}\operatorname{Hom}_C(c,x)\)。对其上的协变族 \(P\)，箭头归纳为}
##{\prod_{h:c/C}P(h)\simeq P(\operatorname{id}_c).}
\p{对 \(C\) 上协变族 \(F\)，可表族的协变性使恒等箭头处求值得到合成 Yoneda 等价；内部依赖函数已提供所需自然性，不能把公式当作任意外部逐点函数族的断言：}
##{\prod_{x:C}\bigl(\operatorname{Hom}_C(c,x)\to F(x)\bigr)\simeq F(c).}
\p{空间范畴记为 \(\mathcal S\)，它不是脊线符号 \(\operatorname{Sp}^n\)。其有向单价性公式为}
##{\operatorname{Hom}_{\mathcal S}(A,B)\simeq(A\to B),\qquad A,B:\mathcal S.}
`);
guide('091B','讲义理论前提与归纳规则定位',[[125,129]],R`\p{这是理论前提的导航而非额外公理包。基础构造从[集合](0201)、[范畴](0202)、[普遍性质](0203)、[Yoneda](0204)、[空间](0205)、[单纯集合](0206)、[Kan 理论](0207)到[空间族](0208)。}
\p{第 9–14 章使用[依赖类型规则](0209)、[路径演算](020A)、[截断与等价](020B)、[函数外延性及单价宇宙](020C)，进入[分类空间](020D)与[高阶群](020E)。第 15–19 章加入[有向形状与扩张类型](020F)，再研究 [Segal 类型](020G)、[协变族](020H)、[箭头归纳与 Yoneda](020I)和[可表性](020J)。}
\p{第 20–21 章的[空间范畴](020K)与[结构范畴](020L)还使用普遍左纤维化及高阶有向单价性；[模型语义](020M)解释这些前提的外部依据。附录 A 的[圆周计算](020N)另外加入${link('0900')}。这些章号链接是阅读导航，不是原子前置依赖。}
\p{${link('050H')}用于同一性类型上的任意依赖族，箭头归纳只用于余切片上的协变族。${link('05C6')}描述可逆等价；有向单价性描述一般函数，还必须与高维复合比较相容。}
`);

const guideLinks={
  '0916':[['有向箭头 ','[有向箭头](060D) '],['在 Rezk 类型中','在 [Rezk 类型](061H)中']],
  '0918':[['单纯空间（simplicial space）','[单纯空间（simplicial space）](0600)'],['Reedy 纤维性（Reedy fibrancy）','[Reedy 纤维性（Reedy fibrancy）](0605)'],['扩张类型（extension type）','[扩张类型（extension type）](060P)'],['Segal 条件（Segal condition）','[Segal 条件（Segal condition）](0612)'],['Rezk 完备性（Rezk completeness）','[Rezk 完备性（Rezk completeness）](061H)'],['群胚型（groupoidal type）','[群胚型（groupoidal type）](061K)'],['协变族（covariant family）','[协变族（covariant family）](0622)'],['可表族（representable family）','[可表族（representable family）](062N)'],['余切片范畴（coslice category）','[余切片范畴（coslice category）](0630)'],['箭头归纳（arrow induction）','[箭头归纳（arrow induction）](0635)'],['Yoneda 引理（Yoneda lemma）','[Yoneda 引理（Yoneda lemma）](063B)'],['有向单价性（directed univalence）','[有向单价性（directed univalence）](0704)'],['结构同一性原理（structure identity principle）','[结构同一性原理的运算实例（structure identity principle）](05CL)'],['结构同态原理（structure homomorphism principle）','[结构同态原理的函子代数实例（structure homomorphism principle）](071D)']],
  '091A':[['为 Segal 类型','为 [Segal 类型](0612)'],['为协变族','为[协变族](0622)'],['纤维箭头公式是','[纤维箭头公式](0627)是'],['箭头归纳为','[箭头归纳](0635)为'],['可表族的协变性','[可表族的协变性](062M)'],['合成 Yoneda 等价','[合成 Yoneda 等价](063B)'],['空间范畴记为','[空间范畴](070Q)记为'],['其有向单价性公式','其[有向单价性](0704)公式']],
  '091B':[['箭头归纳只用于','[箭头归纳](0635)只用于'],['有向单价性描述一般函数','[有向单价性](0704)描述一般函数']]
};
for(const g of guides) for(const [from,to] of guideLinks[g.id]||[]){if(!g.body.includes(from))throw Error(g.id+' missing guide phrase '+from);g.body=g.body.replace(from,to);}
const exactGuideLinks={
  '0916':[[link('058E'),link('05Z4')]],
  '0917':[['[集合类型（set, 0-type）](0585)','[集合类型（set, 0-type）](05Z2)'],['[等价（equivalence）](058E)','[等价（equivalence）](05Z3)']],
  '0918':[['角（horn）','[角（horn）](0419)'],['Kan 复形（Kan complex）','[Kan 复形（Kan complex）](0422)'],['Kan 纤维化（Kan fibration）','[Kan 纤维化（Kan fibration）](0421)'],['模型范畴（model category）','[模型范畴（model category）](0429)'],['左纤维化（left fibration）','[左纤维化作为协变族的外部模型（left fibration）](0622)']],
  '0919':[[link('058E')+'及',link('058E')+'、'+link('05Z3')+'及'],[link('05KE')+'是',link('05KE')+'与'+link('05Z6')+'分别是']]
};
for(const g of guides)for(const [from,to] of exactGuideLinks[g.id]||[]){if(!g.body.includes(from))throw Error(g.id+' missing precise target '+from);g.body=g.body.replace(from,to);}

const reviewReasons={
  '0900':'逐项核对点、环路、依赖消去与命题路径计算规则；模型实现只作外部解释。',
  '0901':'以常值族导出递归，点的定义计算与环路的路径计算没有混同。',
  '0902':'命题性提供生成环路相容路径；截面唯一性另使用函数外延性。',
  '0903':'命题截断归纳只给截断路径；不可缩性链接为后续结论，不进入本证明前置。',
  '0904':'仅定义环路整数幂，负数通过逆路径处理；运算定理独立分出。',
  '0905':'核对负指数后继、交换逆幂与正负方向加法归纳，保留全部三式及证明。',
  '0908':'定义域逆传输与值域正传输方向核对，消除族名和宇宙点名冲突。',
  '0909':'单价性仅在后继等价变成宇宙环路处使用；圆周递归确定整个族。',
  '090A':'后继、逆后继及任意整数环路幂的传输分步核对。',
  '090B':'集合性是命题，使用命题值圆周归纳而不是逐点选择整数编号。',
  '090C':'编码是把基点纤维的零沿指定路径传输；函数的源靶局部明确。',
  '090D':'对幂路径施编码得到整数相等；非可缩反证依赖可缩类型的路径定理。',
  '090E':'完整保留 n→n−1→ℓ^(n−1)·ℓ→ℓ^n 计算，并用函数外延性提供消去相容。',
  '090F':'终点与路径共同变化的基点路径归纳合法，不对固定端点环路直接归纳。',
  '090H':'基点整数计算与集合值纤维的命题性分别核对，使用命题依赖积封闭性。',
  '090G':'两侧逆同伦经拟逆判据给等价；加法保持通过解码整数幂公式检验。',
  '090I':'截断路径只消去到集合性命题；二重环路有点且是命题，高阶可缩递归。',
  '090J':'逐纤维等价诱导总空间等价；路径总空间可缩不误作整数纤维可缩。',
  '090K':'评价与递归两方向完整保留；函数唯一性的环路相容使用双端点共轭公式。',
  '090M':'评价的同伦纤维对应带基点映射；q^(-1)·ap_f(ℓ)·q 方向正确；0711仅作数据语义联系。',
  '090N':'次数定义对指定基点路径 q 共轭后编码，不把 q 无声删除。',
  '090O':'补明复合基点路径 ap_g(q)·r，核对整数幂的幂及次数乘法顺序 nm。',
  '090P':'乘积路径公式逐坐标保持环路合成，两条坐标环路及交换关系保留。',
  '090Q':'宇宙大小、单价性与自等价分类明确；保留后继族、交换二元素族及高阶数据。',
  '090S':'两个显式函数与两次复合检查保留，反向路径归纳同时移动底点。',
  '090R':'复合纤维两映射的源靶与 ap_g(p)·q 方向核对，逆同伦依赖和路径数据保留。',
  '090T':'可缩底上依赖和压缩到中心纤维，提供传输映射，中心收缩数据唯一性不误作外部选择。',
  '090U':'粘合函数使用 p·ap_g(q)，两侧复合归纳和单位律保留，区别普通集合拉回。',
  '090V':'嵌入是命题同伦纤维，不与具体拓扑子空间嵌入混同。',
  '090W':'依赖和路径经左端点逆传输化为 ap 的纤维；变换是类型等价而非逻辑双向蕴涵。',
  '090X':'命题纤维到路径等价及逆方向完整核对，反方向使用 r·s^(-1) 原像。',
  '090Y':'命题子类型路径复用058N；新增解释是同伦嵌入应用及增加基点结构的对比。',
  '090Z':'等价归纳同时变动底和类型族；不要求逐纤维选取元素。',
  '0910':'格路径是积偏序中的饱和最大链，p,q非负、步长与边数明确。',
  '0911':'严格链延长、共同顶点面与二项式计数三步骤保留，神经保持积在本例逐链说明。',
  '0912':'两三角形的共同对角边和独立编译图保留；严格复合等式仅限普通范畴神经。',
  '0913':'三个四面体顶点、两个三角公共面和非相邻交边均核对。',
  '0914':'逐参数映出推出是严格拉回，独立于纤维性；同伦论断拆到091C。',
  '091C':'仅在Reedy纤维目标与形状单射下使用限制纤维化；明确调用外部模型理论而非声称重证。',
  '0915':'固定域及线性Hom集合；评价恢复M、反向自然性、自动线性与矩阵尺寸完整核对。',
  '0916':'五种关系逐项定位，路径连接与函数复合方向及共轭公式保留。',
  '0917':'全部21项同伦类型术语以规范链接和短释保留，集合性/命题性和轨道/不动点拆分目标准确。',
  '0918':'全部21项单纯范畴术语保留，已有定义只作链接式定位，未建立重复定义。',
  '0919':'逐个保留8个空间公式及5个源结果定位；Sigma对称群与依赖和符号明确区分。',
  '091A':'5个范畴公式保留全部类型与协变假设，脊线与空间宇宙符号区分，正式源标签全部解析。',
  '091B':'理论假设层次完整保留，路径归纳与协变箭头归纳区别明确，导航排除于前置DAG。'
};

function inlineGuide(s){return s.replace(/\\\(([\s\S]*?)\\\)/g,(_,m)=>'#{'+m+'}');}
function generate(){
  if(fs.existsSync(auditFile)&&JSON.parse(fs.readFileSync(auditFile,'utf8')).status==='stable')throw Error('Calculations pages are finalized. Generator disabled to protect manual refinements; use --check.');
  fs.mkdirSync(out,{recursive:true});
  const audit={group:'calculations',date:'2026-09-25',sourceDirectory:source,readCompletely:['a_calculations.tex:1-598','b_glossary.tex:1-129','../references.tex'],labels,concepts:{},reviews:{},prerequisites:{},sourceCoverage:[],crossrefs:[],corrections:[],deferred:[],existingAugmentations:[],citationAliases:{HoTTBook:'HoTT',RiehlCatHo:'RiehlCatHomotopy',KudasovRiehlWeinberger:'YonedaFormal',Lurie:'LurieHTT',Shulman:'ShulmanUniverses'},verification:{semanticReview:'Manual source and generated-page reading, with the concrete per-page findings recorded in reviews; mechanical conversion/checks are not semantic review.'}};
  audit.citationKeys={RiehlICM:'0211',RiehlContext:'0212',Hatcher:'0213',Friedman:'0214',Quillen:'0215',GoerssJardine:'0216',HoTT:'0217',Rijke:'0218',AwodeyWarren:'0219',RiehlSemantics:'021A',RiehlCatHomotopy:'021B',Rezk:'021C',RiehlShulman:'021D',YonedaFormal:'021E',RiehlVerity:'021F',GratzerWeinbergerBuchholtz:'021G',CavalloRiehlSattler:'021H',LurieHTT:'021I',ShulmanUniverses:'021J'};
  for(const n of notes){
    let body=raw[n.file].slice(n.ranges[0][0]-1,n.ranges[0][1]).join('\n');
    for(const [from,to] of n.changes){if(!body.includes(from))throw Error(n.id+' replacement missing '+from);body=body.replace(from,to);}
    if(n.id==='091C')body=R`若 \(C\) 为 Reedy 纤维单纯空间，则
\[
\operatorname{Map}(K,C)\cong\operatorname{Map}(K_1,C)\times_{\operatorname{Map}(L,C)}\operatorname{Map}(K_2,C)
\]
也计算同伦拉回。在相容边界数据上进一步取这些限制映射的纤维，纤维化在拉回下稳定，故相同结论适用于所得的相容填充空间。

证明。严格等式由形状并的映射公式给出；纤维性使沿单射的限制映射成为纤维化。沿纤维化的拉回具有同伦拉回的正确同伦类型，因而这里可以用严格一致的映射计算同伦相容的映射。若缺少这个纤维性条件，不能直接作后一解释。`;
    const pre=n.deps.length?'\\p{前置：'+n.deps.map(id=>link(id)).join('；')+'。}\n\n':'';
    fs.writeFileSync(path.join(out,n.id+'.tree'),header(n)+pre+convert(n.context)+'\n\n'+convert(body)+(n.tail?'\n\n'+convert(n.tail):'')+'\n');
    audit.concepts[n.title]=n.id;
    audit.prerequisites[n.id]=[...new Set(n.deps)];
    if(!reviewReasons[n.id])throw Error('Missing individual review: '+n.id);
    audit.reviews[n.id]={title:n.title,action:'split-and-integrate',reason:reviewReasons[n.id],scope:n.file+':'+n.ranges.flat().join('-')+'; source and generated page read; local variables, proof steps, source scope, formulas and canonical prerequisite destinations checked.'};
    audit.sourceCoverage.push({file:n.file,sourceLines:n.ranges[0],ids:[n.id],notes:n.id==='0914'?'Strict gluing component; homotopy interpretation split to 091C.':n.id==='091C'?'Reedy-fibrant homotopy component of same source theorem, with model hypotheses made explicit.':'Full statement, proof where present, formulas and associated remarks retained; local context added.'});
  }
  for(const n of guides){
    fs.writeFileSync(path.join(out,n.id+'.tree'),header(n,'B')+inlineGuide(n.body)+'\n');
    audit.reviews[n.id]={title:n.title,action:'linked-guide',reason:reviewReasons[n.id],scope:n.file+':'+n.ranges.flat().join('-')+'; source rows/formulas individually compared; not a prerequisite atom.'};
    audit.concepts[n.title]=n.id;
    audit.sourceCoverage.push({file:n.file,sourceLines:n.ranges[0],ids:[n.id],notes:'Every source table entry/formula retained as a notation guide; canonical links are reused, navigation is excluded from prerequisite DAG.'});
  }
  const outlineA=R`\p{本附录把沿路径传输、保留同伦纤维的相容数据、以及分解参数形状三种操作组织成具体计算。圆周部分额外使用高阶归纳规则，其他计算使用正文基础。}
\ol{
\li{从${link('0900')}、${link('0901')}、${link('0902')}到${link('0903')}；用${link('0904')}、${link('0905')}与${link('0908')}准备传输计算。}
\li{建立${link('0909')}，计算${link('090A')}和${link('090B')}，给出${link('090C')}与${link('090D')}，再构造${link('090E')}。分别核查${link('090F')}、${link('090H')}，得到${link('090G')}、${link('090I')}及${link('090J')}。}
\li{用${link('090K')}与${link('090M')}解释${link('090N')}、${link('090O')}，并计算${link('090P')}与${link('090Q')}。}
\li{比较${link('090S')}、${link('090R')}、${link('090T')}与${link('090U')}，始终保留路径相容数据。}
\li{从${link('090V')}经${link('090W')}得到${link('090X')}；应用于${link('090Y')}，并另用${link('090Z')}更换依赖和的索引。}
\li{从${link('0910')}证明${link('0911')}，查看${link('0912')}、${link('0913')}，区分${link('0914')}和${link('091C')}；最后用${link('0915')}检验 Yoneda 的评价公式。}
}
\p{这些操作分别连接单价性、依赖和与协变族、Segal 合成与箭头归纳；[术语、公式及理论前提索引](020O)帮助辨认各计算实际使用的规则。}`;
  const outlineB=R`\p{本索引只定位术语与公式，不重复建立正文定义。先辨别关系层次，再按空间或有向范畴语境查找。}
\ol{\li{${link('0916')}。}\li{${link('0917')}与${link('0918')}。}\li{${link('0919')}与${link('091A')}。}\li{${link('091B')}。}}`;
  for(const [id,title,body,file,ranges] of [['020N','圆周、同伦纤维与单形乘积的计算',outlineA,'a_calculations.tex',[[1,6],[52,52],[107,107],[162,162],[277,277],[360,360],[429,429],[493,493],[568,568],[596,598]]],['020O','术语、符号与主要结果索引',outlineB,'b_glossary.tex',[[1,4],[62,62],[94,94]]]]){
    fs.writeFileSync(path.join(out,id+'.tree'),header({id,title,taxon:'Outline'},id==='020N'?'A':'B')+body+'\n');
    audit.reviews[id]={title,action:'retain-outline',reason:'Short linked narrative; no independent prerequisite role.',scope:file+' editorial framing and navigation'};
    for(const range of ranges)audit.sourceCoverage.push({file,sourceLines:range,ids:[id],notes:'Source framing/section heading/navigation preserved through linked narrative; purely typesetting commands have no mathematical content.'});
  }
  audit.sourceCoverage.push({file:'a_calculations.tex',sourceLines:[87,97],ids:['054F','054C'],notes:'Deduplicated against chapter 10 function-family and endpoint transport, including their path-induction proofs.'});
  audit.sourceCoverage.push({file:'a_calculations.tex',sourceLines:[297,303],ids:['0711','090M'],notes:'Same dependent-sum data formula as the canonical pointed-space mapping theorem 0711, recalled locally in 090M; no duplicate definition. The elementary circle calculation does not require the directed categorical interpretation of 0711, so this related link is not an extra prerequisite.'});
  audit.crossrefs=[{from:'090G',sourceLabel:'thm:equiv-qinv',target:'058I'},{from:'090J',sourceLabel:'prop:based-contractible',target:'054J'},{from:'0919',sourceLabel:'thm:sigma-path',target:'054H'},{from:'0919',sourceLabel:'thm:equiv-qinv',target:'058I'},{from:'0919',sourceLabel:'thm:finite-loops',target:'05G6'},{from:'0919',sourceLabel:'thm:torsor-BG',target:'05GF'},{from:'0919',sourceLabel:'thm:circle-encode',target:'090G'},...Object.entries({'prop:dependent-arrow':'0627','thm:representable-covariant':'062M','thm:arrow-induction':'0635','thm:synthetic-yoneda':'063B','thm:spaces-category':'070Q'}).map(([sourceLabel,target])=>({from:'091A',sourceLabel,target,notes:'Canonical destination read and formula/context checked.'}))];
  audit.corrections=[{file:'b_glossary.tex',sourceLines:[6,21],ids:['0916'],change:'The source says four equality relations but lists five; retitled five kinds of relation, not five interchangeable equalities.'},{file:'a_calculations.tex',sourceLines:[99,104],ids:['0908'],change:'Use D,E for function-domain/codomain families to avoid collision with A,B as universe elements.'},{file:'a_calculations.tex',sourceLines:[555,565],ids:['0914','091C'],change:'Separate simplicial-set exponential identity from Reedy-fibrant simplicial-space mapping-space homotopy claim; preserve external model-theoretic inputs.'},{file:'a_calculations.tex',sourceLines:[324,340],ids:['090O'],change:'Explicit composite pointed-map witness ap_g(q)·r and loop-map conjugation; do not silently discard basepoint paths.'},{file:'a_calculations.tex',sourceLines:[528,535],ids:['0912'],change:'Strict composite equality is stated only for ordinary category nerves; general targets retain triangle/coherence data.'}];
  audit.corrections.push({file:'a_calculations.tex',sourceLines:[71,84],ids:['0905'],change:'Expanded the natural-power commutation and negative-direction induction steps; preserved homotopical rather than definitional equality.'},{file:'a_calculations.tex',sourceLines:[375,375],ids:['090S'],change:'Replaced source typo vector with element for a dependent-sum element.'},{file:'a_calculations.tex',sourceLines:[538,552],ids:['0913'],change:'Specified the nonadjacent intersection edge by its two endpoints.'},{file:'b_glossary.tex',sourceLines:[38,90],ids:['0917','0918','0919'],change:'Retargeted split canonical definitions: set type05Z2, equivalence05Z3/05Z4, homotopy orbit05Z6. All known cross-group glossary entries now link exact concept pages.'});
  audit.concepts={...audit.concepts,'高阶归纳圆周':'0900','圆周整数覆盖族':'0909','圆周环路空间':'090G','同伦嵌入':'090V','同伦嵌入路径判据':'090X','单形乘积格路径剖分':'0911'};
  audit.canonicalInspection=[...new Set(Object.values(audit.prerequisites).flat().filter(id=>!notes.some(n=>n.id===id)))];
  audit.canonicalReuse=[{ids:['054F','054C'],sourceLines:[87,97],reason:'The full function-family and endpoint transport statements and proofs are already covered in chapter10.'},{ids:['058N','090Y'],sourceLines:[474,480],reason:'The subtype path equivalence is reused; the new note is its embedding interpretation and structure/property comparison.'},{ids:['0711','090M'],sourceLines:[297,318],reason:'Pointed mapping data are recalled for the circle application without importing stronger directed-theory assumptions.'},{ids:['01FX','00DE','00D3','00GC','00GK','00GM','00I2'],reason:'Existing canonical elementary definitions/results read and reused without changes.'}];
  audit.semanticReview={method:'Full reading of assigned source files, explicit source-unit allocation, manual reading of all 48 generated pages, and concrete mathematical corrections listed above. Formula/diagram checks are separate.',reviewedIds:Object.keys(audit.reviews),scope:'Only calculations atoms and glossary/navigation pages; direct prerequisite destinations read. No whole-forest semantic acceptance or external model theorem proofs claimed.',baseline:'Elementary arithmetic and finite manipulations; type rules, truncation, univalence and model structures are explicit linked assumptions.',excludedPrerequisiteLinks:[{from:'0903',to:'090D',reason:'Later noncontractibility consequence, not needed for connectivity proof.'},{from:'090M',to:'0711',reason:'Directed interpretation of the same data, not required for elementary pointed-circle mapping calculation.'},{from:'0914',to:'091C',reason:'Stronger homotopy interpretation; strict gluing proof does not assume it.'}]};
  audit.changedFiles=[...Object.keys(audit.reviews).map(id=>path.join(out,id+'.tree')),auditFile,path.join(root,'scripts/riehl-calculations.mjs')];
  fs.writeFileSync(auditFile,JSON.stringify(audit,null,2)+'\n');
  console.log(`Generated ${notes.length} atoms, ${guides.length+2} outlines and local audit.`);
}

function check(){
  const require=createRequire(import.meta.url);
  const katex=require('/tmp/forester-math-check/node_modules/katex/dist/katex.js');
  const errors=[];let formulas=0,diagrams=0;
  const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(d=>d.isDirectory()?walk(path.join(p,d.name)):[path.join(p,d.name)]);
  const all=walk(path.join(root,'trees')).filter(p=>p.endsWith('.tree'));
  const ids=new Set(all.map(p=>path.basename(p,'.tree')));
  for(const file of fs.readdirSync(out).filter(f=>f.endsWith('.tree'))){
    const s=fs.readFileSync(path.join(out,file),'utf8');
    if(s.includes('\\!')) errors.push(file+': forbidden spacing macro');
    if(/\\(?:ref|cite|label)\{/.test(s))errors.push(file+': unresolved source command');
    for(const m of s.matchAll(/\]\(([0-9A-Z]{4})\)/g))if(!ids.has(m[1]))errors.push(file+': pending crossgroup link '+m[1]);
    for(const m of s.matchAll(/#{1,2}\{/g)){
      let i=m.index+m[0].length,j=i,depth=1;
      for(;j<s.length&&depth;j++){if(s[j]==='{')depth++;if(s[j]==='}')depth--;}
      const math=s.slice(i,j-1);formulas++;
      try{katex.renderToString(math,{throwOnError:true,strict:'ignore'});}catch(e){errors.push(file+': '+e.message);}
    }
    for(const m of s.matchAll(/\\figure\{\\tex\{\\usepackage\{tikz-cd\}\}\{\s*([\s\S]*?\\end\{tikzcd\})\s*\}\}/g)){
      const temp=fs.mkdtempSync('/tmp/riehl-calculations-');
      fs.writeFileSync(path.join(temp,'figure.tex'),'\\documentclass{standalone}\n\\usepackage{tikz-cd}\n\\begin{document}\n'+m[1]+'\n\\end{document}\n');
      try{execFileSync('/Library/TeX/texbin/latex',['-halt-on-error','-interaction=nonstopmode','figure.tex'],{cwd:temp,stdio:'pipe'});diagrams++;}catch(e){errors.push(file+': standalone diagram failure '+e.stdout?.toString().slice(-1200));}
    }
  }
  const audit=JSON.parse(fs.readFileSync(auditFile,'utf8'));
  for(const [id,deps]of Object.entries(audit.prerequisites)){
    const body=fs.readFileSync(path.join(out,id+'.tree'),'utf8').split('\n\n').slice(1).join('\n\n');
    for(const d of deps){
      if(!body.includes(']('+d+')'))errors.push(id+': prerequisite not linked in body '+d);
      const target=all.find(f=>path.basename(f,'.tree')===d);
      if(target&&/\\taxon\{(?:Outline|Chapter)\}/.test(fs.readFileSync(target,'utf8')))errors.push(id+': navigation incorrectly used as prerequisite '+d);
    }
  }
  const coverage={};
  for(const [file,lines]of Object.entries(raw)){
    const covered=new Set();for(const item of audit.sourceCoverage.filter(c=>c.file===file))for(let i=item.sourceLines[0];i<=item.sourceLines[1];i++)covered.add(i);
    const missed=[];for(let i=0;i<lines.length;i++)if(lines[i].trim()&&!covered.has(i+1))missed.push(i+1);
    coverage[file]={nonblankLines:lines.filter(s=>s.trim()).length,unmappedNonblankLines:missed};
    if(missed.length)errors.push(file+': unmapped nonblank source lines '+missed.join(','));
  }
  const visits=new Set(),active=new Set();
  function visit(id){if(active.has(id))throw Error('Prerequisite cycle '+id);if(visits.has(id))return;active.add(id);for(const p of audit.prerequisites[id]||[])if(audit.prerequisites[p])visit(p);active.delete(id);visits.add(id);}
  Object.keys(audit.prerequisites).forEach(visit);
  const result={pages:fs.readdirSync(out).length,formulas,standaloneDiagrams:diagrams,coverage,localPrerequisiteDAG:'acyclic',errors,scope:'Calculations only; no full forest build or global audit update; formula checks do not establish semantic review.'};
  if(process.argv.includes('--record-checks')){audit.verification={...audit.verification,...result,fullForestBuild:'not-run-by-instruction',gitCommit:'not-run-by-instruction'};fs.writeFileSync(auditFile,JSON.stringify(audit,null,2)+'\n');}
  console.log(JSON.stringify(result,null,2));
  if(errors.length)process.exitCode=1;
}
if(process.argv.includes('--generate'))generate();
if(process.argv.includes('--check'))check();
