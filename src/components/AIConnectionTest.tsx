// AI Connection Test Component
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';

interface APITestResult {
  success: boolean;
  error?: string;
}

interface APIStatus {
  mistralAI: APITestResult;
  youtube: APITestResult;
}

export function AIConnectionTest() {
  const [status, setStatus] = useState<APIStatus | null>(null);
  const [testing, setTesting] = useState(false);

  const testAPIs = async () => {
    setTesting(true);
    setStatus(null);

    try {
      // Test Mistral AI API
      console.log('Testing Mistral AI API...');
      const apiKey = import.meta.env.VITE_MISTRAL_API_KEY;
      
      if (!apiKey || apiKey === 'demo_key_please_replace') {
        setStatus({
          mistralAI: { success: false, error: 'API key not configured' },
          youtube: { success: false, error: 'Skipped due to Mistral AI failure' }
        });
        setTesting(false);
        return;
      }

      let mistralAIResult: APITestResult = { success: false, error: 'Unknown error' };
      
      try {
        console.log('Testing OpenRouter API connection...');
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'StudyFlow'
          },
          body: JSON.stringify({
            model: 'mistralai/mistral-7b-instruct:free',
            messages: [{ role: 'user', content: 'Test connection - please respond with "API connection successful"' }],
            max_tokens: 50
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.choices?.[0]?.message?.content;
          
          if (text && text.length > 0) {
            mistralAIResult = { success: true };
            console.log('✅ Mistral AI API test successful:', text);
          } else {
            mistralAIResult = { success: false, error: 'Empty response from API' };
          }
        } else {
          const errorText = await response.text();
          mistralAIResult = { success: false, error: `HTTP ${response.status}: ${errorText}` };
        }
      } catch (error) {
        console.error('❌ Mistral AI API test failed:', error);
        mistralAIResult = { 
          success: false, 
          error: error instanceof Error ? error.message : 'Connection failed' 
        };
      }

      // Test YouTube API
      let youtubeResult: APITestResult = { success: false, error: 'Unknown error' };
      const youtubeApiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      
      if (!youtubeApiKey || youtubeApiKey === 'demo_key_please_replace') {
        youtubeResult = { success: false, error: 'YouTube API key not configured' };
      } else {
        try {
          console.log('Testing YouTube API...');
          const testUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=dQw4w9WgXcQ&key=${youtubeApiKey}`;
          const response = await fetch(testUrl);
          
          if (response.ok) {
            const data = await response.json();
            if (data.items && data.items.length > 0) {
              youtubeResult = { success: true };
              console.log('✅ YouTube API test successful');
            } else {
              youtubeResult = { success: false, error: 'No data returned from YouTube API' };
            }
          } else {
            const errorText = await response.text();
            youtubeResult = { success: false, error: `HTTP ${response.status}: ${errorText}` };
            console.error('❌ YouTube API test failed:', errorText);
          }
        } catch (error) {
          console.error('❌ YouTube API test failed:', error);
          youtubeResult = { 
            success: false, 
            error: error instanceof Error ? error.message : 'Network error' 
          };
        }
      }

      setStatus({
        mistralAI: mistralAIResult,
        youtube: youtubeResult
      });

    } catch (error) {
      console.error('❌ API testing failed:', error);
      setStatus({
        mistralAI: { success: false, error: 'Failed to connect to Mistral AI' },
        youtube: { success: false, error: 'Test skipped due to previous failure' }
      });
    } finally {
      setTesting(false);
    }
  };

  // Auto-test on component mount
  useEffect(() => {
    testAPIs();
  }, []);

  const getStatusIcon = (success: boolean) => {
    if (testing) return <Loader2 className="w-4 h-4 animate-spin" />;
    return success ? 
      <CheckCircle className="w-4 h-4 text-green-500" /> : 
      <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusBadge = (success: boolean, error?: string) => {
    if (testing) {
      return <Badge variant="secondary">Testing...</Badge>;
    }
    return success ? 
      <Badge className="bg-green-100 text-green-800">Connected</Badge> : 
      <Badge variant="destructive">Failed</Badge>;
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">AI Service Status</h3>
        <Button 
          onClick={testAPIs} 
          disabled={testing}
          variant="outline"
          size="sm"
        >
          {testing ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          {testing ? 'Testing...' : 'Retest'}
        </Button>
      </div>

      <div className="space-y-3">
        {/* OpenRouter AI Status */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center space-x-3">
            {getStatusIcon(status?.mistralAI?.success || false)}
            <div>
              <p className="font-medium">OpenRouter AI (Mistral)</p>
              <p className="text-sm text-muted-foreground">
                {status?.mistralAI?.error || 'Core AI functionality for chat and content generation'}
              </p>
            </div>
          </div>
          {status && getStatusBadge(status.mistralAI.success, status.mistralAI.error)}
        </div>

        {/* YouTube API Status */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center space-x-3">
            {getStatusIcon(status?.youtube?.success || false)}
            <div>
              <p className="font-medium">YouTube Data API</p>
              <p className="text-sm text-muted-foreground">
                {status?.youtube?.error || 'Video metadata and information retrieval'}
              </p>
            </div>
          </div>
          {status && getStatusBadge(status.youtube.success, status.youtube.error)}
        </div>
      </div>

      {/* Environment Check */}
      <div className="pt-4 border-t">
        <h4 className="font-medium mb-2">Environment Variables</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              import.meta.env.VITE_MISTRAL_API_KEY ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span>VITE_MISTRAL_API_KEY</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              import.meta.env.VITE_YOUTUBE_API_KEY ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span>VITE_YOUTUBE_API_KEY</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              import.meta.env.VITE_SUPABASE_URL ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span>VITE_SUPABASE_URL</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              import.meta.env.VITE_SUPABASE_ANON_KEY ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span>VITE_SUPABASE_ANON_KEY</span>
          </div>
        </div>
      </div>
    </Card>
  );
}