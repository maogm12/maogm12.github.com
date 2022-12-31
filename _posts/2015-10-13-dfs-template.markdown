---
layout: post
title: DFS 模板
date: 2015-10-13 22:13
author: Guangming Mao
category: blog
tags:
  - Code
slug: dfs-template
---

[深度优先遍历(DFS)](https://en.wikipedia.org/wiki/Depth-first_search)
可以解决很多问题，像很多地图的问题都可以用它来解决，比如找迷宫的路径，有这么一个地图

    E01000
    001010
    001010
    010010
    000100
    00010E

`0` 表示可以走，`1` 表示墙，左上角的 `E` 表示入口，右下角 `E` 为出口，结果大概应该是这样

    E01...
    .01.1.
    .01.1.
    .1..1.
    ...10.
    00010E

怎么用 BFS 来解呢？

```java
package com.xxx;

public class Main {
    /**
     * @param map       地图
     * @param startRow  起点的行
     * @param startCol  起点的列
     * @param endRow    终点的行
     * @param endCol    终点的列
     */
    public static void findPath(int[][] map, int startRow, int startCol, int endRow, int endCol) {
        int height = map.length, width = map[0].length;
        if (height == 0 || width == 0 ||
                startRow < 0 || startRow >= height || startCol < 0 || startCol >= width ||
                endRow < 0 || endRow >= height || endRow < 0 || endCol >= width) {
            // 参数错误：地图为空或者起点终点在地图外面
            return;
        }

        if (map[startRow][startCol] != 0 ||  map[endRow][endCol] != 0) {
            // 起始点和终点在墙里面，走不通嘛
            return;
        }

        if (dfsHelper(map, startRow, startCol, endRow, endCol)) {
            System.out.println("找到路径：");
            printPath(map, startRow, startCol, endRow, endCol);
        }
    }

    /**
     * 这是 DFS 的函数，接受地图和一个坐标值
     *
     * @param map   地图
     * @param row   行
     * @param col   列
     * @param endRow    终点行
     * @param endCol    终点列
     * @return  是否找到了路径
     */
    public static boolean dfsHelper(int[][] map, int row, int col, int endRow, int endCol) {
        int height = map.length, width = map[0].length;
        if (height == 0 || width == 0 || row < 0 || row >= height || col < 0 || col >= width ||
                map[row][col] != 0) {
            // 跑到地图外面了
            return false;
        }

        if (row == endRow && col == endCol) {
            // 找到终点了
            return true;
        }

        map[row][col] = 2; // 我们使用 2 标志走过的地方
        if (dfsHelper(map, row + 1, col, endRow, endCol) ||
                dfsHelper(map, row - 1, col, endRow, endCol) ||
                dfsHelper(map, row, col + 1, endRow, endCol) ||
                dfsHelper(map, row, col - 1, endRow, endCol)) {
            // 某一个方向能跑通
            return true;
        }

        // 如果四边都走不通，那么我们现在跑的这条路肯定是不行的，所以我们要抹掉我们跑过的痕迹，然后函数结束
        // 让上层继续尝试另一个出口
        map[row][col] = 0;
        return false;
    }

    public static void printPath(int[][] map, int startRow, int startCol, int endRow, int endCol) {
        int height = map.length, width = map[0].length;
        for (int row = 0; row < height; ++row) {
            for (int col = 0; col < width; ++col) {
                if (row == startRow && col == startCol || row == endRow && col == endCol) {
                    System.out.print('E');
                } else if (map[row][col] == 2) {
                    System.out.print('.');
                } else {
                    System.out.print(map[row][col]);
                }
            }
            System.out.println();
        }
    }

    public static void main(String[] args) {
        int grid[][] = new int[][]{
                {0,0,1,0,0,0},
                {0,0,1,0,1,0},
                {0,0,1,0,1,0},
                {0,1,0,0,1,0},
                {0,0,0,1,0,0},
                {0,0,0,1,0,0}
        };
        findPath(grid, 0, 0, 5, 5);
    }
}
```

最后程序输出：

    找到路径：
    E01...
    .01.1.
    .01.1.
    .1..1.
    ...10.
    ..010E

注意左下角，和我们上面列出来的路径有点区别哈，因为我们递归调用dfs 的时候是先尝试
`(row + 1, col)` 即优先往下走，所以出现了左下角都走完的情况，
这种走法得到的结果不保证是最优的。