import { ContestStanding, addUser, getRatings } from "../codeforcequery";

export async function GET(req: Request){
    const data = await getRatings()
    return Response.json(data)
}
