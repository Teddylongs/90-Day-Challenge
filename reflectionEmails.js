const fetch = require('node-fetch')
const ObjectsToCsv = require('objects-to-csv');

let emails = []


const getEmails = async () => {
  await fetch(
    "https://talk.hyvor.com/api/v1/comments?website_id=2837&api_key=f8990b031438a0e374da7e2b6ec1945eab4e14699c96361fc95cbffcf4a5&type=comments&limit=250&offset=250&page_identifier=day-1"
  ).then(
      (res) => res.json()
  ).then(res => {
      emails = res.data.map(user => {
          return {email: user.user.email, unix_timestamp: user.created_at, date_created: Date(user.created_at * 1000), comment: user.markdown} 
      })
      return emails;
  }).then(emails => {

    const toCSV = (async () => {
        console.log(emails)
        const csv = new ObjectsToCsv(emails);
       
        // Save to file:
        await csv.toDisk('./day-1_2.csv', {allColumns: false});
       
        // Return the CSV file as string:
        console.log(await csv.toString());
      });
    
    toCSV();
  })
};

getEmails()