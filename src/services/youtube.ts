import { google } from 'googleapis';

const youtube = google.youtube({
  version: 'v3',
  auth: import.meta.env.VITE_YOUTUBE_API_KEY || ''
});

if (!import.meta.env.VITE_YOUTUBE_API_KEY) {
  console.warn('YouTube API key not found in environment variables');
}

interface YouTubeVideoInfo {
  title: string;
  description: string;
  videoId: string;
  transcript?: string;
  thumbnailUrl?: string;
}

export async function getYouTubeVideoInfo(url: string): Promise<YouTubeVideoInfo> {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }

  try {
    const response = await youtube.videos.list({
      part: ['snippet'],
      id: [videoId]
    });

    const video = response.data.items?.[0];
    if (!video) {
      throw new Error('Video not found');
    }

    return {
      title: video.snippet?.title ?? 'Untitled',
      description: video.snippet?.description ?? '',
      videoId,
      thumbnailUrl: video.snippet?.thumbnails?.maxres?.url ?? 
                   video.snippet?.thumbnails?.high?.url ??
                   `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    };
  } catch (error) {
    console.error('Error fetching video info:', error);
    throw error;
  }
}

export async function getYouTubeTranscript(videoId: string): Promise<string> {
  // For now, we'll use a fallback approach since YouTube transcript API requires server-side implementation
  // We'll use the video description as content for AI processing
  try {
    const videoInfo = await getYouTubeVideoInfo(`https://www.youtube.com/watch?v=${videoId}`);
    
    // Return description as content for AI processing
    if (videoInfo.description && videoInfo.description.length > 50) {
      return `Video Title: ${videoInfo.title}\n\nDescription:\n${videoInfo.description}`;
    } else {
      // If description is too short, provide a helpful message
      return `Video Title: ${videoInfo.title}\n\nNote: This video has limited description content. For best AI analysis results, please try with videos that have detailed descriptions or consider using other content sources.`;
    }
  } catch (error) {
    console.error('Error fetching video transcript:', error);
    throw new Error('Unable to fetch video content. Please check the URL and try again.');
  }
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}
