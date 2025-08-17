---
layout: post
title: 带弹出列表的EditText
date: 2014-2-13 19:34
author: Guangming Mao
category: blog
tags:
  - Android
  - Java
slug: edittext-with-popuplist
---

最近做的一个Andriod里有一个这个要求，一个东西需要输入，但同时可以在列表直接选择。看到这个需求，瞬间想到了QQ的登录界面，那个账号输入的控件正式我所需要的。

<div style="text-align:center;margin:10px;"><img src="../images/qq-login.png" alt="QQ登录框历史帐号列表折叠时" /></div>
<div style="text-align:center;margin:10px;"><img src="../images/qq-login2.png" alt="QQ登录框历史帐号列表展开时" /></div>

这个账号输入框右边有一个按钮，点击可以显示一个下拉列表。

怎么实现呢这个呢，我知道Android里面有一个Spinner，就是下拉列表，但是Spinner没有输入框。如果能把EditText和Spinner合到一起来，恰恰就是我需要的功能。

Google了一阵之后我发现这种需求确实不少，但是最后好多解决方法是使用[AutoCompleteTextView][actv]。这是一个支持自动补全的输入框，输入的同时会显示一个匹配当前输入做前缀的列表。作为一个半路出家的Android程序员，当时确实眼前一亮(-_-||)。但是这个AutoCompleteTextView有一个缺点，就是要有输入才会有提示列表，可以重载它使得不输入也弹出提示列表，后面会把代码贴出来。虽然和需求有一些出入，但是当时没有找到更好的解决方法就这么用了。重载后的代码如下:

```java
package com.maoguangming.test.util;

import android.content.Context;
import android.graphics.Rect;
import android.util.AttributeSet;
import android.view.KeyEvent;
import android.widget.AutoCompleteTextView;

public class InstantAutoCompleteTextView extends AutoCompleteTextView {

    public InstantAutoCompleteTextView(Context context) {
        super(context);
    }

    public InstantAutoCompleteTextView(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public InstantAutoCompleteTextView(Context context, AttributeSet attrs, int defStyle) {
        super(context, attrs, defStyle);
    }

    @Override
    public boolean enoughToFilter() {
        return true;
    }

    @Override
    protected void onFocusChanged(boolean focused, int direction, Rect previouslyFocusedRect) {
        super.onFocusChanged(focused, direction, previouslyFocusedRect);
        if (focused && getAdapter() != null) {
            performFiltering(getText(), KeyEvent.KEYCODE_UNKNOWN);
        }
    }
}
```

[actv]: http://developer.android.com/reference/android/widget/AutoCompleteTextView.html

在使用了一段时间之后我发现这个 AutoCompleteTextView 之后，我发现在我这个场景下体验不是很好，尤其是程序横屏的时候，输入框在输入时会默认全屏，这个时候就看不到提示列表了，可以调整参数使得输入法不全屏，但是半屏显示输入法，一来列表显示的地方不大，二来和其他的输入框风格不一。另外列表是经过筛选过的，如果在输入过程中想直接选择列表中的值，选择范围只有一部分。种种原因，最终我决定重新开始找解决方案。

由于将Spinner和EditText结合以来上次都找过，我决定先在EditText右边添加一个类似QQ账号输入框的小箭头。果然在Stack Overflow上找到了很多[解决方案][et-with-button]，最终我用的方法是直接在layout里设置EditText的`drawableRight`。

[et-with-button]: http://stackoverflow.com/questions/6355096/how-to-create-edittext-with-crossx-button-at-end-of-it

```xml
<EditText
    android:id="@+id/editText1"
    android:layout_width="0dp"
    android:layout_height="wrap_content"
    android:layout_weight="3"
    android:ems="10"
    android:drawableRight="@drawable/unfold">
```

<div style="text-align:center;margin:10px;"><img src="../images/edittext-button.png" alt="带按钮的EditText" /></div>

效果不错。那个小箭头盗用了Android 4.0.3系统库的资源文件（`numberpicker_down_normal_holo_light.png`）。现在关键是处理点击事件并且弹出一个列表。

关于点击事件，[另一个帖子][et-button-click]里有一个很巧妙又很简单的方法，就是设置EditText的`OnTouchListener`，在点击到右边的图标的范围时做相应的操作：

[et-button-click]: http://stackoverflow.com/questions/3554377/handling-click-events-on-a-drawable-within-an-edittext

```java
etTest.setOnTouchListener(new OnTouchListener() {
    @Override
    public boolean onTouch(View v, MotionEvent event) {
        final int DRAWABLE_LEFT = 0;
        final int DRAWABLE_TOP = 1;
        final int DRAWABLE_RIGHT = 2;
        final int DRAWABLE_BOTTOM = 3;

        // Check if touch point is in the area of the right button
        if(event.getAction() == MotionEvent.ACTION_UP) {
            if(event.getX() >= (etTest.getWidth() - etTest
                .getCompoundDrawables()[DRAWABLE_RIGHT].getBounds().width())) {
                // your action here
                return true;
            }
        }
        return false;
    }
});
```

最后一步就是显示列表了，不买关子了，最后使用了[ListPopupWindow][lpw]

[lpw]: http://developer.android.com/reference/android/widget/ListPopupWindow.html

```java
String[] list = { "item1", "item2", "item3", "item4" };
lpw = new ListPopupWindow(this);
lpw.setAdapter(new ArrayAdapter<String>(this,
        android.R.layout.simple_list_item_1, list));
lpw.setAnchorView(etTest);
lpw.setModal(true);
```

联合上上面点击按钮的监听时间，功能就完成了，代码如下：

```java
package com.maoguangming.test;

import android.app.Activity;
import android.os.Bundle;
import android.view.MotionEvent;
import android.view.View;
import android.view.View.OnTouchListener;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.ListPopupWindow;

public class MainActivity extends Activity implements OnTouchListener,
        OnItemClickListener {

    private EditText etTest;
    private ListPopupWindow lpw;
    private String[] list;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        etTest = (EditText) findViewById(R.id.et_test);
        etTest.setOnTouchListener(this);

        list = new String[] { "item1", "item2", "item3", "item4" };
        lpw = new ListPopupWindow(this);
        lpw.setAdapter(new ArrayAdapter<String>(this,
                android.R.layout.simple_list_item_1, list));
        lpw.setAnchorView(etTest);
        lpw.setModal(true);
        lpw.setOnItemClickListener(this);
    }

    @Override
    public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
        String item = list[position];
        etTest.setText(item);
        lpw.dismiss();
    }

    @Override
    public boolean onTouch(View v, MotionEvent event) {
        final int DRAWABLE_RIGHT = 2;

        if (event.getAction() == MotionEvent.ACTION_UP) {
            if (event.getX() >= (v.getWidth() - ((EditText) v)
                    .getCompoundDrawables()[DRAWABLE_RIGHT].getBounds().width())) {
                lpw.show();
                return true;
            }
        }
        return false;
    }
}
```

效果如图

<div style="text-align:center;margin:10px;"><img src="../images/result.png" alt="带下拉列表的EditText" /></div>

完美符合需求，赞一个。