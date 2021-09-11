const json2md = require('json2md');
const faqs = require('./faqs.json');
const fs = require('fs');
const slugify = require('slugify');

const rootPath = './src';
// const baseFolderPath = slugify('2022', {
//     lower: true,
// });
const baseFolderPath = '';
const baseUrl = '';

const basePath = `${rootPath}`;

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

// create category links for base index in src/2022/README.md
const categoryLinks = [];

Object.keys(input).forEach(key => {
    // create category folder
    const categoryFolder = basePath + '/' + key;

    categoryLinks.push({
        link: {
            title: key.toUpperCase().replace(/-/g, ' '),
            source: baseUrl + '/' + key
        }
    })

    // if the folder does not exist, create it
    if (! fs.existsSync(categoryFolder)) {
        fs.mkdirSync(categoryFolder);
    }

    // iterate over topics and create topic Folder
    const topics = input[key],
        categoryContents = [];

    Object.keys(topics).forEach(key => {
        console.log('topicsKey: ', key)

        // next is topic folder
        const topicFolder = categoryFolder + '/' + key;

        

        const topicTitle = key.toUpperCase().replace(/-/g, ' ');

        categoryContents.push({
            link: {
                title: key.toUpperCase().replace(/-/g, ' '), 
                source: topicFolder.replace('./src','')
            }
        })

        const questionsList = [];

        const questions = topics[key]

        questions.forEach(q => {
            console.log('q: ', q.question)
            questionsList.push({
                link: {
                    title: q.question,
                    source: (topicFolder + '/' + genSlug(q.question) + '.html').replace('./src', '')
                }
            })
        })

        if (!fs.existsSync(topicFolder)) {
            fs.mkdirSync(topicFolder);
        }

        // generate readme
        const output = topicFolder + '/' + 'README.md';

        const topicsReadme = json2md([{
            text: '---\ndescription: Topics README\n---'
        },{
            h1: topicTitle
        },{
            ul: questionsList
        }])

        fs.writeFile(output, topicsReadme, () => {
            console.log('done writing topics readme for ', topicTitle , 'in ', output)
        })

    });

    const categoryTitle = key.toUpperCase().replace(/-/g, ' ');

    const categoryFolderReadme = json2md([{
        text: '---\ntitle: ' + categoryTitle + '\n---'
    },{
        h1: categoryTitle
    },{
        ul: categoryContents
    }]);

    fs.writeFile(categoryFolder + '/README.md', categoryFolderReadme, () => {
        console.log('categoryFolder README', categoryFolder, ' is created')
    })
});

const categoryReadmeFile = basePath + '/README.md';

// generate README files only for index, category, and topics
const categoryReadme = json2md([
{
    h1: 'Categories'
},
{
    ul: categoryLinks
}])

fs.writeFile(categoryReadmeFile, categoryReadme, () => {
    console.log('done with basePath readme');
    return;
});
    