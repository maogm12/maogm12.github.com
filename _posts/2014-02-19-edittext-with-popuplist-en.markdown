---
layout: post
title: EditText with a Popup List
date: 2014-2-19 11:16
author: Guangming Mao
category: blog
tags:
  - Android
  - Java
slug: edittext-with-popuplist-en
---

I'm working on a Android project recently, and there is a demand: there should be a edit text with a popup list which items could be selected. It is very similar with Tencent QQ's account input box as below.

<div style="text-align:center;margin:10px;"><img src="../images/qq-login.png" alt="QQ login account list folded" /></div>
<div style="text-align:center;margin:10px;"><img src="../images/qq-login2.png" alt="QQ login account list unfolded" /></div>

There is a down-arrow in the right of the account input box which will trigger a dropdown list when clicked.

How can I implement it? I know there is a spinner widget in Android, but it's not editable. If I can combine a edittext with a spinner, that is exactly what I need.

After googling for a while, I came with [AutoCompleteTextView][actv], it's a edittext supporting auto-completion. But AutoCompleteTextView only trigger the popup list when you input at least one letter although you can make a custom one to pop up a list all the time, and here is a piece of code from stackoverflow. Altough it is not so proper in the project, I can not find any way better at that time.

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

After using it for some time, I found it's disgusting when the list jsut popped up when you enter the activity. And even worse, when the app running in horizontal mode, the fullscreen input box will cover the list. For various reasons, I started to find solutions again.

This time I started with drawing a down-arrow in the right of the edittext, and I found many [solutions on stackoverflow][et-with-button], at last, I chose setting `drawableRight` in layout file for the edittext.

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

Work nice. Actually that tiny arrow is a system resource file (`numberpicker_down_normal_holo_light.png`). And now the problem is handling click events and popping up a lists.

About handling click events, there is very tricky way in [another post][et-button-click]. It capture onTouch event of EditText by setting its `OnTouchListener`, and do anything you want when clicking in the right of the edittext:

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

Well, we get to the last step, popping up list. I used [ListPopupWindow][lpw].

[lpw]: http://developer.android.com/reference/android/widget/ListPopupWindow.html

```java
String[] list = { "item1", "item2", "item3", "item4" };
lpw = new ListPopupWindow(this);
lpw.setAdapter(new ArrayAdapter<String>(this,
        android.R.layout.simple_list_item_1, list));
lpw.setAnchorView(etTest);
lpw.setModal(true);
```

The full solution is as follows:

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

and it look very nice.

<div style="text-align:center;margin:10px;"><img src="../images/result.png" alt="EditText with a popup list" /></div>