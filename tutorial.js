const fetch = require("node-fetch");
const ObjectsToCsv = require("objects-to-csv");
const dotenv = require("dotenv");


dotenv.config();
API_KEY = process.env.API_KEY;
WEBSITE_ID = process.env.WEBSITE_ID;


const EMAILS = [
'imi.babe2006@gmail.com',
'jinikoduah@gmail.com',
'ayomideootieno@yahoo.com',
'debola_ibironke@yahoo.com',
'deyemicaxtob@gmail.com',
'ope.elesin@gmail.com',
'ade.akinbami98@gmail.com',
'pastogbenga2002@yahoo.com',
'damyakinboye@gmail.com',
'jashaolu6@gmail.com',
'fadeyito@gmail.com',
'clarissesamo@yahoo.ca',
'olubukolasanwo@gmail.com',
'ayomideotieno@yahoo.com',
'ayomideotieno@yahoo.com',
'akinbusola2003@gmail.com',
'damjudav@yahoo.com',
'meemz2291@gmail.com',
'temiwaye@gmail.com',
'absa@hotmail.com',
'bimak1@yahoo.com',
'zinoobiegbedi@gmail.com',
'ayomideotieno@yahoo.com',
'kikelomoe@gmail.com',
'ehinor.oki@gmail.com',
'bimzy1414@gmail.com',
'chiomakins@gmail.com',
'barimoro@yahoo.com',
'mkgwek888@hotmail.com',
'clarissesamo@yahoo.ca',
'tomiwaajayi@gmail.com',
'olad.toyin@gmail.com',
'karo345@hotmail.com',
'ayomideotieno@yahoo.com',
'bukola.watson@live.com',
'odili34@hotmail.com',
'ifemadee@gmail.com',
'ope.elesin@gmail.com',
'taitayone@yahoo.com',
'damjudav@yahoo.com',
'ogechiucheatu@gmail.com',
'amazinggrace@gmail.com',
'ayomideotieno@yahoo.com',
'titioyegbile@hotmail.com',
'damjudav@yhoo.con',
'iteoluwa.aladesanmi@studentkipp.org',
'araoluwaakinwunmi@gmail.com',
'coachogey@gmail.com',
'yemi_adesina@hotmail.com',
'jinikoduah@gmail.com',
'koredeesan@gmail.com',
'nancywulff2290@gmail.com',
'ayomideotieno@yahoo.com',
'godfrey.onah@yahoo.com',
'iteoluwa.aladesanmi@studentkipp.org',
'karo345@hotmail.com',
'nonobrand@yahoo.com',
'chinaza.akobi@gmail.com',
'dema_kay@yahoo.com',
'mkgwek888@hotmail.com',
'gummiebear3150@gmail.com',
'uddyoguagha@gmail.com',
'bamzylomo@gmail.com',
'ayomideotieno@yahoo.com',
'bukola@safarigroupltd.com',
]
//WRITE DATA TO CSV FILE
const toCSV = async (array, filename) => {
    // const interim = array.sort(compare)
    // console.log(interim)
    const csv = new ObjectsToCsv(array);
    await csv.toDisk(`${filename}`, {
      allColumns: false,
      append: false,
    });
  };

  const wordCount = (text) => {
    var wordCount = 0;
    for (var i = 0; i <= text.length; i++) {
      if (text.charAt(i) == " ") {
        wordCount++;
      }
    }
    if (wordCount >= 7 && wordCount <= 85) {
      return "yes";
    } else {
      return "no";
    }
  };

  const getPages = async () => {
    const pages = await fetch(
      `https://talk.hyvor.com/api/v1/pages?website_id=2837&api_key=f8990b031438a0e374da7e2b6ec1945eab4e14699c96361fc95cbffcf4a5&sort=most_commented&limit=250`
    )
      .then((res) => res.json())
      .then((pages) => pages.data)
      .catch((err) => {
        console.log(err);
      });
  
    return pages;
  };

  const populatePages = async (pages) => {
    console.log("Populating Pages")
    for (let i = 0; i < pages.length; i++) {
      // console.log(pages[i])
      pages[i].comments = await getAllComments(
        pages[i].page_identifier,
        pages[i].comments_count
      ).then((comments) => {
        const combinedComments = [].concat.apply([], comments);
        // console.log(combinedComments)
        return combinedComments;
      });
      // console.log(pages[i].data)
    }
  };

  const getComments = async (offset = 0, page_identifier) => {
    console.log(`Fetching Comments in page ${page_identifier}`)
    const comments = await fetch(
      `https://talk.hyvor.com/api/v1/comments?website_id=2837&api_key=f8990b031438a0e374da7e2b6ec1945eab4e14699c96361fc95cbffcf4a5&type=comments&limit=250&offset=${offset}&page_identifier=${page_identifier}`
    )
      .then((res) => res.json())
      .then((res) => {
        const batch = res.data.map((user) => {
          return {
            name: user.user.name ? user.user.name.toUpperCase() : "",
            email: user.user.email ? user.user.email.toLowerCase() : "",
            // day_posted: numDaysBetween(DAY1, user.created_at),
            // unix_timestamp: user.created_at,
            // date_created: new Date(user.created_at * 1000),
            day_posted: user.page.page_identifier,
            wall_of_faith: wordCount(user.markdown),
          };
        });
        return [
          batch,
          batch.map((email) => {
            return email.email;
          }),
        ];
      })
      .then((emails) => {
        return emails[0];
      });
    // console.log(comments)
    return comments;
  };

  const getAllComments = async (page_identifier, comment_count) => {
    let i = 0;
    let commentsList = [];
    while (i < comment_count) {
      try {
        const batch = await getComments(i, page_identifier);
        commentsList = [...commentsList, batch];
        i = i + 250;
      } catch (err) {
        console.log(err);
      }
    }
    // console.log(commentsList)
    return [...commentsList[0], ...commentsList[1]];
  };

  const getAllCommentsData = (pagesArray) => {
    let list = []
    pagesArray.forEach(page => {
      // console.log(page)
      // console.log('going to concat now')
      list = list.concat(page.comments)
    })
    return list
  }

  const main = async () => {

    // let pages = await getPages().then(async (pagesData) => {
    //     await populatePages(pagesData)
    //     // console.log(pagesData)
    //     return pagesData
    //   }).catch(err => console.log(err));
    //   console.log( typeof pages)

    //   let dailyComments = getAllCommentsData(pages)
    //   console.log(dailyComments[0])

    let manifest = []
    for (let i = 1; i < 91; i++){
        manifest[i-1] = await getAllComments(`day-${i}`, 500)
    }

    for (let i = 0; i < manifest.length; i++){
        manifest[i] = manifest[i].map(day => day.email)
        manifest[i] = [`day ${i+1}`, ...manifest[i]]
    }
   toCSV(manifest, 'manifest.csv')

    
//     let users = []
//     let history = []
// EMAILS.forEach((email,i ) => {
//     // console.log(email)
//     let bool = true 
//     for (let i = 0; i < manifest.length; i++){
        
//         bool = bool * manifest[i].includes(email)
//     }
    
//     users.concat(
//         {email,bool}
//     )

    
//   })
//   console.log(users)
  }

  main()