const faqs = require("./faqs_with_tags.json");
const slugify = require("slugify");
const fs = require("fs");

function shorten(text) {
    return text.substr(0, 100)
}

const faqsReduced = faqs.reduce((topic, faq) => {
    const key = shorten(slugify(faq.topic, {
        lower: true
    }));
    topic[key] = topic[key] || []
    topic[key].push(faq)
    return topic
}, {});

// generate json in the ff format and write to ./src/.vuepress/sidebar.json
/*
[
    {
        title: 'Group 1',   // required
        path: '/foo/',      // optional, link of the title, which should be an absolute path and must exist
        collapsable: false, // optional, defaults to true
        sidebarDepth: 1,    // optional, defaults to 1
        children: [
            '/'
        ]
    }
]
 */

const sidebar = [];

Object.keys(faqsReduced).forEach((key) => {
    const faqs = faqsReduced[key];
    const title = faqs[0]['topic'];
    const path = '/' + shorten(slugify(title, {
        lower: true,
        strict: true,
        trim: true
    })) + '/'

    sidebar.push({
        title: title,
        path: path,
        children: [
            // faqs.map(faq => {
            //     return [shorten(slugify(faq.question, {
            //         lower: true,
            //         strict: true,
            //         trim: true
            //     }))]
            // })
        ]
    })
});

fs.writeFile('./src/.vuepress/sidebar.json', JSON.stringify(sidebar), (err) => {
    console.error(err);
    return;
})