---
layout: post
title: Gosund SW5智能开关接入Home Assistant
date: 2024-03-23 02:18
author: Guangming Mao
category: blog
tags: esphome smarthome homeassistant bk7231n
lang: zh 
slug: gosund-sw5-in-homeassistant
---

> 安装开关涉及强电，请务必注意人身安全并遵守当地法律法规！！！

## 楔子

去年搬家后，在新家里发现有三个前房主留下的智能开关，可以连WiFi的那种，样子平平，在墙上倒是不显突兀。拆下来发现是一个叫[Gosund](https://us.gosund.com/products/app-gosund-smart-light-switch-sw5)的牌子，正好当时正准备把家里的开关换成智能开关，看了不少其他牌子，最后兜兜转转，还是去Temu上买了一些一样的。Amazon上其实也有，不过不知为何，名字已经换成了[Ghome](https://a.co/d/hMzTv45)。

关于智能家居，我的目的很简单，就是能躺在床上用手机开关灯。由于我在家里已经部署了[Home Assistant](https://www.home-assistant.io)，这里只记录一下我是怎么把这些开关集成进来，并且导入Apple Home和Amazon Alexa里面的，关于Home Assistant的详细部分以后有机会可以继续分享。

## 基本思路

1. 把所有开关集成到Home Assistant里。
2. 由于家里人都是用的iPhone，我用一台Apple TV当家居中枢，所有设备用[HomeKit Bridge集成](https://www.home-assistant.io/integrations/homekit/)导出到家居中枢，这样家里所有的苹果设备就都可以控制这些开关了。
3. 家里还有一些Echo Dot，我把这些设备也用[Emulated Hue集成](https://www.home-assistant.io/integrations/emulated_hue/)导入到了Alexa里，这样就可以实现用Alexa语音控制了。

![智能开关集成到Home Assistant](../images/switch-ha-smarthome.svg)

## 集成到Home Assistant

说起类似的WiFi智能开关，不得不提一家叫[涂鸦智能](https://www.tuya.com/cn/)的公司，我猜他提供了一整套智能家居解决方案，厂商只需要集成他们的芯片并使用背后的涂鸦云，就可以很方便的把自己的设备变「智能」，并接入Alexa或者Google Home之类的智能家居平台。这种开关一搜一大把，本文内容也部分适用。

我第一次发现这个还是几年前用Costco买的一些Feit的智能灯泡，之前一直用Feit的官方App，后来偶然从Reddit上看到用一个叫「Tuya Smart」的App也可以控制这些设备，试用后发现界面都是一模一样的。再之后才得知这家叫「涂鸦」的公司。

### Home Assistant官方的Tuya集成

如果想把这些开关集成到Home Assistant里，最简单的方法是使用官方的[Tuya集成](https://www.home-assistant.io/integrations/tuya/):
![tuya集成](../images/tuya-intergration.png)

这部分Home Assistant的文档已经十分详细，不再赘述。

但是这种方式依然依赖涂鸦的服务器，从按下按钮到开关接通把灯点亮中间经过了网络请求，能明显感受到延迟。万一涂鸦的服务器挂了，我也不知具体会有什么后果。

### localtuya

秉持「本地优先」的原则，社区有很多优秀的集成可以跳过服务器直接和设备通信，我使用的是[localtuya](https://github.com/rospogrigio/localtuya)。主要区别是配置要复杂一些，需要注册涂鸦的账号并且获取设备密钥与ID，这部分文档也十分详细，同样不再赘述。

### ESPHome

如果想彻底不依赖涂鸦的服务器，可以给这些设备刷自定义固件。涂鸦设备里面的芯片前几年主要是[ESP8266](https://en.wikipedia.org/wiki/ESP8266)，最近好多都换成了Beken的。ESP芯片可以刷[ESPHome](https://esphome.io)或者[Tasmota](https://tasmota.github.io/docs/)，Beken的芯片同样有[LibreTiny](https://github.com/libretiny-eu/libretiny?tab=readme-ov-file)和[OpenBeken](https://github.com/openshwprojects/OpenBK7231T_App)，ESPHome在版本2023.9.0后也支持了LibreTiny。这些芯片都有留出UART引脚支持烧录程序。

使用Tasmota或者OpenBeken接入Home Assistant需要自己配置相应的MQTT节点，而ESPHome可以直接集成到Home Assistant里面，我直接刷的ESPHome固件。

#### 准备工具

1. 烧录过程中需要往串口读写数据，最简单的方法是准备一个USB转TTL转换器，很便宜。
2. 把转换器引脚连到PCB板引脚上，烙铁使得好的可以自己焊，我电焊技术不行，用的跳线，BDM支架和探针，我要刷十几个开关，这样也比较方便。

设置好后大概是这个样子：

![BDM frame](../images/bdm-frame.png)

#### 接线

首先拆开开关，找到烧录口。我买到的这些Gosund开关的型号是SW5-A-V2.1，芯片是Beken的BK7231N。开关背后使用4根螺丝固定，很容易拆开，具体拆解可以参考Elektroda的[这个帖子](https://www.elektroda.com/rtvforum/topic3892160.html)，除了芯片是BK7231T，其余部分都是一样的。

![SW5-A-V2.1 BK7231N](../images/gosund-sw5-bk7231n.png)

按照[LibreTiny文档](https://docs.libretiny.eu/docs/platform/beken-72xx/#flashing)，一般而言，BK7231芯片接线是这样的：

| USB转TTL转换器引脚 | 芯片UART引脚 |
|--|--|
| RX | TX1 |
| TX | RX1 |
| Ground (GND) | Ground (GND) |

然后是供电，这个开关有一个好处是提供了一个5V的供电串口，用这个不仅可以给芯片供电，继电器也可以用，刷完固件可以立马验证结果，同时这根供电线可以接一个开关，对后续烧录时重启比较方便。按照下图接好线：

![Gosund SW5 Wiring](../images/gosund-sw5-wiring.png)

#### 烧录过程

烧录工具我选择的是LibreTiny推荐的[ltchiptool](https://docs.libretiny.eu/docs/flashing/tools/ltchiptool/)。ltchiptool是python写的，自带一个wxPython写的GUI程序，看文档感觉在Windows/Linux上应该很稳定，我在macOS上会经常崩溃，所以用的是命令行。

烧录过程：

1. 首先断电，从命令行执行烧录程序
2. 立马打开供电，芯片会进入烧录模式，我有时候要多试几次才能成功开始烧录

首先备份原厂固件，万一有用呢：

```bash
ltchiptool -v flash read -d /dev/cu.usbserial-B0010WQ0 -b 921600 bk7231n stock-dump.bin
```

`/dev/cu.usbserial-B0010WQ0`是USB转TTL转换器在电脑上显示的串口设备，最后备份的固件大概有2.1M。

ltchiptool还有一个插件可以分析原厂固件，自动生成ESPHome配置文件，但是这个设备的固件我试了分析不成功，我们需要自己配置。

![ltchiptool UPK2ESPHome Plugin](../images/upk2esphome-plugin.png)

这个开关提供了4个引脚可以控制：

- P7: LED指示灯，很亮的绿色，原厂固件是接通灯泡时会点亮
- P8: 按钮按下或者松开的状态
- P14: 继电器
- P16: 另外一个没那么亮的红色LED

以下是一份示范配置：

```yaml
esphome:
  name: example-switch
  friendly_name: Example Switch

bk72xx:
  board: generic-bk7231n-qfn32-tuya

logger:

web_server:

captive_portal:

mdns:

api:

ota:

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password
  # 设备连不上WiFi时会启动这个热点，默认的热点名就是上面的friendly_name，我们可以连上去更新WiFi信息
  ap:
    password: "T4hIwT0aCesq"

# 重启按钮
button:
  - platform: restart
    name: Restart
    id: restart_button

debug:
  update_interval: 30s

text_sensor:
  - platform: debug
    reset_reason:
      name: Reset Reason
  - platform: libretiny
    version:
      name: LibreTiny Version

sensor:
  - platform: uptime
    name: Uptime
  - platform: wifi_signal
    name: "WiFi Signal"
    update_interval: 60s

uart:
  rx_pin: RX1
  tx_pin: TX1
  baud_rate: 9600

# Register the Tuya MCU connection
# tuya:

# Pins:
# - P7: LED指示灯，很亮的绿色，原厂固件是接通灯泡时会点亮
# - P8: 按钮按下或者松开的状态
# - P14: 继电器
# - P16: 另外一个没那么亮的红色LED

# 继电器开关
switch:
  - platform: gpio
    name: "Relay"
    id: relay
    pin: P14
    # 同步LED指示灯状态
    on_turn_on:
      - light.turn_on: led_indicator
    on_turn_off:
      - light.turn_off: led_indicator
    restore_mode: RESTORE_DEFAULT_OFF

# 使用红LED灯当ESPHome的状态
status_led:
  pin:
    number: 16
    inverted: true # 这个开关的状态是反的

# LED指示灯
light:
  - platform: binary
    name: "LED Indicator"
    id: led_indicator
    output: led_output
    restore_mode: RESTORE_DEFAULT_OFF

output:
  - id: led_output
    platform: gpio
    pin:
      number: 7
      inverted: true

# 按钮状态
binary_sensor:
  - platform: gpio
    name: "Button"
    pin:
      number: 8
      inverted: true
    # 短按接通电路
    on_click:
    - min_length: 50ms
      max_length: 350ms
      then:
        - switch.toggle: relay
    # 长按重启
    - min_length: 5000ms
      max_length: 10000ms
      then:
        - button.press: restart_button
```

在ESPHome里编译好`uf2`文件后，使用下面的命令行程序烧录到芯片里：

```bash
ltchiptool -v flash write -d /dev/cu.usbserial-B0010WQ0 -b 921600 example-switch.uf2
```

烧录好后等一会儿，开关就会连上WiFi，然后Home Assistant应该就能自动找到这个新的开关了。

![Gosund SW5 in Home Assistant](../images/gosund-sw5-in-ha.png)