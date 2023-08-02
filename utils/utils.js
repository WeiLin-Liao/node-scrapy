// HTML转MarkDown
const TurndownService = require('turndown')
const turndownService = new TurndownService()

module.exports = {
  // HTML转MD
  markdown(content) {
    return String(turndownService.turndown(content)).replace("这里是文章的简介","<!-- more -->")
  },
  // 生成标题
  title(title) {
    return `title: ${title}`
  },
  date() {
    return `date: ${this.getFormatDate()}`
  },
  // 生成分类
  categories(category) {
    return `categories:
 - ${category}`
  },
  // 生成标签
  tags(tags) {
    if (tags.length) {
      let tag = "tags: "
      tags.find("a").each((idx, dom) => {
        tag += ("\n - " + $(dom).text().replace("#","").trim())
      })
      return tag
    }
  },
  // 生成时间
  getFormatDate (type) {
    const date = new Date()
    const year = date.getFullYear()
    let month = date.getMonth() + 1
    let strDate = ''
    const seperator1 = '-' // 连接年月日
    const seperator2 = ':' // 连接时分秒
    let currentdate = ''
    strDate = date.getDate()
    if (month >= 1 && month <= 9) {
      month = '0' + month
    }
    if (strDate >= 0 && strDate <= 9) {
      strDate = '0' + strDate
    }
    switch (type) {
      case 'time':
        currentdate = date.getHours() + seperator2 + date.getMinutes() + seperator2 + date.getSeconds()
        break
      case 'year':
        currentdate = parseInt(year)
        break
      default:
        currentdate = year + seperator1 + month + seperator1 + strDate
        break
    }
    return currentdate
  }
}