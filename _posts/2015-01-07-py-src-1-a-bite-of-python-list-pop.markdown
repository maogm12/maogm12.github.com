---
layout: post
title: A bite of Python list pop
date: 2015-01-07 14:13
author: Gavin
category: blog
tags:
  - Python
  - Code
lang: en
slug: py-src-1-a-bite-of-python-list-pop
---

> Avoid using `pop(0)` and use `collections.deque` instead!

Yesterday morning, I woke up with `pop(0)` flashing in my head.
I can use `pop(0)` instead of `pop()` to avoid some problem I met the day before yesterday.
Last night, I ask my roommate if `pop(0)` in python is slow. He doesn't know it clearly too.
This morning, I download the latest source code and find the implement of `pop` in python list,
and **YES**, `pop(0)` is very slow.

The implementation of list object is in `Objects > listobject.c`. And let jump to the `pop`:

```c
static PyObject *
listpop(PyListObject *self, PyObject *args)
{
    Py_ssize_t i = -1;
    PyObject *v;
    int status;

    if (!PyArg_ParseTuple(args, "|n:pop", &i))
        return NULL;

    if (Py_SIZE(self) == 0) {
        /* Special-case most common failure cause */
        PyErr_SetString(PyExc_IndexError, "pop from empty list");
        return NULL;
    }
    if (i < 0)
        i += Py_SIZE(self);
    if (i < 0 || i >= Py_SIZE(self)) {
        PyErr_SetString(PyExc_IndexError, "pop index out of range");
        return NULL;
    }
    v = self->ob_item[i];
    if (i == Py_SIZE(self) - 1) {
        status = list_resize(self, Py_SIZE(self) - 1);
        assert(status >= 0);
        return v; /* and v now owns the reference the list had */
    }
    Py_INCREF(v);
    status = list_ass_slice(self, i, i+1, (PyObject *)NULL);
    assert(status >= 0);
    /* Use status, so that in a release build compilers don't
     * complain about the unused name.
     */
    (void) status;

    return v;
}
```

After some error check, the `i` get the parameter of `pop(n)`, that is the index of
the element to be popped.

```c
if (i < 0)
    i += Py_SIZE(self);
```

The default element to be popped is the last one.

Then comes the difference.

1. If you want to pop the last element, python just downsize the list by 1 (in `list_resize`).
2. Else the `list_ass_slice` is called.

Let jump to `list_resize`:

```c
static int
list_resize(PyListObject *self, Py_ssize_t newsize)
{
    PyObject **items;
    size_t new_allocated;
    Py_ssize_t allocated = self->allocated;

    /* Bypass realloc() when a previous overallocation is large enough
       to accommodate the newsize.  If the newsize falls lower than half
       the allocated size, then proceed with the realloc() to shrink the list.
    */
    if (allocated >= newsize && newsize >= (allocated >> 1)) {
        assert(self->ob_item != NULL || newsize == 0);
        Py_SIZE(self) = newsize;
        return 0;
    }
    // ...
```

and the macro `Py_SIZE`:

```c
#define Py_SIZE(ob) (((PyVarObject*)(ob))->ob_size)
```

When `newsize` is `Py_SIZE(self) - 1`, obviously the allocated size is enough,
so downsize the list by 1 only make the `ob_size` to `ob_size - 1`.

But what happends in `list_ass_slice` is more complicated.

The function is a little long, let focus on deleting the element in index `i` and omiting
noisy code (…):

```c
/* a[ilow:ihigh] = v if v != NULL.
 * del a[ilow:ihigh] if v == NULL.
 *
 * Special speed gimmick:  when v is NULL and ihigh - ilow <= 8, it's
 * guaranteed the call cannot fail.
 */
static int
list_ass_slice(PyListObject *a, Py_ssize_t ilow, Py_ssize_t ihigh, PyObject *v)
{
    // ...
    if (v == NULL)
        n = 0;
    else {
        // ...
    }
    // ...

    norig = ihigh - ilow;
    d = n - norig;
    // ...

    item = a->ob_item;
    /* recycle the items that we are about to remove */
    memcpy(recycle, &item[ilow], s);

    if (d < 0) { /* Delete -d items */
        memmove(&item[ihigh+d], &item[ihigh],
            (Py_SIZE(a) - ihigh)*sizeof(PyObject *));
        list_resize(a, Py_SIZE(a) + d);
        item = a->ob_item;
    }
    // ...
}
```

Imagine you apply `pop(0)` on a large list. It will move all the elements after index 0
backwards by 1 step, It is a huge cost of time!!!

So from the view of source code, `pop(0)` is slow, especially on a large list. Let do a little
experiment to prove this.

```python
import time

t1 = time.time()
for i in xrange(10):
    l = range(100000)
    while l:
        l.pop()
t2 = time.time()
print t2 - t1

t1 = time.time()
for i in xrange(10):
    l = range(100000)
    while l:
        l.pop(0)
t2 = time.time()
print t2 - t1
```

the output on my computer is:

	0.257539987564
	20.3479938507

If the list get larger, `memmove` will cost more time, and the difference will be bigger.

So if you use a lot of `pop(0)` on list, use some "real" list like `collections.deque` instead,
the list in python is something more like array.