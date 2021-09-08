const json2md = require('json2md');
const faqs = require('./faqs_with_tags.json');
const fs = require('fs');
const slugify = require('slugify');

json2md.converters.text = function (input, json2md) {
    return input;
}

function shorten(text) {
    return text.substr(0, 100)
}

if (!fs.existsSync('./src')){
    fs.mkdirSync('./src');
}

faqs.forEach(faq => {
    const responses = faq.response.split('\n')
    const docs = json2md([
    //     {
    //     text: '---'
    // },{
    //     text: 'title: ' + faq.question
    // },{
    //     text: 'tags'
    // },{
    //     ul: faq.tags
    // },{
    //     text: '---'
    // },
        {
        h5: faq.topic
    },{
        h2: faq.question
    },{
        ul: responses
    }]);

    // console.log(typeof docs)
    console.log(docs)

    docs.replace(/\n|\r/g, '')

    const folder = shorten(slugify(faq.topic, {
        lower: true,
        strict: true,
        trim: true
    }));

    const dir = './src/' + folder;

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    const output = './src/' + folder + '/' + shorten(slugify(faq.question, { lower: true })) + '.md'

    fs.writeFile(output, docs, (err) => {
      if (err) {
        console.error(err)
        return;
      }
    });
});

const faqsReduced = faqs.reduce((topic, faq) => {
    const key = shorten(slugify(faq.topic, {
        lower: true
    }));
    topic[key] = topic[key] || []
    topic[key].push(faq)
    return topic
}, {});

Object.keys(faqsReduced).forEach((key) => {
    const folder = shorten(slugify(key, {
        lower: true,
        strict: true,
        trim: true
    }));

    const links = faqsReduced[key].map(faq => {
        return {
            link: {
                title: faq.question,
                source: '/' + folder + '/' + shorten(slugify(faq.question, { lower: true }))
            }
        }
    })

    console.log(links)

    const docs = json2md([{
        h2: faqsReduced[key][0]['topic']
    },{
        ul: links
    }])

    const dir = './src/' + folder;

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

    const output = './src/' + folder + '/README.md'

    fs.writeFile(output, docs, (err) => {
        if (err) {
            console.error(err)
            return;
        }
    });
});

const topics = []

Object.keys(faqsReduced).forEach(key => {
    topics.push({ link: {
        title: faqsReduced[key][0]['topic'],
            source: '/' + shorten(slugify(key, {
            lower: true,
            strict: true,
            trim: true
        }))
    }});
});

const indexPage = json2md([
    {
        h1: 'Frequently Asked Questions'
    },
    {
        ul: topics
    }
]);

// write README.md
fs.writeFile('./src/README.md', indexPage, (err) => {
    if (err) {
        console.error(err)
        return;
    }
});

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