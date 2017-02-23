---
layout: post
title: Draw a Pie Chart in Pure CSS
date: 2015-07-24 01:21
author: Gavin
category: blog
tags:
  - CSS
slug: pie-in-pure-css
---

<script type="text/x-mathjax-config">
  MathJax.Hub.Config({tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]}});
</script>
<script type="text/javascript"
  src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML">
</script>

> To be short:
>
> 1. create a circle
> 2. use [`clip-path`](https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path) to cut out a sector

I've been working on my [online resume](http://maogm.com/i.html) for some days,
and I need to draw a pie chart for my skill set.

There is a lot of JS library for charts, like [Highcharts](http://www.highcharts.com/),
[Echart](http://echarts.baidu.com/), but I want my online resume a single file,
I use only HTML & CSS (I even use a base64 coded image for background -_-),
so I need some pure CSS way to draw a pie chart (or donut chart).

I can use a image, but that's not cool!

I googled a lot, I find a way using
[`tranform`](https://developer.mozilla.org/en-US/docs/Web/CSS/transform) and
[`clip`](https://developer.mozilla.org/en-US/docs/Web/CSS/clip),
I find a demo:

css:

```css
#container {
    position: relative;
    width: 100px;
    height: 100px;
}

.cover {
    position: absolute;
    width: 100%;
    height: 100%;
    clip: rect(0 100px 100px 50px);
}

.pie {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    clip: rect(0 50px 100px 0px);
}

#part1-wrapper {
    transform: rotate(0deg);
}

#part1 {
    background-color: rgb(255, 99, 99);
    transform: rotate(60deg);
}
```

html

```html
<div id="container">
    <div id="part1-wrapper" class="cover">
        <div id="part1" class="pie"></div>
    </div>
</div>
```

The result is as follows, there are 2 pies in the charts

<style>
#container {
    position: relative;
    width: 200px;
    height: 200px;
}

.cover {
    position: absolute;
    width: 100%;
    height: 100%;
    clip: rect(0 200px 200px 100px);
}

.pie {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    clip: rect(0 100px 200px 0px);
}

#part1-wrapper {
    -webkit-transform: rotate(0deg);
        -ms-transform: rotate(0deg);
            transform: rotate(0deg);
}

#part1 {
    background-color: rgb(255, 99, 99);
    -webkit-transform: rotate(60deg);
        -ms-transform: rotate(60deg);
            transform: rotate(60deg);
}

#part2-wrapper {
    -webkit-transform: rotate(60deg);
        -ms-transform: rotate(60deg);
            transform: rotate(60deg);
}

#part2 {
    background-color: rgb(0, 174, 181);
    -webkit-transform: rotate(60deg);
        -ms-transform: rotate(60deg);
            transform: rotate(60deg);
}
</style>

<div class="playground">
    <div id="container">
        <div id="part1-wrapper" class="cover">
            <div id="part1" class="pie"></div>
        </div>
        <div id="part2-wrapper" class="cover">
            <div id="part2" class="pie"></div>
        </div>
    </div>
</div>

To be short, this way does 3 things:

1. draw a circle (`border-radius`) in inner div, use
[`clip`](https://developer.mozilla.org/en-US/docs/Web/CSS/clip) show half circle
2. use [`clip`](https://developer.mozilla.org/en-US/docs/Web/CSS/clip) in outer div to show only half box
3. rotate inner half circle a angle, because outer box only have half visible window,
so a sector comes out

That is cool, if you control the rotate angle, you can get a beautiful chart.
If you want a donut, you can add a white circle on the center of the pie chart.

But this is not the end of the journey. I want to add some mouse hover animation to the chart, for example, one part get bigger when the mouse hover it.

But above method will not let us do that, because when the inner circle get bigger,
it will be clipped by the outer box, only if we do not need the nested structure.

Yes we can, actually the [`clip`](https://developer.mozilla.org/en-US/docs/Web/CSS/clip) is deprecated
and there is another more powerful
[`clip-path`](https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path).
here is a very nice playground for `clip-path`:
[CSS clip-path maker](http://bennettfeely.com/clippy/)

If you want to cut the top-right part of the circle, say 60 degree, we need to cut a piece as follow:

<style>
#square {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: rgb(255, 99, 99);
    -webkit-clip-path: polygon(50% 0, 100% 0, 100% 21%, 50% 50%);
    clip-path: polygon(50% 0, 100% 0, 100% 21%, 50% 50%);
}

#circle {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: rgb(0, 174, 181);
    -webkit-clip-path: polygon(50% 0, 100% 0, 100% 21%, 50% 50%);
    clip-path: polygon(50% 0, 100% 0, 100% 21%, 50% 50%);
}
</style>
<div class="playground">
    <div id="square">
        <div id="circle"></div>
    </div>
</div>

Let's do some math, the right short edge is:

$$
l_r = \frac{L}{2} - \frac{L}{2} * tan(30^\circ)
$$

where $L$ is the edge length if the square. so the `clip-path` will be:

```css
-webkit-clip-path: polygon(50% 0, 100% 0, 100% 21.1%, 50% 50%);
clip-path: polygon(50% 0, 100% 0, 100% 21.1%, 50% 50%);
```

And so on, and now you can add some lovely animations to the charts.

Let me see the example:

<style>
.playground {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 30px auto;
}

.circle {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: absolute;
}

.animate {
  -webkit-transition: 0.2s cubic-bezier(.74,1.13,.83,1.2);
  transition: 0.2s cubic-bezier(.74,1.13,.83,1.2);
}

.animate:hover {
  -webkit-transform: scale(1.1);
      -ms-transform: scale(1.1);
          transform: scale(1.1);
  -webkit-transform-origin: center center;
      -ms-transform-origin: center center;
          transform-origin: center center;
}

#part3 {
  background-color: #E64C65;
  -webkit-clip-path: polygon(50% 0, 50% 50%, 100% 41.2%, 100% 0);
  clip-path: polygon(50% 0, 50% 50%, 100% 41.2%, 100% 0);
}

#part4 {
  background-color: #11A8AB;
  -webkit-clip-path: polygon(50% 50%, 100% 41.2%, 100% 100%, 63.4% 100%);
  clip-path: polygon(50% 50%, 100% 41.2%, 100% 100%, 63.4% 100%);
}
</style>
<div class="playground">
  <div id="part3" class="circle animate"></div>
  <div id="part4" class="circle animate"></div>
</div>