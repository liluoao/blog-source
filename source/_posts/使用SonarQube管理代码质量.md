---
title: 使用SonarQube管理代码质量
urlname: use-sonarqube-continuous-code-quality
date: 2018-12-25 16:21:24
category: 工具
tags: tool
---

[SonarQube](https://www.sonarqube.org/) 是一个自动代码审查工具，用于检测代码中的错误，漏洞和代码异味。它可以与现有的工作流程集成，以便在项目分支和拉取请求之间进行连续的代码检查。官方提供了2种方式，一种是下载后本地搭建，另一种是在线运行。

<!-- more -->

这里以在线运行为例，进入[SonarCloud](https://sonarcloud.io/about/sq)，使用 GitHub 账号登录。在 `Create Organization` 创建组织后，可以开始 `Analyze projects` 分析你的项目了。

![添加项目](/images/sonar-add-project.png)

这里由于是测试项目，我选择 *Free plan*，上传后所有人都可以看到源码与分析结果。开始分析后，SonarCloud 会 `Provide a token` 创建一个 Token，在分析时填写。创建完后，下面要选择项目主要使用的语言，使用的操作系统，还需要下载一个[SonarQube Scanner](https://docs.sonarqube.org/display/SCAN/Analyzing+with+SonarQube+Scanner)

以 Windows 为例，下载解压后将其中的 `/bin` 目录加入环境变量，进入你的项目根目录执行如下命令（也可以复制页面自动生成的命令）：

```bash
D:\WWW\Sm>sonar-scanner.bat 
-D"sonar.projectKey={你的Project Key}" 
-D"sonar.organization={你的Organization Key}" 
-D"sonar.sources=." 
-D"sonar.host.url=https://sonarcloud.io" 
-D"sonar.login={你的Token}"
```

部分输出结果如下：
```
INFO: SonarQube Scanner 3.2.0.1227
INFO: Project key: royal-flush-crm_mei-crm
INFO: Organization key: royal-flush-crm
INFO: -------------  Scan royal-flush-crm_mei-crm
INFO: Index files
INFO: 15 files indexed
INFO: Sensor HTML [web] (done) | time=347ms
INFO: Sensor PHP sensor [php] (done) | time=2136ms
INFO: SCM provider for this project is: git
INFO: 12 files to be analyzed
INFO: 12/12 files analyzed
INFO: CPD calculation finished
INFO: Analysis report generated in 316ms, dir size=158 KB
INFO: Analysis reports compressed in 89ms, zip size=52 KB
INFO: Analysis report uploaded in 2002ms
INFO: ANALYSIS SUCCESSFUL, you can browse https://sonarcloud.io/dashboard?id=roy
al-flush-crm_mei-crm
INFO: More about the report processing at https://sonarcloud.io/api/ce/task?id=A
WfkWnRDqDdpA2vNWgTj
INFO: Task total time: 31.581 s
INFO: ------------------------------------------------------------------------
INFO: EXECUTION SUCCESS
INFO: ------------------------------------------------------------------------
INFO: Total time: 38.578s
INFO: Final Memory: 34M/293M
INFO: ------------------------------------------------------------------------
```

分析结果如下：

![质量分析结果](/images/sonar-result.png)

完成后可以添加 Badge

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=liluoao_api-doc&metric=alert_status)](https://sonarcloud.io/dashboard?id=liluoao_api-doc)
