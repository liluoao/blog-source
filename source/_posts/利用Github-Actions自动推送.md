---
title: 利用Github-Actions自动推送
date: 2022-08-30 12:02:32
urlname: use-github-workflow-send-good-morning-everyday
category: 工具
---

## 工具介绍

GitHub Actions 是一种持续集成和持续交付 (CI/CD) 平台，可用于自动执行生成、测试和部署管道

您可以创建工作流程来构建和测试存储库的每个拉取请求，或将合并的拉取请求部署到生产环境

GitHub Actions 不仅仅是 DevOps，还允许您在存储库中发生其他事件时运行工作流程。 例如，您可以运行工作流程，以便在有人在您的存储库中创建新问题时自动添加相应的标签

<!--more-->

> GitHub 提供 Linux、Windows 和 macOS 虚拟机来运行工作流程，或者您可以在自己的数据中心或云基础架构中托管自己的自托管运行器

![pklytQe.jpg](https://s21.ax1x.com/2024/05/26/pklytQe.jpg)

Workflow 是一个可配置的自动化过程，它将运行一个或多个作业。 工作流程由签入到存储库的 YAML 文件定义，并在存储库中的事件触发时运行，也可以手动触发，或按定义的时间表触发

工作流程在存储库的 `.github/workflows` 目录中定义，存储库可以有多个工作流程，每个工作流程都可以执行不同的任务集

例如，您可以有一个工作流程来构建和测试拉取请求，另一个工作流程用于在每次创建发布时部署应用程序，还有一个工作流程在每次有人打开新议题时添加标签

## Configuration

### Github

创建项目，在项目 Setting -> Secrets -> Actions 里新建几个我们要用的配置：

- 需要查询天气的城市 `CITY` 是地级市汉字
- 生日 `BIRTHDAY` 是 `m-d` 格式
- 纪念日 `START_DATE` 是 `Y-m-d` 格式

![secrets](https://i.imgtg.com/2022/08/30/ZmN9s.png)

### 微信测试号

创建一个测试号（[申请测试号|微信开发文档](https://developers.weixin.qq.com/miniprogram/dev/devtools/sandbox.html)），并且让收消息的人关注，获取到他的 `USER_ID`

> 有自己个人号更好（我的号没管它被自动注销了）

![微信测试号关注](https://i.imgtg.com/2022/08/30/ZmrUK.png)

加个消息模版，获取 `TEMPLATE_ID`，加上测试号本身的 `APP_ID` `APP_SECRET` ，配置就齐了：

![模版消息](https://i.imgtg.com/2022/08/30/ZmKdS.png)

## Workflow

使用 GitHub 的 Actions 建立工作流：

> 支持定时 `schedule` 与手动 `workflow_dispatch` 执行脚本 *main.py*，并且把设置中写的配置读出来

```yaml .github/workflows/main.yml
name: morning
on:
  schedule:
  - cron:  '1 23 * * *'
  workflow_dispatch:

jobs:
  send_message:
    runs-on: ubuntu-latest
    name: send good morning

    steps:
    - name: checkout
      uses: actions/checkout@v3
      with:
        ref: master

    - name: sender
      uses: actions/setup-python@v2
      with:
        python-version: '3.x'
        architecture: 'x64'
    - run: pip install -r ./requirements.txt && python ./main.py

    env:
      APP_ID: ${{ secrets.APP_ID }}
      APP_SECRET: ${{ secrets.APP_SECRET }}
      TEMPLATE_ID: ${{ secrets.TEMPLATE_ID }}
      USER_ID: ${{ secrets.USER_ID }}
      START_DATE: ${{ secrets.START_DATE }}
      BIRTHDAY: ${{ secrets.BIRTHDAY }}
      CITY: ${{ secrets.CITY }}
```

这里 Cron 格式是标准的*分时日月年*，更多内容查看文档：

> UTC 时间，北京时间要减 8

![schedule](https://i.imgtg.com/2022/08/30/ZmgEL.png)

## Python

先把配置拿出来：

```python
today = datetime.utcnow() + timedelta(hours=8)
today = datetime.strptime(str(today.date()), "%Y-%m-%d")
start_date = os.getenv('START_DATE')
city = os.getenv('CITY')
birthday = os.getenv('BIRTHDAY')

app_id = os.getenv('APP_ID')
app_secret = os.getenv('APP_SECRET')
user_ids = os.getenv('USER_ID', '').split("\n")
template_id = os.getenv('TEMPLATE_ID')
```

获取城市天气：

```python
def get_weather():
  if city is None:
    print('check your CITY config')
    return None
  url = "http://autodev.openspeech.cn/csp/api/v2.1/weather?openId=aiuicus&clientType=android&sign=android&city=" + city
  res = requests.get(url).json()
  if res is None:
    return None
  weather = res['data']['list'][0]
  return weather
```

计算纪念日：

```python
def get_memorial_days_count():
  if start_date is None:
    print('check your START_DATE config')
    return 0
  delta = today - datetime.strptime(start_date, "%Y-%m-%d")
  return delta.days
```

计算生日：

```python
def get_birthday_left():
  if birthday is None:
    print('check your BIRTHDAY config')
    return 0
  next = datetime.strptime(str(date.today().year) + "-" + birthday, "%Y-%m-%d")
  if next < datetime.now():
    next = next.replace(year=next.year + 1)
  return (next - today).days
```

获取一句情话：

> 失败重新调用

```python
def get_words():
  words = requests.get("https://api.shadiao.pro/chp")
  if words.status_code != 200:
    return get_words()
  return words.json()['data']['text']
```

请求微信接口：

> 配置模版消息时 `{{words.DATA}}` 对应 `data.words` 字段，依此类推

```python
try:
  client = WeChatClient(app_id, app_secret)
except WeChatClientException as e:
  print('get access token fail')
  exit(502)

wm = WeChatMessage(client)
weather = get_weather()
if weather is None:
  print('get weather fail')
  exit(422)
data = {
  "city": {
    "value": city,
    "color": get_random_color()
  },
  "date": {
    "value": today.strftime('%Y年%m月%d日'),
    "color": get_random_color()
  },
  "weather": {
    "value": weather['weather'],
    "color": get_random_color()
  },
  "temperature": {
    "value": math.floor(weather['temp']),
    "color": get_random_color()
  },
  "highest": {
    "value": math.floor(weather['high']),
    "color": get_random_color()
  },
  "lowest": {
    "value": math.floor(weather['low']),
    "color": get_random_color()
  },
  "love_days": {
    "value": get_memorial_days_count(),
    "color": get_random_color()
  },
  "birthday_left": {
    "value": get_birthday_left(),
    "color": get_random_color()
  },
  "words": {
    "value": get_words(),
    "color": get_random_color()
  },
}

if __name__ == '__main__':
  count = 0
  try:
    for user_id in user_ids:
      res = wm.send_template(user_id, template_id, data)
      count+=1
  except WeChatClientException as e:
    print('wechat error:%s.code:%d' % (e.errmsg, e.errcode))
    exit(502)

  print("total" + str(count) + "messages")
```

随机颜色为了好看点，手机上生效：

```python
def get_random_color():
  return "#%06x" % random.randint(0, 0xFFFFFF)
```

引入依赖：

```python
from datetime import date, datetime, timedelta
import math
from wechatpy import WeChatClient, WeChatClientException
from wechatpy.client.api import WeChatMessage
import requests
import os
import random
```

```python requirements.txt
certifi==2022.6.15
cffi==1.15.1
charset-normalizer==2.1.0
cryptography==37.0.4
idna==3.3
optionaldict==0.1.2
pycparser==2.21
python-dateutil==2.8.2
requests==2.28.1
six==1.16.0
urllib3==1.26.11
wechatpy==1.8.18
xmltodict==0.13.0
```

最终效果如图：

![手机效果](https://i.imgtg.com/2022/08/30/ZmJFX.jpg)
