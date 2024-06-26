---
title: About 大中台
urlname: about-middle-office
date: 2019-12-07 16:20:59
category: 分享
---

互联网公司经过十几年的发展，组织已经庞大而复杂，业务不断细化拆分，也导致野蛮发展的系统越来越不可维护，开发和改造效率极低，也有很多新业务不得不重复造轮子

> 在编程社区，「造轮子」指的是开发者重复编写解决相同问题的代码，而不是利用现有的、已经被广泛接受和使用的库、框架或工具
> 这可能是由于开发者不知道已有的解决方案，也可能是出于想要实践和学习的目的。然而，在实际项目中频繁地「造轮子」可能导致效率低下和资源浪费。

<!-- more -->

所以中台的目标是为了解决效率问题，同时降低创新成本

![大中台](https://i.imgtg.com/2022/08/23/K66bg.png)

所谓的业务中台就是：通过制定标准和机制，把不确定的业务规则和流程通过工业化和市场化的手段确定下来，以减少人与人之间的沟通成本，同时还能最大程度地提升协作效率。

中台系统的优势总结：

- 服务重用：真正体现 SOA 理念的核心价值，松耦合的服务带来业务的复用；
- 服务进化：随着新业务的不断接入，共享服务也需从仅提供单薄业务功能，不断的自我进化成更健壮更强大的服务，不断适应各种业务线，真正成为企业宝贵的 IT 资产；
- 数据累积：各个业务的数据都沉淀在同一套中台服务，可以不断累积数据，最终发挥大数据威力；
- 快速响应：更快的通过共享服务的组合响应新业务；
- 降低成本：对于新业务，无需再投入新的重复的开发力量，减少人员成本；
- 效能提升：开发人员更专注某一领域，开发更快，更易维护。

最近朋友分享给我了一篇文章—— [《叹！中台的末路》](https://mp.weixin.qq.com/s/Pge_G3bVk40b70YpwCOx3Q)，问我的公司是否像文中说的一样：“吹牛逼的时候大家都是拣好的说，苦逼的东西就只有内部人士知道”。其实这句话适用的范围很广，只能说如人饮水冷暖自知，比如你觉得一些公司非常厉害，但是在 `脉脉` 上可能会看到 `内部员工` 的各种抱怨：PUA /内卷 严重、拿不到离职证明等。

趁这个机会简单整理下我们公司的中台项目：成立于 2018 年 12 月 21 日，旨在实现 **大中台 + 小前台** 的技术架构和组织架构，解决目前普遍存在的新产品开发速度慢、老产品维护困难、大量的低效重复劳动等问题，打造一个整合公司核心业务的高内聚、低耦合、高可用的共享平台，为前台业务拓展提供强有力的支持。

![Arsenal架构](https://i.imgtg.com/2022/08/09/ARIKU.png)

名词解释：

- OpenAPI：提供服务调用的统一入口网关，所有的服务调用都通过这个网关转发
- AIP：Agent Interface Process，微服务架构中的代理接口进程。提供请求调用的接口，把请求发给相应的 SIP 或者 SIK，具有均衡的功能
- AIK：Agent Interface SDK，微服务架构中的代理接口 SDK，提供给服务使用者程序开发函数库。功能和 AIP 保持一致，但性能更好，没有进程间的通讯
- SIP：Service Interface Process，微服务架构中的服务接口进程。接收请求，调用相应的服务进程处理并返回处理结果，类似 Nginx 的作用
- SIK：Service Interface SDK，微服务架构中的服务接口 SDK。提供给服务开发者使用的函数库。功能和 SIP 保持一致，但性能更好，没有进程间的通讯
- MSA：MicroService Application，微服务架构中的应用程序，实现业务逻辑，对外的表现就是服务
- SRRP：Standard Request Response Protocol，标准请求应答协议。定义 MSA 和 AIP（SIP）之间的数据交换协议
- 控制面：Control Plane。微服务架构中的配置中心，管理服务的注册和服务（应用）之间的调用关系，实现服务注册、发现、健康检查等功能

![AIP-SIP微服务架构](https://i.imgtg.com/2022/08/09/ARlDi.png)

公用业务下沉，这个理念其实很朴素。程序员都知道我们公用的逻辑要进行封装、抽象，变成 *Library*，而中台的本质其实就是把这种朴素的思想进行了一定程度的推广。

每个部门都需要在中台上注册一个自己的 `应用`，这个应用可以提供 `服务` 给别人，也可以使用别人的服务。简单来说，使用外部门的接口时需要在控制台中为自己的应用关联这个服务，提供接口给别人时需要在控制台中发布这个服务。

老的接入流程需要在各个环境服务器上发 CURL 请求，访问微服务控制面来注册应用，流程非常繁琐

![旧版架构](https://i.imgtg.com/2022/08/09/AR8Yj.png)

后来改版提供了网关模式，把服务暴露出的虚拟域名统一添加网关服务器到 HOST，再在请求接口时在 HTTP Header 里附上自己的应用名（应用与服务有依赖关系），就实现了注册、鉴权流程。

自从 2月14日 发布上线版本 `v0.4`，其中上线服务 34 个、接口 130 个、组件 132 个，此版本能满足用户服务接入、应用管理和问题反馈的基本需求。现保持每周二发布小版本，周五大版本。截止 3月21日，已发布到版本 `v0.9`

目前中台还处于完善阶段，除了接口，还添加了 UI 组件、ELK 日志及图表、Mock 工具、公共 Kafka 等

![目前提供的服务](https://ooo.0x0.ooo/2024/05/09/OJamSi.jpg)
