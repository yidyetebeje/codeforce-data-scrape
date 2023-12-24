import { revalidatePath } from "next/cache"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest){
    // extract id from query parameter
    revalidatePath(`/api`)
    return Response.json({success:"revalidated"})
}