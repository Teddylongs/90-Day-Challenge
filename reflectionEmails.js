const fetch = require("node-fetch");
const ObjectsToCsv = require("objects-to-csv");
const dotenv = require("dotenv");

dotenv.config();
API_KEY = process.env.API_KEY;
WEBSITE_ID = process.env.WEBSITE_ID;

let allResponses;

function count_duplicate(a) {
  let counts = {};

  for (let i = 0; i < a.length; i++) {
    if (counts[a[i]]) {
      counts[a[i]] += 1;
    } else {
      counts[a[i]] = 1;
    }
  }
  for (let prop in counts) {
    if (counts[prop] >= 2) {
      //  console.log(prop + " counted: " + counts[prop] + " times.")
    }
  }
  console.log(counts);
}

//COUNT NUMBER OF RESPONSES/REFLECTIONS PER EMAILS
const count_responses = (email_list) => {
  let checkedEmails = [];
  let emailCount = [];
  for (let i = 0; i < email_list.length; i++) {
    let email = email_list[i];
    if (!checkedEmails.includes(email)) { 
      checkedEmails = [...checkedEmails, email];
      emailCount[checkedEmails.indexOf(email)] = {
        email,
        responses: 1,
      };
    } else {
      emailCount[checkedEmails.indexOf(email)].responses += 1;
    }
  }

  console.log(emailCount);
};

//RETURN NUMBER OF DAYS BETWEEN TWO UNIX TIMESTAMPS
const numDaysBetween = function (d1, d2) {
  // console.log('today', today)
  var diff = Math.abs(d1 - d2);
  // console.log('diff', diff)
  return Math.ceil(diff / (60 * 60 * 24));
};

//WORD COUNTER USING SPACE BREAKS
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

const compare = (a, b) => a.day - b.day;

//WRITE DATA TO CSV FILE
const toCSV = async (array, filename) => {
  const interim = array.sort(compare)
  // console.log(interim)
  const csv = new ObjectsToCsv(interim);
  await csv.toDisk(`${filename}`, {
    allColumns: false,
    append: true,
  });
};

//CONVERT DATA TO CSV STRING
const toStringCSV = async (array) => {
  const csv = new ObjectsToCsv(array.sort(compare)).toString();
  return csv;
};
const getEmails = async (offset, data) => {
  let emails = [];
  await fetch(
    `https://talk.hyvor.com/api/v1/comments?website_id=${WEBSITE_ID}&api_key=${API_KEY}&type=comments&limit=250&offset=${offset}`
  )
    .then((res) => res.json())
    .then((res) => {
      emails = res.data.map((user) => {
        return {
          email: user.user.email ? user.user.email.toLowerCase() : "",
          // day_posted: numDaysBetween(DAY1, user.created_at),
          // unix_timestamp: user.created_at,
          // date_created: new Date(user.created_at * 1000),
          day_created: user.page.page_identifier,
          wallOfFaith: wordCount(user.markdown),
        };
      });
      return [
        emails,
        emails.map((email) => {
          return email.email;
        }),
      ];
    })
    .then((emails) => {
      toCSV(emails[0]);
    });
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
  return commentsList;
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
  // page.data = await getAllComments(page.page_identifier, page.comment_count)
  // console.log(pages[1].data)
  // console.log(pages);

  // console.log(
  //   Object.entries(
  //     count_duplicates(
  //       pages[0].comments.filter((comment) => comment.wall_of_faith === "yes")
  //     )
  //   ).sort(compareTopCommenters).pop()
  // );
};

const compareTopCommenters = (a, b) => {
  if (a[1] < b[1]) {
    return -1;
  } else if (a[1] > a[1]) {
    return 1;
  } else {
    return 0;
  }
};

const count_duplicates = (comments) => {
  console.log('Checking for Duplicates')
  const counter = {};
  const manifest = {}
  comments.forEach((comment) => {
    var name = comment.name
    var email = comment.email
    manifest[name] = email
    var key = comment.email;
    counter[key] = (counter[key] ? counter[key] : 0) + 1;
    // counter[key2] = key2
    // console.log(counter);
  });
  // console.log(manifest)
  return [counter, manifest];
};

const getHonourRoll = (commentsArray) => {
  console.log("Getting Honour Roll")
  // console.log(pagesArray)
  // let validComments = commentsArray
  let validComments = commentsArray.filter(comment => comment.wall_of_faith === 'yes')
  validComments = count_duplicates([...validComments])
  const TopCommenters = Object.entries(validComments[0]).sort(compareTopCommenters)
  return [TopCommenters.reverse(), Object.entries(validComments[1])]
}


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
  let pages = await getPages().then(async (pagesData) => {
    await populatePages(pagesData)
    // console.log(pagesData)
    return pagesData
  }).catch(err => console.log(err));

  // console.log(pages)
const HonorRoll = getHonourRoll(getAllCommentsData(pages))
//  console.log(HonorRoll)

 toCSV(HonorRoll[0], '90DC-HonorRoll.csv')
 toCSV(HonorRoll[1], '90DC-NameList.csv')

  // console.log(pages)
  // getHonourRoll(pages)
  // getTopCommenters(getAllCommentsData(pages))
  // const allComments = await getAllComments("day-1", 500)
  // console.log(allComments)
};

main();

// numDaysBetween(DAY1, DAY1)
