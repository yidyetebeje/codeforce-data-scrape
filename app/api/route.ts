import { NextRequest } from "next/server";
import { ContestStanding, addUser, getRatings } from "../codeforcequery";

export async function GET(req: NextRequest){
    const data = await getRatings()
    return Response.json(data)
}
