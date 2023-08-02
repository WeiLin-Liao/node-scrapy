const Crawler = require('crawler')
const cheerio = require('cheerio')
const fs = require("fs")
const path = require('path')
const generate = require('./utils/utils')

const crawler = new Crawler({
    rateLimit: 2000,
    maxConnections: 5,
    method: "GET",
    http2: true,
    callback: (error, response, done) => parse_article(error, response, done)
});

crawler.queue({
    uri: 'https://bbs.xiaobaicai.fun/page/1',
    callback: (error, response, done) => {
        if (error) {
            console.error(error)
            return done()
        }

        const $ = cheerio.load(response.body),
              posts = $("#index-tab-main posts"), // 文章列表
              urls = []; // 文章链接
        
        // 遍历文章路径
        if (posts.length) {
            posts.each((idx, dom) => {
                urls.push($(dom).find(".item-heading a").attr("href"))
            })
        }

        // crawler.queue(urls.reverse()) // 倒序
        crawler.queue(urls) // 正常

        return done();
    }
})


// 解析文章
async function parse_article(error, response, done) {

    if (error) return done();

    $ = cheerio.load(response.body)

    // 替换图片懒加载真实地址
    $("img").each((idx, img) => {
        $(img).attr("src", $(img).data('src'))
    })

    // 删除隐藏内容付费查看
    $(".hidden-box").remove()

    const first_p = $(".theme-box>.article-content>p").eq(0)

    // 如果第一个不是图片就显示文章简介
    if (!first_p.children().is("img")) {
        first_p.after('<p>这里是文章的简介</p>')
    }

    let title = $(".article-title a").text(),
        category = $(".breadcrumb li").eq(1).text().trim(),
        tags = $(".article-tags"),
        content = $(".theme-box>.article-content>").children().html(),
        url = response.options.uri;
    
    const md_contant = generate_md_content(title, category, tags, content, url)

    write_blogs_md(md_contant, await create_make_dir(category), $(".action-like").data("pid"), done)
}

// 创建目录
function create_make_dir(fileName) {
    let filePath = path.join(__dirname, "../blogs/" + fileName);
    fs.mkdirSync(filePath, { recursive: true }, err => {
        if(err){
            throw err
        }
    });
    return filePath
}

// 生成MD文件
function generate_md_content(title, category, tags, content, url) {
return `---
${generate.title(title)}
${generate.date()}
${generate.categories(category)}
${generate.tags(tags)}
---

<Boxx type='warning' />

${generate.markdown(content)}

## 下载地址：
[${title}](${url})
`
}

// 写入博客文件
function write_blogs_md(markdown, dirName, fileName, done) {
    let filePath = `${dirName}/${fileName}.md`
    fs.access(filePath, fs.constants.F_OK, error => {
        if (!error) {
            console.log(fileName + '.md - 文件写入失败！' + "原因：文件已存在")
            return done()
        } else {
            fs.writeFileSync(filePath, markdown, function(err){
                if(err){
                    return console.log(fileName + '.md - 文件写入失败！' + err.message)
                }
                console.log(fileName + ' - 文件写入成功！')
            })
            return done()
        }
    });
}