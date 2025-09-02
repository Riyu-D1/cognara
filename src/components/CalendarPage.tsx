import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { useSettings } from './SettingsContext';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Target,
  BookOpen,
  Coffee,
  CheckCircle,
  X,
  Edit,
  Trash2,
  Timer,
  TrendingUp,
  Award,
  Filter,
  List,
  Grid3X3
} from 'lucide-react';
import { Screen } from '../utils/constants';

interface CalendarPageProps {
  onNavigate: (screen: Screen) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: 'study' | 'exam' | 'assignment' | 'break' | 'other';
  subject: string;
  isCompleted: boolean;
}

interface PomodoroSession {
  id: string;
  type: 'work' | 'short-break' | 'long-break';
  duration: number; // in minutes
  completedAt: Date;
}

export function CalendarPage({ onNavigate }: CalendarPageProps) {
  const settings = useSettings();
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'pomodoro'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  
  // Pomodoro Timer State
  const [pomodoroState, setPomodoroState] = useState<'idle' | 'running' | 'paused'>('idle');
  const [currentTimer, setCurrentTimer] = useState<'work' | 'short-break' | 'long-break'>('work');
  const [timeLeft, setTimeLeft] = useState(settings.pomodoroLength * 60);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  // Event Form State
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    startTime: '09:00',
    endTime: '10:00',
    type: 'study' as CalendarEvent['type'],
    subject: ''
  });

  // Mock events data
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Biology Study Session',
      description: 'Chapter 12 - Cell Structure',
      date: new Date(),
      startTime: '09:00',
      endTime: '11:00',
      type: 'study',
      subject: 'Biology',
      isCompleted: false
    },
    {
      id: '2',
      title: 'Math Exam',
      description: 'Calculus midterm exam',
      date: new Date(Date.now() + 86400000), // Tomorrow
      startTime: '14:00',
      endTime: '16:00',
      type: 'exam',
      subject: 'Math',
      isCompleted: false
    },
    {
      id: '3',
      title: 'Chemistry Assignment Due',
      description: 'Lab report submission',
      date: new Date(Date.now() + 172800000), // Day after tomorrow
      startTime: '23:59',
      endTime: '23:59',
      type: 'assignment',
      subject: 'Chemistry',
      isCompleted: false
    }
  ]);

  // Pomodoro Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (pomodoroState === 'running' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [pomodoroState, timeLeft]);

  const handleTimerComplete = () => {
    setPomodoroState('idle');
    
    if (currentTimer === 'work') {
      const newSessionCount = sessionsCompleted + 1;
      setSessionsCompleted(newSessionCount);
      
      // Determine next timer type
      const nextTimer = newSessionCount % 4 === 0 
        ? 'long-break' 
        : 'short-break';
      
      setCurrentTimer(nextTimer);
      setTimeLeft(nextTimer === 'long-break' 
        ? settings.longBreakLength * 60 
        : settings.shortBreakLength * 60
      );
    } else {
      setCurrentTimer('work');
      setTimeLeft(settings.pomodoroLength * 60);
    }
    
    // Play notification sound (in real app)
    console.log('Timer completed!');
  };

  const startTimer = () => {
    setPomodoroState('running');
  };

  const pauseTimer = () => {
    setPomodoroState('paused');
  };

  const resetTimer = () => {
    setPomodoroState('idle');
    setCurrentTimer('work');
    setTimeLeft(settings.pomodoroLength * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'study': return 'bg-primary/10 dark:bg-primary/20 text-primary border-primary/20';
      case 'exam': return 'bg-destructive/10 dark:bg-destructive/20 text-destructive border-destructive/20';
      case 'assignment': return 'bg-accent-cyan/10 dark:bg-accent-cyan/20 text-accent-cyan border-accent-cyan/20';
      case 'break': return 'bg-accent/10 dark:bg-accent/20 text-accent border-accent/20';
      default: return 'bg-muted/50 text-muted-foreground border-border';
    }
  };

  const addEvent = () => {
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: eventForm.title,
      description: eventForm.description,
      date: selectedDate,
      startTime: eventForm.startTime,
      endTime: eventForm.endTime,
      type: eventForm.type,
      subject: eventForm.subject,
      isCompleted: false
    };

    if (editingEvent) {
      setEvents(events.map(event => 
        event.id === editingEvent.id ? { ...newEvent, id: editingEvent.id } : event
      ));
      setEditingEvent(null);
    } else {
      setEvents([...events, newEvent]);
    }

    setShowEventModal(false);
    setEventForm({
      title: '',
      description: '',
      startTime: '09:00',
      endTime: '10:00',
      type: 'study',
      subject: ''
    });
  };

  const editEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description,
      startTime: event.startTime,
      endTime: event.endTime,
      type: event.type,
      subject: event.subject
    });
    setSelectedDate(event.date);
    setShowEventModal(true);
  };

  const deleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
  };

  const toggleEventComplete = (eventId: string) => {
    setEvents(events.map(event => 
      event.id === eventId ? { ...event, isCompleted: !event.isCompleted } : event
    ));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + (direction === 'next' ? 1 : -1), 1));
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  if (viewMode === 'pomodoro') {
    return (
      <div className="p-8 space-y-8 bg-background min-h-screen">
        {/* Header */}
        <div className="clay-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-destructive rounded-xl flex items-center justify-center clay-button clay-glow-primary">
                <Timer className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-foreground">Pomodoro Timer</h1>
                <p className="text-muted-foreground">Focus on your studies with time-blocking technique</p>
              </div>
            </div>
            <Button 
              onClick={() => setViewMode('month')}
              variant="outline"
              className="clay-button rounded-xl"
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Back to Calendar
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Timer Display */}
          <div className="clay-card p-8">
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    currentTimer === 'work' ? 'bg-destructive' : 
                    currentTimer === 'short-break' ? 'bg-accent' : 'bg-primary'
                  }`}></div>
                  <span className="text-muted-foreground capitalize">
                    {currentTimer === 'work' ? 'Focus Time' : 
                     currentTimer === 'short-break' ? 'Short Break' : 'Long Break'}
                  </span>
                </div>
                <h2 className="text-6xl font-bold text-foreground">{formatTime(timeLeft)}</h2>
              </div>

              {/* Progress Circle */}
              <div className="relative w-48 h-48 mx-auto">
                <div className="absolute inset-0 rounded-full border-8 border-muted"></div>
                <div 
                  className={`absolute inset-0 rounded-full border-8 border-t-transparent transition-all duration-1000 ${
                    currentTimer === 'work' ? 'border-destructive' : 
                    currentTimer === 'short-break' ? 'border-accent' : 'border-primary'
                  }`}
                  style={{
                    transform: `rotate(${
                      ((currentTimer === 'work' ? settings.pomodoroLength * 60 : 
                        currentTimer === 'short-break' ? settings.shortBreakLength * 60 : 
                        settings.longBreakLength * 60) - timeLeft) / 
                      (currentTimer === 'work' ? settings.pomodoroLength * 60 : 
                       currentTimer === 'short-break' ? settings.shortBreakLength * 60 : 
                       settings.longBreakLength * 60) * 360
                    }deg)`
                  }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm">Session</p>
                    <p className="text-2xl font-semibold text-foreground">{sessionsCompleted}</p>
                  </div>
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex items-center justify-center space-x-4">
                {pomodoroState === 'idle' || pomodoroState === 'paused' ? (
                  <Button
                    onClick={startTimer}
                    className="clay-button text-white rounded-xl px-8"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    {pomodoroState === 'paused' ? 'Resume' : 'Start'}
                  </Button>
                ) : (
                  <Button
                    onClick={pauseTimer}
                    className="bg-accent-cyan hover:bg-accent-cyan/90 text-white rounded-xl px-8 clay-button"
                  >
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </Button>
                )}
                
                <Button
                  onClick={resetTimer}
                  variant="outline"
                  className="clay-button rounded-xl px-8"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {/* Session Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="clay-card p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-destructive/10 dark:bg-destructive/20 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{sessionsCompleted}</p>
                  <p className="text-muted-foreground text-sm">Sessions Today</p>
                </div>
              </div>
            </div>

            <div className="clay-card p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{Math.round(sessionsCompleted * settings.pomodoroLength / 60)}h</p>
                  <p className="text-muted-foreground text-sm">Study Time</p>
                </div>
              </div>
            </div>

            <div className="clay-card p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-accent/10 dark:bg-accent/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">7</p>
                  <p className="text-muted-foreground text-sm">Day Streak</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timer Settings */}
          <div className="clay-card p-6">
            <h3 className="text-foreground mb-4 flex items-center font-semibold">
              <Settings className="w-5 h-5 mr-2" />
              Timer Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-muted-foreground text-sm font-medium">Work Duration (min)</label>
                <Input
                  type="number"
                  value={settings.pomodoroLength}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 25;
                    settings.updateSettings({ pomodoroLength: value });
                    if (currentTimer === 'work' && pomodoroState === 'idle') {
                      setTimeLeft(value * 60);
                    }
                  }}
                  className="mt-1 clay-input"
                />
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">Short Break (min)</label>
                <Input
                  type="number"
                  value={settings.shortBreakLength}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 5;
                    settings.updateSettings({ shortBreakLength: value });
                    if (currentTimer === 'short-break' && pomodoroState === 'idle') {
                      setTimeLeft(value * 60);
                    }
                  }}
                  className="mt-1 clay-input"
                />
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">Long Break (min)</label>
                <Input
                  type="number"
                  value={settings.longBreakLength}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 15;
                    settings.updateSettings({ longBreakLength: value });
                    if (currentTimer === 'long-break' && pomodoroState === 'idle') {
                      setTimeLeft(value * 60);
                    }
                  }}
                  className="mt-1 clay-input"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-background min-h-screen">
      {/* Header */}
      <div className="clay-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center clay-button clay-glow-primary">
              <CalendarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-foreground">Calendar</h1>
              <p className="text-muted-foreground">Organize your study schedule and track productivity</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              onClick={() => setViewMode('pomodoro')}
              className="bg-destructive hover:bg-destructive/90 text-white rounded-xl clay-button"
            >
              <Timer className="w-4 h-4 mr-2" />
              Pomodoro Timer
            </Button>
            
            <Button 
              onClick={() => {
                setSelectedDate(new Date());
                setShowEventModal(true);
              }}
              className="clay-button text-white rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="flex items-center space-x-2">
        <Button
          onClick={() => setViewMode('month')}
          variant={viewMode === 'month' ? 'default' : 'outline'}
          className="clay-button rounded-xl"
        >
          <Grid3X3 className="w-4 h-4 mr-2" />
          Month
        </Button>
        <Button
          onClick={() => setViewMode('week')}
          variant={viewMode === 'week' ? 'default' : 'outline'}
          className="clay-button rounded-xl"
        >
          <List className="w-4 h-4 mr-2" />
          Week
        </Button>
        <Button
          onClick={() => setViewMode('day')}
          variant={viewMode === 'day' ? 'default' : 'outline'}
          className="clay-button rounded-xl"
        >
          <CalendarIcon className="w-4 h-4 mr-2" />
          Day
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Calendar View */}
        <div className="lg:col-span-3">
          <div className="clay-card p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-foreground">
                {viewMode === 'month' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                {viewMode === 'week' && `Week of ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                {viewMode === 'day' && currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => {
                    if (viewMode === 'month') navigateMonth('prev');
                    else if (viewMode === 'week') navigateWeek('prev');
                    else navigateDay('prev');
                  }}
                  variant="ghost"
                  size="sm"
                  className="rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => setCurrentDate(new Date())}
                  variant="outline"
                  size="sm"
                  className="clay-button rounded-lg"
                >
                  Today
                </Button>
                <Button
                  onClick={() => {
                    if (viewMode === 'month') navigateMonth('next');
                    else if (viewMode === 'week') navigateWeek('next');
                    else navigateDay('next');
                  }}
                  variant="ghost"
                  size="sm"
                  className="rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Month View */}
            {viewMode === 'month' && (
              <div>
                {/* Days of Week Header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-muted-foreground text-sm font-medium">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: getFirstDayOfMonth(currentDate) }, (_, i) => (
                    <div key={`empty-${i}`} className="h-24 p-1"></div>
                  ))}
                  
                  {Array.from({ length: getDaysInMonth(currentDate) }, (_, i) => {
                    const day = i + 1;
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const dayEvents = getEventsForDate(date);
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isSelected = date.toDateString() === selectedDate.toDateString();
                    
                    return (
                      <div
                        key={day}
                        onClick={() => setSelectedDate(date)}
                        className={`h-24 p-1 cursor-pointer rounded-lg transition-colors ${
                          isToday ? 'bg-primary/10 dark:bg-primary/20 border-2 border-primary/30' : 
                          isSelected ? 'bg-accent/10 dark:bg-accent/20 border-2 border-accent/30' : 
                          'hover:bg-muted/50'
                        }`}
                      >
                        <div className="h-full flex flex-col">
                          <span className={`text-sm font-medium ${isToday ? 'text-primary' : 'text-foreground'}`}>
                            {day}
                          </span>
                          <div className="flex-1 space-y-1 overflow-hidden">
                            {dayEvents.slice(0, 2).map(event => (
                              <div
                                key={event.id}
                                className={`text-xs p-1 rounded border truncate ${getEventTypeColor(event.type)}`}
                              >
                                {event.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-muted-foreground">
                                +{dayEvents.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Week View */}
            {viewMode === 'week' && (
              <div className="space-y-4">
                {Array.from({ length: 7 }, (_, i) => {
                  const date = new Date(currentDate);
                  date.setDate(currentDate.getDate() - currentDate.getDay() + i);
                  const dayEvents = getEventsForDate(date);
                  const isToday = date.toDateString() === new Date().toDateString();
                  
                  return (
                    <div key={i} className={`p-4 rounded-xl border clay-input ${isToday ? 'bg-primary/5 dark:bg-primary/10 border-primary/20' : ''}`}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className={`text-lg font-semibold ${isToday ? 'text-primary' : 'text-foreground'}`}>
                          {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </h3>
                        <Button
                          onClick={() => {
                            setSelectedDate(date);
                            setShowEventModal(true);
                          }}
                          variant="ghost"
                          size="sm"
                          className="rounded-lg text-muted-foreground hover:text-foreground"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {dayEvents.map(event => (
                          <div key={event.id} className={`p-3 rounded-lg border ${getEventTypeColor(event.type)}`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{event.title}</h4>
                                <p className="text-sm opacity-80">{event.startTime} - {event.endTime}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  onClick={() => editEvent(event)}
                                  variant="ghost"
                                  size="sm"
                                  className="rounded-lg"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={() => toggleEventComplete(event.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="rounded-lg"
                                >
                                  <CheckCircle className={`w-4 h-4 ${event.isCompleted ? 'text-accent' : 'text-muted-foreground'}`} />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {dayEvents.length === 0 && (
                          <p className="text-muted-foreground text-sm">No events scheduled</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Day View */}
            {viewMode === 'day' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-2">
                  {Array.from({ length: 24 }, (_, hour) => {
                    const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
                    const hourEvents = getEventsForDate(currentDate).filter(event => 
                      parseInt(event.startTime.split(':')[0]) === hour
                    );
                    
                    return (
                      <div key={hour} className="flex border-b border-border pb-2">
                        <div className="w-16 text-sm text-muted-foreground font-medium">
                          {timeSlot}
                        </div>
                        <div className="flex-1 pl-4">
                          {hourEvents.map(event => (
                            <div key={event.id} className={`p-2 mb-2 rounded-lg border ${getEventTypeColor(event.type)}`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium">{event.title}</h4>
                                  <p className="text-sm opacity-80">{event.startTime} - {event.endTime}</p>
                                  {event.description && <p className="text-sm opacity-70 mt-1">{event.description}</p>}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    onClick={() => editEvent(event)}
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-lg"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    onClick={() => deleteEvent(event.id)}
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-lg text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Events */}
          <div className="clay-card p-6">
            <h3 className="text-foreground font-semibold mb-4">Today's Events</h3>
            <div className="space-y-3">
              {getEventsForDate(new Date()).map(event => (
                <div key={event.id} className={`p-3 rounded-lg border ${getEventTypeColor(event.type)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <p className="text-xs opacity-80">{event.startTime} - {event.endTime}</p>
                    </div>
                    <Button
                      onClick={() => toggleEventComplete(event.id)}
                      variant="ghost"
                      size="sm"
                      className="rounded-lg"
                    >
                      <CheckCircle className={`w-4 h-4 ${event.isCompleted ? 'text-accent' : 'text-muted-foreground'}`} />
                    </Button>
                  </div>
                </div>
              ))}
              {getEventsForDate(new Date()).length === 0 && (
                <p className="text-muted-foreground text-sm">No events today</p>
              )}
            </div>
          </div>

          {/* Study Stats */}
          <div className="clay-card p-6">
            <h3 className="text-foreground font-semibold mb-4">Study Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">This Week</span>
                <span className="text-foreground font-medium">12h 30m</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">This Month</span>
                <span className="text-foreground font-medium">48h 15m</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Streak</span>
                <span className="text-foreground font-medium">7 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="clay-card p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-foreground font-semibold">
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h2>
              <Button
                onClick={() => {
                  setShowEventModal(false);
                  setEditingEvent(null);
                  setEventForm({
                    title: '',
                    description: '',
                    startTime: '09:00',
                    endTime: '10:00',
                    type: 'study',
                    subject: ''
                  });
                }}
                variant="ghost"
                size="sm"
                className="rounded-lg"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-muted-foreground text-sm font-medium">Event Title</label>
                <Input
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="Enter event title..."
                  className="mt-1 clay-input"
                />
              </div>

              <div>
                <label className="text-muted-foreground text-sm font-medium">Description</label>
                <Textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="Enter description..."
                  className="mt-1 clay-input resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground text-sm font-medium">Start Time</label>
                  <Input
                    type="time"
                    value={eventForm.startTime}
                    onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                    className="mt-1 clay-input"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">End Time</label>
                  <Input
                    type="time"
                    value={eventForm.endTime}
                    onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                    className="mt-1 clay-input"
                  />
                </div>
              </div>

              <div>
                <label className="text-muted-foreground text-sm font-medium">Event Type</label>
                <select
                  value={eventForm.type}
                  onChange={(e) => setEventForm({ ...eventForm, type: e.target.value as CalendarEvent['type'] })}
                  className="mt-1 w-full clay-input"
                >
                  <option value="study">Study Session</option>
                  <option value="exam">Exam</option>
                  <option value="assignment">Assignment</option>
                  <option value="break">Break</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-muted-foreground text-sm font-medium">Subject</label>
                <Input
                  value={eventForm.subject}
                  onChange={(e) => setEventForm({ ...eventForm, subject: e.target.value })}
                  placeholder="Enter subject..."
                  className="mt-1 clay-input"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <Button
                  onClick={() => {
                    setShowEventModal(false);
                    setEditingEvent(null);
                    setEventForm({
                      title: '',
                      description: '',
                      startTime: '09:00',
                      endTime: '10:00',
                      type: 'study',
                      subject: ''
                    });
                  }}
                  variant="outline"
                  className="clay-button rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={addEvent}
                  disabled={!eventForm.title.trim()}
                  className="clay-button text-white rounded-xl"
                >
                  {editingEvent ? 'Update Event' : 'Add Event'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}