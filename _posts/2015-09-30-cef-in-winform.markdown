---
layout: post
title: Cef in WinForm
date: 2015-9-30 16:16
author: Guangming Mao
category: blog
tags:
  - C#
  - WinFrom
  - JavaScript
slug: cef-in-winform
---

> 这是一个看脸的时代

随着移动设备的崛起，Windows 应用已经被逐渐边缘化，日常生活中大部分事情不用打开电脑了，
掏出手机就可以完成。但是 Windows 应用终究还是要有的，对没错，我今天就是来讲 Windows 应用开发的。

最近有做过一个 Windows 上的应用，大致是个编辑器。既然是做 Windows 应用，那么一定要祭出 VS 神器，
拖一拖控件什么的，分分钟出来一个，但是有一个问题：太丑了。WPF 我没用过，不敢妄加评论，
这个应用我还是用的 WinForm 实现的。

托互联网蓬勃发展的福，Web 页面越来越漂亮，传统的 Windows 控件由于定制性不强，在这个看脸的时代，
显然是入不了人们的法眼的。于是有大把大把的 Windows 应用设计都开始往 Web 上靠。

由于做过一点前端，我一开始就琢磨怎么用 Web 页面实现这个功能，这样样式也炒鸡好调，功能也好加。

那我们就使用内置的 WebBrowser 吧，直接在嵌个浏览器进去，这其实是一个比较好的方案，
因为是个 Windows 就有 IE，不用打包一个很大的 DLL 进去，安装包比较小。但是同样因为这样，
WebBrowser 使用的 IE 内核版本主要依赖于目标系统，这样又要处理浏览器兼容问题。。。
并且默认的版本应该很低（因为出来的效果很丑）

