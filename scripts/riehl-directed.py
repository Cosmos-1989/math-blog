#!/usr/bin/env python3
"""Reproducible, editorially specified split of the two directed chapters.

Ranges and context paragraphs below are manual editorial decisions, not an
automatic claim of semantic review. Only this group's artifacts are written.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path('/Users/sunzy/Downloads/riehl_synthetic_lectures_source/chapters')
OUT = ROOT / 'trees/math/topology/synthetic/directed'
FILES = {20: '20_directed.tex', 21: '21_structures.tex'}
LINES = {n: (SOURCE / f).read_text().splitlines() for n, f in FILES.items()}
REFS = dict(zip(['RiehlICM','RiehlContext','Hatcher','Friedman','Quillen',
 'GoerssJardine','HoTT','Rijke','AwodeyWarren','RiehlSemantics',
 'RiehlCatHomotopy','Rezk','RiehlShulman','YonedaFormal','RiehlVerity',
 'GratzerWeinbergerBuchholtz','CavalloRiehlSattler','LurieHTT','ShulmanUniverses'],
 ['0211','0212','0213','0214','0215','0216','0217','0218','0219','021A',
  '021B','021C','021D','021E','021F','021G','021H','021I','021J']))
LABELS = {'def:directed-univalence':'0704','thm:higher-directed':'070G',
 'thm:spaces-segal':'070N','thm:spaces-category':'070Q',
 'thm:pointed-maps':'0711','lem:arrow-square':'0717','thm:magma-hom':'071A',
 'thm:polymorphic-id':'071O','thm:uniform-projections':'071P'}
NOTES = []

def note(id, chapter, title, taxon, ranges, context='', deps=(), body=None, after='', refs=()):
    NOTES.append(dict(id=id, chapter=chapter, title=title, taxon=taxon,
      ranges=ranges, context=context, deps=list(deps), body=body, after=after,
      refs=list(refs)))

# Every range is inclusive. Independent results in a shared source unit have
# separate hand-written bodies; ordinary definitions are linked, not replaced.
note('0700',20,'普遍小协变族的同伦分类性质','Definition',[(3,12)],
 r'这里的空间是同伦类型，不是模型论的类型。$\sum$ 表示依赖和（带纤维坐标的对），$\prod$ 表示依赖函数；$x=y$ 是同一性类型，保留全部高阶路径。类型 $T$ 可缩指存在 $c:T$ 及 $\prod_{t:T}(c=t)$；函数等价指每个同伦纤维可缩。协变族 $E$ 指每个底箭头 $u:x\to y$ 与起点 $e:E(x)$ 的依赖提升（终点可变）组成可缩类型，其中心终点记为 $u_*e$。小性相对于固定宇宙；语境 $\Gamma$ 表示允许变化的参数。')
note('0701',20,'普遍协变族的分类拉回图','Example',[(13,22)],
 r'固定[普遍小协变族](0700) $\varrho:\Sp_\bullet\to\Sp$；代码 $A_\gamma$ 也表示在 $\gamma$ 处解码的纤维。这里的群胚类型指有向箭头与路径等价的类型。', ['0700'],
 after=r'图的等式为 $\varrho\circ\widetilde A=A\circ\pi$，其中 $\pi(\gamma,a)=\gamma$，$\widetilde A$ 是分类提升；方形在同伦意义下为拉回。纤维群胚性使用协变族的纤维群胚定理，不由底的范畴性预先推出。')
note('0702',20,'普遍协变族的普通单价性','Definition',[(23,32)],
 r'固定[普遍小协变族](0700)。$A,B:\Sp$ 是代码，右侧 $A\simeq B$ 是解码空间间的等价类型；普通单价性要求由路径传输得到的典范比较为等价。', ['0700'])
note('0703',20,'普遍协变族把宇宙箭头送到函数','Construction',[(35,44)],
 r'固定[普遍小协变族](0700)。有向区间 $\mathbb I=\Delta^1$ 带端点 $0,1$；$\Hom_C(x,y)$ 表示固定端点为 $x,y$ 的形状函数 $\Delta^1\to C$，不预设合成。', ['0700'])
note('0704',20,'有向单价性','Definition',[(45,54)],
 r'固定[普遍小协变族](0700)，使用由提升构造的[典范比较](0703) $\mathsf{arrfun}_{A,B}$。此定义的“等价”是类型等价，并非把所有箭头要求为可逆。', ['0700','0703'])
note('0705',20,'空空间到单位空间的箭头不可逆','Example',[(55,57)],
 r'设[有向单价性](0704)成立。$\zero$ 是无元素的空类型，$\one$ 是只有一点且可缩的单位类型。', ['0704'])
note('0706',20,'集合函数的元素范畴','Construction',[(60,66)],
 r'使用普通[范畴](00I0)与[函子](00I1)。$[1]$ 是对象为 $0,1$、除恒等外只有 $0\to1$ 的范畴。', ['00I0','00I1'])
note('0707',20,'函数元素范畴投影的唯一前向提升','Theorem',[(67,72)],
 r'给定集合函数 $f:A\to B$，令 $p_f:E_f\to[1]$ 为其[元素范畴投影](0706)。离散余纤维化指：任给底箭头与其源上的对象，存在唯一从该对象出发、投影到此底箭头的态射。', ['0706'])
note('0708',20,'离散区间族等价于一个集合函数','Theorem',[(73,81)],
 r'使用[唯一前向提升条件](0707)定义离散余纤维化，使用[函数的元素范畴](0706)记号 $E_f$。两个端点的纤维分别记 $A,B$；保纤维同构指与到 $[1]$ 的投影相容的范畴同构。', ['0706','0707'])
note('0709',20,'有限函数链及其区间传输','Definition',[(84,91)],
 r'固定自然数 $n\geq0$。此处空间指[同伦类型](0700)，集合函数链是所有空间都离散的特例。', ['0700'])
note('070A',20,'集合函数链的元素范畴','Theorem',[(92,97)],
 r'给定[函数链](0709)且每个 $A_i$ 是集合。$[n]$ 是对象 $0,\ldots,n$ 按大小关系各有唯一箭头的[范畴](00I0)。离散余纤维化采用[唯一前向提升条件](0707)。', ['0709','00I0','0707'])
note('070B',20,'函数链的面与退化运算','Theorem',[(98,103)],
 r'设 $F=(A_0\to\cdots\to A_n)$ 是[集合函数链](0709)，采用[元素范畴模型](070A)。保序映射与面、退化的约定见[单纯集合](01FX)。', ['0709','070A','01FX'])
note('070C',20,'严格空间函数链的单纯替换','Construction',[(106,117)],
 r'设 $F=(A_0\to\cdots\to A_n)$ 为[严格函数链](0709)，$f_{ij}$ 是相邻映射的实际复合。Kan 复形指每个角 $\Lambda^k[m]\subseteq\Delta^m$ 的映射均可扩张的[单纯集合](01FX)；角是除第 $k$ 面外所有面的并。单纯空间是取值于空间的反变单纯函子。$\Delta^n$ 的外方向 $m$ 层是所有保序映射 $[m]\to[n]$ 的离散集合；$\coprod$ 是不交并。', ['0709','01FX'])
note('070D',20,'单纯替换的限制相容与初始顶点公式','Theorem',[(118,131)],
 r'令 $E_F\to\Delta^n$ 为[严格空间链的单纯替换](070C)。限制的记号为 $\theta:[k]\to[m]$、$\psi:[\ell]\to[k]$；$\sigma:[m]\to[n]$。右侧拉回按单形初始顶点取。', ['070C'])
note('070E',20,'单纯替换的相对 Reedy 纤维替换','Remark',[(132,137)],
 r'对[单纯替换](070C)，[初始顶点比较](070D)是逐层同构。Reedy 纤维对象指到每层匹配对象（所有相容真面组成的极限）的映射为 Kan 纤维化；相对纤维替换是在底 $\Delta^n$ 上作逐层弱等价，得到相对 Reedy 纤维对象。弱等价在这里指空间同伦类型的等价。左纤维化指 Reedy 纤维映射，其初始顶点方形为同伦拉回。', ['070C','070D'],
 after=r'这里调用模型结构中的相对纤维替换存在性。严格链模型只完成一个方向，不把逐点选提升冒充任意语境中的逆比较。')
note('070F',20,'空间函数链的分类对象','Definition',[(140,148)],
 r'固定[普遍协变族](0700)及自然数 $n$。解码空间之间的 $A\to B$ 是函数类型；函数链的区间复合记号见[有限函数链](0709)。当 $n=0$ 时空积为单位类型。', ['0700','0709'])
note('070G',20,'高阶有向单价性的有限单纯形比较','Theorem',[(149,159)],
 r'此页记录引用的语义基础定理，不给出其完整外部证明。使用[普通单价的普遍协变族](0702)、[函数链分类对象](070F)及[左纤维化模型约定](070E)。$\Sp^{\Delta^n}$ 是从标准单纯形到分类对象的内部映射对象；“同伦相容”包括所有面、退化和参数替换。高阶拓扑斯指满足高阶层下降的空间值层环境，此处只作为外部定理的语义假设。', ['0702','070F','070E'], refs=['CavalloRiehlSattler'])
note('070H',20,'有限单纯形比较推出一维有向单价性','Theorem',[(160,171)],
 r'假设[高阶比较定理](070G)，并以[箭头到函数比较](0703)定义端点固定的映射；要证明的是[有向单价性](0704)。', ['070G','0703','0704'])
note('070I',20,'有向函数粘合族的内部公式','Definition',[(174,182)],
 r'固定小空间 $A,B$ 和函数 $f:A\to B$；记 $\fib_f(b)=\sum_{a:A}(f(a)=b)$ 为同伦纤维。使用带有向区间 $\mathbb I$ 的扩充类型论，区间端点为 $0,1$。$[i=0]$ 是端面命题，不是声称任意普通空间上都可使用这种模态端面。', ['0700'], refs=['GratzerWeinbergerBuchholtz'])
note('070J',20,'有向粘合的空间宇宙封闭性输入','Theorem',[(183,185)],
 r'固定[有向粘合公式](070I)。本页只是扩充单纯同伦类型论中的外部定理输入，不声称为任意有向类型证明了封闭性。', ['070I'], body=r'''
在 Gratzer、Weinberger、Buchholtz 的扩充语义中，若 $A,B$ 属于指定的小空间宇宙且 $f:A\to B$，则
\[
\mathsf{Gl}_f(i)=\sum_{b:B}([i=0]\to\fib_f(b))
\]
仍给出该空间宇宙中的族。这个封闭性使公式能够分类为宇宙中的箭头，而不仅是较大环境中的一个类型表达式。所用模态结构与大小条件是结论的假设；其外部证明不在本讲义的内部计算中。
''', refs=['GratzerWeinbergerBuchholtz'])
note('070K',20,'空间值族的顶点检测输入','Theorem',[(183,185)],
 r'采用[粘合封闭性输入](070J)所属的同一扩充语义，记 $\Sp$ 为其指定空间宇宙。', ['070J'], body=r'''
对于标准单纯形 $\Delta^n$ 上的空间值族 $E,F$ 和纤维映射 $\alpha:E\to F$，该体系的顶点检测定理允许由每个顶点 $v$ 处的 $\alpha_v:E(v)\to F(v)$ 为等价推出整个纤维映射逐纤维为等价。
用于区间时，只须检测 $\alpha_0$ 与 $\alpha_1$。这是引用的扩充体系定理，不是任意有向类型族的无条件规则；这里没有补写其外部证明。
''', refs=['GratzerWeinbergerBuchholtz'])
note('070L',20,'有向粘合的端点与协变传输','Theorem',[(186,204)],
 r'设 $f:A\to B$ 为小空间函数，$\mathsf{Gl}_f$ 为[粘合族](070I)，并假设[空间宇宙封闭性](070J)。$\mathsf{refl}$ 是自反路径；证明用同一性类型的路径归纳：允许终点和路径一起变化，归约到自反路径。', ['070I','070J'])
note('070M',20,'区间空间族的粘合逆比较','Theorem',[(207,225)],
 r'设 $F:\mathbb I\to\Sp$ 是空间值协变族，$f:F(0)\to F(1)$ 是其传输。使用[粘合端点计算](070L)、[顶点检测](070K)与[普通单价性](0702)。$r\vee i$ 是有向区间的最大值形状运算，满足 $0\vee i=i$、$1\vee i=1$。函数外延性把逐点路径识别为函数路径。', ['070L','070K','0702'])
note('070N',20,'高阶有向单价性推出空间宇宙的 Segal 条件','Theorem',[(228,243)],
 r'令 $\Sp$ 为[高阶比较定理](070G)的宇宙；$I[n]\subseteq\Delta^n$ 是相邻边 $0\to1\to\cdots\to n$ 的并，即脊柱。内部脊柱条件要求在所有参数语境中限制 $C^{\Delta^n}\to C^{I[n]}$ 为等价；满足这些条件的类型称合成预范畴。$\mathsf{Fun}_n$ 采用[函数链分类对象](070F)。', ['070G','070F'],
 after=r'图的相容式为 $r\circ\theta_n\simeq\rho\circ\operatorname{res}$：$r$ 将链拆为相邻函数，$\rho$ 在脊柱各边应用一维比较，$\operatorname{res}$ 为限制。这是同伦交换，不是未经选择的严格等式。')
note('070O',20,'空间宇宙的合成就是函数复合','Theorem',[(244,249)],
 r'在[Segal 空间宇宙](070N)中，箭头与函数由[一维比较](070H)对应；函数链的面、退化由[分类对象](070F)规定。', ['070N','070H','070F'])
note('070P',20,'空间宇宙的可逆箭头等价于等价函数','Theorem',[(252,257)],
 r'使用[空间宇宙的复合公式](070O)及[有向单价比较](070H)。可逆箭头指存在左右逆及两侧复合为恒等的路径；函数等价可用两侧拟逆判据判断。', ['070O','070H'])
note('070Q',20,'普通与有向单价性共同构造空间范畴','Theorem',[(258,273)],
 r'令 $\Sp$ 为[高阶比较定理](070G)给出的、[普通单价](0702)的普遍协变族之底。合成范畴是满足[内部 Segal 条件](070N)并且完备的类型；完备指典范比较 $\mathsf{idtoiso}:(A=B)\to(A\cong B)$ 是等价，其中 $\cong$ 表示可逆箭头类型。本证明还使用[可逆箭头判据](070P)。', ['070G','0702','070N','070P'], refs=['RiehlICM','CavalloRiehlSattler'])
note('070R',20,'小协变族的直化与反直化','Definition',[(276,278)],
 r'固定[普遍小协变族](0700)及[空间范畴](070Q)。$B$ 是任意底类型；“分类”及互逆均在同伦意义下理解。', ['0700','070Q'])
note('070S',20,'直化函子的箭头作用是纤维传输','Theorem',[(279,287)],
 r'设 $B$ 是[合成范畴](070Q)意义下的底，$E$ 是 $B$ 上的小协变族。令 $E:B\to\Sp$ 同时记它的[直化](070R)。合成函子是内部函数，它作用于全部形状函数，因而保持 Segal 所刻画的合成。', ['070Q','070R'])
note('070T',20,'空间范畴的终对象是单位空间','Theorem',[(290,298)],
 r'在[空间范畴](070Q)中，$\one$ 表示单位空间。终对象的高阶泛性质要求从任意对象 $X$ 出发的映射类型可缩。', ['070Q'], body=r'''
单位空间 $\one$ 是终对象。由有向单价性，$\Hom_{\Sp}(X,\one)\simeq(X\to\one)$。所有函数逐点取唯一点；函数外延性给出其可缩性，且该比较在 $X$ 的参数中自然。
''')
note('070U',20,'空间范畴的乘积由类型乘积实现','Theorem',[(290,298)],
 r'固定[空间范畴](070Q)中的 $A,B$。这是普通[积泛性质](00I4)的映射类型版本，保留高阶路径而非仅态射集合。', ['070Q','00I4'], body=r'''
对象 $A\times B$ 配两投影构成积，因为对任意 $X$，
\[
\Hom_{\Sp}(X,A\times B)\simeq(X\to A\times B)
\simeq(X\to A)\times(X\to B)
\simeq\Hom_{\Sp}(X,A)\times\Hom_{\Sp}(X,B).
\]
中间等价将函数送到两个投影分量，逆向逐点配对；两侧逆由函数外延性得到。比较与 $X$ 的前复合相容，因此满足乘积的自然泛性质。
''')
note('070V',20,'空间范畴的指数由函数类型实现','Theorem',[(290,298)],
 r'给定[空间范畴](070Q)中的 $A,B$，记 $B^A=(A\to B)$，并使用[类型乘积](070U)。指数对象指代表函子 $X\mapsto\Hom_{\Sp}(X\times A,B)$ 的对象。', ['070Q','070U'], body=r'''
有在 $X,A,B$ 的适当变量中自然的等价
\[
\Hom_{\Sp}(X,B^A)\simeq(X\to(A\to B))
\simeq(X\times A\to B)\simeq\Hom_{\Sp}(X\times A,B).
\]
中间等价是柯里化：$h$ 送到 $(x,a)\mapsto h(x)(a)$，逆向送 $k$ 到 $x\mapsto(a\mapsto k(x,a))$。函数外延性给出逆同伦。故函数类型连同求值映射是所需指数。
''')
note('070W',20,'空间范畴的同伦拉回公式','Theorem',[(299,308)],
 r'在[空间范畴](070Q)中取 $f:A\to Z$、$g:B\to Z$。拉回的映射泛性质是把 $\Hom(X,P)$ 识别为由 $a:X\to A$、$b:X\to B$ 和路径 $fa=gb$ 组成的锥类型。', ['070Q'], body=r'''
拉回由
\[
P=\sum_{a:A}\sum_{b:B}(f(a)=g(b))
\]
及其两个投影和第三分量路径给出。证明使用讲义第19章的逐分量计算：函数 $h:X\to P$ 等价于函数 $a:X\to A$、$b:X\to B$ 及 $q:\prod_{x:X}(f(a(x))=g(b(x)))$。函数外延性把 $q$ 的类型识别为 $f\circ a=g\circ b$，依赖和消去与逐点配对互为逆。再由有向单价性把所有函数类型换成映射类型，得到所需泛性质；构造与 $X$ 的前复合相容。
''')

note('0710',21,'普遍协变族的总空间是带基点空间范畴','Definition',[(3,9)],
 r'取[空间范畴](070Q)及其[普遍协变族](0700)。这里调用协变族总空间定理：合成范畴上协变族的依赖和仍是合成范畴；其内容不是普通[函子范畴](00I5)的集合级断言。', ['070Q','0700'])
note('0711',21,'带基点空间的映射类型','Theorem',[(10,19),(30,32)],
 r'固定[带基点空间范畴](0710)中的对象 $(A,a),(B,b)$。使用[有向单价性](070H)及协变族的依赖箭头端点公式：位于底箭头 $\alpha$ 上、从 $a$ 到 $b$ 的提升类型等价于 $\alpha_*a=b$。这里的等式是路径类型，不作命题截断。', ['0710','070H'])
note('0712',21,'带基点映射复合的路径公式','Theorem',[(20,29)],
 r'用[带基点映射公式](0711)写态射为 $(f,p)$，其中 $p:f(a)=b$。$\mathsf{ap}_g(p)$ 表示函数 $g$ 作用于路径；$p\cdot q$ 按先 $p$ 后 $q$ 的次序连接；$\mathsf{refl}_a$ 为自反路径。', ['0711','070O'])
note('0713',21,'带基点空间等价于单位空间的余切片','Theorem',[(35,44)],
 r'取[空间范畴](070Q)及其[单位空间](070T)。余切片 $\one/\Sp$ 的对象为箭头 $\one\to A$，态射为底函数和从源箭头到靶箭头的交换三角形。采用[带基点映射公式](0711)和[复合公式](0712)。', ['070Q','070T','0711','0712'])
note('0714',21,'单位带基点空间是零对象','Example',[(45,51)],
 r'使用[带基点映射公式](0711)。零对象指同时初始且终止的对象；初始要求其到任意对象的映射类型可缩，终止则要求反方向可缩。', ['0711'],
 after=r'所用 $\sum_{x:A}(x=a)$ 的收缩中心是 $(a,\mathsf{refl}_a)$，收缩由路径归纳给出；这不声称固定端点的环路类型 $a=a$ 可缩。')
note('0715',21,'带基点空间的乘积','Theorem',[(52,58)],
 r'固定[带基点空间](0710) $(A,a),(B,b)$，并对测试对象 $(X,x_0)$ 使用[映射公式](0711)。高阶乘积要求来自任意测试对象的映射类型是两个映射类型的乘积。', ['0710','0711'],
 after=r'这里的乘积路径公式是 $((a_1,b_1)=(a_2,b_2))\simeq(a_1=a_2)\times(b_1=b_2)$，两方向由投影和路径配对给出，互逆由路径归纳验证。')
note('0716',21,'合成范畴的箭头范畴','Definition',[(60,65)],
 r'合成范畴的约定见[空间范畴页的局部定义](070Q)。$\Delta^1$ 是有向区间；$C^{\Delta^1}$ 是内部形状函数类型，源靶由在 $0,1$ 求值给出。与普通[函子范畴](00I5)相比，这里保留映射空间全部高阶路径。使用合成范畴对形状指数封闭的结论。', ['070Q'])
note('0717',21,'箭头范畴的映射是高阶交换方形','Theorem',[(66,88)],
 r'设 $C$ 是合成范畴，采用[箭头范畴](0716)。记 $\mathsf{Tri}(f,g;k)$ 为边界是 $f,g,k$ 的三角形填充类型。所用三角形纤维公式为 $\mathsf{Tri}(f,g;k)\simeq(g\circ f=k)$，它来自 Segal 合成数据的可缩性。', ['0716'])
note('0718',21,'合成范畴同伦拉回的映射类型','Theorem',[(91,99)],
 r'合成范畴的完备 Segal 条件见[局部约定](070Q)。给定内部函子 $F:A\to C$、$G:B\to C$，同伦拉回对象写作 $(a,b,e)$，其中 $e:Fa\cong Gb$。这里引用完备 Segal 空间的逐层同伦极限模型；以下为讲义给出的模型论证明论证，不展开模型结构的构造。', ['070Q'],
 after=r'更具体地，从 $(a,b,e)$ 到 $(a\prime,b\prime,e\prime)$ 的映射为 $u:a\to a\prime$、$v:b\to b\prime$ 与路径 $G(v)\circ e=e\prime\circ F(u)$。该方形中的路径保留全部高阶相容。')
note('0719',21,'二元运算空间的范畴拉回定义','Definition',[(102,111),(140,142)],
 r'采用[空间范畴](070Q)、[箭头范畴](0716)和[范畴同伦拉回](0718)。平方函子作用于函数为 $F_2(f)=f\times f$；拉回取同伦意义，或先把源靶映射作纤维化表示。', ['070Q','0716','0718'],
 after=r'图表示 $(s,t)\circ U=(F_2,\operatorname{id})\circ V$（一般为指定的相容等价），其中 $V(A,\mu)=A$、$U(A,\mu)=\mu$；对象的严格端点表示是 $s(\mu)=A\times A$、$t(\mu)=A$。')
note('071A',21,'二元运算空间的结构同态公式','Theorem',[(112,130)],
 r'令 $\mathsf{Magma}$ 为[二元运算空间范畴](0719)，使用[箭头方形公式](0717)和[同伦拉回映射公式](0718)。此处不施加结合律或单位律。', ['0719','0717','0718'])
note('071B',21,'二元运算同态的复合路径','Theorem',[(131,139)],
 r'取[二元运算同态](071A)。记 $p_{x,y}:f(\mu(x,y))=\nu(fx,fy)$、$q_{b_1,b_2}:g(\nu(b_1,b_2))=\omega(gb_1,gb_2)$。路径作用和连接记号与[带基点复合](0712)相同。', ['071A','0712'])
note('071C',21,'空间自函子的代数范畴','Definition',[(145,152)],
 r'在[空间范畴](070Q)中取协变内部函子 $F$；其数据包含 $Ff:FA\to FB$ 及全部合成相容。下面使用[箭头范畴](0716)的源靶映射和[范畴同伦拉回](0718)。', ['070Q','0716','0718'])
note('071D',21,'函子代数同态的交换方形公式','Theorem',[(153,163)],
 r'固定协变函子 $F:\Sp\to\Sp$ 及[代数范畴](071C)中的对象 $(A,\mu),(B,\nu)$。使用[箭头方形公式](0717)与[拉回映射类型](0718)。', ['071C','0717','0718'])
note('071E',21,'有限元签名的多项式函子代数','Example',[(164,175)],
 r'使用[代数签名](00DF)：每个符号元数有限，符号总集 $J$ 不必有限。记 $\mathbf{n_j}=\{0,\ldots,n_j-1\}$，$A^{\mathbf{n_j}}$ 为输入元组空间。使用[函子代数](071C)及其[同态公式](071D)。', ['00DF','071C','071D'])
note('071F',21,'结构表达式的方差不能由对象公式猜测','Remark',[(176,178)],
 r'设 $F$ 欲用于[函子代数构造](071C)。协变[函子](00I1)不仅指定对象 $FA$，还必须把每个 $f:A\to B$ 送到方向正确的 $Ff:FA\to FB$。', ['071C','00I1'],
 after=r'例如对自映射 $h:A\to A$，后复合 $f\circ h$ 只有类型 $A\to B$；要得到 $B\to B$ 还缺少从 $B$ 到 $A$ 的输入转换。只有在另有逆或额外结构时才能作类似共轭的定义。')
note('071G',21,'按等价不变对象性质取全子范畴','Definition',[(181,183),(190,192)],
 r'合成范畴的含义见[局部约定](070Q)。这里“性质”明确指命题值：对每个对象 $c$，任意两个 $Q(c)$ 的见证有路径；并要求它对对象等价稳定。全子范畴指选定对象之间保留原有整个映射类型。', ['070Q'])
note('071H',21,'逐顶点全子范畴保持 Segal 条件与完备性','Theorem',[(184,189)],
 r'给定合成范畴 $C$、命题值等价不变性质 $Q$，令 $C_Q$ 按[逐顶点定义](071G)构造。全忠实是指每对对象之间的映射类型比较为等价。', ['071G'])
note('071I',21,'小集合的单价范畴','Definition',[(193,195)],
 r'在[空间范畴](070Q)中，集合指 $0$-截断空间：每个路径类型都是命题（任意两个路径相等）。该性质对空间等价不变，故可用[全子范畴构造](071G)与[封闭性定理](071H)。', ['070Q','071G','071H'])
note('071J',21,'普通幺半群的单价结构范畴','Definition',[(196,198)],
 r'复用普通[幺半群](00II)定义，不另造其代数公理。取[小集合范畴](071I)，用[多项式函子代数](071E)加入常元和二元运算，再按[全子范畴](071G)施加性质。$\one$ 为单元素集合，$+$ 为不交并。', ['00II','071I','071E','071G'])
note('071K',21,'幺半群结构范畴中的态射','Theorem',[(199,204)],
 r'令 $\mathsf{Mon}$ 为[单价幺半群范畴](071J)。[函子代数同态公式](071D)保持所有运算，而[全子范畴](071G)不增加态射条件。', ['071J','071D','071G'])
note('071L',21,'普通群作为幺半群的全子范畴','Definition',[(207,209),(225,227)],
 r'在[幺半群范畴](071J)中使用[群](0001)与[群同态](00BH)的既有定义。若 $u,v$ 都为 $y$ 的两侧逆，则 $u=u(yv)=(uy)v=v$，故逆的存在是命题性质。', ['071J','0001','00BH'],
 after=r'保单位且保乘法的 $f:G\to H$ 自动保持逆，复用[群同态定理](00BH)：$f(x^{-1})f(x)=f(x^{-1}x)=1$ 且 $f(x)f(x^{-1})=f(xx^{-1})=1$，再由上述逆唯一性得 $f(x^{-1})=f(x)^{-1}$。这也解释了为什么取全子范畴无需给箭头另加逆运算条件。')
note('071M',21,'带基点空间的同一性由可逆带基点映射刻画','Theorem',[(230,238)],
 r'取[带基点空间范畴](0710)的对象 $(A,a),(B,b)$，并使用[映射公式](0711)及[复合公式](0712)。', ['0710','0711','0712'], body=r'''
有等价
\[
((A,a)=(B,b))\simeq\sum_{e:A\simeq B}(e(a)=b).
\]
证明：可逆带基点箭头忘却后得到函数的两侧逆，故底函数为等价。反向，若 $e$ 是等价且 $p:e(a)=b$，取拟逆 $g$，将 $p$ 沿 $g$ 作用并与 $ge(a)=a$ 拼接，得到 $g(b)=a$；由此构造保点逆箭头。复合路径按带基点复合公式拼接，逆同伦的相容给出两侧单位比较。再由带基点范畴完备性将可逆箭头识别为对象路径。
普通单价性描述结构同一性与结构等价；有向单价性还保留不可逆的带基点函数，因此组织的是整个范畴而不只是对称性群胚。
''')
note('071N',21,'二元运算空间的同一性由结构等价刻画','Theorem',[(230,238)],
 r'取[二元运算空间范畴](0719)中对象 $(A,\mu),(B,\nu)$，使用[同态公式](071A)与[复合相容](071B)。', ['0719','071A','071B'], body=r'''
有等价
\[
((A,\mu)=(B,\nu))\simeq
\sum_{e:A\simeq B}\prod_{x,y:A}(e(\mu(x,y))=\nu(e(x),e(y))).
\]
若结构同态可逆，忘却后其底函数亦可逆。反向，若底函数 $f$ 为等价且保持运算，选逆 $g$，对 $b_1,b_2:B$ 代入 $a_i=g(b_i)$。由 $f\mu(a_1,a_2)=\nu(fa_1,fa_2)$ 和逆同伦，得到 $g\nu(b_1,b_2)=\mu(gb_1,gb_2)$。这给出逆函数的运算相容；同一方形的拼接给出两侧逆的结构相容。讲义在此使用把相容沿等价传输的高阶操作，不逐阶列出所有相容。范畴完备性最后把可逆结构箭头识别为对象路径。
普通单价性只刻画结构等价；有向单价性还刻画不可逆的结构同态，两种结论不可混同。
''')
note('071O',21,'有向空间宇宙中的统一自映射只能是恒等','Theorem',[(241,261)],
 r'在[空间范畴](070Q)的内部语言中工作，$\prod_{A:\Sp}$ 是保留有向相容的依赖积。使用协变族映射的自动自然性：内部纤维函数族 $\alpha$ 与所有底箭头的传输相容，$\alpha_B f=f\alpha_A$；它由可缩提升比较给出，不是对外部任意函数族的公理。[单位空间](070T)记 $\one$。', ['070Q','070T'])
note('071P',21,'统一有限元空间运算恰为坐标投影','Theorem',[(264,283),(287,289)],
 r'固定有限离散空间 $\mathbf n=\{0,\ldots,n-1\}$，$A^{\mathbf n}=(\mathbf n\to A)$。依赖积在[有向空间范畴](070Q)内部解释；使用[统一自映射页明确的自动自然性输入](071O)，这里应用于元组协变族到普遍族的纤维映射，公式为 $\alpha_B(f\circ x)=f(\alpha_A(x))$。', ['070Q','071O'])
note('071Q',21,'统一零元、一元与二元运算的特例','Example',[(284,286)],
 r'由[统一有限元运算的投影分类](071P)，内部类型 $\prod_{A:\Sp}(A^{\mathbf n}\to A)$ 等价于 $\mathbf n$。', ['071P'])
note('071R',21,'集合上的有限字','Definition',[(292,298)],
 r'固定集合 $X$；$\mathbb N$ 含零，$\mathbf n=\{0,\ldots,n-1\}$。$X^{\mathbf n}$ 是有限位置集合上的函数集合，依赖和同时记录长度与位置函数。', [])
note('071S',21,'有限字的连接运算','Definition',[(299,309)],
 r'固定集合 $X$，令 $X^*$ 为[有限字集合](071R)。以下 $u,v$ 是两个字，其长度为 $m,n$；位置从零编号。', ['071R'])
note('071T',21,'有限字连接构成幺半群','Theorem',[(310,321)],
 r'取[有限字集合](071R)及[连接运算](071S)，验证普通[幺半群](00II)公理。字的相等同时比较长度和位置函数；不同括号的长度沿自然数结合律识别。', ['071R','071S','00II'])
note('071U',21,'由字母赋值递归定义折叠映射','Definition',[(322,332)],
 r'取集合 $X$、[有限字幺半群](071T)和普通[幺半群](00II) $M$，其单位记 $1$。$[x]w$ 采用[连接记号](071S)。', ['071T','00II','071S'])
note('071V',21,'有限字折叠保持连接与单位','Theorem',[(333,348)],
 r'取集合 $X$、幺半群 $M$、函数 $f:X\to M$，令 $\widehat f$ 为[递归折叠映射](071U)；字上的运算是[连接](071S)。幺半群同态采用[保单位与乘法条件](071K)。', ['071U','071S','071K'])
note('071W',21,'有限字幺半群的自由泛性质','Theorem',[(349,358)],
 r'给定集合 $X$ 和[幺半群](00II) $M$，记 $U(M)$ 为其底集，$X^*$ 为[有限字幺半群](071T)。$\mathsf{Mon}$ 的映射采用[幺半群同态](071K)；$\mathbf{Set}$ 的映射为函数。使用[折叠同态定理](071V)。', ['00II','071T','071K','071V'])
note('071X',21,'自由幺半群与遗忘函子的伴随','Theorem',[(359,361)],
 r'采用[小集合范畴](071I)、[幺半群范畴](071J)及[有限字的自由泛性质](071W)。伴随 $L\dashv U$ 是两个变量中自然的映射类型等价 $\Hom(LX,M)\simeq\Hom(X,UM)$。', ['071I','071J','071W'],
 after=r'这里 $L(X)=X^*$，函数 $h:X\to Y$ 被送到逐字母作用的 $h^*:X^*\to Y^*$；逐位置计算给出恒等、复合及连接保持。$U$ 忘去单位和乘法。自由泛性质中两个显式互逆映射的自然性正好是伴随所需的自然性，无须只凭对象公式猜测伴随。')

# These cross-group destinations have been read in full before linking them.
EXTRA_CONTEXT = {
 '0700': ('协变提升的规范定义见[全参数协变条件](0622)。', ['0622']),
 '0701': ('纤维群胚性使用[协变族纤维定理](0628)。', ['0628']),
 '070C': ('单纯空间的两方向采用[规范约定](0600)。', ['0600']),
 '070E': ('相对纤维性采用[Reedy 定义](0605)，替换存在性引用[Reedy 模型结构](0609)。', ['0605','0609']),
 '070G': ('内部映射对象采用[外形状指数](060A)。', ['060A']),
 '070N': (r'所验证的规范条件是[参数化脊柱条件](0612)。零维和一维限制为恒等；方形论证用于 $n\geq2$。', ['0612']),
 '070P': ('可逆性采用[命题值定义](061D)；[两侧逆判据](061E)用于证明可逆，而不是把任意两侧逆数据类型定义成可逆性。', ['061D','061E']),
 '070Q': ('合成范畴的规范定义见[Rezk 完备性](061H)。', ['061H']),
 '070S': ('保持相容由[内部函子自动保持合成](061A)保证。', ['061A']),
 '070W': ('拉回泛性质采用[同伦锥公式](064G)，空间的逐分量计算见[依赖和拉回公式](064H)。', ['064G','064H']),
 '0710': ('这里使用[协变族总空间定理](062J)。', ['062J']),
 '0711': ('依赖箭头的精确比较见[端点路径公式](0627)。', ['0627']),
 '0712': ('底函数的复合使用[空间范畴的合成公式](070O)。', []),
 '0713': ('余切片映射的完整公式见[余切片的映射类型](0631)。', ['0631']),
 '0716': ('箭头范畴为合成范畴由[函数类型封闭性](061M)保证。', ['061M']),
 '0717': ('所用填充计算是[固定边界三角形公式](062L)。', ['062L']),
 '071O': ('自动自然性使用[纤维映射定理](062B)。', ['062B']),
 '071P': ('自动自然性使用[纤维映射定理](062B)。', ['062B']),
 '071X': ('伴随的规范定义见[自然映射空间等价](064I)。', ['064I']),
}
CONTEXT_REPLACEMENTS = {
 '070I': [('固定小空间', '固定[普遍协变族](0700)所分类的小空间')],
 '070S': [('[合成范畴](070Q)意义下的底','[合成范畴](061H)')],
 '0716': [('合成范畴的约定见[空间范畴页的局部定义](070Q)', '使用[合成范畴](061H)')],
 '0718': [('合成范畴的完备 Segal 条件见[局部约定](070Q)', '合成范畴的条件见[Rezk 完备性](061H)'),
          ('以下为讲义给出的模型论证明论证，不展开模型结构的构造', '以下论证以该模型为语义前提，不展开模型结构的构造')],
 '071G': [('合成范畴的含义见[局部约定](070Q)', '采用[合成范畴](061H)的定义')],
 '071J': [('复用普通[幺半群](00II)定义，不另造其代数公理', '普通[幺半群](00II)的公理是单位律与结合律')],
 '071P': [('[统一自映射页明确的自动自然性输入](071O)', '[自动自然性](062B)')],
}
BODY_REPLACEMENTS = {
 '0701': [('尽管在这一阶段尚未证明', '这一分类性质本身尚未断言')],
 '0702': [('前半部的', '普通同伦类型宇宙'),('本章的', '有向分类对象')],
 '0704': [('若上述比较', '若典范比较 $\\mathsf{arrfun}_{A,B}$')],
 '070B': [('在上述模型中', '在[函数链元素范畴模型](070A)中')],
 '070D': [('上述面与退化', '$E_F$ 的面与退化')],
 '070J': [('其外部证明不在本讲义的内部计算中', '此处将封闭性作为外部定理引用')],
 '070M': [('在上述封闭性与顶点检测条件下', '在[封闭性](070J)与[顶点检测](070K)条件下')],
 '070N': [('对于每个 $n$，考虑图', '对于每个 $n\\geq2$，考虑图')],
 '070W': [('证明使用讲义第19章的逐分量计算：', '证明使用[逐分量计算](064H)：')],
 '0717': [('上述等价', '方形类型等价')],
 '071G': [('上述逐顶点构造', '逐顶点构造')],
 '071M': [('将 $p$ 沿 $g$ 作用并与 $ge(a)=a$ 拼接，得到 $g(b)=a$', '记 $\\eta_a:ge(a)=a$，取 $q=(\\mathsf{ap}_g(p))^{-1}\\cdot\\eta_a:g(b)=a$')],
 '071N': [('讲义在此使用把相容沿等价传输的高阶操作，不逐阶列出所有相容', '此处使用把相容沿等价传输的高阶操作；逆构造的相容由传输给出，不逐阶列出所有相容')],
 '071O': [('上述依赖积', '这一内部依赖积')],
 '071X': [('上述双射', '[自由泛性质的双射](071W)')],
}
for n in NOTES:
    for old,new in CONTEXT_REPLACEMENTS.get(n['id'],[]):
        n['context'] = n['context'].replace(old,new)
    if n['id'] in ['0716','0718','071G']:
        n['deps'] = ['061H' if d=='070Q' else d for d in n['deps']]
    if n['id']=='070S': n['deps'].append('061H')
    if n['id']=='071P': n['deps'].remove('071O')
    if n['id']=='070P':
        n['context'] = n['context'].replace('可逆箭头指存在左右逆及两侧复合为恒等的路径；','可逆箭头可用存在左右逆及两侧复合为恒等的路径判定；')
    if n['id']=='070E': n['taxon']='Construction'
    if n['id']=='071E': n['taxon']='Construction'
    if n['id']=='0706': n['after'] += '跨层态射不能彼此连续复合，因此其余复合只涉及恒等；单位律和结合律直接成立。'
    if n['id']=='071B':
        n['context']=n['context'].replace('路径作用和连接记号与[带基点复合](0712)相同。', '$\\mathsf{ap}_g$ 是函数对路径的作用，$p\\cdot q$ 先行 $p$ 后行 $q$。')
        n['deps'].remove('0712')
    if n['id']=='071L': n['after']=n['after'].replace('复用[群同态定理](00BH)', '由[群同态定理](00BH)').replace('上述逆唯一性','两侧逆的唯一性')
    if n['id']=='071S': n['context']=n['context'].replace('以下 $u,v$', '设 $u,v$')
    if n['id']=='071C': n['context']=n['context'].replace('下面使用','使用')
    if n['id'] in EXTRA_CONTEXT:
        context,deps=EXTRA_CONTEXT[n['id']]
        n['context'] += ' '+context
        n['deps'] = list(dict.fromkeys(n['deps']+deps))
    if n['id'] in ['070L','070M','071O','071P','071Q']: n['refs'].append('GratzerWeinbergerBuchholtz')

CANONICAL_CONTEXT = {
 '0700': (r'采用[依赖积](0505)、[依赖和](0507)、[同一性类型](050G)、[可缩类型](0580)和[函数等价](05Z3)的约定，这里的类型是同伦类型而不是模型论类型。小性相对于固定[类型宇宙](05C0)；语境 $\Gamma$ 表示允许变化的参数。协变性采用[全参数提升条件](0622)，沿箭头 $u$ 的传输记 $u_*$。', ['0505','0507','050G','0580','05Z3','05C0','0622']),
 '0701': (r'固定[普遍小协变族](0700) $\varrho:\Sp_\bullet\to\Sp$，设 $A:\Gamma\to\Sp$ 为分类函数；$A_\gamma$ 也表示解码纤维。[群胚类型](061K)允许非平凡高阶路径；协变族的[纤维群胚定理](0628)应用于这些纤维。', ['0700','061K','0628']),
 '0703': (r'固定[普遍小协变族](0700)。$\mathbb I=\Delta^1$ 是带端点 $0,1$ 的有向区间；使用[有向同态类型](060D) $\Hom_C(x,y)$，不预设合成。', ['0700','060D']),
 '070C': (r'设 $F=(A_0\to\cdots\to A_n)$ 为[严格函数链](0709)，$f_{ij}$ 是相邻映射的实际复合。各空间用 [Kan 复形](0422)表示，相邻函数是实际的单纯映射。采用[单纯空间的两方向](0600)：$\Delta^n$ 的外方向 $m$ 层为保序映射 $[m]\to[n]$ 的离散集合；$\coprod$ 表示不交并。', ['0709','0422','0600']),
 '070E': (r'令 $E_F\to\Delta^n$ 为[单纯替换](070C)，其[初始顶点比较](070D)逐层同构。相对 Reedy 纤维替换是在底 $\Delta^n$ 上取逐层弱等价并获得 [Reedy 纤维映射](0605)，存在性引用[Reedy 模型结构](0609)。左纤维化是初始顶点方形为同伦拉回的 Reedy 纤维映射，它表示[协变族](0622)。', ['070C','070D','0605','0609','0622']),
 '070I': (r'固定[普遍协变族](0700)所分类的小空间 $A,B$ 和函数 $f:A\to B$；$\fib_f(b)$ 使用[同伦纤维](058E)记号。使用带端点 $0,1$ 的有向区间 $\mathbb I$ 及扩充模态规则。$[i=0]$ 是端面命题，不是任意普通空间中的无条件规则。', ['0700','058E']),
 '070S': (r'设 $B$ 为[合成范畴](061H)，$E$ 是 $B$ 上的小协变族，仍以 $E:B\to\Sp$ 记其[直化](070R)，值域为[空间范畴](070Q)。内部函数保持合成与高阶相容由[内部函子定理](061A)保证。', ['061H','070R','070Q','061A']),
 '0710': (r'取[空间范畴](070Q)及[普遍协变族](0700)。其总空间为合成范畴使用[协变族总空间定理](062J)。', ['070Q','0700','062J']),
 '0712': (r'设 $(f,p):(A,a)\to(B,b)$、$(g,q):(B,b)\to(C,c)$ 为[带基点映射](0711)，故 $p:f(a)=b$、$q:g(b)=c$。$\mathsf{ap}_g$ 使用[函数的路径作用](0544)，$p\cdot q$ 使用先 $p$ 后 $q$ 的[路径连接](0541)。底函数复合由[空间合成公式](070O)给出。', ['0711','0544','0541','070O']),
 '0716': (r'设 $C$ 为[合成范畴](061H)，$\Delta^1$ 为有向区间；$C^{\Delta^1}$ 是[外形状指数](060A)，源靶由在 $0,1$ 求值给出。它仍为合成范畴，使用[内部函数类型封闭性](061M)。这保留普通[函子范畴](00I5)之外的全部高阶映射路径。', ['061H','060A','061M']),
 '071G': (r'设 $C$ 为[合成范畴](061H)，$Q$ 是其对象上的[命题值性质](0585)，并且对对象等价稳定。全子范畴要求选定对象之间保留原有整个映射类型。', ['061H','0585']),
 '071I': (r'在[空间范畴](070Q)中，[集合性](05Z2)是每个路径类型均为命题的条件，即零截断性。它对空间等价不变，故应用[全子范畴构造](071G)与[封闭性定理](071H)。', ['070Q','05Z2','071G','071H']),
}
FOUNDATION_LINKS = {
 '0702':[('05C6','普通单价宇宙')],
 '070L':[('050G','路径归纳')],
 '070M':[('050K','函数外延性')],
 '070P':[('058I','函数等价的拟逆判据')],
 '070Q':[('050G','路径归纳')],
 '070T':[('050K','函数外延性')],
 '070U':[('050K','函数外延性')],
 '070V':[('050K','函数外延性')],
 '0711':[('058B','命题截断')],
 '0713':[('050K','函数外延性')],
 '0714':[('054J','路径总空间可缩')],
 '0715':[('054G','积类型的路径公式')],
 '0717':[('091C','形状粘合的同伦拉回比较')],
 '071A':[('050K','函数外延性')],
 '071B':[('0544','函数的路径作用'),('0541','路径连接')],
 '071K':[('05CN','集合上幺半群公理的命题性')],
 '071M':[('058H','逆同伦的三角相容修正')],
 '071O':[('050K','函数外延性')],
 '071P':[('050K','函数外延性')],
 '071T':[('054H','依赖和路径公式'),('050K','函数外延性')],
}
for n in NOTES:
    if n['id'] in CANONICAL_CONTEXT:
        n['context'],n['deps']=CANONICAL_CONTEXT[n['id']]
    if n['id'] in FOUNDATION_LINKS:
        links=FOUNDATION_LINKS[n['id']]
        n['context']+=' 所用基础为'+ '、'.join('['+label+']('+id+')' for id,label in links)+'。'
        n['deps']=list(dict.fromkeys(n['deps']+[id for id,label in links]))
    if n['id']=='071M':
        n['title']='带基点映射的可逆性与结构同一性'
        n['body']='带基点映射可逆当且仅当其底函数为等价。由此得到与[普通带基点结构同一性](05CH)一致的公式：\n\n'+n['body']
    if n['id']=='071N':
        n['title']='二元运算同态的可逆性与结构同一性'
        n['body']='二元运算同态可逆当且仅当其底函数为等价。由此得到与[普通运算结构同一性](05CL)一致的公式：\n\n'+n['body']
    if n['id']=='0717':
        n['after']+=' 正方形使用[两三角形剖分](0912)；这里不是把高阶方形替换为仅在连通分支上交换的图。'
    if n['id']=='070G':
        n['context']=n['context'].replace('高阶拓扑斯指满足高阶层下降的空间值层环境', '[高阶拓扑斯](080B)规定外部定理可用的语义环境')
        n['after']+=' 外部证明的图表比较见[参数化左纤维化比较](080Q)；其带权方法的基本记号见[集合权的带权极限](080H)。这些链接描述外部证明输入，不把有限链模型当成完整的语义证明。'
    if n['id']=='070J':
        n['body']=n['body'].replace('在 Gratzer、Weinberger、Buchholtz 的扩充语义中', '在指定的扩充单纯同伦类型论语义中')
    if n['id']=='071X':
        n['body']='''将普通集合与幺半群放入各自单价范畴后，[自由泛性质的双射](071W)就是映射类型的等价，给出自由幺半群函子与遗忘函子的伴随。它把自由对象、[普通 Yoneda](0341)、合成可表性与结构同态联系在一起。'''

MACROS = {'Sp':r'\mathcal{S}','U':r'\mathcal{U}', 'Hom':r'\operatorname{Hom}',
 'id':r'\operatorname{id}','one':r'\mathbf{1}','zero':r'\mathbf{0}',
 'N':r'\mathbb{N}','Int':r'\mathbb{I}','Set':r'\mathbf{Set}',
 'fib':r'\mathsf{fib}','refl':r'\mathsf{refl}','ap':r'\mathsf{ap}',
 'idtoiso':r'\mathsf{idtoiso}','Magma':r'\mathsf{Magma}',
 'Mon':r'\mathsf{Mon}','Grp':r'\mathsf{Grp}'}

def expand(s):
    return re.sub(r'\\([A-Za-z]+)', lambda m: '{'+MACROS[m[1]]+'}' if m[1] in MACROS else m[0], s)

REWRITES = {
 '070E': [('下面的有限单纯形比较定理', '[有限单纯形比较定理](070G)')],
 '070G': [('上一节提供了', '[严格函数链的单纯替换](070C)提供了'),
          ('下一节以后不再使用未说明的分类结论，而直接由本定理及已经建立的类型运算推导空间范畴。', '空间范畴的推导明确使用本定理及同伦类型运算，不以未说明的分类结论代替它。')],
 '070L': [('前一命题', '[端点计算](070L)')],
 '070M': [('前一命题已证明', '[粘合端点定理](070L)已证明')],
 '0710': [('由协变族总空间定理', '由本页所列协变族总空间定理')],
 '071D': [('与二元运算的证明相同：', '由拉回与箭头方形公式：')],
 '0718': [('下面的结构范畴', '以箭头范畴定义的结构范畴')],
 '071P': [('这是 Yoneda 原理的一个直接计算：', '这也可按 Yoneda 的可表函子原则理解：')],
}

def convert(raw):
    # Forester recognizes Markdown links even inside TeX-like source blocks.
    raw = raw.replace('[x](', r'\lbrack x\rbrack(')
    raw = re.sub(r'\\label\{[^}]+\}', '', raw)
    titles = {n['id']:n['title'] for n in NOTES}
    raw = re.sub(r'\\ref\{([^}]+)\}', lambda m:'['+titles[LABELS[m[1]]]+']('+LABELS[m[1]]+')', raw)
    raw = re.sub(r'\\cite(?:\[([^]]+)\])?\{([^}]+)\}',
      lambda m:'、'.join('['+k+('，'+m[1] if m[1] else '')+']('+REFS[k]+')' for k in m[2].split(',')), raw)
    raw = re.sub(r'\\begin\{(definition|proposition|theorem|lemma|example|remark)\}(?:\[[^]]+\])?', '', raw)
    raw = re.sub(r'\\end\{(definition|proposition|theorem|lemma|example|remark)\}', '\n\n', raw)
    raw = raw.replace(r'\begin{proof}', '\n\n证明。').replace(r'\end{proof}', '\n\n')
    raw = expand(raw)
    token = re.compile(r'\\\[(.*?)\\\]|\\begin\{align\*\}(.*?)\\end\{align\*\}', re.S)
    result = []
    pos = 0
    def prose(s):
        for p in re.split(r'\n\s*\n', s.strip()):
            if not p.strip(): continue
            p = re.sub(r'\$([^$]+)\$', lambda m:'#{'+m[1].strip()+'}', p)
            result.append('\\p{'+p.strip()+'}')
    for m in token.finditer(raw):
        prose(raw[pos:m.start()])
        math = m[1] if m[1] is not None else '\\begin{aligned}'+m[2]+'\\end{aligned}'
        if r'\begin{tikzcd}' in math:
            math = math.strip().replace(r'\ar[', r'\arrow[')
            result.append('\\figure{\\tex{\\usepackage{amsmath,amssymb}\n\\usepackage{tikz-cd}}{\n'+math+'\n}}')
        else:
            result.append('##{'+math.strip()+'}')
        pos = m.end()
    prose(raw[pos:])
    return '\n\n'.join(result)

OUTLINES = {
 '020K': (20,'有向单价宇宙与空间范畴',r'''
本章先从[普遍协变族](0700)和[普通单价性](0702)区分路径与有向箭头，再以[箭头到函数比较](0703)定义[有向单价性](0704)。[空空间例子](0705)说明不可逆方向不可忽略，[分类拉回图](0701)则解释对象的解码。

离散模型从[单一函数](0706)、[唯一提升](0707)及其[分类](0708)开始，推广到[有限链](0709)、[链的元素范畴](070A)和[面与退化](070B)。空间模型使用[单纯替换](070C)、[限制相容](070D)及[Reedy 替换](070E)。

[函数链分类对象](070F)引出作为外部输入的[高阶比较定理](070G)，其[一维推论](070H)与[内部粘合公式](070I)相呼应。另一条路线明确依赖[封闭性](070J)和[顶点检测](070K)，再计算[端点](070L)与[逆比较](070M)。

[Segal 条件](070N)、[复合公式](070O)与[可逆箭头判据](070P)共同导向[空间范畴](070Q)。最后讨论[直化与反直化](070R)、[传输的函子解释](070S)，以及[终对象](070T)、[乘积](070U)、[指数](070V)和[同伦拉回](070W)。

讲义将有向单价性与空间范畴分别对应 Riehl 报告定义7.1与推论7.2；两条路线的外部前提和内部推导在本章链接中分开保留。
'''),
 '020L': (21,'带结构空间与结构同态',r'''
从[带基点空间范畴](0710)、[映射类型](0711)与[复合](0712)出发，[余切片解释](0713)导出[零对象](0714)和[乘积](0715)。

结构同态由[箭头范畴](0716)的[交换方形](0717)与[范畴拉回](0718)计算：[二元运算空间](0719)具有[同态公式](071A)和[复合路径](071B)，进而推广到[函子代数](071C)、[一般同态公式](071D)和[有限元签名](071E)，同时检验[方差限制](071F)。

[全子范畴定义](071G)及其[封闭性](071H)把公理当作对象性质处理，由此得到[集合](071I)、[幺半群](071J)、[幺半群态射](071K)及[群范畴](071L)。群同态保持逆复用[已有结果](00BH)。[带基点结构同一性](071M)与[二元运算结构同一性](071N)说明可逆情形如何回到普通单价性。

内部统一性还有严格限制：[统一自映射](071O)只能为恒等，[有限元运算](071P)只能取投影，[低元数例子](071Q)包括不存在统一选点。最后从[有限字](071R)及[连接](071S)构造[字幺半群](071T)，以[折叠](071U)及其[同态性](071V)证明[自由泛性质](071W)，得到[自由与遗忘的伴随](071X)。

结构同态主题对应 Riehl 报告第7.2节；统一操作的自动自然性主题对应 Gratzer、Weinberger、Buchholtz 第7节。两处均保留内部构造与外部随意选取的区别。
''')}

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    audit = dict(group='directed', sourceRoot=str(SOURCE), date='2026-09-25',
      reviews={}, prerequisites={}, sourceCoverage=[], labels=LABELS,
      concepts={}, citations=REFS, corrections=[], deferred=[], existingAugmentations=[],
      crossrefs=[], semanticReview={'method':'Manual full reading of both source chapters, editorial range assignment, local-context and proof-boundary review. Mechanical checks do not establish mathematical correctness.',
      'scope':'Only this group and the explicitly inspected canonical prerequisite destinations; no whole-site review or full build.'})
    for n in NOTES:
        raw = n['body'] if n['body'] is not None else '\n\n'.join('\n'.join(LINES[n['chapter']][a-1:b]) for a,b in n['ranges'])
        for old,new in REWRITES.get(n['id'], []): raw = raw.replace(old,new)
        for old,new in BODY_REPLACEMENTS.get(n['id'], []): raw = raw.replace(old,new)
        refs = list(dict.fromkeys(['RiehlICM']+n['refs']))
        metadata = '[系统讲义](0210)，第 '+str(n['chapter'])+' 章；'+'；'.join('[引用]('+REFS[k]+')' for k in refs)
        content = '\\title{'+n['title']+'}\n\\date{2026-09-25}\n\\taxon{'+n['taxon']+'}\n\\author{author}\n\\meta{source}{'+metadata+'}\n\n'
        content += convert(n['context']+'\n\n'+raw+'\n\n'+n['after'])+'\n'
        assert r'\!' not in content
        (OUT/(n['id']+'.tree')).write_text(content)
        audit['reviews'][n['id']] = dict(title=n['title'], action='split-and-integrate',
          reason='单一问题：'+n['title']+'。独立列出语境与实际前置，保留所分配原文的论证或明确的外部输入边界。',
          scope='逐页人工核对所列源行、局部变量、前置、公式及证明边界；渲染检查单独记录。')
        audit['prerequisites'][n['id']] = n['deps']
        audit['concepts'][n['title']] = n['id']
        for a,b in n['ranges']:
            audit['sourceCoverage'].append(dict(file=FILES[n['chapter']],sourceLines=[a,b],ids=[n['id']],notes='完整保留并局部化本单元；共享行段的独立结果由多个原子共同覆盖。'))
    for id,(chapter,title,raw) in OUTLINES.items():
        (OUT/(id+'.tree')).write_text('\\title{'+title+'}\n\\date{2026-09-25}\n\\taxon{Outline}\n\\author{author}\n\\meta{source}{[系统讲义](0210)，第 '+str(chapter)+' 章；[引用](0211)；[引用](' + ('021H' if chapter==20 else '021G') + ')}\n\n'+convert(raw)+'\n')
        audit['reviews'][id] = dict(title=title,action='outline',reason='以短链接叙事组织独立原子，不作为前置节点。',scope='只审查本组章节阅读路线。')
    audit['sourceCoverage'].append(dict(file=FILES[21],sourceLines=[210,224],ids=['00BH','071L'],notes='群同态保逆的原定理复用00BH；原两侧逆等式及逆唯一性的计算作为071L全子范畴定义的直接论证保留，不新建重复定理。'))
    audit['sourceCoverage'].extend([
      dict(file=FILES[20],sourceLines=[309,309],ids=['020K','0704','070Q'],notes='章末来源归属与两条证明路线移入元数据及短叙事。'),
      dict(file=FILES[21],sourceLines=[362,362],ids=['020L'],notes='章末来源归属保留于元数据及短叙事。')])
    audit['corrections'] = [
      dict(ids=['071V'],change='保留父任务发现的Forester修复：公式[x](u\u0027v)写成\\lbrack x\\rbrack(u\u0027v)，避免误解析为Markdown链接。转换规则同步，交接后不得重跑生成器覆盖人工调整。'),
      dict(ids=['070T','070U','070V'],change='原组合命题按终对象、乘积、指数分为三条独立结果，分配相应证明。'),
      dict(ids=['070J','070K'],change='原同一注记中的封闭性与顶点检测分开，显式标为外部输入。'),
      dict(ids=['071G','071H'],change='把原文证明使用的命题值假设前置到定义，避免把任意数据族当成对象性质。'),
      dict(ids=['071M','071N'],change='将带基点与二元运算的结构同一性分别成页；保留讲义以相容传输给出逆的论证层级。'),
      dict(ids=['071E'],change='标题改为有限元签名：元数有限不意味着运算符号集合有限。'),
      dict(ids=['070W'],change='将原先依赖上一章的证明调用展开为该章已有的逐分量计算，仍注明来源。'),
      dict(ids=['070N'],change='明确零维、一维脊柱限制为恒等；含函数链拉回的方形用于n>=2，避免空链拉回记号歧义。'),
      dict(ids=['070P'],change='可逆性采用061D的命题值定义；两侧逆只用作判据，不能把完整拟逆数据类型误当成可逆性。'),
      dict(ids=['071M'],change='写明保点逆的路径方向q=(ap_g(p))^{-1}·eta_a，并链接逆同伦三角相容修正058H。'),
      dict(ids=['071M','071N'],change='主题限定为一般结构同态的可逆性；普通结构同一性公式链接既有05CH/05CL，不重复新建其定义。'),
      dict(ids=[n['id'] for n in NOTES],change='局部引入变量；标准化全部自定义数学宏；形式源标签映射到本组确定ID。')]
    audit['crossrefs'] = [
      dict(ids=['0700','0703','0710','0711'],sourceLabel='def:covariant',needed='协变族定义与可缩提升'),
      dict(ids=['0701'],sourceLabel='thm:covariant-groupoid',needed='协变族纤维群胚性'),
      dict(ids=['0711'],sourceLabel='prop:dependent-arrow',needed='依赖箭头端点公式'),
      dict(ids=['0710'],file='17_covariant.tex',sourceLines=[192,216],needed='协变族总空间定理；原文无标签'),
      dict(ids=['0716'],file='16_segal.tex',needed='合成范畴对形状指数封闭；待父任务确认精确原子'),
      dict(ids=['0717'],sourceLabel='lem:triangle-path',needed='三角形纤维公式'),
      dict(ids=['071O','071P'],sourceLabel='thm:automatic-naturality',needed='族映射自动自然性'),
      dict(ids=['070Q','0716','0718','071G'],sourceLabel='def:rezk',needed='合成范畴的规范定义；当前使用明确局部约定'),
      dict(ids=['0702','070M'],sourceLabel='def:univalence',needed='普通单价性与函数外延性'),
      dict(ids=['0714'],sourceLabel='prop:based-contractible',needed='基点路径总空间的收缩'),
      dict(ids=['071T'],sourceLabel='thm:sigma-path',needed='依赖和路径公式'),
      dict(ids=['070G'],target='080Q',needed='外部左纤维化图表比较；父任务给定ID，尚未作为本组前置边合并'),
      dict(ids=['070G'],target='080H',needed='外部证明中的带权极限；是外部证明背景，不是已给内部证明'),
      dict(ids=['070G'],target='080B',needed='高阶拓扑斯定义；父任务给定ID')]
    resolved_labels = {'def:covariant':'0622','thm:covariant-groupoid':'0628',
      'prop:dependent-arrow':'0627','lem:triangle-path':'062L',
      'thm:automatic-naturality':'062B','def:rezk':'061H',
      'def:univalence':'05C6','prop:based-contractible':'054J','thm:sigma-path':'054H'}
    for c in audit['crossrefs']:
        if 'sourceLabel' in c:
            c['target']=resolved_labels[c['sourceLabel']]
            c['status']='resolved-prerequisite-directly-or-transitively'
        elif c.get('file')=='17_covariant.tex':
            c.update(target='062J',status='resolved-direct-prerequisite')
        elif c.get('file')=='16_segal.tex':
            c.update(target='061M',status='resolved-direct-prerequisite')
        else:
            c['status']='resolved-external-scope-or-proof-background-link'
        c['needed']=c['needed'].split('；')[0]
    audit['crossrefs'].append(dict(ids=['070M','071O','071P'],target='050K',status='resolved-direct-prerequisite',needed='函数外延性'))
    audit['crossrefs'].append(dict(ids=['0717'],target='091C',status='resolved-direct-prerequisite',needed='平方三角剖分的相容填充空间；0912为几何解释链接'))
    audit['canonicalInspection'] = ['00I0','00I1','00I2','00I4','00I5','00G2','00E0','00E2','00E3','00F8','01FX','01FR','01FS','003J','00IH','012G','012U','00II','00BH','00DF']
    audit['canonicalDecisions'] = [
      dict(id='00BH',action='reuse',reason='已含群同态保单位保逆的完整基本论证；本组不修改。额外两侧逆计算服务071L的性质论证。'),
      dict(id='00II',action='reuse',reason='普通幺半群定义已足够；新页只构造其单价范畴及自由对象。'),
      dict(id='01FS',action='do-not-reuse-as-general',reason='专指光滑概形上的单纯预层，不冒充普通预层或任意单纯空间定义。'),
      dict(id='00G2',action='do-not-conflate',reason='这是等价关系与商集合，不是HoTT的函数等价。'),
      dict(id='012G',action='do-not-conflate',reason='幺半范畴不是幺半群。')]
    audit['canonicalInspection'].append('0001')
    audit['crossGroupInspection'] = sorted(set(d for n in NOTES for d in n['deps'] if not d.startswith('07') and not d.startswith('00')) | {'0341','05CH','05CL','080B','080H','080Q','0912'})
    audit['externalInputs'] = [
      dict(id='070E',status='conditional-construction',input='Reedy模型结构和相对纤维替换存在性；仅证明初始顶点比较在替换后保持。'),
      dict(id='070G',status='cited-external-theorem',input='普遍左纤维化存在性、任意语境中的逆比较及面退化相容；不提供完整外部证明。'),
      dict(id='070J',status='cited-external-theorem',input='扩充语义中的空间宇宙封闭性。'),
      dict(id='070K',status='cited-external-theorem',input='指定扩充语义中空间值族的顶点检测。'),
      dict(id='0718',status='model-dependent-proof-argument',input='完备Segal模型的逐层同伦拉回；保留原模型论论证，不补称其一般模型结构构造已证。'),
      dict(id='071N',status='source-level-transport-argument',input='结构相容沿等价传输；保留原论证层级，不声称逐阶展开全部高阶相容。')]
    audit['semanticReview']['reviewedIds']=[n['id'] for n in NOTES]+list(OUTLINES)
    audit['semanticReview']['concreteChecks']=['67条原子逐页核对原始行段与生成正文；证明与例子未以章节概述代替。','校正保点逆路径方向、可逆性数据/性质区别、零一维脊柱边界。','读过跨组实际定义页再接入链接；群同态、幺半群、代数签名复用旧规范。','67原子无未映射源数学行；所有形式源标签已定位。']
    audit['changedFiles']=['trees/math/topology/synthetic/directed/'+id+'.tree' for id in sorted([n['id'] for n in NOTES]+list(OUTLINES))]+['research/riehl-directed.json','scripts/riehl-directed.py','scripts/riehl-directed.check.mjs']
    audit['handoff']={'status':'ready-for-parent-validation','doNotRerunGeneratorAfterManualParentEdits':True,'existingCanonicalFilesEdited':False,'canonicalAdditionsNeeded':[],'sourceUnitsDeferred':[],'wholeSiteBuildOwner':'parent'}
    audit['validation'] = {'status':'pending-local-checks','fullForestBuild':'not-run-by-instruction'}
    (ROOT/'research/riehl-directed.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
    print(f'Wrote {len(NOTES)} atomic notes, {len(OUTLINES)} outlines and group audit.')

if __name__ == '__main__':
    main()
