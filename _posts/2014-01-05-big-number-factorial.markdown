---
layout: post
title: 大数阶乘代码
date: 2014-1-5 17:51
author: Guangming Mao
category: blog
tags:
  - C++
  - factorial
slug: big-number-factorial
---

大数阶乘，以前写的，都放到博客上来吧。没用多少C++的东西，改吧改吧就可以改成C的。

```cpp
/**
 * @file big_num_factorial.cpp
 * @brief Get the factorial of a big number
 * @author Guangming Mao<maogm12 AT gmail.com>
 * @version 1.0
 * @date 2012-04-19
 */
#include <iostream>
#include <cstdlib>
#include <cmath>

using namespace std;

int get_num();
int get_digit(int);
char* get_memory(int);
int get_result(char*, int);
int print_result(char*, int);

int main()
{
    int num = get_num();
    int result_len = get_digit(num);
    char *result = get_memory(result_len);

    if (!get_result(result, num))
        print_result(result, result_len);

    delete [] result;
    return 0;
}

/**
 * @brief Get the number input
 *
 * @return The number input
 */
int get_num()
{
    int tmp;
    cout << "Please input a number(>0): ";
    while (cin >> tmp)
    {
        if (tmp < 0)
            cout << "Invalid number(<0), Input again: ";
        else
            break;
    }
    return tmp;
}

/**
 * @brief Get the digits of the result
 *
 * @param num The number input
 *
 * @return Digits of the result
 */
int get_digit(int num)
{
    double digit = 1.0;
    for (int i = 1; i <= num; ++i)
        digit += log10(i);
    return (int)digit;
}

/**
 * @brief Allocate enough memory for result
 *
 * @param digit The number of digit of the result
 *
 * @return A string of char to store the result
 */
char* get_memory(int digit)
{
    char *result = new char[digit];
    if (result == NULL)
    {
        cout << digit << "is too much, cannot allocate so much memory" << endl;
        exit(1);
    }
    result[0] = 1;
    for (int i = 1; i < digit; ++i)
        result[i] = 0;
    return result;
}

/**
 * @brief Calculate the result
 *
 * @param result The result string
 * @param num The number input
 *
 * @return 0 for success
 */
int get_result(char *result, int num)
{
    double digit = 1.0;
    int begin = 0;
    long tmp = 0;
    for (int i = 2; i <= num; ++i)
    {
        digit += log10(i);
        if (*(result+begin) == 0)
            begin++;

        for (int j = begin; j < (int)digit; ++j)
        {
            tmp += *(result+j)*i;
            *(result+j) = tmp%10;
            tmp /= 10;
        }
    }

    return 0;
}

/**
 * @brief Print the result
 *
 * @param result The result  string
 * @param len The length of the result
 *
 * @return 0 for success
 */
int print_result(char *result, int len)
{
    cout << "The result has " << len << " digits. and it is :" << endl;
    for (int i = len - 1; i >= 0; --i)
    {
        cout << (int)*(result+i);
    }
    cout << endl;
    return 0;
}
```
