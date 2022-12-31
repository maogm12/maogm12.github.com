---
layout: post
title: 确定周期内3点拟合正弦曲线
date: 2014-4-25 10:36
author: Guangming Mao
category: blog
tags:
  - Java
  - Sine
  - Algorithm
  - Math
slug: three-points-fit-const-period-sine
---

<script type="text/x-mathjax-config">
  MathJax.Hub.Config({tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]}});
</script>
<script type="text/javascript"
  src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML">
</script>

最近在做一个编辑正弦曲线的工具，里面可以通过鼠标取3个点拟合确定周期的正弦曲线。

我们知道正弦波的函数通常用一个公式来表示

$$
f(x) = A\sin(\omega x + \phi) + h
$$

其中周期$T = 2\pi/\omega$，那么对于一个确定周期的正弦波，$\omega$是确定的，有$A$、$\phi$和$h$三个未知量，需要三个点来确定。那么怎么通过这三个点来确定这个正弦函数呢？

一个正弦波一个周期的图形可以看成一个圆柱面与一个平面交线（椭圆）沿平行圆柱方向的展开图。至于为什么呢，以后再说。

空间椭圆方程可以表示为圆柱面和平面的联立方程

$$
\left\{
\begin{array}{l}
x^2 + y^2 = r^2 \\
ax + by + cz + d = 0
\end{array}
\right.
$$

我们把二维的点放到三维上去，就是把展开的圆柱面重新卷起来。设我们取得三个点是$P_1(x_1, y_1)$，$P_2(x_2, y_2)$和$P_3(x_3, y_3)$。卷起来的圆柱底面周长为$T$，那么半径就为$r = T/2\pi$。取$P(x, y)$，反映到弧长上就是$x$，对应的角度是$\alpha = 2\pi x/T$，对应$x$$y$方向上的分量就是

$$
\left\{
\begin{array}{l}
x' = r\cos\alpha = = \frac{T\cos(2\pi x/T)}{2\pi} \\
y' = r\sin\alpha == \frac{T\sin(2\pi x/T)}{2\pi}
\end{array}
\right.
$$

转换过来对应三维的点就是$P'_1$，$P'_2$和$P'_3$，