---
title: Vue实现文件上传
date: 2022-08-23 20:48:15
urlname: upload-file-with-vue-js
category: Vue
---

![](https://i.imgtg.com/2022/08/23/K8m8b.png)

<!-- more -->

## 依赖

首先引入处理 Excel 文件的包

```bash
npm install xlsx
```

此时没有限制包版本，跑起来时候报了个错：

> export 'default' (imported as 'XLSX') was not found in 'xlsx'

经过尝试后把版本降到 0.16 后解决

```bash
npm install xlsx@0.16.0 --save
```

## 样式

我们先实现纯前端样式，包括拖拽框和按钮等

由于这类功能可以复用，咱们把它封装成组件

```html
<template>
  <div>
    <input ref="excel-upload-input" class="excel-upload-input" type="file" accept=".xlsx, .xls" @change="handleClick">
    <div class="drop" @drop="handleDrop" @dragover="handleDragover" @dragenter="handleDragover">
      将文件拖到此处或者
      <el-button :loading="loading" style="margin-left:16px;" type="primary" @click="handleUpload">
        选择文件
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.excel-upload-input {
  display: none;
  z-index: -9999;
}

.drop {
  border: 2px dashed #bbb;
  width: 600px;
  height: 160px;
  line-height: 160px;
  margin: 0 auto;
  font-size: 24px;
  border-radius: 5px;
  text-align: center;
  color: #bbb;
  position: relative;
}
</style>
```

## 实现

准备工作，最终我们的目的是把表头和内容分开装到这两个对象里，并让调用组件的人拿到

```js
import XLSX from 'xlsx'

export default {
  data() {
    return {
      loading: false,
      excelData: {
        header: null,
        results: null
      }
    }
  }
}
```

给组件使用方暴露几个定制化方法：

```js
props: {
    beforeUpload: Function,
    onSuccess: Function
}
```

实际处理方法

```js
upload(rawFile) {
    this.$refs['excel-upload-input'].value = null // fix不能选同个文件

    // 定制校验
    if (!this.beforeUpload) {
        this.readerData(rawFile)
        return
    }
    const before = this.beforeUpload(rawFile)
    if (before) {
        this.readerData(rawFile)
    }
},
readerData(rawFile) {
    // TODO
}
```

实现拖拽实际需要 [event.stopPropagation](https://developer.mozilla.org/zh-CN/docs/Web/API/Event/stopPropagation) 和 [event.preventDefault](https://developer.mozilla.org/zh-CN/docs/Web/API/Event/preventDefault)

如果是通过 File 的 Input 进来的话，可以限制文件格式。对于拖拽的文件我们就需要判断格式

```js
isExcel(file) {
    return /\.(xlsx|xls|csv)$/.test(file.name)
}
```

```js
handleDrop(e) {
    if (this.loading) return
    const files = e.dataTransfer.files
    if (files.length !== 1) {
        this.$message.error('一次只允许上传一个文件')
        return
    }
    const rawFile = files[0]

    if (!this.isExcel(rawFile)) {
        this.$message.error('只支持上传 .xlsx, .xls, .csv 格式文件')
        return false
    }
    this.upload(rawFile)
}
```

```js
handleDragover(e) {
    e.dataTransfer.dropEffect = 'copy'
}
```

咱们接着把通过点击按钮上传的实现

```js
handleUpload() {
    this.$refs['excel-upload-input'].click()
}
```

```js
handleClick(e) {
    const files = e.target.files
    const rawFile = files[0]
    if (!rawFile) return
    this.upload(rawFile)
}
```

最后是处理文件的方法，网上挺多的

```js
readerData(rawFile) {
    this.loading = true
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = e => {
            const data = e.target.result
            const workbook = XLSX.read(data, { type: 'array' })
            const firstSheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[firstSheetName]
            const header = this.getHeaderRow(worksheet)
            const results = XLSX.utils.sheet_to_json(worksheet)
            this.generateData({ header, results })
            this.loading = false
            resolve()
        }
        reader.readAsArrayBuffer(rawFile)
    })
}
```

```js
getHeaderRow(sheet) {
    const headers = []
    const range = XLSX.utils.decode_range(sheet['!ref'])
    let C
    const R = range.s.r
    for (C = range.s.c; C <= range.e.c; ++C) {
        const cell = sheet[XLSX.utils.encode_cell({ c: C, r: R })]
        let hdr = '未知 ' + C
        if (cell && cell.t) hdr = XLSX.utils.format_cell(cell)
        headers.push(hdr)
    }
    return headers
}
```

成功时把表头和内容都传给父组件，并调用成功回调

```js
generateData({ header, results }) {
    this.excelData.header = header
    this.excelData.results = results
    this.onSuccess && this.onSuccess(this.excelData)
}
```

## 使用示例

一般我们上传文件后，如果内容不多，可以在页面展示出来

写一个很常见的成功后调用接口例子

```html
<template>
    <div class="app-container">
        <upload-excel-component :on-success="handleSuccess" :before-upload="beforeUpload" />
        <el-table :data="tableData" border highlight-current-row style="width: 100%;margin-top:20px;">
            <el-table-column v-for="item of tableHeader" :key="item" :prop="item" :label="item" />
        </el-table>
    </div>
</template>
<script>
import UploadExcelComponent from '@/components/UploadExcel/index.vue'
import { importTrademark } from '@/api/trademark'// 要调的接口

export default {
    name: 'UploadExcel',
    components: { UploadExcelComponent },
    data() {
        return {
            tableData: [],
            tableHeader: []
        }
    }
}
</script>
```

类似 PHP 去实现抽象类的方法

```js
beforeUpload(file) {
    const isLt1M = file.size / 1024 / 1024 < 1

    if (isLt1M) {
        return true
    }

    this.$message({
        message: '文件大小不要超过1M',
        type: 'warning'
    })
    return false
},
handleSuccess({ results, header }) {
    this.tableData = results
    this.tableHeader = header
    importTrademark(this.tableData).then(response => {
        this.$message({
            message: response.message,
            type: 'success'
        })
    })
}
```

这里是直接把数组给的后端，验证时可以如下写法

```php
public function rules (): array {
    return [
        '*.商标名称'   => 'required',
        '*.商标注册号' => 'required',
        '*.售价'      => 'required|numeric',
        '*.所属大类'   => 'required|int',
    ];
}
```

![潜龙勿用](https://i.imgtg.com/2022/08/27/ZFSuv.webp)
