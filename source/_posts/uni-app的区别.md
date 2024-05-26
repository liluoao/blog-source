---
title: uni-app的区别
date: 2024-05-21 17:54:43
urlname: uni-app
category: 工具
---

## 前言

2016 年对于我来说是神奇的一年，自学了一点 Android，后来在老师的介绍下接触了 APICloud，感慨这玩意真方便

同年为了参加比赛，用 APICloud 开发了一款仿饿了么的 APP

2018 年在武汉，同事跟我讲了 APICloud 和 DCloud 之间的官司，向我推荐了 HBuilder 这个 IDE

如今再看 DCloud 的 uni-app 已经是月活百万级的产品了

![pkMWdL4.jpg](https://s21.ax1x.com/2024/05/22/pkMWdL4.jpg)

<!-- more -->

## 使用要点

### APP 异常

#### CSS 异常

- 不支持的选择器

> 非 H5 端不支持 * 选择器
> body -> page
> div -> view
> ul li -> span
> font -> text
> a -> navigator
> img -> image

- 组件和页面样式相互影响

> 非 H5 端默认并未启用 scoped，如需要隔离组件样式可以在 `style` 标签增加 `scoped` 属性

- Webview 浏览器兼容性

> 在较老的手机上，比如 Android4.4-5.0 或 IOS8，很多 CSS 是不支持的
> 放弃 Support 老款

- 原生组件层级问题

> 非 H5 端有原生组件并引发了原生组件层级高于前端组件的概念，要遮挡 video、map 等原生组件，请使用 `cover-view` 组件

#### 使用了不支持的 API

小程序和 APP 的 JS 运行在 *jscore* 下而不是浏览器里，没有浏览器专用的 JS 对象，比如 `document、cookie、window、location、navigator、localstorage` 等对象

### 小程序异常

- 不支持 `v-html`

- 网址白名单配置

### H5 异常

- 使用了小程序专用的功能，比如微信卡券、小程序插件、微信小程序云开发

- 使用了 APP 特有的 API 和功能，比如 `Native.js`、`subNVue`、原生插件等

### Vue 要点

`data` 属性必须声明为返回一个初始数据对象的函数

否则页面关闭时，数据不会自动销毁，再次打开该页面时，会显示上次数据

```js
//正确用法，使用函数返回对象
data() {
    return {
        title: 'Hello'
    }
}
//错误写法，会导致再次打开页面时，显示上次数据
data: {
    title: 'Hello'
}
```

### H5 要点

- CSS 內使用 `vh` 单位的时候注意 `100vh` 包含导航栏，使用时需要减去导航栏和 `tabBar` 高度，部分浏览器还包含浏览器操作栏高度

- 正常支持 `rpx`，`px` 是真实物理像素。暂不支持通过设 *manifest.json* 的 `"transformPx" : true`，把 `px` 当动态单位使用

- 组件内（页面除外）不支持 `onLoad`、`onShow` 等页面生命周期

![pkMWsF1.png](https://s21.ax1x.com/2024/05/22/pkMWsF1.png)

## 判决与启示

DCloud 诉 APICloud 的案件，依据不同案由被分拆为侵权案和虚假宣传案2个案子

目前侵权案一审法院已判决，为 DCloud 胜诉；虚假宣传案二审已终审，为 DCloud 胜诉

法院判 APICloud 累计需要向 DCloud 赔付损失及诉讼费用支出共计 184.48 万元，并向 DCloud 公开道歉

1. 创业者不要信奉野蛮生长就破解和抄袭别人代码，这是犯法，而且代价惨重。

2. 创业过程中犯一个错后，要赶紧弥补、担当责任。如果试图瞒天过海、欺瞒用户和舆论，你就犯了第二个错。最终把自己推向万劫不复的深渊。

3. 投资人尽调要重点考察创始人的诚信和其产品的原罪。

4. 抵制侵权产品和公司，而不是鼓励，这样对自己、对该公司、对被侵权人、对整个产业都是好事。
