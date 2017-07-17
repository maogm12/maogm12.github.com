---
layout: post
title: Typeinfo Crossing Binary Boundary
date: 2017-07-15 00:46
author: Gavin
category: blog
tags:
  - CPP
slug: typeinfo-crossing-binary-boundary
---

## C++ 里的类型擦除

还记得 Python 内置的 dict 数据结构么？作为 hash 表的 Python 实现，他使用非常方便，让我们使用他来存储一本书的信息：

```python
book = {} # Create a book
book['name'] = 'Ths is a Book Name'      # book name, str
book['price'] = 12.5                     # book price, number
book['author'] = Name('Peter', 'Parker') # author, class object
```

在动态类型的语言里面，一个变量可以是个字符串，也可以是个浮点数，甚至是我们自定义的一个类型实例。
他的类型要到运行时才可以被确定。CPython 实现里，所有变量都是用使用 PyObject 表示，这让往 dict
里面放各种类型的变量成为了可能，反正都是键和值都是 PyObject。

如果我们要在 C++ 里面使用 hash 表来存储这本书的信息：

```cpp
unordered_map<string, ??> book;
book["name"] = "This is a Book Name";
book["price"] = 12.5;
book["author"] = Name("Peter", "Parker");
```

C++ 是一门静态类型的语言，所有的变量类型都要在编译时确定，所以 hash 表创建之初就要确定键和值的类型，
那么这个 `??` 应该换成什么呢？该怎么把不同类型都放在同一个 hash 表里面呢？
有一点可以确定，这个 `??` 肯定是一个 C++ 类型，所以换个问法就是，有没有一个变量可以表示任意变量？

想法 1：把所有东西都序列化成字符串，使用的时候再反序列化回去。这个作弊的方法会增加额外的运行时开销。

想法 2：使用指针，比如上面的例子，我们在值里面存放基类的指针，使用这些数据的时候用 dynamic_cast 转成相应具体对象，这种方法要求存放的数据都要继承自一个基类。或者我们可以再暴力一点直接使用 void*，这相当危险，并且这种危险只有在运行的时候会发现。

想法 3：类型擦除技术，我们实现一个容器，里面可以容纳各种类型的变量，但是表面上不显示里面存储变量的具体类型。这个 [Boost.Any][boost_any] / [std::any][std_any] 已经实现了。

[boost_any]: http://www.boost.org/doc/libs/1_64_0/doc/html/variant.html
[std_any]: http://en.cppreference.com/w/cpp/utility/any

## Any Type

Any 类型的实现依赖 C++ 的 [type_info](http://en.cppreference.com/w/cpp/types/type_info)。这个特性本身功能不是特别强大，标准也没有做过多的规定，并且一旦滥用，这部分代码就会冗长，难以维护。

一个特别简单的 Any 实现如下：

```cpp
class Any
{
public:
    Any() noexcept
    :holder(nullptr)
    {}

    template<typename T>
    Any(const T& data)
    :holder(new Holder<T>(data))
    {}

    ~Any()
    {
        delete holder;
    }

    const std::type_info& type() const noexcept
    {
        return holder ? holder->type() : typeid(void);
    }

private:
    struct HolderBase
    {
        virtual ~placeholder()
        {
        }

        virtual const std::type_info& type() const noexcept = 0;
    };

    template<typename T>
    struct Holder: public HolderBase
    {
        holder(const T & t)
              : data(t)
        {}

        virtual const std::type_info& type() const noexcept
        {
            return typeid(T);
        }

        T data;
    }

    HolderBase *holder;

    template<typename T>
    friend T any_cast(const Any&);
};

template<typename T>
inline T any_cast(const Any& data)
{
    if (data.type() != typeid(T))
    {
        throw std::bad_cast("failed conversion using any_cast");
    }

    return *(static_cast<T*>(&(holder->data)));
}
```

Any