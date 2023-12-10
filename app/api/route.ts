import { NextRequest } from "next/server";
import { ContestStanding, addUser, getRatings } from "../codeforcequery";
export const dynamic = 'force-dynamic' // defaults to force-static
export async function GET(req: NextRequest){
    const data = await getRatings()
    return Response.json(data)
}
