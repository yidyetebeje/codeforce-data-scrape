import crypto from "crypto"
import { MongoClient, ServerApiVersion } from "mongodb";
import { getNewRatings } from "./codeforceratingsystem";
import { group } from "console";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri,  {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    }
);
export const apiKey = "44cfcb065b39a1d98756b6d4335dacfb1274be38";
export const secret = "0ce71e2af1be124c5f1c5d45a3ebef42dcc24a92";
export async function getRatings(){
    const myDB = client.db("a2sv-education");
    const myColl = myDB.collection("student");
    // get sorted in decreasing order of rating and return only 50 element
    const users = await myColl.find({}).sort({rating: -1}).toArray();
    return users;

}
export async function codeForceUserInfo(username: string) {
    const response = await fetch(`https://codeforces.com/api/user.info?handles=${username}`, {
        'cache': 'no-store',
    })
    const data = await response.json()
    return data;
}
export async function CodeForceUserStatus(username: string) {
    const baseUrl = `https://codeforces.com/api/user.status?handle=${username}`;
    const timestamp = Math.round(new Date().getTime() / 1000);
    const start = 123456;
    const apiSign = `${start}/user.status?apiKey=${apiKey}&handle=${username}&time=${timestamp}#${secret}`;
    let hash = crypto.createHash('sha512').update(apiSign).digest('hex');
    const response = await fetch(`${baseUrl}&apiKey=${apiKey}&time=${timestamp}&apiSig=${start}${hash}`, {
        'cache': 'no-store',
    })
    const data = await response.json()
    return data;
}
export async function CodeForceUserRating(username: string) {
    const response = await fetch(`https://codeforces.com/api/user.rating?handle=${username}`, {
        'cache': 'no-store',
    })
    const data = await response.json()
    return data;
}
export async function ContestStanding(contestId: string) {
    const myDB = client.db("a2sv-education");
    const ratedCol = myDB.collection("rated-contest");
    const found = await ratedCol.find({id: parseInt(contestId)}).toArray();
    const ratedContest = found;
    if(ratedContest.length > 0){
        const ratingColl = myDB.collection("contest-rating");
        const foundRating = ratingColl.find({contestId: contestId});
        const contestRating = await foundRating.toArray();
        return {"alreadyexist": true, "message": "contest already exist",contestRating}
    }
    const from = 1;
    const count = 300;
    const showUnofficial = false;
    const base_url = `https://codeforces.com/api/contest.standings?contestId=${contestId}&from=${from}&count=${count}&showUnofficial=${showUnofficial}`;
    const timestamp = Math.round(new Date().getTime() / 1000);
    const start = 123456;
    const apiSign = `${start}/contest.standings?apiKey=${apiKey}&contestId=${contestId}&count=${count}&from=${from}&showUnofficial=${showUnofficial}&time=${timestamp}#${secret}`;
    const apiSig = crypto.createHash('sha512').update(apiSign).digest('hex');
    const url = `${base_url}&apiKey=${apiKey}&time=${timestamp}&apiSig=${start}${apiSig}`;
    const response = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
    });
    const data = await response.json();
    let contestInfo = data?.result?.contest;
    let problems = data?.result?.problems;
    problems = problems?.map((problem: any) => {
        return {
            id: problem.contestId + problem.index,
            name: problem.name,
            index: problem.index,
            points: problem.points,
            rating: problem.rating,
            tags: problem.tags,
        };
    });
    contestInfo = {
        ...contestInfo,
        problems
    }
    const rows = data?.result?.rows;
    const contestInteraction = rows.map((row: any)=> {
        return {
            contestId: contestInfo.id,
            contestName: contestInfo.name,
            cfhandle: row.party.members[0].handle,
            rank: row.rank,
            points: row.points,
            penalty: row.penalty,
            incontestSolved: row.problemResults.filter((result:any)=> result > 0).map((result: any, index: number)=> {
                return {
                    problemid: row.party.contestId + String.fromCharCode(65 + index),
                    rejectedAttemptCount: result.rejectedAttemptCount,
                    points: result.points,
                    bestTimeSubmission: result.bestTimeSubmission
                }
            }),
        }
    })
    const myColl = myDB.collection("student");
    const users = await myColl.find({}).toArray();
    let prevrating = users.map((user: any)=> {
        return {
            position: contestInteraction.findIndex((interaction: any)=> interaction.cfhandle === user["Codeforces*"]),
            user: user["Codeforces*"],
            previousRating: user.rating,
        }
    })
    prevrating = prevrating.filter((user: any)=> user.position !== -1);
    console.log(prevrating)
    let newrating = getNewRatings(prevrating);
    newrating = newrating.map((user: any)=> {
        return {
            ...user,
            contestId: contestId,
            contestName: contestInfo.name,
        }
    })
    // update the user table on mongodb with new rating
    for(let i = 0; i < newrating.length; i++){
        await myColl.updateOne({"Codeforces*": newrating[i].user}, {$set: {rating: newrating[i].newRating}})
    }
    const ratedColl = myDB.collection("rated-contest");
    await ratedColl.insertOne(contestInfo)
    const ratingColl = myDB.collection("contest-rating");
    await ratingColl.insertMany(newrating)
    return newrating 
    // return {contestInteraction};
}
export async function contestInteraction(contestId:string, n: number){
    const from = 1;
    const count = 600;
    const showUnofficial = true;
    const base_url = `https://codeforces.com/api/contest.standings?contestId=${contestId}&from=${from}&count=${count}&showUnofficial=${showUnofficial}`;
    const timestamp = Math.round(new Date().getTime() / 1000);
    const start = 123456;
    const apiSign = `${start}/contest.standings?apiKey=${apiKey}&contestId=${contestId}&count=${count}&from=${from}&showUnofficial=${showUnofficial}&time=${timestamp}#${secret}`;
    const apiSig = crypto.createHash('sha512').update(apiSign).digest('hex');
    const url = `${base_url}&apiKey=${apiKey}&time=${timestamp}&apiSig=${start}${apiSig}`;
    const response = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
    });
    const data = await response.json()
    let contestInfo = data?.result?.contest;
    let problems = data?.result?.problems;
    problems = problems?.map((problem: any) => {
        return {
            id: problem.contestId + problem.index,
            name: problem.name,
            index: problem.index,
            points: problem.points,
            rating: problem.rating,
            tags: problem.tags,
        };
    });
    contestInfo = {
        ...contestInfo,
        problems
    }
    const rows = data?.result?.rows;
    const filteredInConstest = rows.filter(row => row.party.participantType == 'CONTESTANT')
    const filteredInPractice = rows.filter(row => row.party.participantType == "PRACTICE").map(
        row => {
            return {
                handle: row.party.members[0].handle,
                upsolved: row.problemResults.filter(problem => problem.points > 0).length,
            }
        }
    )

    const myDB = client.db("a2sv-education");
    const myColl = myDB.collection("student");
    const users = await myColl.find({}).toArray();
    const contestInteraction = filteredInConstest.filter(row => users.find(user=> user["Codeforces*"] == row.party.members[0].handle) != undefined).map((row: any)=> {
        return {
            contestId: contestInfo.id,
            group:  users.find((user: any)=> user["Codeforces*"] == row.party.members[0].handle)?.group ?? '',
            contestName: contestInfo.name,
            cfhandle: row.party.members[0].handle,
            rank: row.rank,
            contest: n,
            points: row.points,
            penalty: row.penalty,
            totalQuestion: row.problemResults.length,
            incontestSolved: row.problemResults.filter((result:any)=> result.points > 0 ).map((result: any, index: number)=> {
                return {
                    problemid: row.party.contestId + String.fromCharCode(65 + index),
                    problemNo: index,
                    rejectedAttemptCount: result.rejectedAttemptCount,
                    points: result.points,
                    bestTimeSubmission: result.bestTimeSubmission
                }
            }),
            upsolved: filteredInPractice.find(r => r.handle == row.party.members[0].handle)?.upsolved ?? 0,
        }
    })
    // const ratingColl = myDB.collection("contest-interaction");
    // await ratingColl.insertMany(contestInteraction)
    return rows;
}


