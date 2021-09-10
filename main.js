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

    const categoryList = json2md([
        {
            text: `---\ntitle: ${key}\nsearch: false\n---`
        },
        {
            h1: JSON.stringify(input[key])
        },
        {
            ul: []
        }
    ]);

    const topics = input[key];

    Object.keys(topics).forEach(key => {

        const topicFolder = `${categoryFolder}/${key}`;

        if (! fs.existsSync(topicFolder)) {
            fs.mkdirSync(topicFolder);
        }

        const faqs = topics[key];
        
        faqs.forEach(faq => {
            
            const faqDoc = json2md([
            {
                text: `---\ntitle: ${faq.question}\n---`
            },
            {
                h1: faq.question
            }]);


            fs.writeFile(`${topicFolder}/${faq.slug}.md`, faqDoc, err => {
                console.error(err);
                return;
            })

        });

    });

    fs.writeFile(`${categoryFolder}/README.md`, categoryList, err => {
        console.log(err);
        return;
    });
    // create topic folder per category
    // create faq file

});

// const byTopic = {};

// Object.keys(categories).forEach(key => {
//     const topic = categories[key]

//     byTopic[topic] = topic.reduce((byTopic, faq) => {
//         const topicGroup = genSlug(faq.topic);
//         byTopic[topicGroup] = byTopic[topicGroup] || [];
//         byTopic[topicGroup].push(faq);
//         return byTopic;
//     }, {});
// });

// console.log(byTopic);

// const groupFaqs = _.groupBy(faqs, function(item) {
//     console.log(item);
// });

// console.log(groupFaqs)

/*
// /**
//  * Iterate over the topics
//  * Generate folder for each topic
//  * Create a topic README.md
//  * Create the individual md files
//  */
// Object.keys(faqsReduced).forEach((key) => {
//     // generate name for the folder
//     const folderPath = `${rootPath}${basePath}/${key}`;

//     // if folder does not exist, create it
//     if (!fs.existsSync(folderPath)) {
//         fs.mkdirSync(folderPath);
//     }

//     // create the README file to contain the links

//     const links = faqsReduced[key].map(faq => {
//         return {
//             link: {
//                 title: faq.question,
//                 source: `${basePath}/${key}` + '/' + shorten(slugify(faq.question, { lower: true }))
//             }
//         }
//     });

//     const docs = json2md([{
//         text: '---\ntitle: ' + faqsReduced[key][0]['topic'] +'\nsearch: false\n---'
//     },{
//         h2: faqsReduced[key][0]['topic']
//     },{
//         ul: links
//     }]);

//     const output = `${folderPath}/README.md`

//     fs.writeFile(output, docs, (err) => {
//         if (err) {
//             console.error(err)
//             return;
//         }
//     });

//     /**
//      * Generate md files for each item in the json
//      */
//     faqsReduced[key].forEach(faq => {
//         const responses = faq.response.split('\n')
//         const frontmatter = '---\ntitle: ' + faq.question.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '') + '\n---'

//         const docs = json2md([
//             {
//                 text: frontmatter
//             },
//             {
//                 h2: faq.topic
//             },{
//                 h1: faq.question
//             },{
//                 ul: responses
//             }]);

//         const output = folderPath + '/' + shorten(slugify(faq.question, { lower: true })) + '.md'

//         fs.writeFile(output, docs, (err) => {
//             if (err) {
//                 console.error(err)
//                 return;
//             }
//         });
//     });
// });
// */