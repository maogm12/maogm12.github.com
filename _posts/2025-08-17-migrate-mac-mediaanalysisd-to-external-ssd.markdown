---
layout: post
title: 迁移 com.apple.mediaanalysisd 到外置 SSD
date: 2025-08-17 08:09
author: Guangming Mao
category: blog
tags: macos
lang: zh 
slug: migrate-mediaanalysisd-to-external-ssd
---

## 楔子

我有台老款丐版 Mac Mini，硬盘只有 256GB，勉强凑合了好几年。日常只用来上下网，但时不时冒出的“磁盘空间不足”警告，着实让人头疼。每次空间告急，我都要去清一波数据，从文档到下载，上次甚至连 Xcode 和 Office 都删了，这电脑也称得上一句家徒四壁了。

昨天，我想下载个软件更新包，可试了好几次都下载失败。排除了网络问题后，我发现硬盘空间居然又满了！打开设置里的“储存空间”一看，好家伙，可用空间只剩不到 200MB，而“系统数据”竟然变本加厉占了整整 180GB！我实在是删无可删，无处可苟了。

## 幕后黑手

“系统数据”在家目录下主要是 `~/Library`，一番排查后，我发现两个大头：

- `~/Library/Caches`：缓存，随便删。
- `~/Library/Containers`：macOS 应用的沙盒环境，这个不能直接删。

其中，`~/Library/Containers` 下面的 `com.apple.mediaanalysisd` 更是触目惊心，独占 130G，顶得上我电脑硬盘的半壁江山了。

研究了一番，我了解到这个目录主要是 macOS 在后台进行人脸识别、物体分类和 Spotlight 索引等工作时产生的缓存。照片图库越大，它的体积就越恐怖。虽然可以临时删除，但是它会随时间慢慢重建回来，治标不治本。鉴于它的体积，我只有把它挪走，这台电脑才能继续苟下去。

## 软链接

一开始，我的想法很简单：把这个目录挪到外置 SSD 上，然后在原地做一个软链接。但现实很骨感，`~/Library/Containers` 属于 macOS 的沙盒保护区域。为了防止恶意应用通过软链接访问敏感文件，系统对其做了严格的权限控制。因此，这个方法行不通。

## 挂载

问了下 ChatGPT，它提供了一个挂载的方案：将外置 SSD 上的一个分区直接挂载到 com.apple.mediaanalysisd 目录的位置，让系统以为它还在内置硬盘里。

1.  **准备外置 SSD**：用磁盘工具新建了一个 APFS 卷，命名为 `MediaAnalysisVol`。这是专门用来存储这个大缓存的。

2.  **迁移数据**：（可选，因为之后会重建）为了确保数据完整，先在终端里用 `killall mediaanalysisd` 关掉相关进程，然后用 `rsync` 命令行把 `com.apple.mediaanalysisd` 里的所有数据完整地复制到新卷里。`rsync` 是个好东西，它可以完整地保留文件权限、扩展属性等信息。

    ```bash
    rsync -aEHX --xattrs --protect-args ~/Library/Containers/com.apple.mediaanalysisd/ /Volumes/MediaAnalysisVol/
    ```

3.  **清空原目录**：将内置硬盘上的原目录内容删除，只保留一个空目录。

4.  **挂载新卷**：先用 `diskutil list` 找到新卷的设备名（例如 /dev/disk7s2），然后把其挂载到目标路径。

    ```bash
    sudo diskutil enableOwnership /dev/disk7s2
    sudo mount_apfs /dev/disk7s2 ~/Library/Containers/com.apple.mediaanalysisd
    ```

5.  **开机自动挂载**：为了避免每次开机都手动挂载，我们可以配置 /etc/fstab 文件。先用 `diskutil info` 找到新卷的 UUID，然后把挂载命令加到 `fstab` 里。

    ```bash
    UUID=12345678-ABCD-1234-ABCD-1234567890AB /Users/ahahaha/Library/Containers/com.apple.mediaanalysisd apfs rw 0 0
    ```

## 后续

现状良好，又可以苟一段时间了！