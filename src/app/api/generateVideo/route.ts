// import { NextResponse } from "next/server";
// import OpenAI from "openai";

// // Initialize the OpenAI client
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY!,
// });

// export async function POST(request: Request) {
//   try {
//     const { prompt } = await request.json();

//     if (!prompt) {
//       return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
//     }

//     // Assuming OpenAI provides a `videos.generate` endpoint for Sora AI
//     const response = await openai.videos.generate({
//       model: "sora", // Replace with the correct model name if different
//       prompt: prompt,
//       n: 1, // Number of video variations
//       duration: "10s", // Adjust duration as needed
//       resolution: "1080p", // Adjust resolution if necessary
//     });

//     // Extract the video URL
//     const videoUrl = response.data[0]?.url;

//     if (!videoUrl) {
//       throw new Error("Failed to generate video");
//     }

//     return NextResponse.json({
//       videoUrl: videoUrl,
//       type: "video",
//       text: "Here is your AI-generated video from Sora AI.",
//     });
//   } catch (error: any) {
//     console.error("Error generating video:", error);
//     return NextResponse.json({ error: "Failed to generate video" }, { status: 500 });
//   }
// }
