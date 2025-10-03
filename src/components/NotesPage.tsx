import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { ContentInputOptions } from './ContentInputOptions';
import { hybridSyncService } from '../services/hybridSync';
import { 
  Sparkles, 
  Bold, 
  Italic, 
  Highlighter, 
  Save,
  FileText,
  ArrowRight,
  Eye,
  Keyboard,
  ChevronDown,
  ChevronUp,
  Plus,
  List,
  X,
  Trash2,
  Grid3X3,
  BookOpen,
  Clock,
  Target
} from 'lucide-react';
import { Screen } from '../utils/constants';
import { mockNotes, getSubjectColor as getSubjectColorFromConstants } from '../utils/studyConstants';

interface NotesPageProps {
  onNavigate: (screen: Screen) => void;
}

interface Note {
  id: number;
  title: string;
  content: string;
  subject: string;
  tags: string[];
  lastModified: string;
  wordCount: number;
}

export function NotesPage({ onNavigate }: NotesPageProps) {
  const [viewMode, setViewMode] = useState<'list' | 'edit' | 'create'>('list');
  const [notes, setNotes] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showContentOptions, setShowContentOptions] = useState(true);
  const [showManualInput, setShowManualInput] = useState(false);
  const [currentNoteId, setCurrentNoteId] = useState<number | null>(null);


  // Wait for hybridSyncService to be ready before loading notes from localStorage
  const [savedNotes, setSavedNotes] = useState<Note[]>([]);
  const [notesReady, setNotesReady] = useState(false);

  useEffect(() => {
    hybridSyncService.onReady(() => {
      try {
        const storedNotes = localStorage.getItem('studyflow-notes');
        setSavedNotes(storedNotes ? JSON.parse(storedNotes) : mockNotes);
      } catch (error) {
        console.error('Error loading notes from localStorage:', error);
        setSavedNotes(mockNotes);
      }
      setNotesReady(true);
    });
  }, []);


  // Save notes using hybrid sync (localStorage + database)
  useEffect(() => {
    if (notesReady) {
      hybridSyncService.saveData('studyflow-notes', savedNotes);
    }
  }, [savedNotes, notesReady]);

  const handleSummarize = () => {
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 2000);
  };

  const handleContentSelect = async (type: 'youtube' | 'file', content: any) => {
    console.log('Content selected:', type, content);
    setShowContentOptions(false);
    setShowManualInput(true);
    setIsProcessing(true);
    
    if (type === 'youtube') {
      try {
        setNoteTitle(`Notes from: ${content.url}`);
        setNotes('🤖 AI is analyzing the YouTube video and generating study notes...\n\nPlease wait...');

        // Extract video ID from URL
        const videoId = extractVideoId(content.url);
        if (!videoId) {
          throw new Error('Invalid YouTube URL');
        }

        // Get video info using YouTube API
        const videoInfo = await getYouTubeVideoInfo(content.url);
        
        // Use AI to generate notes from video description
        const { generateContent } = await import('../services/ai');
        
        const aiResponse = await generateContent({
          sourceType: 'youtube',
          content: `Title: ${videoInfo.title}\nDescription: ${videoInfo.description}\nURL: ${content.url}`,
          contentType: 'notes',
          additionalContext: 'Create comprehensive study notes with clear headings and structure'
        });

        const aiNotes = aiResponse.notes || 'Failed to generate notes from video content.';

        setNoteTitle(`Study Notes: ${videoInfo.title}`);
        setNotes(aiNotes);
        
      } catch (error) {
        console.error('Error processing YouTube video:', error);
        setNotes(`❌ Error processing YouTube video: ${content.url}\n\nPlease check the URL and try again, or add notes manually.`);
      }
    } else if (type === 'file') {
      const fileNames = content.files.map((file: File) => file.name).join(', ');
      setNoteTitle(`Notes from: ${fileNames}`);
      setNotes(`📄 Processing uploaded files: ${fileNames}\n\nFile processing will be implemented soon. For now, you can add notes manually.`);
    }
    
    setIsProcessing(false);
  };

  // Helper function to extract video ID from YouTube URL
  const extractVideoId = (url: string): string | null => {
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
  };

  // YouTube API function
  const getYouTubeVideoInfo = async (url: string) => {
    const videoId = extractVideoId(url);
    if (!videoId) throw new Error('Invalid YouTube URL');

    try {
      console.log('Fetching YouTube video info for ID:', videoId);
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`;
      console.log('YouTube API URL:', apiUrl);
      
      const response = await fetch(apiUrl);
      console.log('YouTube API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('YouTube API error response:', errorText);
        throw new Error(`YouTube API request failed: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('YouTube API response data:', data);
      const video = data.items?.[0];
      
      if (!video) throw new Error('Video not found or may be private/restricted');

      return {
        title: video.snippet?.title ?? 'Untitled',
        description: video.snippet?.description ?? 'No description available',
        videoId
      };
    } catch (error) {
      console.error('YouTube API error:', error);
      throw error;
    }
  };

  const saveNote = () => {
    if (!noteTitle.trim() || !notes.trim()) return;
    
    const newNote: Note = {
      id: currentNoteId || Date.now(),
      title: noteTitle,
      content: notes,
      subject: 'General', // Could be detected or selected
      tags: [], // Could be auto-generated
      lastModified: 'Just now',
      wordCount: notes.split(' ').length
    };

    if (currentNoteId) {
      // Update existing note
      setSavedNotes(savedNotes.map(note => 
        note.id === currentNoteId ? newNote : note
      ));
    } else {
      // Add new note
      setSavedNotes([newNote, ...savedNotes]);
    }

    // Reset form and return to list view
    setNoteTitle('');
    setNotes('');
    setCurrentNoteId(null);
    setShowContentOptions(true);
    setShowManualInput(false);
    setViewMode('list');
  };

  const editNote = (note: Note) => {
    setCurrentNoteId(note.id);
    setNoteTitle(note.title);
    setNotes(note.content);
    setShowContentOptions(false);
    setShowManualInput(true);
    setViewMode('edit');
  };

  const deleteNote = (id: number) => {
    setSavedNotes(savedNotes.filter(note => note.id !== id));
  };

  const formatText = (format: 'bold' | 'italic' | 'highlight') => {
    console.log('Formatting text:', format);
    // In a real implementation, you'd apply formatting to selected text
  };

  const getSubjectColor = getSubjectColorFromConstants;

  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <div className="p-8 space-y-8 bg-background min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl text-foreground font-semibold">
              {viewMode === 'edit' ? 'Edit Note' : 'Create New Note'}
            </h1>
            <p className="text-muted-foreground">
              {viewMode === 'edit' ? 'Update your note content' : 'Create notes from content or manually'}
            </p>
          </div>
          <Button 
            onClick={() => setViewMode('list')}
            variant="outline"
            className="rounded-xl clay-input"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Content Input Options (only for create mode) */}
          {viewMode === 'create' && showContentOptions && (
            <Card className="p-6 clay-card border-0">
              <ContentInputOptions 
                onContentSelect={handleContentSelect}
                acceptedTypes={['.pdf', '.docx', '.txt', '.pptx', '.md']}
              />
              
              <div className="mt-6 pt-6 border-t border-border">
                <Button
                  onClick={() => {
                    setShowContentOptions(false);
                    setShowManualInput(true);
                  }}
                  variant="outline"
                  className="w-full rounded-xl clay-input"
                >
                  <Keyboard className="w-4 h-4 mr-2" />
                  Or type/paste notes manually
                </Button>
              </div>
            </Card>
          )}

          {/* Manual Note Input */}
          {(showManualInput || !showContentOptions || viewMode === 'edit') && (
            <>
              {/* Note Title */}
              <Card className="p-6 clay-card border-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-foreground">Note Title</label>
                    {viewMode === 'create' && !showContentOptions && (
                      <Button
                        onClick={() => {
                          setShowContentOptions(true);
                          setShowManualInput(false);
                          setNoteTitle('');
                          setNotes('');
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Back to content options
                      </Button>
                    )}
                  </div>
                  <Input
                    placeholder="Enter note title..."
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="clay-input border-0"
                  />
                </div>
              </Card>

              {/* Note Editor */}
              <Card className="p-6 clay-card border-0">
                <div className="space-y-4">
                  <h3 className="text-foreground">Note Editor</h3>
                  
                  {/* Toolbar */}
                  <div className="flex items-center space-x-2 border-b border-border pb-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => formatText('bold')}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Bold className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => formatText('italic')}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Italic className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => formatText('highlight')}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Highlighter className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Text Area */}
                  <Textarea
                    placeholder="Paste or type your notes here... 

For example:
• Cell membrane structure and function
• Mitochondria - powerhouse of the cell
• Nucleus contains genetic material
• Ribosomes synthesize proteins"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-80 text-base clay-input border-0 resize-none"
                  />
                </div>
              </Card>
            </>
          )}

          {/* Action Buttons */}
          {(showManualInput || !showContentOptions || viewMode === 'edit') && (
            <div className="flex items-center justify-between">
              <Button 
                onClick={handleSummarize}
                disabled={!notes.trim() || isProcessing}
                variant="outline"
                className="rounded-xl clay-input"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isProcessing ? 'Processing...' : 'Summarize Notes'}
              </Button>
              
              <Button
                onClick={saveNote}
                disabled={!noteTitle.trim() || !notes.trim()}
                className="clay-button bg-gradient-to-r from-primary to-primary-hover text-primary-foreground rounded-xl border-0"
              >
                <Save className="w-4 h-4 mr-2" />
                {viewMode === 'edit' ? 'Update Note' : 'Save Note'}
              </Button>
            </div>
          )}

          {/* Processing Animation */}
          {isProcessing && (showManualInput || !showContentOptions || viewMode === 'edit') && (
            <Card className="p-6 clay-card border-0">
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
                <p className="text-primary">AI is processing your notes...</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="p-8 space-y-8 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl text-foreground">Notes</h1>
          <p className="text-muted-foreground">
            Organize and manage your study notes • {savedNotes.length} notes saved
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            onClick={() => setViewMode('create')}
            className="clay-button bg-gradient-to-r from-primary to-primary-hover text-primary-foreground rounded-xl border-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Note
          </Button>
        </div>
      </div>

      {/* Subject Filter */}
      <div className="flex items-center space-x-3">
        <span className="text-muted-foreground">Filter by subject:</span>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">
            All ({savedNotes.length})
          </Badge>
          {Array.from(new Set(savedNotes.map(note => note.subject))).map((subject) => (
            <Badge 
              key={subject}
              className={`cursor-pointer hover:opacity-80 ${getSubjectColor(subject)}`}
            >
              {subject} ({savedNotes.filter(note => note.subject === subject).length})
            </Badge>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedNotes.map((note) => (
          <Card 
            key={note.id}
            className="p-6 clay-card border-0 hover:clay-elevated transition-all duration-200 cursor-pointer group"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Badge className={getSubjectColor(note.subject)} variant="secondary">
                    {note.subject}
                  </Badge>
                  <h3 className="text-foreground mt-2 group-hover:text-primary transition-colors">{note.title}</h3>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      editNote(note);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="min-h-24">
                <p className="text-muted-foreground text-sm line-clamp-3">{note.content}</p>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-3 h-3" />
                  <span>{note.lastModified}</span>
                </div>
                <span>{note.wordCount} words</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Notes Stats */}
      <Card className="p-6 clay-card border-0">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl text-foreground">{savedNotes.length}</p>
            <p className="text-muted-foreground text-sm">Total Notes</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
              <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-2xl text-foreground">{Array.from(new Set(savedNotes.map(note => note.subject))).length}</p>
            <p className="text-muted-foreground text-sm">Subjects</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Target className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
            <p className="text-2xl text-foreground">{savedNotes.reduce((total, note) => total + note.wordCount, 0)}</p>
            <p className="text-muted-foreground text-sm">Total Words</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-2xl text-foreground">Daily</p>
            <p className="text-muted-foreground text-sm">Study Habit</p>
          </div>
        </div>
      </Card>
    </div>
  );
}