export async function addUser(){
    const url = "https://sheetdb.io/api/v1/dp5n0b3v5dpky"
    const response = await fetch(url)
    const data = await response.json()
    const filteredData = data.filter((user: any) => user.group == 51 || user.group == 52 || user.group == 53 || user.group == 54 || user.group == 55 || user.group == 56 || user.group == 57)
    let users = filteredData.map((user: any) => {
        return {
            ...user,
            rating: 1500,
        }
    })
    users = users.filter((user: any)=> user["Codeforces*"] !== "" || user["Full Name*"] !== "")
    const myDB = client.db("a2sv-education");
    const myColl = myDB.collection("student");
    await myColl.insertMany(users)
    return users;
}
export async function resetRating() {
    const myDB = client.db("a2sv-education");
    const myColl = myDB.collection("student");
    await myColl.updateMany({}, { $set: { rating: 1500 } });
    console.log("mycoll")
    return {
        success: "true"
    };
}
export async function getUsers(){
    const url = "https://sheetdb.io/api/v1/dp5n0b3v5dpky"
    const response = await fetch(url)
    const data = await response.json()
    let users = data.map((user: any) => {
        return {
            ...user,
            rating: 1500,
        }
    })
    users = users.filter((user: any)=> user["Codeforces*"] !== "" || user["Full Name*"] !== "")
    const myDB = client.db("a2sv-education");
    const myColl = myDB.collection("student");
    const students = await myColl.find({}).toArray();
    // update the group field for student

    for(let i = 0; i < students.length; i++){
        const found = users.find((user: any)=> user["Codeforces*"] === students[i]["Codeforces*"])
        if(found){
            await myColl.updateOne({"Codeforces*": students[i]["Codeforces*"]}, {$set: {group: found.group}})
        }
    }
    return users;
}
