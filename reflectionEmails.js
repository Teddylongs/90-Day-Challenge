const fetch = require('node-fetch')
const ObjectsToCsv = require('objects-to-csv');

let emails = []


function count_duplicate(a){
  let counts = {}
 
  for(let i =0; i < a.length; i++){ 
      if (counts[a[i]]){
      counts[a[i]] += 1
      } else {
      counts[a[i]] = 1
      }
     }  
     for (let prop in counts){
         if (counts[prop] >= 2){
            //  console.log(prop + " counted: " + counts[prop] + " times.")
         }
     }
   console.log(counts)
 }
 

 //COUNT NUMBER OF RESPONSES/REFLECTIONS PER EMAILS
const count_responses = (email_list) => {
  let checkedEmails = []
  let emailCount = []
  for (let i = 0; i < email_list.length; i++){
    let email = email_list[i]
    if (!checkedEmails.includes(email)){
      checkedEmails = [...checkedEmails, email]
      emailCount[checkedEmails.indexOf(email)] = {
        email,
        responses: 1
      }
    } else {
      emailCount[checkedEmails.indexOf(email)].responses += 1
    }

  }

  console.log(emailCount)
}

const getEmails = async () => {
  await fetch(
    "https://talk.hyvor.com/api/v1/comments?website_id=2837&api_key=f8990b031438a0e374da7e2b6ec1945eab4e14699c96361fc95cbffcf4a5&type=comments&limit=250&offset=250&page_identifier=day-1"
  ).then(
      (res) => res.json()
  ).then(res => {
      emails = res.data.map(user => {
          return {email: user.user.email, unix_timestamp: user.created_at, date_created: Date(user.created_at * 1000), comment: user.markdown} 
      })
      return [emails, emails.map(email => {
        return email.email
      })];
  }).then(emails => {

    const toCSV = (async () => {
        // console.log(emails[0].sort())
        const csv = new ObjectsToCsv(emails);
        console.log(emails[1])
        count_responses(emails[1])
        // console.log(emails[1].sort())
        // Save to file:
        await csv.toDisk('./day-1_2.csv', {allColumns: false});
       
        // Return the CSV file as string:
        // console.log(await csv.toString());
      });
    
    toCSV();
  })
};

getEmails()