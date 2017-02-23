---
layout: post
title: Colorize Language in VSCode
date: 2016-05-22 22:56
author: Gavin
category: blog
tags:
  - VSCode
slug: colorize-language-in-vscode
---

> 微软大法好

VSCode 是个好编辑器，虽然插件挫了点，但是跑得比 Atom 快，调试功能特别赞，对 JavaScript 和
Go 的代码提示简直不能再好，将来插件生态再好一点，这就是一个全能的 IDE 了。

VSCode 在很早就开放了[插件系统](https://code.visualstudio.com/Docs/extensions/overview)，
这里主要介绍一下语法高亮插件的部分。

VSCode 的语法高亮配置和 Atom 一样，使用的是 textmate
的[配置语法](https://manual.macromates.com/en/language_grammars)。

## 例子

来看一个例子：

```json
{
    "scopeName": "source.untitled",
    "fileTypes": [],
    "foldingStartMarker": "\{\s*$",
    "foldingStopMarker": "^\s*\}'",
    "patterns": [
        {
            "name": "keyword.control.untitled",
            "match": "\b(if|while|for|return)\b"
        },
        {
            "name": "string.quoted.double.untitled",
            "begin": "\"",
            "end": "\"",
            "patterns": [
                {
                    "name": "constant.character.escape.untitled",
                    "match": "\\."
                }
            ]
        }
    ]
}
```

主要配置有几部分：

- `scopeName`: 这个是用来标识语言的，必须独一无二，一般使用 `.` 分割成两个部分，
前半部分一般是 `text` / `source`，后面是具体的语言名字
- `fileTypes`: 这个用来指定配置适用的文件扩展名
- `foldingStartMarker` / `foldingStopMarker`: 用来控制折叠
- `patterns`: 这才是真正用来识别高亮的规则

另外还有两个不在例子里面的配置：

- `firstLineMatch`: 如果匹配了文档第一行，这个文档就适用这个高亮规则，比如 `^#!/.*\bruby\b`
- `repository`: 这是一堆键值对形式的规则，可以在文档中使用 `include` 引用这些规则

## 规则

规则使用键值对形式，键可以是：

- `name`: 指定规则的名字，是用来高亮的依据，需要遵循一定的命名规则来让编辑器知道该高亮成什么类型
- `match`: 匹配文本的正则表达式
- `begin`, `end`: 匹配多行文本的规则，和 `match` 不能共存，`begin` 是匹配开头的正则，
`end` 是匹配结尾的正则，`begin` 里面 capture 到内容可以在 `end` 里面引用，比如匹配
heredoc 的时候：
    ```json
    {
        "name": "string.unquoted.here-doc",
        "begin": "<<(\w+)",
        "end": "^\1$"
    }
    ```
- `contentName`: 类似 `name`，但是是设置 `begin` 和 `end` 中间文本的类型的
- `captures`, `beginCaptures`, `endCaptures`: 设置正则匹配到的部分的类型，用来高亮，只能包含 `name`
- `include`: 引用其他语言的高亮规则或者引用 `repository` 里面的东西

## 命名规则

为了让主题文件可以通用，`name` 设置要遵循一定的规则，这样编辑器就知道这块地方是注释，那块是关键字，
从而为不同的部分设置不同的颜色，高亮就是这么来的。名字各部分之间使用 `.` 连接起来，比如
`comment.line.number-sign`：

- `comment` 设置注释
    - `line` 单行注释，一般使用的有
        - `double-slash` //
        - `double-dash` --
        - `number-sign` #
        - `percentage` — %
        - _character_ 其他类型的单行注释
    - `block` 多行注释，比如 `/* … */`，`<!-- … -->`
        - `documentation`

- `constant` 常量
    - `numeric` 数字
    - `character` 字符，比如`&lt;`，`\e`，`\031`
        - `escape` 转义字符
    - `language` 语言支持的常量，`true` / `false` / `nil` 等等
    - `other` 比如 css 里面的颜色
- `entity` 各种实体，类名，方法名等
    - `name`
        - `function` 方法名
        - `type` 类型名
        - `tag` 标签名
        - `section` 区块名
    - `other` 其他实体
        - `inherited-class` 继承的类名
        - `attribute-name` 属性名
- `invalid` 表示非法内容
    - `illegal`
    - `deprecated`
- `keyword` 关键字
    - `control` 流程控制类 `if` / `while` 之类
    - `operator` 运算符，比如 `or`
    - `other` 其他
- `markup` 为标记语言使用的，顾名思义即可
    - `underline`
    - `bold`
    - `heading`
    - `italic`
    - `quote`
    - `raw` 比如代码块，无格式
    - `other`

- `meta` 表示不同的部分，比如 `meta.class`，`meta.method` 目的是更好的组织这些规则
- `storage` 与数据存储相关的
    - `type` 类型 `class` / `function` / `int` / `var` 等
    - `modifier` 修饰符 `static` / `const` / `final` 啥的
- `string` 字符串
    - `quoted`
        - `single` 单引号引用的
        - `double` 双引号引用的
        - `triple` 三个引号引用的 比如 `"""Python"""`
        - `other` 另类的，比如 `$'shell'`，`%{ruby}`
    - `unquoted` here-doc
        - `interpolated` 要**解析**的字符串：`` `date` ``, `$(pwd)`
        - `regexp` 正则表达式
        - `other` 其他类型的字符串
- `support` 框架或者库提供的功能
    - `function` 比如 `C` 里面的 `printf`
    - `class` 比如 `C++` 里面的 `vector`
    - `type`
    - `constant`
    - `variable`
    - `other`
- `variable`
    - `parameter` 函数参数
    - `language` 语言预定于的变量，比如 `this` / `super` / `self`
    - `other`

## 实战

有了这些东西就可以开始为一个语言写高亮配置文件了，这里选用一个简单的语言 Cool，
Cool (Classroom Object Oriented Language) 是 Stanford 编译器课程的教学语言，语法比较简单

具体语法可以查看 <http://theory.stanford.edu/~aiken/software/cool/cool.html>

具体例子可参考 <https://github.com/maogm12/language-cool>

在 VSCode 中安装的命令 `ext install cool`

```json
{
  "scopeName": "source.cool",
  "name": "COOL",
  "fileTypes": [
    "cl"
  ],
  "patterns": [
    {
      "include": "#code"
    }
  ],
  "repository": {
    "block": {
      "patterns": [
        {
          "begin": "{",
          "end": "}",
          "name": "meta.block.cool",
          "patterns": [
            {
              "include": "#code"
            }
          ]
        }
      ]
    },
    "builtins": {
      "patterns": [
        {
          "match": "(Int|String|Bool|IO|Object)",
          "name": "support.class.cool"
        },
        {
          "match": "(abort|type_name|copy|out_string|out_int|in_string|in_int|length|concat|substr)",
          "name": "support.function.cool"
        },
        {
          "match": "(self|SELF_TYPE)",
          "name": "variable.language.cool"
        }
      ]
    },
    "class": {
      "begin": "((?i:class))\\s+([A-Z][A-Za-z0-9_]*)(\\s+((?i:inherits))\\s+([A-Z][A-Za-z0-9_]*))?\\b",
      "beginCaptures": {
        "1": {
          "name": "storage.type.cool"
        },
        "2": {
          "name": "entity.name.type.class.cool"
        },
        "4": {
          "name": "keyword.operator.cool"
        },
        "5": {
          "name": "entity.name.type.class.cool"
        }
      },
      "end": "}",
      "name": "meta.class.cool",
      "patterns": [
        {
          "begin": "{",
          "end": "(?=})",
          "name": "meta.class.body.cs",
          "patterns": [
            {
              "include": "#method"
            },
            {
              "include": "#code"
            }
          ]
        }
      ]
    },
    "code": {
      "patterns": [
        {
          "include": "#block"
        },
        {
          "include": "#builtins"
        },
        {
          "include": "#class"
        },
        {
          "include": "#comments"
        },
        {
          "include": "#constants"
        },
        {
          "include": "#keywords"
        },
        {
          "include": "#method"
        }
      ]
    },
    "line_comment": {
      "begin": "--",
      "end": "$\\n?",
      "name": "comment.line.double-dash.cool"
    },
    "block_comment": {
      "begin": "\\(\\*",
      "end": "\\*\\)\\n?",
      "name": "comment.block.documentation.cool",
      "patterns": [
        {
          "include": "#block_comment"
        }
      ]
    },
    "comments": {
      "patterns": [
        {
          "include": "#line_comment"
        },
        {
          "include": "#block_comment"
        }
      ]
    },
    "constants": {
      "patterns": [
        {
          "match": "\\b(true|false)\\b",
          "name": "constant.language.cool"
        },
        {
          "match": "\\b([1-9][0-9]*)\\b",
          "name": "constant.numeric.cool"
        },
        {
          "begin": "(?<!\\\\)\"",
          "end": "(?<!\\\\)\"",
          "name": "string.quoted.double.cool",
          "patterns": [
            {
              "match": "\\\\(n|t)",
              "name": "constant.character.escape.cool"
            }
          ]
        }
      ]
    },
    "keywords": {
      "patterns": [
        {
          "match": "\\b(if|then|else|fi|while|loop|pool|case|esac)\\b",
          "name": "keyword.control.cool"
        },
        {
          "match": "\\b(in|inherits|isvoid|let|new|of|new|not)\\b",
          "name": "keyword.operator.cool"
        }
      ]
    },
    "method": {
      "patterns": [
        {
          "match": "\\b([a-z][A-Za-z0-9_]*)\\s*\\(\\s*(?:([a-z][A-Za-z0-9_]*)\\s*:\\s*([A-Z][A-Za-z0-9_]*))?(?:\\s*,\\s*([a-z][A-Za-z0-9_]*)\\s*:\\s*([A-Z][A-Za-z0-9_]*))*\\s*\\)\\s*:\\s*([A-Z][A-Za-z0-9_]*)\\b",
          "name": "meta.method.cool",
          "captures": {
            "1": {
              "name": "entity.name.function.cool"
            },
            "2": {
              "name": "variable.parameter.cool"
            },
            "3": {
              "name": "storage.type.cool"
            },
            "4": {
              "name": "variable.parameter.cool"
            },
            "5": {
              "name": "storage.type.cool"
            },
            "6": {
              "name": "storage.type.cool"
            }
          }
        }
      ]
    }
  }
}
```

效果如下：

![ScreenShot](https://raw.githubusercontent.com/maogm12/language-cool/master/screenshot.png)