然后我又看了 [Electron](http://electron.atom.io/)，Atom 的核，一个基于 Web 技术的跨平台桌面应用开发框架。
很好很好，尝试了一下，终于在读取本地文件的时候没搞出来，又比较紧急加上打包有点麻烦，
所以还是回到了 WinForm 嵌浏览器的方案。

终于发现了今天的主角：CefSharp，一个 CEF 的 C# 绑定。
[CEF](https://en.wikipedia.org/wiki/Chromium_Embedded_Framework) 是一个基于 Chromium
的集成浏览器框架，就是为在桌面应用中添加现代浏览器控件而生，效率很高，接近 Chrome。他有好多绑定，因为我用 C#
开发 WinForm 应用，我用了其中一个 C# 绑定 [CefSharp](https://github.com/cefsharp/CefSharp)。

CefSharp 非常易用，有了他分分钟可以做个 Chrome 出来。你可以去它的 GitHub 页面上翻翻例子。
这里是项目的 [wiki](https://github.com/cefsharp/CefSharp/wiki/Frequently-asked-questions)。

## 安装 CefSharp

CefSharp 可以自己装，更方便的是通过 [NuGet](https://www.nuget.org/) 安装，如果安装了
NuGet，在 `Project > Manage NuGet Packages` 中打开包管理器，搜索 cef，安装 `CefSharp.Winforms`，
这样会自动安装依赖，并且安装完之后自动添加为项目的引用。

> 注意

> `CefSharp` 不支持默认的 `AnyCPU` 编译配置，需要自己根据需求改成 `x64/x86`

## 使用 CefSharp

这里举个简单的文本编辑器的例子，我们先搭个架子出来，菜单神马的用 WinForm 控件拖出来吧。如下图：

![主窗口](../images/cef/winform.png)

### 加载在线资源

关于页面是个网页，集成起来十分简单，安装

```csharp
private void InitAboutPage()
{
    var browser = new ChromiumWebBrowser("http://maogm.com")
    {
        Dock = DockStyle.Fill
    };
    browserPanel.Controls.Add(browser);
}
```

然后效果就是这样，这可是一个完整的 Chromium 哦，妈妈再也不担心我不会做浏览器了：

![关于页面](../images/cef/about.png)

### 加载本地资源

如果我们要做一个本地应用，不能联网，那么我们会把所有的资源躲放到本地，然后从本地进行加载。

比如我们使用 [Pure.css](http://purecss.io/) 来做一个极简文本编辑器，我们先写好页面:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="./pure-min.css" media="screen" title="no title" charset="utf-8">
    <title>编辑器</title>
    <style media="screen">
      body, html {
        margin: 0;
        padding: 0;
        height: 100%;
      }

      form {
        height: 100%;
      }

      button {
        height: 40px;
      }

      textarea {
        height: calc(100% - 40px);
      }
    </style>
  </head>
  <body>
    <form class="pure-form">
        <textarea class="pure-input-1" placeholder="我是文本框"></textarea>
        <button type="submit" class="pure-button pure-input-1 pure-button-primary">保存</button>
    </form>
  </body>
</html>
```

效果很简单，就一个文本框，一个保存按钮：

![编辑器](../images/cef/editor.png)

添加 `static` 文件夹，把静态页面都放进去，记住要在项目属性中选择将这些静态页面拷贝到输出目录，
不然程序跑起来就找不到这些页面了。

`ChromiumWebBrowser` 可以加载本地文件，使用绝对路径：

```csharp
var editorInfo = new FileInfo(@".\static\editor.html");
var browser = new ChromiumWebBrowser(editorInfo.FullName)
{
    Dock = DockStyle.Fill
};
mainPanel.Controls.Add(browser);
```

### 与 JavaScript 进行交互

项目中都用了前端写，如果不能用 JavaScript 那简直和没用一样啊，我们来看看与 JavaScript 的交互，
包括

#### 在 C# 中调用 JavaScript 代码

简单的代码可以这样：

```csharp
browser.ExecuteScriptAsync("alert('Call JavaScript from C#');");
```

如果需要返回值，不如我们写一个获取高度的函数：

```csharp
var task = _browser.EvaluateScriptAsync(@"
(function() {
var body = document.body, html = document.documentElement;
return Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight,
    html.scrollHeight, html.offsetHeight);
})();");

object result;
task.ContinueWith(t =>
{
    if (!t.IsFaulted)
    {
        var response = t.Result;
        result = response.Success ? (response.Result ?? "null") : response.Message;
        MessageBox.Show("得到的结果是： " + result);
    } else
    {
        MessageBox.Show("出错了");
    }
}, TaskScheduler.FromCurrentSynchronizationContext());
```

不过这里只能返回简单类型的数据，不能返回自定义的复杂对象，如果需要复杂类型，可以返回 json 串，然后序列化成 C# 对象。

#### JavaScript 中调用 C# 代码

这个时候我们需要把 C# 对象暴露给 JavaScript 使用：

```csharp
class CefCallTest
{
    public string StringProp { get; set; }

    public void ShowHelloCef()
    {
        MessageBox.Show("Hello, Cef!!!!");
    }

    public CefCallTest()
    {
        StringProp = "Hello, Cef";
    }
}

...
// 注册对象，必须在 browser 一创建后就注册
browser.RegisterJsObject("cef", new CefCallTest());
```

然后再 JavaScript 中就可以放肆使用属性和方法了：

```javascript
alert(cef.stringProp);
cef.showHelloCef();
```

> 注意

> 为了保证 js 代码看起来与其他部分风格一致，这里在 js 里面调用的时候第一个字母变成了小写，
这个可以在 RegisterJsObject 里第三个参数配置。

### DevTools

Chrome/Chromium 相当好用的开发者工具也是可以使用的。

```csharp
browser.ShowDevTools();
```

### 自定义 Scheme

把网页当本地文件会有很多限制，比较好的方法是自定义 Scheme 然后在里面处理。

我们使用 `cef://cef/file?path=xxx` 的 uri 形式来获取文本内容。我们这里自定义了一个 cef Scheme。
但是由于 Chromium 里面对于非 http/https 的请求都看不到 post 请求的内容，所以我们下面还是注册到 http
上。

我们要定义处理请求的部分：

```csharp
internal class LocalSchemeHanlderFactory : ISchemeHandlerFactory
{
    public IResourceHandler Create(IBrowser browser, IFrame frame, string schemeName, IRequest request)
    {
        if (schemeName == LocalSchemeHandler.SchemeName)
        {
            return new LocalSchemeHandler();
        }

        return null;
    }
}

internal class LocalSchemeHandler : IResourceHandler
{
    public const string SchemeName = "http";
    private string mimeType;
    private MemoryStream stream;
    private int statusCode;
    private string statusText;

    public Stream GetResponse(IResponse response, out long responseLength, out string redirectUrl)
    {
        responseLength = stream.Length;
        redirectUrl = null;

        response.StatusCode = statusCode;
        response.StatusText = statusText;
        response.MimeType = mimeType;

        return stream;
    }

    public bool ProcessRequestAsync(IRequest request, ICallback callback)
    {
        var uri = new Uri(request.Url);
        var fileName = uri.AbsolutePath;

        if (fileName == "/pure-min.css")
        {
            var content = File.ReadAllText(@".\static\pure-min.css");
            stream = new MemoryStream(Encoding.UTF8.GetBytes(content));
            mimeType = "text/css";
            statusText = "OK";
            statusCode = (int)HttpStatusCode.OK;
            callback.Continue();
            return true;
        }

        if (fileName == "/editor.html") {
            /* same as pure css */
        }

        if (fileName == "/file")
        {
            if (request.Method == "GET")
            {
                var param = HttpUtility.ParseQueryString(uri.Query);
                var path = param["path"];
                if (File.Exists(path))
                {
                    var content = File.ReadAllText(path);
                    stream = new MemoryStream(Encoding.UTF8.GetBytes(content));
                    mimeType = "text/plain";
                    statusText = "OK";
                    statusCode = (int)HttpStatusCode.OK;
                    callback.Continue();
                    return true;
                }
            }
            else if (request.Method == "POST")
            {
                var elems = request.PostData.Elements;
                if (elems != null && elems.Count > 0)
                {
                    var data = elems[0].GetBody("utf8");
                    MessageBox.Show(data);

                    // @todo
                }
            }
        }

        stream = new MemoryStream();
        statusText = "404 error";
        statusCode = (int)HttpStatusCode.NotFound;
        callback.Continue();
        return true;
    }
}
```

然后注册到 cef 里面

```csharp
// cef setting
var setting = new CefSettings();
setting.RegisterScheme(new CefCustomScheme()
{
    SchemeName = LocalSchemeHandler.SchemeName,
    SchemeHandlerFactory = new LocalSchemeHanlderFactory()
});
Cef.Initialize(setting);
```

这样我们就可以在 JavaScript 里面这么请求了，比如一个 POST 请求：

```javascript
var data = new FormData();
data.append("path", editor.dataset.path);
data.append("content", editor.value);

var xmlHttp = new XMLHttpRequest();
xmlHttp.open("POST", "http://cef/file", true);
xmlHttp.send(data);
```

实例项目在[-> 这里 <-](https://github.com/maogm12/CefSharpDemo)

保存功能就没有写了，要么可以把内容序列化到 GET 参数里，但是这样不能处理大文本，
更好的方法是使用 POST，实例里面已经有 POST 的部分