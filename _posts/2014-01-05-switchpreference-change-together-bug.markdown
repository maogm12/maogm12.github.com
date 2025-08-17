---
layout: post
title: 多个SwitchPreference同时改变的bug
date: 2014-1-5 16:14
author: Guangming Mao
category: blog
tags:
  - Android
  - Java
  - SwitchPreference
  - bug
slug: switchpreference-change-together-bug
---

新年第一篇，最近在做Android开发，碰到一个很神奇的bug，目前还没有找到出错的原因，
但是通过一番搜索，还是找到一个同类型的问题，下面的解决方法也基本上适用。
鉴于我这个问题在网上还没有找到答案，在StackOverFlow上提问也没有收到很合适的回复，
我就把这个问题写出来吧。

[在StackOverFlow上的链接][so]，如果各位知道是怎么回事，可以去回答这个问题。

[so]: http://stackoverflow.com/questions/20906338/android-switchpreferences-change-together-in-preferenceactivity

##问题
在app中设置使用了PreferenceActivity，其中放了几个SwitchPreference，使用默认的Layout，
一开始没有发现问题。

由于最终是在嵌入式设备上使用这个app，设备屏蔽了Android常规的返回键，HOME键等，
所以我在Activity的Layout最上面加了按钮，模拟返回的动作。这样的话就需要自定义
PreferenceActivity的Layout，当然这个很简单。但是问题随之就来了，并且很搞笑。

替换之后，Preference里面的所有的SwitchPreference好像都被绑定在了一起，点击任意一个其他的都会改变。
只有两个SwitchPreference的情况就是两个SwitchPreference一起变化，多了之后变化情况就更加莫名奇妙。

##源码
我重现了一下这个bug，源码如下：

在Java代码里面只是简单的设置了自定义Layout:

```java
public class SettingsActivity extends PreferenceActivity {
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Set custom layout to the setting.
        setContentView(R.layout.setting);
    }

    @Override
    protected void onPostCreate(Bundle savedInstanceState) {
        super.onPostCreate(savedInstanceState);

        setupSimplePreferencesScreen();
    }

    private void setupSimplePreferencesScreen() {
        addPreferencesFromResource(R.xml.pref_general);
    }
}
```

SharePreference定义如下：

```xml
<PreferenceScreen xmlns:android="http://schemas.android.com/apk/res/android" >
<SwitchPreference
    android:key="switch1"
    android:summary="This is switch 1"
    android:title="Switch 1" />
<SwitchPreference
    android:key="switch2"
    android:summary="This is switch 2"
    android:title="Switch 2" />
</PreferenceScreen>
```

自定义的layout如下：

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical" >

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content" >

        <Button
            android:id="@+id/button1"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:text="Button" />

        <Button
            android:id="@+id/button2"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:text="Button" />
    </LinearLayout>

    <ListView
        android:id="@android:id/list"
        android:layout_width="match_parent"
        android:layout_height="wrap_content" >
    </ListView>

</LinearLayout>
```

我在我手机上和平板上都测试了，看截图，两个SwitchPreference是一起变化的。

![截图]({{ site.url }}/images/screenshot.png)

##解决方法
通过搜索只在Google Code的Android项目的issues里面找到一个类似的帖子，链接
[https://code.google.com/p/android/issues/detail?id=26194][sp-bug]。
链接里面的问题是在同时有SwitchPreference(SP\_A)和SwitchPreference(SP\_B)滚出滚入页面时，
SP\_B在onBindView里面会使用SP\_A的View做参数，所以SP\_A会根据SP\_B的状态被修改掉。
我的问题跟这个很类似。

[sp-bug]:https://code.google.com/p/android/issues/detail?id=26194

下面有人给出建议说如果Preference里面出现了多个布尔值设置，使用CheckBoxPreference。
这个方法我测试了一下，可以解决问题，但是对于开关类型的设置，我觉得使用SwitchPreference
更加直观一点。

同时还有人贴出了解决方案，在onBindView里面清除其他Switch的listener。这个方法我测试了，
基本解决了问题，代码如下：

```java
public class CustomSwitchPreference extends SwitchPreference {

    /**
     * Construct a new SwitchPreference with the given style options.
     *
     * @param context The Context that will style this preference
     * @param attrs Style attributes that differ from the default
     * @param defStyle Theme attribute defining the default style options
     */
    public CustomSwitchPreference(Context context, AttributeSet attrs, int defStyle) {
        super(context, attrs, defStyle);
    }

    /**
     * Construct a new SwitchPreference with the given style options.
     *
     * @param context The Context that will style this preference
     * @param attrs Style attributes that differ from the default
     */
    public CustomSwitchPreference(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    /**
     * Construct a new SwitchPreference with default style options.
     *
     * @param context The Context that will style this preference
     */
    public CustomSwitchPreference(Context context) {
        super(context, null);
    }

    @Override
    protected void onBindView(View view) {
        // Clean listener before invoke SwitchPreference.onBindView
        ViewGroup viewGroup= (ViewGroup)view;
        clearListenerInViewGroup(viewGroup);
        super.onBindView(view);
    }

    /**
     * Clear listener in Switch for specify ViewGroup.
     *
     * @param viewGroup The ViewGroup that will need to clear the listener.
     */
    private void clearListenerInViewGroup(ViewGroup viewGroup) {
        if (null == viewGroup) {
            return;
        }

        int count = viewGroup.getChildCount();
        for(int n = 0; n < count; ++n) {
            View childView = viewGroup.getChildAt(n);
            if(childView instanceof Switch) {
                final Switch switchView = (Switch) childView;
                switchView.setOnCheckedChangeListener(null);
                return;
            } else if (childView instanceof ViewGroup){
                ViewGroup childGroup = (ViewGroup)childView;
                clearListenerInViewGroup(childGroup);
            }
        }
    }

}
```

问题解决了，但是bug出在哪儿，还待进一步的研究。