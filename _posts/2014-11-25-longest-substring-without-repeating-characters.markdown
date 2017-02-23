---
layout: post
title: Longest Substring Without Repeating Characters
date: 2014-11-25 22:30
author: Gavin
category: blog
tags:
  - CPP
  - Python
  - LeetCode
lang: en
slug: longest-substring-without-repeating-characters
---

The last few days I spend some time on LeetCode, and I decide to write something about it, and this should be the start.

I've been stuck with the problem ([Longest Substring Without Repeating Characters](https://oj.leetcode.com/problems/longest-substring-without-repeating-characters/)) for 2 days.

> Given a string, find the length of the longest substring without repeating characters. For example, the longest substring without repeating letters for "abcabcbb" is "abc", which the length is 3. For "bbbbb" the longest substring is "b", with the length of 1.

OK, the **Brute-force** algorithm comes first:

Start with some letter in the string, and search backwards for a repeating character(or meet the end), and we get a substring without repeating characters, loop the string and get the longest one.

We can use a hash table to store chracters appeared when searching repeat characters.

Let's see the python snippet:

```python
def lengthOfLongestSubstring(s):
    maxLen = 0
    size = len(s)
    included = {}
    for i in xrange(size):
        included = {}
        included[s[i]] = True
        curLen = 1
        for j in xrange(i + 1, size):
            if included.get(s[j], False): # repeating character
                if curLen > maxLen:
                    maxLen = curLen
                break
            else:
                included[s[j]] = True
                curLen += 1
                if j == size - 1: # meets the end
                    return max(maxLen, curLen)
    return maxLen
```

Yeah! we can do more. If you only want the max length, you loop the string, when the max length you get now is already longer than the length of the rest substring then you can just return it, because you can never get a longer substring in the rest.

	abcdefgabcdefg
	       ^
	       maxLen current: len("bcdefga") = 7
	       maxLen rest   : len("abcdefg") = 7
	       just skip the rest~~

Let update the code snippet:

```python
# ***
for i in xrange(size):
    if maxLen >= size - i:
        return maxLen
# ***
```

Can we still get it updated? Certainly yes!

Actually the problem remind me of [the **KMP** algorithm](http://en.wikipedia.org/wiki/Knuth%E2%80%93Morris%E2%80%93Pratt_algorithm) somehow. In KMP we can skip some characters when start next search, we can do it here too.

	......ab.....cd.....c......
	      ^

Take the string above as an example, when we start search at `a`, we meet duplicated `c`, when start the next search, we can start with `d` instead of `b`, because the search will definitely ends with the second `c`.

So we update the code snippet again, instead of putting bool value in the dictionary `included`, we put index of the character this time, so we can jump to the index the next time.

```python
def lengthOfLongestSubstring(self, s):
    maxLen = 0
    size = len(s)
    included = {}
    i = 0
    while i < size:
        if maxLen >= size - i:
            return maxLen

        j = i + 1
        curLen = 1
        included.clear()
        included[s[i]] = i
        while j < size:
            if included.get(s[j], None) is not None:
                i = included.get(s[j])
                break;
            else:
                included[s[j]] = j
                curLen += 1
            j += 1

        if curLen > maxLen:
            maxLen = curLen
        i += 1

    return maxLen
```

Unfortunately, the code get a `Time Limit Exceeds` error.

I test it with a very long string on my Macbook Pro, it costs about 3.1s.

	"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~ " * 1000

I tried to rewrite it to c++, I use `std::map` (or a little better, use `std::unordered_map`) to do the hash thing. still test with the long string. And it costs about 6.5s, damn it!!! Even with `-O2` option, it still costs about 1.7s.

```cpp
int lengthOfLongestSubstring(string s) {
    int maxLen = 0, curLen;
    size_t size = s.length();
    map<char, size_t> included;
    map<char, size_t>::iterator pos;
    for (size_t i = 0; i < size; ++i) {
        if (maxLen >= size - i) {
            return maxLen;
        }

        included.clear();
        included[s[i]] = i;
        curLen = 1;
        for (size_t j = i + 1; j < size; ++j) {
            pos = included.find(s[j]);
            if (pos != included.end()) {
                i = pos->second;
                break;
            } else {
                included[s[j]] = j;
                curLen++;
                if (j == size - 1 && curLen > maxLen) { // meet the end
                    return curLen;
                }
            }
        }
        if (curLen > maxLen) {
            maxLen = curLen;
        }
    }
    return maxLen;
}
```

At first I think the problem is `clear()`, it will destroy all item in the map, and that's a lot of work to do. I change the `clear()` to re-construct a new map, but little improvement is made… So the problem is in stl map itself. I do not dig any further but change map to bitset as a hash table. We know there is at most 256 type of character(a char has 8 bits). So the appearance of different character can be done with a 256-bits bitset.

```cpp
// ***
bitset<256> hash;
for (size_t i = 0; i < size; ++i) {
    if (maxLen >= (int)(size - i)) {
        return maxLen;
    }

    hash.reset();
    hash[s[i]] = true;
    curLen = 1;
    for (size_t j = i + 1; j < size; ++j) {
        if (hash[s[j]]) {
            if (curLen > maxLen) {
                maxLen = curLen;
            }
            for (size_t k = i; k < j; ++k) {
                if (s[j] == s[k]) {
                    i = k + 1;
                }
            }
            break;
        } else {
            hash[s[j]] = true;
            curLen++;
            if (j == size - 1 && curLen > maxLen) {
                return curLen;
            }
        }
    }
}
// ***
```

The result is pretty good!!!
Tested with the long string, it costs only 0.2s and only 0.02s with `-O2` option.

WOW!!!!!!!!!!

But when I post the code happily, I get a compile error, seems LeetCode's OJ do not support bitset.

So, make a new one, here is my workground and pretty simple:

```cpp
struct charHash {
    const static int SIZE = 32;
    char data[SIZE];
    charHash() {
        reset();
    }

    inline void reset() {
        for (int i = 0; i < SIZE; ++i) {
            data[i] = '\0';
        }
    }

    inline void set(int pos, bool value) {
        if (value) {
            data[pos/8] |= (1 << (pos%8));
        } else {
            data[pos/8] = ~((~data[pos/8]) | (1 << (pos%8)));
        }
    }

    inline bool get(int pos) const {
        return (data[pos/8] >> (pos%8)) & 1;
    }
};
```

Finally get the problem down! haha :)