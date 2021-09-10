const json2md = require('json2md');
const faqs = require('./faqs.json');
const fs = require('fs');
const slugify = require('slugify');

const rootPath = './src';
const baseFolderPath = slugify('2022', {
    lower: true,
});

const basePath = `${rootPath}/${baseFolderPath}`;

if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath);
}

function shorten(text) {
    return text.substr(0, 100)
}

json2md.converters.text = function(string, json2md) {
    return string;
}

const genSlug = (text) => {
    return shorten(slugify(text, {
        lower: true, 
        strict: true
    }));
}

const removePuncs = (text) => {
    const regex = /[!"#$%&'()*+-/:;<=>@[\]^_`{|}~]/g;
    return text.replace(regex, '');
}

function generateInput() {
    const categories = faqs.reduce((categories, faq) => {
        const key = genSlug(faq.category);
        categories[key] = categories[key] || [];
        categories[key].push(faq);
        return categories;
    }, {});

    const groupedByTopics = {};

    Object.keys(categories).forEach(key => {
        const faqs = categories[key];

        faqs.forEach(faq => {
            groupedByTopics[key] = groupedByTopics[key] || {};
            groupedByTopics[key][genSlug(faq.topic)] = groupedByTopics[key][genSlug(faq.topic)] || [];
            faq.slug = genSlug(faq.question);
            groupedByTopics[key][genSlug(faq.topic)].push(faq);
        })
    });

    fs.writeFile('groupedByTopics.json', JSON.stringify(groupedByTopics), err => {
        console.log(err);
        return;
    });
}

if (! fs.existsSync('./groupedByTopics.json')) {
    generateInput()
}

const input = require('./groupedByTopics.json');

Object.keys(input).forEach(key => {
    // create category folder and readme for folder
    const categoryFolder = `${basePath}/${key}`;

    if (! fs.existsSync(categoryFolder)) {
        fs.mkdirSync(categoryFolder);
    }

    const categoryList = []

    const topics = input[key];

    Object.keys(topics).forEach(key => {

        const topicFolder = `${categoryFolder}/${key}`;

        categoryList.push({
            link: {
                title: key.toUpperCase().replace('-',' '),
                source: topicFolder.replace('./src')
            }
        });

        if (! fs.existsSync(topicFolder)) {
            fs.mkdirSync(topicFolder);
        }

        const faqs = topics[key];

        const topicsContent = []
        
        faqs.forEach(faq => {
            console.log(topicFolder);
            
            topicsContent.push({
                link: {
                    title: faq.question,
                    source: `${topicFolder}/${genSlug(faq.question)}`.replace('./src/2022','')
                }
            })

            const faqDoc = json2md([
            {
                text: `---\ntitle: ${removePuncs(faq.question)}\nsidebarDepth: 2\n---`
            },
            {
                h1: faq.question
            },
            {
                ul: faq.response.split('\n')
            }]);


            fs.writeFile(`${topicFolder}/${faq.slug}.md`, faqDoc, err => {
                console.error(err);
                return;
            })

        });

        const title = faqs[0]['topic'];

        const topicsPage = json2md([{
            text: `---\ntitle: ${title}\n---`
        },{
            h1: title
        },{
            ul: topicsContent
        }])

        fs.writeFile(`${topicFolder}/README.md`, topicsPage, err => {
            console.error(err)
            return;
        });

    });

    const categoryPage = json2md([
        {
            text: `---\ntitle: ${key.toUpperCase().replace('-',' ')}\nsearch: false\n---`
        },
        {
            h1: key.toUpperCase().replace('-',' ')
        },
        {
            ul: categoryList
        }
    ]);

    fs.writeFile(`${categoryFolder}/README.md`, categoryPage, err => {
        console.log(err);
        return;
    });


});