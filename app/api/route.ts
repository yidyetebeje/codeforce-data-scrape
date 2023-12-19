import { NextRequest } from "next/server";
import { ContestStanding, addUser, contestInteraction, getRatings, getUsers } from "../codeforcequery";
export async function GET(req: NextRequest){
    const data = await getRatings();
    return Response.json(data)
}
