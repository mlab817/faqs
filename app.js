const json2md = require('json2md');
const faqs = require('./faqs_with_tags.json');
const fs = require('fs');
const slugify = require('slugify');

const rootPath = './src';
const baseFolderPath = slugify('FY 2022 Plan and Budget', {
    lower: true,
});
const basePath = `/${baseFolderPath}`;

if (!fs.existsSync(rootPath + basePath)) {
    fs.mkdirSync(rootPath + basePath);
}

function shorten(text) {
    return text.substr(0, 100)
}

json2md.converters.text = function(string, json2md) {
    return string;
}

/**
 * Generate README.md for each topic
 */
const faqsReduced = faqs.reduce((topic, faq) => {
    const key = shorten(slugify(faq.topic, {
        lower: true
    }));
    topic[key] = topic[key] || []
    topic[key].push(faq)
    return topic
}, {});

/**
 * Iterate over the topics
 * Generate folder for each topic
 * Create a topic README.md
 * Create the individual md files
 */
Object.keys(faqsReduced).forEach((key) => {
    // generate name for the folder
    const folderPath = `${rootPath}${basePath}/${key}`;

    // if folder does not exist, create it
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
    }

    // create the README file to contain the links

    const links = faqsReduced[key].map(faq => {
        return {
            link: {
                title: faq.question,
                source: `${basePath}/${key}` + '/' + shorten(slugify(faq.question, { lower: true }))
            }
        }
    });

    const docs = json2md([{
        text: '---\ntitle: ' + faqsReduced[key][0]['topic'] +'\nsearch: false\n---'
    },{
        h2: faqsReduced[key][0]['topic']
    },{
        ul: links
    }]);

    const output = `${folderPath}/README.md`

    fs.writeFile(output, docs, (err) => {
        if (err) {
            console.error(err)
            return;
        }
    });

    /**
     * Generate md files for each item in the json
     */
    faqsReduced[key].forEach(faq => {
        const responses = faq.response.split('\n')
        const frontmatter = '---\ntitle: ' + faq.question.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '') + '\n---'

        const docs = json2md([
            {
                text: frontmatter
            },
            {
                h2: faq.topic
            },{
                h1: faq.question
            },{
                ul: responses
            }]);

        const output = folderPath + '/' + shorten(slugify(faq.question, { lower: true })) + '.md'

        fs.writeFile(output, docs, (err) => {
            if (err) {
                console.error(err)
                return;
            }
        });
    });
});