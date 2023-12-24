import { ContestStanding, contestInteraction, resetRating } from "@/app/codeforcequery"
import next from "next";
import { revalidatePath } from "next/cache";

import { NextRequest } from "next/server";


export async function GET(req: NextRequest){
    const data = await resetRating();

    revalidatePath(`/api/rate`)
    return Response.json(data)
}