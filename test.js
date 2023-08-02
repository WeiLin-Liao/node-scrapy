var fs = require("fs")
var path = require("path")

const { getFormatDate } = require('./utils/utils')
const generate = require('./utils/utils')

let filePath = path.join(__dirname, "../blogs/vip.md")

fs.access(filePath, fs.constants.F_OK, error => {
    if (!error) {
        console.log("文件已存在")
    } else {
        console.log("文件不存在")
    }
});

console.log(getFormatDate(), generate.getFormatDate())