---
title: 使用SonarQube管理代码质量
urlname: use-sonarqube-continuous-code-quality
date: 2018-12-25 16:21:24
tags: tool
---

[SonarQube®](https://www.sonarqube.org/)是一种自动代码审查工具，用于检测代码中的错误，漏洞和代码异味。它可以与您现有的工作流程集成，以便在项目分支和拉取请求之间进行连续的代码检查。官方提供了2种方式，一种是下载后本地搭建，另一种是在线运行。

<!-- more -->

这里以在线运行为例，进入[SonarCloud](https://sonarcloud.io/about/sq)，使用 GitHub 账号登录。在 `Create Organization` 创建组织后，可以开始 `Analyze projects` 分析你的项目了。

![](/images/sonar-add-project.png)

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

输出结果如下：
```
INFO: Scanner configuration file: D:\sonar-scanner-3.2.0.1227-windows\bin\..\con
f\sonar-scanner.properties
INFO: Project root configuration file: NONE
INFO: SonarQube Scanner 3.2.0.1227
INFO: Java 1.8.0_121 Oracle Corporation (64-bit)
INFO: Windows 7 6.1 amd64
INFO: User cache: C:\Users\viruser.v-desktop\.sonar\cache
INFO: SonarQube server 7.6.0
INFO: Default locale: "zh_CN", source code encoding: "GBK" (analysis is platform
 dependent)
INFO: Publish mode
INFO: Load global settings
INFO: Load global settings (done) | time=1567ms
INFO: Server id: BD367519-AWHW8ct9-T_TB3XqouNu
INFO: User cache: C:\Users\viruser.v-desktop\.sonar\cache
INFO: Load/download plugins
INFO: Load plugins index
INFO: Load plugins index (done) | time=331ms
INFO: Load/download plugins (done) | time=868ms
INFO: Loaded core extensions: branch-scanner
INFO: Process project properties
INFO: Execute project builders
INFO: Execute project builders (done) | time=12ms
INFO: Load project branches
INFO: Load project branches (done) | time=301ms
INFO: Load project pull requests
INFO: Load project pull requests (done) | time=286ms
INFO: Load branch configuration
INFO: Load branch configuration (done) | time=5ms
INFO: Load project repositories
INFO: Load project repositories (done) | time=359ms
INFO: Load quality profiles
INFO: Load quality profiles (done) | time=2319ms
INFO: Load active rules
INFO: Load active rules (done) | time=12946ms
INFO: Load metrics repository
INFO: Load metrics repository (done) | time=288ms
INFO: Project key: royal-flush-crm_mei-crm
INFO: Project base dir: D:\WWW\Sm
INFO: Organization key: royal-flush-crm
INFO: -------------  Scan royal-flush-crm_mei-crm
INFO: Base dir: D:\WWW\Sm
INFO: Working dir: D:\WWW\Sm\.scannerwork
INFO: Source paths: .
INFO: Source encoding: GBK, default locale: zh_CN
WARN: Property 'sonar.abap.file.suffixes' is not declared as multi-values/proper
ty set but was read using 'getStringArray' method. The SonarQube plugin declarin
g this property should be updated.
INFO: Index files
INFO: 15 files indexed
INFO: Quality profile for php: Sonar way
INFO: Quality profile for web: Sonar way
INFO: Sensor SonarJavaXmlFileSensor [java]
INFO: Sensor SonarJavaXmlFileSensor [java] (done) | time=2ms
INFO: Sensor HTML [web]
INFO: Sensor HTML [web] (done) | time=347ms
INFO: Sensor JaCoCo XML Report Importer [jacoco]
INFO: Sensor JaCoCo XML Report Importer [jacoco] (done) | time=6ms
INFO: Sensor PHP sensor [php]
INFO: 11 source files to be analyzed
INFO: No PHPUnit test report provided (see 'sonar.php.tests.reportPath' property
)
INFO: No PHPUnit coverage reports provided (see 'sonar.php.coverage.reportPaths'
 property)
INFO: Sensor PHP sensor [php] (done) | time=2136ms
INFO: Sensor Analyzer for "php.ini" files [php]
INFO: Sensor Analyzer for "php.ini" files [php] (done) | time=14ms
INFO: Sensor Zero Coverage Sensor
INFO: 11/11 source files have been analyzed
INFO: Sensor Zero Coverage Sensor (done) | time=100ms
INFO: Sensor JavaSecuritySensor [security]
INFO: Reading UCFGs from: D:\WWW\Sm\.scannerwork\ucfg2\java
INFO: UCFGs: 0, excluded: 0, source entrypoints: 0
INFO: No UCFGs have been included for analysis.
INFO: Sensor JavaSecuritySensor [security] (done) | time=23ms
INFO: Sensor CSharpSecuritySensor [security]
INFO: Reading UCFGs from: D:\WWW\Sm\ucfg_cs2
INFO: UCFGs: 0, excluded: 0, source entrypoints: 0
INFO: No UCFGs have been included for analysis.
INFO: Sensor CSharpSecuritySensor [security] (done) | time=1ms
INFO: SCM provider for this project is: git
INFO: 12 files to be analyzed
INFO: 12/12 files analyzed
INFO: 2 files had no CPD blocks
INFO: Calculating CPD for 10 files
INFO: CPD calculation finished
INFO: Analysis report generated in 316ms, dir size=158 KB
INFO: Analysis reports compressed in 89ms, zip size=52 KB
INFO: Analysis report uploaded in 2002ms
INFO: ANALYSIS SUCCESSFUL, you can browse https://sonarcloud.io/dashboard?id=roy
al-flush-crm_mei-crm
INFO: Note that you will be able to access the updated dashboard once the server
 has processed the submitted analysis report
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

![](/images/sonar-result.png)

完成后可以添加 Badge

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=liluoao_api-doc&metric=alert_status)](https://sonarcloud.io/dashboard?id=liluoao_api-doc)