import { NextRequest } from "next/server";
import { ContestStanding, addUser, contestInteraction, getRatings, getUsers } from "../codeforcequery";
 // defaults to force-static
export const revalidate = 60
export async function GET(req: NextRequest){
    const data = await getRatings();
    return Response.json(data)
}
