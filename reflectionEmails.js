const fetch = require("node-fetch");
const ObjectsToCsv = require("objects-to-csv");

const DAY1 = 1610928000

let emails = [];
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
const numDaysBetween = function(d1, d2) {
  // console.log('today', today)
  var diff = Math.abs(d1 - d2);
  // console.log('diff', diff)
  return Math.ceil(diff / (60 * 60 * 24));
};

//WORD COUNTER USING SPACE BREAKS
const wordCount = (text) => {
  var wordCount = 0;
  for (var i = 0; i <= text.length; i++) {
if (text.charAt(i) == ' ') {wordCount++;}
}
  if(wordCount >= 7 && wordCount <= 85){
   return "yes"
  }else {
    return "no"
  }
}

const getEmails = async (offset) => {
  await fetch(
    `https://talk.hyvor.com/api/v1/comments?website_id=2837&api_key=f8990b031438a0e374da7e2b6ec1945eab4e14699c96361fc95cbffcf4a5&type=comments&limit=250&offset=${offset}`
  )
    .then((res) => res.json())
    .then((res) => {
      emails = res.data.map((user) => {
        return {
          email: user.user.email ? user.user.email.toLowerCase() : "",
          day: numDaysBetween(DAY1, user.created_at),
          // unix_timestamp: user.created_at,
          // date_created: new Date(user.created_at * 1000),
          wallOfFaith: wordCount(user.markdown),
        };
      });
      return [
        emails,
        emails.map((email) => {
          return email.email ;
        }),
      ];
    })
    .then((emails) => {
      // console.log(emails[0]);
      const toCSV = async () => {
        const csv = new ObjectsToCsv(emails[0]);
        await csv.toDisk(`./90-day-challenge.csv`, { allColumns: false , append: true});

      };

      toCSV();
    });
};

//MILESTONES: 2250, 3250

let i = 0
while (i <=3500){
  try{
    getEmails(i)
    i +=  250
  } catch (e){
    console.log(e)
  }

}




// numDaysBetween(DAY1, DAY1)
