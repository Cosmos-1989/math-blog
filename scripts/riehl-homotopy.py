"""Reproducible, explicitly curated conversion for chapters 5--8 only.

The selections, local contexts, splits and corrections below are editorial input;
the converter only translates markup and records source coverage.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path('/Users/sunzy/Downloads/riehl_synthetic_lectures_source/chapters')
OUT = ROOT / 'trees/math/topology/synthetic/homotopy'
FILES = {5: '05_topology.tex', 6: '06_simplicial.tex', 7: '07_kan.tex', 8: '08_families.tex'}
LINES = {n: (SOURCE / f).read_text().splitlines() for n, f in FILES.items()}
REFS = dict(zip(['RiehlICM','RiehlContext','Hatcher','Friedman','Quillen','GoerssJardine','HoTT','Rijke','AwodeyWarren','RiehlSemantics','RiehlCatHomotopy','Rezk','RiehlShulman','YonedaFormal','RiehlVerity','GratzerWeinbergerBuchholtz','CavalloRiehlSattler','LurieHTT','ShulmanUniverses'], ['0211','0212','0213','0214','0215','0216','0217','0218','0219','021A','021B','021C','021D','021E','021F','021G','021H','021I','021J']))
LABELS = {'thm:quillen': '042A', 'prop:SM7': '042C', 'prop:relativepath': '042J', 'thm:beck': '0438'}
MACROS = {'id': r'\mathrm{id}', 'R': r'\mathbb{R}', 'ev': r'\operatorname{ev}', 'fib': r'\operatorname{fib}', 'op': r'{\mathrm{op}}', 'Set': r'\mathbf{Set}', 'Top': r'\mathbf{Top}', 'sSet': r'\mathbf{sSet}', 'Hom': r'\operatorname{Hom}', 'Fun': r'\operatorname{Fun}', 'Nat': r'\operatorname{Nat}', 'Map': r'\operatorname{Map}', 'colim': r'\operatorname*{colim}'}
NOTES = []
COVERAGE = []

def expanded(s):
    s = re.sub(r'\\([A-Za-z]+)', lambda m: MACROS.get(m[1], m[0]), s).replace(r'\!', '')
    return re.sub(r'\\(le|ge)(?=\d+/)', lambda m: '\\' + m[1] + ' ', s)

def convert(s):
    s = expanded(s)
    s = re.sub(r'\\label\{[^}]+\}', '', s)
    label_titles = {'thm:quillen':'Quillen 模型结构','prop:SM7':'指数提升性质','prop:relativepath':'相对路径分解','thm:beck':'基变换公式'}
    s = re.sub(r'\\ref\{([^}]+)\}', lambda m: '[' + label_titles[m[1]] + '](' + LABELS[m[1]] + ')' if m[1] in LABELS else '（源文标签 ' + m[1] + '）', s)
    s = re.sub(r'\\cite\{([^}]+)\}', lambda m: '、'.join('[' + k + '](' + REFS[k] + ')' for k in m[1].split(',')), s)
    s = re.sub(r'\\begin\{proof\}', r'\n\n证明。\n', s)
    s = re.sub(r'\\(?:begin|end)\{(?:definition|proposition|lemma|theorem|example|remark|proof)\}(?:\[[^\]]*\])?', '\n\n', s)
    blocks = []
    def save(block):
        blocks.append(block)
        return '\n\n@@BLOCK' + str(len(blocks)-1) + '@@\n\n'
    s = re.sub(r'\\\[\s*(\\begin\{tikzcd\}[\s\S]*?\\end\{tikzcd\})\s*\\\]', lambda m: save('\\figure{\\tex{\\usepackage{amsmath}\n\\usepackage{amssymb}\n\\usepackage{tikz-cd}}{\n' + m[1].replace(r'\ar[', r'\arrow[') + '\n}}'), s)
    s = re.sub(r'\\\[([\s\S]*?)\\\]', lambda m: save('##{' + m[1].strip() + '}'), s)
    s = re.sub(r'\\begin\{align\*\}([\s\S]*?)\\end\{align\*\}', lambda m: save('##{\\begin{aligned}\n' + m[1].strip() + '\n\\end{aligned}}'), s)
    s = re.sub(r'\$([^$]+)\$', lambda m: '#{' + m[1] + '}', s)
    paras = []
    for p in re.split(r'\n\s*\n', s.strip()):
        p = p.strip()
        if not p:
            continue
        m = re.fullmatch(r'@@BLOCK(\d+)@@', p)
        paras.append(blocks[int(m[1])] if m else '\\p{' + p + '}')
    return '\n\n'.join(paras)

def add(id, chapter, title, taxon, ranges, context, deps, body=None, after='', scope='逐项核对陈述、局部变量、证明步骤与必要前置；独立概念已拆分'):
    source = '\n\n'.join('\n'.join(LINES[chapter][a-1:b]) for a,b in ranges)
    NOTES.append(dict(id=id, chapter=chapter, title=title, taxon=taxon, ranges=ranges, context=context, deps=deps, body=source if body is None else body, after=after, scope=scope))
    for a,b in ranges:
        COVERAGE.append(dict(file=FILES[chapter], sourceLines=[a,b], ids=[id], notes=scope))

def reuse(chapter, a, b, ids, reason):
    COVERAGE.append(dict(file=FILES[chapter],sourceLines=[a,b],ids=ids,notes=reason))

# Chapter 5. The standard path, homotopy and equivalence definitions stay canonical.
reuse(5,3,5,['00F5','0400'],'道路定义复用；常值与反向运算另页。')
reuse(5,6,8,['00FO'],'已有相对同伦定义完整覆盖，不复制或编辑。')
add('0400',5,'恒定路径与路径反向','Construction',[(4,4)],r'设 $X$ 是[拓扑空间](00E0)，$I=[0,1]$，$p:I\to X$ 是从 $x$ 到 $y$ 的[道路](00F5)。',['00F5'],r'点 $x$ 的恒定路径为 $e_x(t)=x$。反向路径为 $\overline p(t)=p(1-t)$，它从 $y$ 到 $x$。两者连续，因为常值映射与区间反射连续。')
add('0401',5,'同伦是与复合相容的等价关系','Theorem',[(9,22)],r'固定空间 $X,Y$，并用[映射同伦](00FO)比较连续映射 $X\to Y$；[等价关系](00G2)指自反、对称、传递。',['00FO','00G2'],after=r'这里使用有限闭集粘贴引理：有限闭覆盖上的连续映射若在交上相等，就拼成连续映射。证明是对任意闭集取原像，各块原像在全空间闭，有限并仍闭。')
add('0402',5,'路径的分段复合','Construction',[(23,33)],r'在空间 $X$ 中，设 $p,q$ 为[道路](00F5)，下式约定先走 $p$ 再走 $q$，参数 $t$ 属于 $I=[0,1]$。',['00F5'],after=r'两段在 $t=1/2$ 同为 $y$，由有限闭集粘贴引理连续；该引理的证明见[同伦的相容性](0401)。')
add('0403',5,'保持端点的重新参数化不改变路径同伦类','Theorem',[(34,39)],r'设 $p:I\to X$ 为[道路](00F5)，$I=[0,1]$；[相对端点同伦](00FO)指整个同伦在 $\{0,1\}$ 上不变。',['00F5','00FO'])
add('0404',5,'路径同伦类的群胚运算律','Theorem',[(40,55)],r'设 $p:x\to y$、$q:y\to z$、$r:z\to w$ 为同一空间中的道路，使用[分段复合](0402)、[常值及反向路径](0400)和[保持端点的重新参数化](0403)。',['0402','0400','0403','0401'],after=r'复合也不依赖同伦代表元：将 $p\simeq p^{\prime}$ 与 $q\simeq q^{\prime}$ 的同伦按第一参数各缩放到半区间，再沿公共端点粘贴。因而上述等式确实定义在端点固定同伦类上。')
add('0405',5,'空间的基本群胚','Definition',[(56,58)],r'设 $X$ 是拓扑空间。[群胚运算律](0404)说明路径同伦类能够组成[范畴](00I0)。群胚意为每个态射均可逆的范畴。',['0404','00I0'],r'基本群胚 $\Pi_1X$ 的对象为 $X$ 中的点，从 $x$ 到 $y$ 的态射为从 $x$ 到 $y$ 的端点固定路径同伦类。复合由路径拼接诱导，单位为恒定路径类，逆为反向路径类。')
add('0406',5,'基本群是基本群胚中的自同构群','Definition',[(57,57)],r'设 $x$ 是空间 $X$ 的基点，使用[基本群胚](0405)和[群](0001)的定义。',['0405','0001'],r'基本群定义为 $\pi_1(X,x)=\operatorname{Aut}_{\Pi_1X}(x)$。其元素是以 $x$ 为基点的闭道路的端点固定同伦类，乘法为先后拼接，单位为常值环路类，逆为反向环路类。')
add('0407',5,'基本群胚遗忘高阶同伦信息','Remark',[(59,61)],r'设 $X$ 是拓扑空间；[基本群胚](0405)用路径同伦类替代路径本身。',['0405'])
reuse(5,64,66,['0116','0408'],'同伦等价复用 0116，可缩性独立成页；映射级措辞提交父组补充。')
add('0408',5,'可缩空间','Definition',[(65,65)],r'设 $X$ 为[拓扑空间](00E0)，同伦采用[映射同伦](00FO)。',['00FO','0116'],r'空间 $X$ 可缩，指存在 $x_0\in X$ 及连续映射 $H:X\times[0,1]\to X$，满足 $H(x,0)=x$、$H(x,1)=x_0$，即恒等映射同伦于常值映射。这等价于 $X$ 与一点空间[同伦等价](0116)。空空间不可缩。')
add('0409',5,'非空凸集的线性收缩','Example',[(67,69)],r'在 $\mathbb R^n$ 的通常拓扑中，凸集指任意两点间的线段仍在集合内；使用[可缩空间](0408)。',['0408'],r'若 $X\subseteq\mathbb R^n$ 为非空凸集，取 $x_0\in X$。公式 $H(x,t)=(1-t)x+tx_0$ 连续且取值于 $X$，在 $t=0$ 是恒等映射，在 $t=1$ 是常值映射，因此 $X$ 可缩。')
add('040A',5,'圆柱与圆周同伦等价','Example',[(68,68)],r'令 $S^1=\{z\in\mathbb C:|z|=1\}$、$I=[0,1]$，圆柱带[积拓扑](00EI)，采用[同伦等价](0116)。',['0116','00EI'],r'投影 $r:S^1\times I\to S^1$ 的同伦逆为 $i(z)=(z,0)$。有 $ri=\id_{S^1}$，而 $H((z,s),t)=(z,(1-t)s)$ 把圆柱恒等映射同伦到 $ir$。')
add('040B',5,'同伦导致基本群映射的基点共轭','Theorem',[(70,79)],r'设 $X,Y$ 为空间，使用[同伦](00FO)、[基本群](0406)、[路径拼接](0402)和[反向路径](0400)。复合路径的括号在同伦类中可省略。',['00FO','0406'],after=r'更明确地，方形中下边参数路径与左边、上边、右边反向的分段路径具有相同端点；在凸方形内线性插值给出它们的端点固定同伦，再复合方形映射即可。')
add('040C',5,'高阶同伦群','Definition',[(80,82)],r'设 $(X,x)$ 是带基点的空间，使用[相对同伦](00FO)；$S^n=\{v\in\mathbb R^{n+1}:\|v\|=1\}$，并选定其基点。令 $I=[0,1]$，$\partial I^n$ 为至少一个坐标等于 $0$ 或 $1$ 的点组成的边界。',['00FO','0406'],r'对 $n\ge1$，$\pi_n(X,x)$ 为基点保持映射 $(S^n,*)\to(X,x)$ 的基点保持同伦类。其拼接运算可用等价的立方体模型 $I^n/\partial I^n$ 描述：把立方体边界映到 $x$，沿第一坐标将两映射各缩放到半个立方体并粘贴。单位是常值映射，逆由第一坐标反射给出。该运算给出群；$n=1$ 时为[基本群](0406)。')
add('040T',5,'路径连通分支集合','Definition',[(81,81)],r'设 $X$ 为拓扑空间，使用[道路](00F5)、[恒定和反向路径](0400)及[路径拼接](0402)。',['00F5','0400','0402','00G2'],r'定义 $x\sim y$ 当且仅当存在从 $x$ 到 $y$ 的路径。恒定路径、反向和拼接分别证明自反性、对称性和传递性，故这是[等价关系](00G2)。商集合 $\pi_0(X)=X/{\sim}$ 称路径连通分支集合；它通常不自带群结构。连续映射 $f:X\to Y$ 将路径送到路径，从而诱导 $\pi_0(f):[x]\mapsto[f(x)]$。')
add('040D',5,'弱同伦等价','Definition',[(81,81)],r'设 $f:X\to Y$ 为连续映射，$\pi_0$ 表示[路径分支集合](040T)，$\pi_n$ 表示[高阶同伦群](040C)。',['040C','040T'],r'称 $f$ 为弱同伦等价，若它诱导 $\pi_0(X)\to\pi_0(Y)$ 的双射，并对每个 $x\in X$ 和每个 $n\ge1$ 诱导群同构 $f_*:\pi_n(X,x)\to\pi_n(Y,f(x))$。这里 $f_*$ 将代表映射 $u$ 送到 $f\circ u$。')
add('040E',5,'同伦等价与 Whitehead 定理的适用边界','Remark',[(83,85)],r'比较[同伦等价](0116)与[弱同伦等价](040D)。',['0116','040D'],r'同伦等价总是弱同伦等价。Whitehead 定理断言，CW 复形之间的弱同伦等价是同伦等价；也可推广到具有 CW 同伦型的空间。CW 复形是由点出发逐维沿球面边界添附闭球、赋弱拓扑并满足闭包有限条件的空间。这是外部代数拓扑定理，本页不证明它。对任意点集拓扑空间不能无条件逆推。本讲义只用单纯集合的模型结构处理弱等价。',scope='核对 CW 假设；外部 Whitehead 定理不冒充本文证明')
add('040F',5,'紧开路径空间与指数律','Definition',[(88,94)],r'设 $X$ 是空间，$I=[0,1]$；使用[连续映射](00E2)与[积拓扑](00EI)。',['00E2','00EI'],after=r'紧开拓扑的子基为 $[C,U]=\{h:h(C)\subseteq U\}$，其中 $C$ 为参数空间的紧子集，$U$ 为 $X$ 的开集。“紧”指每个开覆盖有有限子覆盖，Hausdorff 指不同点有不交开邻域；局部紧 Hausdorff 空间中每点有紧邻域。指数律的明确内容是：$h:T\to X^K$ 连续当且仅当 $\widetilde h:T\times K\to X$、$\widetilde h(t,k)=h(t)(k)$ 连续。此拓扑学定理在源文中直接使用，这里不声称证明。')
add('040G',5,'连续的一族路径不同于逐点选择路径','Example',[(95,100)],r'设 $X^I$ 是[紧开路径空间](040F)，$I=[0,1]$；用[相对同伦](00FO)表达端点固定。',['040F','00FO'])
add('040H',5,'Hurewicz 纤维化的同伦提升性质','Definition',[(103,112)],r'所有对象均为拓扑空间、箭头为[连续映射](00E2)，令 $I=[0,1]$，$T\times I$ 带[积拓扑](00EI)。',['00E2','00EI'],after=r'交换方块表示 $pu(t)=H(t,0)$；提升要求 $p\widetilde H=H$ 且 $\widetilde H(t,0)=u(t)$。量词遍及所有参数空间 $T$，不仅仅取一点。')
add('040I',5,'积投影是 Hurewicz 纤维化','Example',[(113,115)],r'给定空间 $B,F$，按[Hurewicz 纤维化](040H)的定义检验投影。',['040H'],r'投影 $B\times F\to B$ 是纤维化。给定任意空间 $T$、底同伦 $H:T\times I\to B$ 和初值 $u(t)=(H(t,0),v(t))$，令 $\widetilde H(t,s)=(H(t,s),v(t))$。此映射连续，满足所需初值和投影等式。')
add('040J',5,'覆盖映射具有唯一的同伦提升','Example',[(114,114)],r'设 $p:E\to B$ 为覆盖映射：每个 $b\in B$ 有开邻域 $U$，使 $p^{-1}(U)$ 为开集的不交并，且每一片到 $U$ 的限制是[同胚](00E3)。',['00E3','040H'],r'覆盖映射具有[同伦提升性质](040H)。固定起点时路径提升唯一；更一般地给定初值的同伦提升唯一。覆盖的每个纤维离散，局部同胚片中的唯一提升可逐段粘接。这是源文引用的覆盖空间基本性质，并未提供完整证明；一般纤维化不具有这种严格唯一性。',scope='保留源文无完整证明的覆盖空间例子；补全覆盖的局部定义与唯一性的条件')
add('040K',5,'Hurewicz 纤维化在拉回下稳定','Theorem',[(116,121)],r'设 $p:E\to B$ 是[Hurewicz 纤维化](040H)，$f:A\to B$ 连续；拉回 $A\times_BE=\{(a,e):f(a)=p(e)\}$ 带积空间的[子空间拓扑](00EJ)。',['040H','00EJ'])
add('040L',5,'提升存在、连续选择与严格唯一性的区别','Remark',[(122,124)],r'设 $p:E\to B$ 连续，$B^I$ 带[紧开拓扑](040F)；[Hurewicz 条件](040H)要求任意参数空间的提升。',['040H','040F'],r'逐条路径可提升，并不自动给出对全部路径连续的选择，也不保证严格唯一。源文的警示若用于完整 Hurewicz 条件，须作如下限定：完整条件本身可产生一个连续提升函数。令 $T=E\times_{B,\operatorname{ev}_0}B^I$，初值为 $(e,\gamma)\mapsto e$，底同伦为 $((e,\gamma),t)\mapsto\gamma(t)$。Hurewicz 条件给出连续提升，指数律将它转置为连续的路径提升选择。这个选择仍非典范，也未附带所有更高相容性。提升空间可缩是另一种同伦唯一性，须另证，不能从任意逐路径提升存在直接推出。',scope='实质校正源文：全参数 Hurewicz 性质确实蕴含连续路径提升函数')
add('040M',5,'映射路径空间给出映射的分解','Construction',[(127,134)],r'设 $f:X\to Y$ 连续，$Y^I$ 为[紧开路径空间](040F)，$e_y$ 为[恒定路径](0400)；以下集合带 $X\times Y^I$ 的子空间拓扑。',['040F','0400','00EJ'])
add('040N',5,'常值路径包含是同伦等价','Theorem',[(139,143)],r'设 $f:X\to Y$，在其[映射路径空间](040M)中，$i(x)=(x,e_{f(x)})$ 是[同伦等价](0116)。',['040M','0116'],after=r'这里 $s,t\in[0,1]$，$K_0=\id_{E_f}$、$K_1=ir$，而 $K_s$ 始终保持路径起点为 $f(x)$。连续性由紧开路径空间的指数律得出。')
add('040O',5,'映射路径分解的终点评价是纤维化','Theorem',[(145,154)],r'设 $f:X\to Y$，令 $E_f$ 为[映射路径空间](040M)、$q(x,p)=p(1)$。则 $q$ 是[Hurewicz 纤维化](040H)。取任意参数空间 $T$，下文 $a\in T$、$s,t\in I=[0,1]$。',['040M','040H'])
reuse(5,135,138,['040N','040O'],'源命题的两项结论拆为两个原子；分别保留两段证明。')
add('040P',5,'连续映射的同伦纤维','Definition',[(155,161)],r'设 $f:X\to Y$ 连续，$y\in Y$；记 $q:E_f\to Y$ 为[映射路径分解](040M)的[纤维化](040O)。普通纤维指逆像 $q^{-1}(y)$，赋子空间拓扑。',['040M','040O'])
add('040Q',5,'点映射的同伦纤维是环路空间','Example',[(162,164)],r'设 $Y$ 为拓扑空间，$y\in Y$，比较点映射 $f:\{x\}\to Y$、$f(x)=y$ 的普通纤维与[同伦纤维](040P)。',['040P'],after=r'环路空间 $\Omega_yY=\{p\in Y^I:p(0)=p(1)=y\}$ 赋路径空间的子空间拓扑；它保留所有以 $y$ 为端点的环路，而不先取同伦类。')
add('040R',5,'恒等映射的同伦纤维可缩','Example',[(165,167)],r'设 $Y$ 为拓扑空间，$y\in Y$，使用[同伦纤维](040P)和[可缩性](0408)。',['040P','0408'],after=r'明确的收缩是 $(x,p)\mapsto(p(s),t\mapsto p(s+(1-s)t))$，其中 $s,t\in I$。它在 $s=0$ 恢复原点，在 $s=1$ 到达 $(y,e_y)$，始终保持终点为 $y$；连续性由指数律保证。')
add('040S',5,'同伦纤维的路径数据与依赖和','Remark',[(168,170)],r'设 $f:X\to Y$、$y\in Y$，几何侧使用[同伦纤维](040P)。本页只比较记号，不以类型论表达式替代几何证明。',['040P'],after=r'这里的“类型”指同伦类型论中的空间式类型，不是模型论中公式的完备一致集合。形式规则与类型论纤维结论由第十一章另行建立。')

# Chapter 6.
add('0410',6,'余面映射与余退化映射','Definition',[(3,5)],r'采用[单纯集合](01FX)页面中已定义的单纯范畴 $\Delta$，对象为非空有限序集 $[n]$。',['01FX'],r'对 $n\ge1$、$0\le i\le n$，余面 $\delta^i:[n-1]\to[n]$ 跳过 $i$。对 $n\ge0$、$0\le i\le n$，余退化 $\sigma^i:[n+1]\to[n]$ 合并相邻的 $i,i+1$。在单纯集合 $X$ 上，反变性产生 $d_i=X(\delta^i)$ 与 $s_i=X(\sigma^i)$。')
add('0411',6,'保序映射的唯一满射单射分解','Theorem',[(6,11)],r'设 $[m],[n]$ 为[单纯范畴](01FX)中的有限序集。',['01FX'])
add('0412',6,'余面与余退化生成全部保序映射','Theorem',[(12,17)],r'在单纯范畴中使用[满射单射分解](0411)和[余面、余退化](0410)。',['0411','0410'])
reuse(6,20,22,['01FX','00I2'],'复用单纯集合与自然变换；单纯映射的显式定义请求父组补入 01FX。')
add('0413',6,'面与退化的单纯恒等式','Theorem',[(23,38)],r'设 $X$ 是[单纯集合](01FX)，$d_i,s_i$ 是[余面与余退化](0410)诱导的映射；下式只在各项维数均有定义时使用。',['0410'])
add('0414',6,'单纯集合的顶点边和三角形','Example',[(39,41)],r'设 $X$ 为[单纯集合](01FX)，记 $X_n=X([n])$、$d_i$ 为面映射、$s_i$ 为退化映射。',['01FX'],after=r'这里“恒等边”意指退化边；一般单纯集合尚未配备普通范畴的严格复合。单形若不在任何退化映射像内，称非退化单形。')
add('0415',6,'可表标准单纯集合','Definition',[(42,48)],r'令 $\Delta$ 为[单纯范畴](01FX)，固定 $n\ge0$。可表意指由到某个固定对象的态射集合构成的反变函子。',['01FX'],after=r'对 $\beta:[\ell]\to[m]$，限制映射把 $\alpha:[m]\to[n]$ 送到 $\alpha\beta$；因而此公式确实定义一个单纯集合。')
add('0416',6,'标准单形表示单形元素','Theorem',[(49,57)],r'设 $X$ 为[单纯集合](01FX)，$\Delta^n$ 为[可表标准单形](0415)。单纯映射指反变函子之间的[自然变换](00I2)。',['0415','00I2'],after=r'反向再正向恢复原变换，因为对任何 $\alpha:[m]\to[n]$，自然性把其在 $\alpha$ 的值强制为 $X(\alpha)$ 作用于恒等处的值。故本页给出了该 Yoneda 特例的完整双向验证。')
add('0417',6,'单纯区间不允许交换两个端点','Example',[(58,60)],r'令 $\Delta^1$ 为[标准单形](0415)，使用[单形表示性质](0416)；非退化意指不在退化映射的像中。',['0416'])
add('0418',6,'标准单形的边界','Definition',[(63,65)],r'设 $\Delta^n$ 是[标准单形](0415)，单纯子集指逐维子集且对全部面与退化封闭。',['0415','0410'],r'边界 $\partial\Delta^n$ 为全部真面生成的单纯子集。对 $n\ge1$，它是全部余面包含 $\delta^i:\Delta^{n-1}\to\Delta^n$ 的像之并；$\partial\Delta^0=\varnothing$。')
add('0419',6,'标准单形的内角与外角','Definition',[(64,64)],r'设 $n\ge1$、$0\le k\le n$，$\Delta^n$ 是[标准单形](0415)，其[边界](0418)由余维一面组成。',['0418'],r'第 $k$ 个角 $\Lambda_k^n$ 是除第 $k$ 个余维一面以外其余各面的像之并。若 $0<k<n$ 称内角，否则称外角。映射 $\Lambda_k^n\to X$ 的填充意指一个延拓 $\Delta^n\to X$。')
add('041A',6,'二维内角同时选择合成边和比较单形','Example',[(66,74)],r'设 $X$ 为单纯集合，使用[角及其填充](0419)。图中顶点 $0,1,2$ 经映射成为 $X$ 中的顶点。',['0419'],after=r'图中的虚线是待选择的第三条边 $h$。填充是一个 $\sigma\in X_2$，满足 $d_2\sigma=f$、$d_0\sigma=g$、$d_1\sigma=h$；在一般单纯集合中，不应把此图误读为已经具有严格复合等式 $h=gf$。')
add('041B',6,'标准单形的脊','Definition',[(75,81)],r'对 $n\ge1$，令 $\Delta^n$ 为[标准单形](0415)，相邻边意指顶点 $i-1,i$ 所张成的标准一维子单形；[二维内角](0419)记为 $\Lambda_1^2$。',['0415','0419'])
add('041C',6,'角填充与边界填充是不同的问题','Remark',[(82,84)],r'比较[边界](0418) $\partial\Delta^2$ 与[二维内角](041A) $\Lambda_1^2$ 对映射到单纯集合 $X$ 的要求。',['0418','041A'])
reuse(6,87,103,['01FR'],'拓扑标准单形、仿射坐标映射、商关系和商拓扑全部已由 01FR 覆盖。')
add('041D',6,'拓扑空间的奇异单纯集合','Definition',[(104,110)],r'设 $Y$ 为[拓扑空间](00E0)，$|\Delta^n|$ 及 $|\alpha|$ 为[几何实现](01FR)中使用的拓扑标准单形及仿射映射；$\mathbf{Top}$ 的态射为连续映射。',['01FR','00E2'],after=r'具体地，$\alpha:[m]\to[n]$ 将 $h:|\Delta^n|\to Y$ 限制为 $h\circ|\alpha|$。仿射映射保持恒等与复合，故得到反变函子。')
add('041E',6,'几何实现与奇异复形的伴随','Theorem',[(111,123)],r'设 $X$ 为单纯集合、$Y$ 为拓扑空间，$|X|$ 为[几何实现](01FR)、$\operatorname{Sing}Y$ 为[奇异单纯集合](041D)。这里伴随指下列对 $X,Y$ 自然的态射集双射。',['01FR','041D','00I2','00F8'])
reuse(6,124,132,['034J','034I','0416'],'基础组 034J 已完整覆盖单形拼装及由稠密性推得的证明；0416 解释元素与单形映射的对应。撤去重复草页 041F。')
add('041G',6,'普通范畴的神经','Definition',[(135,142)],r'设 $C$ 是小[范畴](00I0)；将 $[n]$ 视作偏序范畴，即 $i\le j$ 时有唯一箭头 $i\to j$。$\operatorname{Fun}([n],C)$ 在此指[函子](00I1)的集合。',['00I0','00I1','01FX'],after=r'沿保序映射 $\alpha:[m]\to[n]$ 的限制由函子前复合给出，故 $NC$ 是反变函子。若 $C$ 仅局部小而对象为真类，则需先扩大集合论宇宙，不能直接声称得到小单纯集合。')
add('041H',6,'神经函子全忠实','Theorem',[(143,148)],r'设 $C,D$ 为小范畴，$NC,ND$ 为其[神经](041G)，单纯映射意指[自然变换](00I2)。',['041G','00I2'])
add('041I',6,'范畴神经的内角填充唯一','Theorem',[(149,154)],r'设 $C$ 是小范畴，$NC$ 为其[神经](041G)，内角按[角的定义](0419)取 $n\ge2$、$0<k<n$。',['041G','0419'],scope='逐项核对二维复合、三维结合律及高维相容；保留源文组合证明的压缩程度')
add('041J',6,'群胚恰是所有角可填的范畴神经','Theorem',[(155,162)],r'设 $C$ 为小[范畴](00I0)、$NC$ 为其[神经](041G)。群胚指每个态射都有双侧逆；角和填充见[定义](0419)。',['041G','0419','041I'],after=r'一维角只有一个端点，可由对应对象的恒等箭头填充；二维情况为上面的求逆。高维方向的源文论证是组合证明概要：在三维使用结合律和可逆消去核对缺失三角面，在更高维用已知二维面的一致性。此处保留该概要，不把它标作逐维展开的完整证明。',scope='核对两侧逆合并；补一维端点情形；高维组合论证明确标为源文证明概要')
add('041K',6,'单纯区间的外角不能全部填充','Example',[(163,165)],r'序范畴 $[1]$ 的[神经](041G)等于[标准单纯区间](0415) $\Delta^1$；使用[群胚神经判据](041J)。',['041G','041J'],r'$N[1]=\Delta^1$ 有全部内角填充，但并非全部外角可填，因为 $0\to1$ 没有逆。具体地，以 $0\xrightarrow{}1$、$0\xrightarrow{\id}0$ 构成的 $\Lambda_0^2$ 若可填，就会给出不可能的边 $1\to0$。')
add('041L',6,'群的单对象神经给出 Kan 复形','Example',[(164,164)],r'设 $G$ 为[群](0001)，把它视为仅一个对象的范畴，其态射为群元素、复合为群乘法；使用[神经判据](041J)和[Kan 复形](0422)。',['0001','041J','0422'],r'所有态射都可逆，故单对象范畴是群胚，其神经 $NG$ 是 Kan 复形。源文指出 $|NG|$ 通常有非平凡基本群；这里保留此背景事实而不附加未经原文证明的基本群计算。几何实现按[规范构造](01FR)。')

# Chapter 7.
add('0420',7,'左右提升性质','Definition',[(3,12)],r'在一个[范畴](00I0)中讨论下列箭头和交换方块。',['00I0'],after=r'方块交换指 $pu=vi$；提升满足 $\ell i=u$ 与 $p\ell=v$。对一个映射类取左正交或右正交，意指对该类中的每个映射都具有相应提升性质。')
add('0421',7,'Kan 纤维化','Definition',[(13,15)],r'设 $p:E\to B$ 为[单纯集合](01FX)之间的自然变换，使用[角包含](0419)和[右提升性质](0420)。',['0419','0420'],r'若对每个 $n\ge1$、$0\le k\le n$ 都有 $\Lambda_k^n\hookrightarrow\Delta^n\perp p$，称 $p$ 为 Kan 纤维化。条件同时要求所有内角和外角的相对填充。')
add('0422',7,'Kan 复形','Definition',[(14,14)],r'设 $X$ 为单纯集合，$\Delta^0$ 为[标准单形](0415)，也是单纯集合范畴的终对象。',['0421','0415'],r'称 $X$ 为 Kan 复形，若 $X\to\Delta^0$ 为[Kan 纤维化](0421)。等价地，每个角映射 $\Lambda_k^n\to X$ 都可延拓到 $\Delta^n$，其中 $n\ge1$、$0\le k\le n$；填充不要求唯一。')
add('0423',7,'Kan 纤维化的复合拉回和收缩稳定性','Theorem',[(16,21)],r'采用[Kan 纤维化](0421)与[Kan 复形](0422)。单纯集合的拉回逐维取集合拉回；箭头范畴以箭头为对象、交换方块为态射。收缩项指有嵌入和投影，其复合为恒等。',['0421','0422'],scope='同一右提升类的稳定性定理及其纤维推论；核对三种提升转移')
add('0424',7,'Kan 外角填充给出弱逆数据','Example',[(22,24)],r'设 $X$ 为[Kan 复形](0422)，$f:x\to y$ 为一条边；使用[二维角](0419)及退化恒等边。',['0422','0419'],after=r'这里的 $gf$ 是由填充所表达的复合比较的简写，并非在一般单纯集合中预先定义的严格乘法。')
add('0425',7,'Kan 填充存在不等于填充严格唯一','Remark',[(25,27)],r'比较[Kan 复形](0422)与[群胚的神经](041J)。',['0422','041J'],after=r'“高阶填充提供比较”并非断言每个固定角的完整填充空间都可缩。例如一维角的全端点未固定路径与固定两端点的路径空间是不同问题；具体的可缩提升空间必须由平凡上纤维化和纤维化的配对来证明。')
add('0426',7,'弱因子分解系统','Definition',[(30,36)],r'设 $\mathcal C$ 为[范畴](00I0)，正交符号采用[提升性质](0420)：${}^{\perp}\mathcal R$ 为对全部 $\mathcal R$ 具有左提升性质的映射类。',['0420'])
add('0427',7,'角添附与 anodyne 扩张','Construction',[(37,46)],r'设 $X$ 为单纯集合，$\Lambda_k^n\to X$ 为[角映射](0419)。推出指将两对象沿公共对象识别所得的余极限，单纯集合中逐维计算。',['0419'],after=r'序数复合是在后继步作复合、极限步取此前链的余极限；收缩项指嵌入后投影等于恒等的箭头。本图的文本条件是两条 $\Lambda_k^n\to X\amalg_{\Lambda_k^n}\Delta^n$ 的复合相等，并且任何满足该条件的余锥唯一经推出分解。“平凡上纤维化”的名称预示外部 Quillen 定理中的识别；角添附定义本身未证明几何弱等价。')
add('0428',7,'逐层添附角填充得到 Kan 因子分解','Theorem',[(47,57)],r'设 $f:X\to Y$ 为单纯映射，使用[角添附](0427)、[Kan 纤维化](0421)和[提升性质](0420)。$\omega$ 指自然数的序型。',['0427','0421'],after=r'这里每一阶段对一整族角同时作推出，即对角包含的余积作推出；单纯集合的单射和有限性保证有限角的全部数据在某一共同有限阶段已经出现。')
add('0429',7,'模型范畴的两组弱因子分解公理','Definition',[(60,67)],r'在[范畴](00I0)中使用[弱因子分解系统](0426)。小极限与余极限分别由任意小图表的锥与余锥泛性质定义；$0$、$1$ 分别为初对象与终对象。',['0426'],after=r'二取三指可复合 $f,g$ 的 $f,g,gf$ 中任意两个为弱等价，则第三个亦然。收缩项封闭指一个弱等价在箭头范畴中的任意收缩项仍为弱等价。这里“模型范畴”是同伦论中的结构，不是模型论中某理论的模型所组成的范畴。')
add('042A',7,'单纯集合的 Quillen 模型结构','Theorem',[(68,73)],r'采用[模型范畴](0429)、[Kan 纤维化](0421)、[几何实现](01FR)、[弱同伦等价](040D)与[边界](0418)。单射指每一维上的函数均单射。',['0429','0421','01FR','040D','0418'],after=r'本页为外部基础定理，不附自足证明。边界包含中的维数包括 $n=0$，因此平凡纤维化还具有顶点提升存在性。',scope='外部定理；保留 Quillen 与 GoerssJardine 两个原始引用，不把胞腔因子分解冒充模型结构证明')
add('042B',7,'单纯集合的映射对象','Definition',[(74,80)],r'设 $K,X$ 为[单纯集合](01FX)，$\Delta^n$ 是[标准单形](0415)，积逐维取集合积；$\operatorname{Hom}_{\mathbf{sSet}}$ 表示自然变换集合。',['0415','00I2'],after=r'沿 $\alpha:[m]\to[n]$ 的限制由 $\Delta^m\times K\to\Delta^n\times K$ 前复合给出。其零维单形是映射 $K\to X$，一维单形是参数为 $\Delta^1$ 的映射族。指数伴随可由[预层指数公式](0434)专门化得到。')
add('042C',7,'单纯模型相容性的指数形式','Theorem',[(81,95)],r'在[Quillen 模型结构](042A)中使用[单纯映射对象](042B)；下式的箭头由限制 $i$ 与后复合 $p$ 组成。',['042A','042B'],after=r'证明依赖外部模型结构的单纯相容公理。上式用角测试 Kan 性；若 $i$ 或 $p$ 平凡，则改用 $\partial\Delta^n\hookrightarrow\Delta^n$ 测试。相容公理保证当 $i$ 平凡时与边界的推出积平凡；当 $p$ 平凡时它可对任意单射提升。故得到全部边界的右提升性质，即平凡纤维化。',scope='保留外部 SM7 依赖；补足平凡纤维化需要边界测试、不能仅测试角的证明细节')
add('042D',7,'单纯集合中 Frobenius 拉回性质','Theorem',[(96,101)],r'在[Quillen 模型结构](042A)中，平凡上纤维化即同时为单射和弱等价的映射。',['042A'])
add('042E',7,'Kan 复形的绝对路径对象分解','Theorem',[(104,114)],r'设 $A$ 为[Kan 复形](0422)，采用[单纯映射对象](042B)和[指数提升性质](042C)。$r$ 由 $\Delta^1\to\Delta^0$ 前复合诱导，$\operatorname{ev}_i$ 是在顶点 $i$ 的限制。',['0422','042C','0427'])
add('042F',7,'Kan 复形中两个顶点之间的路径空间','Definition',[(115,117)],r'设 $A$ 为[Kan 复形](0422)，$(\operatorname{ev}_0,\operatorname{ev}_1):A^{\Delta^1}\to A\times A$ 为[路径对象](042E)的端点映射。',['042E','0423'],after=r'该纤维由逐维拉回定义，因[纤维稳定性](0423)而为 Kan 复形；允许为空。一个一维单形具体是 $\Delta^1\times\Delta^1\to A$，在路径方向的两端分别恒为 $x,y$。')
add('042G',7,'恒定路径上的部分截面可以延拓','Theorem',[(118,130)],r'设 $A$ 为 Kan 复形，$r:A\to A^{\Delta^1}$ 为[路径对象](042E)的恒定路径包含。截面 $s$ 指满足 $ps=\id$ 的映射。',['042E','0420'],after=r'两条等式为 $pJ(d)=\id_{A^{\Delta^1}}$ 与 $J(d)r=d$。存在一个选择不表示已选的所有延拓对任意基变换严格相容。')
add('042H',7,'固定边界的路径延拓空间可缩','Theorem',[(131,142)],r'设 $A$ 为 Kan 复形，$r:A\to A^{\Delta^1}$ 为[常值路径包含](042E)，$p:E\to A^{\Delta^1}$ 为纤维化，$d:A\to E$ 满足 $pd=r$。采用[单纯映射对象](042B)与[指数提升性质](042C)。',['042E','042C'],after=r'这里可缩指恒等单纯映射与某个常值映射由 $\Delta^1$ 参数的同伦连接。若 $F\to\Delta^0$ 为上文得到的平凡纤维化，空集包含给出点 $e\in F_0$；对单射 $F\times\partial\Delta^1\hookrightarrow F\times\Delta^1$ 提升边界数据 $(\id_F,\operatorname{const}_e)$ 即给出收缩。因而此结论不需要暗中把任意弱可缩拓扑空间当作可缩。')
add('042I',7,'任意底上的纤维内路径对象','Definition',[(145,151)],r'在单纯集合中使用[Kan 纤维化](0421)与[单纯映射对象](042B)；拉回逐维计算。',['0421','042B'])
add('042J',7,'相对路径分解及其基变换相容性','Theorem',[(152,164)],r'设 $p:A\to\Gamma$ 为 Kan 纤维化，$P_\Gamma(A)$ 为[纤维内路径对象](042I)。$r_\Gamma$ 取恒定路径，右侧取两个端点，且不要求 $\Gamma$ 为 Kan 复形。',['042I','042C'],after=r'基变换公式明确为 $u^*P_\Gamma(A)\cong P_T(u^*A)$，其中 $u:T\to\Gamma$ 任意；上文用作基对象的 $\Delta$ 不是单纯范畴的记号。此同构来自对所有广义单形的相同描述，而非只核对顶点。')
add('042K',7,'带路径依赖参数的路径归纳提升','Theorem',[(165,177)],r'设 $A\to\Gamma$ 为 Kan 纤维化，$P_\Gamma(A)$ 使用[相对路径对象](042I)。使用[相对分解](042J)、[Frobenius 性质](042D)及[指数提升性质](042C)。',['042J','042D','042C'],after=r'部分截面是 $s_0:P_0\to Q$ 且 $\chi s_0$ 等于包含 $P_0\to P$；所求 $s:P\to Q$ 满足 $\chi s=\id_P$ 及 $s|_{P_0}=s_0$。提升空间是映射对象映射 $Q^P\to Q^{P_0}\times_{P^{P_0}}P^P$ 在 $(s_0,\id_P)$ 处的纤维。该映射平凡纤维化，纤维的收缩可按[固定边界延拓空间](042H)的边界提升论证构造。')

# Chapter 8. Generic presheaf terminology is recalled locally pending foundations links.
PRESHEAF = r'设 $D$ 为小[范畴](00I0)，$\widehat D=[D^{\mathrm{op}},\mathbf{Set}]$ 为[普通预层](0344)组成的[函子范畴](00I5)，态射为[自然变换](00I2)。'
SLICE = r'对固定的预层 $B$，[切片](031J) $\widehat D/B$ 中的对象为预层映射 $Z\to B$，态射与到 $B$ 的结构映射交换。'
YONEDA = r'记 $y(d)=\operatorname{Hom}_D(-,d)$ 为[Yoneda 嵌入](0345)的可表预层；由[反变 Yoneda 引理](0343)，元素 $x\in X(d)$ 对应的 $y(d)\to X$ 把 $u:c\to d$ 送到 $X(u)x$。'
add('0430',8,'广义元素与参数语境','Definition',[(3,5)],r'使用[范畴](00I0)与[终对象](00I3)，即每个对象都有唯一箭头到 $1$。',['00I0','00I3'])
add('0431',8,'集合拓扑与单纯集合中的广义元素','Example',[(6,8)],r'设 $A$ 为相应范畴中的对象，$\Gamma$ 为参数对象；使用[广义元素](0430)和[单形表示性质](0416)。',['0430','0416','00E2'])
add('0432',8,'广义元素能够辨别态射','Theorem',[(9,17)],r'在[范畴](00I0)中，$A,B$ 为对象，使用任意参数域的[广义元素](0430)。',['0430'])
reuse(8,20,22,['034H'],'复用基础组的反变预层元素范畴定义，不建立重复原子。')
add('0433',8,'预层切片等价于元素范畴上的预层','Theorem',[(23,44)],PRESHEAF + SLICE + r'固定 $B\in\widehat D$，记 $\int B$ 为[反变元素范畴](034H)，对象为 $(d,b)$，箭头 $u:(d,b)\to(e,c)$ 满足 $B(u)c=b$。',['0344','031J','034H','00I2'],after=r'本定理的等价意指两方向函子的复合与恒等函子自然同构，不声称所有所选集合在字面上相等。')
add('0434',8,'预层指数的自然变换公式','Theorem',[(47,62)],PRESHEAF + YONEDA + r'积逐对象计算，$\operatorname{Nat}$ 表示自然变换集合。指数对象的泛性质是 $\operatorname{Hom}(X,B^A)\cong\operatorname{Hom}(X\times A,B)$，对 $X$ 自然。',['00I5','00I2','00I4'])
add('0435',8,'预层的小极限与小余极限逐对象计算','Theorem',[(63,68)],PRESHEAF + r'设 $J$ 为小索引范畴、$F:J\to\widehat D$ 为图表。',['00I5'],r'极限及余极限满足 $(\lim_jF_j)(d)=\lim_jF_j(d)$、$(\operatorname{colim}_jF_j)(d)=\operatorname{colim}_jF_j(d)$，右侧在集合中计算。沿 $u:c\to d$ 的限制由各 $F_j(u)$ 和泛性质诱导；唯一性保证恒等与复合。逐对象的锥或余锥经此构造组成自然变换，其逐对象泛性质恰给出预层范畴中的泛性质。集合中的小极限可由积中的相容元集合构造，小余极限由不交并对图表识别取商构造，故二者存在。')
add('0436',8,'预层范畴局部笛卡尔闭','Theorem',[(63,68)],PRESHEAF + r'笛卡尔闭意指有有限积且对每对对象有指数对象；局部笛卡尔闭意指有有限极限且每个切片笛卡尔闭。',['0435','0434','0433'],r'[逐对象计算](0435)给出小极限和小余极限。[预层指数公式](0434)给出笛卡尔闭性；[切片的预层表示](0433)说明每个切片仍等价于预层范畴，故也笛卡尔闭。因此 $\widehat D$ 局部笛卡尔闭，特别地 $\mathbf{sSet}=\widehat\Delta$ 如此。局部笛卡尔闭性对应拉回函子有依赖积右伴随；具体预层构造见[依赖积公式](0437)。')
add('0437',8,'预层依赖积的广义纤维公式','Theorem',[(71,83)],PRESHEAF + SLICE + YONEDA + r'沿 $f:A\to B$ 的拉回函子 $f^*$ 把 $Y\to B$ 送到 $Y\times_B A\to A$，逐对象取集合拉回。',['00I5','00I2','0430'],after=r'右伴随的含义为自然双射 $\operatorname{Hom}_{/B}(Y,\Pi_fE)\cong\operatorname{Hom}_{/A}(f^*Y,E)$。公式中的“截面集合”准确说是拉回族在 $y(d)\times_BA$ 上的截面，等价于显示的切片态射集合。')
add('0438',8,'依赖运算的 Beck–Chevalley 基变换公式','Theorem',[(93,121)],r'设 $\mathcal C$ 为局部笛卡尔闭范畴，即有有限极限且每个切片有指数对象。对 $f:A\to B$，$\Sigma_f$ 把 $E\to A$ 后复合到 $B$，$f^*$ 取拉回，$\Pi_f$ 是 $f^*$ 的右伴随，故 $\Sigma_f\dashv f^*\dashv\Pi_f$。预层情形的存在性与公式见[局部笛卡尔闭性](0436)和[依赖积](0437)。',['0436','0437','00I2'],after=r'图中交换等式为 $fv=uf^{\prime}$，且 $A^{\prime}$ 具有 $B^{\prime}\times_BA$ 的拉回泛性质。证明中 $\operatorname{Hom}_B$ 等下标均指对应切片的态射集合，$E\to A$ 任意。一般范畴中的伴随唯一性和 Yoneda 识别在这里用作基础范畴论输入；不把自然同构等同于严格语法代入等式。')
add('0439',8,'集合依赖积是逐纤维的乘积','Example',[(84,90)],r'设 $f:A\to B$、$p:E\to A$ 为集合映射，记 $E_a=p^{-1}(a)$。将[预层依赖积公式](0437)用于终范畴上的预层。',['0437'])
add('043A',8,'依赖和保持 Kan 纤维性','Theorem',[(124,128)],r'设 $f:A\to B$ 为[Kan 纤维化](0421)。切片对象 $E\to A$ 纤维性指该结构映射是 Kan 纤维化；切片态射是纤维化指其底层单纯映射是 Kan 纤维化。',['0423'],r'依赖和 $\Sigma_f$ 是后复合函子，因此把纤维性对象送到纤维性对象：$E\to A\to B$ 是纤维化的复合。对一般切片态射 $E\to F$，后复合不改变其底层映射，所以也保持纤维化态射，且这一态射层面的结论不要求 $f$ 为纤维化。拉回函子保持纤维化由[拉回稳定性](0423)给出，同样不要求基变换映射为纤维化。')
add('043B',8,'沿 Kan 纤维化的依赖积保持纤维化','Theorem',[(124,131)],r'设 $f:A\to B$ 为[Kan 纤维化](0421)，使用[依赖积右伴随](0437)、[Quillen 模型结构](042A)及[Frobenius 性质](042D)。',['0437','042D','042A'],r'设 $p:E\to F$ 为切片 $\mathbf{sSet}/A$ 中底层为 Kan 纤维化的态射。则 $\Pi_fp$ 为 $B$ 上的 Kan 纤维化。证明：对 $B$ 上任意平凡上纤维化 $i:U\to V$，与 $\Pi_fp$ 的提升问题由伴随转置为 $f^*i$ 与 $p$ 的提升问题。$U\times_BA\to V\times_BA$ 是 $i$ 沿纤维化 $V\times_BA\to V$ 的拉回，所以由 Frobenius 性质仍平凡。与 $p$ 的提升存在，转置回去得到所需提升。模型结构的弱因子分解系统说明这正是纤维化条件。特别地取 $F=A$，右伴随保持切片终对象，故 $\Pi_f$ 保持纤维性对象。')
add('043C',8,'空间族及依赖和积的语境记号','Definition',[(132,139)],r'采用[Kan 纤维化](0421)、[依赖和](043A)与[依赖积](0437)，参数 $\Gamma$ 可为任意单纯集合。',['0421','043A','0437'],after=r'$A_\gamma$ 不只表示孤立顶点上的集合纤维；它是沿广义元素的拉回族。这里的类型式记号表示相容的空间族，并非模型论类型。依赖运算的纤维性由[依赖积保持定理](043B)保证。')
add('043D',8,'依赖和积的广义纤维由基变换计算','Theorem',[(140,150)],r'设 $A\to\Gamma$、$B\to A$ 为 Kan 纤维化，使用[空间族记号](043C)与[基变换公式](0438)。此处 $\Delta$ 表示任意单纯参数对象，不是单纯范畴。',['043C','0438'],after=r'右侧的 $A_\gamma$ 指 $\Delta\times_\Gamma A\to\Delta$，$B_a$ 为相应拉回族。两式是自然同构，不只是顶点纤维集合之间的对应。')
add('043E',8,'依赖和的结合律','Theorem',[(153,162)],r'设 $A\to1$、$B\to A$、$C\to B$ 为 Kan 纤维化，记纤维族为 $A,B_a,C_{a,b}$，并使用[依赖和记号](043C)。',['043C'])
add('043F',8,'空间族依赖积的柯里化','Theorem',[(163,172)],r'设 $g:A\to1$、$f:B\to A$、$C\to B$ 为 Kan 纤维化，按[空间族记号](043C)写作 $A,B_a,C_{a,b}$，依赖积使用[右伴随](0437)。',['043C','0437'],after=r'右伴随唯一性是指同一函子的两个右伴随由其自然 Hom 双射决定唯一相容自然同构；故这里的重排不是额外的选择公理。')

CORRECTIONS = [
    {'id':'040L','source':'05_topology.tex:123','reason':'完整 Hurewicz 条件允许取所有带初值路径构成的参数空间，因此确实给出连续提升函数；原警示仅对逐路径存在有效。'},
    {'id':'0410','source':'06_simplicial.tex:4','reason':'余面定义补 n>=1，避免不存在的 [-1]。'},
    {'id':'041G','source':'06_simplicial.tex:136','reason':'神经作为单纯集合要求小范畴，或显式扩大宇宙。'},
    {'id':'041J','source':'06_simplicial.tex:161','reason':'补一维角；高维部分保留为压缩的组合证明概要，未声称逐维完整展开。'},
    {'id':'042C','source':'07_kan.tex:89-94','reason':'平凡纤维化必须补边界测试；角测试仅证明 Kan 性。'},
    {'id':'042H','source':'07_kan.tex:141','reason':'补用平凡纤维化对柱边界提升构造收缩，避免把弱可缩拓扑空间误作可缩。'},
    {'id':'0437','source':'08_families.tex:82','reason':'源文 p:E->A 却写 p(y), y in Y，改用 Y->B 的结构映射 q(y)。'},
    {'id':'043B','source':'08_families.tex:130','reason':'精确标明 f^*i 是沿 V×_B A->V 的纤维化拉回，而非仅笼统说沿 f。'},
    {'ids':['0402','0404'],'source':'05_topology.tex:28-29,50-51','reason':'父组直接补 le/ge 后的空格以避免 Forester 将数字斜杠吞入命令名；保留父组修改，转换器同步但未重跑。','status':'integrated-by-parent'},
]

# Concrete editorial replacements, rather than an indiscriminate string translator.
REPLACE = {
    '0404': [('上一条引理', '[重新参数化引理](0403)')],
    '0412': [('上一引理', '[满射单射分解](0411)')],
    '041F': [('将定理\\ref{thm:density}应用于', '将预层稠密性定理应用于')],
    '042A': [('下文使用的具体相容性质会逐项写出。', '具体的指数相容性质见[指数提升定理](042C)。')],
    '042H': [('在上一个提升问题中', '在本页所指定的提升问题中')],
    '0437': [('给定 $Y\\to B$', '给定 $q:Y\\to B$'), ('(\\Pi_fE)_{p(y)}(d)', '(\\Pi_fE)_{q_d(y)}(d)')],
}

PUBLIC_REPLACEMENTS = [
    ('因而上述等式', '因而这些运算等式'),
    ('下文 $a\\in T$', '其中 $a\\in T$'),
    ('本讲义只用单纯集合的模型结构处理弱等价。', '单纯集合的模型结构可直接组织弱同伦等价，而无需将任意空间的弱等价提升为同伦等价。'),
    ('这是源文引用的覆盖空间基本性质，并未提供完整证明', '此处把覆盖空间的同伦提升定理作为外部结果引用，逐段粘接仅说明证明思路'),
    ('此拓扑学定理在源文中直接使用，这里不声称证明。', '此处把紧开拓扑指数律作为外部拓扑学定理引用。'),
    ('后文公式', '同伦类型论中的表达式'),
    ('形式规则与类型论纤维结论由第十一章另行建立。', '该对应是几何解释；形式类型规则中的纤维结论仍须在相应规则下证明。'),
    ('源文的警示若用于完整 Hurewicz 条件，须作如下限定：完整条件本身可产生一个连续提升函数。', '与逐路径存在不同，完整 Hurewicz 条件本身能够产生一个连续提升函数。'),
    ('它是上述纤维化', '它是纤维化'),
    ('源文指出 $|NG|$ 通常有非平凡基本群；这里保留此背景事实而不附加未经原文证明的基本群计算。', '$|NG|$ 可以具有非平凡基本群；此处把这一性质作为外部背景事实，不进行基本群的计算。'),
    ('其规范定义由基础章节提供后可链接。', ''),
    ('元素范畴只是本定理的局部指标描述；', ''),
    ('源文此证明调用预层稠密性定理（源标签 thm:density），不是在此重新证明一般稠密性。其内容为：', '此处使用预层稠密性定理：'),
    ('该跨章依赖在审计中保留，待父组解析为规范页面。', '因此该证明依赖一般稠密性结论，而非在此独立重证它。'),
    ('故得到上述表达式', '故得到所述余极限表达式'),
    ('二维情况为上面的求逆。高维方向的源文论证是组合证明概要：', '二维情形由求逆解决。高维情形的证明概要是：'),
    ('此处保留该概要，不把它标作逐维展开的完整证明。', '这里没有逐维展开高维组合验证。'),
    ('定理\\ref{thm:quillen}是本讲义引用的模型存在定理，见\\cite{Quillen,GoerssJardine}。', '此处把模型结构的存在性作为外部基础定理引用。'),
    ('为上文得到的平凡纤维化', '为固定方块的提升空间所给的平凡纤维化'),
    ('上文用作基对象的', '证明中用作基对象的'),
    ('的上述集合做不交并', '的截面集合做不交并'),
    ('该纤维化 $q$', '纤维化 $q$'),
    ('这是 Riehl 报告 Proposition 3.6 的语义内容\\cite{RiehlICM}。', ''),
]

def public_text(s):
    for a,b in PUBLIC_REPLACEMENTS:
        s = s.replace(a,b)
    return s

# Cross-group integration is explicit and only changes this group's generated files.
EDITS = {
    '0404': [(r'使用[分段复合]', r'用[同伦的相容性](0401)处理代表元，并使用[分段复合]')],
    '0405': [('群胚意为每个态射均可逆的范畴。', '[群胚](0312)要求每个态射均可逆。')],
    '040M': [('的子空间拓扑', '的[子空间拓扑](00EJ)')],
    '040S': [('同伦类型论中的表达式', '[类型论同伦纤维](058E)的表达式')],
    '0415': [('可表意指由到某个固定对象的态射集合构成的反变函子。', '此处可表预层由[反变同态函子](031A)给出。')],
    '0418': [('余面包含', '[余面包含](0410)')],
    '041D': [('的态射为连续映射', '的态射为[连续映射](00E2)')],
    '041E': [('这里伴随指下列对 $X,Y$ 自然的态射集双射。', '此处[伴随](032K)指对 $X,Y$ 自然的态射集双射。'), ('构成自然变换', '构成[自然变换](00I2)'), ('连续性由商拓扑', '连续性由[商拓扑](00F8)')],
    '041G': [('故 $NC$ 是反变函子', '故 $NC$ 是[单纯集合](01FX)')],
    '041J': [('群胚指每个态射都有双侧逆', '[群胚](0312)要求每个态射都有双侧逆')],
    '042B': [('表示自然变换集合', '表示[自然变换](00I2)集合')],
    '042E': [('是角包含', '是[角包含](0427)')],
    '042G': [('使用左提升性质', '使用[左提升性质](0420)')],
    '0431': [('它是连续参数化的一族点', '它是[连续](00E2)参数化的一族点')],
    '0434': [('积逐对象计算', '[积](00I4)逐对象计算'), ('指数对象的泛性质', '[指数对象](032G)的泛性质')],
    '0435': [('极限及余极限满足', '[极限](0329)及[余极限](032B)满足')],
    '0436': [('局部笛卡尔闭意指', '[局部笛卡尔闭](032V)意指'), ('笛卡尔闭意指', '[笛卡尔闭](032H)意指')],
    '0437': [('对应的广义元素', '对应的[广义元素](0430)'), ('的拉回函子', '的[拉回函子](032T)'), ('右伴随的含义', '[右伴随](032K)的含义')],
    '0438': [('为局部笛卡尔闭范畴', '为[局部笛卡尔闭范畴](032V)'), ('存在自然同构', '存在[自然同构](00I2)'), ('由拉回粘贴得到', '由[拉回粘贴](0327)得到'), ('由 Yoneda 引理得到', '由[Yoneda 引理](0343)得到')],
    '043A': [('依赖和 $\\Sigma_f$ 是后复合函子', '依赖和 $\\Sigma_f$ 是[后复合函子](032S)')],
}
EXTRA_CONTEXT = {
    '0404': r'各路径的定义域为 $I=[0,1]$，同伦参数 $s,t\in I$。',
    '041J': r'内角的存在唯一性已由[内角填充定理](041I)给出。',
    '0427': r'本构造所用的[余极限](032B)在预层中[逐对象计算](0435)。',
    '0429': r'极限和余极限采用[极限泛性质](0329)及[余极限泛性质](032B)。',
    '0438': r'左伴随 $\Sigma_f\dashv f^*$ 采用[复合与基变换伴随](032U)。',
}
EXTRA_DEPS = {
    '0405':['0312'], '040S':['058E'], '0415':['031A'], '041E':['032K'],
    '041J':['0312'], '042B':['0434'], '0427':['0435','032B'], '0429':['0329','032B'], '042K':['042H'],
    '0434':['0344','0345','0343','032G'], '0435':['0344','0329','032B'],
    '0436':['0344','032V','032H'], '0437':['0344','031J','0345','0343','032T','032K'],
    '0438':['032V','0327','0343','032U'], '043A':['032S'], '043C':['043B'],
}
for note in NOTES:
    for field in ['context','body','after']:
        note[field] = public_text(note[field])
        for a,b in EDITS.get(note['id'],[]):
            note[field] = note[field].replace(a,b)
    note['context'] += EXTRA_CONTEXT.get(note['id'],'')
    note['deps'] = list(dict.fromkeys(note['deps'] + EXTRA_DEPS.get(note['id'],[])))

def render(note):
    chapter = note['chapter']
    citations = {5:['Hatcher'],6:['Friedman'],7:['Quillen','GoerssJardine'],8:[]}[chapter].copy()
    if note['id']=='042K': citations.append('RiehlICM')
    meta = f'[系统讲义](0210)，第 {chapter} 章' + ''.join('；[' + k + '](' + REFS[k] + ')' for k in citations)
    body = note['body']
    for a,b in REPLACE.get(note['id'],[]): body = body.replace(a,b)
    return '\\title{' + note['title'] + '}\n\\date{2026-09-25}\n\\taxon{' + note['taxon'] + '}\n\\author{author}\n\\meta{source}{' + meta + '}\n\n' + '\n\n'.join(convert(public_text(s)) for s in [note['context'],body,note['after']] if s) + '\n'

OUTLINES = {
    5: ('路径、同伦与纤维化', [
        r'从[道路](00F5)与[同伦](00FO)出发，[常值与反向](0400)、[同伦相容性](0401)、[路径复合](0402)、[重新参数化](0403)和[运算律](0404)构造[基本群胚](0405)与[基本群](0406)，同时辨明[遗忘的高阶信息](0407)。',
        r'接着比较[同伦等价](0116)、[可缩性](0408)、[凸集收缩](0409)及[圆柱例子](040A)，讨论[基点共轭](040B)、[高阶同伦群](040C)、[路径分支](040T)、[弱同伦等价](040D)和[Whitehead 定理的范围](040E)。',
        r'[路径空间](040F)把[连续参数](040G)组织起来。[Hurewicz 纤维化](040H)包括[积投影](040I)与[覆盖](040J)，在[拉回](040K)下稳定；[提升选择的区别](040L)解释量词的重要性。',
        r'[映射路径空间](040M)经[同伦等价包含](040N)与[纤维化投影](040O)分解任意映射，并定义[同伦纤维](040P)。[点映射](040Q)和[恒等映射](040R)的例子引向[依赖和的内在表达](040S)。']),
    6: ('单纯集合与范畴的神经', [
        r'沿[余面与余退化](0410)、[唯一分解](0411)及[生成性](0412)理解已有的[单纯集合定义](01FX)，再读[单纯恒等式](0413)与[低维数据](0414)。',
        r'[标准单形](0415)的[表示性质](0416)说明[区间的方向性](0417)；[边界](0418)、[角](0419)、[二维填充](041A)和[脊](041B)组织不同的局部数据，[比较页](041C)解释两种填充问题。',
        r'[几何实现](01FR)与[奇异复形](041D)形成[伴随](041E)，[单形拼装](034J)给出组合描述。',
        r'[范畴神经](041G)既[全忠实](041H)，又有[唯一内角填充](041I)；[群胚判据](041J)解释[有向区间](041K)和[群的神经](041L)的差别。']),
    7: ('Kan 复形、模型结构与路径对象', [
        r'[提升性质](0420)定义[Kan 纤维化](0421)和[Kan 复形](0422)，并给出[稳定性](0423)、[逆数据](0424)及[非唯一性的警示](0425)。',
        r'[弱因子分解系统](0426)、[角添附](0427)和[添附因子分解](0428)为[模型范畴](0429)作准备；[Quillen 模型结构](042A)是明确引用的外部基础定理。',
        r'[映射对象](042B)的[指数提升性质](042C)与[Frobenius 性质](042D)支持[绝对路径对象](042E)、[路径纤维](042F)、[截面延拓](042G)及[延拓空间可缩性](042H)。',
        r'[纤维内路径对象](042I)给出[相对分解](042J)，最终得到[带路径依赖参数的路径归纳](042K)。']),
    8: ('预层中的空间族与依赖运算', [
        r'以[广义元素](0430)及其[例子](0431)替代逐顶点推理，[辨别态射](0432)说明这种参数语言不丢失信息。',
        r'[预层切片表示](0433)、[指数公式](0434)及[逐对象极限](0435)建立[局部笛卡尔闭性](0436)。[依赖积公式](0437)不仅包括[集合纤维乘积](0439)，还编码所有限制映射的相容性。',
        r'[Beck–Chevalley 公式](0438)控制基变换；[依赖和保持纤维性](043A)和[依赖积保持纤维化](043B)使[空间族记号](043C)具有同伦语义。',
        r'[广义纤维计算](043D)、[依赖和结合律](043E)及[依赖积柯里化](043F)为形式依赖类型规则提供语义背景；此处得到的是自然同构，并未自动选择严格代入结构。'])
}

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    for note in NOTES:
        (OUT / (note['id'] + '.tree')).write_text(render(note))
    for chapter,(title,paras) in OUTLINES.items():
        id = '020' + str(chapter)
        text = '\\title{' + title + '}\n\\date{2026-09-25}\n\\taxon{Outline}\n\\author{author}\n\\meta{source}{[系统讲义](0210)，第 ' + str(chapter) + ' 章}\n\n'
        (OUT / (id+'.tree')).write_text(text+'\n\n'.join('\\p{'+p+'}' for p in paras)+'\n')
    for chapter,lines in LINES.items():
        for i,line in enumerate(lines,1):
            if line.startswith(('\\chapter','\\section','\\source')):
                reuse(chapter,i,i,['020'+str(chapter)],'章节叙事及来源说明归入短链接纲要；引用分布至相应原子元数据。')
    reuse(8,173,175,['0208'],'转入形式规则的导航性备注保留于纲要，不冒充独立数学定理。')
    reviews = {n['id']:{'title':n['title'],'action':'create-atomic','reason':'单页回答：'+n['title']+'；源定理及其证明可为一原子，独立例子和概念已分离。','scope':n['scope']} for n in NOTES}
    for c,(title,_) in OUTLINES.items():
        reviews['020'+str(c)]={'title':title,'action':'create-outline','reason':'短链接叙事，不复制章节正文。','scope':'核对本章全部新原子与复用定义的可达性。'}
    data = dict(group='homotopy',author='author',date='2026-09-25',sourceDirectory=str(SOURCE),sourceFiles=FILES,readCompletely=list(FILES.values()),reviews=reviews,prerequisites={n['id']:n['deps'] for n in NOTES},sourceCoverage=COVERAGE,labels=LABELS,concepts={n['title']:n['id'] for n in NOTES},referenceKeys=REFS,corrections=CORRECTIONS,deferred=[],existingAugmentations=[
        {'id':'01FX','source':'06_simplicial.tex:21','addition':'补单纯映射为函子 Δ^op->Set 间的自然变换，即逐维函数与全部 d_i,s_i 交换；链接 00I2。','status':'integrated-by-parent'},
        {'id':'0116','source':'05_topology.tex:65','addition':'补映射级术语：给定连续映射 f:X->Y，若有 g 使 gf~id_X、fg~id_Y，则称 f 为同伦等价。','status':'integrated-by-parent'}
    ],crossrefs=[
        {'sourceLabel':'thm:density','target':'034I','usedBy':'034J','kind':'necessary-prerequisite','status':'resolved; duplicate draft 041F removed'},
        {'from':['0433','0434','0435','0436','0437'],'concept':'普通预层、元素范畴、可表预层、Yoneda、切片、伴随','targets':['0344','034H','0345','0343','031J','032K'],'kind':'canonical-terminology','status':'resolved from foundations group allocation and authored source'}
    ],externalInputs=[
        {'ids':['040C','040E'],'input':'球面/立方体同伦群背景；Whitehead 定理','reference':'Hatcher','status':'源文定义或外部背景，不声称给出所有基础证明'},
        {'ids':['040F','040J'],'input':'紧开拓扑指数律；覆盖映射同伦提升','reference':'Hatcher','status':'源文未证明的拓扑背景'},
        {'ids':['042A','042C'],'input':'Quillen 模型结构、右适当性、单纯相容性','references':['Quillen','GoerssJardine'],'status':'明确外部输入'},
        {'ids':['041L'],'input':'群神经实现可有非平凡基本群','status':'保留源文背景陈述，没有添加完整计算'},
        {'ids':['042K'],'input':'报告 Proposition 3.6 的语义对应','reference':'RiehlICM','status':'源文模型范畴证明保留，报告身份按源文归属'}
    ],validation={'fullForestBuild':'not run: parent-owned','semanticReview':'逐页人工制定分拆、前置与正文校正；转换脚本不构成数学审查。','scope':'only chapters 05--08 and homotopy files','pending':['standalone diagram compilation','KaTeX formula validation','local prerequisite DAG and coverage check']})
    data['integrationStatus'] = 'stable after final local validation; do not regenerate after parent refinements'
    data['changedFiles'] = sorted(['trees/math/topology/synthetic/homotopy/'+n['id']+'.tree' for n in NOTES] + ['trees/math/topology/synthetic/homotopy/020'+str(c)+'.tree' for c in OUTLINES] + ['research/riehl-homotopy.json','scripts/riehl-homotopy.py','scripts/riehl-homotopy.check.mjs'])
    data['reusedCanonical'] = ['00F5','00FO','0116','01FX','01FR','034H','034J']
    (ROOT/'research/riehl-homotopy.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    print(f'Wrote {len(NOTES)} atoms and {len(OUTLINES)} outlines')

if __name__ == '__main__':
    main()
